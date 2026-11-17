import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, renderAuthedApp } from '../../test/appRender.tsx'
import type { Permission } from '../../auth/permissions.ts'

const familia = {
  id: 7,
  nome: 'Família Silva',
  nomeSocial: null,
  dataNascimento: '1990-05-10',
  genero: 'FEMININO',
  estadoCivil: 'UNIAO_ESTAVEL',
  indicacao: 'REDES_SOCIAIS',
  nomeMae: 'Maria Silva',
  email: 'silva@example.org',
  cpf: '123.456.789-00',
  rg: '1234567',
  nis: '98765',
  naturalidade: 'Pelotas',
  observacoes: 'Sem observações.',
  dataCadastro: '2026-01-02',
  telefones: [{ id: 1, numero: '53999990000' }],
  enderecos: [{ id: 1, rua: 'Rua das Flores', bairro: 'Centro', numero: '42', complemento: 'Casa 2', cidade: 'Pelotas', cep: '96015000' }],
  dependentes: [{ id: 1, nome: 'João Silva', dataNascimento: '2012-08-03', parentesco: 'Filho', ocupacao: 'Estudante' }],
  situacaoSocioeconomica: {
    id: 1,
    profissao: 'Costureira',
    escolaridade: 'Ensino médio',
    tipoMoradia: 'ALUGADA',
    renda: 'ATE_1_SALARIO_MINIMO',
    beneficio: 'Bolsa Família',
    acessoAlimentacao: true,
  },
  problemasSaude: [{ id: 1, descricao: 'Asma', gravidade: 'Moderada' }],
  medicamentos: [{ id: 1, descricao: 'Salbutamol', dosagem: '2 jatos' }],
  substancias: [{ id: 1, descricao: 'Tabaco' }],
  servicosIds: [1],
}

const servicosCatalogo = [{ id: 1, nome: 'Cesta básica' }]

const familiaVazia = {
  id: 8,
  nome: 'Família sem dados complementares',
  nomeSocial: null,
  dataNascimento: null,
  genero: null,
  estadoCivil: null,
  indicacao: null,
  nomeMae: null,
  email: null,
  cpf: null,
  rg: null,
  nis: null,
  naturalidade: null,
  observacoes: null,
  dataCadastro: null,
  telefones: [],
  enderecos: [],
  dependentes: [],
  situacaoSocioeconomica: null,
  problemasSaude: [],
  medicamentos: [],
  substancias: [],
  servicosIds: [],
}

/** Trata GET/DELETE de /api/familias/7 e /8, e o catálogo de /api/servicos; outros ids → 404. */
function familiaHandler(url: string, init?: RequestInit): Response {
  if (url.endsWith('/api/servicos')) {
    return jsonResponse(servicosCatalogo)
  }
  if (url.endsWith('/api/familias/7')) {
    if (init?.method === 'DELETE') return new Response(null, { status: 204 })
    return jsonResponse(familia)
  }
  if (url.endsWith('/api/familias/8')) {
    return jsonResponse(familiaVazia)
  }
  return jsonResponse({ message: 'Família não encontrada.' }, 404)
}

function open(permissions: Permission[], path = '/familias/7') {
  return renderAuthedApp({ me: { permissions }, path, fetchHandler: familiaHandler })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('FamiliaDetailPage — detalhe-hub (#50)', () => {
  it('exibe os dados da família (enums e datas formatados)', async () => {
    await open(['FAMILIA:READ'])

    expect(await screen.findByRole('heading', { name: 'Família Silva' })).toBeInTheDocument()
    expect(screen.getByText('Dados pessoais')).toBeInTheDocument()
    expect(screen.getByText('Feminino')).toBeInTheDocument()
    expect(screen.getByText('União estável')).toBeInTheDocument()
    expect(screen.getByText('10/05/1990')).toBeInTheDocument()
  })

  it('mostra "não encontrado" para id inexistente', async () => {
    await open(['FAMILIA:READ'], '/familias/999')

    expect(await screen.findByText('Registro não encontrado')).toBeInTheDocument()
  })

  it('oculta Editar/Excluir e o hub sem as permissões (só FAMILIA:READ)', async () => {
    await open(['FAMILIA:READ'])

    await screen.findByRole('heading', { name: 'Família Silva' })
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
    expect(screen.queryByText('Gerenciar cestas básicas')).not.toBeInTheDocument()
  })

  it('mostra o card de serviço permitido e navega com ?familia=:id', async () => {
    await open(['FAMILIA:READ', 'CESTA:READ'])

    fireEvent.click(await screen.findByText('Gerenciar cestas básicas'))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/cestas'))
    expect(window.location.search).toBe('?familia=7')
  })

  it('exclui com confirmação: DELETE + volta à listagem', async () => {
    await open(['FAMILIA:READ', 'FAMILIA:DELETE'])

    fireEvent.click(await screen.findByRole('button', { name: 'Excluir' }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/familias'))
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/familias/7'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('Editar navega para o formulário de edição da família (#51)', async () => {
    await open(['FAMILIA:READ', 'FAMILIA:UPDATE'])

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/familias/7/editar'))
  })

  it('exibe Telefone e Endereço no card Dados pessoais', async () => {
    await open(['FAMILIA:READ'])

    expect(await screen.findByText(/53999990000/)).toBeInTheDocument()
    expect(screen.getByText(/Rua das Flores/)).toBeInTheDocument()
  })

  it('exibe a seção Dependentes', async () => {
    await open(['FAMILIA:READ'])

    expect(await screen.findByText('Dependentes')).toBeInTheDocument()
    expect(screen.getByText(/João Silva/)).toBeInTheDocument()
    expect(screen.getByText(/Estudante/)).toBeInTheDocument()
  })

  it('exibe a seção Situação socioeconômica com os labels traduzidos', async () => {
    await open(['FAMILIA:READ'])

    expect(await screen.findByText('Situação socioeconômica')).toBeInTheDocument()
    expect(screen.getByText('Alugada')).toBeInTheDocument()
    expect(screen.getByText('Até 1 salário mínimo')).toBeInTheDocument()
    expect(screen.getByText(/Sim/)).toBeInTheDocument()
  })

  it('exibe a seção Saúde (problemas, medicamentos e substâncias)', async () => {
    await open(['FAMILIA:READ'])

    expect(await screen.findByText('Saúde')).toBeInTheDocument()
    expect(screen.getByText(/Gravidade: Moderada/)).toBeInTheDocument()
    expect(screen.getByText(/Dosagem: 2 jatos/)).toBeInTheDocument()
    expect(screen.getByText('Tabaco')).toBeInTheDocument()
  })

  it('exibe a seção Serviços utilizados', async () => {
    await open(['FAMILIA:READ'])

    expect(await screen.findByText('Serviços utilizados')).toBeInTheDocument()
    expect(screen.getByText('Cesta básica')).toBeInTheDocument()
  })

  it('oculta as seções novas quando a família não tem dados complementares', async () => {
    await open(['FAMILIA:READ'], '/familias/8')

    await screen.findByRole('heading', { name: 'Família sem dados complementares' })
    expect(screen.queryByText('Dependentes')).not.toBeInTheDocument()
    expect(screen.queryByText('Situação socioeconômica')).not.toBeInTheDocument()
    expect(screen.queryByText('Saúde')).not.toBeInTheDocument()
    expect(screen.queryByText('Serviços utilizados')).not.toBeInTheDocument()
  })
})
