import React, { useState } from 'react';
import { ArrowRight, Store, Calendar, Newspaper } from 'lucide-react';
import { getAbsoluteImageUrl } from '../../services/api';

const TYPE_META = {
  commerce: { label: 'Comercio', Icon: Store },
  event: { label: 'Evento', Icon: Calendar },
  article: { label: 'Revista', Icon: Newspaper },
};

const GROUP_TITLE = {
  commerce: 'Comercios',
  event: 'Eventos',
  article: 'Revista',
};

function inferType(item) {
  if (item.type && TYPE_META[item.type]) return item.type;
  const to = String(item.to || '');
  if (to.startsWith('/event')) return 'event';
  if (to.startsWith('/article')) return 'article';
  return 'commerce';
}

function Thumb({ item, type }) {
  const [broken, setBroken] = useState(false);
  const src = item.image ? getAbsoluteImageUrl(item.image) : null;
  const { Icon } = TYPE_META[type];

  if (src && !broken) {
    return (
      <span className="assistant-card-thumb">
        <img src={src} alt="" onError={() => setBroken(true)} />
      </span>
    );
  }

  return (
    <span className={`assistant-card-thumb fallback ${type}`} aria-hidden="true">
      <Icon size={18} />
    </span>
  );
}

const AssistantEntityList = ({ items, onOpen }) => {
  if (!items?.length) return null;

  const typed = items.map((item) => ({ ...item, type: inferType(item) }));
  const types = [...new Set(typed.map((item) => item.type))];
  const grouped = types.length > 1;

  const renderCard = (item) => {
    const type = item.type;
    const meta = TYPE_META[type];
    return (
      <button
        key={item.id || item.to}
        type="button"
        className="assistant-card"
        onClick={() => onOpen(item.to)}
      >
        <Thumb item={item} type={type} />
        <span className="assistant-card-body">
          <span className={`assistant-card-kind ${type}`}>{meta.label}</span>
          <strong>{item.label}</strong>
          {(item.hint || item.meta) && (
            <small>
              {item.hint}
              {item.hint && item.meta ? ' · ' : ''}
              {item.meta}
            </small>
          )}
        </span>
        <span className="assistant-card-go">
          Ver
          <ArrowRight size={14} />
        </span>
      </button>
    );
  };

  return (
    <div className="assistant-items">
      <p className="assistant-items-caption">Tocá una ficha para ver el detalle</p>
      {grouped
        ? types.map((type) => (
            <div key={type} className="assistant-items-group">
              <span className="assistant-items-group-title">{GROUP_TITLE[type]}</span>
              {typed.filter((item) => item.type === type).map(renderCard)}
            </div>
          ))
        : typed.map(renderCard)}
    </div>
  );
};

export default AssistantEntityList;
