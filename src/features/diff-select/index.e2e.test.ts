import * as puppeteer from "puppeteer";
import { createPage } from "../../tests/utils";

describe("Automatic diff redirect", () => {
  let page: puppeteer.Page;

  beforeEach(async () => {
    page = await createPage();
  });

  afterEach(async () => {
    await page.close();
  });

  describe("with non-based PRs", () => {
    beforeEach(async () => {
      await page.goto(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/2/files"
      );
    });

    it("redirects the browser to a view with only related commits visible", async () => {
      await page.waitForNavigation();
      expect(page.url()).toEqual(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/2/files/219075335f75f6428f4ffb68669e922f441b8146..db4ae1e85ba25f975e3541e191055cc5be8dd54f"
      );
    });
  });

  describe("with non-based PRs when in 'submit review' state", () => {
    beforeEach(async () => {
      await page.goto(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/2/files#submit-review"
      );
    });

    it("redirects the browser to a view with only related commits visible", async () => {
      await page.waitForNavigation();

      expect(await page.evaluate(() => location.href)).toEqual(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/2/files/219075335f75f6428f4ffb68669e922f441b8146..db4ae1e85ba25f975e3541e191055cc5be8dd54f#submit-review"
      );
    });
  });

  describe("with based PRs", () => {
    beforeEach(async () => {
      await page.goto(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/6/files"
      );
    });

    it("doesn't redirect the browser anywhere", async () => {
      await page.waitForSelector(".stacker-diff-view-initialized");
      expect(page.url()).toEqual(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/6/files"
      );
    });
  });
  describe("when PR's history doesn't match the parent PR's history", () => {
    beforeEach(async () => {
      await page.goto(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/11/files"
      );
    });

    it("doesn't redirect the browser anywhere", async () => {
      await page.waitForSelector(".stacker-diff-view-initialized");

      expect(page.url()).toEqual(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/11/files"
      );
    });
  });
});
