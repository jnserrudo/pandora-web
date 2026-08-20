import { test as base } from '@playwright/test';

const PROFILES = {
  USER: { id: 5, name: 'Usuario Test', email: 'user@pandora.com', username: 'user', role: 'USER' },
  OWNER: { id: 8, name: 'Dueño Test', email: 'owner@pandora.com', username: 'owner', role: 'OWNER' },
  ADMIN: { id: 1, name: 'Admin Test', email: 'admin@pandora.com', username: 'admin', role: 'ADMIN' },
};

export async function mockBackend(page, { role = 'USER', ...state } = {}) {
  const store = {
    profile: PROFILES[role],
    commercesMine: state.commercesMine || [],
    commercesAll: state.commercesAll || [],
    events: state.events || [],
    eventsMine: state.eventsMine || [],
    submissions: state.submissions || [],
    categories: state.categories || [
      { id: 1, name: 'Gastronomía', slug: 'GASTRONOMIA' },
    ],
    createdCommerce: null,
    replies: [],
    ...state,
  };

  await page.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (!url.includes(':3000')) {
      return route.continue();
    }

    const parsed = new URL(url);
    const method = req.method();
    const path = parsed.pathname.replace(/\/$/, '') || '/';

    const json = (data, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(data),
      });

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': '*',
        },
      });
    }

    if (path === '/api/auth/login' && method === 'POST') {
      return json({ accessToken: `token-${role}`, refreshToken: `refresh-${role}` });
    }
    if (path === '/api/users/me') {
      return json(store.profile);
    }
    if (path === '/stats-public/stats') {
      return json({ articles: 2, events: 1, commerces: 3, plans: 3 });
    }
    if (path === '/api/notifications') {
      return json([]);
    }
    if (path === '/api/categories' || path === '/api/categories/') {
      return json(store.categories);
    }
    if (path === '/api/commerces/me') {
      return json(store.commercesMine);
    }
    if (path === '/api/commerces' && method === 'GET') {
      return json(store.commercesAll);
    }
    if (path === '/api/commerces' && method === 'POST') {
      store.createdCommerce = {
        id: 99,
        name: 'Cafe E2E',
        status: 'PENDING',
        ownerId: store.profile.id,
      };
      store.commercesMine = [store.createdCommerce];
      return json(store.createdCommerce, 201);
    }
    if (path.match(/^\/api\/commerces\/\d+\/validate$/) && method === 'PUT') {
      return json({ id: 7, status: 'ACTIVE', name: 'Cafe E2E' });
    }
    if (path === '/api/events' && method === 'GET') {
      return json(store.events);
    }
    if (path === '/api/events' && method === 'POST') {
      const created = { id: 20, name: 'Peña E2E', status: 'PENDING' };
      store.eventsMine.push(created);
      return json(created, 201);
    }
    if (path === '/api/events/my-events') {
      return json(store.eventsMine);
    }
    if (path === '/api/submissions' && method === 'POST') {
      return json({ id: 3, type: 'CONTACT', status: 'PENDING', message: 'Hola' }, 201);
    }
    if (path === '/api/submissions' && method === 'GET') {
      return json(store.submissions);
    }
    if (path.match(/^\/api\/submissions\/\d+\/reply$/) && method === 'PATCH') {
      store.replies.push(true);
      return json({ id: 3, status: 'RESPONDED' });
    }
    if (path === '/api/articles') {
      return json({ articles: [], meta: { total: 0, page: 1, limit: 10 } });
    }
    if (path === '/api/advertisements') {
      return json([]);
    }
    if (path === '/api/plans') {
      return json([]);
    }
    if (path === '/api/search') {
      return json({ commerces: [], events: [], articles: [] });
    }
    if (path === '/api/ai/assistant' && method === 'POST') {
      return json({
        reply: 'PANDORA te ayuda a explorar Salta.',
        intent: 'overview',
        actions: [{ label: 'Ver comercios', to: '/commerces' }],
        items: [],
      });
    }
    if (path.includes('/feedback/') || path.includes('/advisories')) {
      return json([]);
    }

    return json(method === 'GET' ? [] : {});
  });

  return store;
}

export async function loginAs(page, role) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#identifier').waitFor({ state: 'visible', timeout: 15000 });
  await page.fill('#identifier', `${role.toLowerCase()}@pandora.com`);
  await page.fill('#password', 'password123');
  await page.click('[data-testid="auth-submit"]');
  await page.waitForURL(/\/$|\/\?/, { timeout: 15000 });
}

export const test = base;
