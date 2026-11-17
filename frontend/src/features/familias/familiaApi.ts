
import { apiFetch } from '../../api/client';
import type { FamiliaRequest, FamiliaResponse } from './types';

const BASE_PATH = '/api/familias';

export function getFamilia(
  id: number
): Promise<FamiliaResponse> {
  return apiFetch<FamiliaResponse>(`${BASE_PATH}/${id}`);
}

export function createFamilia(
  data: FamiliaRequest
): Promise<FamiliaResponse> {
  return apiFetch<FamiliaResponse>(BASE_PATH, {
    method: 'POST',
    body: data,
  });
}

export function updateFamilia(
  id: number,
  data: FamiliaRequest
): Promise<FamiliaResponse> {
  return apiFetch<FamiliaResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: data,
  });
}
