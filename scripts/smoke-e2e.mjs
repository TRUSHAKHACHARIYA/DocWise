const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:4000";

async function assertResponse(name, response, expectedStatus) {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`${name} failed. Expected ${expectedStatus}, received ${response.status}. Body: ${body}`);
  }
}

async function main() {
  const health = await fetch(`${baseUrl}/healthz`);
  await assertResponse("healthz", health, 200);

  const invalidLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "fake@example.com", password: "wrong" }),
  });
  await assertResponse("invalid login", invalidLogin, 401);

  console.log("Smoke E2E checks passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
