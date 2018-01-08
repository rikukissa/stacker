import { join } from "path";
import * as puppeteer from "puppeteer";

const PLUGIN_PATH = process.env.CI
  ? join(__dirname, "../../build")
  : join(__dirname, "../../dev");

export async function getTextContent(element: puppeteer.JSHandle) {
  const property = await element.getProperty("textContent");
  return (await property).jsonValue();
}

async function setToken(page: puppeteer.Page) {
  await page.goto("chrome://extensions/");

  await page.waitFor(".extension-list-item-wrapper");

  const $extension = await page.$(".extension-list-item-wrapper");

  const extensionId =
    $extension && (await (await $extension.getProperty("id")).jsonValue());

  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await page.waitFor("input[type=password]");
  const $password = await page.$("input[type=password]");

  if (!$password) {
    throw new Error("Password field not found from extension page");
  }

  await $password.type(process.env.GITHUB_TOKEN || "");
}

export async function createBrowser() {
  const browser = await puppeteer.launch({
    args: [
      `--disable-extensions-except=${PLUGIN_PATH}`,
      `--load-extension=${PLUGIN_PATH}`,
      `--ignore-certificate-errors`
    ],
    headless: false
  });
  const page = await browser.newPage();

  await setToken(page);

  return { browser, page };
}

export async function login(page: puppeteer.Page) {
  const { GITHUB_USERNAME, GITHUB_PASSWORD } = process.env;
  if (!(GITHUB_USERNAME && GITHUB_PASSWORD)) {
    throw new Error(
      "Missing required environment variables GITHUB_USERNAME or GITHUB_PASSWORD"
    );
  }

  await page.goto("https://github.com/login");
  await page.waitFor(".auth-form-body");

  const $username = await page.$("#login_field");
  const $password = await page.$("#password");
  const $submit = await page.$("input[type=submit]");

  if (!($username && $password && $submit)) {
    throw new Error("Submit button or username/password fields not found");
  }

  await $username.type(GITHUB_USERNAME);
  await $password.type(GITHUB_PASSWORD);

  await $submit.click();
  await page.waitForNavigation();
}
