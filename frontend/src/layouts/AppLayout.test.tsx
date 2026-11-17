import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderAuthedApp } from '../test/appRender.tsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('AppLayout — chrome mobile', () => {
  it('mostra a bottom tab bar (Início / Famílias / Mais)', async () => {
    await renderAuthedApp({ me: { permissions: ['FAMILIA:READ'] } })

    expect(await screen.findByRole('button', { name: 'Início' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mais' })).toBeInTheDocument()
  })

  it('a aba Famílias da bottom bar respeita a permissão (Voluntário não a vê)', async () => {
    await renderAuthedApp({ me: { permissions: ['CESTA:READ', 'ROUPA:READ', 'VISITA:READ'] } })

    expect(await screen.findByRole('button', { name: 'Início' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mais' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Famílias' })).not.toBeInTheDocument()
  })

  it('o hambúrguer abre o drawer com os módulos permitidos (Admin vê Usuários)', async () => {
    await renderAuthedApp({ me: { permissions: ['CONTA:CREATE', 'USUARIO:READ', 'FAMILIA:READ'] } })

    fireEvent.click(await screen.findByRole('button', { name: 'Abrir menu' }))

    expect(await screen.findByRole('link', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Famílias' })).toBeInTheDocument()
  })

  it('o drawer oculta módulos sem permissão (Voluntário não vê Usuários)', async () => {
    await renderAuthedApp({ me: { permissions: ['CESTA:READ', 'ROUPA:READ', 'VISITA:READ'] } })

    fireEvent.click(await screen.findByRole('button', { name: 'Abrir menu' }))

    expect(await screen.findByRole('link', { name: 'Cestas básicas' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Usuários' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Famílias' })).not.toBeInTheDocument()
  })

  it('"Mais" também abre o drawer', async () => {
    await renderAuthedApp({ me: { permissions: ['FAMILIA:READ'] } })

    fireEvent.click(await screen.findByRole('button', { name: 'Mais' }))

    expect(await screen.findByRole('link', { name: 'Famílias' })).toBeInTheDocument()
  })
})
