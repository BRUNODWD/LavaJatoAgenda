# LavaJatoAgenda — PRD (v2 — Nível 1)

## Objetivo
Aplicativo mobile (React Native Expo) para gerenciar agendamentos de um lava jato, com dashboard, calendário, filtros e ordenação.

## Plataforma
- Expo SDK 54 + Expo Router (Tabs)
- Persistência local: expo-sqlite (nativo) / localStorage chave `lavajato:schedules:v2` (web/preview)
- Tema light + dark (paleta azul #0D47A1 / #42A5F5 + verde para valores)
- Idioma: pt-BR

## Schema do banco
Tabela `schedules`:
- `id` PK autoincrement
- `carName` TEXT
- `carModel` TEXT
- `pickupTime` TEXT (ISO datetime)
- `status` TEXT (Agendado | Em andamento | Finalizado | Cancelado) — default 'Agendado'
- `valor` REAL — default 0
- `dataAgendamento` TEXT (YYYY-MM-DD derivado de pickupTime)
- `createdAt` TEXT (ISO)

Migration v1→v2: `ALTER TABLE ADD COLUMN` para status/valor/dataAgendamento, com backfill de `dataAgendamento` a partir do `pickupTime` existente. Idempotente.

## Telas

### Dashboard (`app/(tabs)/index.tsx`)
- Logo do lava jato + título
- 4 cards Material com ícones:
  - Carros agendados hoje
  - Faturado hoje (soma dos não cancelados)
  - Concluídos (status=Finalizado)
  - Próximo horário (Agendado ou Em andamento ainda não concluído)
- Lista "Agendamentos de hoje" com horário, nome, valor e dot do status

### Agenda (`app/(tabs)/agenda.tsx`)
- Busca em tempo real (case-insensitive) por nome do carro
- Chips de filtro: Todos / Agendado / Em andamento / Finalizado / Cancelado
- Menu de ordenação (Modal): Horário / Nome do cliente / Valor — persistente na sessão
- Cards com horário/data, nome, modelo, badge colorida do status, valor, lixeira
- FAB para criar agendamento
- Confirmação de exclusão com texto exato "Deseja realmente excluir este agendamento?"

### Calendário (`app/(tabs)/calendar.tsx`)
- DatePicker nativo + botões prev/next day
- Contador de agendamentos no dia + total previsto (R$)
- Lista do dia com badges e valores
- Empty state quando dia vazio

### Agendamento (`app/schedule.tsx`)
- Criar ou editar (param `id`)
- Campos: nome do cliente, modelo, valor (R$), status (chips), data, horário
- Validação básica

## Navegação
- Stack root → (tabs) + schedule
- Bottom Tabs: Dashboard / Agenda / Calendário

## Cores das badges
- Agendado: azul (#1976D2 light / #42A5F5 dark)
- Em andamento: laranja (#F57C00 / #FFB74D)
- Finalizado: verde (#2E7D32 / #66BB6A)
- Cancelado: vermelho (#C62828 / #EF5350)

## Próximos passos sugeridos
- Notificações 30 min antes
- Relatório semanal/mensal de faturamento
- Foto do carro
- Compartilhar agenda do dia
