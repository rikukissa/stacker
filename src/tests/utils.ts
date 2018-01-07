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
    executablePath: process.env.GOOGLE_CHROME_BINARY,
    headless: false
  });

  const page = await browser.newPage();

  page.on("dialog", async (dialog: puppeteer.Dialog) => {
    await dialog.accept(process.env.GITHUB_TOKEN);
  });

  return { browser, page };
}
