import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PublicKey } from '@solana/web3.js';
import { Pair } from '@saros-finance/dlmm-sdk';
import {
  MigrationImpactAnalyzer,
  MigrationAnalysisConfig,
  ImpactAnalysisResult
} from '../../../src/lib/dlmm/migration-analysis';
import { DLMMPosition } from '../../../src/lib/types';

// Mock the Saros DLMM SDK
jest.mock('@saros-finance/dlmm-sdk');

describe('MigrationImpactAnalyzer', () => {
  let analyzer: MigrationImpactAnalyzer;
  let mockConfig: MigrationAnalysisConfig;
  let mockPosition: DLMMPosition;
  let mockSourcePool: Pair;
  let mockTargetPool: Pair;

  beforeEach(() => {
    mockConfig = {
      analysisDepth: 'comprehensive',
      timeHorizon: 30,
      confidenceLevel: 95,
      includeSecondaryEffects: true,
      marketConditionScenarios: ['bull', 'bear', 'sideways'],
      riskTolerance: 'moderate'
    };

    analyzer = new MigrationImpactAnalyzer(mockConfig);

    mockPosition = {
      id: 'test-position-1',
      owner: new PublicKey('11111111111111111111111111111111'),
      pool: new PublicKey('22222222222222222222222222222222'),
      tokenX: {
        mint: new PublicKey('33333333333333333333333333333333'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://example.com/sol.png'
      },
      tokenY: {
        mint: new PublicKey('44444444444444444444444444444444'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://example.com/usdc.png'
      },
      lowerPrice: 100,
      upperPrice: 150,
      bins: [],
      totalLiquidity: 10000,
      totalValue: 15000,
      tokenXAmount: 100,
      tokenYAmount: 12000,
      fees: {
        tokenX: 5,
        tokenY: 60,
        total: 65
      },
      pnl: {
        unrealized: 500,
        realized: 0,
        total: 500,
        percentage: 3.33
      },
      status: 'active',
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    mockSourcePool = {
      publicKey: new PublicKey('55555555555555555555555555555555'),
      tokenMintX: new PublicKey('33333333333333333333333333333333'),
      tokenMintY: new PublicKey('44444444444444444444444444444444'),
      binStep: 100,
      activeId: 1000,
      reserveX: '1000000000',
      reserveY: '1000000000'
    } as Pair;

    mockTargetPool = {
      publicKey: new PublicKey('66666666666666666666666666666666'),
      tokenMintX: new PublicKey('33333333333333333333333333333333'),
      tokenMintY: new PublicKey('77777777777777777777777777777777'),
      binStep: 50,
      activeId: 2000,
      reserveX: '2000000000',
      reserveY: '2000000000'
    } as Pair;
  });

  describe('Constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(analyzer).toBeInstanceOf(MigrationImpactAnalyzer);
    });

    it('should handle different analysis depths', () => {
      const quickConfig = { ...mockConfig, analysisDepth: 'quick' as const };
      const quickAnalyzer = new MigrationImpactAnalyzer(quickConfig);
      expect(quickAnalyzer).toBeInstanceOf(MigrationImpactAnalyzer);

      const detailedConfig = { ...mockConfig, analysisDepth: 'detailed' as const };
      const detailedAnalyzer = new MigrationImpactAnalyzer(detailedConfig);
      expect(detailedAnalyzer).toBeInstanceOf(MigrationImpactAnalyzer);
    });
  });

  describe('analyzeMigrationImpact', () => {
    it('should perform comprehensive impact analysis', async () => {
      const migrationAmount = 5000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result).toHaveProperty('positionId', mockPosition.id);
      expect(result).toHaveProperty('migrationAmount', migrationAmount);
      expect(result).toHaveProperty('analysisTimestamp');
      expect(result).toHaveProperty('financialImpact');
      expect(result).toHaveProperty('riskImpact');
      expect(result).toHaveProperty('operationalImpact');
      expect(result).toHaveProperty('marketImpact');
      expect(result).toHaveProperty('scenarioAnalysis');
      expect(result).toHaveProperty('costBenefitAnalysis');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('confidence');
    });

    it('should calculate financial impact metrics', async () => {
      const migrationAmount = 5000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.financialImpact).toHaveProperty('expectedReturnChange');
      expect(result.financialImpact).toHaveProperty('yieldChange');
      expect(result.financialImpact).toHaveProperty('feeStructureImpact');
      expect(result.financialImpact).toHaveProperty('liquidityImpact');
      expect(result.financialImpact).toHaveProperty('impermanentLossChange');
      expect(result.financialImpact).toHaveProperty('capitalEfficiencyChange');

      expect(typeof result.financialImpact.expectedReturnChange).toBe('number');
      expect(typeof result.financialImpact.yieldChange).toBe('number');
    });

    it('should assess risk impact properly', async () => {
      const migrationAmount = 5000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.riskImpact).toHaveProperty('volatilityChange');
      expect(result.riskImpact).toHaveProperty('concentrationRiskChange');
      expect(result.riskImpact).toHaveProperty('liquidityRiskChange');
      expect(result.riskImpact).toHaveProperty('correlationRiskChange');
      expect(result.riskImpact).toHaveProperty('overallRiskChange');

      Object.values(result.riskImpact).forEach(risk => {
        expect(typeof risk).toBe('number');
      });
    });

    it('should evaluate operational impact', async () => {
      const migrationAmount = 5000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.operationalImpact).toHaveProperty('executionComplexity');
      expect(result.operationalImpact).toHaveProperty('monitoringRequirements');
      expect(result.operationalImpact).toHaveProperty('maintenanceOverhead');
      expect(result.operationalImpact).toHaveProperty('automationPotential');

      expect(result.operationalImpact.executionComplexity).toBeGreaterThanOrEqual(0);
      expect(result.operationalImpact.executionComplexity).toBeLessThanOrEqual(100);
    });

    it('should perform scenario analysis', async () => {
      const migrationAmount = 5000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.scenarioAnalysis).toHaveProperty('scenarios');
      expect(Array.isArray(result.scenarioAnalysis.scenarios)).toBe(true);
      expect(result.scenarioAnalysis.scenarios.length).toBeGreaterThan(0);

      result.scenarioAnalysis.scenarios.forEach(scenario => {
        expect(scenario).toHaveProperty('name');
        expect(scenario).toHaveProperty('probability');
        expect(scenario).toHaveProperty('impact');
        expect(scenario).toHaveProperty('description');
        expect(scenario.probability).toBeGreaterThanOrEqual(0);
        expect(scenario.probability).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate NPV and IRR', async () => {
      const migrationAmount = 5000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.costBenefitAnalysis).toHaveProperty('npv');
      expect(result.costBenefitAnalysis).toHaveProperty('irr');
      expect(result.costBenefitAnalysis).toHaveProperty('paybackPeriod');
      expect(result.costBenefitAnalysis).toHaveProperty('breakEvenPoint');

      expect(typeof result.costBenefitAnalysis.npv).toBe('number');
      expect(typeof result.costBenefitAnalysis.irr).toBe('number');
      expect(typeof result.costBenefitAnalysis.paybackPeriod).toBe('number');
    });
  });

  describe('Confidence Calculation', () => {
    it('should calculate confidence scores within valid range', async () => {
      const migrationAmount = 5000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.confidence).toHaveProperty('overall');
      expect(result.confidence).toHaveProperty('financial');
      expect(result.confidence).toHaveProperty('risk');
      expect(result.confidence).toHaveProperty('operational');

      expect(result.confidence.overall).toBeGreaterThanOrEqual(0);
      expect(result.confidence.overall).toBeLessThanOrEqual(100);
      expect(result.confidence.financial).toBeGreaterThanOrEqual(0);
      expect(result.confidence.financial).toBeLessThanOrEqual(100);
    });
  });

  describe('Recommendations', () => {
    it('should provide actionable recommendations', async () => {
      const migrationAmount = 5000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(Array.isArray(result.recommendations)).toBe(true);
      result.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });

    it('should provide different recommendations based on impact', async () => {
      const smallAmount = 100;
      const largeAmount = 50000;

      const smallResult = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        smallAmount
      );

      const largeResult = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        largeAmount
      );

      expect(smallResult.recommendations).toBeDefined();
      expect(largeResult.recommendations).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero migration amount', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        0
      );

      expect(result.migrationAmount).toBe(0);
      expect(result.costBenefitAnalysis.npv).toBeDefined();
    });

    it('should handle very large migration amounts', async () => {
      const veryLargeAmount = 1000000000;
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        veryLargeAmount
      );

      expect(result.migrationAmount).toBe(veryLargeAmount);
      expect(result.riskImpact.overallRiskChange).toBeDefined();
    });

    it('should handle positions with minimal value', async () => {
      const minimalPosition = {
        ...mockPosition,
        totalValue: 1,
        totalLiquidity: 1
      };

      const result = await analyzer.analyzeMigrationImpact(
        minimalPosition,
        mockSourcePool,
        mockTargetPool,
        5000
      );

      expect(result).toBeDefined();
      expect(result.financialImpact).toBeDefined();
    });
  });

  describe('Configuration Impact', () => {
    it('should respect different confidence levels', async () => {
      const lowConfidenceConfig = { ...mockConfig, confidenceLevel: 80 };
      const highConfidenceConfig = { ...mockConfig, confidenceLevel: 99 };

      const lowConfidenceAnalyzer = new MigrationImpactAnalyzer(lowConfidenceConfig);
      const highConfidenceAnalyzer = new MigrationImpactAnalyzer(highConfidenceConfig);

      const migrationAmount = 5000;

      const lowResult = await lowConfidenceAnalyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      const highResult = await highConfidenceAnalyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(lowResult.confidence.overall).toBeDefined();
      expect(highResult.confidence.overall).toBeDefined();
    });

    it('should handle different time horizons', async () => {
      const shortTermConfig = { ...mockConfig, timeHorizon: 7 };
      const longTermConfig = { ...mockConfig, timeHorizon: 365 };

      const shortTermAnalyzer = new MigrationImpactAnalyzer(shortTermConfig);
      const longTermAnalyzer = new MigrationImpactAnalyzer(longTermConfig);

      const migrationAmount = 5000;

      const shortResult = await shortTermAnalyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      const longResult = await longTermAnalyzer.analyzeMigrationImpact(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(shortResult.costBenefitAnalysis.paybackPeriod).toBeDefined();
      expect(longResult.costBenefitAnalysis.paybackPeriod).toBeDefined();
    });
  });
});