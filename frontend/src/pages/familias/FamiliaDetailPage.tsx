import { Avatar, Box, Button, Card, CardActionArea, CardContent, Container, Divider, Stack, Typography } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, apiFetch } from '../../api/client'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { DetailView, type DetailField } from '../../components/common/DetailView'
import { useAuth } from '../../auth/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { MODULES } from '../../navigation/modules'

interface EnderecoDTO {
  rua: string | null
  bairro: string | null
  numero: string | null
  complemento: string | null
  cidade: string | null
  cep: string | null
}

interface DependenteDTO {
  nome: string
  dataNascimento: string | null
  parentesco: string | null
  ocupacao: string | null
}

interface SituacaoSocioeconomicaDTO {
  profissao: string | null
  escolaridade: string | null
  tipoMoradia: 'PROPRIA' | 'ALUGADA' | 'CEDIDA' | 'OCUPACAO_IRREGULAR' | 'SITUACAO_DE_RUA' | null
  renda: 'SEM_RENDA' | 'ATE_1_SALARIO_MINIMO' | 'DE_1_A_2_SALARIOS_MINIMOS' | 'DE_2_A_3_SALARIOS_MINIMOS' | 'ACIMA_DE_3_SALARIOS_MINIMOS' | null
  beneficio: string | null
  acessoAlimentacao: boolean | null
}

interface ProblemaSaudeDTO {
  descricao: string
  gravidade: string | null
}

interface MedicamentoDTO {
  descricao: string
  dosagem: string | null
}

/**
 * Família (campos escalares + coleções do FamiliaResponse). Tipo local para não
 * conflitar com o api/familias.ts em desenvolvimento no #49/#76; consolidar no
 * merge. As coleções são só leitura aqui — a edição delas é do módulo #4.
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
  telefones: string[]
  enderecos: EnderecoDTO[]
  dependentes: DependenteDTO[]
  situacaoSocioeconomica: SituacaoSocioeconomicaDTO | null
  problemasSaude: ProblemaSaudeDTO[]
  medicamentos: MedicamentoDTO[]
  substancias: string[]
  servicos: string[]
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
const TIPO_MORADIA_LABELS: Record<string, string> = {
  PROPRIA: 'Própria', ALUGADA: 'Alugada', CEDIDA: 'Cedida',
  OCUPACAO_IRREGULAR: 'Ocupação irregular', SITUACAO_DE_RUA: 'Situação de rua',
}
const RENDA_LABELS: Record<string, string> = {
  SEM_RENDA: 'Sem renda',
  ATE_1_SALARIO_MINIMO: 'Até 1 salário mínimo',
  DE_1_A_2_SALARIOS_MINIMOS: 'De 1 a 2 salários mínimos',
  DE_2_A_3_SALARIOS_MINIMOS: 'De 2 a 3 salários mínimos',
  ACIMA_DE_3_SALARIOS_MINIMOS: 'Acima de 3 salários mínimos',
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

/** "rua, numero - bairro, cidade", omitindo partes ausentes. */
function formatEndereco(e: EnderecoDTO): string {
  const linha = [e.rua, e.numero].filter(Boolean).join(', ')
  const local = [e.bairro, e.cidade].filter(Boolean).join(', ')
  const partes = [linha, local].filter(Boolean)
  return partes.length ? partes.join(' - ') : '—'
}

function simNao(value: boolean | null): string {
  return value == null ? '—' : value ? 'Sim' : 'Não'
}

// Ordem e agrupamento dos "Dados pessoais" fiéis ao wireframe (docs/wireframes,
// telas 30-33): nome, filiação/nascimento, documentos, contato — seguidos dos
// campos que o wireframe não previa (indicação/cadastro). Telefone e Endereço
// (listas) são renderizados à parte, uma linha por item, entre NIS e Email.
const personalFieldsBeforeContact: DetailField<Familia>[] = [
  { field: 'nome', label: 'Nome completo' },
  { field: 'nomeSocial', label: 'Nome social' },
  { field: 'dataNascimento', label: 'Data de nascimento', render: formatDate },
  { field: 'naturalidade', label: 'Naturalidade' },
  { field: 'genero', label: 'Gênero', render: (v) => label(GENERO_LABELS, v) },
  { field: 'estadoCivil', label: 'Estado civil', render: (v) => label(ESTADO_CIVIL_LABELS, v) },
  { field: 'nomeMae', label: 'Nome da mãe' },
  { field: 'cpf', label: 'CPF' },
  { field: 'rg', label: 'RG' },
  { field: 'nis', label: 'NIS' },
]
const personalFieldsAfterContact: DetailField<Familia>[] = [
  { field: 'email', label: 'Email' },
  { field: 'indicacao', label: 'Como chegou', render: (v) => label(INDICACAO_LABELS, v) },
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
    <Container component="main" maxWidth="sm" sx={{ py: 1 }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">Detalhes da família</Typography>

        <DetailView<Familia>
          endpoint="/api/familias"
          id={id}
          fields={[]}
          renderActions={(familia) => (
            <Stack spacing={2}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 64, height: 64 }}>
                      <PersonOutlineIcon sx={{ fontSize: 44 }} aria-hidden="true" />
                    </Avatar>
                    <Typography component="h2" variant="h5" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                      {familia.nome}
                    </Typography>
                  </Stack>

                  <Card variant="outlined" sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography component="h3" variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                        Dados pessoais
                      </Typography>
                      <Stack spacing={1}>
                        {personalFieldsBeforeContact.map((f) => {
                          const value = familia[f.field]
                          return (
                            <Typography key={String(f.field)} sx={{ overflowWrap: 'anywhere' }}>
                              <Box component="span" sx={{ fontWeight: 700 }}>{f.label}: </Box>
                              {f.render ? f.render(value, familia) : String(value ?? '—')}
                            </Typography>
                          )
                        })}
                        {familia.telefones.map((telefone, i) => (
                          <Typography key={`telefone-${i}`} sx={{ overflowWrap: 'anywhere' }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>Telefone: </Box>
                            {telefone}
                          </Typography>
                        ))}
                        {familia.enderecos.map((endereco, i) => (
                          <Typography key={`endereco-${i}`} sx={{ overflowWrap: 'anywhere' }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>Endereço: </Box>
                            {formatEndereco(endereco)}
                          </Typography>
                        ))}
                        {personalFieldsAfterContact.map((f) => {
                          const value = familia[f.field]
                          return (
                            <Typography key={String(f.field)} sx={{ overflowWrap: 'anywhere' }}>
                              <Box component="span" sx={{ fontWeight: 700 }}>{f.label}: </Box>
                              {f.render ? f.render(value, familia) : String(value ?? '—')}
                            </Typography>
                          )
                        })}
                      </Stack>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {services.map((m) => {
                const Icon = m.icon
                const nome = m.label.charAt(0).toLowerCase() + m.label.slice(1)
                return (
                  <Card key={m.path} variant="outlined">
                    <CardActionArea
                      onClick={() => navigate(`/${m.path}?familia=${familia.id}`)}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2 }}
                    >
                      <Typography component="span" variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        Gerenciar {nome}
                      </Typography>
                      <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 56, height: 56, flexShrink: 0 }}>
                        <Icon sx={{ fontSize: 32 }} aria-hidden="true" />
                      </Avatar>
                    </CardActionArea>
                  </Card>
                )
              })}

              {familia.dependentes.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography component="h3" variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                      Dependentes
                    </Typography>
                    <Stack spacing={2} divider={<Divider />}>
                      {familia.dependentes.map((d, i) => (
                        <Stack key={i} spacing={0.5}>
                          <Typography sx={{ overflowWrap: 'anywhere' }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>Nome: </Box>{d.nome}
                          </Typography>
                          <Typography>
                            <Box component="span" sx={{ fontWeight: 700 }}>Data de nascimento: </Box>{formatDate(d.dataNascimento)}
                          </Typography>
                          <Typography sx={{ overflowWrap: 'anywhere' }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>Parentesco: </Box>{d.parentesco ?? '—'}
                          </Typography>
                          <Typography sx={{ overflowWrap: 'anywhere' }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>Ocupação/Escola: </Box>{d.ocupacao ?? '—'}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {familia.situacaoSocioeconomica && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography component="h3" variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                      Situação socioeconômica
                    </Typography>
                    <Stack spacing={1}>
                      <Typography sx={{ overflowWrap: 'anywhere' }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>Profissão: </Box>{familia.situacaoSocioeconomica.profissao ?? '—'}
                      </Typography>
                      <Typography sx={{ overflowWrap: 'anywhere' }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>Escolaridade: </Box>{familia.situacaoSocioeconomica.escolaridade ?? '—'}
                      </Typography>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 700 }}>Tipo de moradia: </Box>
                        {label(TIPO_MORADIA_LABELS, familia.situacaoSocioeconomica.tipoMoradia)}
                      </Typography>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 700 }}>Renda: </Box>
                        {label(RENDA_LABELS, familia.situacaoSocioeconomica.renda)}
                      </Typography>
                      <Typography sx={{ overflowWrap: 'anywhere' }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>Benefício(s): </Box>{familia.situacaoSocioeconomica.beneficio ?? '—'}
                      </Typography>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 700 }}>Possui acesso à alimentação básica diariamente? </Box>
                        {simNao(familia.situacaoSocioeconomica.acessoAlimentacao)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {(familia.problemasSaude.length > 0 || familia.medicamentos.length > 0 || familia.substancias.length > 0) && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography component="h3" variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                      Saúde
                    </Typography>
                    <Stack spacing={2}>
                      {familia.problemasSaude.length > 0 && (
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 700 }}>Problemas de saúde</Typography>
                          {familia.problemasSaude.map((p, i) => (
                            <Typography key={i} sx={{ overflowWrap: 'anywhere' }}>
                              {p.descricao} — Gravidade: {p.gravidade ?? '—'}
                            </Typography>
                          ))}
                        </Stack>
                      )}
                      {familia.medicamentos.length > 0 && (
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 700 }}>Medicamentos utilizados</Typography>
                          {familia.medicamentos.map((m, i) => (
                            <Typography key={i} sx={{ overflowWrap: 'anywhere' }}>
                              {m.descricao} — Dosagem: {m.dosagem ?? '—'}
                            </Typography>
                          ))}
                        </Stack>
                      )}
                      {familia.substancias.length > 0 && (
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 700 }}>Substâncias psicoativas</Typography>
                          {familia.substancias.map((s, i) => (
                            <Typography key={i} sx={{ overflowWrap: 'anywhere' }}>{s}</Typography>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {familia.servicos.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography component="h3" variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                      Serviços utilizados
                    </Typography>
                    <Stack spacing={0.5}>
                      {familia.servicos.map((s) => (
                        <Typography key={s} sx={{ overflowWrap: 'anywhere' }}>{s}</Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {familia.observacoes && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography sx={{ overflowWrap: 'anywhere' }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>Observações: </Box>{familia.observacoes}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Stack spacing={1} sx={{ pt: 1 }}>
                <Stack direction="row" spacing={3}>
                  {can('FAMILIA:UPDATE') && (
                    <Button
                      variant="text"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => showToast('A edição de famílias chega no #51.', 'info')}
                      sx={{ fontWeight: 700 }}
                    >
                      Editar
                    </Button>
                  )}
                  {can('FAMILIA:DELETE') && (
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => handleExcluir(familia)}
                      sx={{ fontWeight: 700 }}
                    >
                      Excluir
                    </Button>
                  )}
                </Stack>
                <Button
                  variant="text"
                  startIcon={<ArrowBackOutlinedIcon />}
                  onClick={() => navigate('/familias')}
                  sx={{ fontWeight: 700, alignSelf: 'flex-start' }}
                >
                  Voltar
                </Button>
              </Stack>
            </Stack>
          )}
        />
      </Stack>

      <ConfirmDialog {...confirmDialogProps} />
    </Container>
  )
}
