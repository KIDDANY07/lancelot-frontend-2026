import { describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { configService } from '@/services/configService'
import { createApiError } from '@/test/apiErrors'

vi.mock('@/lib/apiClient', () => ({ apiClient: { http: { get: vi.fn() } } }))

describe('configService.listOverrides', () => {
  it('devuelve una lista vacía cuando no hay configuraciones por categoría', async () => {
    vi.mocked(apiClient.http.get).mockRejectedValueOnce(
      createApiError(404, {
        status: 'Error',
        mensaje: 'No hay umbrales de ACWR configurados por categoría',
      }),
    )
    await expect(configService.listOverrides('acwr')).resolves.toEqual([])
  })

  it('propaga los demás errores', async () => {
    vi.mocked(apiClient.http.get).mockRejectedValueOnce(
      createApiError(500, { status: 'Error', mensaje: 'Fallo del servidor' }),
    )
    await expect(configService.listOverrides('acwr')).rejects.toBeTruthy()
  })
})
