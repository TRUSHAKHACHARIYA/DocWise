import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { buildApp } from "../app";
import { prisma } from "../utils/prisma";
import { generateTokens } from "../utils/auth";

vi.mock("../utils/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where: { id } }: any) => ({
        id,
        email: "user@example.com",
        role: "USER",
      })),
    },
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

const app = buildApp();

describe("Refresh-token CSRF protection", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects /auth/refresh with no CSRF token even with a valid refresh cookie", async () => {
    const { refreshToken } = generateTokens("user-1", "USER");

    const res = await request(app.server)
      .post("/api/auth/refresh")
      .set("Cookie", [`refresh_token=${refreshToken}`])
      .send({});

    expect(res.status).toBe(403);
  });

  it("issues a CSRF token via GET /auth/csrf and accepts it back on /auth/refresh", async () => {
    const csrfRes = await request(app.server).get("/api/auth/csrf");
    expect(csrfRes.status).toBe(200);
    expect(typeof csrfRes.body.csrfToken).toBe("string");

    const setCookieHeader = csrfRes.headers["set-cookie"];
    const setCookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const csrfCookie = setCookies.find((c): c is string => !!c && c.startsWith("_csrf="));
    expect(csrfCookie).toBeDefined();

    const { refreshToken } = generateTokens("user-1", "USER");

    const refreshRes = await request(app.server)
      .post("/api/auth/refresh")
      .set("Cookie", [`refresh_token=${refreshToken}`, csrfCookie!.split(";")[0]])
      .set("x-csrf-token", csrfRes.body.csrfToken)
      .send({});

    expect(refreshRes.status).toBe(200);
    expect(typeof refreshRes.body.accessToken).toBe("string");
    expect(typeof refreshRes.body.csrfToken).toBe("string");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });
});
