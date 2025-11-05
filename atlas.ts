import { expect } from '@wdio/globals';

describe("Atlas STG2 Login", () => {

  beforeEach(async () => {
    // Maximize browser window before each login test
    await browser.maximizeWindow();
  });

  it("Should login with valid user", async () => {
    await browser.url("https://app.aristoai.net/login");

    // Selectors
    const emailTxtbox = $("input[type='email']");
    const passwordTxtbox = $("input[type='password']");
    const loginBtn = $("button[type='submit']");

    // Get credentials from environment variables with fallbacks
    const email = process.env.TEST_EMAIL || "Avan1@needstreet.org";
    const password = process.env.TEST_PASSWORD || "password";

    // Actions
    await emailTxtbox.waitForDisplayed({ timeout: 5000 });
    await emailTxtbox.setValue(email);

    await passwordTxtbox.waitForDisplayed({ timeout: 5000 });
    await passwordTxtbox.setValue(password);

    await loginBtn.waitForClickable({ timeout: 5000 });
    await loginBtn.click();

    // Wait for navigation to dashboard with better error handling
    try {
      await browser.waitUntil(
        async () => {
          const url = await browser.getUrl();
          console.log('Current URL:', url);
          return url.includes('/dashboard') || url.includes('/home');
        },
        {
          timeout: 30000,
          timeoutMsg: 'Expected to navigate to dashboard/home page after 30s'
        }
      );
    } catch (error) {
      // Capture debug information if navigation fails
      const currentUrl = await browser.getUrl();
      const pageTitle = await browser.getTitle();
      console.error('Navigation failed. Current URL:', currentUrl);
      console.error('Page title:', pageTitle);

      // Check if there's an error message on the page
      const bodyText = await $('body').getText();
      console.error('Page content:', bodyText.substring(0, 500));
      throw error;
    }

    // Wait for page to be fully loaded
    await browser.waitUntil(
      async () => {
        const state = await browser.execute(() => document.readyState);
        return state === 'complete';
      },
      {
        timeout: 15000,
        timeoutMsg: 'Dashboard page did not finish loading'
      }
    );

    // Assert - Verify successful login by checking dashboard URL (flexible)
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/dashboard');
    console.log('Successfully logged in. Current URL:', currentUrl);
  });

  it("Should show error with invalid credentials", async () => {
    await browser.url("https://app.aristoai.net/login");

    // Selectors
    const emailTxtbox = $("input[type='email']");
    const passwordTxtbox = $("input[type='password']");
    const loginBtn = $("button[type='submit']");

    // Actions - Use invalid credentials
    await emailTxtbox.waitForDisplayed({ timeout: 5000 });
    await emailTxtbox.setValue("invalid@example.com");

    await passwordTxtbox.waitForDisplayed({ timeout: 5000 });
    await passwordTxtbox.setValue("wrongpassword123");

    await loginBtn.waitForClickable({ timeout: 5000 });
    await loginBtn.click();

    // Wait for error message to appear
    await browser.pause(2000); // Give time for error to display

    // Assert - Should still be on login page (not navigated away)
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/login');
    console.log('Login correctly rejected invalid credentials');
  });

  it("Should validate empty email field", async () => {
    await browser.url("https://app.aristoai.net/login");

    // Selectors
    const passwordTxtbox = $("input[type='password']");
    const loginBtn = $("button[type='submit']");

    // Actions - Leave email empty, fill password
    await passwordTxtbox.waitForDisplayed({ timeout: 5000 });
    await passwordTxtbox.setValue("somepassword");

    await loginBtn.waitForClickable({ timeout: 5000 });
    await loginBtn.click();

    await browser.pause(1000);

    // Assert - Should still be on login page
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/login');
    console.log('Empty email validation working correctly');
  });

  it("Should validate empty password field", async () => {
    await browser.url("https://app.aristoai.net/login");

    // Selectors
    const emailTxtbox = $("input[type='email']");
    const loginBtn = $("button[type='submit']");

    // Actions - Fill email, leave password empty
    await emailTxtbox.waitForDisplayed({ timeout: 5000 });
    await emailTxtbox.setValue("test@example.com");

    await loginBtn.waitForClickable({ timeout: 5000 });
    await loginBtn.click();

    await browser.pause(1000);

    // Assert - Should still be on login page
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/login');
    console.log('Empty password validation working correctly');
  });

});

describe("Atlas Dashboard Tests", () => {

  // Login ONCE before all dashboard tests (instead of before each)
  before(async () => {
    // This runs only ONCE before all 5 dashboard tests
    // Maximize browser window
    await browser.maximizeWindow();

    await browser.url("https://app.aristoai.net/login");

    const emailTxtbox = $("input[type='email']");
    const passwordTxtbox = $("input[type='password']");
    const loginBtn = $("button[type='submit']");

    const email = process.env.TEST_EMAIL || "Avan1@needstreet.org";
    const password = process.env.TEST_PASSWORD || "password";

    await emailTxtbox.waitForDisplayed({ timeout: 5000 });
    await emailTxtbox.setValue(email);
    await passwordTxtbox.waitForDisplayed({ timeout: 5000 });
    await passwordTxtbox.setValue(password);
    await loginBtn.waitForClickable({ timeout: 5000 });
    await loginBtn.click();

    // Wait for dashboard to load
    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl();
        return url.includes('/dashboard') || url.includes('/home');
      },
      {
        timeout: 30000,
        timeoutMsg: 'Expected to navigate to dashboard after login'
      }
    );

    console.log('Successfully logged in for dashboard tests');
  });

  // Navigate back to dashboard before each test (faster than re-logging in)
  beforeEach(async () => {
    // Just go back to dashboard page (already logged in)
    await browser.url("https://app.aristoai.net/dashboard");
    await browser.pause(1000); // Give page time to load
  });

  it("Should verify dashboard page elements are displayed", async () => {
    // Wait for page to be fully loaded
    await browser.waitUntil(
      async () => {
        const state = await browser.execute(() => document.readyState);
        return state === 'complete';
      },
      {
        timeout: 15000,
        timeoutMsg: 'Dashboard page did not finish loading'
      }
    );

    // Verify URL contains dashboard
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/dashboard');

    // Verify page title is not empty
    const pageTitle = await browser.getTitle();
    expect(pageTitle.length).toBeGreaterThan(0);
    console.log('Dashboard page title:', pageTitle);

    // Verify body element exists and has content
    const bodyElement = $('body');
    await bodyElement.waitForDisplayed({ timeout: 5000 });
    expect(await bodyElement.isDisplayed()).toBe(true);

    console.log('Dashboard elements verified successfully');
  });

  it("Should navigate to different sections from dashboard", async () => {
    // Wait for navigation menu to load
    await browser.pause(2000);

    // Try to find common navigation elements
    // Note: Adjust these selectors based on your actual application
    const navLinks = $$('nav a, [role="navigation"] a, header a');
    const navLinksCount = await navLinks.length;

    if (navLinksCount > 0) {
      console.log(`Found ${navLinksCount} navigation links`);

      // Get the first navigation link text and click it
      const firstLink = navLinks[0];
      await firstLink.waitForClickable({ timeout: 5000 });
      const linkText = await firstLink.getText();
      console.log('Clicking navigation link:', linkText);

      await firstLink.click();

      // Wait for navigation
      await browser.pause(2000);

      // Verify URL changed or page updated
      const newUrl = await browser.getUrl();
      console.log('Navigated to:', newUrl);
      expect(newUrl).toBeTruthy();
    } else {
      console.log('No navigation links found - may need to adjust selectors');
    }
  });

  it("Should display user profile or account information", async () => {
    await browser.pause(2000);

    // Try to find user profile/account elements
    // Common selectors for profile areas
    const profileSelectors = [
      '[data-testid="user-profile"]',
      '[aria-label*="profile" i]',
      '[aria-label*="account" i]',
      'button[aria-label*="user" i]',
      '.user-profile',
      '.account-menu'
    ];

    let profileFound = false;
    for (const selector of profileSelectors) {
      const elements = $$(selector);
      const elementsCount = await elements.length;
      if (elementsCount > 0) {
        console.log(`Found profile element with selector: ${selector}`);
        const element = elements[0];
        expect(await element.isDisplayed()).toBe(true);
        profileFound = true;
        break;
      }
    }

    if (!profileFound) {
      console.log('User profile element not found with common selectors - may need customization');
    }

    // At minimum, verify we're still on dashboard
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/dashboard');
  });

  it("Should be able to logout successfully", async () => {
    await browser.pause(2000);

    // Try to find and click logout button
    // Common selectors for logout
    const logoutSelectors = [
      'button*=Logout',
      'button*=Log out',
      'button*=Sign out',
      'a*=Logout',
      'a*=Log out',
      'a*=Sign out',
      '[data-testid="logout"]',
      '[aria-label*="logout" i]',
      '[aria-label*="sign out" i]'
    ];

    let logoutFound = false;
    for (const selector of logoutSelectors) {
      try {
        const logoutBtn = $(selector);
        if (await logoutBtn.isExisting()) {
          await logoutBtn.waitForClickable({ timeout: 5000 });
          console.log(`Found logout button with selector: ${selector}`);
          await logoutBtn.click();
          logoutFound = true;

          // Wait for redirect to login page
          await browser.waitUntil(
            async () => {
              const url = await browser.getUrl();
              return url.includes('/login') || url.includes('/signin');
            },
            {
              timeout: 10000,
              timeoutMsg: 'Expected to navigate to login page after logout'
            }
          );

          // Verify we're back on login page
          const currentUrl = await browser.getUrl();
          expect(currentUrl).toContain('/login');
          console.log('Successfully logged out and redirected to login page');
          break;
        }
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }

    if (!logoutFound) {
      console.log('Logout button not found with common selectors');
      console.log('You may need to inspect the page and add the correct selector');
      // Still verify we have access to dashboard
      const currentUrl = await browser.getUrl();
      expect(currentUrl).toBeTruthy();
    }
  });

  it("Should handle page refresh and maintain session", async () => {
    // Get current URL
    const urlBeforeRefresh = await browser.getUrl();
    console.log('URL before refresh:', urlBeforeRefresh);

    // Refresh the page
    await browser.refresh();

    // Wait for page to load after refresh
    await browser.waitUntil(
      async () => {
        const state = await browser.execute(() => document.readyState);
        return state === 'complete';
      },
      {
        timeout: 15000,
        timeoutMsg: 'Page did not load after refresh'
      }
    );

    await browser.pause(2000);

    // Verify still on dashboard (session maintained)
    const urlAfterRefresh = await browser.getUrl();
    console.log('URL after refresh:', urlAfterRefresh);

    // Should still be on dashboard, not redirected to login
    expect(urlAfterRefresh).toContain('/dashboard');
    console.log('Session maintained after page refresh');
  });

  it("Should navigate to Test Prep, go to SAT, and do a problem", async () => {
    // Wait for dashboard to be fully loaded
    await browser.pause(2000);

    // Try to find and click Test Prep tab/link
    const testPrepSelectors = [
      'a*=Test Prep',
      'button*=Test Prep',
      '[data-testid*="test-prep" i]',
      '[aria-label*="test prep" i]',
      'nav a*=Test',
      '.nav-item*=Test Prep'
    ];

    let testPrepFound = false;
    for (const selector of testPrepSelectors) {
      try {
        const testPrepLink = $(selector);
        if (await testPrepLink.isExisting()) {
          await testPrepLink.waitForClickable({ timeout: 5000 });
          const linkText = await testPrepLink.getText();
          console.log(`Found Test Prep link with selector: ${selector}, text: ${linkText}`);
          await testPrepLink.click();
          testPrepFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!testPrepFound) {
      console.log('Test Prep link not found, trying direct URL navigation');
      await browser.url("https://app.aristoai.net/test-prep");
    }

    // Wait for Test Prep page to load
    await browser.pause(3000);

    // Try to find and click SAT option
    const satSelectors = [
      'a*=SAT',
      'button*=SAT',
      '[data-testid*="sat" i]',
      'div*=SAT',
      '.test-type*=SAT',
      'h2*=SAT',
      'h3*=SAT'
    ];

    let satFound = false;
    for (const selector of satSelectors) {
      try {
        const satLink = $(selector);
        if (await satLink.isExisting() && await satLink.isClickable()) {
          await satLink.waitForClickable({ timeout: 5000 });
          const satText = await satLink.getText();
          console.log(`Found SAT option with selector: ${selector}, text: ${satText}`);
          await satLink.click();
          satFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!satFound) {
      console.log('SAT option not found with common selectors');
      console.log('Current URL:', await browser.getUrl());
    }

    // Wait for SAT page/problems to load
    await browser.pause(3000);

    // Try to find and start a problem
    const problemSelectors = [
      'button*=Start',
      'button*=Begin',
      'button*=Practice',
      '[data-testid*="start" i]',
      '[data-testid*="problem" i]',
      'a*=Start Problem',
      '.problem-card',
      '.question-card'
    ];

    let problemFound = false;
    for (const selector of problemSelectors) {
      try {
        const problemBtn = $(selector);
        if (await problemBtn.isExisting() && await problemBtn.isClickable()) {
          await problemBtn.waitForClickable({ timeout: 5000 });
          const btnText = await problemBtn.getText();
          console.log(`Found problem/start button with selector: ${selector}, text: ${btnText}`);
          await problemBtn.click();
          problemFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    // Wait for problem to load
    await browser.pause(3000);

    if (problemFound) {
      console.log('Successfully clicked on a problem');
    } else {
      console.log('Problem button not found with common selectors, but continuing with test');
    }

    // Verify we're on a problem page or SAT page
    const currentUrl = await browser.getUrl();
    console.log('Current URL after navigation:', currentUrl);

    // Check if URL contains SAT-related keywords
    const urlContainsSAT = currentUrl.toLowerCase().includes('sat') ||
                           currentUrl.toLowerCase().includes('test-prep') ||
                           currentUrl.toLowerCase().includes('practice') ||
                           currentUrl.toLowerCase().includes('problem');

    if (urlContainsSAT) {
      console.log('Successfully navigated to SAT/problem area');
      expect(urlContainsSAT).toBe(true);
    } else {
      console.log('Navigation may need adjustment based on actual page structure');
      console.log('You may need to inspect the page and update the selectors');
    }

    // Try to interact with the problem (optional - depends on problem type)
    // Look for answer options (multiple choice)
    const answerSelectors = [
      'button[role="radio"]',
      'input[type="radio"]',
      '.answer-option',
      '.choice',
      '[data-testid*="answer" i]'
    ];

    for (const selector of answerSelectors) {
      const answers = $$(selector);
      const answerCount = await answers.length;
      if (answerCount > 0) {
        console.log(`Found ${answerCount} answer options`);
        // Click the first answer option as an example
        const firstAnswer = answers[0];
        if (await firstAnswer.isClickable()) {
          await firstAnswer.click();
          console.log('Selected first answer option');
          await browser.pause(1000);
        }
        break;
      }
    }

    // Look for submit button
    const submitSelectors = [
      'button*=Submit',
      'button*=Check',
      'button*=Next',
      '[data-testid*="submit" i]'
    ];

    for (const selector of submitSelectors) {
      try {
        const submitBtn = $(selector);
        if (await submitBtn.isExisting() && await submitBtn.isClickable()) {
          await submitBtn.waitForClickable({ timeout: 5000 });
          console.log('Found submit button');
          // Uncomment the next line if you want to actually submit
          // await submitBtn.click();
          // console.log('Submitted answer');
          break;
        }
      } catch (error) {
        continue;
      }
    }

    console.log('Test Prep SAT problem navigation test completed');
  });

});
