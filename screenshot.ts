import chrome from "chrome-aws-lambda";
import { PDFDocument } from "pdf-lib";
import fetch from "isomorphic-unfetch";

const isProd = process.env.NODE_ENV === "production";

const LOCAL_CHROME_PATH =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export default async (url: string) => {
  const type = "png";

  const puppeteerOptions = isProd
    ? {
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
      }
    : {
        args: [],
        executablePath: LOCAL_CHROME_PATH,
        headless: true,
      };

  console.log("isProd", isProd);
  console.log("puppeteerOptions", puppeteerOptions);
  const browser = await chrome.puppeteer.launch(puppeteerOptions);

  const page = await browser.newPage();
  await page.goto(url);
  const file = await page.screenshot({ type });
  // create pdf from the resulting screenshot
  const pdf = await page.pdf({
    format: "A4",
    margin: {
      top: "45mm",
      right: "22mm",
      bottom: "40mm",
      left: "22mm",
    },
  });
  // await browser.close();

  const pdfUrl =
    "https://raw.githubusercontent.com/Hopding/pdf-lib/master/assets/pdfs/examples/create_document.pdf";
  const arrayBuffer = await fetch(pdfUrl).then((res) => res.arrayBuffer());
  const designDoc = await PDFDocument.load(arrayBuffer);
  const topLayerPDF = await PDFDocument.load(pdf);

  const pdfDoc = await PDFDocument.create();

  const [template] = await pdfDoc.embedPdf(designDoc);

  const pages = topLayerPDF.getPages();

  for (let idx = 0; idx < pages.length; idx++) {
    const page = pages[idx];

    const pageContent = await pdfDoc.embedPage(page);
    const newPage = pdfDoc.addPage();

    newPage.drawRectangle({
      width: page.getWidth(),
      height: page.getHeight(),
    });

    newPage.drawPage(template, {
      x: 0,
      y: 0,
    });

    newPage.drawPage(pageContent, {
      x: 0,
      y: 0,
    });
  }

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
};
