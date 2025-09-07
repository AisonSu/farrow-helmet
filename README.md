# farrow-helmet

[![npm version](https://img.shields.io/npm/v/farrow-helmet.svg)](https://www.npmjs.com/package/farrow-helmet)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Status](https://img.shields.io/badge/tests-21%20passed-brightgreen)](./src/index.test.ts)

A security middleware for [Farrow HTTP](https://github.com/farrow-js/farrow) applications that helps secure your web apps by setting various HTTP security headers.

**farrow-helmet** is a TypeScript-first security middleware designed specifically for the Farrow HTTP framework, providing comprehensive protection against common web vulnerabilities.

[中文文档](./README_ZH.md) | English

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Security Headers](#security-headers)
- [Configuration](#configuration)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

🛡️ **Comprehensive Security Headers** - Automatically sets essential security headers  
🔧 **Highly Configurable** - Fine-tune security policies for your needs  
⚡ **TypeScript First** - Full type safety and IntelliSense support  
🚀 **Minimal Dependencies** - Lightweight wrapper around proven helmet.js  
🧪 **Well Tested** - 21+ test cases covering all functionality  
📦 **Farrow Optimized** - Designed specifically for Farrow HTTP framework  

## Quick Start

```bash
npm install farrow-helmet
```

```typescript
import { Http, Response } from 'farrow-http'
import { helmet } from 'farrow-helmet'

const app = Http()

// Apply security middleware
app.use(helmet())

app.get('/').use(() => Response.json({ 
  message: '🛡️ Secured with farrow-helmet!' 
}))

app.listen(3000)
```

That's it! Your Farrow application is now protected with essential security headers.

## Installation

```bash
# npm
npm install farrow-helmet

# yarn  
yarn add farrow-helmet

# pnpm
pnpm add farrow-helmet
```

**Prerequisites:**
- Node.js 16+ 
- TypeScript 4.5+
- farrow-http 2.x

## Basic Usage

### Default Protection

Apply helmet with sensible defaults:

```typescript
import { helmet } from 'farrow-helmet'

app.use(helmet())
```

This automatically enables:
- Content type sniffing protection
- Clickjacking protection  
- XSS filtering (modern approach)
- Referrer policy controls
- Download security for IE
- Cross-domain policy restrictions

### Custom Configuration

Customize security policies to fit your needs:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.example.com"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}))
```

## Security Headers

farrow-helmet sets the following security headers by default:

| Header | Default Value | Purpose |
|--------|---------------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing attacks |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking attacks |
| `X-XSS-Protection` | `0` | Modern XSS protection (disables legacy filter) |
| `Referrer-Policy` | `no-referrer` | Controls referrer information leakage |
| `X-Download-Options` | `noopen` | Prevents IE from executing downloads |
| `X-Permitted-Cross-Domain-Policies` | `none` | Restricts Flash/PDF cross-domain access |

### Additional Available Headers

Configure these headers with custom options:

- **Content Security Policy (CSP)** - Prevents XSS and injection attacks
- **HTTP Strict Transport Security (HSTS)** - Enforces HTTPS connections
- **X-DNS-Prefetch-Control** - Controls DNS prefetching
- **Expect-CT** - Certificate transparency enforcement
- **Feature-Policy / Permissions-Policy** - Controls browser features

## Configuration

### Content Security Policy (CSP)

Protect against XSS and injection attacks:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted-cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      blockAllMixedContent: [],
      upgradeInsecureRequests: []
    }
  }
}))
```

### HTTP Strict Transport Security (HSTS)

Force HTTPS connections:

```typescript
app.use(helmet({
  hsts: {
    maxAge: 31536000,        // 1 year in seconds
    includeSubDomains: true, // Apply to all subdomains
    preload: true           // Enable HSTS preloading
  }
}))
```

### Environment-Specific Configuration

Configure different policies for different environments:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : [])
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  },
  hsts: isProduction ? {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true
  } : false, // Disable HSTS in development
  
  // Report CSP violations in development
  contentSecurityPolicyReportOnly: isDevelopment
}))
```

### Disabling Specific Headers

Disable headers you don't need:

```typescript
app.use(helmet({
  xFrameOptions: false,           // Disable X-Frame-Options
  contentSecurityPolicy: false,  // Disable CSP
  xContentTypeOptions: false     // Disable X-Content-Type-Options
}))
```

## Advanced Usage

### Integration with Other Middleware

Proper middleware ordering is crucial for security:

```typescript
const app = Http({ logger: true })

// 1. Error handling (first)
app.use(async (req, next) => {
  try {
    return await next(req)
  } catch (error) {
    console.error('Request failed:', error)
    return Response.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

// 2. Security headers (early)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"]
    }
  }
}))

// 3. CORS (after security)
import { cors } from 'farrow-cors'

app.use(cors({
  origin: 'https://trusted-domain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 4. Authentication
app.use(authenticationMiddleware)

// 5. Business logic
app.get('/api/data').use(() => Response.json({ data: [] }))
```

### Router-Specific Security

Apply different security policies to different routes:

```typescript
import { Router } from 'farrow-http'

// Public API - Restrictive CSP
const publicRouter = Router()
publicRouter.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      imgSrc: ["'none'"]
    }
  }
}))
publicRouter.get('/status').use(() => Response.json({ status: 'ok' }))

// Admin panel - More permissive
const adminRouter = Router()
adminRouter.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}))
adminRouter.get('/dashboard').use(() => Response.html(dashboardHTML))

// Mount routers
app.route('/api').use(publicRouter)
app.route('/admin').use(adminRouter)
```

### Dynamic Security Policies

Adjust policies based on request context:

```typescript
const dynamicHelmet = (req: RequestInfo, next: any) => {
  const isAPIRequest = req.pathname.startsWith('/api')
  const isAdminRequest = req.pathname.startsWith('/admin')
  
  let helmetConfig = {}
  
  if (isAPIRequest) {
    helmetConfig = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"]
        }
      }
    }
  } else if (isAdminRequest) {
    helmetConfig = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"]
        }
      }
    }
  }
  
  return helmet(helmetConfig)(req, next)
}

app.use(dynamicHelmet)
```

## Best Practices

### 1. Start with Strict Policies

Begin with restrictive policies and gradually relax them:

```typescript
// Start strict
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"]
    }
  }
}))

// Then add exceptions as needed
// scriptSrc: ["'self'", "https://trusted-cdn.com"]
```

### 2. Use CSP Report-Only Mode for Testing

Test CSP policies without breaking functionality:

```typescript
app.use(helmet({
  contentSecurityPolicyReportOnly: {
    directives: {
      defaultSrc: ["'self'"],
      reportUri: ['/csp-report']
    }
  }
}))

// Handle CSP reports
app.post('/csp-report').use((req) => {
  console.log('CSP Violation:', req.body)
  return Response.status(204).empty()
})
```

### 3. Environment-Specific Security

```typescript
const securityConfig = {
  development: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    },
    hsts: false
  },
  production: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
}

app.use(helmet(securityConfig[process.env.NODE_ENV] || securityConfig.production))
```

### 4. Monitor and Log Security Headers

```typescript
app.use(helmet())

app.use((req, next) => {
  const response = next(req)
  
  // Log security-relevant requests
  if (req.pathname.includes('..') || req.pathname.includes('<script>')) {
    console.warn('Suspicious request:', {
      ip: req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'],
      path: req.pathname
    })
  }
  
  return response
})
```

## Examples

### Complete Production Setup

```typescript
import { Http, Response, Router } from 'farrow-http'
import { helmet } from 'farrow-helmet'
import { createContext } from 'farrow-pipeline'

const app = Http({
  logger: {
    ignoreIntrospectionRequestOfFarrowApi: true
  }
})

// Security configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      blockAllMixedContent: [],
      fontSrc: ["'self'", "https:", "data:"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true
  }
}))

// CORS for API
import { cors } from 'farrow-cors'

const apiRouter = Router()
apiRouter.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID']
}))

apiRouter.get('/users').use(() => {
  return Response.json({ users: [] })
})

app.route('/api').use(apiRouter)

// Static files with security
app.serve('/static', './public')

// Health check
app.get('/health').use(() => {
  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`🛡️ Secure server running on http://localhost:${port}`)
})
```

### CSP Violation Reporting

```typescript
import { ObjectType, String, Optional, Any } from 'farrow-schema'

class CSPReport extends ObjectType {
  documentUri = String
  referrer = Optional(String)
  violatedDirective = String
  originalPolicy = String
  blockedUri = Optional(String)
  sourceFile = Optional(String)
  lineNumber = Optional(Number)
  columnNumber = Optional(Number)
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      reportUri: ['/csp-report']
    }
  }
}))

app.post('/csp-report', { body: { "csp-report": CSPReport } }).use((req) => {
  const report = req.body["csp-report"]
  
  console.warn('CSP Violation:', {
    uri: report.documentUri,
    directive: report.violatedDirective,
    blocked: report.blockedUri,
    source: report.sourceFile,
    line: report.lineNumber,
    timestamp: new Date().toISOString()
  })
  
  // Store in database or send to monitoring service
  // await logCSPViolation(report)
  
  return Response.status(204).empty()
})
```

## API Reference

### `helmet(options?: HelmetOptions): HttpMiddleware`

The main helmet function that returns a Farrow HTTP middleware.

#### HelmetOptions

All options are optional and match the [helmet.js](https://helmetjs.github.io/) API:

```typescript
interface HelmetOptions {
  contentSecurityPolicy?: CSPOptions | false
  hsts?: HSTSOptions | false
  xContentTypeOptions?: boolean
  xDnsPrefetchControl?: { allow?: boolean } | false
  xDownloadOptions?: boolean
  xFrameOptions?: XFrameOptionsOptions | false
  xPermittedCrossDomainPolicies?: XPermittedCrossDomainPoliciesOptions | false
  xPoweredBy?: boolean
  xXssProtection?: boolean
  referrerPolicy?: ReferrerPolicyOptions | false
  // ... and more
}
```

#### CSPOptions

Content Security Policy configuration:

```typescript
interface CSPOptions {
  directives?: {
    defaultSrc?: string[]
    scriptSrc?: string[]
    styleSrc?: string[]
    imgSrc?: string[]
    fontSrc?: string[]
    objectSrc?: string[]
    baseUri?: string[]
    formAction?: string[]
    frameAncestors?: string[]
    // ... and more
  }
  reportOnly?: boolean
  reportUri?: string[]
}
```

#### HSTSOptions

HTTP Strict Transport Security configuration:

```typescript
interface HSTSOptions {
  maxAge?: number          // Max age in seconds
  includeSubDomains?: boolean
  preload?: boolean
}
```

For complete API documentation, see the [helmet.js documentation](https://helmetjs.github.io/).

## Testing

farrow-helmet comes with comprehensive tests covering all functionality:

```bash
# Run tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Your Security Setup

Test your security headers:

```typescript
import { Http } from 'farrow-http'
import { helmet } from 'farrow-helmet'
import request from 'supertest'

const app = Http()
app.use(helmet())
app.get('/test').use(() => Response.json({ message: 'test' }))

describe('Security Headers', () => {
  it('should set security headers', async () => {
    const response = await request(app.server())
      .get('/test')
      .expect(200)

    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(response.headers['x-xss-protection']).toBe('0')
    expect(response.headers['referrer-policy']).toBe('no-referrer')
  })
})
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/AisonSu/farrow-helmet.git
cd farrow-helmet

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the project
pnpm build
```

### Reporting Issues

Please report security issues privately to [aisonsu@outlook.com](mailto:aisonsu@outlook.com).

For other issues, please use the [GitHub issue tracker](https://github.com/AisonSu/farrow-helmet/issues).

## License

MIT © [Aison](https://github.com/AisonSu)

## Related

- [Farrow](https://github.com/farrow-js/farrow) - The Farrow framework
- [helmet.js](https://helmetjs.github.io/) - The original helmet library for Express
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/) - Security header guidelines

---

**Security Notice**: While farrow-helmet helps secure your applications by setting security headers, it's not a silver bullet. Always follow security best practices, keep your dependencies updated, and consider additional security measures like input validation, authentication, and authorization.