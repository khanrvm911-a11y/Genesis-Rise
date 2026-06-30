import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function DataTable({
  columns,
  data,
  loading,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No data found',
  actions,
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter(row =>
      columns.some(col => {
        const val = col.accessor ? row[col.accessor] : null;
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-white/10">
          {searchable && (
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-gray-500 text-sm">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paged.map((row, ri) => (
                <tr
                  key={row.id || ri}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-white/[0.02] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, ci) => (
                    <td key={ci} className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages} ({filtered.length} total)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-gray-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-gray-400 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
