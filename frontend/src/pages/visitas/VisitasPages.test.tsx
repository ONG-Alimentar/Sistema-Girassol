import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, renderAuthedApp } from '../../test/appRender.tsx'
import type { Visita } from '../../api/visitas'

const visita: Visita = {
  id: 5, data: '2026-11-21', turno: 'MANHA', nome: 'Maria Silva', idade: 35,
  contato: null, situacao: 'OUTRO', motivoDaProcura: 'Solicitação de atendimento',
  pedidoAtendido: false, observacoes: 'Retorno combinado',
}
const page = (content: Visita[]) => ({
  content, page: 0, size: 10, totalElements: content.length,
  totalPages: content.length ? 1 : 0, first: true, last: true, sort: 'UNSORTED',
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('Registro de visitas (#10)', () => {
  it('abre o menu e navega à listagem sem oferecer cadastro a quem só consulta', async () => {
    await renderAuthedApp({ me: { permissions: ['VISITA:READ'] }, path: '/visitas',
      fetchHandler: () => jsonResponse(page([])) })
    expect(await screen.findByRole('heading', { name: 'Registro de visitas' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cadastrar nova visita' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Consultar visitas registradas' }))
    expect(await screen.findByRole('heading', { name: 'Visitas' })).toBeInTheDocument()
  })

  it('lista em cards, busca pelo nome e abre o detalhe', async () => {
    const handler = vi.fn((url: string) => url.endsWith('/api/visitas/5') ? jsonResponse(visita) : jsonResponse(page([visita])))
    await renderAuthedApp({ me: { permissions: ['VISITA:READ'] }, path: '/visitas/listagem', fetchHandler: handler })
    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Digite um nome...'), { target: { value: 'Maria' } })
    await waitFor(() => expect(handler.mock.calls.some(([url]) => url.includes('q=Maria'))).toBe(true))
    fireEvent.click(await screen.findByText('Maria Silva'))
    expect(await screen.findByRole('heading', { name: 'Detalhes da visita' })).toBeInTheDocument()
    expect(await screen.findByText('Retorno combinado')).toBeInTheDocument()
    expect(screen.getByText('Não')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
  })

  it('valida nome e cadastra com resposta Não sem convertê-la em null', async () => {
    const handler = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') return jsonResponse(visita, 201)
      return url.endsWith('/api/visitas/5') ? jsonResponse(visita) : jsonResponse({}, 404)
    })
    await renderAuthedApp({ me: { permissions: ['VISITA:READ', 'VISITA:CREATE'] }, path: '/visitas/nova', fetchHandler: handler })
    fireEvent.click(await screen.findByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('O nome é obrigatório.')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: /nome do visitante/i }), { target: { value: 'Maria Silva' } })
    fireEvent.click(screen.getByRole('radio', { name: 'Não' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/visitas/5'))
    const request = handler.mock.calls.find(([, init]) => init?.method === 'POST')?.[1]
    expect(JSON.parse(String(request?.body))).toMatchObject({ nome: 'Maria Silva', pedidoAtendido: false, idade: null })
    expect(JSON.parse(String(request?.body))).not.toHaveProperty('criadoPor')
  })

  it('exclui somente após confirmação e retorna à listagem', async () => {
    const handler = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') return new Response(null, { status: 204 })
      return url.endsWith('/api/visitas/5') ? jsonResponse(visita) : jsonResponse(page([]))
    })
    await renderAuthedApp({ me: { permissions: ['VISITA:READ', 'VISITA:DELETE'] }, path: '/visitas/5', fetchHandler: handler })
    fireEvent.click(await screen.findByRole('button', { name: 'Excluir' }))
    const dialog = await screen.findByRole('dialog')
    expect(handler.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/visitas/listagem'))
    expect(handler.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(true)
  })

  it('bloqueia o acesso direto ao cadastro sem VISITA:CREATE', async () => {
    await renderAuthedApp({ me: { permissions: ['VISITA:READ'] }, path: '/visitas/nova' })
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/403'))
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument()
  })
})
