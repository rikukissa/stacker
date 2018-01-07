import * as puppeteer from "puppeteer";
import { createBrowser, login } from "../../tests/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe("parent PR select", () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  beforeEach(async () => {
    const setup = await createBrowser();
    browser = setup.browser;
    page = setup.page;

    await login(page);

    await page.goto(
      "https://github.com/rikukissa/stacker-e2e-repo/compare/new-branch?expand=1"
    );
  });
  afterEach(async () => {
    await browser.close();
  });

  it("appears right under Milestone selector", async () => {
    // await page.waitFor("#stacker-pr-selector");
  });
});
