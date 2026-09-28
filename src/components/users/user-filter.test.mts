import assert from "node:assert/strict";
import test from "node:test";
import { filterUsers } from "./user-filter.ts";

const users = [
  {
    id: "7a8c95fd-23a8-4373-9b98-baeab9eda83a",
    email: "first@example.com",
    name: "First User",
    balance: 10,
    isVerified: true,
    ip: "192.0.2.10",
    isBanned: false,
    createdAt: "2026-09-23T08:00:00.000Z",
    updatedAt: "2026-09-23T08:00:00.000Z",
  },
  {
    id: "bf58efc4-c275-42da-b5c5-582d01a258e4",
    email: "second@example.com",
    balance: 20,
    isVerified: true,
    ip: "198.51.100.20",
    isBanned: false,
    createdAt: "2026-09-22T08:00:00.000Z",
    updatedAt: "2026-09-22T08:00:00.000Z",
  },
];

test("finds a user by full UUID without changing their identity", () => {
  const result = filterUsers(users, users[1].id);
  assert.deepEqual(result, [users[1]]);
  assert.equal(result[0], users[1]);
});

test("matches a partial UUID ignoring whitespace and case", () => {
  assert.deepEqual(filterUsers(users, "  BF58EFC4-C275  "), [users[1]]);
});

test("preserves email, name and IP searches", () => {
  assert.deepEqual(filterUsers(users, "FIRST@EXAMPLE"), [users[0]]);
  assert.deepEqual(filterUsers(users, "first user"), [users[0]]);
  assert.deepEqual(filterUsers(users, "198.51.100.20"), [users[1]]);
});

test("returns all users for empty or whitespace-only searches", () => {
  assert.deepEqual(filterUsers(users, ""), users);
  assert.deepEqual(filterUsers(users, "  "), users);
});

test("returns no matches for an unknown ID", () => {
  assert.deepEqual(filterUsers(users, "unknown-user-id"), []);
});
