import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const lessonsMocks = vi.hoisted(() => ({
  createLesson: vi.fn(),
  getAllLessons: vi.fn(),
  updateLesson: vi.fn(),
  deleteLesson: vi.fn(),
  getLessonById: vi.fn(),
  getLessonsByStatus: vi.fn(),
  getLessonsByDateRange: vi.fn(),
  getLessonsByCustomerId: vi.fn(),
  getLessonsByMonitorId: vi.fn(),
  updateLessonStatus: vi.fn(),
}));

vi.mock("@/utils/lessons", () => lessonsMocks);

import { DELETE, GET, PATCH, POST, PUT } from "@/app/api/lessons/route";

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
  Object.values(lessonsMocks).forEach((mockFn) =>
    (mockFn as ReturnType<typeof vi.fn>).mockReset(),
  );
});

describe("Lessons API route", () => {
  describe("GET", () => {
    it("returns all lessons with default pagination", async () => {
      const lessons = [{ id: "lesson-1" }];
      lessonsMocks.getAllLessons.mockResolvedValueOnce(lessons as any);

      const response = await GET(createRequest("http://localhost/api/lessons"));
      const payload = await response.json();

      expect(lessonsMocks.getAllLessons).toHaveBeenCalledWith(100, 0);
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: lessons });
    });

    it("rejects invalid query parameters", async () => {
      const response = await GET(
        createRequest("http://localhost/api/lessons?take=-5"),
      );
      const payload = await response.json();

      expect(lessonsMocks.getAllLessons).not.toHaveBeenCalled();
      expect(lessonsMocks.getLessonById).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe("Invalid query parameters");
    });

    it("returns a single lesson when id is provided", async () => {
      const lesson = { id: "550e8400-e29b-41d4-a716-446655440000" };
      lessonsMocks.getLessonById.mockResolvedValueOnce(lesson as any);

      const response = await GET(
        createRequest(
          "http://localhost/api/lessons?id=550e8400-e29b-41d4-a716-446655440000",
        ),
      );
      const payload = await response.json();

      expect(lessonsMocks.getLessonById).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );
      expect(lessonsMocks.getAllLessons).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: lesson });
    });

    it("returns 404 when lesson is not found", async () => {
      lessonsMocks.getLessonById.mockResolvedValueOnce(null);

      const response = await GET(
        createRequest(
          "http://localhost/api/lessons?id=123e4567-e89b-12d3-a456-426614174000",
        ),
      );
      const payload = await response.json();

      expect(response.status).toBe(404);
      expect(payload).toEqual({ success: false, error: "Lesson not found" });
    });

    it("filters lessons by customer", async () => {
      const lessons = [{ id: "lesson-customer" }];
      lessonsMocks.getLessonsByCustomerId.mockResolvedValueOnce(lessons as any);

      const response = await GET(
        createRequest(
          "http://localhost/api/lessons?customerId=f47ac10b-58cc-4372-a567-0e02b2c3d479&take=25&skip=10",
        ),
      );
      const payload = await response.json();

      expect(lessonsMocks.getLessonsByCustomerId).toHaveBeenCalledWith(
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        25,
        10,
      );
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: lessons });
    });

    it("filters lessons by monitor", async () => {
      const lessons = [{ id: "lesson-monitor" }];
      lessonsMocks.getLessonsByMonitorId.mockResolvedValueOnce(lessons as any);

      const response = await GET(
        createRequest(
          "http://localhost/api/lessons?monitorId=6fa459ea-ee8a-3ca4-894e-db77e160355e",
        ),
      );
      const payload = await response.json();

      expect(lessonsMocks.getLessonsByMonitorId).toHaveBeenCalledWith(
        "6fa459ea-ee8a-3ca4-894e-db77e160355e",
        100,
        0,
      );
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: lessons });
    });

    it("filters lessons by status", async () => {
      const lessons = [{ id: "lesson-status" }];
      lessonsMocks.getLessonsByStatus.mockResolvedValueOnce(lessons as any);

      const response = await GET(
        createRequest(
          "http://localhost/api/lessons?status=FINISHED&take=5&skip=3",
        ),
      );
      const payload = await response.json();

      expect(lessonsMocks.getLessonsByStatus).toHaveBeenCalledWith(
        "FINISHED",
        5,
        3,
      );
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: lessons });
    });

    it("filters lessons by date range", async () => {
      const lessons = [{ id: "lesson-range" }];
      lessonsMocks.getLessonsByDateRange.mockResolvedValueOnce(lessons as any);

      const response = await GET(
        createRequest(
          "http://localhost/api/lessons?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T00:00:00.000Z&take=50&skip=5",
        ),
      );
      const payload = await response.json();

      expect(lessonsMocks.getLessonsByDateRange).toHaveBeenCalledTimes(1);
      const call = lessonsMocks.getLessonsByDateRange.mock.calls[0]!;
      expect(call[0]).toBeInstanceOf(Date);
      expect(call[1]).toBeInstanceOf(Date);
      expect(call[0].toISOString()).toBe("2024-01-01T00:00:00.000Z");
      expect(call[1].toISOString()).toBe("2024-01-31T00:00:00.000Z");
      expect(call[2]).toBe(50);
      expect(call[3]).toBe(5);
      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true, data: lessons });
    });

    it("rejects when startDate is after endDate", async () => {
      const response = await GET(
        createRequest(
          "http://localhost/api/lessons?startDate=2024-02-01T00:00:00.000Z&endDate=2024-01-01T00:00:00.000Z",
        ),
      );
      const payload = await response.json();

      expect(lessonsMocks.getLessonsByDateRange).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe("startDate must be before endDate");
    });

    it("surfaces underlying errors", async () => {
      lessonsMocks.getAllLessons.mockRejectedValueOnce(new Error("explode"));

      const response = await GET(createRequest("http://localhost/api/lessons"));
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "explode" });
    });
  });

  describe("POST", () => {
    it("creates a lesson when payload is valid", async () => {
      const body = {
        date: "2024-03-15T10:00:00.000Z",
        desc: "Dressage training",
        status: "PENDING",
        monitorId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        customerId: "6fa459ea-ee8a-3ca4-894e-db77e160355e",
        horseId: "7d444840-9dc0-11d1-b245-5ffdce74fad2",
      } as const;
      const created = {
        id: "lesson-20",
        date: new Date(body.date),
        desc: body.desc,
        status: body.status,
      };
      lessonsMocks.createLesson.mockResolvedValueOnce(created as any);

      const [request, jsonSpy] = createJsonRequest(
        "http://localhost/api/lessons",
        body,
      );
      const response = await POST(request);
      const payload = await response.json();

      expect(jsonSpy).toHaveBeenCalledTimes(1);
      expect(lessonsMocks.createLesson).toHaveBeenCalledWith({
        date: expect.any(Date),
        desc: body.desc,
        status: body.status,
        monitor: { connect: { id: body.monitorId } },
        customer: { connect: { id: body.customerId } },
        horse: { connect: { id: body.horseId } },
      });
      const [[callArg]] = lessonsMocks.createLesson.mock.calls;
      expect(callArg.date.toISOString()).toBe(body.date);
      expect(response.status).toBe(201);
      expect(payload).toEqual({
        success: true,
        data: { ...created, date: created.date.toISOString() },
      });
    });

    it("rejects invalid payloads", async () => {
      const [request] = createJsonRequest("http://localhost/api/lessons", {
        desc: "Missing fields",
      });

      const response = await POST(request);
      const payload = await response.json();

      expect(lessonsMocks.createLesson).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe("Invalid data");
    });

    it("handles create errors", async () => {
      lessonsMocks.createLesson.mockRejectedValueOnce(new Error("db down"));

      const [request] = createJsonRequest("http://localhost/api/lessons", {
        date: "2024-03-15T10:00:00.000Z",
        desc: "Dressage training",
        status: "PENDING",
        monitorId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        customerId: "6fa459ea-ee8a-3ca4-894e-db77e160355e",
        horseId: "7d444840-9dc0-11d1-b245-5ffdce74fad2",
      });

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "db down" });
    });
  });

  describe("PUT", () => {
    it("updates a lesson when payload is valid", async () => {
      const body = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        date: "2024-04-01T09:00:00.000Z",
        desc: "Updated lesson",
        status: "IN_PROGRESS",
        monitorId: "6fa459ea-ee8a-3ca4-894e-db77e160355e",
        customerId: "16fd2706-8baf-433b-82eb-8c7fada847da",
        horseId: "c56a4180-65aa-42ec-a945-5fd21dec0538",
      } as const;
      const updated = {
        id: body.id,
        date: new Date(body.date),
        desc: body.desc,
        status: body.status,
      };
      lessonsMocks.updateLesson.mockResolvedValueOnce(updated as any);

      const [request, jsonSpy] = createJsonRequest(
        "http://localhost/api/lessons",
        body,
      );
      const response = await PUT(request);
      const payload = await response.json();

      expect(jsonSpy).toHaveBeenCalledTimes(1);
      expect(lessonsMocks.updateLesson).toHaveBeenCalledWith(
        body.id,
        expect.objectContaining({
          date: expect.any(Date),
          desc: body.desc,
          status: body.status,
          monitor: { connect: { id: body.monitorId } },
          customer: { connect: { id: body.customerId } },
          horse: { connect: { id: body.horseId } },
        }),
      );
      const [, callArg] = lessonsMocks.updateLesson.mock.calls[0]!;
      expect(callArg.date.toISOString()).toBe(body.date);
      expect(response.status).toBe(200);
      expect(payload).toEqual({
        success: true,
        data: { ...updated, date: updated.date.toISOString() },
      });
    });

    it("rejects invalid update payloads", async () => {
      const [request] = createJsonRequest("http://localhost/api/lessons", {
        desc: "No id",
      });

      const response = await PUT(request);
      const payload = await response.json();

      expect(lessonsMocks.updateLesson).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe("Invalid data");
    });

    it("handles update errors", async () => {
      lessonsMocks.updateLesson.mockRejectedValueOnce(new Error("nope"));

      const [request] = createJsonRequest("http://localhost/api/lessons", {
        id: "550e8400-e29b-41d4-a716-446655440000",
      });

      const response = await PUT(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "nope" });
    });
  });

  describe("PATCH", () => {
    it("updates lesson status", async () => {
      const body = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        status: "FINISHED",
      } as const;
      const updated = { id: body.id, status: body.status };
      lessonsMocks.updateLessonStatus.mockResolvedValueOnce(updated as any);

      const [request, jsonSpy] = createJsonRequest(
        "http://localhost/api/lessons",
        body,
      );
      const response = await PATCH(request);
      const payload = await response.json();

      expect(jsonSpy).toHaveBeenCalledTimes(1);
      expect(lessonsMocks.updateLessonStatus).toHaveBeenCalledWith(
        body.id,
        body.status,
      );
      expect(response.status).toBe(200);
      expect(payload).toEqual({
        success: true,
        data: updated,
        message: "Lesson status updated to FINISHED",
      });
    });

    it("rejects invalid status payloads", async () => {
      const [request] = createJsonRequest("http://localhost/api/lessons", {
        status: "FINISHED",
      });

      const response = await PATCH(request);
      const payload = await response.json();

      expect(lessonsMocks.updateLessonStatus).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe("Invalid data");
    });

    it("handles status update errors", async () => {
      lessonsMocks.updateLessonStatus.mockRejectedValueOnce(new Error("fail"));

      const [request] = createJsonRequest("http://localhost/api/lessons", {
        id: "550e8400-e29b-41d4-a716-446655440000",
        status: "IN_PROGRESS",
      });

      const response = await PATCH(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "fail" });
    });
  });

  describe("DELETE", () => {
    it("deletes a lesson when id is valid", async () => {
      const deleted = { id: "550e8400-e29b-41d4-a716-446655440000" };
      lessonsMocks.deleteLesson.mockResolvedValueOnce(deleted as any);

      const response = await DELETE(
        createRequest(
          "http://localhost/api/lessons?id=550e8400-e29b-41d4-a716-446655440000",
        ),
      );
      const payload = await response.json();

      expect(lessonsMocks.deleteLesson).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );
      expect(response.status).toBe(200);
      expect(payload).toEqual({
        success: true,
        data: deleted,
        message: "Lesson deleted successfully",
      });
    });

    it("rejects delete requests without a valid id", async () => {
      const response = await DELETE(
        createRequest("http://localhost/api/lessons?id=not-a-uuid"),
      );
      const payload = await response.json();

      expect(lessonsMocks.deleteLesson).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe("Invalid or missing ID");
    });

    it("handles delete errors", async () => {
      lessonsMocks.deleteLesson.mockRejectedValueOnce(new Error("nope"));

      const response = await DELETE(
        createRequest(
          "http://localhost/api/lessons?id=550e8400-e29b-41d4-a716-446655440000",
        ),
      );
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ success: false, error: "nope" });
    });
  });
});
