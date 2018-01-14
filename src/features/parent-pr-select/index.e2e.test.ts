import * as puppeteer from "puppeteer";
import { createPage } from "../../tests/utils";

async function getFeature(
  page: puppeteer.Page
): Promise<puppeteer.ElementHandle> {
  return page.$("#stacker-pr-selector") as Promise<puppeteer.ElementHandle>;
}

async function getParentPRButton(
  page: puppeteer.Page
): Promise<puppeteer.ElementHandle> {
  const $container = await getFeature(page);
  const $button = await $container.$("#stacker-pr-selector button");

  if (!$button) {
    throw new Error("Parent selector button not found");
  }
  return $button;
}
async function selectPR(page: puppeteer.Page, id: string): Promise<void> {
  const $container = await getFeature(page);
  const $button = await getParentPRButton(page);

  await $button.click();

  const $prButton = (await $container.$(
    `[data-pr="${id}"]`
  )) as puppeteer.ElementHandle;

  await $prButton.hover();

  // TODO, no idea why the first PR won't get selected if this timeout isn't here..
  await page.waitFor(1000);

  await $prButton.click();
  await page.waitFor(`[data-stacker-selected-parent="${id}"]`);
}

async function getTextareaValue(page: puppeteer.Page): Promise<string> {
  await ((await page.$(
    ".js-comment-edit-button"
  )) as puppeteer.ElementHandle).click();

  const $body = (await page.$(
    'textarea[name="pull_request[body]"]'
  )) as puppeteer.ElementHandle;

  const value = (await (await $body.getProperty(
    "value"
  )).jsonValue()) as string;

  page.once("dialog", async (dialog: puppeteer.Dialog) => {
    await dialog.accept();
  });

  await ((await page.$(
    ".js-comment-cancel-button"
  )) as puppeteer.ElementHandle).click();

  return value;
}

describe("parent PR select", () => {
  let page: puppeteer.Page;

  beforeEach(async () => {
    page = await createPage();

    await page.goto(
      "https://github.com/rikukissa/stacker-e2e-repo/compare/new-branch?expand=1"
    );
  });

  describe("when creating a new pull request", () => {
    beforeEach(async () => {
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

  describe("viewing an existing pull request", () => {
    beforeEach(async () => {
      await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pull/2");
      await page.waitFor("#stacker-pr-selector");
    });

    afterEach(async () => {
      await page.goto("https://github.com/rikukissa/stacker-e2e-repo/pull/2");
      await page.waitFor("#stacker-pr-selector");
      await selectPR(page, "rikukissa:stacker-e2e-repo:feature-1/1");
    });

    describe("when a parent pull request is selected", () => {
      beforeEach(async () => {
        await selectPR(page, "rikukissa:stacker-e2e-repo:feature-2/2");
        await page.reload();
        await page.waitFor("#stacker-pr-selector");
      });

      it("updates the tag in PR body", async () => {
        expect(await getTextareaValue(page)).toMatch(
          '<!--{"baseBranch":"rikukissa:stacker-e2e-repo:feature-2/2"}-->'
        );
      });

      describe("when the selected parent PR is selected again", () => {
        beforeEach(async () => {
          await selectPR(page, "rikukissa:stacker-e2e-repo:feature-2/2");
          await page.reload();
          await page.waitFor("#stacker-pr-selector");
        });

        it("clears the tag from PR body", async () => {
          expect(await getTextareaValue(page)).not.toMatch(
            '<!--{"baseBranch":"rikukissa:stacker-e2e-repo:feature-2/2"}-->'
          );
        });
      });
    });
  });
});
