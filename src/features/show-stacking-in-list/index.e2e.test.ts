import * as puppeteer from "puppeteer";
import { createPage, getTextContent } from "../../tests/utils";

const COMMIT_PART = {
  "Add feature 1": 1,
  "Changes to feature 1": 2
};

describe("'part X' labels in list view", () => {
  let page: puppeteer.Page;

  beforeEach(async () => {
    page = await createPage();
    await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pulls");
  });

  afterEach(async () => {
    await page.close();
  });

  it("shows correct label for each pull request", async () => {
    await page.waitFor(".stacker-part-badge");

    const $titles = await page.$$(".js-issue-row .h4");

    for (const $title of $titles) {
      const textContent = await getTextContent($title);

      const title = textContent.trim();

      const partContainer = await $title.getProperty("nextSibling");
      const partText = await getTextContent(partContainer);

      if (!COMMIT_PART[title]) {
        continue;
      }

      expect(partText).toEqual(`part ${COMMIT_PART[title]}`);
    }
  });
});
