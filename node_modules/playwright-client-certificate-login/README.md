# Playwright Client Certificate Authentication

A Node.js utility for authenticating using client certificates via Playwright.

## Installation

```bash
npm install playwright-client-certificate-login
```

## Usage

```javascript
const { CertificateAuthSession } = require('playwright-client-certificate-login');

// Using PFX/PKCS12 certificate
const options = {
  origin: 'https://your-domain.com',
  url: 'https://your-domain.com/path',
  pfxPath: '/path/to/your/certificate.pfx',
  passphrase: 'your-certificate-passphrase'
};

// Or using separate cert and key files
const options = {
  origin: 'https://your-domain.com',
  url: 'https://your-domain.com/path',
  certPath: '/path/to/your/certificate.pem',
  keyPath: '/path/to/your/private-key.pem',
  passphrase: 'your-key-passphrase'
};

async function authenticate() {
  const session = new CertificateAuthSession(options);
  try {
    await session.authenticate();
    
    // Access authenticated session data
    const cookies = session.getCookies();
    const headers = session.getHeaders();
    const browser = session.getBrowser();
    const context = session.getContext();
    const page = session.getPage();
    
    console.log('Authentication successful:', cookies);
    
    // Don't forget to close the session
    await session.close();
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

## API Reference

### Class: CertificateAuthSession

#### Constructor Options

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `origin` | string | Yes | The exact origin that the certificate is valid for |
| `url` | string | Yes | The URL to navigate to after authentication |
| `certPath` | string | No* | Path to the certificate file in PEM format |
| `keyPath` | string | No* | Path to the private key file in PEM format |
| `pfxPath` | string | No* | Path to the PFX/PKCS12 certificate file |
| `passphrase` | string | No | Passphrase for the private key |
| `pfxBuffer` | Buffer | No* | Direct value of the PFX/PKCS12 certificate |
| `certBuffer` | Buffer | No* | Direct value of the certificate in PEM format |
| `keyBuffer` | Buffer | No* | Direct value of the private key in PEM format |
| `timeout` | number | No | Timeout in milliseconds for page load (default: 30000) |

\* You must provide either:
- `pfxPath` or `pfxBuffer`, OR
- Both `certPath` and `keyPath`, OR
- Both `certBuffer` and `keyBuffer`

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `authenticate()` | Promise<void> | Authenticates using the provided client certificate |
| `getCookies()` | Array<Object> | Returns the cookies obtained after authentication |
| `getHeaders()` | Object | Returns the headers prepared for API calls |
| `getBrowser()` | Browser | Returns the Playwright browser instance |
| `getContext()` | BrowserContext | Returns the Playwright browser context |
| `getPage()` | Page | Returns the Playwright page instance |
| `close()` | Promise<void> | Closes the browser instance |

## Error Handling

The class will throw an error if:
- Required options are missing
- Certificate files cannot be read
- Authentication process fails
- Page load timeout is exceeded