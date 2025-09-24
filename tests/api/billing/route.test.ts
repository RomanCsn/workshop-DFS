import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/billing", () => ({
  createBilling: vi.fn(),
  getAllBillings: vi.fn(),
  updateBilling: vi.fn(),
  deleteBilling: vi.fn(),
  getBillingById: vi.fn(),
  getBillingWithServices: vi.fn(),
  getBillingsByDateRange: vi.fn(),
}));

import { GET, POST, PUT, DELETE } from "@/app/api/billing/route";
import {
  createBilling,
  getAllBillings,
  updateBilling,
  deleteBilling,
  getBillingById,
  getBillingWithServices,
  getBillingsByDateRange,
} from "@/utils/billing";

const createRequest = (url: string): NextRequest =>
  ({
    url,
  }) as unknown as NextRequest;

const createJsonRequest = <TBody>(url: string, body: TBody) => {
  const json = vi.fn().mockResolvedValue(body);
  return [{ url, json } as unknown as NextRequest, json] as const;
};

describe("Billing API route", () => {
  it("GET returns paginated billings by default", async () => {
    const billings = [{ id: "bil-1" }];
    vi.mocked(getAllBillings).mockResolvedValueOnce(billings as any);

    const response = await GET(createRequest("http://localhost/api/billing"));
    const payload = await response.json();

    expect(getAllBillings).toHaveBeenCalledWith(100, 0);
    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true, data: billings });
  });

  it("GET rejects invalid pagination params", async () => {
    const response = await GET(
      createRequest("http://localhost/api/billing?take=2001"),
    );

    expect(getAllBillings).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Invalid query parameters",
    });
  });

  it("GET fetches billing by id when provided", async () => {
    const billing = { id: "550e8400-e29b-41d4-a716-446655440000" };
    vi.mocked(getBillingById).mockResolvedValueOnce(billing as any);

    const response = await GET(
      createRequest(
        "http://localhost/api/billing?id=550e8400-e29b-41d4-a716-446655440000",
      ),
    );

    expect(getBillingById).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(getBillingWithServices).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: billing,
    });
  });

  it("GET can include services when requested", async () => {
    const billing = {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      services: [],
    };
    vi.mocked(getBillingWithServices).mockResolvedValueOnce(billing as any);

    const response = await GET(
      createRequest(
        "http://localhost/api/billing?id=f47ac10b-58cc-4372-a567-0e02b2c3d479&includeServices=true",
      ),
    );

    expect(getBillingWithServices).toHaveBeenCalledWith(
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: billing,
    });
  });

  it("GET returns 404 when billing is not found", async () => {
    vi.mocked(getBillingById).mockResolvedValueOnce(null);

    const response = await GET(
      createRequest(
        "http://localhost/api/billing?id=123e4567-e89b-12d3-a456-426614174000",
      ),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Billing not found",
    });
  });

  it("GET retrieves billings by date range", async () => {
    const billings = [{ id: "range" }];
    vi.mocked(getBillingsByDateRange).mockResolvedValueOnce(billings as any);

    const response = await GET(
      createRequest(
        "http://localhost/api/billing?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T00:00:00.000Z&take=50&skip=5",
      ),
    );

    expect(getBillingsByDateRange).toHaveBeenCalledTimes(1);
    const [start, end, take, skip] = vi.mocked(getBillingsByDateRange).mock
      .calls[0]!;
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(start.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2024-01-31T00:00:00.000Z");
    expect(take).toBe(50);
    expect(skip).toBe(5);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: billings,
    });
  });

  it("GET rejects when startDate is after endDate", async () => {
    const response = await GET(
      createRequest(
        "http://localhost/api/billing?startDate=2024-02-01T00:00:00.000Z&endDate=2024-01-01T00:00:00.000Z",
      ),
    );

    expect(getBillingsByDateRange).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "startDate must be before endDate",
    });
  });

  it("GET surfaces underlying errors", async () => {
    vi.mocked(getAllBillings).mockRejectedValueOnce(new Error("db exploded"));

    const response = await GET(createRequest("http://localhost/api/billing"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "db exploded",
    });
  });

  it("POST creates a billing when payload is valid", async () => {
    const body = { date: "2024-03-01T00:00:00.000Z" } as const;
    const created = { id: "bil-42", date: new Date(body.date) };
    vi.mocked(createBilling).mockResolvedValueOnce(created as any);

    const [request, jsonSpy] = createJsonRequest(
      "http://localhost/api/billing",
      body,
    );
    const response = await POST(request);
    const payload = await response.json();

    expect(jsonSpy).toHaveBeenCalledTimes(1);
    expect(createBilling).toHaveBeenCalledWith(
      expect.objectContaining({ date: expect.any(Date) }),
    );
    const [[callArg]] = vi.mocked(createBilling).mock.calls;
    expect(callArg.date.toISOString()).toBe(body.date);
    expect(response.status).toBe(201);
    expect(payload).toEqual({
      success: true,
      data: { ...created, date: created.date.toISOString() },
    });
  });

  it("POST rejects invalid payloads", async () => {
    const [request] = createJsonRequest("http://localhost/api/billing", {
      date: "not-a-date",
    });

    const response = await POST(request);

    expect(createBilling).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Invalid data",
    });
  });

  it("POST surfaces handler errors", async () => {
    vi.mocked(createBilling).mockRejectedValueOnce(new Error("cannot create"));

    const [request] = createJsonRequest("http://localhost/api/billing", {
      date: "2024-03-01T00:00:00.000Z",
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "cannot create",
    });
  });

  it("PUT updates an existing billing", async () => {
    const body = {
      id: "16fd2706-8baf-433b-82eb-8c7fada847da",
      date: "2024-04-01T00:00:00.000Z",
    } as const;
    const updated = { id: body.id, date: new Date(body.date) };
    vi.mocked(updateBilling).mockResolvedValueOnce(updated as any);

    const [request, jsonSpy] = createJsonRequest(
      "http://localhost/api/billing",
      body,
    );
    const response = await PUT(request);
    const payload = await response.json();

    expect(jsonSpy).toHaveBeenCalledTimes(1);
    expect(updateBilling).toHaveBeenCalledWith(
      body.id,
      expect.objectContaining({ date: expect.any(Date) }),
    );
    const [[, updateArg]] = vi.mocked(updateBilling).mock.calls;
    expect(updateArg.date?.toISOString()).toBe(body.date);
    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      data: { ...updated, date: updated.date.toISOString() },
    });
  });

  it("PUT rejects invalid payloads", async () => {
    const [request] = createJsonRequest("http://localhost/api/billing", {
      date: "2024-04-01T00:00:00.000Z",
    });

    const response = await PUT(request);

    expect(updateBilling).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Invalid data",
    });
  });

  it("PUT surfaces handler errors", async () => {
    vi.mocked(updateBilling).mockRejectedValueOnce(new Error("cannot update"));

    const [request] = createJsonRequest("http://localhost/api/billing", {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      date: "2024-04-02T00:00:00.000Z",
    });

    const response = await PUT(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "cannot update",
    });
  });

  it("DELETE removes a billing when id is valid", async () => {
    const billing = { id: "bil-55" };
    vi.mocked(deleteBilling).mockResolvedValueOnce(billing as any);

    const response = await DELETE(
      createRequest(
        "http://localhost/api/billing?id=6fa459ea-ee8a-3ca4-894e-db77e160355e",
      ),
    );

    expect(deleteBilling).toHaveBeenCalledWith(
      "6fa459ea-ee8a-3ca4-894e-db77e160355e",
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: billing,
      message: "Billing deleted successfully",
    });
  });

  it("DELETE rejects missing id", async () => {
    const response = await DELETE(
      createRequest("http://localhost/api/billing"),
    );

    expect(deleteBilling).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Invalid or missing ID",
    });
  });

  it("DELETE surfaces handler errors", async () => {
    vi.mocked(deleteBilling).mockRejectedValueOnce(new Error("cannot delete"));

    const response = await DELETE(
      createRequest(
        "http://localhost/api/billing?id=b2d3f5a1-4c6e-7d8f-9a1b-2c3d4e5f6071",
      ),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "cannot delete",
    });
  });
});
