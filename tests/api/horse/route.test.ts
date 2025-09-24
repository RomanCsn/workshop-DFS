import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  horse: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const PrismaClientMock = vi.hoisted(() => vi.fn(() => mockPrisma));

vi.mock("@/generated/prisma", () => ({
  PrismaClient: PrismaClientMock,
}));

import { DELETE, GET, PATCH, PUT } from "@/app/api/horse/route";

const createRequest = (url: string): NextRequest =>
  ({
    url,
  }) as unknown as NextRequest;

const createJsonRequest = <TBody>(url: string, body: TBody) => {
  const json = vi.fn().mockResolvedValue(body);
  return [{ url, json } as unknown as NextRequest, json] as const;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.horse.findMany.mockReset();
  mockPrisma.horse.create.mockReset();
  mockPrisma.horse.update.mockReset();
  mockPrisma.horse.delete.mockReset();
});

describe("Horse API route", () => {
  describe("GET", () => {
    it("returns horses for a given owner", async () => {
      const horses = [{ id: "horse-1" }];
      mockPrisma.horse.findMany.mockResolvedValueOnce(horses as any);

      const response = await GET(
        createRequest("http://localhost/api/horse?ownerId=owner-1"),
      );
      const payload = await response.json();

      expect(mockPrisma.horse.findMany).toHaveBeenCalledWith({
        where: { ownerId: "owner-1" },
      });
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: horses });
    });

    it("rejects requests without a valid ownerId", async () => {
      const response = await GET(createRequest("http://localhost/api/horse"));
      const payload = await response.json();

      expect(mockPrisma.horse.findMany).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.errors).toBeDefined();
    });

    it("surfaces database errors", async () => {
      mockPrisma.horse.findMany.mockRejectedValueOnce(new Error("boom"));

      const response = await GET(
        createRequest("http://localhost/api/horse?ownerId=owner-2"),
      );
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "boom" });
    });
  });

  describe("PUT", () => {
    it("creates a horse when payload is valid", async () => {
      const body = { ownerId: "owner-3", name: "Spirit" } as const;
      const created = { id: "horse-7", ...body };
      mockPrisma.horse.create.mockResolvedValueOnce(created as any);

      const [request, jsonSpy] = createJsonRequest(
        "http://localhost/api/horse",
        body,
      );
      const response = await PUT(request);
      const payload = await response.json();

      expect(jsonSpy).toHaveBeenCalledTimes(1);
      expect(mockPrisma.horse.create).toHaveBeenCalledWith({
        data: { ownerId: body.ownerId, name: body.name },
      });
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: created });
    });

    it("rejects invalid payloads", async () => {
      const [request] = createJsonRequest("http://localhost/api/horse", {
        name: "Spirit",
      });

      const response = await PUT(request);
      const payload = await response.json();

      expect(mockPrisma.horse.create).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.errors).toBeDefined();
    });

    it("handles create errors", async () => {
      mockPrisma.horse.create.mockRejectedValueOnce(new Error("nope"));

      const [request] = createJsonRequest("http://localhost/api/horse", {
        ownerId: "owner-5",
      });

      const response = await PUT(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "nope" });
    });
  });

  describe("PATCH", () => {
    it("updates a horse with valid data", async () => {
      const body = { id: "horse-9", name: "New Name" } as const;
      const updated = { id: body.id, name: body.name };
      mockPrisma.horse.update.mockResolvedValueOnce(updated as any);

      const [request, jsonSpy] = createJsonRequest(
        "http://localhost/api/horse",
        body,
      );
      const response = await PATCH(request);
      const payload = await response.json();

      expect(jsonSpy).toHaveBeenCalledTimes(1);
      expect(mockPrisma.horse.update).toHaveBeenCalledWith({
        where: { id: body.id },
        data: { name: body.name, ownerId: undefined },
      });
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: updated });
    });

    it("rejects updates without an id", async () => {
      const [request] = createJsonRequest("http://localhost/api/horse", {
        name: "Nameless",
      });

      const response = await PATCH(request);
      const payload = await response.json();

      expect(mockPrisma.horse.update).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.errors).toBeDefined();
    });

    it("handles update errors", async () => {
      mockPrisma.horse.update.mockRejectedValueOnce(new Error("fail"));

      const [request] = createJsonRequest("http://localhost/api/horse", {
        id: "horse-12",
        ownerId: "owner-10",
      });

      const response = await PATCH(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "fail" });
    });
  });

  describe("DELETE", () => {
    it("deletes a horse when id is valid", async () => {
      const body = { id: "horse-14" };
      const deleted = { id: "horse-14" };
      mockPrisma.horse.delete.mockResolvedValueOnce(deleted as any);

      const [request, jsonSpy] = createJsonRequest(
        "http://localhost/api/horse",
        body,
      );
      const response = await DELETE(request);
      const payload = await response.json();

      expect(jsonSpy).toHaveBeenCalledTimes(1);
      expect(mockPrisma.horse.delete).toHaveBeenCalledWith({
        where: { id: body.id },
      });
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: deleted });
    });

    it("rejects delete requests without an id", async () => {
      const [request] = createJsonRequest("http://localhost/api/horse", {});

      const response = await DELETE(request);
      const payload = await response.json();

      expect(mockPrisma.horse.delete).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.errors).toBeDefined();
    });

    it("handles delete errors", async () => {
      mockPrisma.horse.delete.mockRejectedValueOnce(new Error("nah"));

      const [request] = createJsonRequest("http://localhost/api/horse", {
        id: "horse-20",
      });

      const response = await DELETE(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "nah" });
    });
  });
});
