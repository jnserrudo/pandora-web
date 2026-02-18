# Prompt Maestro: Sincronización Pandora Web → Mobile

Este prompt está diseñado para ser pegado en una nueva sesión de Antigravity dentro del proyecto **Pandora Mobile**. Su objetivo es realizar una auditoría de paridad y planificar la implementación de todas las mejoras realizadas en la versión Web.

---

## 🎯 Objetivo
Sincronizar la aplicación móvil de Pandora con la versión Web v2.0, alcanzando paridad total en funcionalidades avanzadas, estética premium y herramientas de gestión.

## 📋 Contexto de Funcionalidades a Integrar
La versión Web ha completado 14 fases de desarrollo. Necesito que analices el código móvil actual y prepares un plan para integrar:

### [Funcionalidades de Vanguardia (v2.0)]
1.  **Estética y UX Premium**: Neo-Glassmorphism, transiciones suaves y Splash Screen.
2.  **Sistema de Publicidades (Ads)**: Banners dinámicos en Feed y Magazine.
3.  **Búsqueda Global**: Indexación de Comercios, Eventos y Artículos.
4.  **Agenda Artística (Calendario)**: Filtros avanzados y vista mensual nativa.
5.  **Dashboard de Admin Hub**: Analytics, Moderación IA y el nuevo **Submission Hub** para gestionar contactos, publicidad y pagos en un solo lugar.
6.  **Buzón de Mensajes (Inbox)**: Nueva vista para que el usuario rastree sus tickets y vea respuestas del Admin.
7.  **Suscripciones y Pagos Dinámicos**:
    *   **Pricing Dinámico**: Los planes y precios vienen de la API.
    *   **Cupones**: Sistema de validación de códigos de descuento.
    *   **Comprobantes**: Carga obligatoria de comprobante (imagen/PDF) para upgrades de plan.

### [Technical Reference - API Sync]
Es CRÍTICO que la aplicación móvil utilice los mismos endpoints y contratos que la versión Web:
*   **Submissions**: `POST /api/submissions` (crear ticket), `GET /api/submissions/me` (ver mis tickets), `PATCH /api/submissions/:id/reply` (Admin).
*   **Planes y Cobros**: `GET /api/plans` (tarifario dinámico), `POST /api/coupons/validate` (cupones), `GET /api/plans/history` (auditoría).
*   **Comercios**: `GET /api/commerces`, `GET /api/commerces/:id`, `PUT /api/commerces/:id/validate`.
*   **Favoritos**: `POST /api/favorites/toggle` (payload: `{ resourceId, resourceType }`).
*   **Notificaciones**: `GET /api/notifications` (Service: `NotificationService.js`).
*   **Borrado Lógico**: Uso de `isActive: boolean` en todos los recursos.

## 🚀 Instrucciones para Antigravity (Mobile) - MODO AUDITORÍA TOTAL
No te limites a esta lista; actúa como un Arquitecto Senior encargado de la **Paridad Total**. Tu misión es:

1.  **Auditoría de Descubrimiento**: Compara tu estructura con los archivos `implementation_plan.md` y `backend_instructions_complete.md` de la Web. Identifica faltantes en el sistema de tickets y validación de pagos.
2.  **Sincronización de Capas Lógicas**: 
    *   **Pago y Validación**: Implementar el flujo donde al elegir Nivel > 1, se dispare la carga de imagen y se cree una `Submission` de tipo `PLAN_UPGRADE`.
    *   **Inbox y Respuestas**: Crear la vista de "Mis Mensajes" que consuma `/api/submissions/me`.
3.  **Gestión de Tarifas**: Implementar la lógica de cupones en la vista de Upgrade de Plan.
4.  **Mapa de Ruta Crítico**: Prioriza:
    *   Flujo de Submissions y Carga de Comprobantes.
    *   Inbox del Usuario y Admin Submission Hub (si aplica en mobile).
    *   Paridad Estética (v2.0 Glassmorphism).

---
**CRITERIO DE ÉXITO**: Al finalizar, la app móvil debe soportar el sistema unificado de tickets y pagos con la misma transparencia, estética premium (v2.0) y fluidez que la versión Web.

---
**Nota para el Agente**: "Utiliza el archivo `REPORT_FINAL_CLIENTE.md` de la versión web como referencia de la visión final del producto."
