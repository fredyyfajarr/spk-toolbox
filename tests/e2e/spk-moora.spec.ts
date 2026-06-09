import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
});

test("sample project covers the main MOORA workflow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MOORA Engine" })).toBeVisible();
  await expect(page.getByText("Pemilihan Laptop Terbaik")).toBeVisible();

  await page.getByRole("link", { name: /Buka/ }).click();
  await expect(
    page.getByRole("heading", { name: "Setup Kriteria & Bobot" })
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Total bobot: 1.000")).toBeVisible();

  await page.getByRole("link", { name: /Lanjut ke Input Data/ }).click();
  await expect(
    page.getByRole("heading", { name: "Input Data Alternatif" })
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("row", { name: "1 A1 Laptop A 12000 16 512 85 8" })
  ).toBeVisible();

  await page.getByRole("link", { name: /Lanjut Kalkulasi/ }).click();
  await expect(page.getByRole("heading", { name: "Kalkulasi MOORA" })).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("button", { name: "Matriks Keputusan Awal" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Skor Yi" })).toBeVisible();

  await page.getByRole("link", { name: /Lihat Hasil/ }).click();
  await expect(page.getByRole("heading", { name: "Hasil & Ranking" })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("A3 - Laptop C")).toBeVisible();
  await expect(page.getByText("Tabel Ranking")).toBeVisible();
  await expect(page.getByText("Bar Chart Skor Yi")).toBeVisible();
  await expect(page.getByText("Radar Chart Matriks Terbobot")).toBeVisible();
});

test("alternative value input can clear zero without selecting all", async ({ page }) => {
  await page.goto("/project/sample-laptop-moora/alternatives");

  const firstValueInput = page.locator('input[type="number"]').first();
  await firstValueInput.fill("0");
  await expect(firstValueInput).toHaveValue("0");

  await firstValueInput.press("Backspace");
  await expect(firstValueInput).toHaveValue("");
  await expect(page.getByText("1 sel belum diisi")).toBeVisible();
});

test("criteria weight input can clear zero while editing", async ({ page }) => {
  await page.goto("/project/sample-laptop-moora/criteria");

  const firstWeightInput = page.locator('input[type="number"]').first();
  await firstWeightInput.fill("0");
  await expect(firstWeightInput).toHaveValue("0");

  await firstWeightInput.press("Backspace");
  await expect(firstWeightInput).toHaveValue("");
  await expect(page.getByText(/Total bobot:/)).toBeVisible();
});
