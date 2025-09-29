import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PublicKey, Connection } from '@solana/web3.js';
import {
  MigrationImpactAnalyzer
} from '../../../src/lib/dlmm/migration-analysis';
import type { CrossPoolMigrationPlan } from '../../../src/lib/dlmm/cross-pool-migration';
import type { DLMMPosition, PoolInfo } from '../../../src/lib/types';

// Mock the Saros DLMM SDK
jest.mock('@saros-finance/dlmm-sdk');

// Mock the DLMM client
jest.mock('../../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getConnection: jest.fn(() => ({
      rpcEndpoint: 'http://localhost:8899',
      commitment: 'confirmed'
    }))
  }
}));

// Mock logger
jest.mock('../../../src/lib/logger', () => ({
  logger: {
    init: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('MigrationImpactAnalyzer', () => {
  let analyzer: MigrationImpactAnalyzer;
  let mockPosition: DLMMPosition;
  let mockSourcePool: PoolInfo;
  let mockTargetPool: PoolInfo;
  let mockMigrationPlan: CrossPoolMigrationPlan;
  let mockConnection: Connection;

  beforeEach(() => {
    mockConnection = new Connection('http://localhost:8899');
    analyzer = new MigrationImpactAnalyzer(mockConnection);

    mockPosition = {
      id: 'test-position-1',
      poolAddress: new PublicKey('22222222222222222222222222222222'),
      userAddress: new PublicKey('11111111111111111111111111111111'),
      tokenX: {
        address: new PublicKey('33333333333333333333333333333333'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        price: 100
      },
      tokenY: {
        address: new PublicKey('44444444444444444444444444444444'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        price: 1
      },
      activeBin: 8388608,
      liquidityAmount: '10000',
      feesEarned: {
        tokenX: '5',
        tokenY: '60'
      },
      createdAt: new Date(),
      lastUpdated: new Date(),
      isActive: true,
      currentValue: 15000,
      initialValue: 14500,
      pnl: 500,
      pnlPercent: 3.45
    };

    mockSourcePool = {
      address: new PublicKey('55555555555555555555555555555555'),
      tokenX: mockPosition.tokenX,
      tokenY: mockPosition.tokenY,
      activeBin: {
        binId: 8388608,
        price: 100,
        liquidityX: '500000',
        liquidityY: '500000',
        isActive: true,
        feeRate: 0.003,
        volume24h: '1000000'
      },
      totalLiquidity: '1000000',
      volume24h: '1000000',
      fees24h: '3000',
      apr: 15.5,
      createdAt: new Date()
    };

    mockTargetPool = {
      address: new PublicKey('66666666666666666666666666666666'),
      tokenX: mockPosition.tokenX,
      tokenY: mockPosition.tokenY,
      activeBin: {
        binId: 8388608,
        price: 100,
        liquidityX: '1000000',
        liquidityY: '1000000',
        isActive: true,
        feeRate: 0.002,
        volume24h: '2000000'
      },
      totalLiquidity: '2000000',
      volume24h: '2000000',
      fees24h: '4000',
      apr: 20.0,
      createdAt: new Date()
    };

    // Create a minimal migration plan
    mockMigrationPlan = {
      id: 'test-plan-123',
      positionId: mockPosition.id,
      route: {
        id: 'route-123',
        sourcePool: mockSourcePool.address,
        targetPool: mockTargetPool.address,
        sourcePair: mockSourcePool,
        targetPair: mockTargetPool,
        estimatedSlippage: 0.005,
        estimatedGasCost: 0.01,
        estimatedExecutionTime: 180,
        liquidityBridgeRequired: false,
        intermediateSwaps: [],
        confidence: 0.85
      },
      steps: [],
      totalGasCost: 0.01,
      totalExecutionTime: 180,
      rollbackPlan: {
        id: 'rollback-123',
        triggerConditions: [],
        rollbackSteps: [],
        recoveryInstructions: [],
        emergencyContacts: []
      },
      riskLevel: 'low',
      successProbability: 0.9
    };
  });

  describe('Constructor', () => {
    it('should initialize analyzer', () => {
      expect(analyzer).toBeInstanceOf(MigrationImpactAnalyzer);
    });
  });

  describe('analyzeMigrationImpact', () => {
    it('should perform comprehensive impact analysis', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockMigrationPlan,
        {
          volatility: 0.5,
          liquidity: 1000000,
          volume24h: 5000000,
          pricetrend: 'neutral' as const
        }
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('migrationId');
      expect(result).toHaveProperty('analysisDate');
      expect(result).toHaveProperty('financialImpact');
      expect(result).toHaveProperty('riskAssessment');
      expect(result).toHaveProperty('operationalImpact');
      expect(result).toHaveProperty('marketImpact');
      expect(result).toHaveProperty('timelineAnalysis');
      expect(result).toHaveProperty('scenarios');
      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('confidenceLevel');
    });

    it('should calculate financial impact metrics', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockMigrationPlan,
        { volatility: 0.5, liquidity: 1000000, volume24h: 5000000, pricetrend: 'neutral' as const }
      );

      expect(result.financialImpact).toHaveProperty('totalCost');
      expect(result.financialImpact).toHaveProperty('totalBenefit');
      expect(result.financialImpact).toHaveProperty('netImpact');
      expect(result.financialImpact).toHaveProperty('breakEvenTime');
      expect(result.financialImpact).toHaveProperty('roi');
      expect(result.financialImpact).toHaveProperty('npv');
      expect(result.financialImpact).toHaveProperty('irr');
      expect(result.financialImpact).toHaveProperty('paybackPeriod');

      expect(typeof result.financialImpact.netImpact).toBe('number');
      expect(typeof result.financialImpact.roi).toBe('number');
    });

    it('should assess risk properly', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockMigrationPlan,
        { volatility: 0.5, liquidity: 1000000, volume24h: 5000000, pricetrend: 'neutral' as const }
      );

      expect(result.riskAssessment).toHaveProperty('overallRisk');
      expect(result.riskAssessment).toHaveProperty('riskScore');
      expect(result.riskAssessment).toHaveProperty('riskFactors');
      expect(result.riskAssessment).toHaveProperty('mitigationStrategies');

      expect(result.riskAssessment.overallRisk).toMatch(/low|medium|high|extreme/);
      expect(typeof result.riskAssessment.riskScore).toBe('number');
    });

    it('should evaluate operational impact', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockMigrationPlan,
        { volatility: 0.5, liquidity: 1000000, volume24h: 5000000, pricetrend: 'neutral' as const }
      );

      expect(result.operationalImpact).toBeDefined();
      expect(typeof result.operationalImpact).toBe('object');
    });

    it('should perform scenario analysis', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockMigrationPlan,
        { volatility: 0.5, liquidity: 1000000, volume24h: 5000000, pricetrend: 'neutral' as const }
      );

      expect(Array.isArray(result.scenarios)).toBe(true);
      expect(result.scenarios.length).toBeGreaterThanOrEqual(0);
    });

    it('should calculate NPV and IRR', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockMigrationPlan,
        { volatility: 0.5, liquidity: 1000000, volume24h: 5000000, pricetrend: 'neutral' as const }
      );

      expect(result.financialImpact).toHaveProperty('npv');
      expect(result.financialImpact).toHaveProperty('irr');
      expect(result.financialImpact).toHaveProperty('paybackPeriod');

      expect(typeof result.financialImpact.npv).toBe('number');
      expect(typeof result.financialImpact.irr).toBe('number');
      expect(typeof result.financialImpact.paybackPeriod).toBe('number');
    });
  });

  describe('Confidence Calculation', () => {
    it('should calculate confidence scores within valid range', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockMigrationPlan,
        { volatility: 0.5, liquidity: 1000000, volume24h: 5000000, pricetrend: 'neutral' as const }
      );

      expect(result.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(result.confidenceLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('Recommendations', () => {
    it('should provide actionable recommendations', async () => {
      const result = await analyzer.analyzeMigrationImpact(
        mockPosition,
        mockMigrationPlan,
        { volatility: 0.5, liquidity: 1000000, volume24h: 5000000, pricetrend: 'neutral' as const }
      );

      expect(result.recommendation).toBeDefined();
      expect(typeof result.recommendation).toBe('object');
    });
  });

  describe('Edge Cases', () => {
    it('should handle positions with minimal value', async () => {
      const minimalPosition = {
        ...mockPosition,
        currentValue: 1,
        liquidityAmount: '1'
      };

      const result = await analyzer.analyzeMigrationImpact(
        minimalPosition,
        mockMigrationPlan,
        { volatility: 0.5, liquidity: 1000000, volume24h: 5000000, pricetrend: 'neutral' as const }
      );

      expect(result).toBeDefined();
      expect(result.financialImpact).toBeDefined();
    });
  });
});