import { apiFetch } from '../../api/client';
import type { ServicoResponse } from './types';

export function getServicos(): Promise<ServicoResponse[]> {
  return apiFetch<ServicoResponse[]>('/api/servicos');
}