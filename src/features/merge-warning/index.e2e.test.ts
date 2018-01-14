import * as puppeteer from "puppeteer";
import { createPage } from "../../tests/utils";

describe("Merge warning", () => {
  let page: puppeteer.Page;

  beforeEach(async () => {
    page = await createPage();
  });

  afterEach(async () => {
    await page.close();
  });

  describe("when viewing a upstream based child PR", () => {
    beforeEach(async () => {
      await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pull/2");
      await page.waitFor(".stacker-merge-warning-initialized");
    });

    it("shows correct label for each pull request", async () => {
      const $warning = await page.$("#stacker-merge-warning");
      expect($warning).toBeDefined();
    });
  });

  describe("when viewing a parent PR branch based child PR", () => {
    beforeEach(async () => {
      await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pull/4");
      await page.waitFor(".stacker-merge-warning-initialized");
    });

    it("shows correct label for each pull request", async () => {
      const $warning = await page.$("#stacker-merge-warning");
      expect($warning).toBeNull();
    });
  });
  describe("when viewing a parent PR that has based child PRs", () => {
    beforeEach(async () => {
      await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pull/3");
      await page.waitFor(".stacker-merge-warning-initialized");
    });

    it("shows correct label for each pull request", async () => {
      const $warning = await page.$("#stacker-merge-warning");
      expect($warning).toBeDefined();
    });
  });
});
