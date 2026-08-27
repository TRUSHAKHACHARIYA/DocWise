import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import crypto from "crypto";
import request from "supertest";
import { buildApp } from "../app";
import { prisma } from "../utils/prisma";
import { env } from "../config/env";

vi.mock("../utils/prisma", () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

const app = buildApp();

function sign(body: string) {
  return crypto.createHmac("sha256", env.NMI_WEBHOOK_SECRET).update(body).digest("hex");
}

describe("POST /api/webhooks/nmi", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects a request with an invalid signature", async () => {
    const body = JSON.stringify({ event: "subscription.updated", data: { subscription: { id: "sub_1", customer_id: "user-1", status: "active" } } });

    const res = await request(app.server)
      .post("/api/webhooks/nmi")
      .set("Content-Type", "application/json")
      .set("signature", "not-a-real-signature")
      .send(body);

    expect(res.status).toBe(401);
  });

  it("acknowledges (200, ignored) instead of 500ing when the webhook references a user that no longer exists", async () => {
    const body = JSON.stringify({
      event: "subscription.updated",
      data: { subscription: { id: "sub_1", customer_id: "deleted-user", status: "active", plan_id: "PRO" } },
    });

    vi.mocked(prisma.user.update).mockRejectedValueOnce(
      Object.assign(new Error("An operation failed because it depends on one or more records that were required but not found."), { code: "P2025" })
    );

    const res = await request(app.server)
      .post("/api/webhooks/nmi")
      .set("Content-Type", "application/json")
      .set("signature", sign(body))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ received: true, ignored: true, reason: "unknown_user" });
  });

  it("accepts a validly-signed payload for a real user", async () => {
    const body = JSON.stringify({
      event: "subscription.updated",
      data: { subscription: { id: "sub_1", customer_id: "user-1", status: "active", plan_id: "PRO" } },
    });

    vi.mocked(prisma.user.update).mockResolvedValueOnce({ id: "user-1" } as any);

    const res = await request(app.server)
      .post("/api/webhooks/nmi")
      .set("Content-Type", "application/json")
      .set("signature", sign(body))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
  });
});
