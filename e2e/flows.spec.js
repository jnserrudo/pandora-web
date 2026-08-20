import { test, expect } from '@playwright/test';
import { mockBackend, loginAs } from './helpers.js';

test.describe('Eventos y submissions', () => {
  test('OWNER puede abrir el alta de evento', async ({ page }) => {
    await mockBackend(page, {
      role: 'OWNER',
      commercesMine: [{ id: 1, name: 'La Casona', status: 'ACTIVE' }],
    });
    await loginAs(page, 'OWNER');
    await page.goto('/events/create');
    await expect(page).toHaveURL(/\/events\/create/);
  });

  test('visitante ve eventos SCHEDULED en /events', async ({ page }) => {
    await mockBackend(page, {
      role: 'USER',
      events: [
        {
          id: 20,
          name: 'Noche de Folklore',
          status: 'SCHEDULED',
          isActive: true,
          startDate: new Date().toISOString(),
          commerce: { name: 'La Casona' },
        },
      ],
    });
    await page.goto('/events');
    await expect(page.getByText('Noche de Folklore').first()).toBeVisible({ timeout: 10000 });
  });

  test('contacto crea submission', async ({ page }) => {
    await mockBackend(page, { role: 'USER' });
    await page.goto('/contact');
    await page.locator('input[name="name"]').fill('Ana Perez');
    await page.locator('input[name="email"]').fill('ana@test.com');
    await page.locator('textarea[name="message"]').fill('Quiero sumar mi local');
    await page.getByRole('button', { name: /enviar mensaje/i }).click();
    await expect(page.getByText(/mensaje enviado/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('ADMIN responde una submission', async ({ page }) => {
    await mockBackend(page, {
      role: 'ADMIN',
      submissions: [
        {
          id: 3,
          name: 'Ana Perez',
          type: 'CONTACT',
          status: 'PENDING',
          message: 'Quiero sumar mi local',
          createdAt: new Date().toISOString(),
        },
      ],
    });
    await loginAs(page, 'ADMIN');
    await page.goto('/admin/submissions');
    await expect(page.getByText('Ana Perez')).toBeVisible();
    await page.getByTitle('Responder / Resolver').click();
    await page.locator('textarea').last().fill('Te contactamos mañana');
    await page.getByRole('button', { name: 'Enviar Respuesta' }).click();
    await expect(page.getByText(/enviada|correctamente/i)).toBeVisible();
  });
});
