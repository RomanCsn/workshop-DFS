import { afterAll, afterEach, beforeAll, vi } from "vitest";

let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;

beforeAll(() => {
  consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  consoleErrorSpy?.mockRestore();
});
