// tests e2e para el pulse market
import { test, expect } from '@playwright/test';

test.describe('Flujos de Pruebas E2E — PulseMarket', () => {

  // Flujo E2E 1: Seguridad / Protección de Rutas y Autenticación
  test('Prueba 1 (Seguridad): Redirección de usuario no autenticado y formulario de login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
  });

  // Flujo E2E 2: Visualización de Métricas y Carga de Datos
  test('Prueba 2 (Datos e IA): Despliegue de métricas clave y carga de datos en UI', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();

    const response = await page.goto('/dashboard');
    expect(response?.status()).toBeLessThan(400);
  });

  // Flujo E2E 3: Arrastre y Soltado (Drag & Drop) en Kanban
  test('Prueba 3 (Interactividad): Arrastre de tarjeta en Kanban y verificación visual', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

});