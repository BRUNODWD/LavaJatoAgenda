import { palette } from './theme';

export type Status = 'Agendado' | 'Em andamento' | 'Finalizado' | 'Cancelado';

export const STATUSES: Status[] = ['Agendado', 'Em andamento', 'Finalizado', 'Cancelado'];
export const FILTER_OPTIONS: ('Todos' | Status)[] = [
  'Todos',
  'Agendado',
  'Em andamento',
  'Finalizado',
  'Cancelado',
];

export function statusColor(status: Status): string {
  switch (status) {
    case 'Agendado':
      return palette.statusBlue;
    case 'Em andamento':
      return palette.statusOrange;
    case 'Finalizado':
      return palette.statusGreen;
    case 'Cancelado':
      return palette.statusRed;
  }
}

export function statusIcon(status: Status): string {
  switch (status) {
    case 'Agendado':
      return 'calendar-outline';
    case 'Em andamento':
      return 'time-outline';
    case 'Finalizado':
      return 'checkmark-circle-outline';
    case 'Cancelado':
      return 'close-circle-outline';
  }
}

export type SortOption = 'horario' | 'nome' | 'valor';

export const SORT_LABELS: Record<SortOption, string> = {
  horario: 'Horário',
  nome: 'Nome do cliente',
  valor: 'Valor',
};
