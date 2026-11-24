import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, renderAuthedApp } from '../../test/appRender.tsx'

const page = (content: unknown[]) => ({
  content, page: 0, size: 10, totalElements: content.length,
  totalPages: content.length === 0 ? 0 : 1, first: true, last: true, sort: 'UNSORTED',
})

const cargoAdmin = { id: 1, nome: 'ADMINISTRADOR', totalUsuarios: 1, permissoes: [] }
const cargoGerente = { id: 2, nome: 'GERENTE', totalUsuarios: 0, permissoes: [] }

const usuario = {
  id: 7, nome: 'Ana Gestora', email: 'ana@ong.org', ativo: true,
  cargos: [{ id: 1, nome: 'ADMINISTRADOR' }],
}

const permissaoLeitura = { id: 9, codigo: 'FAMILIA:READ' }
const cargo = { id: 2, nome: 'GERENTE', totalUsuarios: 0, permissoes: [permissaoLeitura] }

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('UsuarioFormPage — cadastro/edição (#3)', () => {
  it('oculta "Novo usuário" sem USUARIO:CREATE', async () => {
    await renderAuthedApp({
      me: { permissions: ['USUARIO:READ'] },
      path: '/admin/usuarios',
      fetchHandler: (url) => (url.includes('/api/usuarios') ? jsonResponse(page([usuario])) : jsonResponse({}, 404)),
    })
    await screen.findByText('ana@ong.org')
    expect(screen.queryByRole('button', { name: /novo usuário/i })).not.toBeInTheDocument()
  })

  it('cadastra um usuário com nome, e-mail, senha e cargo e navega ao detalhe', async () => {
    let posted: unknown
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/cargos')) return jsonResponse(page([cargoAdmin, cargoGerente]))
      if (url.endsWith('/api/usuarios') && init?.method === 'POST') {
        posted = JSON.parse(String(init.body))
        return jsonResponse({ ...usuario, id: 99 }, 201)
      }
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['USUARIO:CREATE', 'USUARIO:READ'] },
      path: '/admin/usuarios/novo',
      fetchHandler: fetchMock,
    })

    expect(await screen.findByRole('heading', { name: 'Cadastrar usuário' })).toBeInTheDocument()
    await screen.findByText('ADMINISTRADOR')

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: 'Carlos Novo' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'E-mail' }), { target: { value: 'carlos@ong.org' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Senha' }), { target: { value: 'senha1234' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'GERENTE' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/admin/usuarios/99'))
    expect(posted).toEqual({
      nome: 'Carlos Novo', email: 'carlos@ong.org', senha: 'senha1234', cargoIds: [2], ativo: true,
    })
  })

  it('bloqueia o envio sem senha ao criar', async () => {
    await renderAuthedApp({
      me: { permissions: ['USUARIO:CREATE'] },
      path: '/admin/usuarios/novo',
      fetchHandler: (url) => (url.includes('/api/cargos') ? jsonResponse(page([])) : jsonResponse({}, 404)),
    })

    fireEvent.change(await screen.findByRole('textbox', { name: 'Nome' }), { target: { value: 'Carlos' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'E-mail' }), { target: { value: 'carlos@ong.org' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('A senha é obrigatória ao criar um usuário.')).toBeInTheDocument()
  })

  it('edita um usuário existente (senha em branco mantém a atual) e envia PUT', async () => {
    let putted: unknown
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/cargos')) return jsonResponse(page([cargoAdmin, cargoGerente]))
      if (url.endsWith('/api/usuarios/7') && (!init || init.method === undefined || init.method === 'GET')) {
        return jsonResponse(usuario)
      }
      if (url.endsWith('/api/usuarios/7') && init?.method === 'PUT') {
        putted = JSON.parse(String(init.body))
        return jsonResponse(usuario)
      }
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['USUARIO:UPDATE', 'USUARIO:READ'] },
      path: '/admin/usuarios/7/editar',
      fetchHandler: fetchMock,
    })

    expect(await screen.findByRole('heading', { name: 'Editar usuário' })).toBeInTheDocument()
    expect(await screen.findByRole('textbox', { name: 'Nome' })).toHaveValue('Ana Gestora')
    expect(screen.getByRole('checkbox', { name: 'ADMINISTRADOR' })).toBeChecked()

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: 'Ana Editada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/admin/usuarios/7'))
    expect(putted).toEqual({
      nome: 'Ana Editada', email: 'ana@ong.org', senha: null, cargoIds: [1], ativo: true,
    })
  })

  it('oculta Editar/Excluir sem permissão e exclui com confirmação quando permitido', async () => {
    function handler(url: string, init?: RequestInit) {
      if (url.endsWith('/api/usuarios/7') && init?.method === 'DELETE') return new Response(null, { status: 204 })
      if (url.endsWith('/api/usuarios/7')) return jsonResponse(usuario)
      if (url.includes('/api/usuarios')) return jsonResponse(page([]))
      return jsonResponse({}, 404)
    }

    await renderAuthedApp({
      me: { permissions: ['USUARIO:READ'] },
      path: '/admin/usuarios/7',
      fetchHandler: handler,
    })
    await screen.findByText('ana@ong.org')
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
    cleanup()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()

    await renderAuthedApp({
      me: { permissions: ['USUARIO:READ', 'USUARIO:UPDATE', 'USUARIO:DELETE'] },
      path: '/admin/usuarios/7',
      fetchHandler: handler,
    })
    await screen.findByText('ana@ong.org')
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/admin/usuarios'))
  })
})

describe('CargoFormPage — cadastro/edição (#3)', () => {
  it('oculta "Novo cargo" sem CARGO:CREATE', async () => {
    await renderAuthedApp({
      me: { permissions: ['CARGO:READ'] },
      path: '/admin/cargos',
      fetchHandler: (url) => (url.includes('/api/cargos') ? jsonResponse(page([cargo])) : jsonResponse({}, 404)),
    })
    await screen.findByText('GERENTE')
    expect(screen.queryByRole('button', { name: /novo cargo/i })).not.toBeInTheDocument()
  })

  it('cadastra um cargo com nome e permissões e navega ao detalhe', async () => {
    let posted: unknown
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/permissoes')) return jsonResponse(page([permissaoLeitura]))
      if (url.endsWith('/api/cargos') && init?.method === 'POST') {
        posted = JSON.parse(String(init.body))
        return jsonResponse({ ...cargo, id: 50 }, 201)
      }
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['CARGO:CREATE', 'CARGO:READ'] },
      path: '/admin/cargos/novo',
      fetchHandler: fetchMock,
    })

    expect(await screen.findByRole('heading', { name: 'Cadastrar cargo' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: 'Voluntário' } })
    fireEvent.click(await screen.findByRole('checkbox', { name: 'FAMILIA:READ' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/admin/cargos/50'))
    expect(posted).toEqual({ nome: 'Voluntário', permissaoIds: [9] })
  })

  it('bloqueia o envio sem nome', async () => {
    await renderAuthedApp({
      me: { permissions: ['CARGO:CREATE'] },
      path: '/admin/cargos/novo',
      fetchHandler: (url) => (url.includes('/api/permissoes') ? jsonResponse(page([])) : jsonResponse({}, 404)),
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Cadastrar' }))
    expect(await screen.findByText('O nome é obrigatório.')).toBeInTheDocument()
  })

  it('edita um cargo existente e envia PUT', async () => {
    let putted: unknown
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/permissoes')) return jsonResponse(page([permissaoLeitura]))
      if (url.endsWith('/api/cargos/2') && init?.method === 'PUT') {
        putted = JSON.parse(String(init.body))
        return jsonResponse(cargo)
      }
      if (url.endsWith('/api/cargos/2')) return jsonResponse(cargo)
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['CARGO:UPDATE', 'CARGO:READ'] },
      path: '/admin/cargos/2/editar',
      fetchHandler: fetchMock,
    })

    expect(await screen.findByRole('heading', { name: 'Editar cargo' })).toBeInTheDocument()
    expect(await screen.findByRole('checkbox', { name: 'FAMILIA:READ' })).toBeChecked()

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: 'Gerente Sênior' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/admin/cargos/2'))
    expect(putted).toEqual({ nome: 'Gerente Sênior', permissaoIds: [9] })
  })

  it('exclui com confirmação (DELETE) e volta à listagem', async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.endsWith('/api/cargos/2') && init?.method === 'DELETE') return new Response(null, { status: 204 })
      if (url.endsWith('/api/cargos/2')) return jsonResponse(cargo)
      if (url.includes('/api/cargos')) return jsonResponse(page([]))
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['CARGO:READ', 'CARGO:DELETE'] },
      path: '/admin/cargos/2',
      fetchHandler: fetchMock,
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Excluir' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/admin/cargos'))
  })
})
