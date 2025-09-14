# Deployment Guide

This guide covers all aspects of deploying the Saros DLMM Position Manager application to production environments.

## Pre-deployment Checklist

### Code Quality

- [ ] All TypeScript types are properly defined
- [ ] ESLint passes with no errors or warnings
- [ ] Prettier formatting is applied consistently
- [ ] ✅ **All tests pass** (`npm test`) - Comprehensive test suite implemented
  - [ ] Unit tests for DLMM client methods
  - [ ] Hook tests with real-time polling functionality
  - [ ] Utility function tests with edge cases
  - [ ] Test coverage > 80% across all metrics
- [ ] ✅ **Build completes successfully** (`npm run build`)
- [ ] ✅ **TypeScript compilation passes** (`npm run type-check`)
- [ ] Bundle analysis shows acceptable sizes

### Performance

- [ ] Lighthouse score > 90 for Performance, Accessibility, SEO
- [ ] Bundle size < 500KB gzipped
- [ ] Critical rendering path optimized
- [ ] Images optimized and served in modern formats
- [ ] Fonts preloaded and optimized

### Security

- [ ] No hardcoded secrets or private keys
- [ ] Environment variables properly configured
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced in production
- [ ] Sensitive data sanitized from logs

## Environment Configuration

### Environment Variables

Create production environment variables:

```bash
# Required Production Variables
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://your-premium-rpc-endpoint.com
NEXT_PUBLIC_SAROS_API_BASE=https://api.saros.finance

# Optional Variables
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io
NEXT_PUBLIC_VERCEL_ENV=production

# Internal Variables (Not exposed to client)
INTERNAL_API_SECRET=your-internal-api-secret
DATABASE_URL=your-database-connection-string
REDIS_URL=your-redis-connection-string
```

### Network Configuration

#### Mainnet Settings
```typescript
export const PRODUCTION_CONFIG = {
  network: 'mainnet-beta',
  rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
  commitment: 'confirmed' as Commitment,
  confirmationTimeout: 30000,
  maxRetries: 3,
  rateLimiting: {
    requestsPerMinute: 500,
    burstLimit: 100
  }
}
```

#### Devnet/Testnet Settings
```typescript
export const STAGING_CONFIG = {
  network: 'devnet',
  rpcEndpoint: 'https://api.devnet.solana.com',
  commitment: 'confirmed' as Commitment,
  confirmationTimeout: 60000,
  maxRetries: 5,
  rateLimiting: {
    requestsPerMinute: 100,
    burstLimit: 50
  }
}
```

## Vercel Deployment

### Automatic Deployment (Recommended)

1. **Connect Repository to Vercel:**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Link project (one-time setup)
   vercel --prod
   ```

2. **Configure Build Settings:**
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (automatic)
   - **Install Command**: `npm install`
   - **Node.js Version**: 18.x

3. **Set Environment Variables in Vercel Dashboard:**
   - Navigate to Project → Settings → Environment Variables
   - Add all production environment variables
   - Ensure sensitive variables are marked as encrypted

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SOLANA_NETWORK production
vercel env add NEXT_PUBLIC_RPC_ENDPOINT production
# ... add all other variables

# Redeploy with new environment variables
vercel --prod
```

### Vercel Configuration File

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/docs",
      "destination": "/docs/index.html",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/health",
      "destination": "/api/health"
    }
  ]
}
```

## Alternative Deployment Platforms

### Netlify

1. **Build Settings:**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"
     
   [build.environment]
     NODE_VERSION = "18"
     NPM_VERSION = "9"
     
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-Content-Type-Options = "nosniff"
   ```

2. **Deployment:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Build and deploy
   npm run build
   netlify deploy --prod --dir=.next
   ```

### AWS Amplify

1. **amplify.yml:**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### Docker Deployment

1. **Dockerfile:**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci
   
   # Build the app
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Docker Compose:**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
         - NEXT_PUBLIC_RPC_ENDPOINT=${RPC_ENDPOINT}
       restart: unless-stopped
   ```

## CDN and Performance Optimization

### Vercel Edge Network

Vercel provides automatic CDN optimization:
- **Edge Caching**: Static assets cached globally
- **Image Optimization**: Automatic WebP conversion and resizing
- **Compression**: Gzip/Brotli compression enabled

### Custom CDN Setup (CloudFlare)

1. **CloudFlare Configuration:**
   ```javascript
   // cloudflare-workers.js
   export default {
     async fetch(request, env, ctx) {
       const cache = caches.default
       const cacheKey = new Request(request.url, request)
       
       // Check cache first
       let response = await cache.match(cacheKey)
       if (response) return response
       
       // Fetch from origin
       response = await fetch(request)
       
       // Cache static assets for 1 year
       if (request.url.includes('/_next/static/')) {
         const newResponse = new Response(response.body, response)
         newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
         ctx.waitUntil(cache.put(cacheKey, newResponse.clone()))
         return newResponse
       }
       
       return response
     }
   }
   ```

## Database and State Management

### Supabase Integration (Optional)

For storing user preferences and analytics:

```typescript
// supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema
/*
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE position_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  position_id TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/
```

## Monitoring and Analytics

### Error Tracking (Sentry)

1. **Installation:**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configuration:**
   ```javascript
   // sentry.client.config.ts
   import * as Sentry from '@sentry/nextjs'
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
     tracesSampleRate: 1.0,
     integrations: [
       new Sentry.BrowserTracing({
         tracingOrigins: [process.env.NEXT_PUBLIC_SITE_URL || 'localhost']
       })
     ]
   })
   ```

### Performance Monitoring

1. **Web Vitals Tracking:**
   ```typescript
   // _app.tsx
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
   
   function sendToAnalytics(metric: any) {
     // Send to Google Analytics or custom endpoint
     gtag('event', 'web_vitals', {
       event_category: 'performance',
       event_label: metric.name,
       value: Math.round(metric.value),
       non_interaction: true
     })
   }
   
   export default function App({ Component, pageProps }: AppProps) {
     useEffect(() => {
       getCLS(sendToAnalytics)
       getFID(sendToAnalytics)
       getFCP(sendToAnalytics)
       getLCP(sendToAnalytics)
       getTTFB(sendToAnalytics)
     }, [])
     
     return <Component {...pageProps} />
   }
   ```

2. **Custom Metrics:**
   ```typescript
   // Track DLMM-specific metrics
   export function trackDLMMMetrics(metric: {
     name: string
     value: number
     labels: Record<string, string>
   }) {
     // Send to monitoring service
     fetch('/api/metrics', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(metric)
     })
   }
   ```

## Security Hardening

### Content Security Policy

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app *.google-analytics.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: blob: *.solana.com *.saros.finance",
      "font-src 'self' fonts.gstatic.com",
      "connect-src 'self' *.solana.com *.saros.finance wss: ws:",
      "worker-src 'self' blob:"
    ].join('; ')
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}
```

### Environment Security

```bash
# Secure environment variables
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
export ENCRYPTION_KEY=$(openssl rand -base64 32)
export API_RATE_LIMIT_SECRET=$(openssl rand -base64 32)
```

## Health Checks and Monitoring

### Health Check Endpoint

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Connection } from '@solana/web3.js'

interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  services: {
    database: 'up' | 'down'
    solana: 'up' | 'down'
    external_apis: 'up' | 'down'
  }
  version: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  try {
    // Check Solana connection
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT!)
    const blockHeight = await connection.getBlockHeight()
    
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up', // Add actual DB check
        solana: blockHeight > 0 ? 'up' : 'down',
        external_apis: 'up' // Add API checks
      },
      version: process.env.npm_package_version || '1.0.0'
    }
    
    res.status(200).json(health)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'down',
        solana: 'down',
        external_apis: 'down'
      },
      version: process.env.npm_package_version || '1.0.0'
    })
  }
}
```

## Rollback Strategy

### Vercel Rollback

```bash
# View deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Database Migrations

```sql
-- Migration rollback strategy
BEGIN;

-- Create backup table
CREATE TABLE position_history_backup AS 
SELECT * FROM position_history;

-- Apply migration
-- ... migration code ...

-- Verify migration
-- ... verification queries ...

-- Commit or rollback
COMMIT; -- or ROLLBACK;
```

## Performance Benchmarks

### Expected Metrics

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.0s

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Load test configuration
# artillery.yml
config:
  target: 'https://your-app.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10
  processor: "./test-functions.js"

scenarios:
  - name: "Homepage load"
    weight: 50
    flow:
      - get:
          url: "/"
  - name: "Analytics page"
    weight: 30
    flow:
      - get:
          url: "/analytics"

# Run load test
artillery run artillery.yml
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node modules
   rm -rf node_modules package-lock.json
   npm install
   
   # Rebuild
   npm run build
   ```

2. **Environment Variable Issues:**
   ```bash
   # Verify env vars in Vercel
   vercel env ls
   
   # Test locally with production env
   vercel env pull .env.production
   npm run build
   ```

3. **Performance Issues:**
   ```bash
   # Analyze bundle
   npm run analyze
   
   # Check for memory leaks
   node --inspect-brk=9229 .next/server/pages/_app.js
   ```

This deployment guide ensures a smooth, secure, and performant production deployment of the Saros DLMM Position Manager application.