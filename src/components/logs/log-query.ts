export type LogTableQuery = { sortBy: string; sortDirection: 'asc' | 'desc'; filters: Record<string, string> };
export function createLogTableQuery(): LogTableQuery {
  return { sortBy: 'createdAt', sortDirection: 'desc', filters: {} };
}
export function changeLogSort(query: LogTableQuery, field: string): LogTableQuery {
  return { ...query, sortBy: field, sortDirection: query.sortBy === field
    ? (query.sortDirection === 'asc' ? 'desc' : 'asc')
    : (field.endsWith('At') ? 'desc' : 'asc') };
}
const fields = ['email', 'id', 'type', 'providerOrder', 'goal', 'method', 'createdFrom', 'createdTo', 'updatedFrom', 'updatedTo', 'amountMin', 'amountMax'];
export function buildGeneralLogParams({ orders, payments, page, limit, all = false, search = '', status = 'ALL' }: {
  orders: LogTableQuery; payments: LogTableQuery; page: number; limit: number;
  all?: boolean; search?: string; status?: string;
}): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = { page, limit, all, search: search.trim(), status };
  for (const [prefix, query] of Object.entries({ orders, payments })) {
    result[`${prefix}SortBy`] = query.sortBy;
    result[`${prefix}SortDirection`] = query.sortDirection;
    for (const key of fields) {
      const value = query.filters[key]?.trim();
      if (value) result[`${prefix}${key[0].toUpperCase()}${key.slice(1)}`] = value;
    }
  }
  return result;
}
export function validateLogRange(type: 'date' | 'amount', from: string, to: string): string | undefined {
  if (type === 'date') {
    for (const value of [from, to]) {
      if (!value) continue;
      const date = new Date(`${value}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'Некорректная дата';
    }
    if (from && to && from > to) return 'Начало периода должно быть не позже конца';
  } else {
    for (const value of [from, to]) if (value && !/^\d{1,35}(?:\.\d{1,30})?$/.test(value)) return 'Введите неотрицательную сумму';
    if (from && to) {
      const normalized = (value: string) => {
        const [whole, fraction = ''] = value.split('.');
        return BigInt(whole + fraction.padEnd(30, '0'));
      };
      if (normalized(from) > normalized(to)) return 'Минимум должен быть не больше максимума';
    }
  }
}
