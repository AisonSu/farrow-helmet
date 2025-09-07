# farrow-helmet

[![npm version](https://img.shields.io/npm/v/farrow-helmet.svg)](https://www.npmjs.com/package/farrow-helmet)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Status](https://img.shields.io/badge/tests-21%20passed-brightgreen)](./src/index.test.ts)

专为 [Farrow HTTP](https://github.com/farrow-js/farrow) 应用程序设计的安全中间件，通过设置各种 HTTP 安全标头来保护您的 Web 应用。

**farrow-helmet** 是一个 TypeScript 优先的安全中间件，专门为 Farrow HTTP 框架设计，提供全面防护常见 Web 漏洞的保护。

中文文档 | [English](./README.md)

## 目录

- [特性](#特性)
- [快速开始](#快速开始)
- [安装](#安装)
- [基础用法](#基础用法)
- [安全标头](#安全标头)
- [配置选项](#配置选项)
- [高级用法](#高级用法)
- [最佳实践](#最佳实践)
- [示例](#示例)
- [API 参考](#api-参考)
- [测试](#测试)
- [贡献](#贡献)
- [许可证](#许可证)

## 特性

🛡️ **全面的安全标头** - 自动设置重要的安全标头  
🔧 **高度可配置** - 根据需求精细调整安全策略  
⚡ **TypeScript 优先** - 完整类型安全和 IntelliSense 支持  
🚀 **零依赖** - 轻量级，最小占用空间  
🧪 **充分测试** - 21+ 测试用例覆盖所有功能  
📦 **Farrow 优化** - 专为 Farrow HTTP 框架设计  

## 快速开始

```bash
npm install farrow-helmet
```

```typescript
import { Http, Response } from 'farrow-http'
import { helmet } from 'farrow-helmet'

const app = Http()

// 应用安全中间件
app.use(helmet())

app.get('/').use(() => Response.json({ 
  message: '🛡️ 由 farrow-helmet 提供安全保护！' 
}))

app.listen(3000)
```

就是这样！您的 Farrow 应用现在已受到重要安全标头的保护。

## 安装

```bash
# npm
npm install farrow-helmet

# yarn  
yarn add farrow-helmet

# pnpm
pnpm add farrow-helmet
```

**前置要求：**
- Node.js 16+ 
- TypeScript 4.5+
- farrow-http 2.x

## 基础用法

### 默认保护

使用合理的默认配置应用 helmet：

```typescript
import { helmet } from 'farrow-helmet'

app.use(helmet())
```

这会自动启用：
- 内容类型嗅探保护
- 点击劫持保护  
- XSS 过滤（现代方式）
- Referrer 策略控制
- IE 下载安全
- 跨域策略限制

### 自定义配置

自定义安全策略以符合您的需求：

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
    maxAge: 31536000, // 1 年
    includeSubDomains: true,
    preload: true
  }
}))
```

## 安全标头

farrow-helmet 默认设置以下安全标头：

| 标头 | 默认值 | 用途 |
|------|--------|------|
| `X-Content-Type-Options` | `nosniff` | 防止 MIME 类型嗅探攻击 |
| `X-Frame-Options` | `SAMEORIGIN` | 防止点击劫持攻击 |
| `X-XSS-Protection` | `0` | 现代 XSS 保护（禁用旧版过滤器） |
| `Referrer-Policy` | `no-referrer` | 控制引荐信息泄露 |
| `X-Download-Options` | `noopen` | 防止 IE 执行下载的文件 |
| `X-Permitted-Cross-Domain-Policies` | `none` | 限制 Flash/PDF 跨域访问 |

### 其他可用标头

使用自定义选项配置这些标头：

- **内容安全策略 (CSP)** - 防止 XSS 和注入攻击
- **HTTP 严格传输安全 (HSTS)** - 强制 HTTPS 连接
- **X-DNS-Prefetch-Control** - 控制 DNS 预取
- **Expect-CT** - 证书透明度强制
- **Feature-Policy / Permissions-Policy** - 控制浏览器功能

## 配置选项

### 内容安全策略 (CSP)

防御 XSS 和注入攻击：

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

### HTTP 严格传输安全 (HSTS)

强制 HTTPS 连接：

```typescript
app.use(helmet({
  hsts: {
    maxAge: 31536000,        // 1 年（秒为单位）
    includeSubDomains: true, // 应用到所有子域
    preload: true           // 启用 HSTS 预加载
  }
}))
```

### 环境特定配置

为不同环境配置不同策略：

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
    maxAge: 63072000, // 2 年
    includeSubDomains: true,
    preload: true
  } : false, // 开发环境禁用 HSTS
  
  // 开发环境中报告 CSP 违规
  contentSecurityPolicyReportOnly: isDevelopment
}))
```

### 禁用特定标头

禁用您不需要的标头：

```typescript
app.use(helmet({
  xFrameOptions: false,           // 禁用 X-Frame-Options
  contentSecurityPolicy: false,  // 禁用 CSP
  xContentTypeOptions: false     // 禁用 X-Content-Type-Options
}))
```

## 高级用法

### 与其他中间件集成

正确的中间件顺序对安全至关重要：

```typescript
const app = Http({ logger: true })

// 1. 错误处理（第一个）
app.use(async (req, next) => {
  try {
    return await next(req)
  } catch (error) {
    console.error('请求失败:', error)
    return Response.status(500).json({ 
      error: '服务器内部错误' 
    })
  }
})

// 2. 安全标头（早期）
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"]
    }
  }
}))

// 3. CORS（在安全防护之后）
import { cors } from 'farrow-cors'

app.use(cors({
  origin: 'https://trusted-domain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 4. 认证
app.use(authenticationMiddleware)

// 5. 业务逻辑
app.get('/api/data').use(() => Response.json({ data: [] }))
```

### 路由特定安全

为不同路由应用不同的安全策略：

```typescript
import { Router } from 'farrow-http'

// 公共 API - 严格的 CSP
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

// 管理面板 - 更宽松的策略
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

// 挂载路由器
app.route('/api').use(publicRouter)
app.route('/admin').use(adminRouter)
```

### 动态安全策略

根据请求上下文调整策略：

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

## 最佳实践

### 1. 从严格策略开始

从限制性策略开始，然后逐步放宽：

```typescript
// 开始时严格
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

// 然后根据需要添加例外
// scriptSrc: ["'self'", "https://trusted-cdn.com"]
```

### 2. 使用 CSP 仅报告模式进行测试

在不破坏功能的情况下测试 CSP 策略：

```typescript
app.use(helmet({
  contentSecurityPolicyReportOnly: {
    directives: {
      defaultSrc: ["'self'"],
      reportUri: ['/csp-report']
    }
  }
}))

// 处理 CSP 报告
app.post('/csp-report').use((req) => {
  console.log('CSP 违规:', req.body)
  return Response.status(204).empty()
})
```

### 3. 环境特定安全

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

### 4. 监控和记录安全标头

```typescript
app.use(helmet())

app.use((req, next) => {
  const response = next(req)
  
  // 记录安全相关请求
  if (req.pathname.includes('..') || req.pathname.includes('<script>')) {
    console.warn('可疑请求:', {
      ip: req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'],
      path: req.pathname
    })
  }
  
  return response
})
```

## 示例

### 完整的生产设置

```typescript
import { Http, Response, Router } from 'farrow-http'
import { helmet } from 'farrow-helmet'
import { createContext } from 'farrow-pipeline'

const app = Http({
  logger: {
    ignoreIntrospectionRequestOfFarrowApi: true
  }
})

// 安全配置
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
    maxAge: 63072000, // 2 年
    includeSubDomains: true,
    preload: true
  }
}))

// API 的 CORS
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

// 带安全的静态文件
app.serve('/static', './public')

// 健康检查
app.get('/health').use(() => {
  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`🛡️ 安全服务器运行在 http://localhost:${port}`)
})
```

### CSP 违规报告

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
  
  console.warn('CSP 违规:', {
    uri: report.documentUri,
    directive: report.violatedDirective,
    blocked: report.blockedUri,
    source: report.sourceFile,
    line: report.lineNumber,
    timestamp: new Date().toISOString()
  })
  
  // 存储到数据库或发送到监控服务
  // await logCSPViolation(report)
  
  return Response.status(204).empty()
})
```

## API 参考

### `helmet(options?: HelmetOptions): HttpMiddleware`

返回 Farrow HTTP 中间件的主要 helmet 函数。

#### HelmetOptions

所有选项都是可选的，与 [helmet.js](https://helmetjs.github.io/) API 匹配：

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
  // ... 更多选项
}
```

#### CSPOptions

内容安全策略配置：

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
    // ... 更多指令
  }
  reportOnly?: boolean
  reportUri?: string[]
}
```

#### HSTSOptions

HTTP 严格传输安全配置：

```typescript
interface HSTSOptions {
  maxAge?: number          // 最大存活时间（秒）
  includeSubDomains?: boolean
  preload?: boolean
}
```

完整的 API 文档请参见 [helmet.js 文档](https://helmetjs.github.io/)。

## 测试

farrow-helmet 带有涵盖所有功能的全面测试：

```bash
# 运行测试
npm test

# 观察模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 测试您的安全设置

测试您的安全标头：

```typescript
import { Http } from 'farrow-http'
import { helmet } from 'farrow-helmet'
import request from 'supertest'

const app = Http()
app.use(helmet())
app.get('/test').use(() => Response.json({ message: 'test' }))

describe('安全标头', () => {
  it('应该设置安全标头', async () => {
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

## 贡献

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详细信息。

### 开发设置

```bash
# 克隆仓库
git clone https://github.com/AisonSu/farrow-helmet.git
cd farrow-helmet

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 构建项目
pnpm build
```

### 报告问题

请将安全问题私下报告给 [aisonsu@outlook.com](mailto:aisonsu@outlook.com)。

对于其他问题，请使用 [GitHub 问题跟踪器](https://github.com/AisonSu/farrow-helmet/issues)。

## 许可证

MIT © [Aison](https://github.com/AisonSu)

## 相关项目

- [Farrow](https://github.com/farrow-js/farrow) - Farrow 框架
- [helmet.js](https://helmetjs.github.io/) - Express 的原始 helmet 库
- [OWASP 安全标头](https://owasp.org/www-project-secure-headers/) - 安全标头指南

---

**安全提示**：虽然 farrow-helmet 通过设置安全标头帮助保护您的应用程序，但它不是万能的解决方案。请始终遵循安全最佳实践，保持依赖项更新，并考虑额外的安全措施，如输入验证、身份验证和授权。