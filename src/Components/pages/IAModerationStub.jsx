import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  FileText,
  Store,
  Calendar,
  MessageSquare,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  Sparkles,
  Info,
  BookOpen,
  Filter,
  ScanText,
  Image as ImageIcon,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getAiStatus,
  getModerationStats,
  getModerationLogs,
  reviewModeration,
  sendAiChat,
} from '../../services/api';
import { assistantFriendlyError } from '../../utils/assistantErrors';
import { formatEnumLabel, formatStatusLabel } from '../../utils/enumLabels.js';
import './IAModerationStub.css';

const FILTERS = [
  { id: 'pending', label: 'Por revisar' },
  { id: 'reviewed', label: 'Revisados' },
  { id: 'all', label: 'Todos' },
  { id: 'flagged', label: 'Marcados IA' },
  { id: 'approved', label: 'En orden IA' },
  { id: 'rejected', label: 'Alerta IA' },
];

const TYPE_FILTERS = [
  { id: 'ALL', label: 'Todos los tipos' },
  { id: 'COMMERCE', label: 'Comercios' },
  { id: 'EVENT', label: 'Eventos' },
  { id: 'ARTICLE', label: 'Revista' },
  { id: 'COMMENT', label: 'Comentarios' },
  { id: 'SUBMISSION', label: 'Buzón' },
];

const TYPE_ICON = {
  COMMERCE: Store,
  EVENT: Calendar,
  ARTICLE: Newspaper,
  COMMENT: MessageSquare,
  SUBMISSION: Mail,
};

const FALLBACK_EXAMPLES = [
  {
    category: 'insultos',
    title: 'Lenguaje ofensivo',
    input: 'Sos un idiota, no vengan a este lugar',
    step: 'Filtro local + texto IA',
    why: 'Contiene insultos dirigidos a personas',
    resultLabel: 'Marcar → Por revisar',
  },
  {
    category: 'estafa',
    title: 'Estafa / phishing',
    input: 'Transferí a esta billetera y duplicamos tu plata',
    step: 'Filtro local + texto IA',
    why: 'Promesa engañosa de dinero y transferencia',
    resultLabel: 'Alerta alta',
  },
  {
    category: 'sexual',
    title: 'Contenido sexual en texto',
    input: 'Local con shows sexuales explícitos y packs privados',
    step: 'Filtro local + texto IA',
    why: 'Lenguaje sexual explícito no apto para la guía local',
    resultLabel: 'Alerta alta',
  },
  {
    category: 'imagenes',
    title: 'Imágenes',
    input: 'Foto de un plato de empanadas vs imagen sexual / nudez',
    step: 'Análisis de imágenes',
    why: 'Comida y locales se aprueban; nudez o sexual explícito se marca',
    resultLabel: 'Comida OK / sexual → alerta',
  },
  {
    category: 'spam',
    title: 'Spam de enlaces',
    input: 'COMPRÁ YA http://a.com http://b.com http://c.com',
    step: 'Filtro local',
    why: 'Muchos links y mayúsculas agresivas',
    resultLabel: 'Marcar',
  },
  {
    category: 'datos_sensibles',
    title: 'Datos sensibles',
    input: 'Pagar con 4111 1111 1111 1111',
    step: 'Filtro local',
    why: 'Parece número de tarjeta',
    resultLabel: 'Marcar / alerta',
  },
  {
    category: 'valido',
    title: 'Contenido válido',
    input: 'Peña en La Casona, sábado 22 hs. Folklore en vivo.',
    step: 'Filtro + texto (+ fotos si hay)',
    why: 'Agenda cultural normal de Salta',
    resultLabel: 'En orden',
  },
];

function typeIcon(type) {
  const Icon = TYPE_ICON[type] || FileText;
  return <Icon size={16} />;
}

function formatWhen(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function aiSeverityLabel(status, reviewedAt) {
  const key = String(status || '').toUpperCase();
  if (reviewedAt) {
    if (key === 'APPROVED') return 'Revisado — en orden';
    if (key === 'REJECTED') return 'Revisado — alerta confirmada';
    return 'Revisado';
  }
  if (key === 'FLAGGED') return 'Por revisar (marcado)';
  if (key === 'REJECTED') return 'Por revisar (alerta IA)';
  if (key === 'APPROVED') return 'En orden';
  return formatStatusLabel(status);
}

function categoryLabel(cat) {
  const map = {
    insultos: 'Insultos',
    sexual: 'Sexual / obsceno',
    violencia: 'Violencia',
    estafa: 'Estafa',
    spam: 'Spam',
    datos_sensibles: 'Datos sensibles',
    odio: 'Odio',
    drogas: 'Drogas',
    armas: 'Armas',
    ilegal: 'Ilegal',
    imagenes: 'Imágenes',
    valido: 'Válido',
    otro: 'Otro',
  };
  return map[String(cat || '').toLowerCase()] || formatEnumLabel(cat);
}

function preferAutoSelect() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 1101px)').matches;
}

function pipelineSteps(item) {
  const ai = item?.aiResult || {};
  const basic = item?.basicFilterResult || ai.basic || {};
  const text = ai.text || {};
  const vision = ai.vision || {};
  const hit = Boolean(basic.hit || basic.blocked);

  return [
    {
      id: 'basic',
      title: '1. Filtro local',
      icon: Filter,
      state: hit ? (basic.severity === 'high' ? 'alert' : 'flag') : 'ok',
      detail: hit
        ? `${basic.reason || 'Coincidencia'} · ${((basic.matches || []).slice(0, 4).join(', ')) || basic.details || ''}`
        : 'Sin coincidencias de léxico o patrones',
    },
    {
      id: 'text',
      title: '2. Análisis de texto IA',
      icon: ScanText,
      state: text.skipped ? 'skip' : (text.status === 'REJECTED' ? 'alert' : text.status === 'FLAGGED' ? 'flag' : 'ok'),
      detail: text.skipped
        ? (text.reason || 'Omitido (sin Groq o error)')
        : `${formatStatusLabel(text.status)}${text.reason ? ` — ${text.reason}` : ''}`,
    },
    {
      id: 'vision',
      title: '3. Análisis de imágenes',
      icon: ImageIcon,
      state: vision.skipped ? 'skip' : (vision.status === 'REJECTED' ? 'alert' : vision.status === 'FLAGGED' ? 'flag' : 'ok'),
      detail: vision.skipped
        ? (vision.reason || 'Sin imágenes o omitido')
        : `${formatStatusLabel(vision.status)}${vision.reason ? ` — ${vision.reason}` : ''}${vision.imagesChecked ? ` · ${vision.imagesChecked} foto(s)` : ''}`,
    },
  ];
}

function collectCategories(item) {
  const set = new Set([
    ...((item?.basicFilterResult?.categories) || []),
    ...((item?.aiResult?.categories) || []),
    ...((item?.aiResult?.text?.categories) || []),
    ...((item?.aiResult?.vision?.categories) || []),
  ]);
  return [...set];
}

const IAModerationStub = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [aiStatus, setAiStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Soy el Guard. No bloqueo altas: las intercepto y te las listo. Abrí un caso o mirá los ejemplos de detección.' },
  ]);
  const [draft, setDraft] = useState('');
  const [chatBusy, setChatBusy] = useState(false);

  const examples = stats?.examples?.length ? stats.examples : FALLBACK_EXAMPLES;

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== 'ALL' && item.resourceType !== typeFilter) return false;
      if (!term) return true;
      const blob = [item.title, item.summary, item.reason, item.resourceType, item.analyzedText]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(term);
    });
  }, [items, query, typeFilter]);

  const load = async (nextFilter = filter, keepId = selectedId) => {
    if (!token) return;
    try {
      setError(null);
      const [status, moderationStats, logs] = await Promise.all([
        getAiStatus(token),
        getModerationStats(token),
        getModerationLogs(token, nextFilter),
      ]);
      const list = Array.isArray(logs) ? logs : [];
      setAiStatus(status);
      setStats(moderationStats);
      setItems(list);
      const stillThere = list.some((item) => item.id === keepId);
      const nextSelected = stillThere
        ? keepId
        : (preferAutoSelect() ? (list[0]?.id || null) : null);
      setSelectedId(nextSelected);
      const current = list.find((item) => item.id === nextSelected);
      setNotes(current?.adminNotes || '');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'No se pudo cargar AI Guard');
      showToast('No se pudo cargar AI Guard.', 'error');
    }
  };

  useEffect(() => {
    load(filter, null);
  }, [token]);

  const handleFilter = (id) => {
    setFilter(id);
    load(id, null);
  };

  const openCase = (item) => {
    setSelectedId(item.id);
    setNotes(item.adminNotes || '');
  };

  const handleReview = async (action) => {
    if (!selected) return;
    setBusyId(selected.id);
    try {
      await reviewModeration(selected.id, { action, adminNotes: notes || '' }, token);
      showToast(
        action === 'approve'
          ? 'Caso cerrado: decisión admin = en orden. La ficha no se publica sola.'
          : 'Caso cerrado: alerta confirmada por admin. La ficha no se oculta sola.',
        'success'
      );
      await load(filter, null);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleChat = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || chatBusy) return;
    const context = selected
      ? `\n\nCaso abierto: ${selected.resourceType} #${selected.resourceId || 'sin ficha'} — ${selected.title}\nMotivo: ${selected.reason || 'sin motivo'}\nTexto:\n${String(selected.analyzedText || '').slice(0, 1200)}`
      : '';
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setDraft('');
    setChatBusy(true);
    try {
      const payload = [
        ...next.filter((msg, index) => !(index === 0 && msg.role === 'assistant')),
      ];
      if (context) {
        payload[payload.length - 1] = { role: 'user', content: `${text}${context}` };
      }
      const { reply } = await sendAiChat(payload, token);
      setMessages([...next, { role: 'assistant', content: reply || 'No pude armar una respuesta.' }]);
    } catch (err) {
      const message = assistantFriendlyError(err);
      showToast(message, 'error');
      setMessages([...next, { role: 'assistant', content: message }]);
    } finally {
      setChatBusy(false);
    }
  };

  const configured = Boolean(aiStatus?.configured);
  const steps = selected ? pipelineSteps(selected) : [];
  const categories = selected ? collectCategories(selected) : [];
  const fieldsAnalyzed = selected?.aiResult?.fieldsAnalyzed || [];

  return (
    <div className="ia-guard">
      <header className="ia-guard-header">
        <div>
          <div className="ia-guard-kicker">
            <ShieldCheck size={16} />
            Interceptor de contenido
          </div>
          <h3>AI Guard</h3>
          <p>
            No bloquea altas ni ediciones. Analiza texto e imágenes, deja el caso acá y vos decidís.
            Cerrar un caso del Guard no publica ni oculta la ficha: eso se hace en Comercios, Eventos o Revista.
          </p>
        </div>
        <div className={`ia-guard-chip ${configured ? 'ok' : 'warn'}`}>
          {configured ? 'Groq activo (texto + imágenes)' : 'Sin API key — solo filtro local'}
        </div>
      </header>

      <div className="ia-guard-how">
        <div className="ia-guard-how-card">
          <Filter size={18} />
          <div>
            <strong>1. Filtro local</strong>
            <p>Léxico y patrones: insultos, estafa, sexual, spam, tarjetas.</p>
          </div>
        </div>
        <div className="ia-guard-how-card">
          <ScanText size={18} />
          <div>
            <strong>2. Texto IA</strong>
            <p>Groq clasifica el mensaje con categorías y motivo en español.</p>
          </div>
        </div>
        <div className="ia-guard-how-card">
          <ImageIcon size={18} />
          <div>
            <strong>3. Imágenes</strong>
            <p>Revisa hasta 5 fotos: nudez, sexual o violencia → alerta.</p>
          </div>
        </div>
      </div>

      <div className="ia-guard-guide">
        <button type="button" className="ia-guard-guide-toggle" onClick={() => setGuideOpen((v) => !v)}>
          <BookOpen size={16} />
          {guideOpen ? 'Ocultar ejemplos de detección' : 'Ver ejemplos: cómo detecta y por qué'}
        </button>
        {guideOpen && (
          <div className="ia-guard-examples">
            <p className="ia-guard-examples-lead">
              Ejemplos sanitizados para entender el criterio. Entrada → paso → por qué → resultado.
            </p>
            <div className="ia-guard-examples-grid">
              {examples.map((ex) => (
                <article key={`${ex.category}-${ex.title}`} className={`ia-guard-example ${ex.category}`}>
                  <header>
                    <span>{categoryLabel(ex.category)}</span>
                    <strong>{ex.title}</strong>
                  </header>
                  <p className="ia-guard-example-input">“{ex.input}”</p>
                  <ul>
                    <li><em>Paso:</em> {ex.step}</li>
                    <li><em>Por qué:</em> {ex.why}</li>
                    <li><em>Resultado:</em> {ex.resultLabel || ex.result}</li>
                  </ul>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="ia-guard-error">{error}</p>}

      <div className="ia-guard-stats">
        <button type="button" className={filter === 'pending' ? 'on' : ''} onClick={() => handleFilter('pending')}>
          <strong>{stats?.pendingReview ?? 0}</strong>
          <span>Por revisar</span>
        </button>
        <button type="button" className={filter === 'all' ? 'on' : ''} onClick={() => handleFilter('all')}>
          <strong>{stats?.total ?? 0}</strong>
          <span>Interceptados</span>
        </button>
        <button type="button" className={filter === 'approved' ? 'on' : ''} onClick={() => handleFilter('approved')}>
          <strong>{stats?.approved ?? 0}</strong>
          <span>En orden IA</span>
        </button>
        <button type="button" className={filter === 'flagged' ? 'on' : ''} onClick={() => handleFilter('flagged')}>
          <strong>{stats?.flagged ?? 0}</strong>
          <span>Marcados IA</span>
        </button>
        <button type="button" className={filter === 'rejected' ? 'on' : ''} onClick={() => handleFilter('rejected')}>
          <strong>{stats?.rejected ?? 0}</strong>
          <span>Alerta IA</span>
        </button>
      </div>

      <div className={`ia-guard-shell ${selected ? 'has-detail' : ''}`}>
        <aside className="ia-guard-list">
          <div className="ia-guard-list-bar">
            <div className="ia-guard-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, tipo o texto…"
              />
            </div>
            <div className="ia-guard-filters">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={filter === item.id ? 'on' : ''}
                  onClick={() => handleFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="ia-guard-filters types">
              {TYPE_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={typeFilter === item.id ? 'on' : ''}
                  onClick={() => setTypeFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="ia-guard-empty">
              <Info size={18} />
              <p>
                {filter === 'pending'
                  ? 'No hay casos pendientes. Mirá los ejemplos arriba para ver cómo detecta.'
                  : 'No hay registros con este filtro.'}
              </p>
              {!guideOpen && (
                <button type="button" className="ia-guard-linkish" onClick={() => setGuideOpen(true)}>
                  Ver ejemplos de detección
                </button>
              )}
            </div>
          ) : (
            <ul>
              {visible.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`ia-guard-row ${selectedId === item.id ? 'selected' : ''}`}
                    onClick={() => openCase(item)}
                  >
                    <span className="ia-guard-row-icon">{typeIcon(item.resourceType)}</span>
                    <span className="ia-guard-row-body">
                      <strong>{item.title}</strong>
                      <small>{item.reason || item.summary}</small>
                      <em>{formatEnumLabel(item.resourceType)} · {formatWhen(item.createdAt)}</em>
                    </span>
                    <span className={`ia-guard-pill ${String(item.status || '').toLowerCase()}`}>
                      {aiSeverityLabel(item.status, item.reviewedAt)}
                    </span>
                    <ChevronRight size={16} className="ia-guard-row-chevron" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="ia-guard-detail">
          {selected ? (
            <>
              <button type="button" className="ia-guard-back" onClick={() => setSelectedId(null)}>
                <ChevronLeft size={16} /> Volver a la lista
              </button>

              <div className="ia-guard-detail-head">
                <div>
                  <span className="ia-guard-type">
                    {typeIcon(selected.resourceType)}
                    {formatEnumLabel(selected.resourceType)}
                    {selected.resourceId ? ` #${selected.resourceId}` : ' · sin ficha aún'}
                  </span>
                  <h4>{selected.title}</h4>
                  <p className="ia-guard-when">
                    <Clock size={14} />
                    Interceptado {formatWhen(selected.createdAt)}
                    {selected.reviewedAt && ` · cerrado ${formatWhen(selected.reviewedAt)}`}
                  </p>
                </div>
                <span className={`ia-guard-pill lg ${String(selected.status || '').toLowerCase()}`}>
                  {aiSeverityLabel(selected.status, selected.reviewedAt)}
                </span>
              </div>

              {selected.reason && (
                <div className="ia-guard-reason">
                  <ShieldAlert size={16} />
                  <div>
                    <strong>Por qué está acá</strong>
                    <p>{selected.reason}</p>
                  </div>
                </div>
              )}

              {categories.length > 0 && (
                <div className="ia-guard-cats">
                  {categories.map((cat) => (
                    <span key={cat}>{categoryLabel(cat)}</span>
                  ))}
                </div>
              )}

              {(selected.similarExample || examples.find((ex) => categories.includes(ex.category))) && (
                <div className="ia-guard-similar">
                  <BookOpen size={15} />
                  <div>
                    <strong>Parecido a un ejemplo de la guía</strong>
                    <p>
                      {(selected.similarExample || examples.find((ex) => categories.includes(ex.category)))?.title}
                      {' — '}
                      {(selected.similarExample || examples.find((ex) => categories.includes(ex.category)))?.why}
                    </p>
                  </div>
                </div>
              )}

              <div className="ia-guard-pipeline">
                <strong>Cómo verificó este caso</strong>
                <div className="ia-guard-pipeline-steps">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className={`ia-guard-step ${step.state}`}>
                        <Icon size={16} />
                        <div>
                          <span>{step.title}</span>
                          <p>{step.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {fieldsAnalyzed.length > 0 && (
                <div className="ia-guard-fields">
                  <strong>Campos analizados</strong>
                  <div>
                    {fieldsAnalyzed.map((field) => (
                      <span key={field}>{field}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.resource && (
                <div className="ia-guard-resource">
                  <strong>Ficha vinculada</strong>
                  <p>
                    {selected.resource.subtitle}
                    {selected.resource.status && ` · ${formatStatusLabel(selected.resource.status)}`}
                    {selected.resource.category && ` · ${formatEnumLabel(selected.resource.category)}`}
                  </p>
                  <div className="ia-guard-links">
                    {selected.resource.href && (
                      <Link to={selected.resource.href}>
                        Abrir en admin <ExternalLink size={14} />
                      </Link>
                    )}
                    {selected.resource.publicHref && (
                      <Link to={selected.resource.publicHref}>
                        Ver público <ExternalLink size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className="ia-guard-block">
                <strong>Texto interceptado</strong>
                <pre>{selected.analyzedText || 'Sin texto guardado.'}</pre>
              </div>

              {!selected.reviewedAt ? (
                <div className="ia-guard-actions">
                  <label>
                    Nota interna
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Qué viste, qué falta, si hay que hablar con el dueño…"
                      rows={3}
                    />
                  </label>
                  <p className="ia-guard-hint">
                    Estas acciones son la <strong>decisión del admin</strong>. No cambian el estado público de la ficha.
                  </p>
                  <div className="ia-guard-action-row">
                    <button
                      type="button"
                      disabled={busyId === selected.id}
                      onClick={() => handleReview('approve')}
                    >
                      {busyId === selected.id ? <Loader2 size={15} className="spinning" /> : <CheckCircle size={15} />}
                      Marcar en orden
                    </button>
                    <button
                      type="button"
                      className="danger"
                      disabled={busyId === selected.id}
                      onClick={() => handleReview('reject')}
                    >
                      <XCircle size={15} /> Confirmar alerta
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ia-guard-closed">
                  Decisión admin registrada por {selected.reviewer?.name || selected.reviewer?.username || 'un admin'}
                  {selected.adminNotes ? `: ${selected.adminNotes}` : '.'}
                </div>
              )}
            </>
          ) : (
            <div className="ia-guard-empty detail">
              <Sparkles size={22} />
              <h4>Elegí un caso</h4>
              <p>Tocá una fila para ver cómo verificó, el porqué y los ejemplos parecidos.</p>
              {!guideOpen && (
                <button type="button" className="ia-guard-linkish" onClick={() => setGuideOpen(true)}>
                  Ver ejemplos de detección
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      <div className={`ia-guard-chat ${chatOpen ? 'open' : ''}`}>
        <button type="button" className="ia-guard-chat-toggle" onClick={() => setChatOpen((prev) => !prev)}>
          <MessageSquare size={16} />
          {chatOpen ? 'Ocultar consulta al Guard' : 'Consultar al Guard (opcional)'}
        </button>
        {chatOpen && (
          <>
            <div className="ia-guard-chat-log">
              {messages.map((msg, i) => (
                <div key={i} className={`ia-guard-bubble ${msg.role}`}>
                  <strong>{msg.role === 'user' ? 'Vos' : 'Guard'}</strong>
                  <p>{msg.content}</p>
                </div>
              ))}
              {chatBusy && (
                <div className="ia-guard-bubble assistant">
                  <Loader2 size={14} className="spinning" /> Pensando
                </div>
              )}
            </div>
            <form onSubmit={handleChat}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={selected ? 'Preguntá sobre este caso…' : 'Pegá un texto o preguntá cómo validar…'}
                disabled={chatBusy}
              />
              <button type="submit" disabled={chatBusy || !draft.trim()} aria-label="Enviar">
                {chatBusy ? <Loader2 size={16} className="spinning" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default IAModerationStub;
