import { test, expect } from '@playwright/test';
import { mockBackend, loginAs } from './helpers.js';

test.describe('Auth y RBAC', () => {
  test('login USER muestra Sumar mi Comercio y no Admin', async ({ page }) => {
    await mockBackend(page, { role: 'USER' });
    await loginAs(page, 'USER');
    await expect(page.getByText('Sumar mi Comercio')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
  });

  test('login OWNER muestra Mis Comercios y Mis Eventos', async ({ page }) => {
    await mockBackend(page, { role: 'OWNER' });
    await loginAs(page, 'OWNER');
    await expect(page.getByTitle('Mis Comercios')).toBeVisible();
    await expect(page.getByTitle('Mis Eventos')).toBeVisible();
  });

  test('login ADMIN muestra acceso Admin', async ({ page }) => {
    await mockBackend(page, { role: 'ADMIN' });
    await loginAs(page, 'ADMIN');
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('USER no entra a /admin/dashboard', async ({ page }) => {
    await mockBackend(page, { role: 'USER' });
    await loginAs(page, 'USER');
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/');
  });

  test('login muestra Email o usuario y el asistente aparece en home', async ({ page }) => {
    await mockBackend(page, { role: 'USER' });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /abrir asistente/i })).toBeVisible();
    await page.goto('/login');
    await expect(page.locator('#identifier')).toHaveAttribute('placeholder', /admin@pandora.com o admin/i);
    await expect(page.getByLabel(/email o usuario/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /abrir asistente/i })).toHaveCount(0);
  });
});
