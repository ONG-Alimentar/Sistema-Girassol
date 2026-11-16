import { Box, Button, Card, CardActionArea, Container, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, apiFetch } from '../../api/client'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { DetailView, type DetailField } from '../../components/common/DetailView'
import { useAuth } from '../../auth/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { MODULES } from '../../navigation/modules'

/**
 * Família (campos escalares do FamiliaResponse). Tipo local para não conflitar
 * com o api/familias.ts em desenvolvimento no #49/#76; consolidar no merge.
 */
interface Familia {
  id: number
  nome: string
  nomeSocial: string | null
  dataNascimento: string | null
  genero: 'MASCULINO' | 'FEMININO' | 'OUTRO' | null
  estadoCivil: 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO' | 'UNIAO_ESTAVEL' | null
  indicacao: 'RECOMENDACAO_DE_AMIGOS_OU_CONHECIDOS' | 'REDES_SOCIAIS' | 'ENCAMINHADO_REDE_PUBLICA' | 'OUTRA_MANEIRA' | null
  nomeMae: string | null
  email: string | null
  cpf: string | null
  rg: string | null
  nis: string | null
  naturalidade: string | null
  observacoes: string | null
  dataCadastro: string | null
}

const GENERO_LABELS: Record<string, string> = {
  MASCULINO: 'Masculino', FEMININO: 'Feminino', OUTRO: 'Outro',
}
const ESTADO_CIVIL_LABELS: Record<string, string> = {
  SOLTEIRO: 'Solteiro(a)', CASADO: 'Casado(a)', DIVORCIADO: 'Divorciado(a)',
  VIUVO: 'Viúvo(a)', UNIAO_ESTAVEL: 'União estável',
}
const INDICACAO_LABELS: Record<string, string> = {
  RECOMENDACAO_DE_AMIGOS_OU_CONHECIDOS: 'Recomendação de amigos/conhecidos',
  REDES_SOCIAIS: 'Redes sociais',
  ENCAMINHADO_REDE_PUBLICA: 'Encaminhado pela rede pública',
  OUTRA_MANEIRA: 'Outra maneira',
}

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd). */
function formatDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '—'
  const parts = value.slice(0, 10).split('-')
  return parts.length === 3 ? parts.reverse().join('/') : value
}

function label(map: Record<string, string>, value: unknown): string {
  return typeof value === 'string' ? (map[value] ?? value) : '—'
}

const fields: DetailField<Familia>[] = [
  { field: 'nome', label: 'Nome' },
  { field: 'nomeSocial', label: 'Nome social' },
  { field: 'dataNascimento', label: 'Data de nascimento', render: formatDate },
  { field: 'genero', label: 'Gênero', render: (v) => label(GENERO_LABELS, v) },
  { field: 'estadoCivil', label: 'Estado civil', render: (v) => label(ESTADO_CIVIL_LABELS, v) },
  { field: 'nomeMae', label: 'Nome da mãe' },
  { field: 'cpf', label: 'CPF' },
  { field: 'rg', label: 'RG' },
  { field: 'nis', label: 'NIS' },
  { field: 'email', label: 'E-mail' },
  { field: 'naturalidade', label: 'Naturalidade' },
  { field: 'indicacao', label: 'Como chegou', render: (v) => label(INDICACAO_LABELS, v) },
  { field: 'observacoes', label: 'Observações' },
  { field: 'dataCadastro', label: 'Cadastrada em', render: formatDate },
]

// Serviços da família exibidos no hub (subconjunto dos módulos; o resto do
// registro — famílias/documentação/usuários — não é serviço de família).
const FAMILY_SERVICE_PATHS = ['cestas', 'roupas', 'visitas', 'juridico', 'psicologico']

/**
 * Detalhe-hub da família (#50): dados read-only (via DetailView/#24), hub de
 * navegação para os serviços da família e ações Editar/Excluir (RBAC + #27).
 */
export function FamiliaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { showToast } = useToast()
  const { confirm, confirmDialogProps } = useConfirm()

  const services = MODULES.filter(
    (m) => FAMILY_SERVICE_PATHS.includes(m.path) && can(m.permission),
  )

  async function handleExcluir(familia: Familia) {
    const ok = await confirm({
      title: 'Excluir família',
      message: `Excluir "${familia.nome}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      color: 'error',
    })
    if (!ok) return

    try {
      await apiFetch(`/api/familias/${familia.id}`, { method: 'DELETE' })
      showToast('Família excluída.', 'success')
      navigate('/familias')
    } catch (cause) {
      showToast(
        cause instanceof ApiError ? cause.message : 'Não foi possível excluir a família.',
        'error',
      )
    }
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: 1 }}>
      <Stack spacing={3}>
        <Button variant="outlined" onClick={() => navigate('/familias')} sx={{ alignSelf: 'flex-start' }}>
          Voltar à listagem
        </Button>
        <Typography component="h1" variant="h4">Detalhes da família</Typography>

        <DetailView<Familia>
          endpoint="/api/familias"
          id={id}
          fields={fields}
          onEdit={can('FAMILIA:UPDATE')
            ? () => showToast('A edição de famílias chega no #51.', 'info')
            : undefined}
          renderActions={(familia) => (
            <Stack spacing={3}>
              {services.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>Serviços da família</Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    }}
                  >
                    {services.map((m) => {
                      const Icon = m.icon
                      return (
                        <Card key={m.path}>
                          <CardActionArea
                            onClick={() => navigate(`/${m.path}?familia=${familia.id}`)}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 2, minHeight: 112 }}
                          >
                            <Icon sx={{ fontSize: 36, color: 'primary.main' }} />
                            <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700, textAlign: 'center' }}>
                              {m.label}
                            </Typography>
                          </CardActionArea>
                        </Card>
                      )
                    })}
                  </Box>
                </Box>
              )}

              {can('FAMILIA:DELETE') && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleExcluir(familia)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Excluir
                </Button>
              )}
            </Stack>
          )}
        />
      </Stack>

      <ConfirmDialog {...confirmDialogProps} />
    </Container>
  )
}
