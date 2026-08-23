// LegalPage needs :type from route — use wrapper routes with fixed type
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './LegalPage.css';

const CONTENT = {
  terminos: {
    title: 'Términos de uso',
    updated: 'Agosto 2026',
    sections: [
      {
        heading: '1. Qué es Pandora',
        body: 'Pandora es una plataforma de descubrimiento local para Salta: comercios, eventos y revista. No es un e-commerce ni una app de pedidos. Al usar el sitio o la app aceptás estos términos.'
      },
      {
        heading: '2. Cuentas',
        body: 'Sos responsable de la información que cargás y de cuidar tu acceso. Los datos de contacto y las fichas deben ser veraces. Podemos suspender cuentas que incumplan estas reglas o la ley.'
      },
      {
        heading: '3. Contenido publicado',
        body: 'Dueños y usuarios conservan derechos sobre su contenido, y nos otorgan licencia para mostrarlo en Pandora (web y app). Nos reservamos el derecho a moderar, rechazar o retirar fichas, eventos, comentarios y notas que sean engañosos, ofensivos o incompletos.'
      },
      {
        heading: '4. Planes y pagos',
        body: 'Algunas funciones de visibilidad pueden requerir un plan pago. Los precios y beneficios vigentes se muestran en Planes. Comprobantes y validaciones siguen el proceso de revisión del equipo Pandora.'
      },
      {
        heading: '5. Uso aceptable',
        body: 'No está permitido spam, contenido ilegal, suplantar identidades, ni intentar vulnerar la seguridad del servicio. El asistente y las herramientas de moderación son apoyos; la decisión final sobre publicación puede ser humana.'
      },
      {
        heading: '6. Contacto',
        body: 'Consultas sobre estos términos: usá la página de Contacto o el canal que indiquemos públicamente.'
      }
    ]
  },
  privacidad: {
    title: 'Política de privacidad',
    updated: 'Agosto 2026',
    sections: [
      {
        heading: '1. Datos que tratamos',
        body: 'Podemos tratar datos de cuenta (nombre, email, usuario, DNI si lo cargás), datos de fichas comerciales (dirección, teléfono, fotos), mensajes de contacto y datos técnicos de uso (p. ej. búsquedas agregadas) para operar y mejorar el servicio.'
      },
      {
        heading: '2. Para qué los usamos',
        body: 'Para autenticarte, mostrar contenido público, validar altas, enviarte notificaciones relacionadas con tu cuenta o tus comercios, y cumplir obligaciones legales. No vendemos tu lista de contactos.'
      },
      {
        heading: '3. Fotos y archivos',
        body: 'Las imágenes que subís pueden alojarse en servicios de almacenamiento o CDN. Las fotos de demostración viven en el servidor de Pandora bajo rutas /seed/.'
      },
      {
        heading: '4. Conservación y seguridad',
        body: 'Guardamos la información mientras tu cuenta o el contenido estén activos, o el tiempo que exija la ley. Aplicamos medidas razonables de acceso y transporte (HTTPS), sin garantizar seguridad absoluta en internet.'
      },
      {
        heading: '5. Tus derechos',
        body: 'Podés pedir acceso, corrección o baja de tu cuenta a través de Contacto. Algunas fichas públicas pueden permanecer visibles hasta que se complete la revisión o el proceso de baja.'
      },
      {
        heading: '6. Cambios',
        body: 'Si actualizamos esta política, la fecha de revisión cambiará en esta página. El uso continuado implica conocimiento de la versión vigente.'
      }
    ]
  }
};

const LegalPage = ({ type }) => {
  const doc = CONTENT[type];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  if (!doc) return null;

  return (
    <div className="legal-page-wrapper">
      <Navbar />
      <article className="legal-container">
        <header className="legal-header">
          <p className="legal-kicker">Pandora · Salta</p>
          <h1>{doc.title}</h1>
          <p className="legal-updated">Última actualización: {doc.updated}</p>
        </header>
        {doc.sections.map((section) => (
          <section key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <p className="legal-back">
          <Link to="/">Volver al inicio</Link>
          {' · '}
          <Link to="/contact">Contacto</Link>
        </p>
      </article>
      <Footer />
    </div>
  );
};

export default LegalPage;
