import { join } from "path";
import * as puppeteer from "puppeteer";

const PLUGIN_PATH = process.env.CI
  ? join(__dirname, "../../build")
  : join(__dirname, "../../dev");

export async function getTextContent(element: puppeteer.JSHandle) {
  const property = await element.getProperty("textContent");
  return (await property).jsonValue();
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

  page.on("dialog", async (dialog: puppeteer.Dialog) => {
    await dialog.accept(process.env.GITHUB_TOKEN);
  });

  return { browser, page };
}

export async function login(page: puppeteer.Page) {
  if (!(process.env.GITHUB_USERNAME && process.env.GITHUB_PASSWORD)) {
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

  await $username.type(process.env.GITHUB_USERNAME);
  await $password.type(process.env.GITHUB_PASSWORD);

  await $submit.click();
  await page.waitForNavigation();
}
