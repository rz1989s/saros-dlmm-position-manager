#!/usr/bin/env node

/**
 * PWA Feature Testing Suite
 * Tests PWA manifest, service worker, offline capabilities, and installability
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://saros-dlmm-position-manager-1vkia8lmy-rectors-projects.vercel.app';

class PWATestSuite {
  constructor() {
    this.results = {
      manifest: { passed: 0, failed: 0, tests: [] },
      serviceWorker: { passed: 0, failed: 0, tests: [] },
      offline: { passed: 0, failed: 0, tests: [] },
      installability: { passed: 0, failed: 0, tests: [] }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting PWA Feature Testing Suite...\n');

    await this.testManifest();
    await this.testServiceWorker();
    await this.testOfflineCapabilities();
    await this.testInstallability();

    this.generateReport();
  }

  async testManifest() {
    console.log('📋 Testing PWA Manifest...');

    try {
      // Test manifest accessibility
      const manifestUrl = `${BASE_URL}/manifest.json`;
      const manifest = await this.fetchJson(manifestUrl);

      this.addTest('manifest', 'Manifest accessible', true, 'Manifest fetched successfully');

      // Required fields
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
      requiredFields.forEach(field => {
        const exists = manifest.hasOwnProperty(field);
        this.addTest('manifest', `Required field: ${field}`, exists,
          exists ? `✓ ${field}: ${JSON.stringify(manifest[field])}` : `✗ Missing ${field}`);
      });

      // Icon validation
      if (manifest.icons && Array.isArray(manifest.icons)) {
        const hasRequiredSizes = manifest.icons.some(icon =>
          icon.sizes === '192x192' || icon.sizes === '512x512'
        );
        this.addTest('manifest', 'Required icon sizes (192x192, 512x512)', hasRequiredSizes,
          hasRequiredSizes ? 'Has required icon sizes' : 'Missing required icon sizes');
      }

      // Display mode validation
      const validDisplayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
      const validDisplay = validDisplayModes.includes(manifest.display);
      this.addTest('manifest', 'Valid display mode', validDisplay,
        validDisplay ? `Valid display: ${manifest.display}` : `Invalid display: ${manifest.display}`);

    } catch (error) {
      this.addTest('manifest', 'Manifest accessible', false, `Error: ${error.message}`);
    }
  }

  async testServiceWorker() {
    console.log('⚙️ Testing Service Worker...');

    try {
      // Test service worker file accessibility
      const swUrl = `${BASE_URL}/sw.js`;
      const swContent = await this.fetchText(swUrl);

      this.addTest('serviceWorker', 'Service worker file accessible', true, 'sw.js fetched successfully');

      // Check for essential service worker features
      const features = [
        { name: 'Install event', pattern: /addEventListener\s*\(\s*['"]install['"]/ },
        { name: 'Activate event', pattern: /addEventListener\s*\(\s*['"]activate['"]/ },
        { name: 'Fetch event', pattern: /addEventListener\s*\(\s*['"]fetch['"]/ },
        { name: 'Cache API usage', pattern: /caches\.(open|match|add)/ },
        { name: 'Background sync', pattern: /addEventListener\s*\(\s*['"]sync['"]/ },
        { name: 'Push notifications', pattern: /addEventListener\s*\(\s*['"]push['"]/ }
      ];

      features.forEach(feature => {
        const exists = feature.pattern.test(swContent);
        this.addTest('serviceWorker', feature.name, exists,
          exists ? `✓ ${feature.name} implemented` : `✗ ${feature.name} not found`);
      });

      // Check cache strategy implementation
      const cacheStrategies = [
        { name: 'Cache First', pattern: /cacheFirst|cache.*first/i },
        { name: 'Network First', pattern: /networkFirst|network.*first/i },
        { name: 'Stale While Revalidate', pattern: /staleWhileRevalidate|stale.*revalidate/i }
      ];

      cacheStrategies.forEach(strategy => {
        const exists = strategy.pattern.test(swContent);
        this.addTest('serviceWorker', strategy.name, exists,
          exists ? `✓ ${strategy.name} strategy found` : `ℹ ${strategy.name} strategy not detected`);
      });

    } catch (error) {
      this.addTest('serviceWorker', 'Service worker file accessible', false, `Error: ${error.message}`);
    }
  }

  async testOfflineCapabilities() {
    console.log('🌐 Testing Offline Capabilities...');

    try {
      // Test if main page is cached
      const response = await this.fetch(`${BASE_URL}/`);
      const headers = response.headers;

      // Check cache-related headers
      const hasCacheControl = headers.hasOwnProperty('cache-control');
      this.addTest('offline', 'Cache control headers', hasCacheControl,
        hasCacheControl ? `Cache-Control: ${headers['cache-control']}` : 'No cache control headers');

      // Test static asset caching potential
      const staticAssets = [
        '/favicon.svg',
        '/icons/icon-192x192.svg',
        '/icons/icon-512x512.svg'
      ];

      for (const asset of staticAssets) {
        try {
          await this.fetch(`${BASE_URL}${asset}`);
          this.addTest('offline', `Static asset: ${asset}`, true, `✓ ${asset} accessible`);
        } catch (error) {
          this.addTest('offline', `Static asset: ${asset}`, false, `✗ ${asset} failed: ${error.message}`);
        }
      }

    } catch (error) {
      this.addTest('offline', 'Offline capability test', false, `Error: ${error.message}`);
    }
  }

  async testInstallability() {
    console.log('📱 Testing PWA Installability...');

    try {
      // Check if manifest is linked in HTML
      const htmlContent = await this.fetchText(BASE_URL);

      const manifestLinked = /<link[^>]*rel=["']manifest["'][^>]*>/i.test(htmlContent);
      this.addTest('installability', 'Manifest linked in HTML', manifestLinked,
        manifestLinked ? 'Manifest link tag found' : 'No manifest link tag');

      // Check for theme-color meta tag
      const themeColor = /<meta[^>]*name=["']theme-color["'][^>]*>/i.test(htmlContent);
      this.addTest('installability', 'Theme color meta tag', themeColor,
        themeColor ? 'Theme color meta tag found' : 'No theme color meta tag');

      // Check for viewport meta tag
      const viewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(htmlContent);
      this.addTest('installability', 'Viewport meta tag', viewport,
        viewport ? 'Viewport meta tag found' : 'No viewport meta tag');

      // Check for HTTPS (required for PWA)
      const isHttps = BASE_URL.startsWith('https://');
      this.addTest('installability', 'HTTPS deployment', isHttps,
        isHttps ? 'Deployed over HTTPS' : 'Not deployed over HTTPS');

      // Check for service worker registration in HTML
      const swRegistration = /serviceWorker.*register/i.test(htmlContent) ||
                            /navigator\.serviceWorker/i.test(htmlContent);
      this.addTest('installability', 'Service worker registration', swRegistration,
        swRegistration ? 'Service worker registration code found' : 'No service worker registration');

    } catch (error) {
      this.addTest('installability', 'Installability test', false, `Error: ${error.message}`);
    }
  }

  addTest(category, name, passed, details) {
    this.results[category].tests.push({ name, passed, details });
    if (passed) {
      this.results[category].passed++;
    } else {
      this.results[category].failed++;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PWA TESTING RESULTS');
    console.log('='.repeat(80));

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.results).forEach(([category, data]) => {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      console.log(`\n${categoryName} Tests:`);
      console.log(`  ✅ Passed: ${data.passed}`);
      console.log(`  ❌ Failed: ${data.failed}`);
      console.log(`  📈 Success Rate: ${((data.passed / (data.passed + data.failed)) * 100).toFixed(1)}%`);

      totalPassed += data.passed;
      totalFailed += data.failed;

      data.tests.forEach(test => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`    ${icon} ${test.name}: ${test.details}`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('OVERALL SUMMARY:');
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`📈 Overall Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(80));

    // PWA readiness assessment
    if (totalFailed === 0) {
      console.log('🎉 PWA STATUS: EXCELLENT - All tests passed!');
    } else if (totalFailed <= 3) {
      console.log('✅ PWA STATUS: GOOD - Minor issues detected');
    } else if (totalFailed <= 6) {
      console.log('⚠️  PWA STATUS: NEEDS IMPROVEMENT - Several issues found');
    } else {
      console.log('❌ PWA STATUS: POOR - Major issues require attention');
    }
  }

  fetch(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: data
          });
        });
      });

      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async fetchText(url) {
    const response = await this.fetch(url);
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }
    return response.body;
  }

  async fetchJson(url) {
    const text = await this.fetchText(url);
    return JSON.parse(text);
  }
}

// Run the test suite
const testSuite = new PWATestSuite();
testSuite.runAllTests().catch(console.error);