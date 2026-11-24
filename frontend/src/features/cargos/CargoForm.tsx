import { Stack } from '@mui/material'

import { TextInput } from '../../components/fields'
import { UnifiedForm } from '../../components/forms/UnifiedForm'
import type { FormMode } from '../../components/forms/UnifiedForm'

import type { CargoListItem } from '../../api/cargos'
import { createCargo, updateCargo } from '../../api/cargos'

import type { CargoFormValues } from './types'
import { emptyCargoForm, toCargoRequest } from './types'
import { validateCargo } from './cargoValidation'
import { PermissoesCheckboxField } from './PermissoesCheckboxField'

interface CargoFormProps {
  mode: FormMode
  cargoId?: number
  initialValues?: CargoFormValues
  onSuccess?: (cargo: CargoListItem) => void
}

export function CargoForm({
  mode,
  cargoId,
  initialValues = emptyCargoForm,
  onSuccess,
}: CargoFormProps) {
  async function handleCreate(values: CargoFormValues) {
    return createCargo(toCargoRequest(values))
  }

  async function handleUpdate(values: CargoFormValues) {
    if (cargoId === undefined) {
      throw new Error('ID do cargo não informado.')
    }

    return updateCargo(cargoId, toCargoRequest(values))
  }

  return (
    <UnifiedForm<CargoFormValues, CargoListItem>
      mode={mode}
      initialValues={initialValues}
      validate={validateCargo}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onSuccess={onSuccess}
      renderFields={({ values, setValues, errors, disabled }) => (
        <Stack spacing={3}>
          <TextInput
            label="Nome"
            value={values.nome}
            onChange={(nome) => setValues((prev) => ({ ...prev, nome }))}
            error={errors.nome}
            disabled={disabled}
            required
          />

          <PermissoesCheckboxField
            value={values.permissaoIds}
            onChange={(permissaoIds) => setValues((prev) => ({ ...prev, permissaoIds }))}
            error={errors.permissaoIds}
            disabled={disabled}
          />
        </Stack>
      )}
    />
  )
}
