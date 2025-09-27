#!/usr/bin/env node

/**
 * WCAG 2.1 AA Accessibility Compliance Analyzer
 * Analyzes codebase for accessibility compliance patterns and implementation
 */

const fs = require('fs');
const path = require('path');

class AccessibilityComplianceAnalyzer {
  constructor() {
    this.results = {
      semanticHtml: { passed: 0, failed: 0, tests: [] },
      ariaCompliance: { passed: 0, failed: 0, tests: [] },
      keyboardAccessibility: { passed: 0, failed: 0, tests: [] },
      colorContrast: { passed: 0, failed: 0, tests: [] },
      textAlternatives: { passed: 0, failed: 0, tests: [] },
      motionAccessibility: { passed: 0, failed: 0, tests: [] }
    };
    this.componentsAnalyzed = 0;
    this.accessibilityFeatures = [];
  }

  async analyze() {
    console.log('♿ Analyzing WCAG 2.1 AA Accessibility Compliance...\n');

    await this.analyzeSemanticHtml();
    await this.analyzeAriaCompliance();
    await this.analyzeKeyboardAccessibility();
    await this.analyzeColorContrast();
    await this.analyzeTextAlternatives();
    await this.analyzeMotionAccessibility();

    this.generateComplianceReport();
  }

  async analyzeSemanticHtml() {
    console.log('🏗️  Analyzing Semantic HTML Structure...');

    const componentDir = path.join(process.cwd(), 'src', 'components');
    const componentFiles = this.getComponentFiles(componentDir);

    let semanticElementsFound = 0;
    let properHeadingStructure = 0;
    let landmarkElements = 0;

    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      this.componentsAnalyzed++;

      // Check for semantic HTML elements
      const semanticElements = [
        'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
      ];

      semanticElements.forEach(element => {
        if (new RegExp(`<${element}[^>]*>|<${element}>`, 'g').test(content)) {
          semanticElementsFound++;
        }
      });

      // Check for proper heading hierarchy
      const headingPattern = /<h[1-6][^>]*>/g;
      const headings = content.match(headingPattern);
      if (headings && headings.length > 0) {
        properHeadingStructure++;
      }

      // Check for ARIA landmarks
      const landmarkPatterns = [
        /role=["']banner["']/,
        /role=["']navigation["']/,
        /role=["']main["']/,
        /role=["']complementary["']/,
        /role=["']contentinfo["']/
      ];

      landmarkPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          landmarkElements++;
        }
      });
    });

    this.addTest('semanticHtml', 'Semantic HTML elements usage', semanticElementsFound > 0,
      `${semanticElementsFound} semantic elements found across components`);

    this.addTest('semanticHtml', 'Proper heading structure', properHeadingStructure > 0,
      `${properHeadingStructure} components with proper headings`);

    this.addTest('semanticHtml', 'ARIA landmarks', landmarkElements > 0,
      `${landmarkElements} ARIA landmark roles found`);

    // Check for list structures
    const hasListStructures = componentFiles.some(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      return /<(ul|ol|dl)[\s>]/.test(content);
    });

    this.addTest('semanticHtml', 'List structures', hasListStructures,
      hasListStructures ? 'List elements (ul/ol/dl) found' : 'No list structures detected');
  }

  async analyzeAriaCompliance() {
    console.log('🔖 Analyzing ARIA Compliance...');

    const componentDir = path.join(process.cwd(), 'src', 'components');
    const componentFiles = this.getComponentFiles(componentDir);

    let ariaLabelsFound = 0;
    let ariaDescriptionsFound = 0;
    let ariaRolesFound = 0;
    let ariaStatesFound = 0;

    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for ARIA labels
      if (/aria-label(ledby)?=/.test(content)) {
        ariaLabelsFound++;
      }

      // Check for ARIA descriptions
      if (/aria-describedby=/.test(content)) {
        ariaDescriptionsFound++;
      }

      // Check for ARIA roles
      if (/role=["'][^"']*["']/.test(content)) {
        ariaRolesFound++;
      }

      // Check for ARIA states and properties
      const ariaStates = [
        'aria-expanded', 'aria-hidden', 'aria-disabled', 'aria-checked',
        'aria-selected', 'aria-pressed', 'aria-current', 'aria-live'
      ];

      ariaStates.forEach(state => {
        if (new RegExp(`${state}=`).test(content)) {
          ariaStatesFound++;
        }
      });
    });

    this.addTest('ariaCompliance', 'ARIA labels', ariaLabelsFound > 0,
      `${ariaLabelsFound} components with ARIA labels`);

    this.addTest('ariaCompliance', 'ARIA descriptions', ariaDescriptionsFound > 0,
      `${ariaDescriptionsFound} components with ARIA descriptions`);

    this.addTest('ariaCompliance', 'ARIA roles', ariaRolesFound > 0,
      `${ariaRolesFound} components with ARIA roles`);

    this.addTest('ariaCompliance', 'ARIA states and properties', ariaStatesFound > 0,
      `${ariaStatesFound} ARIA state/property usages found`);

    // Check for screen reader utilities
    const accessibilityPath = path.join(process.cwd(), 'src', 'lib', 'accessibility.ts');
    if (fs.existsSync(accessibilityPath)) {
      const accessibilityContent = fs.readFileSync(accessibilityPath, 'utf8');
      const hasScreenReaderUtils = /screenReader|announce|sr-only/i.test(accessibilityContent);

      this.addTest('ariaCompliance', 'Screen reader utilities', hasScreenReaderUtils,
        hasScreenReaderUtils ? 'Screen reader utilities implemented' : 'No screen reader utilities found');
    }
  }

  async analyzeKeyboardAccessibility() {
    console.log('⌨️  Analyzing Keyboard Accessibility...');

    const componentDir = path.join(process.cwd(), 'src', 'components');
    const componentFiles = this.getComponentFiles(componentDir);

    let keyboardEventHandlers = 0;
    let focusManagement = 0;
    let tabIndexUsage = 0;
    let skipLinksFound = 0;

    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for keyboard event handlers
      const keyboardEvents = ['onKeyDown', 'onKeyUp', 'onKeyPress'];
      keyboardEvents.forEach(event => {
        if (new RegExp(event).test(content)) {
          keyboardEventHandlers++;
        }
      });

      // Check for focus management
      if (/focus\(\)|autoFocus|focusable/i.test(content)) {
        focusManagement++;
      }

      // Check for tabIndex usage
      if (/tabIndex=/.test(content)) {
        tabIndexUsage++;
      }

      // Check for skip links
      if (/skip.*content|skip.*navigation/i.test(content)) {
        skipLinksFound++;
      }
    });

    this.addTest('keyboardAccessibility', 'Keyboard event handlers', keyboardEventHandlers > 0,
      `${keyboardEventHandlers} keyboard event handlers found`);

    this.addTest('keyboardAccessibility', 'Focus management', focusManagement > 0,
      `${focusManagement} components with focus management`);

    this.addTest('keyboardAccessibility', 'Tab index usage', tabIndexUsage > 0,
      `${tabIndexUsage} components with tabIndex attributes`);

    this.addTest('keyboardAccessibility', 'Skip links', skipLinksFound > 0,
      `${skipLinksFound} skip link implementations found`);

    // Check for focus trap implementation
    const accessibleComponentsPath = path.join(process.cwd(), 'src', 'components', 'accessibility', 'accessible-components.tsx');
    if (fs.existsSync(accessibleComponentsPath)) {
      const content = fs.readFileSync(accessibleComponentsPath, 'utf8');
      const hasFocusTrap = /focusTrap|focus.*management/i.test(content);

      this.addTest('keyboardAccessibility', 'Focus trap utilities', hasFocusTrap,
        hasFocusTrap ? 'Focus trap utilities available' : 'Consider implementing focus trap for modals');
    }
  }

  async analyzeColorContrast() {
    console.log('🎨 Analyzing Color and Contrast...');

    // Check for contrast utilities
    const accessibilityPath = path.join(process.cwd(), 'src', 'lib', 'accessibility.ts');
    if (fs.existsSync(accessibilityPath)) {
      const accessibilityContent = fs.readFileSync(accessibilityPath, 'utf8');

      const hasContrastChecking = /contrast.*ratio|wcag.*contrast/i.test(accessibilityContent);
      this.addTest('colorContrast', 'Contrast checking utilities', hasContrastChecking,
        hasContrastChecking ? 'WCAG contrast checking utilities implemented' : 'No contrast checking utilities found');

      const hasColorBlindnessSupport = /color.*blind|deuteranopia|protanopia/i.test(accessibilityContent);
      this.addTest('colorContrast', 'Color blindness support', hasColorBlindnessSupport,
        hasColorBlindnessSupport ? 'Color blindness support implemented' : 'Consider color blindness support');
    }

    // Check for CSS classes that might indicate good contrast practices
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
    if (fs.existsSync(tailwindConfigPath)) {
      const tailwindContent = fs.readFileSync(tailwindConfigPath, 'utf8');
      const hasContrastColors = /contrast|slate|gray|zinc/i.test(tailwindContent);

      this.addTest('colorContrast', 'Contrast-aware color palette', hasContrastColors,
        hasContrastColors ? 'Design system includes contrast-aware colors' : 'Review color palette for contrast');
    }

    // Check for text readability patterns
    const componentDir = path.join(process.cwd(), 'src', 'components');
    const componentFiles = this.getComponentFiles(componentDir);

    let readabilityPatterns = 0;
    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');

      // Look for text size and weight patterns that improve readability
      if (/text-(sm|base|lg|xl)|font-(medium|semibold|bold)/.test(content)) {
        readabilityPatterns++;
      }
    });

    this.addTest('colorContrast', 'Text readability patterns', readabilityPatterns > 5,
      `${readabilityPatterns} components with readability-focused styling`);
  }

  async analyzeTextAlternatives() {
    console.log('🖼️  Analyzing Text Alternatives...');

    const componentDir = path.join(process.cwd(), 'src', 'components');
    const componentFiles = this.getComponentFiles(componentDir);

    let altTextUsage = 0;
    let ariaLabelImages = 0;
    let decorativeImages = 0;
    let svgAccessibility = 0;

    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for alt text on images
      if (/alt=["'][^"']*["']/.test(content)) {
        altTextUsage++;
      }

      // Check for ARIA labels on images
      if (/<img[^>]*aria-label/.test(content)) {
        ariaLabelImages++;
      }

      // Check for decorative images (empty alt)
      if (/alt=["']["']/.test(content)) {
        decorativeImages++;
      }

      // Check for SVG accessibility
      if (/<svg[^>]*role=|<svg[^>]*aria-/.test(content)) {
        svgAccessibility++;
      }
    });

    this.addTest('textAlternatives', 'Image alt text usage', altTextUsage > 0,
      `${altTextUsage} components with image alt text`);

    this.addTest('textAlternatives', 'ARIA labels for images', ariaLabelImages > 0,
      `${ariaLabelImages} images with ARIA labels`);

    this.addTest('textAlternatives', 'Decorative images marked', decorativeImages > 0,
      `${decorativeImages} decorative images properly marked`);

    this.addTest('textAlternatives', 'SVG accessibility', svgAccessibility > 0,
      `${svgAccessibility} accessible SVG implementations`);

    // Check for icon accessibility patterns
    const hasIconAccessibility = componentFiles.some(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      return /(lucide|heroicons).*aria-hidden|sr-only.*icon/i.test(content);
    });

    this.addTest('textAlternatives', 'Icon accessibility patterns', hasIconAccessibility,
      hasIconAccessibility ? 'Icon accessibility patterns found' : 'Review icon accessibility implementation');
  }

  async analyzeMotionAccessibility() {
    console.log('🎬 Analyzing Motion and Animation Accessibility...');

    // Check for reduced motion support
    const accessibleComponentsPath = path.join(process.cwd(), 'src', 'components', 'accessibility', 'accessible-components.tsx');
    if (fs.existsSync(accessibleComponentsPath)) {
      const content = fs.readFileSync(accessibleComponentsPath, 'utf8');

      const hasReducedMotion = /prefers-reduced-motion|AccessibleMotion/i.test(content);
      this.addTest('motionAccessibility', 'Reduced motion support', hasReducedMotion,
        hasReducedMotion ? 'Reduced motion preferences respected' : 'No reduced motion support found');

      const hasMotionControls = /motion.*control|animation.*toggle/i.test(content);
      this.addTest('motionAccessibility', 'Motion controls', hasMotionControls,
        hasMotionControls ? 'Motion controls available' : 'Consider adding motion controls');
    }

    // Check for Framer Motion accessibility
    const componentDir = path.join(process.cwd(), 'src', 'components');
    const componentFiles = this.getComponentFiles(componentDir);

    let framerMotionUsage = 0;
    let accessibleAnimations = 0;

    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');

      if (/framer-motion|motion\./.test(content)) {
        framerMotionUsage++;

        // Check for accessibility-aware animation properties
        if (/reduceMotion|prefers-reduced-motion/.test(content)) {
          accessibleAnimations++;
        }
      }
    });

    this.addTest('motionAccessibility', 'Animation library usage', framerMotionUsage > 0,
      `${framerMotionUsage} components using Framer Motion`);

    this.addTest('motionAccessibility', 'Accessible animations', accessibleAnimations > 0,
      `${accessibleAnimations} animations with reduced motion consideration`);

    // Check for CSS animation accessibility
    const globalStylesPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
    if (fs.existsSync(globalStylesPath)) {
      const content = fs.readFileSync(globalStylesPath, 'utf8');
      const hasMotionQueries = /@media.*prefers-reduced-motion/.test(content);

      this.addTest('motionAccessibility', 'CSS motion queries', hasMotionQueries,
        hasMotionQueries ? 'CSS respects motion preferences' : 'Consider adding CSS motion queries');
    }
  }

  getComponentFiles(dir) {
    let files = [];

    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(this.getComponentFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        files.push(fullPath);
      }
    });

    return files;
  }

  addTest(category, name, passed, details) {
    this.results[category].tests.push({ name, passed, details });
    if (passed) {
      this.results[category].passed++;
    } else {
      this.results[category].failed++;
    }
  }

  generateComplianceReport() {
    console.log('\n' + '='.repeat(80));
    console.log('♿ WCAG 2.1 AA ACCESSIBILITY COMPLIANCE REPORT');
    console.log('='.repeat(80));

    let totalPassed = 0;
    let totalFailed = 0;

    const categoryNames = {
      semanticHtml: 'Semantic HTML Structure',
      ariaCompliance: 'ARIA Compliance',
      keyboardAccessibility: 'Keyboard Accessibility',
      colorContrast: 'Color and Contrast',
      textAlternatives: 'Text Alternatives',
      motionAccessibility: 'Motion and Animation'
    };

    Object.entries(this.results).forEach(([category, data]) => {
      const categoryName = categoryNames[category];
      console.log(`\n${categoryName}:`);
      console.log(`  ✅ Compliant: ${data.passed}`);
      console.log(`  ❌ Needs Attention: ${data.failed}`);
      console.log(`  📈 Compliance Rate: ${((data.passed / (data.passed + data.failed)) * 100).toFixed(1)}%`);

      totalPassed += data.passed;
      totalFailed += data.failed;

      data.tests.forEach(test => {
        const icon = test.passed ? '✅' : '⚠️';
        console.log(`    ${icon} ${test.name}: ${test.details}`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('OVERALL ACCESSIBILITY SUMMARY:');
    console.log(`✅ Total Compliant: ${totalPassed}`);
    console.log(`⚠️  Total Needs Attention: ${totalFailed}`);
    console.log(`📈 Overall Compliance Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    console.log(`📊 Components Analyzed: ${this.componentsAnalyzed}`);
    console.log('='.repeat(80));

    // WCAG compliance assessment
    const complianceRate = (totalPassed / (totalPassed + totalFailed)) * 100;
    if (complianceRate >= 95) {
      console.log('🏆 WCAG STATUS: EXCELLENT - Outstanding accessibility implementation!');
    } else if (complianceRate >= 85) {
      console.log('✅ WCAG STATUS: VERY GOOD - Strong accessibility compliance');
    } else if (complianceRate >= 75) {
      console.log('👍 WCAG STATUS: GOOD - Solid accessibility foundation');
    } else if (complianceRate >= 65) {
      console.log('⚠️  WCAG STATUS: NEEDS IMPROVEMENT - Several accessibility gaps');
    } else {
      console.log('❌ WCAG STATUS: REQUIRES ATTENTION - Major accessibility improvements needed');
    }

    console.log('\n📋 ACCESSIBILITY RECOMMENDATIONS:');

    if (this.results.semanticHtml.failed > 0) {
      console.log('• Enhance semantic HTML structure with proper landmarks and headings');
    }
    if (this.results.ariaCompliance.failed > 1) {
      console.log('• Implement comprehensive ARIA labels and descriptions');
    }
    if (this.results.keyboardAccessibility.failed > 1) {
      console.log('• Improve keyboard navigation and focus management');
    }
    if (this.results.colorContrast.failed > 0) {
      console.log('• Validate color contrast ratios meet WCAG AA standards (4.5:1)');
    }
    if (this.results.textAlternatives.failed > 1) {
      console.log('• Ensure all images have appropriate alternative text');
    }
    if (this.results.motionAccessibility.failed > 0) {
      console.log('• Implement motion preferences and animation controls');
    }

    console.log('• Conduct user testing with assistive technologies');
    console.log('• Regular accessibility audits with automated tools (axe, WAVE)');
    console.log('• Consider implementing live regions for dynamic content updates');
  }
}

// Run the accessibility compliance analysis
const analyzer = new AccessibilityComplianceAnalyzer();
analyzer.analyze().catch(console.error);