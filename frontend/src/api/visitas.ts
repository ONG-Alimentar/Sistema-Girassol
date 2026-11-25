import { apiFetch } from './client'

export const TURNOS = [
  { value: 'MANHA', label: 'Manhã' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOITE', label: 'Noite' },
] as const

export const SITUACOES = [
  { value: 'MORADOR_DE_RUA', label: 'Morador de rua' },
  { value: 'VULNERABILIDADE_SOCIAL', label: 'Vulnerabilidade social' },
  { value: 'OUTRO', label: 'Outro' },
] as const

export type Turno = (typeof TURNOS)[number]['value']
export type Situacao = (typeof SITUACOES)[number]['value']

export interface VisitaRequest {
  data: string
  turno: Turno | null
  nome: string
  idade: number | null
  contato: string | null
  situacao: Situacao | null
  motivoDaProcura: string | null
  pedidoAtendido: boolean | null
  observacoes: string | null
}

export interface Visita extends Omit<VisitaRequest, 'nome'> {
  id: number
  nome: string | null
}

export function createVisita(req: VisitaRequest): Promise<Visita> {
  return apiFetch<Visita>('/api/visitas', { method: 'POST', body: req })
}

export function deleteVisita(id: number): Promise<unknown> {
  return apiFetch(`/api/visitas/${id}`, { method: 'DELETE' })
}

export function formatVisitaDate(value: string): string {
  return value.split('-').reverse().join('/')
}
