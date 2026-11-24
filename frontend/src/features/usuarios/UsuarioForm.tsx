import { Stack } from '@mui/material'

import { TextInput, SelectInput } from '../../components/fields'
import { UnifiedForm } from '../../components/forms/UnifiedForm'
import type { FormMode } from '../../components/forms/UnifiedForm'

import type { UsuarioListItem } from '../../api/usuarios'
import { createUsuario, updateUsuario } from '../../api/usuarios'

import type { UsuarioFormValues } from './types'
import { emptyUsuarioForm, toUsuarioRequest } from './types'
import { validateUsuario } from './usuarioValidation'
import { CargosCheckboxField } from './CargosCheckboxField'

interface UsuarioFormProps {
  mode: FormMode
  usuarioId?: number
  initialValues?: UsuarioFormValues
  onSuccess?: (usuario: UsuarioListItem) => void
}

export function UsuarioForm({
  mode,
  usuarioId,
  initialValues = emptyUsuarioForm,
  onSuccess,
}: UsuarioFormProps) {
  async function handleCreate(values: UsuarioFormValues) {
    return createUsuario(toUsuarioRequest(values))
  }

  async function handleUpdate(values: UsuarioFormValues) {
    if (usuarioId === undefined) {
      throw new Error('ID do usuário não informado.')
    }

    return updateUsuario(usuarioId, toUsuarioRequest(values))
  }

  return (
    <UnifiedForm<UsuarioFormValues, UsuarioListItem>
      mode={mode}
      initialValues={initialValues}
      validate={(values) => validateUsuario(values, mode)}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onSuccess={onSuccess}
      renderFields={({ values, setValues, errors, disabled }) => {
        function updateField(field: keyof UsuarioFormValues, value: string) {
          setValues((prev) => ({ ...prev, [field]: value }))
        }

        return (
          <Stack spacing={3}>
            <TextInput
              label="Nome"
              value={values.nome}
              onChange={(value) => updateField('nome', value)}
              error={errors.nome}
              disabled={disabled}
              required
            />

            <TextInput
              label="E-mail"
              value={values.email}
              onChange={(value) => updateField('email', value)}
              error={errors.email}
              disabled={disabled}
              required
            />

            <TextInput
              label="Senha"
              value={values.senha}
              onChange={(value) => updateField('senha', value)}
              error={errors.senha}
              disabled={disabled}
              placeholder={
                mode === 'edit'
                  ? 'Deixe em branco para manter a senha atual'
                  : undefined
              }
              required={mode === 'create'}
            />

            <SelectInput
              label="Situação"
              value={values.ativo}
              onChange={(value) => updateField('ativo', value)}
              options={[
                { label: 'Ativo', value: 'true' },
                { label: 'Inativo', value: 'false' },
              ]}
              error={errors.ativo}
              disabled={disabled}
            />

            <CargosCheckboxField
              value={values.cargoIds}
              onChange={(cargoIds) => setValues((prev) => ({ ...prev, cargoIds }))}
              error={errors.cargoIds}
              disabled={disabled}
            />
          </Stack>
        )
      }}
    />
  )
}
