import assert from "node:assert/strict";
import test from "node:test";
import { buildGeneralLogParams, createLogTableQuery, changeLogSort, validateLogRange } from "./log-query.ts";

test("defaults orders and payments independently to creation descending", () => {
  const orders = createLogTableQuery();
  const payments = createLogTableQuery();
  const params = buildGeneralLogParams({ orders, payments, page: 2, limit: 100, all: false, search: "  client  ", status: "PAID" });
  assert.deepEqual(params, { page: 2, limit: 100, all: false, search: "client", status: "PAID",
    ordersSortBy: "createdAt", ordersSortDirection: "desc",
    paymentsSortBy: "createdAt", paymentsSortDirection: "desc" });
  assert.notEqual(orders.filters, payments.filters);
});

test("sorting one table preserves the other and the current filters", () => {
  const orders = { ...createLogTableQuery(), filters: { email: "customer@example.com" } };
  const payments = createLogTableQuery();
  const updated = changeLogSort(orders, "amount");
  assert.equal(updated.sortBy, "amount");
  assert.equal(updated.sortDirection, "asc");
  assert.equal(changeLogSort(updated, "amount").sortDirection, "desc");
  assert.equal(changeLogSort(updated, "updatedAt").sortDirection, "desc");
  assert.deepEqual(updated.filters, orders.filters);
  assert.equal(payments.sortBy, "createdAt");
  assert.equal(orders.sortBy, "createdAt");
});

test("serializes all nonempty column filters with independent API prefixes and keeps show-all", () => {
  const orders = { ...createLogTableQuery(), filters: {
    email: " user_50%@example.com ", id: " local ", providerOrder: "NS_50%", goal: "work",
    type: "resident", createdFrom: "2026-09-01", createdTo: "2026-09-30",
    updatedFrom: "2026-10-01", updatedTo: "2026-10-02", amountMin: "0", amountMax: "10.50",
  } };
  const payments = { ...changeLogSort(createLogTableQuery(), "method"), filters: {
    email: "billing@example.com", id: "payment", method: " Crypto ",
    createdFrom: "2026-09-01", createdTo: "2026-09-30", amountMin: "2", amountMax: "20",
  } };
  assert.deepEqual(buildGeneralLogParams({ orders, payments, page: 1, limit: 200, all: true, search: "", status: "ALL" }), {
    page: 1, limit: 200, all: true, search: "", status: "ALL",
    ordersSortBy: "createdAt", ordersSortDirection: "desc", paymentsSortBy: "method", paymentsSortDirection: "asc",
    ordersEmail: "user_50%@example.com", ordersId: "local", ordersProviderOrder: "NS_50%", ordersGoal: "work", ordersType: "resident",
    ordersCreatedFrom: "2026-09-01", ordersCreatedTo: "2026-09-30", ordersUpdatedFrom: "2026-10-01", ordersUpdatedTo: "2026-10-02",
    ordersAmountMin: "0", ordersAmountMax: "10.50", paymentsEmail: "billing@example.com", paymentsId: "payment", paymentsMethod: "Crypto",
    paymentsCreatedFrom: "2026-09-01", paymentsCreatedTo: "2026-09-30", paymentsAmountMin: "2", paymentsAmountMax: "20",
  });
});

test("clearing a filter omits it from requests and thus the React Query cache key", () => {
  const query = { ...createLogTableQuery(), filters: { email: "  ", amountMin: "0", amountMax: "" } };
  const params = buildGeneralLogParams({ orders: query, payments: createLogTableQuery(), page: 1, limit: 100 });
  assert.equal(params.ordersEmail, undefined);
  assert.equal(params.ordersAmountMax, undefined);
  assert.equal(params.ordersAmountMin, "0");
});

test("range validation permits inclusive/open bounds and rejects malformed or reversed ranges", () => {
  assert.equal(validateLogRange("date", "2026-09-01", "2026-09-01"), undefined);
  assert.equal(validateLogRange("date", "", "2026-09-01"), undefined);
  assert.equal(validateLogRange("amount", "0", "10.50"), undefined);
  assert.equal(validateLogRange("amount", "0.1", "0.10"), undefined);
  for (const [type, from, to] of [
    ["date", "2026-02-30", ""], ["date", "2026-10-02", "2026-10-01"],
    ["amount", "-1", ""], ["amount", "Infinity", ""], ["amount", "1e3", ""],
    ["amount", "10", "2"], ["amount", "0.100000000000000002", "0.100000000000000001"],
  ] as const) assert.ok(validateLogRange(type, from, to), `${type}: ${from}..${to}`);
});
