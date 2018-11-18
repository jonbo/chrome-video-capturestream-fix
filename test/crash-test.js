const fs = require("fs");
const puppeteer = require("puppeteer-core");

const ENV_CHROME_PATH = process.env["CHROME_PATH"];
const DEFAULT_WIN_CHROME_PATH = `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`;

let CHROME_PATH;
if (ENV_CHROME_PATH && fs.existsSync(ENV_CHROME_PATH)) {
  CHROME_PATH = ENV_CHROME_PATH;
} else if (fs.existsSync(DEFAULT_WIN_CHROME_PATH)) {
  CHROME_PATH = DEFAULT_WIN_CHROME_PATH;
} else {
  console.error("Required: Set ENV 'CHROME_PATH' to chrome's executable path");
  process.exit(1);
}

const YT_VIDEO_TEST_URL = "https://www.youtube.com/watch?v=flU42CTF3MQ";

let browser;

before(async function() {
  browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
  });
  console.log(await browser.version());
});

describe("native video.captureStream", function() {
  this.timeout(1000 * 25);
  it("will crash", function(done) {
    browser
      .newPage()
      .then((page) => {
        return videoCaptureStreamCrashTest(page, false);
      })
      .then(() => done(new Error("Did not crash?")))
      .catch(() => done());
  });
});
describe("polyfilled video.captureStream", function() {
  this.timeout(1000 * 25);
  it("won't crash", async function() {
    const page = await browser.newPage();
    return videoCaptureStreamCrashTest(page, true);
  });
});

async function videoCaptureStreamCrashTest(page, shouldPolyfill) {
  await page.goto(YT_VIDEO_TEST_URL);
  await page.waitForSelector("video");

  // If we don't crash within time, consider it a success!
  const CRASH_TIMEOUT_SUCCESS = 1000 * 12;
  let done = new Promise((resolve, reject) => {
    page.on("error", reject);
    setTimeout(resolve, CRASH_TIMEOUT_SUCCESS);
  });

  if (shouldPolyfill) {
    await page.addScriptTag({
      path: "./dist/videoCaptureStreamFix.umd.min.js",
    });
    await page.evaluate(async () => {
      VideoCaptureStreamFix.polyfill();
    });
  }
  await page.evaluate(async (CRASH_TIMEOUT_SUCCESS) => {
    let video = document.querySelector("video");

    // This line causes it to crash under the right circumstances
    let stream = video.captureStream();

    // A dependable way of getting chrome tab to crash (on my machine.. window 7)
    // click the res button and change source and video time (every 1.5 seconds)
    let settingsBtn = document.querySelector(".ytp-settings-button");
    settingsBtn.click();
    let qualityBtn = document.querySelector(
      ".ytp-menuitem:nth-child(5) .ytp-menuitem-content"
    );
    qualityBtn.click();

    let qualityMenu = document.querySelector(".ytp-quality-menu");
    let items = qualityMenu.querySelectorAll(".ytp-menuitem");
    let highresBtn = items[0];
    let autoresBtn = items[items.length - 1];

    let toggler = false;
    let stopId = setInterval(() => {
      video.currentTime = video.currentTime + 100;
      if (toggler) autoresBtn.click();
      else highresBtn.click();
      toggler = !toggler;
    }, 1500);

    setTimeout(clearInterval, CRASH_TIMEOUT_SUCCESS, stopId);
  }, CRASH_TIMEOUT_SUCCESS);

  return done;
}
