import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderAuthedApp } from '../test/appRender.tsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('DashboardPage — home por Cargo', () => {
  it('saúda pelo cargo derivado e mostra o atalho de Usuários para Admin', async () => {
    await renderAuthedApp({ me: {
      permissions: ['CONTA:CREATE', 'USUARIO:READ', 'FAMILIA:READ'],
      cargos: ['ADMINISTRADOR'],
    } })

    expect(await screen.findByRole('heading', { name: 'Olá, Admin!' })).toBeInTheDocument()
    // Atalhos permitidos aparecem; "Usuários" (administração RBAC) exige USUARIO:READ.
    expect(screen.getByRole('heading', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Famílias' })).toBeInTheDocument()
  })

  it('oculta atalhos não permitidos (Voluntário não vê Usuários)', async () => {
    await renderAuthedApp({ me: {
      permissions: ['CESTA:READ', 'ROUPA:READ', 'VISITA:READ'],
      cargos: ['VOLUNTARIO_INTERNO'],
    } })

    expect(await screen.findByRole('heading', { name: 'Olá, Voluntário!' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cestas básicas' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Usuários' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Famílias' })).not.toBeInTheDocument()
  })
})
