"use client";

import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { changeLogSort, validateLogRange, type LogTableQuery } from './log-query';

type Field = { key: string; label: string; type?: 'date' | 'number'; options?: { value: string; label: string }[] };
export function LogColumnHeader({ label, sortField, query, onChange, fields = [], sortOptions, children }: {
  label: string; sortField: string; query: LogTableQuery; onChange: (query: LogTableQuery) => void;
  fields?: Field[]; sortOptions?: { value: string; label: string }[]; children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const active = query.sortBy === sortField || sortOptions?.some(o => o.value === query.sortBy);
  const Icon = active ? (query.sortDirection === 'desc' ? ArrowDown : ArrowUp) : ArrowUpDown;
  const hasFilter = fields.some(f => query.filters[f.key]);
  return <TableHead aria-sort={active ? (query.sortDirection === 'desc' ? 'descending' : 'ascending') : 'none'}>
    <div className="flex items-center gap-1 whitespace-nowrap">
      <button type="button" className="flex items-center gap-1 py-2 text-left hover:text-foreground" title={`Сортировать: ${label}`} aria-label={`Сортировать: ${label}`}
        onClick={() => onChange(changeLogSort(query, active ? query.sortBy : sortField))}>
        {label}<Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      </button>
      {(fields.length > 0 || sortOptions || children) && <Popover open={open} onOpenChange={next => { setOpen(next); setDraft(query.filters); setError(undefined); }}>
        <PopoverTrigger asChild><Button variant="ghost" size="icon" className={`h-7 w-7 shrink-0 ${hasFilter ? 'text-primary' : ''}`} title={`Фильтр: ${label}`} aria-label={`Фильтр: ${label}`}><Filter className="h-3 w-3" fill={hasFilter ? 'currentColor' : 'none'} /></Button></PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-3">
          <div className="text-sm font-medium">{label}</div>
          {sortOptions && <label className="block text-xs">Сортировать по
            <select aria-label={`${label}: поле сортировки`} className="mt-1 h-9 w-full rounded border bg-background px-2 text-sm" value={active ? query.sortBy : sortField}
              onChange={event => onChange({ ...query, sortBy: event.target.value, sortDirection: 'desc' })}>
              {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>}
          {children}
          {fields.map(field => <label key={field.key} className="block text-xs">{field.label}
            {field.options ? <select aria-label={`${label}: ${field.label}`} className="mt-1 h-9 w-full rounded border bg-background px-2 text-sm" value={draft[field.key] || ''} onChange={e => setDraft({ ...draft, [field.key]: e.target.value })}>
              <option value="">Все</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select> : <Input className="mt-1" aria-label={`${label}: ${field.label}`} type={field.type || 'text'} step={field.type === 'number' ? 'any' : undefined} min={field.type === 'number' ? '0' : undefined} maxLength={500}
              value={draft[field.key] || ''} onChange={e => setDraft({ ...draft, [field.key]: e.target.value })} />}
          </label>)}
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          {fields.length > 0 && <div className="flex justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => { const filters = { ...query.filters }; fields.forEach(f => delete filters[f.key]); onChange({ ...query, filters }); setOpen(false); }}>Сбросить</Button>
            <Button size="sm" onClick={() => {
              for (const [kind, a, b] of [['date', 'createdFrom', 'createdTo'], ['date', 'updatedFrom', 'updatedTo'], ['amount', 'amountMin', 'amountMax']] as const) {
                const message = validateLogRange(kind, draft[a] || '', draft[b] || '');
                if (message) { setError(message); return; }
              }
              const filters = { ...query.filters };
              fields.forEach(f => { filters[f.key] = (draft[f.key] || '').trim(); });
              onChange({ ...query, filters }); setOpen(false);
            }}>Применить</Button>
          </div>}
        </PopoverContent>
      </Popover>}
    </div>
  </TableHead>;
}
