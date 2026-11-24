import { useEffect, useState } from 'react'
import { Button, Container, Stack, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, apiFetch } from '../../api/client'
import { createRoupa, type RoupaRequest } from '../../api/roupas'
import type { PaginatedList } from '../../api/pagination'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { DateInput, NumberInput, Repeater, SelectInput, TextInput } from '../../components/fields'
import type { SelectOption } from '../../components/fields'
import { useToast } from '../../hooks/useToast'

interface PecaForm {
  descricao: string
  tamanho: string
  genero: string
}

interface FamiliaOption {
  id: number
  nome: string
}

const GENERO_OPTIONS: SelectOption[] = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'OUTRO', label: 'Outro' },
]

/**
 * Formulário de cadastro de doação de roupa (#7). Compõe os campos da #25
 * (seletor de família, data, quantidade e peças repetíveis opcionais) e usa o
 * cliente HTTP (#28) + o feedback da #27. Só criação — não há `ROUPA:UPDATE`
 * no RBAC atual, então não existe modo de edição. Aceita `?familia=:id` para
 * pré-selecionar a família ao criar a partir do detalhe-hub.
 */
export function RoupaFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState<Error | null>(null)
  const [salvando, setSalvando] = useState(false)

  const [familias, setFamilias] = useState<FamiliaOption[]>([])
  const [familiaId, setFamiliaId] = useState('')
  const [data, setData] = useState('')
  const [quantidade, setQuantidade] = useState<number | ''>('')
  const [pecas, setPecas] = useState<PecaForm[]>([])
  const [familiaErro, setFamiliaErro] = useState<string>()
  const [quantidadeErro, setQuantidadeErro] = useState<string>()

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      setErroCarga(null)
      try {
        const lista = await apiFetch<PaginatedList<FamiliaOption>>(
          '/api/familias?size=1000&sort=nome,asc',
        )
        if (!ativo) return
        setFamilias(lista.content)

        const preFamilia = searchParams.get('familia')
        if (preFamilia) setFamiliaId(preFamilia)
      } catch (cause) {
        if (ativo) setErroCarga(cause instanceof Error ? cause : new Error('Falha ao carregar.'))
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [searchParams])

  const familiaOptions: SelectOption[] = familias.map((f) => ({ value: String(f.id), label: f.nome }))

  async function handleSubmit() {
    setFamiliaErro(undefined)
    setQuantidadeErro(undefined)

    let valido = true
    if (!familiaId) {
      setFamiliaErro('Selecione a família.')
      valido = false
    }
    if (quantidade === '' || Number(quantidade) <= 0) {
      setQuantidadeErro('A quantidade deve ser maior que zero.')
      valido = false
    }
    if (!valido) return

    const req: RoupaRequest = {
      familiaId: Number(familiaId),
      data: data || null,
      quantidade: Number(quantidade),
      pecas: pecas.map((p) => ({
        descricao: p.descricao.trim(),
        tamanho: p.tamanho.trim() || null,
        genero: p.genero || null,
      })),
    }

    setSalvando(true)
    try {
      const salva = await createRoupa(req)
      showToast('Doação registrada.', 'success')
      navigate(`/roupas/${salva.id}`)
    } catch (cause) {
      showToast(
        cause instanceof ApiError ? cause.message : 'Não foi possível salvar a doação.',
        'error',
      )
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <LoadingState />
  if (erroCarga) return <ErrorState message={erroCarga.message} onRetry={() => navigate(0)} />

  return (
    <Container component="main" maxWidth="md" sx={{ py: 1 }}>
      <Stack spacing={3}>
        <Button variant="outlined" onClick={() => navigate('/roupas')} sx={{ alignSelf: 'flex-start' }}>
          Cancelar
        </Button>
        <Typography component="h1" variant="h4">
          Nova doação de roupa
        </Typography>

        <SelectInput
          label="Família"
          value={familiaId}
          onChange={setFamiliaId}
          options={familiaOptions}
          placeholder="Selecione a família"
          error={familiaErro}
          required
        />

        <DateInput label="Data" value={data} onChange={setData} />

        <NumberInput
          label="Quantidade de peças"
          value={quantidade}
          onChange={setQuantidade}
          error={quantidadeErro}
          min={1}
          step={1}
          required
        />

        <Repeater<PecaForm>
          label="Peças (opcional)"
          value={pecas}
          onChange={setPecas}
          createEmpty={() => ({ descricao: '', tamanho: '', genero: '' })}
          getItemLabel={(peca) => peca.descricao || 'Nova peça'}
          validateItem={(peca) => {
            if (!peca.descricao.trim()) return 'Informe a descrição da peça.'
            return undefined
          }}
          renderForm={({ item, onChange }) => (
            <Stack spacing={2}>
              <TextInput
                label="Descrição"
                value={item.descricao}
                onChange={(descricao) => onChange({ ...item, descricao })}
              />
              <TextInput
                label="Tamanho"
                value={item.tamanho}
                onChange={(tamanho) => onChange({ ...item, tamanho })}
              />
              <SelectInput
                label="Gênero"
                value={item.genero}
                onChange={(genero) => onChange({ ...item, genero })}
                options={GENERO_OPTIONS}
                placeholder="Selecione"
              />
            </Stack>
          )}
        />

        <Button variant="contained" onClick={handleSubmit} disabled={salvando} sx={{ alignSelf: 'flex-start' }}>
          {salvando ? 'Salvando…' : 'Salvar doação'}
        </Button>
      </Stack>
    </Container>
  )
}
