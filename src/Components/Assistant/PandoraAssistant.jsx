import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Loader2, Store, Calendar, Newspaper, LogIn } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sendAssistantChat } from '../../services/api';
import { assistantFriendlyError } from '../../utils/assistantErrors';
import AssistantMessage from './AssistantMessage';
import AssistantEntityList from './AssistantEntityList';
import './PandoraAssistant.css';

const HIDDEN_PATHS = ['/login', '/register'];
const WELCOME = {
  GUEST: 'Hola. Te ayudo a descubrir Salta en PANDORA y a hacer trámites: explorar, entrar o cargar un local.',
  USER: 'Hola. Puedo listarte lugares, decirte cómo guardar favoritos, comentar o dar de alta tu comercio.',
  OWNER: 'Hola. Te guío con tu ficha, planes, eventos PENDING y cómo responder comentarios.',
  ADMIN: 'Hola. Te llevo a las colas: comercios, eventos, buzón y AI Guard.',
};

const SHORTCUTS = [
  { id: 'commerces', label: 'Comercios', to: '/commerces', icon: Store },
  { id: 'events', label: 'Eventos', to: '/events', icon: Calendar },
  { id: 'magazine', label: 'Revista', to: '/magazine', icon: Newspaper },
];

function promptsFor(role) {
  if (role === 'ADMIN') return ['Qué cuelgo pendientes', 'Cómo valido un comercio', 'Dónde está el buzón'];
  if (role === 'OWNER') return ['Cómo cargo un evento', 'Límites de mi plan', 'Dónde respondo comentarios'];
  if (role === 'USER') return ['Mostrame comercios', 'Mostrame eventos', 'Quiero cargar mi local'];
  return ['Qué puedo hacer acá', 'Mostrame comercios', 'Mostrame eventos'];
}

const PandoraAssistant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const role = user?.role || 'GUEST';
  const { showToast } = useToast();
  const logRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME.GUEST, prompts: promptsFor('GUEST') }
  ]);

  useEffect(() => {
    setMessages([
      { role: 'assistant', content: WELCOME[role] || WELCOME.GUEST, prompts: promptsFor(role) }
    ]);
  }, [role]);

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy, open]);

  useEffect(() => {
    document.body.classList.toggle('assistant-open', open);
    return () => document.body.classList.remove('assistant-open');
  }, [open]);

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  const goTo = (to) => {
    if (!to) return;
    setOpen(false);
    navigate(to);
  };

  const sendText = async (text) => {
    if (!text || busy) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setDraft('');
    setBusy(true);
    try {
      const payload = next.filter((msg) => msg.role === 'user' || (msg.role === 'assistant' && !msg.prompts));
      const data = await sendAssistantChat(payload, location.pathname, token);
      setMessages([...next, {
        role: 'assistant',
        content: data.reply || 'No pude armar una respuesta. Probá de nuevo.',
        actions: data.actions || [],
        items: data.items || [],
      }]);
    } catch (err) {
      const message = assistantFriendlyError(err);
      showToast(message, 'error');
      setMessages([...next, { role: 'assistant', content: message }]);
    } finally {
      setBusy(false);
    }
  };

  const handleSend = (event) => {
    event.preventDefault();
    sendText(draft.trim());
  };

  return (
    <div className="pandora-assistant">
      {open && (
        <div className="assistant-panel" role="dialog" aria-label="Asistente PANDORA">
          <header className="assistant-header">
            <div className="assistant-brand">
              <span className="assistant-avatar" aria-hidden="true">
                <MessageCircle size={16} />
              </span>
              <div>
                <strong>Asistente PANDORA</strong>
                <p>Lista fichas y te lleva al detalle</p>
              </div>
            </div>
            <button type="button" className="assistant-icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <X size={18} />
            </button>
          </header>
          <div className="assistant-log" ref={logRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`assistant-row ${msg.role}`}>
                <div className={`assistant-bubble ${msg.role} ${msg.items?.length ? 'has-items' : ''}`}>
                  {msg.role === 'assistant' ? <AssistantMessage text={msg.content} /> : <p>{msg.content}</p>}
                  <AssistantEntityList items={msg.items} onOpen={goTo} />
                  {msg.actions?.length > 0 && (
                    <div className="assistant-actions">
                      {msg.actions.map((action) => (
                        <button key={action.to} type="button" onClick={() => goTo(action.to)}>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.prompts?.length > 0 && (
                    <div className="assistant-prompts">
                      {msg.prompts.map((prompt) => (
                        <button key={prompt} type="button" onClick={() => sendText(prompt)} disabled={busy}>
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="assistant-row assistant">
                <div className="assistant-bubble assistant assistant-typing">
                  <Loader2 size={14} className="spinning" />
                  <span>Pensando</span>
                </div>
              </div>
            )}
          </div>
          <div className="assistant-shortcuts" aria-label="Atajos">
            {(token
              ? SHORTCUTS
              : [...SHORTCUTS, { id: 'login', label: 'Entrar', to: '/login', icon: LogIn }]
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" onClick={() => goTo(item.to)}>
                  <Icon size={13} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <form className="assistant-form" onSubmit={handleSend}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ej: mostrame eventos, bares, la casona..."
              disabled={busy}
              aria-label="Mensaje para el asistente"
            />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="Enviar">
              {busy ? <Loader2 size={16} className="spinning" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className="assistant-fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente PANDORA'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};

export default PandoraAssistant;
