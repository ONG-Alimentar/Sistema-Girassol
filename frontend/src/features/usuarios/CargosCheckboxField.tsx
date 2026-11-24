import { useEffect, useState } from 'react'
import { Alert, CircularProgress, Stack } from '@mui/material'

import { CheckboxGroup } from '../../components/fields'
import { getAllCargos } from '../../api/cargos'

interface Props {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  disabled?: boolean
}

export function CargosCheckboxField({ value, onChange, error, disabled = false }: Props) {
  const [cargos, setCargos] = useState<{ id: number; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let ativo = true

    getAllCargos()
      .then((resultado) => {
        if (ativo) setCargos(resultado)
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
        <span>Carregando cargos...</span>
      </Stack>
    )
  }

  if (loadError) {
    return <Alert severity="error">Não foi possível carregar os cargos disponíveis.</Alert>
  }

  if (cargos.length === 0) {
    return <Alert severity="info">Nenhum cargo está cadastrado no sistema.</Alert>
  }

  const options = cargos.map((cargo) => ({ value: String(cargo.id), label: cargo.nome }))

  return (
    <CheckboxGroup
      label="Cargos"
      value={value}
      onChange={onChange}
      options={options}
      error={error}
      disabled={disabled}
    />
  )
}
