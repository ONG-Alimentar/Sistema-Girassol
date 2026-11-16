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
}

/** Trata GET/DELETE de /api/familias/7; outros ids → 404. */
function familiaHandler(url: string, init?: RequestInit): Response {
  if (url.endsWith('/api/familias/7')) {
    if (init?.method === 'DELETE') return new Response(null, { status: 204 })
    return jsonResponse(familia)
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

    expect(await screen.findByText('Família Silva')).toBeInTheDocument()
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

    await screen.findByText('Família Silva')
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
    expect(screen.queryByText('Serviços da família')).not.toBeInTheDocument()
  })

  it('mostra o card de serviço permitido e navega com ?familia=:id', async () => {
    await open(['FAMILIA:READ', 'CESTA:READ'])

    fireEvent.click(await screen.findByText('Cestas básicas'))

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

  it('Editar mostra o toast de pendência (#51)', async () => {
    await open(['FAMILIA:READ', 'FAMILIA:UPDATE'])

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(await screen.findByText(/edição de famílias chega no #51/i)).toBeInTheDocument()
  })
})
