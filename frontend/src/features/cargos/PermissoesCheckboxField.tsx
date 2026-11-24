import { useEffect, useState } from 'react'
import { Alert, CircularProgress, Stack } from '@mui/material'

import { CheckboxGroup } from '../../components/fields'
import { getAllPermissoes } from '../../api/permissoes'
import type { PermissaoListItem } from '../../api/permissoes'

interface Props {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  disabled?: boolean
}

export function PermissoesCheckboxField({ value, onChange, error, disabled = false }: Props) {
  const [permissoes, setPermissoes] = useState<PermissaoListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let ativo = true

    getAllPermissoes()
      .then((resultado) => {
        if (ativo) setPermissoes(resultado)
      })
      .catch(() => {
        if (ativo) setLoadError(true)
      })
      .finally(() => {
        if (ativo) setLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  if (loading) {
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress size={20} />
        <span>Carregando permissões...</span>
      </Stack>
    )
  }

  if (loadError) {
    return <Alert severity="error">Não foi possível carregar as permissões disponíveis.</Alert>
  }

  if (permissoes.length === 0) {
    return <Alert severity="info">Nenhuma permissão está cadastrada no sistema.</Alert>
  }

  const options = permissoes.map((permissao) => ({ value: String(permissao.id), label: permissao.codigo }))

  return (
    <CheckboxGroup
      label="Permissões"
      value={value}
      onChange={onChange}
      options={options}
      error={error}
      disabled={disabled}
    />
  )
}
