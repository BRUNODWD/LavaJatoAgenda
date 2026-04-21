# LavaJatoAgenda — PRD

## Objetivo
Aplicativo mobile (React Native Expo) para gerenciar agendamentos de um lava jato. Recriação em Expo de um projeto Android/Kotlin existente, mantendo as funcionalidades essenciais e adicionando as novas pedidas pelo usuário.

## Plataforma
- React Native + Expo Router (SDK 54)
- Persistência local via `expo-sqlite` no nativo (Android/iOS) e `localStorage` no web (fallback para preview)
- Tema escuro
- Idioma: Português (Brasil)

## Telas
1. **Home (`app/index.tsx`)**
   - Cabeçalho "LAVA JATO / Agenda" + contador de agendamentos
   - Campo de busca em tempo real por nome do carro (case-insensitive)
   - Lista de agendamentos (ordenada por data de retirada)
   - Cada item mostra: nome do carro, modelo, data e horário de retirada
   - Botão de lixeira por item → confirmação "Deseja realmente excluir este agendamento?" → exclui e atualiza a lista
   - FAB `+` → abre tela de novo agendamento
   - Empty state com imagem e texto

2. **Agendamento (`app/schedule.tsx`)**
   - Novo ou edição (detectado via param `id`)
   - Campos: nome do carro, modelo, data de retirada, horário de retirada (DateTimePicker nativo)
   - Validação básica (nome e modelo obrigatórios)
   - Botão salvar (cria ou atualiza) e cancelar

## Banco de dados (SQLite)
Tabela `schedules`: `id` (PK autoincrement), `carName`, `carModel`, `pickupTime` (ISO string), `createdAt`.

CRUD: `listSchedules`, `createSchedule`, `updateSchedule`, `deleteSchedule`, `getScheduleById`.

## Próximos passos sugeridos
- Notificações push 30 min antes da retirada
- Cálculo de faturamento por período (oportunidade de negócio)
- Exportar agenda do dia (PDF/compartilhar)
