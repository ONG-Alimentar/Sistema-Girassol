import { useState } from 'react'
import { Button, Container, FormControl, FormControlLabel, FormHelperText, FormLabel, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { createVisita, SITUACOES, TURNOS, type Visita, type VisitaRequest } from '../../api/visitas'
import type { FormErrors } from '../../api/errors'
import { DateInput, NumberInput, SelectInput, TextArea, TextInput } from '../../components/fields'
import { UnifiedForm } from '../../components/forms/UnifiedForm'
import { useAuth } from '../../auth/useAuth'
import { useToast } from '../../hooks/useToast'

interface VisitaFormValues {
  data: string
  turno: string
  nome: string
  idade: number | ''
  contato: string
  situacao: string
  motivoDaProcura: string
  pedidoAtendido: string
  observacoes: string
}

function validate(values: VisitaFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.data || !dayjs(values.data).isValid()) errors.data = 'Informe uma data válida.'
  if (!values.nome.trim()) errors.nome = 'O nome é obrigatório.'
  else if (values.nome.trim().length > 255) errors.nome = 'O nome deve ter até 255 caracteres.'
  if (values.idade !== '' && (!Number.isInteger(values.idade) || values.idade < 0 || values.idade > 2147483647)) errors.idade = 'Informe uma idade inteira não negativa.'
  if (values.contato.length > 255) errors.contato = 'O contato deve ter até 255 caracteres.'
  if (values.motivoDaProcura.length > 1000) errors.motivoDaProcura = 'O motivo deve ter até 1000 caracteres.'
  if (values.observacoes.length > 2000) errors.observacoes = 'As observações devem ter até 2000 caracteres.'
  return errors
}

function toRequest(values: VisitaFormValues): VisitaRequest {
  return {
    data: values.data,
    turno: TURNOS.find((o) => o.value === values.turno)?.value ?? null,
    nome: values.nome.trim(),
    idade: values.idade === '' ? null : values.idade,
    contato: values.contato.trim() || null,
    situacao: SITUACOES.find((o) => o.value === values.situacao)?.value ?? null,
    motivoDaProcura: values.motivoDaProcura.trim() || null,
    pedidoAtendido: values.pedidoAtendido === '' ? null : values.pedidoAtendido === 'true',
    observacoes: values.observacoes.trim() || null,
  }
}

export function VisitaFormPage() {
  const navigate = useNavigate()
  const { can } = useAuth()
  const { showToast } = useToast()
  const [initialValues] = useState<VisitaFormValues>(() => ({
    data: dayjs().format('YYYY-MM-DD'), turno: '', nome: '', idade: '', contato: '',
    situacao: '', motivoDaProcura: '', pedidoAtendido: '', observacoes: '',
  }))

  return (
    <Container maxWidth="md" sx={{ py: 1 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>Cadastrar visita</Typography>
          <UnifiedForm<VisitaFormValues, Visita>
            mode="create" initialValues={initialValues} validate={validate}
            onCreate={(values) => createVisita(toRequest(values))}
            onUpdate={() => Promise.reject(new Error('A edição de visitas não é permitida.'))}
            onSuccess={(visita) => {
              showToast('Visita registrada.', 'success')
              navigate(can('VISITA:READ') ? `/visitas/${visita.id}` : '/')
            }}
            submitLabel="Salvar"
            renderFields={({ values, setValues, errors, disabled }) => (
              <>
                <DateInput label="Data" value={values.data} onChange={(data) => setValues((v) => ({ ...v, data }))} error={errors.data} disabled={disabled} required />
                <SelectInput label="Turno" value={values.turno} onChange={(turno) => setValues((v) => ({ ...v, turno }))} options={[{ value: '', label: 'Não informado' }, ...TURNOS]} error={errors.turno} disabled={disabled} />
                <TextInput label="Nome do visitante" value={values.nome} onChange={(nome) => setValues((v) => ({ ...v, nome }))} error={errors.nome} disabled={disabled} maxLength={255} required />
                <NumberInput label="Idade" value={values.idade} onChange={(idade) => setValues((v) => ({ ...v, idade }))} error={errors.idade} disabled={disabled} min={0} step={1} />
                <TextInput label="Contato" value={values.contato} onChange={(contato) => setValues((v) => ({ ...v, contato }))} error={errors.contato} disabled={disabled} maxLength={255} />
                <SelectInput label="Situação" value={values.situacao} onChange={(situacao) => setValues((v) => ({ ...v, situacao }))} options={[{ value: '', label: 'Não informada' }, ...SITUACOES]} error={errors.situacao} disabled={disabled} />
                <TextArea label="Motivo da procura" value={values.motivoDaProcura} onChange={(motivoDaProcura) => setValues((v) => ({ ...v, motivoDaProcura }))} error={errors.motivoDaProcura} disabled={disabled} maxLength={1000} rows={2} />
                <FormControl disabled={disabled} error={Boolean(errors.pedidoAtendido)}>
                  <FormLabel id="pedido-atendido-label">O pedido foi atendido?</FormLabel>
                  <RadioGroup row aria-labelledby="pedido-atendido-label" value={values.pedidoAtendido} onChange={(_, pedidoAtendido) => setValues((v) => ({ ...v, pedidoAtendido }))}>
                    <FormControlLabel value="true" control={<Radio />} label="Sim" />
                    <FormControlLabel value="false" control={<Radio />} label="Não" />
                  </RadioGroup>
                  <Button size="small" disabled={disabled || values.pedidoAtendido === ''} onClick={() => setValues((v) => ({ ...v, pedidoAtendido: '' }))} sx={{ alignSelf: 'flex-start' }}>Limpar resposta</Button>
                  {errors.pedidoAtendido && <FormHelperText>{errors.pedidoAtendido}</FormHelperText>}
                </FormControl>
                <TextArea label="Observações" value={values.observacoes} onChange={(observacoes) => setValues((v) => ({ ...v, observacoes }))} error={errors.observacoes} disabled={disabled} maxLength={2000} />
              </>
            )}
          />
        </Paper>
        <Button variant="outlined" onClick={() => navigate(can('VISITA:READ') ? '/visitas' : '/')} sx={{ alignSelf: 'flex-start' }}>Voltar</Button>
      </Stack>
    </Container>
  )
}
