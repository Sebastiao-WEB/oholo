# Histórico de Continuidade - Oholo Mobile

## Estado atual do projeto
- Projeto: `Oholo` (app mobile)
- Stack: React Native + Expo + Expo Router
- Mapa: OpenStreetMap (`UrlTile`) + OSRM para rotas
- Foco implementado: fluxo completo de corridas (pedido -> confirmação -> busca de motorista -> motorista chegando -> corrida em progresso -> corrida concluída), histórico de atividades (lista + detalhe) e abas Trabalho e Perfil com UI alinhada ao restante app
- Extensão de telas: `.jsx`

## Paleta de cores aplicada
- Primária: `#0A2547`
- Secundária: `#006AFF`
- Destaque: `#48CAE4`

## Telas já implementadas
- `app/index.jsx` (Splash)
- `app/onboarding/step-1.jsx`
- `app/onboarding/step-2.jsx`
- `app/onboarding/step-3.jsx`
- `app/login.jsx`
- `app/signup.jsx`
- `app/forgot-password.jsx`
- `app/otp.jsx`
- `app/reset-password.jsx`
- `app/(tabs)/index.jsx` (Home; atalho “Trabalhar com a plataforma” abre a aba Trabalho)
- `app/(tabs)/work.jsx` (hub parceiros: motorista, entregador, requisitos, suporte; CTAs com alerta até fluxo real)
- `app/(tabs)/profile.jsx` (cabeçalho de conta, menu de definições mock, sair → `login`)
- `app/personal-data.jsx` (dados pessoais editáveis: nome, telefone, palavra-passe opcional, foto via galeria/câmara — `expo-image-picker`)
- `app/(tabs)/activities.jsx` (lista de atividades: pesquisa, filtros, dados mock)
- `app/activity-detail.jsx` (detalhe de uma atividade; navegação a partir da lista)
- `data/mockActivities.js` (dados mock partilhados entre lista e detalhe)
- `app/ride-request.jsx`
- `app/ride-confirm.jsx`
- `app/ride-searching.jsx`
- `app/ride-in-progress.jsx`
- `app/ride-trip-progress.jsx`
- `app/ride-completed.jsx`

## Fluxo de corrida implementado
1. Usuário define origem/destino em `ride-request`.
2. Vai para `ride-confirm` com estimativas e seleção de tipo/pagamento.
3. Vai para `ride-searching` (busca de motorista com animação e rota do motorista mais próximo).
4. Vai para `ride-in-progress` (motorista indo até o ponto de origem, com ETA regressivo).
5. Vai para `ride-trip-progress` (corrida em andamento de origem até destino, com ETA regressivo).
6. Vai para `ride-completed` (resumo final da viagem).

## Fluxo de atividades (histórico)
- Aba **Atividades**: lista com filtros (Todas / Corridas / Delivery / Bilhetes) e pesquisa.
- Toque num item abre `activity-detail` com `params.id`; dados vêm de `data/mockActivities.js` até existir API.

## Abas Trabalho e Perfil
- **Trabalho**: cartão piloto Nampula, lista de opções (motorista, entregador, documentos, contacto) e botão de candidatura; interacções mostram `Alert` até existir fluxo/API.
- **Perfil**: dados mock do utilizador, **Dados pessoais** abre `personal-data` (edição + foto), outras linhas de menu (placeholders) e **Terminar sessão** com confirmação → `router.replace('/login')`.

## Comportamento de tempo (dev x produção)
- Em `ride-in-progress.jsx`:
  - `USE_MOCK_DRIVER_ARRIVAL_DURATION = __DEV__`
  - `MOCK_DRIVER_ARRIVAL_SECONDS = 20`
  - Em desenvolvimento: chegada do motorista simulada em 20s.
  - Em produção: usa tempo real da rota (OSRM).
- Em `ride-trip-progress.jsx`:
  - `USE_MOCK_TRIP_DURATION = __DEV__`
  - `MOCK_TRIP_DURATION_SECONDS = 20`
  - Em desenvolvimento: corrida até destino simulada em 20s.
  - Em produção: usa tempo real da rota (OSRM).

## Últimos commits (referência rápida)
- `8c51451` - tela de corrida concluída + navegação automática ao fim do ETA
- `880d845` - fluxo pós-confirmação com transições e novas telas
- `a21f03a` - tela de busca de motorista com mapa e rotas
- `aa3b66c` - melhorias na confirmação da corrida e métodos de pagamento
- `b2c1368` - melhorias na solicitação de corrida com busca e restrição Nampula
- `d3d3285` - estrutura inicial das telas principais e abas

## Assets usados neste fluxo
- `assets/img/icon.png`
- `assets/img/avatar.png`
- `assets/img/money.png`
- `assets/img/mpesa.webp`
- `assets/img/emola.jpg`
- `assets/img/google.png`
- `assets/img/facebook.png`

## Observações importantes
- O design foi ajustado para iOS (`SafeAreaView`, `ScrollView` quando necessário).
- O projeto está com commits locais organizados em português.
- Para continuar em outra máquina/conversa, este arquivo deve ser lido primeiro.

## Como retomar rapidamente
1. Abrir o projeto.
2. Ler este arquivo: `HISTORICO_CONTINUIDADE_OHOLO.md`.
3. Pedir ao assistente para continuar do último estado do fluxo de corridas.
4. Enviar o próximo mockup a ser implementado.

## Prompt sugerido para continuidade
`Leia o arquivo HISTORICO_CONTINUIDADE_OHOLO.md e continue a implementação da próxima tela mantendo o padrão visual e técnico já aplicado no projeto Oholo.`

