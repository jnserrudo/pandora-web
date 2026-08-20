import { test, expect } from '@playwright/test';
import { mockBackend, loginAs } from './helpers.js';

test.describe('Comercios', () => {
  test('USER crea comercio y lo ve en Mis Comercios', async ({ page }) => {
    const store = await mockBackend(page, { role: 'USER' });
    await loginAs(page, 'USER');
    await page.goto('/commerces/create');
    await expect(page.getByRole('heading', { name: 'Publicar mi Comercio' })).toBeVisible();

    await page.locator('input[name="name"]').fill('Cafe E2E');
    await page.locator('.categories-grid').getByText('Gastronomía').click();
    await page.locator('input[name="shortDescription"]').fill('Cafe de prueba e2e');
    await page.locator('textarea[name="description"]').fill('Descripcion completa del cafe de prueba para el flujo.');
    await page.locator('input[name="address"]').fill('Caseros 100');
    const hours = page.locator('input[name="openingHours"], textarea[name="openingHours"]');
    if (await hours.count()) {
      await hours.first().fill('Lun a Vie 8 a 20');
    }

    await page.getByRole('button', { name: 'Enviar Solicitud' }).click();
    await page.waitForURL('**/my-commerces');
    await expect(page.getByText('Cafe E2E')).toBeVisible();
    expect(store.createdCommerce).toBeTruthy();
  });

  test('ADMIN aprueba un comercio pendiente', async ({ page }) => {
    await mockBackend(page, {
      role: 'ADMIN',
      commercesAll: [
        { id: 7, name: 'Cafe E2E', status: 'PENDING', category: 'GASTRONOMIA', address: 'Caseros 100', isActive: true },
      ],
    });
    await loginAs(page, 'ADMIN');
    await page.goto('/admin/commerces');
    await expect(page.getByText('Cafe E2E')).toBeVisible();
    await page.getByTitle('Aprobar').click();
    await expect(page.getByRole('heading', { name: 'Aprobar Comercio' })).toBeVisible();
    await page.getByRole('button', { name: 'Aceptar y Validar' }).click();
  });
});
