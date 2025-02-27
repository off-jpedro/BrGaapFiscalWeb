const { chromium } = require('playwright');
const fs = require('fs');

/**
 * Authenticates using a client certificate and provides methods to interact with the authenticated session.
 */
class CertificateAuthSession {
  /**
   * Creates an instance of CertificateAuthSession.
   *
   * @param {Object} options - The configuration options.
   * @param {string} options.origin - The exact origin that the certificate is valid for.
   * @param {string} options.url - The URL to navigate to after authentication.
   * @param {string} [options.certPath] - Path to the certificate file in PEM format.
   * @param {string} [options.keyPath] - Path to the private key file in PEM format.
   * @param {string} [options.pfxPath] - Path to the PFX or PKCS12 encoded private key and certificate chain.
   * @param {string} [options.passphrase] - Passphrase for the private key (PEM or PFX).
   * @param {Buffer} [options.pfxBuffer] - Direct value of the PFX or PKCS12 encoded private key and certificate chain.
   * @param {Buffer} [options.certBuffer] - Direct value of the certificate in PEM format.
   * @param {Buffer} [options.keyBuffer] - Direct value of the private key in PEM format.
   * @param {number} [options.timeout=30000] - Timeout in milliseconds for page load.
   */
  constructor(options) {
    // Destructure options
    const {
      origin,
      url,
      certPath,
      keyPath,
      pfxPath,
      passphrase,
      pfxBuffer,
      certBuffer,
      keyBuffer,
      timeout = 30000
    } = options;

    if (!origin || !url) {
      throw new Error('Both "origin" and "url" must be provided in the options.');
    }

    this.origin = origin;
    this.url = url;
    this.certPath = certPath;
    this.keyPath = keyPath;
    this.pfxPath = pfxPath;
    this.passphrase = passphrase;
    this.pfxBuffer = pfxBuffer;
    this.certBuffer = certBuffer;
    this.keyBuffer = keyBuffer;
    this.timeout = timeout;

    // Initialize properties
    this.browser = null;
    this.context = null;
    this.page = null;
    this.cookies = [];
    this.headers = {};
  }

  /**
   * Authenticates using the provided client certificate.
   *
   * @returns {Promise<void>}
   */
  async authenticate() {
    // Prepare client certificate options for browser context
    const clientCertificate = {
      origin: this.origin,
      passphrase: this.passphrase
    };

    // Add certificate details based on what is provided
    if (this.pfxPath || this.pfxBuffer) {
      if (this.pfxPath) {
        clientCertificate.pfx = fs.readFileSync(this.pfxPath);
      } else {
        clientCertificate.pfx = this.pfxBuffer;
      }
    } else if ((this.certPath && this.keyPath) || (this.certBuffer && this.keyBuffer)) {
      if (this.certPath && this.keyPath) {
        clientCertificate.cert = fs.readFileSync(this.certPath, 'utf8');
        clientCertificate.key = fs.readFileSync(this.keyPath, 'utf8');
      } else {
        clientCertificate.cert = this.certBuffer;
        clientCertificate.key = this.keyBuffer;
      }
    } else {
      throw new Error('You must provide either pfxPath/pfxBuffer or certPath & keyPath/certBuffer & keyBuffer.');
    }

    const contextOptions = {
      ignoreHTTPSErrors: true,
      clientCertificates: [clientCertificate]
    };

    // Launch browser
    this.browser = await chromium.launch({
      headless: true,
      ignoreHTTPSErrors: true
    });

    // Create a new context with the client certificate
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    try {
      // Navigate to the URL
      await this.page.goto(this.url);
      await this.page.waitForLoadState('networkidle', { timeout: this.timeout });

      // Get all cookies after authentication
      this.cookies = await this.context.cookies();

    // Filter and prepare headers for the API call
    const filteredCookies = this.cookies.filter(cookie => 
        (cookie.name === 'X-CSRF-RME-Angular') ||
        (cookie.name === 'IDP_SESSION_MARKER_accounts') ||
        ((cookie.name === '__VCAP_ID__' || cookie.name === 'JSESSIONID') && cookie.domain === 'roadmaps.sap.com')
      );

      // Simplified cookie filtering - remove SAP-specific filters
      const headerCookiesString = filteredCookies.map(cookie => 
        `${cookie.name}=${cookie.value}`
      ).join('; ');

      // Generic headers
      this.headers = {
        'cookie': headerCookiesString,
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "de-DE,de;q=0.9",
        "cache-control": "max-age=0",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Chromium\";v=\"129\", \"Not=A?Brand\";v=\"8\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Referer": this.url,
        "Referrer-Policy": "origin"
      };
    } catch (error) {
      console.error('An error occurred during authentication:', error);
      await this.browser.close();
      throw error;
    }
  }

  /**
   * Returns the cookies obtained after authentication.
   *
   * @returns {Array<Object>} - The cookies.
   */
  getCookies() {
    return this.cookies;
  }

  /**
   * Returns the headers prepared for API calls.
   *
   * @returns {Object} - The headers.
   */
  getHeaders() {
    return this.headers;
  }

  /**
   * Returns the Playwright browser instance.
   *
   * @returns {Browser} - The Playwright browser instance.
   */
  getBrowser() {
    return this.browser;
  }

  /**
   * Returns the Playwright browser context.
   *
   * @returns {BrowserContext} - The Playwright browser context.
   */
  getContext() {
    return this.context;
  }

  /**
   * Returns the Playwright page instance.
   *
   * @returns {Page} - The Playwright page instance.
   */
  getPage() {
    return this.page;
  }

  /**
   * Closes the browser instance.
   *
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = { CertificateAuthSession };
