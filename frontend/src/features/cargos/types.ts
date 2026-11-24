import type { CargoListItem, CargoRequest } from '../../api/cargos'

export interface CargoFormValues {
  nome: string
  permissaoIds: string[]
}

export const emptyCargoForm: CargoFormValues = {
  nome: '',
  permissaoIds: [],
}

export function toCargoRequest(values: CargoFormValues): CargoRequest {
  return {
    nome: values.nome.trim(),
    permissaoIds: values.permissaoIds.map(Number),
  }
}

export function toCargoFormValues(cargo: CargoListItem): CargoFormValues {
  return {
    nome: cargo.nome,
    permissaoIds: cargo.permissoes.map((permissao) => String(permissao.id)),
  }
}
