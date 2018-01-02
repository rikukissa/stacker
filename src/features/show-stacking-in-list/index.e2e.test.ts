import { join } from "path";
import * as puppeteer from "puppeteer";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

const COMMIT_PART = {
  "Add feature 1": 1,
  "Changes to feature 1": 2
};

async function getTextContent(element: puppeteer.JSHandle) {
  const property = await element.getProperty("textContent");
  return (await property).jsonValue();
}

describe("'part X' labels in list view", () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  beforeEach(async () => {
    browser = await puppeteer.launch({
      args: [
        `--disable-extensions-except=${join(__dirname, "../../../dev")}`,
        `--load-extension=${join(__dirname, "../../../dev")}`,
        `--ignore-certificate-errors`
      ],
      headless: false
    });
    page = await browser.newPage();
    await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pulls");
  });
  afterEach(async () => {
    await browser.close();
  });

  it("shows correct label for each pull request", async () => {
    await page.waitFor(".stacker-part-badge");

    const $titles = await page.$$(".js-issue-row .h4");

    for (const $title of $titles) {
      const textContent = await getTextContent($title);

      const title = textContent.trim();

      const partContainer = await $title.getProperty("nextSibling");
      const partText = await getTextContent(partContainer);

      expect(partText).toEqual(`part ${COMMIT_PART[title]}`);
    }
  });
});
