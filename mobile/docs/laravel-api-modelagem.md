# Oholo — Proposta de API REST (Laravel)

Documento de referência para implementação do back-end em **Laravel** + **MySQL**, alinhado ao modelo de dados do MVP (`oholo_mvp_modelagem.md`), ao schema SQLite da app mobile (`db/schema.js`) e aos fluxos já existentes no cliente (corrida, delivery, histórico, prestador).

**Versão sugerida da API:** `v1` (prefixo `/api/v1`).

**Autenticação:** [Laravel Sanctum](https://laravel.com/docs/sanctum) com tokens pessoais ou SPA; para mobile nativo, **Personal Access Tokens** (header `Authorization: Bearer {token}`) é o caminho mais simples. Alternativa: OAuth2 com Laravel Passport se precisarem de terceiros.

**Formato:** JSON; datas em **ISO 8601** (UTC ou com offset); valores monetários em **decimal** (MT); distâncias em **km**.

**Erros (padrão sugerido):**

```json
{
  "message": "Mensagem legível",
  "errors": {
    "campo": ["Erro de validação"]
  }
}
```

Códigos HTTP: `401` não autenticado, `403` proibido, `404` não encontrado, `409` conflito (ex.: corrida já atribuída), `422` validação, `429` rate limit.

---

## 1. Princípios de domínio (espelho da app atual)

| Conceito na app | Comportamento hoje (local) | Na API |
|-----------------|----------------------------|--------|
| `ride_code` / `delivery_code` | Identificador único por pedido | Gerado no servidor (ex.: ULID ou prefixo `RIDE-` / `DLV-`) |
| Motoristas no mapa | Lista SQLite + posição sintética | Lista de prestadores **available** + **última posição GPS** (ou região) |
| Atribuição | Aleatória no cliente | **Pool + aceitação** no servidor (timeout, re-oferta) |
| Histórico | `rides` / `deliveries` + `locations` | Mesmo modelo relacional; cliente sincroniza ou só consulta |
| Cancelar | Só cliente nesta fase | `PATCH` status + motivo; regras por estado |
| Perfil motorista | `users` + `provider_profiles` + `vehicles` | Endpoints dedicados ao prestador |

---

## 2. Autenticação e sessão

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/auth/register` | Registo (telefone, nome, password, email opcional) |
| `POST` | `/api/v1/auth/login` | Login com `phone` + `password` → devolve `token` + `user` |
| `POST` | `/api/v1/auth/logout` | Revoga token atual (Sanctum) |
| `POST` | `/api/v1/auth/password/forgot` | Inicia fluxo reset (SMS/email conforme política) |
| `POST` | `/api/v1/auth/password/reset` | Confirma nova password com token |
| `GET` | `/api/v1/auth/me` | Utilizador autenticado + flags (`is_provider`, etc.) |

**Corpo exemplo `login`:**

```json
{
  "phone": "+258840000000",
  "password": "********",
  "device_name": "oholo-android"
}
```

**Resposta `login`:**

```json
{
  "token": "1|xxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Maria",
    "phone": "+258840000000",
    "email": null,
    "avatar_url": null,
    "status": "active"
  }
}
```

---

## 3. Perfil do cliente (`users`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/me` | Igual a `auth/me` ou mais completo |
| `PATCH` | `/api/v1/me` | Atualizar nome, email |
| `POST` | `/api/v1/me/avatar` | Upload imagem (`multipart/form-data`) |
| `PATCH` | `/api/v1/me/password` | Alterar password (password atual + nova) |

Campos alinhados ao mobile: `avatar_uri` → `avatar_url` na API (URL absoluta ou path assinado S3/minio).

---

## 4. Prestador (`provider_profiles` + `vehicles`)

### 4.1 Perfil de prestador

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/provider/profile` | 404 se não existir perfil |
| `POST` | `/api/v1/provider/profile` | Criar perfil (`provider_type`, `document_number`, `license_number` opcional) |
| `PATCH` | `/api/v1/provider/profile` | Atualizar dados |
| `PATCH` | `/api/v1/provider/availability` | Body: `{ "status": "available" \| "busy" \| "offline" }` |

### 4.2 Veículos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/provider/vehicles` | Lista veículos do prestador |
| `POST` | `/api/v1/provider/vehicles` | Criar veículo |
| `PATCH` | `/api/v1/provider/vehicles/{id}` | Atualizar |
| `DELETE` | `/api/v1/provider/vehicles/{id}` | Soft delete ou `status: inactive` |

### 4.3 Posição (substitui coordenadas sintéticas do demo)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/provider/location` | Body: `{ "latitude": -15.12, "longitude": 39.27, "heading": 90, "recorded_at": "..." }` |
| | | Throttle agressivo (ex.: 1 req / 5–10 s) ou batch |

**Nota:** Para “motorista a caminho” em tempo quase real, considerar **Laravel Reverb / Pusher / Ably** com canal privado `user.{id}` ou `ride.{ride_code}` para o cliente não depender só de polling.

---

## 5. Corridas (`rides`)

Estados alinhados ao schema: `requested` → `accepted` → `in_progress` → `completed` | `cancelled`.

### 5.1 Cliente

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/rides/quote` | Pré-cálculo: origem/destino (coords ou place_id), `ride_type` → `estimated_fare`, `distance_km`, `duration_min` (pode usar OSRM/Google no servidor) |
| `POST` | `/api/v1/rides` | Criar pedido: pickup/dropoff (endereço + lat/lon), `ride_type`, `payment_method`, `estimated_fare` opcional (validar no servidor) |
| `GET` | `/api/v1/rides/{ride_code}` | Detalhe + estado + motorista atribuído (se houver) |
| `GET` | `/api/v1/rides` | Histórico do cliente (`?status=`, paginação) |
| `PATCH` | `/api/v1/rides/{ride_code}/cancel` | Cliente cancela (`cancellation_reason` opcional) |

**Corpo exemplo `POST /rides`:**

```json
{
  "pickup": {
    "address_line": "Mercado Central",
    "latitude": -15.1165,
    "longitude": 39.2666,
    "reference_note": "Porta norte"
  },
  "dropoff": {
    "address_line": "Hospital Central",
    "latitude": -15.11,
    "longitude": 39.28
  },
  "ride_type": "Económica",
  "payment_method": "M-Pesa"
}
```

**Resposta:** `201` com `ride_code`, `status: "requested"`, `estimated_fare`, timestamps.

### 5.2 Motorista (prestador)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/driver/ride-offers` | Ofertas pendentes (matching) — ou usar WebSocket |
| `POST` | `/api/v1/rides/{ride_code}/accept` | Motorista aceita (transação: lock, `driver_user_id`, `vehicle_id`, `status: accepted`) |
| `POST` | `/api/v1/rides/{ride_code}/reject` | Recusa (para analytics / não voltar a oferecer a este) |
| `PATCH` | `/api/v1/rides/{ride_code}/start` | Início da viagem (após recolha do cliente) → `in_progress` |
| `PATCH` | `/api/v1/rides/{ride_code}/complete` | `final_fare`, `duration_minutes`, `route_distance_km` → `completed` |
| `PATCH` | `/api/v1/rides/{ride_code}/cancel` | Motorista/admin cancela (política e taxas) |

### 5.3 Recurso aninhado “motorista atribuído” (para o mobile)

No `GET /rides/{ride_code}` incluir objeto `driver` quando existir:

```json
{
  "ride_code": "RIDE-01HZ...",
  "status": "accepted",
  "driver": {
    "user_id": 42,
    "name": "João",
    "phone": "+25887...",
    "avatar_url": "...",
    "vehicle": {
      "id": 3,
      "vehicle_type": "car",
      "brand": "Toyota",
      "model": "Vitz",
      "plate_number": "NPL-...",
      "color": "branco"
    }
  }
}
```

Isto substitui a passagem manual de `driverName`, `driverPhone`, etc., por params do router.

---

## 6. Deliveries (`deliveries`)

Estados: `requested` → `accepted` → `picked_up` → `in_transit` → `delivered` | `cancelled`.

### 6.1 Cliente

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/deliveries/quote` | Categoria, peso, tamanho, rota → `delivery_fee` |
| `POST` | `/api/v1/deliveries` | Criar pedido (recolha, entrega, `item_description`, opções de pricing) |
| `GET` | `/api/v1/deliveries/{delivery_code}` | Detalhe + `courier` aninhado |
| `GET` | `/api/v1/deliveries` | Histórico |
| `PATCH` | `/api/v1/deliveries/{delivery_code}/cancel` | Cancelamento pelo cliente |

### 6.2 Entregador

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/courier/delivery-offers` | Ofertas |
| `POST` | `/api/v1/deliveries/{delivery_code}/accept` | Aceitar |
| `POST` | `/api/v1/deliveries/{delivery_code}/reject` | Recusar |
| `PATCH` | `/api/v1/deliveries/{delivery_code}/picked-up` | Recolhido |
| `PATCH` | `/api/v1/deliveries/{delivery_code}/in-transit` | Em trânsito |
| `PATCH` | `/api/v1/deliveries/{delivery_code}/complete` | Entregue |

---

## 7. Matching / dispatch (regra de negócio)

A app mobile hoje **sorteia** um prestador entre os `available`. Na API, recomenda-se:

1. **Job em fila** (`ShouldQueue`) ao criar `ride`/`delivery`: selecionar N candidatos (geoespacial ou cidade Nampula no MVP).
2. **Oferta com TTL** (ex.: 15–30 s): notificar via push + canal real-time.
3. Se ninguém aceitar, **re-oferta** a outro conjunto ou aumentar raio.
4. **Aceitação** atómica (`UPDATE ... WHERE status = 'requested' AND driver_id IS NULL`).

Endpoints de “ofertas” podem ser REST (`GET .../offers`) ou eventos só por WebSocket; para MVP, **polling** `GET /rides/{code}` a cada poucos segundos ainda funciona.

---

## 8. Atividades unificadas (espelho do ecrã “Atividades”)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/activities` | Lista mista corridas + deliveries + bilhetes (`type`, ordenação por data) |
| `GET` | `/api/v1/activities/{id}` | Detalhe polimórfico (`ride`, `delivery`, `ticket_booking`) |

`id` pode ser `ride:{ride_code}`, `delivery:{delivery_code}`, `ticket:{booking_code}` ou IDs internos com `type` na resposta.

---

## 9. Bilhetes interprovinciais (MVP documentado)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/trips/search` | Query: `origin_city`, `destination_city`, `date` |
| `GET` | `/api/v1/trips/schedules/{id}` | Detalhe do horário + lugares |
| `POST` | `/api/v1/tickets/bookings` | Reserva (`trip_schedule_id`, dados passageiro) |
| `GET` | `/api/v1/tickets/bookings` | Bilhetes do utilizador |
| `GET` | `/api/v1/tickets/bookings/{booking_code}` | Detalhe |
| `PATCH` | `/api/v1/tickets/bookings/{booking_code}/cancel` | Cancelamento conforme regra |

---

## 10. Pagamentos (`payments`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/payments/intent` | Cria intenção para `ride`, `delivery` ou `ticket` |
| `POST` | `/api/v1/payments/mpesa/callback` | Webhook (rota sem auth Sanctum; validar assinatura) |
| `POST` | `/api/v1/payments/emola/callback` | Idem |
| `GET` | `/api/v1/payments/{id}` | Estado do pagamento |

Enums alinhados ao schema: `payment_method` `cash`, `mpesa`, `emola`, `card`; `status` `pending`, `paid`, `failed`, `refunded`.

---

## 11. Administração (opcional MVP+)

Prefixo `/api/v1/admin` + middleware `role:admin` (`is_admin`):

- CRUD transportadoras, rotas, horários;
- Listagem de utilizadores, bloqueios;
- Relatórios financeiros básicos.

---

## 12. Estrutura sugerida no Laravel

```
app/
  Http/Controllers/Api/V1/
    Auth/
    Me/
    Provider/
    Ride/
    Delivery/
    Activity/
    Ticket/
    Payment/
  Http/Requests/Api/V1/...
  Http/Resources/Api/V1/
    UserResource.php
    RideResource.php
    DeliveryResource.php
    DriverSummaryResource.php
  Models/
    User.php
    ProviderProfile.php
    Vehicle.php
    Location.php
    Ride.php
    Delivery.php
    ...
  Services/
    RideMatchingService.php
    PricingService.php (OSRM / tabela)
  Jobs/
    DispatchRideOffersJob.php
```

**Rotas:** ficheiro `routes/api.php` com grupo `prefix('v1')` + `middleware('auth:sanctum')` nos endpoints protegidos.

**Policies:** `RidePolicy`, `DeliveryPolicy` — cliente só altera o próprio pedido; motorista só o que aceitou.

---

## 13. Migrações MySQL — campos extra já usados no SQLite mobile

Garantir nas migrações Laravel (além do MVP .md):

- `users.avatar_url` (nullable string).
- `rides`: `payment_method`, `ride_type`, `route_distance_km`, `duration_minutes` (nullable).
- Índices compostos para histórico: `(customer_user_id, requested_at)`, `(driver_user_id, status)`.

---

## 14. Rate limiting e segurança

- Throttle `login` / `register` por IP + telefone.
- Throttle `provider/location`.
- CORS restrito a domínios conhecidos (se houver web); app mobile não usa CORS da mesma forma.
- Validação estrita de coordenadas (Mozambique bbox opcional).
- **HTTPS** obrigatório em produção.

---

## 15. Roadmap de integração com o app React Native

1. Substituir `initLocalDatabase` + inserts locais por chamadas `POST/PATCH` nos mesmos momentos (confirmar corrida, cancelar, concluir).
2. Manter SQLite como **cache offline** opcional (sync quando online) — fase 2.
3. Ecrãs de pesquisa: `GET` candidatos ou subscrição a evento de “motorista atribuído”.
4. Token Sanctum em `SecureStore` / `expo-secure-store`.

---

## Referências internas do repositório

- Modelo conceitual: `oholo_mvp_modelagem.md`
- Schema local: `db/schema.js`
- Prestadores no mapa: `db/providerDrivers.js`
- Histórico corrida: `db/rideActivities.js`
- Histórico delivery: `db/deliveryActivities.js` / `db/activitiesLocal.js`

---

*Documento gerado para orientar a implementação; ajustar endpoints e payloads após primeira sprint de back-end e contratos com o cliente mobile.*
