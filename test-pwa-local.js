#!/usr/bin/env node

/**
 * Local PWA Feature Analysis
 * Analyzes PWA files and implementation locally
 */

const fs = require('fs');
const path = require('path');

class LocalPWAAnalyzer {
  constructor() {
    this.results = {
      manifest: { passed: 0, failed: 0, tests: [] },
      serviceWorker: { passed: 0, failed: 0, tests: [] },
      nextjsIntegration: { passed: 0, failed: 0, tests: [] },
      accessibility: { passed: 0, failed: 0, tests: [] }
    };
  }

  analyze() {
    console.log('🔍 Analyzing Local PWA Implementation...\n');

    this.analyzeManifest();
    this.analyzeServiceWorker();
    this.analyzeNextjsIntegration();
    this.analyzeAccessibility();

    this.generateReport();
  }

  analyzeManifest() {
    console.log('📋 Analyzing PWA Manifest...');

    try {
      const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
      const manifestExists = fs.existsSync(manifestPath);

      this.addTest('manifest', 'Manifest file exists', manifestExists,
        manifestExists ? 'manifest.json found in public/' : 'manifest.json not found');

      if (manifestExists) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

        // Required PWA fields
        const requiredFields = [
          { field: 'name', value: manifest.name },
          { field: 'short_name', value: manifest.short_name },
          { field: 'start_url', value: manifest.start_url },
          { field: 'display', value: manifest.display },
          { field: 'theme_color', value: manifest.theme_color },
          { field: 'background_color', value: manifest.background_color },
          { field: 'icons', value: manifest.icons }
        ];

        requiredFields.forEach(({ field, value }) => {
          const exists = value !== undefined;
          this.addTest('manifest', `${field} field`, exists,
            exists ? `✓ ${field}: ${JSON.stringify(value)}` : `✗ Missing ${field}`);
        });

        // Icon validation
        if (manifest.icons && Array.isArray(manifest.icons)) {
          const hasRequiredSizes = manifest.icons.some(icon =>
            ['192x192', '512x512'].includes(icon.sizes)
          );
          this.addTest('manifest', 'Required icon sizes', hasRequiredSizes,
            hasRequiredSizes ? `Has required sizes: ${manifest.icons.map(i => i.sizes).join(', ')}` : 'Missing 192x192 or 512x512 icons');

          // Check if icon files exist
          const iconFiles = manifest.icons.map(icon => path.join(process.cwd(), 'public', icon.src));
          let existingIcons = 0;
          iconFiles.forEach(iconPath => {
            if (fs.existsSync(iconPath)) existingIcons++;
          });

          this.addTest('manifest', 'Icon files exist', existingIcons === iconFiles.length,
            `${existingIcons}/${iconFiles.length} icon files found`);
        }

        // Display mode validation
        const validDisplayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
        const validDisplay = validDisplayModes.includes(manifest.display);
        this.addTest('manifest', 'Valid display mode', validDisplay,
          validDisplay ? `Valid: ${manifest.display}` : `Invalid: ${manifest.display}`);

        // Check for shortcuts (PWA feature)
        const hasShortcuts = manifest.shortcuts && Array.isArray(manifest.shortcuts);
        this.addTest('manifest', 'App shortcuts', hasShortcuts,
          hasShortcuts ? `${manifest.shortcuts.length} shortcuts defined` : 'No shortcuts defined');
      }
    } catch (error) {
      this.addTest('manifest', 'Manifest parsing', false, `Error: ${error.message}`);
    }
  }

  analyzeServiceWorker() {
    console.log('⚙️ Analyzing Service Worker...');

    try {
      const swPath = path.join(process.cwd(), 'public', 'sw.js');
      const swExists = fs.existsSync(swPath);

      this.addTest('serviceWorker', 'Service worker file exists', swExists,
        swExists ? 'sw.js found in public/' : 'sw.js not found');

      if (swExists) {
        const swContent = fs.readFileSync(swPath, 'utf8');

        // Essential SW features
        const features = [
          { name: 'Install event listener', pattern: /addEventListener\s*\(\s*['"]install['"]/ },
          { name: 'Activate event listener', pattern: /addEventListener\s*\(\s*['"]activate['"]/ },
          { name: 'Fetch event listener', pattern: /addEventListener\s*\(\s*['"]fetch['"]/ },
          { name: 'Cache API usage', pattern: /caches\.(open|match|add|put)/ },
          { name: 'Cache versioning', pattern: /(CACHE_NAME|STATIC_CACHE|DYNAMIC_CACHE)/ },
          { name: 'Background sync', pattern: /addEventListener\s*\(\s*['"]sync['"]/ },
          { name: 'Push notifications', pattern: /addEventListener\s*\(\s*['"]push['"]/ },
          { name: 'Notification click handling', pattern: /addEventListener\s*\(\s*['"]notificationclick['"]/ }
        ];

        features.forEach(feature => {
          const exists = feature.pattern.test(swContent);
          this.addTest('serviceWorker', feature.name, exists,
            exists ? `✓ ${feature.name} implemented` : `ℹ ${feature.name} not detected`);
        });

        // Cache strategies
        const strategies = [
          { name: 'Cache First strategy', pattern: /cacheFirst|cache.*first/i },
          { name: 'Network First strategy', pattern: /networkFirst|network.*first/i },
          { name: 'Stale While Revalidate', pattern: /staleWhileRevalidate|stale.*revalidate/i }
        ];

        strategies.forEach(strategy => {
          const exists = strategy.pattern.test(swContent);
          this.addTest('serviceWorker', strategy.name, exists,
            exists ? `✓ ${strategy.name} detected` : `ℹ ${strategy.name} not found`);
        });

        // Error handling
        const errorHandling = [
          { name: 'Offline fallback', pattern: /offline.*fallback|handleOfflineFallback/i },
          { name: 'Error classification', pattern: /classifyError|error.*type/i },
          { name: 'Graceful degradation', pattern: /graceful.*response|fallback.*response/i }
        ];

        errorHandling.forEach(handler => {
          const exists = handler.pattern.test(swContent);
          this.addTest('serviceWorker', handler.name, exists,
            exists ? `✓ ${handler.name} implemented` : `ℹ ${handler.name} not detected`);
        });
      }
    } catch (error) {
      this.addTest('serviceWorker', 'Service worker analysis', false, `Error: ${error.message}`);
    }
  }

  analyzeNextjsIntegration() {
    console.log('⚡ Analyzing Next.js PWA Integration...');

    try {
      // Check package.json for PWA dependencies
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      const pwaPackages = [
        'next-pwa',
        'workbox-webpack-plugin',
        'workbox-sw'
      ];

      pwaPackages.forEach(pkg => {
        const installed = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg];
        this.addTest('nextjsIntegration', `${pkg} dependency`, !!installed,
          installed ? `✓ ${pkg}: ${installed}` : `ℹ ${pkg} not installed (manual SW implementation)`);
      });

      // Check for SW registration in app
      const appPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
      if (fs.existsSync(appPath)) {
        const appContent = fs.readFileSync(appPath, 'utf8');
        const hasSwRegistration = /serviceWorker.*register|navigator\.serviceWorker/i.test(appContent);
        this.addTest('nextjsIntegration', 'SW registration in app', hasSwRegistration,
          hasSwRegistration ? 'Service worker registration found' : 'Manual registration recommended');
      }

      // Check for manifest link in layout
      const layoutFiles = [
        path.join(process.cwd(), 'src', 'app', 'layout.tsx'),
        path.join(process.cwd(), 'app', 'layout.tsx')
      ];

      let manifestLinked = false;
      layoutFiles.forEach(layoutPath => {
        if (fs.existsSync(layoutPath)) {
          const layoutContent = fs.readFileSync(layoutPath, 'utf8');
          if (/<link[^>]*rel=["']manifest["']/.test(layoutContent)) {
            manifestLinked = true;
          }
        }
      });

      this.addTest('nextjsIntegration', 'Manifest linked in layout', manifestLinked,
        manifestLinked ? 'Manifest link found in layout' : 'Check if manifest is linked via Next.js metadata');

    } catch (error) {
      this.addTest('nextjsIntegration', 'Next.js integration analysis', false, `Error: ${error.message}`);
    }
  }

  analyzeAccessibility() {
    console.log('♿ Analyzing Accessibility Features...');

    try {
      // Check for accessibility utilities
      const accessibilityPath = path.join(process.cwd(), 'src', 'lib', 'accessibility.ts');
      const accessibilityExists = fs.existsSync(accessibilityPath);

      this.addTest('accessibility', 'Accessibility utilities exist', accessibilityExists,
        accessibilityExists ? 'accessibility.ts found' : 'No accessibility utilities found');

      if (accessibilityExists) {
        const accessibilityContent = fs.readFileSync(accessibilityPath, 'utf8');

        const features = [
          { name: 'Screen reader utilities', pattern: /screenReader|announce/i },
          { name: 'Focus management', pattern: /focus.*trap|focus.*management/i },
          { name: 'ARIA utilities', pattern: /aria|role.*helper/i },
          { name: 'Keyboard navigation', pattern: /keyboard.*navigation|key.*handler/i },
          { name: 'Color contrast checking', pattern: /contrast.*ratio|wcag.*contrast/i },
          { name: 'Reduced motion support', pattern: /reduced.*motion|prefers.*reduced/i }
        ];

        features.forEach(feature => {
          const exists = feature.pattern.test(accessibilityContent);
          this.addTest('accessibility', feature.name, exists,
            exists ? `✓ ${feature.name} implemented` : `ℹ ${feature.name} not detected`);
        });
      }

      // Check for accessible components
      const accessibleComponentsPath = path.join(process.cwd(), 'src', 'components', 'accessibility', 'accessible-components.tsx');
      const accessibleComponentsExist = fs.existsSync(accessibleComponentsPath);

      this.addTest('accessibility', 'Accessible components library', accessibleComponentsExist,
        accessibleComponentsExist ? 'accessible-components.tsx found' : 'No accessible components library');

      if (accessibleComponentsExist) {
        const componentsContent = fs.readFileSync(accessibleComponentsPath, 'utf8');

        const componentFeatures = [
          { name: 'AccessibleMotion component', pattern: /AccessibleMotion|motion.*reduced/i },
          { name: 'Screen reader components', pattern: /ScreenReader|sr-only/i },
          { name: 'Focus trap component', pattern: /FocusTrap|focus.*trap/i },
          { name: 'Skip links', pattern: /SkipLink|skip.*content/i }
        ];

        componentFeatures.forEach(feature => {
          const exists = feature.pattern.test(componentsContent);
          this.addTest('accessibility', feature.name, exists,
            exists ? `✓ ${feature.name} available` : `ℹ ${feature.name} not found`);
        });
      }

    } catch (error) {
      this.addTest('accessibility', 'Accessibility analysis', false, `Error: ${error.message}`);
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
    console.log('📊 LOCAL PWA ANALYSIS RESULTS');
    console.log('='.repeat(80));

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.results).forEach(([category, data]) => {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
      console.log(`\n${categoryName}:`);
      console.log(`  ✅ Implemented: ${data.passed}`);
      console.log(`  ❌ Missing/Failed: ${data.failed}`);
      console.log(`  📈 Implementation Rate: ${((data.passed / (data.passed + data.failed)) * 100).toFixed(1)}%`);

      totalPassed += data.passed;
      totalFailed += data.failed;

      data.tests.forEach(test => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`    ${icon} ${test.name}: ${test.details}`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('OVERALL SUMMARY:');
    console.log(`✅ Total Implemented: ${totalPassed}`);
    console.log(`❌ Total Missing: ${totalFailed}`);
    console.log(`📈 Overall Implementation Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(80));

    // PWA readiness assessment
    const implementationRate = (totalPassed / (totalPassed + totalFailed)) * 100;
    if (implementationRate >= 90) {
      console.log('🏆 PWA STATUS: EXCELLENT - Comprehensive PWA implementation!');
    } else if (implementationRate >= 75) {
      console.log('✅ PWA STATUS: VERY GOOD - Strong PWA features implemented');
    } else if (implementationRate >= 60) {
      console.log('👍 PWA STATUS: GOOD - Solid PWA foundation');
    } else {
      console.log('⚠️  PWA STATUS: NEEDS IMPROVEMENT - Consider enhancing PWA features');
    }

    console.log('\n📋 RECOMMENDATIONS:');
    if (this.results.manifest.failed > 0) {
      console.log('• Review and complete PWA manifest configuration');
    }
    if (this.results.serviceWorker.failed > this.results.serviceWorker.passed) {
      console.log('• Enhance service worker with more caching strategies');
    }
    if (this.results.accessibility.failed > 0) {
      console.log('• Consider implementing additional accessibility features');
    }
    console.log('• Test PWA installation on various devices and browsers');
    console.log('• Validate offline functionality across all pages');
  }
}

// Run the analysis
const analyzer = new LocalPWAAnalyzer();
analyzer.analyze();