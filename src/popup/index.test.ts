import * as puppeteer from "puppeteer";
import {
  createPage,
  emptyPopupPasswordField,
  getPopupUrl
} from "../tests/utils";

describe("Configuration popup", () => {
  let page: puppeteer.Page;
  let $domain: puppeteer.ElementHandle;
  let $password: puppeteer.ElementHandle;
  beforeEach(async () => {
    page = await createPage();
    await page.goto(await getPopupUrl(page));
    await page.waitFor("input[type=password]");

    $domain = (await page.$("input[type=text]")) as puppeteer.ElementHandle;

    $password = (await page.$(
      "input[type=password]"
    )) as puppeteer.ElementHandle;

    await emptyPopupPasswordField(page);
  });

  afterEach(async () => {
    await page.close();
  });

  it("shows an error indicator when access token is invalid", async () => {
    await $password.type("2342342422");
    await $domain.focus();
    await page.waitFor(".access-token-invalid");
  });

  it("shows a success indicator when access token is valid", async () => {
    await $password.type(process.env.GITHUB_TOKEN as string);
    await $domain.focus();
    await page.waitFor(".access-token-valid");
  });
});
