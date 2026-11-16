import { useEffect, useState } from 'react'
import { Button, Container, Stack, Typography } from '@mui/material'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ApiError, apiFetch } from '../../api/client'
import { createCesta, getCesta, updateCesta, type CestaRequest } from '../../api/cestas'
import type { PaginatedList } from '../../api/pagination'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { DateInput, NumberInput, Repeater, SelectInput, TextInput } from '../../components/fields'
import type { SelectOption } from '../../components/fields'
import { useToast } from '../../hooks/useToast'

interface ItemForm {
  descricao: string
  quantidade: number | ''
}

interface FamiliaOption {
  id: number
  nome: string
}

/**
 * Formulário de cadastro/edição de doação de cesta (#6). Compõe os campos da #25
 * (seletor de família, data e itens repetíveis com descrição + quantidade) e usa
 * o cliente HTTP (#28) + o feedback da #27. Abre em modo criação por padrão; com
 * `:id` na rota, carrega a doação para edição. Aceita `?familia=:id` para
 * pré-selecionar a família ao criar a partir do detalhe-hub.
 */
export function CestaFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState<Error | null>(null)
  const [salvando, setSalvando] = useState(false)

  const [familias, setFamilias] = useState<FamiliaOption[]>([])
  const [familiaId, setFamiliaId] = useState('')
  const [data, setData] = useState('')
  const [itens, setItens] = useState<ItemForm[]>([])
  const [familiaErro, setFamiliaErro] = useState<string>()

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

        if (isEdit && id) {
          const cesta = await getCesta(id)
          if (!ativo) return
          setFamiliaId(String(cesta.familiaId))
          setData(cesta.data?.slice(0, 10) ?? '')
          setItens(cesta.itens.map((i) => ({ descricao: i.descricao, quantidade: i.quantidade })))
        } else {
          const preFamilia = searchParams.get('familia')
          if (preFamilia) setFamiliaId(preFamilia)
        }
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
  }, [id, isEdit, searchParams])

  const familiaOptions: SelectOption[] = familias.map((f) => ({ value: String(f.id), label: f.nome }))

  async function handleSubmit() {
    setFamiliaErro(undefined)
    if (!familiaId) {
      setFamiliaErro('Selecione a família.')
      return
    }
    if (itens.length === 0) {
      showToast('Informe ao menos um item.', 'error')
      return
    }

    const req: CestaRequest = {
      familiaId: Number(familiaId),
      data: data || null,
      itens: itens.map((i) => ({ descricao: i.descricao.trim(), quantidade: Number(i.quantidade) })),
    }

    setSalvando(true)
    try {
      const salva = isEdit && id ? await updateCesta(id, req) : await createCesta(req)
      showToast(isEdit ? 'Doação atualizada.' : 'Doação registrada.', 'success')
      navigate(`/cestas/${salva.id}`)
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
        <Button
          variant="outlined"
          onClick={() => navigate(isEdit && id ? `/cestas/${id}` : '/cestas')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Cancelar
        </Button>
        <Typography component="h1" variant="h4">
          {isEdit ? 'Editar doação de cesta' : 'Nova doação de cesta'}
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

        <Repeater<ItemForm>
          label="Itens"
          required
          value={itens}
          onChange={setItens}
          createEmpty={() => ({ descricao: '', quantidade: '' })}
          getItemLabel={(item) =>
            item.descricao ? `${item.descricao} — ${item.quantidade}` : 'Novo item'
          }
          validateItem={(item) => {
            if (!item.descricao.trim()) return 'Informe a descrição do item.'
            if (item.quantidade === '' || Number(item.quantidade) <= 0) {
              return 'A quantidade deve ser maior que zero.'
            }
            return undefined
          }}
          renderForm={({ item, onChange }) => (
            <Stack spacing={2}>
              <TextInput
                label="Descrição"
                value={item.descricao}
                onChange={(descricao) => onChange({ ...item, descricao })}
              />
              <NumberInput
                label="Quantidade"
                value={item.quantidade}
                onChange={(quantidade) => onChange({ ...item, quantidade })}
                min={0}
                step={0.5}
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
