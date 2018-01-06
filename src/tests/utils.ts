import { join } from "path";
import * as puppeteer from "puppeteer";

export async function getTextContent(element: puppeteer.JSHandle) {
  const property = await element.getProperty("textContent");
  return (await property).jsonValue();
}

export async function createBrowser() {
  const browser = await puppeteer.launch({
    args: [
      `--disable-extensions-except=${join(__dirname, "../../dev")}`,
      `--load-extension=${join(__dirname, "../../dev")}`,
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
