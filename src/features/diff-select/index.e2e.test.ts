import * as puppeteer from "puppeteer";
import { createBrowser, login } from "../../tests/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe("Automatic diff redirect", () => {
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

  describe("with based PRs", () => {
    beforeEach(async () => {
      await page.goto(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/6/files"
      );
    });

    it("redirects the browser to a view with only related commits visible", async () => {
      await page.waitForSelector(".stacker-diff-view-initialized");
      expect(page.url()).toEqual(
        "https://github.com/rikukissa/stacker-e2e-repo/pull/6/files"
      );
    });
  });
});
