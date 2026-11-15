import { describe, expect, it } from 'vitest'
import { cargoLabel } from './cargo.ts'
import type { Permission } from './permissions.ts'

describe('cargoLabel — rótulo de Cargo derivado das permissões', () => {
  it('rotula como Admin quem tem CONTA:CREATE (precede os demais)', () => {
    // Admin tem todas as permissões; mesmo com FAMILIA:READ deve ser "Admin".
    const perms: Permission[] = ['CONTA:CREATE', 'FAMILIA:READ', 'JURIDICO:READ']
    expect(cargoLabel(perms)).toBe('Admin')
  })

  it('rotula como Assistente social quem tem FAMILIA:READ sem CONTA:CREATE', () => {
    expect(cargoLabel(['FAMILIA:READ', 'CESTA:READ'])).toBe('Assistente social')
  })

  it('rotula o jurídico e o psicológico pelos seus READ', () => {
    expect(cargoLabel(['JURIDICO:READ'])).toBe('Jurídico')
    expect(cargoLabel(['PSICOLOGICO:READ'])).toBe('Psicológico')
  })

  it('rotula como Voluntário quem só tem cestas/roupas/visitas', () => {
    expect(cargoLabel(['CESTA:READ', 'ROUPA:READ', 'VISITA:READ'])).toBe('Voluntário')
  })

  it('cai no fallback "Usuário" sem permissões conhecidas', () => {
    expect(cargoLabel([])).toBe('Usuário')
    expect(cargoLabel(undefined)).toBe('Usuário')
  })
})
