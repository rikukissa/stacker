import * as puppeteer from "puppeteer";
import { createPage } from "../../tests/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe("parent PR select", () => {
  let page: puppeteer.Page;

  beforeEach(async () => {
    page = await createPage();

    await page.goto(
      "https://github.com/rikukissa/stacker-e2e-repo/compare/new-branch?expand=1"
    );
  });

  afterEach(async () => {
    await page.close();
  });

  it("appears right under Milestone selector", async () => {
    await page.waitFor("#stacker-pr-selector");
  });
});
