# Oholo — MVP

## Descrição do MVP

O **Oholo** é uma aplicação mobile voltada para mobilidade urbana, delivery local e venda de bilhetes interprovinciais.

O MVP foi pensado para validar os três serviços principais da plataforma:

1. **Corridas urbanas** dentro da cidade de Nampula;
2. **Delivery local** dentro da cidade de Nampula;
3. **Compra de bilhetes** para viagens interprovinciais.

A aplicação será desenvolvida com:

- **Front-end:** React Native com Expo
- **Back-end:** Laravel
- **Banco de dados:** MySQL
- **Comunicação:** API REST

---

## Regra principal do MVP

A modelagem do banco foi pensada considerando um requisito importante do sistema:

> **o mesmo utilizador pode ser cliente e também prestador de serviço.**

Isso significa que um utilizador pode:

- pedir uma corrida;
- pedir um delivery;
- comprar um bilhete;
- atuar como motorista;
- atuar como entregador.

Por esse motivo, o sistema utiliza uma única tabela de utilizadores (`users`) e um perfil opcional de prestador (`provider_profiles`).

---

## Objetivo da modelagem

A modelagem do banco de dados do MVP foi criada para:

- suportar os três serviços principais do sistema;
- evitar duplicação de contas;
- permitir crescimento futuro da aplicação;
- manter simplicidade suficiente para implementação inicial;
- funcionar bem com Laravel e Eloquent ORM.

---

# Levantamento resumido das áreas do aplicativo

O MVP da aplicação mobile cobre as seguintes áreas:

## 1. Autenticação e Conta
- Splash
- Onboarding
- Login
- Cadastro
- Perfil
- Editar perfil
- Configurações

## 2. Área do Cliente
- Solicitar corrida
- Acompanhar corrida
- Solicitar delivery
- Acompanhar delivery
- Buscar bilhetes
- Comprar bilhetes
- Ver bilhetes comprados

## 3. Área do Prestador
- Ativar perfil de prestador
- Cadastrar dados de prestador
- Cadastrar veículo
- Ver pedidos disponíveis
- Executar serviço
- Consultar histórico e ganhos

## 4. Bilhetes Interprovinciais
- Buscar viagens
- Ver detalhes da viagem
- Reservar/comprar bilhete
- Consultar bilhetes comprados

---

# Modelagem do Banco de Dados — MVP

## Tabelas principais do sistema

1. `users`
2. `provider_profiles`
3. `vehicles`
4. `locations`
5. `rides`
6. `deliveries`
7. `transport_companies`
8. `routes`
9. `trip_schedules`
10. `ticket_bookings`
11. `payments`

Além dessas, o Laravel poderá utilizar tabelas técnicas como:

- `personal_access_tokens`
- `password_reset_tokens`

---

## 1. Tabela `users`

Tabela principal de todos os utilizadores do sistema.

### Finalidade
Armazena dados de autenticação e identificação de qualquer pessoa que utilize a aplicação.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador do utilizador |
| name | VARCHAR(150) | NOT NULL | Nome completo |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | Número de telefone |
| email | VARCHAR(150) | UNIQUE, NULL | Email do utilizador |
| password | VARCHAR(255) | NOT NULL | Palavra-passe encriptada |
| status | ENUM('active','inactive','blocked') | DEFAULT 'active' | Estado da conta |
| is_admin | BOOLEAN | DEFAULT false | Define se o utilizador é administrador |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

### Observação
Todo utilizador entra aqui, seja:
- cliente;
- motorista;
- entregador;
- administrador.

---

## 2. Tabela `provider_profiles`

Tabela com os dados adicionais dos utilizadores que também trabalham na plataforma.

### Finalidade
Permitir que um utilizador tenha perfil de prestador sem duplicar conta.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador do perfil |
| user_id | BIGINT | FK → users.id | Utilizador dono do perfil |
| provider_type | ENUM('driver','courier','both') | NOT NULL | Tipo de prestador |
| document_number | VARCHAR(50) | NOT NULL | Documento de identificação |
| license_number | VARCHAR(50) | NULL | Carta de condução, se aplicável |
| availability_status | ENUM('available','busy','offline') | DEFAULT 'offline' | Estado operacional |
| rating_avg | DECIMAL(3,2) | NULL | Média de avaliação |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

### Regra de negócio
- um utilizador pode ter **zero ou um** perfil de prestador;
- se tiver perfil, pode atuar como motorista, entregador ou ambos.

---

## 3. Tabela `vehicles`

Tabela que guarda os veículos dos prestadores.

### Finalidade
Associar um ou mais veículos ao perfil do prestador.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador do veículo |
| provider_profile_id | BIGINT | FK → provider_profiles.id | Perfil do prestador |
| vehicle_type | ENUM('car','motorbike','van') | NOT NULL | Tipo do veículo |
| brand | VARCHAR(100) | NOT NULL | Marca |
| model | VARCHAR(100) | NOT NULL | Modelo |
| plate_number | VARCHAR(20) | UNIQUE, NOT NULL | Matrícula |
| color | VARCHAR(50) | NOT NULL | Cor do veículo |
| status | ENUM('active','inactive','maintenance') | DEFAULT 'active' | Estado do veículo |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

---

## 4. Tabela `locations`

Tabela de localizações reutilizáveis.

### Finalidade
Guardar origem, destino, recolha e entrega em corridas e deliveries.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador da localização |
| address_line | VARCHAR(255) | NOT NULL | Endereço principal |
| bairro | VARCHAR(100) | NULL | Bairro |
| city | VARCHAR(100) | NOT NULL | Cidade |
| province | VARCHAR(100) | NOT NULL | Província |
| latitude | DECIMAL(10,7) | NULL | Latitude |
| longitude | DECIMAL(10,7) | NULL | Longitude |
| reference_note | VARCHAR(255) | NULL | Ponto de referência |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

---

## 5. Tabela `rides`

Tabela principal das corridas urbanas.

### Finalidade
Registar pedidos de corrida, atribuição de motorista, estado e valor.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador da corrida |
| ride_code | VARCHAR(30) | UNIQUE, NOT NULL | Código da corrida |
| customer_user_id | BIGINT | FK → users.id | Cliente que pediu a corrida |
| driver_user_id | BIGINT | FK → users.id, NULL | Motorista que aceitou |
| vehicle_id | BIGINT | FK → vehicles.id, NULL | Veículo usado |
| pickup_location_id | BIGINT | FK → locations.id | Local de partida |
| dropoff_location_id | BIGINT | FK → locations.id | Destino |
| estimated_fare | DECIMAL(10,2) | NOT NULL | Valor estimado |
| final_fare | DECIMAL(10,2) | NULL | Valor final |
| status | ENUM('requested','accepted','in_progress','completed','cancelled') | DEFAULT 'requested' | Estado da corrida |
| requested_at | DATETIME | NOT NULL | Data/hora do pedido |
| accepted_at | DATETIME | NULL | Data/hora de aceitação |
| started_at | DATETIME | NULL | Início da corrida |
| completed_at | DATETIME | NULL | Conclusão da corrida |
| cancelled_at | DATETIME | NULL | Cancelamento |
| cancellation_reason | VARCHAR(255) | NULL | Motivo do cancelamento |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

### Regra importante
Os campos `customer_user_id` e `driver_user_id` apontam ambos para `users`, permitindo que a mesma pessoa seja cliente em um momento e motorista em outro.

---

## 6. Tabela `deliveries`

Tabela principal dos pedidos de delivery.

### Finalidade
Registar recolha, entrega, prestador responsável, estado e taxa.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador do delivery |
| delivery_code | VARCHAR(30) | UNIQUE, NOT NULL | Código do delivery |
| customer_user_id | BIGINT | FK → users.id | Cliente que pediu o serviço |
| courier_user_id | BIGINT | FK → users.id, NULL | Entregador responsável |
| vehicle_id | BIGINT | FK → vehicles.id, NULL | Veículo usado |
| pickup_location_id | BIGINT | FK → locations.id | Local de recolha |
| dropoff_location_id | BIGINT | FK → locations.id | Local de entrega |
| item_description | VARCHAR(255) | NOT NULL | Descrição do item |
| delivery_fee | DECIMAL(10,2) | NOT NULL | Taxa de entrega |
| status | ENUM('requested','accepted','picked_up','in_transit','delivered','cancelled') | DEFAULT 'requested' | Estado do delivery |
| requested_at | DATETIME | NOT NULL | Data/hora do pedido |
| accepted_at | DATETIME | NULL | Data/hora de aceitação |
| picked_up_at | DATETIME | NULL | Momento da recolha |
| delivered_at | DATETIME | NULL | Momento da entrega |
| cancelled_at | DATETIME | NULL | Momento do cancelamento |
| cancellation_reason | VARCHAR(255) | NULL | Motivo do cancelamento |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

### Regra importante
Os campos `customer_user_id` e `courier_user_id` apontam ambos para `users`, permitindo que a mesma pessoa seja cliente e entregador.

---

## 7. Tabela `transport_companies`

Tabela de transportadoras interprovinciais.

### Finalidade
Guardar as empresas de transporte que oferecem viagens na plataforma.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador da transportadora |
| name | VARCHAR(150) | NOT NULL | Nome da transportadora |
| phone | VARCHAR(20) | NULL | Telefone |
| email | VARCHAR(150) | NULL | Email |
| status | ENUM('active','inactive') | DEFAULT 'active' | Estado da transportadora |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

---

## 8. Tabela `routes`

Tabela das rotas operadas por cada transportadora.

### Finalidade
Definir origem, destino e preço base das viagens.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador da rota |
| transport_company_id | BIGINT | FK → transport_companies.id | Transportadora |
| origin_city | VARCHAR(100) | NOT NULL | Cidade de origem |
| destination_city | VARCHAR(100) | NOT NULL | Cidade de destino |
| estimated_duration | VARCHAR(50) | NULL | Duração estimada |
| base_price | DECIMAL(10,2) | NOT NULL | Preço base |
| status | ENUM('active','inactive') | DEFAULT 'active' | Estado da rota |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

---

## 9. Tabela `trip_schedules`

Tabela das viagens programadas.

### Finalidade
Guardar datas, horários, preço e lugares disponíveis para cada rota.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador da viagem |
| route_id | BIGINT | FK → routes.id | Rota da viagem |
| departure_datetime | DATETIME | NOT NULL | Data e hora de partida |
| arrival_datetime | DATETIME | NULL | Data e hora prevista de chegada |
| price | DECIMAL(10,2) | NOT NULL | Preço da viagem |
| available_seats | INT | NOT NULL | Lugares disponíveis |
| status | ENUM('scheduled','departed','completed','cancelled') | DEFAULT 'scheduled' | Estado da viagem |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

---

## 10. Tabela `ticket_bookings`

Tabela das reservas e compras de bilhetes.

### Finalidade
Registar a compra de um bilhete por utilizador para uma viagem específica.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador da reserva |
| booking_code | VARCHAR(30) | UNIQUE, NOT NULL | Código da reserva |
| user_id | BIGINT | FK → users.id | Utilizador comprador |
| trip_schedule_id | BIGINT | FK → trip_schedules.id | Viagem escolhida |
| passenger_name | VARCHAR(150) | NOT NULL | Nome do passageiro |
| passenger_phone | VARCHAR(20) | NOT NULL | Contacto do passageiro |
| seat_number | VARCHAR(20) | NULL | Número do assento |
| amount | DECIMAL(10,2) | NOT NULL | Valor do bilhete |
| status | ENUM('pending','paid','cancelled','used') | DEFAULT 'pending' | Estado da reserva |
| booked_at | DATETIME | NOT NULL | Data/hora da reserva |
| paid_at | DATETIME | NULL | Data/hora do pagamento |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

### Observação
No MVP, cada reserva corresponde a um único bilhete. Em fases futuras, isso pode evoluir para múltiplos passageiros por compra.

---

## 11. Tabela `payments`

Tabela única de pagamentos do MVP.

### Finalidade
Centralizar pagamentos de corridas, deliveries e bilhetes.

### Campos sugeridos
| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| id | BIGINT | PK | Identificador do pagamento |
| user_id | BIGINT | FK → users.id | Utilizador que pagou |
| service_type | ENUM('ride','delivery','ticket') | NOT NULL | Tipo de serviço |
| reference_id | BIGINT | NOT NULL | ID do registo relacionado |
| amount | DECIMAL(10,2) | NOT NULL | Valor pago |
| payment_method | ENUM('cash','mpesa','emola','card') | NOT NULL | Método de pagamento |
| transaction_reference | VARCHAR(100) | NULL | Referência externa da transação |
| status | ENUM('pending','paid','failed','refunded') | DEFAULT 'pending' | Estado do pagamento |
| paid_at | DATETIME | NULL | Data/hora de pagamento |
| created_at | TIMESTAMP |  | Data de criação |
| updated_at | TIMESTAMP |  | Data de atualização |

### Regra de uso
- se `service_type = 'ride'`, o `reference_id` corresponde ao `rides.id`;
- se `service_type = 'delivery'`, o `reference_id` corresponde ao `deliveries.id`;
- se `service_type = 'ticket'`, o `reference_id` corresponde ao `ticket_bookings.id`.

---

# Relacionamentos principais do MVP

## Relações centrais
- `users` 1:1 `provider_profiles`
- `provider_profiles` 1:N `vehicles`

## Corridas
- `users` 1:N `rides` como cliente
- `users` 1:N `rides` como motorista
- `vehicles` 1:N `rides`
- `locations` 1:N `rides` como origem
- `locations` 1:N `rides` como destino

## Deliveries
- `users` 1:N `deliveries` como cliente
- `users` 1:N `deliveries` como entregador
- `vehicles` 1:N `deliveries`
- `locations` 1:N `deliveries` como recolha
- `locations` 1:N `deliveries` como entrega

## Bilhetes
- `transport_companies` 1:N `routes`
- `routes` 1:N `trip_schedules`
- `trip_schedules` 1:N `ticket_bookings`
- `users` 1:N `ticket_bookings`

## Pagamentos
- `users` 1:N `payments`

---

# Modelo lógico resumido

```text
USERS
 ├── PROVIDER_PROFILES
 │    └── VEHICLES
 ├── RIDES
 ├── DELIVERIES
 ├── TICKET_BOOKINGS
 └── PAYMENTS

LOCATIONS
 ├── RIDES
 └── DELIVERIES

TRANSPORT_COMPANIES
 └── ROUTES
      └── TRIP_SCHEDULES
           └── TICKET_BOOKINGS
```

---

# Justificativa da modelagem

Esta modelagem foi escolhida porque:

1. **suporta os três serviços principais** da plataforma;
2. **permite que o mesmo utilizador seja cliente e prestador**;
3. **evita duplicação de contas**;
4. **facilita a implementação em Laravel**;
5. **é simples para o MVP**, mas preparada para crescer.

---

# Possíveis evoluções futuras

Em versões futuras do sistema, a modelagem pode ser expandida com:

- tabela de avaliações;
- tabela de notificações;
- histórico de estados de corrida e delivery;
- múltiplos passageiros por reserva;
- assentos detalhados por viagem;
- carteira digital;
- cupons e promoções;
- rastreamento em tempo real;
- painel administrativo avançado.

---

# Conclusão

O banco de dados do **Oholo MVP** foi modelado para atender uma aplicação mobile única, na qual o mesmo utilizador pode usar serviços e também trabalhar na plataforma.

A estrutura proposta oferece equilíbrio entre:

- simplicidade de implementação;
- organização dos dados;
- flexibilidade de uso;
- possibilidade de crescimento futuro.

Essa base é suficiente para iniciar o desenvolvimento do MVP com **React Native (Expo)** no front-end e **Laravel** no back-end.
