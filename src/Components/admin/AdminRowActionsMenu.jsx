import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import './AdminRowActionsMenu.css';

/** Cierra cualquier otro menú abierto al abrir uno nuevo. */
let closeActiveMenu = null;

const MENU_MIN_WIDTH = 210;
const VIEWPORT_PAD = 8;

/**
 * Menú de acciones por fila (3 puntos).
 * Renderiza el panel en portal fixed para no quedar cortado por overflow de tablas.
 *
 * items: [{ key, label, icon?, onClick?, to?, href?, target?, rel?, tone?, disabled? }]
 */
export default function AdminRowActionsMenu({ items = [], label = 'Acciones' }) {
  const menuId = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'bottom' });

  const visibleItems = (items || []).filter(Boolean);

  const close = useCallback(() => {
    setOpen(false);
    if (closeActiveMenu === close) closeActiveMenu = null;
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panelH = panelRef.current?.offsetHeight || visibleItems.length * 42 + 16;
    const panelW = Math.max(MENU_MIN_WIDTH, panelRef.current?.offsetWidth || MENU_MIN_WIDTH);

    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
    const spaceAbove = rect.top - VIEWPORT_PAD;
    const placeUp = spaceBelow < panelH && spaceAbove > spaceBelow;

    let top = placeUp ? rect.top - panelH - 6 : rect.bottom + 6;
    let left = rect.right - panelW;

    left = Math.min(left, window.innerWidth - panelW - VIEWPORT_PAD);
    left = Math.max(VIEWPORT_PAD, left);
    top = Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - panelH - VIEWPORT_PAD));

    setCoords({ top, left, placement: placeUp ? 'top' : 'bottom' });
  }, [visibleItems.length]);

  const openMenu = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (closeActiveMenu && closeActiveMenu !== close) closeActiveMenu();
      closeActiveMenu = close;
      setOpen(true);
    },
    [close]
  );

  const toggle = (e) => {
    e.stopPropagation();
    if (open) close();
    else openMenu(e);
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(raf);
  }, [open, updatePosition, visibleItems.length]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const t = event.target;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      close();
    };

    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };

    const onReposition = () => updatePosition();
    const onScrollClose = () => close();

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onScrollClose, true);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onScrollClose, true);
    };
  }, [open, close, updatePosition]);

  useEffect(() => () => {
    if (closeActiveMenu === close) closeActiveMenu = null;
  }, [close]);

  if (visibleItems.length === 0) {
    return <span className="admin-row-actions-empty">—</span>;
  }

  const handleItemActivate = (item) => {
    if (item.disabled) return;
    if (item.onClick) item.onClick();
    close();
  };

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          id={menuId}
          className={`admin-row-actions-panel placement-${coords.placement}`}
          style={{ top: coords.top, left: coords.left }}
          role="menu"
          aria-label={label}
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const className = `admin-row-actions-item tone-${item.tone || 'default'}${item.disabled ? ' is-disabled' : ''}`;

            if (item.to && !item.disabled) {
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={className}
                  role="menuitem"
                  onClick={() => close()}
                >
                  {Icon ? <Icon size={16} /> : null}
                  <span>{item.label}</span>
                </Link>
              );
            }

            if (item.href && !item.disabled) {
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={className}
                  role="menuitem"
                  target={item.target}
                  rel={item.rel || (item.target === '_blank' ? 'noreferrer' : undefined)}
                  onClick={() => close()}
                >
                  {Icon ? <Icon size={16} /> : null}
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                className={className}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemActivate(item)}
              >
                {Icon ? <Icon size={16} /> : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <div className="admin-row-actions">
      <button
        ref={triggerRef}
        type="button"
        className={`admin-row-actions-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        title={label}
        onClick={toggle}
      >
        <MoreVertical size={20} strokeWidth={2.25} />
      </button>
      {panel}
    </div>
  );
}
