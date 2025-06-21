// @ts-check
import { test, expect } from '@playwright/test';

// Pruebas Playwright para Milo's Adventure

test.describe("Milo's Adventure - Página principal", () => {
  test('1. El título de la página es correcto', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    await expect(page).toHaveTitle(/Milo's Adventure/);
  });

  test('2. El menú de navegación contiene todos los enlaces esperados', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const links = await page.locator('.nav-list-link');
    await expect(links).toHaveCount(5);
    await expect(links.nth(0)).toHaveText('About');
    await expect(links.nth(1)).toHaveText('Design');
    await expect(links.nth(2)).toHaveText('Characters');
    await expect(links.nth(3)).toHaveText('Gameplay');
    await expect(links.nth(4)).toHaveText('Profile');
  });

  test('3. El botón “Start” existe y dirige a scene1.html', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const startBtn = page.locator('.start-btn a');
    await expect(startBtn).toHaveAttribute('href', 'scene1.html');
  });

  test('4. El enlace “Profile” abre perfil.html en una nueva pestaña', async ({ page, context }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a[href="perfil.html"]'),
    ]);
    await expect(newPage).toHaveURL('https://franciscocamareno.github.io/Milos-Adventure/perfil.html');
  });

  test('5. La sección “About” está presente y contiene texto', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeVisible();
    await expect(aboutSection).toContainText('Step into the world of adventure');
  });

  test('6. La sección “Design” muestra la paleta de colores', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const palette = page.locator('.palette .color');
    await expect(palette).toHaveCount(5);
    await expect(palette.nth(0)).toContainText('#2CC5F6');
    await expect(palette.nth(1)).toContainText('#36D96F');
    await expect(palette.nth(2)).toContainText('#F2A81D');
    await expect(palette.nth(3)).toContainText('#BF755A');
    await expect(palette.nth(4)).toContainText('#D93A2B');
  });

  test('7. La sección “Characters” muestra las tres tarjetas de personajes', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const cards = page.locator('.flip-card');
    await expect(cards).toHaveCount(3);
  });

  test('8. Cada tarjeta de personaje muestra el nombre e imagen en el frente', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const cardFronts = page.locator('.flip-card-front');
    await expect(cardFronts.nth(0)).toContainText('Milo');
    await expect(cardFronts.nth(0).locator('img')).toHaveAttribute('alt', 'Milo');
    await expect(cardFronts.nth(1)).toContainText('Grumpy');
    await expect(cardFronts.nth(1).locator('img')).toHaveAttribute('alt', 'Grumpy');
    await expect(cardFronts.nth(2)).toContainText('Sulky');
    await expect(cardFronts.nth(2).locator('img')).toHaveAttribute('alt', 'Sulky');
  });

  test('9. El efecto flip muestra información adicional al interactuar con una tarjeta', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const flipCard = page.locator('.flip-card').first();
    await flipCard.hover();
    // Espera que el reverso sea visible (puede requerir ajuste según implementación CSS)
    const back = flipCard.locator('.flip-card-back');
    await expect(back).toBeVisible();
    await expect(back).toContainText('protagonist');
  });

  test('10. La sección “Gameplay” existe aunque esté vacía', async ({ page }) => {
    await page.goto('https://franciscocamareno.github.io/Milos-Adventure/index.html');
    const gameplaySection = page.locator('#gameplay');
    await expect(gameplaySection).toBeVisible();
  });
});
