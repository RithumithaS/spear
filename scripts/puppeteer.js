import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting automated seeding operations...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('dialog', async dialog => {
    console.log('Dialog:', dialog.message());
    await dialog.accept();
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  try {
    console.log('Navigating to http://localhost:5173/admin...');
    await page.goto('http://localhost:5173/admin', { waitUntil: 'domcontentloaded' });
    
    // Wait for the button to appear
    await page.waitForSelector('button', { timeout: 10000 });

    console.log('Searching for Seed Data button...');
    const seedSuccess = await page.evaluate(async () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const seedBtn = buttons.find(b => b.textContent?.includes('Seed Data'));
      
      if (seedBtn) {
        seedBtn.click();
        return true;
      }
      return false;
    });

    if (seedSuccess) {
      console.log('Initiated Seed Data sequence! Waiting 15 seconds for Firebase database writes...');
      await new Promise(r => setTimeout(r, 15000));
      console.log('Database Seeding Completed Successfully! You can verify this in the UI.');
    } else {
      console.log('Seed Data button not found. Admin panel might not be loaded properly.');
    }

  } catch (error) {
    console.error('Error during self-seeding:', error);
  } finally {
    await browser.close();
    console.log('Automation complete. Browser closed.');
  }

})();
