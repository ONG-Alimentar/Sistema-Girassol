import { describe, expect, it } from 'vitest'
import { cargoLabel } from './cargo.ts'

describe('cargoLabel — rótulo de Cargo a partir dos cargos reais', () => {
  it('saúda pelo cargo de maior alcance quando há vários', () => {
    expect(cargoLabel(['ASSISTENTE_SOCIAL', 'ADMINISTRADOR'])).toBe('Admin')
  })

  it('mapeia cada cargo conhecido ao seu rótulo', () => {
    expect(cargoLabel(['ASSISTENTE_SOCIAL'])).toBe('Assistente social')
    expect(cargoLabel(['ADVOGADA'])).toBe('Jurídico')
    expect(cargoLabel(['PSICOLOGO'])).toBe('Psicológico')
    expect(cargoLabel(['VOLUNTARIO_INTERNO'])).toBe('Voluntário')
  })

  it('mostra o próprio nome para cargo fora do catálogo conhecido', () => {
    expect(cargoLabel(['GERENTE'])).toBe('GERENTE')
  })

  it('cai no fallback "Usuário" sem cargos', () => {
    expect(cargoLabel([])).toBe('Usuário')
    expect(cargoLabel(undefined)).toBe('Usuário')
  })
})
