import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, renderAuthedApp } from '../../test/appRender.tsx'
import type { Permission } from '../../auth/permissions.ts'

/**
 * Fluxo ponta-a-ponta do CRUD de família (#51): cria, lê (lista + detalhe),
 * atualiza e exclui, tudo através da UI real (rotas, permissões, formulário
 * unificado) — não chama as funções de `familiaApi` diretamente. O "backend"
 * é um fetch mock com estado em memória, para que GET/POST/PUT/DELETE se
 * comportem de forma consistente entre si, como um servidor de verdade.
 */
function criarBackendFamilias() {
  const db: Record<string, unknown>[] = []
  let nextId = 1

  function toListItem(f: Record<string, unknown>) {
    return { id: f.id, nome: f.nome, dataCadastro: f.dataCadastro }
  }

  async function handler(url: string, init?: RequestInit): Promise<Response> {
    const u = new URL(url, 'http://localhost')

    if (u.pathname === '/api/servicos') {
      return jsonResponse([])
    }

    if (u.pathname === '/api/familias' && (!init?.method || init.method === 'GET')) {
      return jsonResponse({
        content: db.map(toListItem),
        page: 0,
        size: 10,
        totalElements: db.length,
        totalPages: db.length > 0 ? 1 : 0,
        first: true,
        last: true,
        sort: 'UNSORTED',
      })
    }

    if (u.pathname === '/api/familias' && init?.method === 'POST') {
      const body = JSON.parse(String(init.body))
      const criada = {
        ...body,
        id: nextId++,
        dataCadastro: '2026-11-18',
        telefones: (body.telefones ?? []).map((t: { numero: string }, i: number) => ({ id: i + 1, numero: t.numero })),
        enderecos: (body.enderecos ?? []).map((e: object, i: number) => ({ ...e, id: i + 1 })),
        dependentes: (body.dependentes ?? []).map((d: object, i: number) => ({ ...d, id: i + 1 })),
        problemasSaude: (body.problemasSaude ?? []).map((p: object, i: number) => ({ ...p, id: i + 1 })),
        medicamentos: (body.medicamentos ?? []).map((m: object, i: number) => ({ ...m, id: i + 1 })),
        substancias: (body.substancias ?? []).map((s: object, i: number) => ({ ...s, id: i + 1 })),
        situacaoSocioeconomica: body.situacaoSocioeconomica ?? null,
      }
      db.push(criada)
      return jsonResponse(criada, 201)
    }

    const matchId = u.pathname.match(/^\/api\/familias\/(\d+)$/)
    if (matchId) {
      const id = Number(matchId[1])
      const index = db.findIndex((f) => f.id === id)
      if (index === -1) {
        return jsonResponse({ message: 'Família não encontrada.' }, 404)
      }

      if (init?.method === 'PUT') {
        const body = JSON.parse(String(init.body))
        const atualizada = {
          ...body,
          id,
          dataCadastro: db[index].dataCadastro,
          telefones: (body.telefones ?? []).map((t: { numero: string }, i: number) => ({ id: i + 1, numero: t.numero })),
          enderecos: (body.enderecos ?? []).map((e: object, i: number) => ({ ...e, id: i + 1 })),
          dependentes: (body.dependentes ?? []).map((d: object, i: number) => ({ ...d, id: i + 1 })),
          problemasSaude: (body.problemasSaude ?? []).map((p: object, i: number) => ({ ...p, id: i + 1 })),
          medicamentos: (body.medicamentos ?? []).map((m: object, i: number) => ({ ...m, id: i + 1 })),
          substancias: (body.substancias ?? []).map((s: object, i: number) => ({ ...s, id: i + 1 })),
          situacaoSocioeconomica: body.situacaoSocioeconomica ?? null,
        }
        db[index] = atualizada
        return jsonResponse(atualizada)
      }

      if (init?.method === 'DELETE') {
        db.splice(index, 1)
        return new Response(null, { status: 204 })
      }

      return jsonResponse(db[index])
    }

    return jsonResponse({ message: `Rota inesperada: ${u.pathname}` }, 404)
  }

  return { handler }
}

const PERMISSOES_COMPLETAS: Permission[] = [
  'FAMILIA:READ',
  'FAMILIA:CREATE',
  'FAMILIA:UPDATE',
  'FAMILIA:DELETE',
]

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('CRUD de família ponta-a-ponta (#51)', () => {
  it('cria, lê, atualiza e exclui uma família pela UI real', { timeout: 15000 }, async () => {
    const backend = criarBackendFamilias()
    await renderAuthedApp({
      me: { permissions: PERMISSOES_COMPLETAS },
      path: '/familias',
      fetchHandler: backend.handler,
    })

    // 1. Listagem vazia + botão de criação visível.
    expect(await screen.findByRole('heading', { name: 'Famílias atendidas' })).toBeInTheDocument()
    expect(await screen.findByText('Nenhuma família encontrada')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Nova família' }))

    // 2. Formulário de criação: preenche nome + um telefone, envia.
    expect(await screen.findByRole('heading', { name: 'Cadastrar família' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: 'Família Teste E2E' } })

    fireEvent.click(screen.getAllByRole('button', { name: 'Adicionar' })[0])
    fireEvent.change(await screen.findByRole('textbox', { name: 'Número do telefone' }), { target: { value: '53999998888' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('53999998888')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    // 3. POST disparado e navegação para o detalhe recém-criado (id=1).
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/familias/1'))
    expect(await screen.findByRole('heading', { name: 'Família Teste E2E' })).toBeInTheDocument()
    expect(screen.getByText(/53999998888/)).toBeInTheDocument()

    // 4. Editar: navega para o formulário de edição com os dados pré-carregados.
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/familias/1/editar'))
    expect(await screen.findByRole('heading', { name: 'Editar família' })).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Família Teste E2E')).toBeInTheDocument()
    expect(screen.getByText('53999998888')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: 'Família Teste E2E Atualizada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    // 5. PUT disparado e navegação de volta ao detalhe, já atualizado.
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/familias/1'))
    expect(await screen.findByRole('heading', { name: 'Família Teste E2E Atualizada' })).toBeInTheDocument()

    // 6. Excluir com confirmação, DELETE e volta à listagem, agora vazia de novo.
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/familias'))
    expect(await screen.findByText('Nenhuma família encontrada')).toBeInTheDocument()
  })

  it('oculta "Nova família" e bloqueia /familias/nova sem FAMILIA:CREATE', async () => {
    const backend = criarBackendFamilias()
    await renderAuthedApp({
      me: { permissions: ['FAMILIA:READ'] },
      path: '/familias',
      fetchHandler: backend.handler,
    })

    await screen.findByRole('heading', { name: 'Famílias atendidas' })
    expect(screen.queryByRole('button', { name: 'Nova família' })).not.toBeInTheDocument()
  })

  it('redireciona /familias/nova e /familias/:id/editar para /403 sem permissão', async () => {
    const backend = criarBackendFamilias()
    await renderAuthedApp({
      me: { permissions: ['FAMILIA:READ'] },
      path: '/familias/nova',
      fetchHandler: backend.handler,
    })
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/403'))

    cleanup()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()

    await renderAuthedApp({
      me: { permissions: ['FAMILIA:READ'] },
      path: '/familias/1/editar',
      fetchHandler: backend.handler,
    })
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/403'))
  })
})
