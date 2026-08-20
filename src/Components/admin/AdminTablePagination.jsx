import React, { useMemo, useState, useEffect } from 'react';

/**
 * Paginación client-side reutilizable para tablas admin.
 */
export function useAdminPagination(items = [], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [items, pageSize]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = useMemo(() => items.slice(start, end), [items, start, end]);

  return {
    page: safePage,
    pageSize,
    setPageSize,
    setPage,
    total,
    totalPages,
    start: total === 0 ? 0 : start + 1,
    end,
    pageItems,
    goPrev: () => setPage((p) => Math.max(1, p - 1)),
    goNext: () => setPage((p) => Math.min(totalPages, p + 1)),
  };
}

export default function AdminTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  start,
  end,
  onPageChange,
  onPageSizeChange,
  goPrev,
  goNext,
}) {
  return (
    <div className="table-footer-premium admin-pagination-bar">
      <div className="admin-pagination-meta">
        <span>
          {total === 0 ? 'Sin registros' : `Mostrando ${start}–${end} de ${total}`}
        </span>
        <label className="admin-page-size">
          Por página
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      <div className="pagination-group-premium">
        <button
          type="button"
          className="btn-page"
          disabled={page <= 1}
          onClick={goPrev || (() => onPageChange?.(page - 1))}
        >
          Anterior
        </button>
        <button type="button" className="btn-page active" disabled>
          {page} / {totalPages}
        </button>
        <button
          type="button"
          className="btn-page"
          disabled={page >= totalPages}
          onClick={goNext || (() => onPageChange?.(page + 1))}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
