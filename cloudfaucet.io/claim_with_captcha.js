// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
 
// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: 'f38eb072be32a86311ce038b00b5c7a8' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
    },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)
 
// puppeteer usage as normal
puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage()
  await page.goto('https://cloudfaucet.io/faucet')
  
  await sleep(2000);
  
  await page.click("#collect-button");
 
  // That's it, a single line of code to solve reCAPTCHAs 🎉
  await page.solveRecaptchas()
 
 // await Promise.all([
  //  page.waitForNavigation(),
   // page.click('#recaptcha-demo-submit')
  //])
  //await browser.close()
 // await page.screenshot({ path: 'response.png', fullPage: true })
})

function sleep(ms) {
	console.error("Sleeping");
	return new Promise(resolve => setTimeout(resolve, ms));
}