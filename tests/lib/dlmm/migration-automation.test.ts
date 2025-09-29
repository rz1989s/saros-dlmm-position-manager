import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PublicKey, Connection } from '@solana/web3.js';
import {
  MigrationAutomationSystem,
  AutomationConfig
} from '../../../src/lib/dlmm/migration-automation';
import { DLMMPosition } from '../../../src/lib/types';

// Mock the Saros DLMM SDK
jest.mock('@saros-finance/dlmm-sdk');

describe('MigrationAutomationSystem', () => {
  let automationSystem: MigrationAutomationSystem;
  let mockConfig: AutomationConfig;
  let mockPosition: DLMMPosition;

  beforeEach(() => {
    // Create a proper AutomationConfig matching the actual interface
    mockConfig = {
      id: 'test-config-1',
      name: 'Test Automation Config',
      enabled: true,
      triggerConditions: [
        {
          id: 'trigger-1',
          type: 'performance_threshold',
          operator: 'greater_than',
          value: 5,
          description: 'Yield differential > 5%',
          priority: 'high'
        }
      ],
      executionStrategy: {
        mode: 'balanced',
        batchSize: 50,
        maxSlippage: 0.02,
        maxGasCost: 0.01,
        timeoutSettings: {
          stepTimeout: 60,
          totalTimeout: 600,
          retryAttempts: 3
        },
        adaptiveSettings: {
          enableAdaptiveSlippage: true,
          enableAdaptiveGas: true,
          enableAdaptiveTiming: true
        },
        safetyMechanisms: []
      },
      riskLimits: {
        maxLossPercentage: 0.1,
        maxDailyMigrations: 10,
        maxPositionSizePercentage: 0.5,
        minLiquidityThreshold: 1000,
        maxVolatilityThreshold: 0.3,
        blacklistTokens: [],
        whitelistPools: []
      },
      monitoringSettings: {
        realTimeMonitoring: true,
        alertThresholds: {
          performanceDeviation: 10,
          riskScoreIncrease: 20,
          costOverrun: 0.2,
          timeDelay: 300
        },
        reportingInterval: 60,
        dataRetentionDays: 30,
        enablePredictiveAnalysis: false
      },
      recoverySettings: {
        enableAutoRecovery: false,
        maxRecoveryAttempts: 3,
        recoveryDelayMinutes: 5,
        fallbackStrategies: [],
        emergencyStopConditions: []
      },
      notificationSettings: {
        enableNotifications: true,
        channels: ['webhook', 'email'],
        triggers: ['start', 'complete', 'error'],
        endpoints: {
          webhook: 'https://example.com/webhook',
          email: 'test@example.com'
        }
      }
    };

    // Constructor expects Connection, not config
    const mockConnection = new Connection('http://localhost:8899');
    automationSystem = new MigrationAutomationSystem(mockConnection);

    mockPosition = {
      id: 'test-position-1',
      poolAddress: new PublicKey('22222222222222222222222222222222'),
      userAddress: new PublicKey('11111111111111111111111111111111'),
      tokenX: {
        address: new PublicKey('33333333333333333333333333333333'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://example.com/sol.png',
        price: 100
      },
      tokenY: {
        address: new PublicKey('44444444444444444444444444444444'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://example.com/usdc.png',
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
      // Optional calculated properties
      pnl: 500
    };
  });

  describe('Constructor', () => {
    it('should initialize with Connection', () => {
      const mockConnection = new Connection('http://localhost:8899');
      const system = new MigrationAutomationSystem(mockConnection);
      expect(system).toBeInstanceOf(MigrationAutomationSystem);
    });
  });

  describe('createAutomationConfig', () => {
    it('should create automation configuration successfully', async () => {
      const configId = await automationSystem.createAutomationConfig(mockConfig);

      expect(typeof configId).toBe('string');
      expect(configId).toBe(mockConfig.id);
    });

    it('should validate configuration before creating', async () => {
      const invalidConfig = { ...mockConfig, id: '', name: '' };

      await expect(
        automationSystem.createAutomationConfig(invalidConfig)
      ).rejects.toThrow('Configuration must have id and name');
    });
  });

  describe('getAutomationConfig', () => {
    it('should retrieve created configuration', async () => {
      await automationSystem.createAutomationConfig(mockConfig);
      const retrieved = automationSystem.getAutomationConfig(mockConfig.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(mockConfig.id);
      expect(retrieved?.name).toBe(mockConfig.name);
    });

    it('should return undefined for non-existent configuration', () => {
      const retrieved = automationSystem.getAutomationConfig('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('checkTriggerConditions', () => {
    it('should check trigger conditions for position', async () => {
      await automationSystem.createAutomationConfig(mockConfig);
      const currentMetrics = { currentAPY: 15 };

      const triggered = await automationSystem.checkTriggerConditions(
        mockConfig.id,
        mockPosition,
        currentMetrics
      );

      expect(typeof triggered).toBe('boolean');
    });
  });

  describe('updateAutomationConfig', () => {
    it('should update configuration successfully', async () => {
      await automationSystem.createAutomationConfig(mockConfig);

      const updated = automationSystem.updateAutomationConfig(mockConfig.id, {
        enabled: false
      });

      expect(updated).toBe(true);

      const retrieved = automationSystem.getAutomationConfig(mockConfig.id);
      expect(retrieved?.enabled).toBe(false);
    });

    it('should return false for non-existent configuration', () => {
      const updated = automationSystem.updateAutomationConfig('non-existent', {
        enabled: false
      });

      expect(updated).toBe(false);
    });
  });

  describe('deleteAutomationConfig', () => {
    it('should delete configuration successfully', async () => {
      await automationSystem.createAutomationConfig(mockConfig);

      const deleted = automationSystem.deleteAutomationConfig(mockConfig.id);
      expect(deleted).toBe(true);

      const retrieved = automationSystem.getAutomationConfig(mockConfig.id);
      expect(retrieved).toBeUndefined();
    });

    it('should return false for non-existent configuration', () => {
      const deleted = automationSystem.deleteAutomationConfig('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('listAutomationConfigs', () => {
    it('should list all configurations', async () => {
      await automationSystem.createAutomationConfig(mockConfig);

      const configs = automationSystem.listAutomationConfigs();

      expect(Array.isArray(configs)).toBe(true);
      expect(configs.length).toBeGreaterThanOrEqual(1);
      expect(configs.find(c => c.id === mockConfig.id)).toBeDefined();
    });
  });

  describe('listActiveExecutions', () => {
    it('should list active executions', () => {
      const executions = automationSystem.listActiveExecutions();

      expect(Array.isArray(executions)).toBe(true);
    });
  });

  describe('getCurrentMarketConditions', () => {
    it('should return current market conditions', () => {
      const conditions = automationSystem.getCurrentMarketConditions();

      // May be null initially
      expect(conditions === null || typeof conditions === 'object').toBe(true);
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring system', () => {
      // Should not throw
      expect(() => automationSystem.stopMonitoring()).not.toThrow();
    });
  });
});