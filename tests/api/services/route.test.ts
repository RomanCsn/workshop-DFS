import type { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/services', () => ({
  createPerformedService: vi.fn(),
  getAllPerformedServices: vi.fn(),
  updatePerformedService: vi.fn(),
  deletePerformedService: vi.fn(),
}));

import { GET, POST, PUT, DELETE } from '@/app/api/services/route';
import {
  createPerformedService,
  getAllPerformedServices,
  updatePerformedService,
  deletePerformedService,
} from '@/utils/services';

const createRequest = (url: string): NextRequest => ({
  url,
} as unknown as NextRequest);

const createJsonRequest = <TBody>(url: string, body: TBody) => {
  const json = vi.fn().mockResolvedValue(body);
  return [{ url, json } as unknown as NextRequest, json] as const;
};

describe('Services API route', () => {
  it('GET returns services with default pagination', async () => {
    const services = [{ id: 'svc-1' }];
    vi.mocked(getAllPerformedServices).mockResolvedValueOnce(services as any);

    const response = await GET(createRequest('http://localhost/api/services'));

    expect(getAllPerformedServices).toHaveBeenCalledWith(100, 0);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: services });
  });

  it('GET rejects invalid query params', async () => {
    const response = await GET(createRequest('http://localhost/api/services?take=-5'));

    expect(getAllPerformedServices).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.success).toBe(false);
    expect(payload.error).toBe('Invalid query parameters');
  });

  it('GET handles underlying errors', async () => {
    vi.mocked(getAllPerformedServices).mockRejectedValueOnce(new Error('boom'));

    const response = await GET(createRequest('http://localhost/api/services'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'boom',
    });
  });

  it('POST creates a service when payload is valid', async () => {
    const body = {
      serviceType: 'LESSON',
      billingId: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      serviceId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 15,
    } as const;
    const created = { id: 'svc-1', ...body };
    vi.mocked(createPerformedService).mockResolvedValueOnce(created as any);

    const [request, jsonSpy] = createJsonRequest('http://localhost/api/services', body);
    const response = await POST(request);

    expect(jsonSpy).toHaveBeenCalledTimes(1);
    expect(createPerformedService).toHaveBeenCalledWith(body);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ success: true, data: created });
  });

  it('POST rejects invalid payloads', async () => {
    const invalidBody = { amount: -3 };
    const [request] = createJsonRequest('http://localhost/api/services', invalidBody);

    const response = await POST(request);

    expect(createPerformedService).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: 'Invalid data' });
  });

  it('POST surfaces handler errors', async () => {
    vi.mocked(createPerformedService).mockRejectedValueOnce(new Error('db down'));

    const body = {
      serviceType: 'CARE',
      billingId: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
      userId: '6fa459ea-ee8a-3ca4-894e-db77e160355e',
      serviceId: '7d444840-9dc0-11d1-b245-5ffdce74fad2',
      amount: 42,
    };
    const [request] = createJsonRequest('http://localhost/api/services', body);

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: 'db down' });
  });

  it('PUT updates a service when payload is valid', async () => {
    const body = {
      id: '9a1f0f86-3f0b-4f6b-9f0b-7c3d5e2a1b2c',
      amount: 99,
    } as const;
    const updated = { id: body.id, amount: 99 };
    vi.mocked(updatePerformedService).mockResolvedValueOnce(updated as any);

    const [request, jsonSpy] = createJsonRequest('http://localhost/api/services', body);
    const response = await PUT(request);

    expect(jsonSpy).toHaveBeenCalledTimes(1);
    expect(updatePerformedService).toHaveBeenCalledWith(body.id, { amount: 99 });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: updated });
  });

  it('PUT rejects invalid payloads', async () => {
    const [request] = createJsonRequest('http://localhost/api/services', { amount: 5 });

    const response = await PUT(request);

    expect(updatePerformedService).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: 'Invalid data' });
  });

  it('PUT surfaces handler errors', async () => {
    vi.mocked(updatePerformedService).mockRejectedValueOnce(new Error('nope'));

    const body = {
      id: 'b2d3f5a1-4c6e-7d8f-9a1b-2c3d4e5f6071',
      amount: 10,
    };
    const [request] = createJsonRequest('http://localhost/api/services', body);

    const response = await PUT(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: 'nope' });
  });

  it('DELETE removes a service when id is valid', async () => {
    const service = { id: 'svc-33' };
    vi.mocked(deletePerformedService).mockResolvedValueOnce(service as any);

    const response = await DELETE(
      createRequest('http://localhost/api/services?id=3fa85f64-5717-4562-b3fc-2c963f66afa6')
    );

    expect(deletePerformedService).toHaveBeenCalledWith('3fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: service,
      message: 'Service deleted successfully',
    });
  });

  it('DELETE rejects requests without a valid id', async () => {
    const response = await DELETE(createRequest('http://localhost/api/services'));

    expect(deletePerformedService).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: 'Invalid or missing ID' });
  });

  it('DELETE surfaces handler errors', async () => {
    vi.mocked(deletePerformedService).mockRejectedValueOnce(new Error('gone'));

    const response = await DELETE(
      createRequest('http://localhost/api/services?id=16fd2706-8baf-433b-82eb-8c7fada847da')
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: 'gone' });
  });
});
