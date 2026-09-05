import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DataTable — the workhorse for every list view in the admin.
 *
 * Props:
 * - columns: [{ key, header, render?(row), width?, className? }]
 * - rows: array of records
 * - rowKey: (row) => string
 * - searchable?: boolean (default true) — filters against all string cells
 * - searchPlaceholder?: string
 * - pageSize?: number (default 10)
 * - emptyMessage?: string
 * - actions?: (row) => ReactNode — trailing action buttons per row
 */
export default function DataTable({
  columns,
  rows,
  rowKey,
  searchable = true,
  searchPlaceholder = "Search",
  pageSize = 10,
  emptyMessage = "Nothing here yet.",
  actions,
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(needle))
    );
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div data-testid="data-table" className="bg-[#faf7f1] rounded-sm border border-[#2b2320]/10 overflow-hidden">
      {searchable && (
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2b2320]/10">
          <Search size={16} className="text-[#5c3e2b]/60" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#5c3e2b]/40"
          />
          <span className="text-xs text-[#5c3e2b]/60">{filtered.length} of {rows.length}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-[0.16em] uppercase text-[#5c3e2b]/70 bg-[#f2ebdd]">
              {columns.map((c) => (
                <th key={c.key} className={`px-5 py-3 font-normal ${c.className || ""}`} style={c.width ? { width: c.width } : undefined}>
                  {c.header}
                </th>
              ))}
              {actions && <th className="px-5 py-3 w-0"></th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-5 py-16 text-center text-[#2b2320]/45">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={rowKey(row)} className="border-t border-[#2b2320]/8 hover:bg-[#f2ebdd]/40 transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-5 py-4 align-middle text-[#2b2320] ${c.className || ""}`}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  {actions && <td className="px-5 py-4 text-right">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#2b2320]/10 text-xs text-[#5c3e2b]">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-[#2b2320]/15 disabled:opacity-30 hover:border-[#2b2320]"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-[#2b2320]/15 disabled:opacity-30 hover:border-[#2b2320]"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
