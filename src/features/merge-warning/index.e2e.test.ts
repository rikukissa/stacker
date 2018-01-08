import * as puppeteer from "puppeteer";
import { createBrowser, login } from "../../tests/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;

describe("Merge warning", () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  beforeEach(async () => {
    const setup = await createBrowser();
    browser = setup.browser;
    page = setup.page;
    await login(page);
  });
  afterEach(async () => {
    await browser.close();
  });

  describe("when viewing a upstream based sequential PR", () => {
    beforeEach(async () => {
      await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pull/2");
      await page.waitFor(".stacker-merge-warning-initialized");
    });

    it("shows correct label for each pull request", async () => {
      const $warning = await page.$("#stacker-merge-warning");
      expect($warning).toBeDefined();
    });
  });

  describe("when viewing a parent PR branch based sequential PR", () => {
    beforeEach(async () => {
      await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pull/4");
      await page.waitFor(".stacker-merge-warning-initialized");
    });

    it("shows correct label for each pull request", async () => {
      const $warning = await page.$("#stacker-merge-warning");
      expect($warning).toBeNull();
    });
  });
});
