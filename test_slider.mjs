import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  // Wait 1 second and get the opacity of the first slide
  await page.waitForTimeout(1000);
  const opacities1 = await page.evaluate(() => {
    const slides = document.querySelectorAll('.hero > div[style*="background-image"]');
    return Array.from(slides).map(s => s.style.opacity);
  });
  console.log('Opacities at 1s:', opacities1);
  
  // Wait 5.5 seconds and get the opacities again
  await page.waitForTimeout(5500);
  const opacities2 = await page.evaluate(() => {
    const slides = document.querySelectorAll('.hero > div[style*="background-image"]');
    return Array.from(slides).map(s => s.style.opacity);
  });
  console.log('Opacities at 6.5s:', opacities2);
  
  // Check for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await browser.close();
  if (errors.length > 0) {
    console.log('Browser errors:', errors);
  }
})();
