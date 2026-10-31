import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { createServer } from "node:http";
const base = process.env.TEST_API;
if (!base)
  throw new Error(
    "TEST_API must point to a disposable test API/database; see README.",
  );
async function request(method, path, body, status = 200) {
  const r = await fetch(base + "/" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const j = await r.json();
  assert.equal(r.status, status, JSON.stringify(j));
  return j.data;
}
const get = (p) => request("GET", p);
const post = (p, b, status) => request("POST", p, b, status);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test("database health", async () =>
  assert.equal((await get("health")).status, "ok"));
test("unknown ID is rejected", async () => {
  const r = await fetch(base + "/appointments/" + randomUUID());
  assert.ok([404, 405].includes(r.status));
});
test("overlap races, adjacent appointments, stale versions and terminal status", async () => {
  const e = await post("employees", {
    name: "API test " + randomUUID(),
    title: "Test",
    color: "#4263eb",
  });
  const input = {
    employeeId: e.id,
    title: "Test meeting",
    clientName: "Test Client",
    clientEmail: "client@example.com",
    note: "Test",
    startAt: "2027-02-01T09:00:00Z",
    endAt: "2027-02-01T10:00:00Z",
  };
  const responses = await Promise.all(
    [1, 2].map(() =>
      fetch(base + "/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    ),
  );
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
  const a = (await responses.find((r) => r.status === 200).json()).data;
  const adjacent = await post("appointments", {
    ...input,
    startAt: input.endAt,
    endAt: "2027-02-01T11:00:00Z",
  });
  assert.ok(adjacent.id);
  const updated = await request("PUT", "appointments/" + a.id, {
    ...input,
    title: "Updated",
    version: 1,
  });
  assert.equal(updated.version, 2);
  await request("PUT", "appointments/" + a.id, { ...input, version: 1 }, 409);
  const cancelled = await request("PATCH", "appointments/" + a.id + "/status", {
    status: "CANCELLED",
    version: 2,
  });
  assert.equal(cancelled.version, 3);
  await post("appointments", input);
  await request(
    "PATCH",
    "appointments/" + a.id + "/status",
    { status: "COMPLETED", version: 3 },
    409,
  );
  await post("appointments", { ...input, endAt: input.startAt }, 400);
  const rows = await get(
    "appointments?from=2027-02-01T00:00:00Z&to=2027-02-02T00:00:00Z",
  );
  assert.equal(rows.filter((x) => x.employeeId === e.id).length, 3);
  const bad = await fetch(
    base + "/appointments?from=2027-01-01T00:00:00Z&to=2027-04-01T00:00:00Z",
  );
  assert.equal(bad.status, 400);
});
