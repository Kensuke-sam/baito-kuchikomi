import { expect, test } from "@playwright/test";

const smokeRoutes = [
  { path: "/", title: /^バイト体験談マップ$/ },
  { path: "/guides", title: /^バイトの悩みガイド \| バイト体験談マップ$/ },
  { path: "/jobs", title: /^職種別バイトガイド \| バイト体験談マップ$/ },
  { path: "/areas", title: /^地域別バイトガイド \| バイト体験談マップ$/ },
  { path: "/apps", title: /^アプリ・求人サービス比較 \| バイト体験談マップ$/ },
  { path: "/list", title: /^体験談一覧 \| バイト体験談マップ$/ },
  { path: "/submit", title: /^体験談を投稿 \| バイト体験談マップ$/, robots: "noindex, follow" },
  { path: "/about", title: /^サイトについて \| バイト体験談マップ$/ },
  { path: "/guidelines", title: /^投稿ガイドライン \| バイト体験談マップ$/ },
  { path: "/terms", title: /^利用規約・免責事項 \| バイト体験談マップ$/ },
  { path: "/privacy", title: /^プライバシーポリシー \| バイト体験談マップ$/ },
  { path: "/report", title: /^通報フォーム \| バイト体験談マップ$/, robots: "noindex, follow" },
  { path: "/takedown", title: /^削除申請フォーム \| バイト体験談マップ$/, robots: "noindex, follow" },
  { path: "/official-response", title: /^当事者コメント送信 \| バイト体験談マップ$/, robots: "noindex, follow" },
] satisfies ReadonlyArray<{ path: string; title: RegExp; robots?: string }>;

for (const route of smokeRoutes) {
  test(`${route.path} renders with shared navigation`, async ({ page }) => {
    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });

    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(route.title);
    await expect(page.getByRole("main")).toBeVisible();

    const desktopNav = page.getByRole("navigation", { name: "メインナビゲーション" });
    await expect(desktopNav).toContainText("ガイド");
    await expect(desktopNav).toContainText("職種");
    await expect(desktopNav).toContainText("地域");
    await expect(desktopNav).toContainText("アプリ比較");
    await expect(desktopNav).toContainText("口コミ一覧");

    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText("コンテンツ");
    await expect(footer).toContainText("運営・安全");

    if (route.robots) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", route.robots);
    }
  });
}

test.describe("mobile header", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("menu opens and closes via navigation", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const openButton = page.getByRole("button", { name: "メニューを開く" });
    await expect(openButton).toBeVisible();
    await openButton.click();

    const mobileNav = page.getByRole("navigation", { name: "モバイルナビゲーション" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav).toContainText("ガイド");
    await expect(mobileNav).toContainText("口コミ一覧");

    await mobileNav.getByRole("link", { name: "ガイド" }).click();
    await expect(page).toHaveURL(/\/guides$/);
    await expect(page.getByRole("heading", { level: 1, name: "辞めたい、きつい、見分けたい。" })).toBeVisible();
  });
});
