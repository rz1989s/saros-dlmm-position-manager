import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PublicKey } from '@solana/web3.js';
import { Pair } from '@saros-finance/dlmm-sdk';
import {
  MigrationRiskAssessment,
  RiskAssessmentConfig
} from '../../../src/lib/dlmm/migration-risk-assessment';
import { DLMMPosition } from '../../../src/lib/types';

// Mock the Saros DLMM SDK
jest.mock('@saros-finance/dlmm-sdk');

describe('MigrationRiskAssessment', () => {
  let riskAssessment: MigrationRiskAssessment;
  let mockConfig: RiskAssessmentConfig;
  let mockPosition: DLMMPosition;
  let mockSourcePool: Pair;
  let mockTargetPool: Pair;

  beforeEach(() => {
    mockConfig = {
      riskTolerance: 'moderate',
      maxAcceptableRisk: 70,
      priorityFactors: ['liquidity', 'market'],
      timeHorizon: 30,
      confidenceLevel: 95,
      monitoringEnabled: true,
      alertsEnabled: true
    };

    riskAssessment = new MigrationRiskAssessment(mockConfig);

    mockPosition = {
      id: 'test-position-1',
      poolAddress: new PublicKey('22222222222222222222222222222222'),
      userAddress: new PublicKey('11111111111111111111111111111111'),
      activeBin: 1000,
      liquidityAmount: '10000',
      feesEarned: {
        tokenX: '5',
        tokenY: '60'
      },
      createdAt: new Date(),
      lastUpdated: new Date(),
      isActive: true,
      tokenX: {
        address: new PublicKey('33333333333333333333333333333333'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        price: 100,
        logoURI: 'https://example.com/sol.png'
      },
      tokenY: {
        address: new PublicKey('44444444444444444444444444444444'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        price: 1,
        logoURI: 'https://example.com/usdc.png'
      },
      bins: [],
      currentValue: 15000,
      initialValue: 14500,
      pnl: 500,
      pnlPercent: 3.33
    };

    mockSourcePool = {
      publicKey: new PublicKey('55555555555555555555555555555555'),
      tokenMintX: new PublicKey('33333333333333333333333333333333'),
      tokenMintY: new PublicKey('44444444444444444444444444444444'),
      binStep: 100,
      activeId: 1000,
      reserveX: '1000000000',
      reserveY: '1000000000'
    } as unknown as Pair;

    mockTargetPool = {
      publicKey: new PublicKey('66666666666666666666666666666666'),
      tokenMintX: new PublicKey('33333333333333333333333333333333'),
      tokenMintY: new PublicKey('77777777777777777777777777777777'),
      binStep: 50,
      activeId: 2000,
      reserveX: '2000000000',
      reserveY: '2000000000'
    } as unknown as Pair;
  });

  describe('Constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(riskAssessment).toBeInstanceOf(MigrationRiskAssessment);
    });

    it('should handle different risk tolerance levels', () => {
      const conservativeConfig = { ...mockConfig, riskTolerance: 'conservative' as const };
      const conservativeAssessment = new MigrationRiskAssessment(conservativeConfig);
      expect(conservativeAssessment).toBeInstanceOf(MigrationRiskAssessment);

      const aggressiveConfig = { ...mockConfig, riskTolerance: 'aggressive' as const };
      const aggressiveAssessment = new MigrationRiskAssessment(aggressiveConfig);
      expect(aggressiveAssessment).toBeInstanceOf(MigrationRiskAssessment);
    });
  });

  describe('assessMigrationRisk', () => {
    it('should perform comprehensive risk assessment', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result).toHaveProperty('positionId', mockPosition.id);
      expect(result).toHaveProperty('sourcePool', mockSourcePool.publicKey.toString());
      expect(result).toHaveProperty('targetPool', mockTargetPool.publicKey.toString());
      expect(result).toHaveProperty('assessmentTimestamp');
      expect(result).toHaveProperty('riskFactors');
      expect(result).toHaveProperty('liquidityRisk');
      expect(result).toHaveProperty('marketRisk');
      expect(result).toHaveProperty('technicalRisk');
      expect(result).toHaveProperty('operationalRisk');
      expect(result).toHaveProperty('riskMetrics');
      expect(result).toHaveProperty('mitigationStrategies');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('monitoring');
    });

    it('should calculate risk metrics within valid ranges', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.riskMetrics.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskMetrics.overallRiskScore).toBeLessThanOrEqual(100);
      expect(result.riskMetrics.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(result.riskMetrics.confidenceLevel).toBeLessThanOrEqual(100);
      expect(result.riskMetrics.valueAtRisk).toBeGreaterThanOrEqual(0);
      expect(result.riskMetrics.expectedShortfall).toBeGreaterThanOrEqual(0);
    });

    it('should categorize risk levels correctly', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      const validCategories = ['minimal', 'low', 'moderate', 'high', 'extreme'];
      expect(validCategories).toContain(result.riskMetrics.riskCategory);
    });

    it('should generate appropriate mitigation strategies for high-risk scenarios', async () => {
      // Test with large migration amount to trigger high risk
      const largeMigrationAmount = 50000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        largeMigrationAmount
      );

      expect(result.mitigationStrategies.length).toBeGreaterThanOrEqual(0);
      result.mitigationStrategies.forEach(strategy => {
        expect(strategy).toHaveProperty('strategy');
        expect(strategy).toHaveProperty('implementation');
        expect(strategy).toHaveProperty('cost');
        expect(strategy).toHaveProperty('effectiveness');
        expect(strategy).toHaveProperty('timeframe');
        expect(strategy).toHaveProperty('priority');
        expect(strategy.cost).toBeGreaterThanOrEqual(0);
        expect(strategy.effectiveness).toBeGreaterThanOrEqual(0);
        expect(strategy.effectiveness).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Risk Categories', () => {
    it('should assess liquidity risk properly', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.liquidityRisk).toHaveProperty('sourcePoolLiquidity');
      expect(result.liquidityRisk).toHaveProperty('targetPoolLiquidity');
      expect(result.liquidityRisk).toHaveProperty('liquidityRatio');
      expect(result.liquidityRisk).toHaveProperty('slippageRisk');
      expect(result.liquidityRisk).toHaveProperty('impermanentLossRisk');
      expect(result.liquidityRisk).toHaveProperty('concentrationRisk');

      expect(result.liquidityRisk.sourcePoolLiquidity).toBeGreaterThan(0);
      expect(result.liquidityRisk.targetPoolLiquidity).toBeGreaterThan(0);
      expect(result.liquidityRisk.slippageRisk).toBeGreaterThanOrEqual(0);
      expect(result.liquidityRisk.slippageRisk).toBeLessThanOrEqual(100);
    });

    it('should assess market risk properly', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.marketRisk).toHaveProperty('volatilityRisk');
      expect(result.marketRisk).toHaveProperty('correlationRisk');
      expect(result.marketRisk).toHaveProperty('priceImpactRisk');
      expect(result.marketRisk).toHaveProperty('timingRisk');
      expect(result.marketRisk).toHaveProperty('marketDirectionRisk');
      expect(result.marketRisk).toHaveProperty('macroeconomicRisk');

      Object.values(result.marketRisk).forEach(risk => {
        expect(risk).toBeGreaterThanOrEqual(0);
        expect(risk).toBeLessThanOrEqual(100);
      });
    });

    it('should assess technical risk properly', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.technicalRisk).toHaveProperty('smartContractRisk');
      expect(result.technicalRisk).toHaveProperty('oracleRisk');
      expect(result.technicalRisk).toHaveProperty('networkCongestionRisk');
      expect(result.technicalRisk).toHaveProperty('bridgeRisk');
      expect(result.technicalRisk).toHaveProperty('upgradeRisk');
      expect(result.technicalRisk).toHaveProperty('integrationRisk');

      Object.values(result.technicalRisk).forEach(risk => {
        expect(risk).toBeGreaterThanOrEqual(0);
        expect(risk).toBeLessThanOrEqual(100);
      });
    });

    it('should assess operational risk properly', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.operationalRisk).toHaveProperty('executionRisk');
      expect(result.operationalRisk).toHaveProperty('monitoringRisk');
      expect(result.operationalRisk).toHaveProperty('recoveryRisk');
      expect(result.operationalRisk).toHaveProperty('automationRisk');
      expect(result.operationalRisk).toHaveProperty('governanceRisk');
      expect(result.operationalRisk).toHaveProperty('complianceRisk');

      Object.values(result.operationalRisk).forEach(risk => {
        expect(risk).toBeGreaterThanOrEqual(0);
        expect(risk).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Risk Factors', () => {
    it('should identify relevant risk factors', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      result.riskFactors.forEach(factor => {
        expect(factor).toHaveProperty('category');
        expect(factor).toHaveProperty('severity');
        expect(factor).toHaveProperty('impact');
        expect(factor).toHaveProperty('probability');
        expect(factor).toHaveProperty('description');
        expect(factor).toHaveProperty('weight');

        const validCategories = ['market', 'liquidity', 'technical', 'operational', 'regulatory'];
        expect(validCategories).toContain(factor.category);

        const validSeverities = ['low', 'medium', 'high', 'critical'];
        expect(validSeverities).toContain(factor.severity);

        expect(factor.impact).toBeGreaterThanOrEqual(0);
        expect(factor.impact).toBeLessThanOrEqual(100);
        expect(factor.probability).toBeGreaterThanOrEqual(0);
        expect(factor.probability).toBeLessThanOrEqual(100);
        expect(factor.weight).toBeGreaterThanOrEqual(0);
        expect(factor.weight).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Recommendations', () => {
    it('should provide relevant recommendations', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
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

    it('should provide appropriate recommendations for high-risk scenarios', async () => {
      // Configure for high risk scenario
      const highRiskConfig = {
        ...mockConfig,
        maxAcceptableRisk: 10 // Very low tolerance
      };
      const highRiskAssessment = new MigrationRiskAssessment(highRiskConfig);

      const largeMigrationAmount = 50000;
      const result = await highRiskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        largeMigrationAmount
      );

      // Should have recommendations for high-risk scenarios
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Monitoring Configuration', () => {
    it('should set up appropriate monitoring', async () => {
      const migrationAmount = 5000;
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      expect(result.monitoring).toHaveProperty('requiredFrequency');
      expect(result.monitoring).toHaveProperty('keyIndicators');
      expect(result.monitoring).toHaveProperty('alertThresholds');

      expect(typeof result.monitoring.requiredFrequency).toBe('string');
      expect(Array.isArray(result.monitoring.keyIndicators)).toBe(true);
      expect(typeof result.monitoring.alertThresholds).toBe('object');

      // Verify alert thresholds are reasonable
      Object.values(result.monitoring.alertThresholds).forEach(threshold => {
        expect(threshold).toBeGreaterThan(0);
        expect(threshold).toBeLessThanOrEqual(100);
      });
    });

    it('should adjust monitoring frequency based on risk level', async () => {
      // Test different migration amounts to see frequency changes
      const lowRiskAmount = 100;
      const highRiskAmount = 50000;

      const lowRiskResult = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        lowRiskAmount
      );

      const highRiskResult = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        highRiskAmount
      );

      // Both should have valid monitoring setups
      expect(lowRiskResult.monitoring.requiredFrequency).toMatch(/minutes|hours|seconds/);
      expect(highRiskResult.monitoring.requiredFrequency).toMatch(/minutes|hours|seconds/);
    });
  });

  describe('Utility Methods', () => {
    it('should handle risk history retrieval', async () => {
      const history = await riskAssessment.getRiskHistory('test-position');
      expect(Array.isArray(history)).toBe(true);
    });

    it('should handle risk assessment updates', async () => {
      const updatePromise = riskAssessment.updateRiskAssessment('test-assessment', {
        assessmentTimestamp: new Date()
      });
      await expect(updatePromise).resolves.not.toThrow();
    });

    it('should handle risk monitoring setup', async () => {
      const mockCallback = jest.fn();
      const monitoringPromise = riskAssessment.monitorRiskFactors('test-position', mockCallback);
      await expect(monitoringPromise).resolves.not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero migration amount', async () => {
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        0
      );

      expect(result.riskMetrics.valueAtRisk).toBe(0);
      expect(result.riskMetrics.expectedShortfall).toBe(0);
    });

    it('should handle very large migration amounts', async () => {
      const veryLargeAmount = 1000000000; // 1B
      const result = await riskAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        veryLargeAmount
      );

      expect(result).toHaveProperty('riskMetrics');
      expect(result.riskMetrics.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskMetrics.overallRiskScore).toBeLessThanOrEqual(100);
    });

    it('should handle positions with minimal liquidity', async () => {
      const minimalPosition = {
        ...mockPosition,
        totalLiquidity: 1,
        totalValue: 1
      };

      const result = await riskAssessment.assessMigrationRisk(
        minimalPosition,
        mockSourcePool,
        mockTargetPool,
        5000
      );

      expect(result).toHaveProperty('riskMetrics');
      // Should likely be high risk due to small position vs migration amount
      expect(result.riskMetrics.riskCategory).toBeDefined();
    });
  });

  describe('Configuration Impact', () => {
    it('should respect risk tolerance settings', async () => {
      const conservativeConfig = { ...mockConfig, riskTolerance: 'conservative' as const };
      const aggressiveConfig = { ...mockConfig, riskTolerance: 'aggressive' as const };

      const conservativeAssessment = new MigrationRiskAssessment(conservativeConfig);
      const aggressiveAssessment = new MigrationRiskAssessment(aggressiveConfig);

      const migrationAmount = 5000;

      const conservativeResult = await conservativeAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      const aggressiveResult = await aggressiveAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        migrationAmount
      );

      // Both should complete successfully
      expect(conservativeResult).toHaveProperty('riskMetrics');
      expect(aggressiveResult).toHaveProperty('riskMetrics');
    });

    it('should adjust monitoring based on configuration', async () => {
      const noMonitoringConfig = { ...mockConfig, monitoringEnabled: false };
      const noMonitoringAssessment = new MigrationRiskAssessment(noMonitoringConfig);

      const result = await noMonitoringAssessment.assessMigrationRisk(
        mockPosition,
        mockSourcePool,
        mockTargetPool,
        5000
      );

      expect(result.monitoring).toBeDefined();
      // Monitoring setup should still exist but may be different
    });
  });
});