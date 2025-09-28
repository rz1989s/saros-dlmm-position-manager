import { PublicKey, Connection } from '@solana/web3.js'
import { PortfolioReportingEngine, ReportFormat, ReportTemplateType } from '../../../src/lib/dlmm/portfolio-reporting'
import { DLMMClient } from '../../../src/lib/dlmm/client'
import type { EnhancedDLMMPosition } from '../../../src/lib/types'

// Mock the DLMM client
jest.mock('../../../src/lib/dlmm/client', () => ({
  DLMMClient: jest.fn(),
  dlmmClient: {
    getLbPair: jest.fn(),
    getConnection: jest.fn(() => new Connection('http://localhost:8899'))
  }
}))

// Mock the other portfolio engines
jest.mock('../../../src/lib/dlmm/multi-position-analysis', () => ({
  MultiPositionAnalysisEngine: jest.fn().mockImplementation(() => ({
    analyzeMultiplePositions: jest.fn(() => Promise.resolve({
      summary: {
        totalPositions: 3,
        totalValue: 35000,
        totalPnL: 6000,
        averageReturn: 17.14,
        bestPerformingPosition: 'Position2222222222222222222222222222222222',
        worstPerformingPosition: 'Position3333333333333333333333333333333333'
      },
      correlationAnalysis: {
        averageCorrelation: 0.45,
        pairCorrelations: {},
        correlationMatrix: [[1, 0.4, 0.5], [0.4, 1, 0.6], [0.5, 0.6, 1]]
      },
      riskMetrics: {
        portfolioVaR: 0.12,
        portfolioVolatility: 0.18,
        sharpeRatio: 0.95,
        maxDrawdown: 0.08,
        riskContributions: []
      }
    }))
  }))
}))

jest.mock('../../../src/lib/dlmm/portfolio-optimizer', () => ({
  PortfolioOptimizationEngine: jest.fn().mockImplementation(() => ({
    optimizePortfolio: jest.fn(() => Promise.resolve({
      currentMetrics: {
        totalValue: 35000,
        weightedReturn: 17.14,
        portfolioRisk: 0.12,
        sharpeRatio: 0.95,
        efficiency: 0.85
      },
      recommendations: [
        {
          id: 'rec1',
          type: 'rebalance',
          priority: 'medium',
          action: 'Rebalance portfolio allocation',
          description: 'Adjust position weights for optimal risk-return',
          rationale: 'Current allocation is suboptimal'
        }
      ]
    }))
  }))
}))

jest.mock('../../../src/lib/dlmm/diversification', () => ({
  DiversificationAnalysisEngine: jest.fn().mockImplementation(() => ({
    analyzeDiversification: jest.fn(() => Promise.resolve({
      overallScore: 7.5,
      tokenDiversification: { uniqueTokens: 4 },
      pairDiversification: { uniquePairs: 3 },
      concentrationMetrics: {
        herfindahlIndex: 0.35,
        top5Concentration: 85,
        top10Concentration: 100,
        concentrationRisk: 35
      }
    }))
  }))
}))

jest.mock('../../../src/lib/dlmm/consolidation', () => ({
  PositionConsolidationEngine: jest.fn().mockImplementation(() => ({
    analyzeConsolidationOpportunities: jest.fn(() => Promise.resolve({
      opportunities: [
        {
          id: 'cons1',
          type: 'similar_pairs',
          positions: ['Position1111111111111111111111111111111111', 'Position2222222222222222222222222222222222'],
          description: 'Consolidate USDC/USDT positions',
          analysis: {
            summary: {
              netPresentValue: 2500,
              paybackPeriod: 6
            }
          }
        }
      ]
    }))
  }))
}))

// Mock oracle price feeds
jest.mock('../../../src/lib/oracle/price-feeds', () => ({
  oraclePriceFeeds: {
    getMultipleTokenPrices: jest.fn(() => Promise.resolve({
      'USDC': { price: 1.0, timestamp: Date.now() },
      'USDT': { price: 1.0, timestamp: Date.now() },
      'SOL': { price: 100.0, timestamp: Date.now() },
      'ETH': { price: 2000.0, timestamp: Date.now() }
    }))
  }
}))

describe('PortfolioReportingEngine', () => {
  let reportingEngine: PortfolioReportingEngine
  let mockClient: jest.Mocked<DLMMClient>
  let mockPositions: EnhancedDLMMPosition[]

  beforeEach(() => {
    jest.clearAllMocks()

    mockClient = {
      getLbPair: jest.fn(),
      getConnection: jest.fn(() => new Connection('http://localhost:8899')),
      getUserPositions: jest.fn(() => Promise.resolve([])),
      getBinData: jest.fn(),
      getPoolInfo: jest.fn()
    } as any

    reportingEngine = new PortfolioReportingEngine(mockClient)

    mockPositions = [
      {
        publicKey: new PublicKey('Position1111111111111111111111111111111111'),
        pair: new PublicKey('Pool1111111111111111111111111111111111111111'),
        tokenX: {
          address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0
        },
        tokenY: {
          address: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          price: 1.0
        },
        currentValue: 15000,
        initialValue: 14000,
        pnl: 1000,
        pnlPercent: 7.14,
        realizedPnl: 300,
        unrealizedPnl: 700,
        feeEarnings: 500,
        impermanentLoss: -200,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        bins: []
      },
      {
        publicKey: new PublicKey('Position2222222222222222222222222222222222'),
        pair: new PublicKey('Pool2222222222222222222222222222222222222222'),
        tokenX: {
          address: new PublicKey('So11111111111111111111111111111111111111112'),
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
          price: 100.0
        },
        tokenY: {
          address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0
        },
        currentValue: 20000,
        initialValue: 15000,
        pnl: 5000,
        pnlPercent: 33.33,
        realizedPnl: 1000,
        unrealizedPnl: 4000,
        feeEarnings: 1200,
        impermanentLoss: -400,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        bins: []
      }
    ]

    // Mock the client to return our test positions
    mockClient.getUserPositions.mockResolvedValue(mockPositions as any)
  })

  describe('generateReport', () => {
    it('should generate comprehensive executive summary report', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON, ReportFormat.PDF],
        metadata: { requestedBy: 'test-user' }
      }

      const result = await reportingEngine.generateReport(request)

      expect(result).toMatchObject({
        reportId: expect.any(String),
        status: 'success',
        outputs: expect.arrayContaining([
          expect.objectContaining({
            format: ReportFormat.JSON,
            content: expect.any(String),
            size: expect.any(Number),
            metadata: expect.objectContaining({
              sections: expect.any(Number),
              charts: expect.any(Number),
              tables: expect.any(Number),
              generatedAt: expect.any(Date)
            })
          }),
          expect.objectContaining({
            format: ReportFormat.PDF,
            content: expect.any(Buffer),
            size: expect.any(Number)
          })
        ]),
        metrics: expect.objectContaining({
          totalTime: expect.any(Number),
          memoryUsage: expect.any(Number),
          cacheHitRate: expect.any(Number)
        })
      })

      expect(result.status).toBe('success')
      expect(result.outputs).toHaveLength(2)
    })

    it('should generate detailed analysis report', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.DETAILED_ANALYSIS,
        format: [ReportFormat.HTML, ReportFormat.CSV],
        customization: {
          customMetrics: [
            {
              id: 'custom1',
              name: 'Custom ROI',
              description: 'Custom return on investment calculation',
              formula: '(current_value - initial_value) / initial_value * 100',
              unit: '%',
              formatting: { decimals: 2, suffix: '%' }
            } as any
          ]
        }
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')
      expect(result.outputs).toHaveLength(2)

      // Verify HTML output
      const htmlOutput = result.outputs.find(output => output.format === ReportFormat.HTML)
      expect(htmlOutput).toBeDefined()
      expect(htmlOutput!.content).toContain('<html')
      expect(htmlOutput!.content).toContain('Portfolio Report')

      // Verify CSV output
      const csvOutput = result.outputs.find(output => output.format === ReportFormat.CSV)
      expect(csvOutput).toBeDefined()
      expect(csvOutput!.content).toContain('Metric,Value,Unit')
    })

    it('should generate risk assessment report', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.RISK_ASSESSMENT,
        format: [ReportFormat.JSON],
        configuration: {
          sections: [
            {
              id: 'risk_metrics',
              name: 'Risk Metrics',
              type: 'RISK_ANALYSIS' as any,
              enabled: true,
              order: 1,
              configuration: {
                includeCharts: true,
                includeTables: true,
                includeMetrics: true,
                timeframeConfig: { primary: '30d' },
                detailLevel: 'comprehensive' as any
              }
            }
          ]
        }
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')

      const jsonOutput = result.outputs[0]
      const report = JSON.parse(jsonOutput.content)

      expect(report).toMatchObject({
        metadata: expect.objectContaining({
          reportId: expect.any(String),
          generatedAt: expect.any(String),
          walletAddress: request.walletAddress
        }),
        executiveSummary: expect.objectContaining({
          totalValue: expect.any(Number),
          riskScore: expect.any(Number),
          diversificationScore: expect.any(Number)
        }),
        riskAnalysis: expect.objectContaining({
          summary: expect.objectContaining({
            overallScore: expect.any(Number),
            level: expect.any(String)
          })
        })
      })
    })

    it('should handle performance attribution report', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.PERFORMANCE_ATTRIBUTION,
        format: [ReportFormat.XLSX],
        branding: {
          companyName: 'Test Investment Fund',
          colors: { primary: '#1f2937', accent: '#3b82f6' },
          disclaimer: 'Past performance does not guarantee future results'
        }
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')
      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].format).toBe(ReportFormat.XLSX)
    })

    it('should handle compliance report generation', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.COMPLIANCE_REPORT,
        format: [ReportFormat.XML],
        recipients: [
          {
            id: 'recipient1',
            name: 'Compliance Officer',
            email: 'compliance@test.com',
            role: 'AUDITOR' as any,
            permissions: {
              canViewSensitiveData: true,
              canExportData: true,
              canModifyReports: false,
              allowedSections: ['all'],
              dataAccessLevel: 'full' as any
            },
            preferences: {
              preferredFormat: ReportFormat.XML,
              includeCharts: false,
              includeRawData: true,
              compressionLevel: 'standard' as any,
              encryptionRequired: true
            }
          }
        ]
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')
      expect(result.outputs[0].content).toContain('<?xml version="1.0"')
      expect(result.outputs[0].content).toContain('<PortfolioReport>')
    })

    it('should handle multiple format exports', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.INVESTOR_REPORT,
        format: [ReportFormat.JSON, ReportFormat.CSV, ReportFormat.HTML, ReportFormat.PDF, ReportFormat.XML]
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')
      expect(result.outputs).toHaveLength(5)

      const formats = result.outputs.map(output => output.format)
      expect(formats).toContain(ReportFormat.JSON)
      expect(formats).toContain(ReportFormat.CSV)
      expect(formats).toContain(ReportFormat.HTML)
      expect(formats).toContain(ReportFormat.PDF)
      expect(formats).toContain(ReportFormat.XML)
    })

    it('should handle empty positions gracefully', async () => {
      mockClient.getUserPositions.mockResolvedValue([] as any)

      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')

      const jsonOutput = result.outputs[0]
      const report = JSON.parse(jsonOutput.content)

      expect(report.executiveSummary.totalPositions).toBe(0)
      expect(report.executiveSummary.totalValue).toBe(0)
    })

    it('should handle report generation errors', async () => {
      mockClient.getUserPositions.mockRejectedValue(new Error('Network error'))

      const request = {
        walletAddress: 'invalid-wallet-address',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('failed')
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
      expect(result.errors![0].severity).toBe('critical')
    })
  })

  describe('scheduleReport', () => {
    it('should schedule recurring reports', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON],
        schedule: {
          frequency: 'WEEKLY' as any,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-12-31'),
          timezone: 'UTC',
          parameters: {
            time: '09:00',
            dayOfWeek: 1, // Monday
            retryPolicy: {
              maxRetries: 3,
              retryDelay: 5000,
              exponentialBackoff: true,
              failureNotification: true
            }
          },
          notifications: [
            {
              type: 'email' as const,
              trigger: 'success' as const,
              recipients: ['user@test.com'],
              template: 'weekly_report_template'
            }
          ]
        }
      }

      const scheduleId = await reportingEngine.scheduleReport(request, request.schedule!)

      expect(scheduleId).toMatch(/^schedule_\d+_[a-z0-9]+$/)
    })

    it('should handle monthly scheduled reports', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.DETAILED_ANALYSIS,
        format: [ReportFormat.PDF],
        schedule: {
          frequency: 'MONTHLY' as any,
          startDate: new Date('2024-03-01'),
          timezone: 'America/New_York',
          parameters: {
            time: '08:00',
            dayOfMonth: 1, // First day of month
            retryPolicy: {
              maxRetries: 5,
              retryDelay: 10000,
              exponentialBackoff: true,
              failureNotification: true
            }
          },
          notifications: [
            {
              type: 'webhook' as const,
              trigger: 'both' as const,
              recipients: ['https://api.example.com/reports'],
              template: 'monthly_webhook_template'
            }
          ]
        }
      }

      const scheduleId = await reportingEngine.scheduleReport(request, request.schedule!)

      expect(scheduleId).toBeDefined()
      expect(typeof scheduleId).toBe('string')
    })
  })

  describe('getReport', () => {
    it('should retrieve cached reports', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      const generateResult = await reportingEngine.generateReport(request)
      const reportId = generateResult.reportId

      const retrievedReport = await reportingEngine.getReport(reportId)

      expect(retrievedReport).toBeDefined()
      expect(retrievedReport!.metadata.reportId).toBe(reportId)
    })

    it('should return null for non-existent reports', async () => {
      const nonExistentId = 'report_123456789_abcdefgh'

      const retrievedReport = await reportingEngine.getReport(nonExistentId)

      expect(retrievedReport).toBeNull()
    })
  })

  describe('getReportHistory', () => {
    it('should retrieve report history for wallet', async () => {
      const walletAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'

      const history = await reportingEngine.getReportHistory(walletAddress)

      expect(Array.isArray(history)).toBe(true)
      // Since this is a mock implementation, it returns an empty array
      expect(history).toHaveLength(0)
    })
  })

  describe('export formats', () => {
    it('should export to CSV format correctly', () => {
      const mockReport = {
        executiveSummary: {
          totalValue: 35000,
          totalValueChangePercent: 17.14,
          totalPositions: 2,
          diversificationScore: 7.5
        }
      } as any

      const csvContent = (reportingEngine as any).convertToCSV(mockReport)

      expect(csvContent).toContain('Metric,Value,Unit')
      expect(csvContent).toContain('Total Value,35000,USD')
      expect(csvContent).toContain('Total Return,17.14,%')
      expect(csvContent).toContain('Total Positions,2,count')
    })

    it('should export to HTML format correctly', () => {
      const mockReport = {
        metadata: {
          reportId: 'test-report-123',
          generatedAt: new Date('2024-03-01'),
          configuration: { name: 'Test Report' }
        },
        executiveSummary: {
          totalValue: 35000,
          totalValueChangePercent: 17.14,
          totalPositions: 2,
          diversificationScore: 7.5
        },
        positionDetails: [
          {
            position: mockPositions[0],
            analytics: {
              currentValue: 15000,
              totalReturn: 1000,
              totalReturnPercent: 7.14
            }
          }
        ]
      } as any

      const mockConfiguration = {
        branding: {
          companyName: 'Test Company',
          disclaimer: 'Test disclaimer'
        }
      } as any

      const htmlContent = (reportingEngine as any).convertToHTML(mockReport, mockConfiguration)

      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('<title>Test Report</title>')
      expect(htmlContent).toContain('Test Company')
      expect(htmlContent).toContain('$35,000')
      expect(htmlContent).toContain('17.14%')
      expect(htmlContent).toContain('Test disclaimer')
    })

    it('should export to XML format correctly', () => {
      const mockReport = {
        metadata: {
          reportId: 'test-report-123',
          generatedAt: new Date('2024-03-01'),
          walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
        },
        executiveSummary: {
          totalValue: 35000,
          totalValueChangePercent: 17.14,
          totalPositions: 2,
          diversificationScore: 7.5
        },
        positionDetails: [
          {
            position: mockPositions[0],
            analytics: {
              currentValue: 15000,
              totalReturn: 1000,
              totalReturnPercent: 7.14
            }
          }
        ]
      } as any

      const xmlContent = (reportingEngine as any).convertToXML(mockReport)

      expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xmlContent).toContain('<PortfolioReport>')
      expect(xmlContent).toContain('<ReportId>test-report-123</ReportId>')
      expect(xmlContent).toContain('<TotalValue>35000</TotalValue>')
      expect(xmlContent).toContain('</PortfolioReport>')
    })

    it('should calculate pages correctly for different formats', () => {
      const shortContent = 'Short content'
      const longContent = 'A'.repeat(10000)

      const shortPagesJSON = (reportingEngine as any).calculatePages(shortContent, ReportFormat.JSON)
      const longPagesPDF = (reportingEngine as any).calculatePages(longContent, ReportFormat.PDF)

      expect(shortPagesJSON).toBe(1)
      expect(longPagesPDF).toBeGreaterThan(1)
    })

    it('should calculate checksums correctly', () => {
      const content = { test: 'data', value: 123 }

      const checksum1 = (reportingEngine as any).calculateChecksum(content)
      const checksum2 = (reportingEngine as any).calculateChecksum(content)
      const checksum3 = (reportingEngine as any).calculateChecksum({ test: 'different', value: 456 })

      expect(checksum1).toBe(checksum2) // Same content = same checksum
      expect(checksum1).not.toBe(checksum3) // Different content = different checksum
      expect(checksum1).toHaveLength(16) // Expected length
    })
  })

  describe('performance and optimization', () => {
    it('should maintain reasonable performance for complex reports', async () => {
      const complexRequest = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.DETAILED_ANALYSIS,
        format: [ReportFormat.JSON, ReportFormat.HTML, ReportFormat.PDF],
        customization: {
          customFields: Array(50).fill(null).map((_, i) => ({
            id: `field${i}`,
            name: `Custom Field ${i}`,
            type: 'number' as const,
            source: 'calculated',
            formatting: { decimals: 2 }
          })),
          customMetrics: Array(20).fill(null).map((_, i) => ({
            id: `metric${i}`,
            name: `Custom Metric ${i}`,
            description: `Description for metric ${i}`,
            formula: `position.value * ${i + 1}`,
            unit: 'USD',
            formatting: { decimals: 2 }
          }))
        }
      }

      const startTime = Date.now()
      const result = await reportingEngine.generateReport(complexRequest)
      const executionTime = Date.now() - startTime

      expect(result.status).toBe('success')
      expect(executionTime).toBeLessThan(10000) // Should complete within 10 seconds
      expect(result.metrics.totalTime).toBeLessThan(10000)
    })

    it('should cache report generation results', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      const startTime1 = Date.now()
      const result1 = await reportingEngine.generateReport(request)
      const time1 = Date.now() - startTime1

      const startTime2 = Date.now()
      const result2 = await reportingEngine.generateReport(request)
      const time2 = Date.now() - startTime2

      expect(result1.status).toBe('success')
      expect(result2.status).toBe('success')
      expect(time2).toBeLessThan(time1) // Second call should be faster due to caching
    })

    it('should handle memory efficiently for large reports', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.DETAILED_ANALYSIS,
        format: [ReportFormat.JSON, ReportFormat.HTML, ReportFormat.PDF, ReportFormat.CSV, ReportFormat.XML]
      }

      const result = await reportingEngine.generateReport(request)
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      expect(result.status).toBe('success')
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Less than 100MB increase
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle invalid wallet addresses', async () => {
      const request = {
        walletAddress: 'invalid-wallet-address',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      mockClient.getUserPositions.mockRejectedValue(new Error('Invalid wallet address'))

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('failed')
      expect(result.errors).toBeDefined()
      expect(result.errors!.some(err => err.message.includes('Invalid wallet address'))).toBe(true)
    })

    it('should handle network timeouts gracefully', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      mockClient.getUserPositions.mockRejectedValue(new Error('Network timeout'))

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('failed')
      expect(result.metrics.totalTime).toBeGreaterThan(0)
    })

    it('should handle positions with missing data', async () => {
      const incompletePositions = [
        {
          ...mockPositions[0],
          currentValue: undefined,
          pnl: undefined,
          feeEarnings: undefined
        }
      ] as any

      mockClient.getUserPositions.mockResolvedValue(incompletePositions)

      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')
      expect(result.warnings).toBeDefined()
      expect(result.warnings!.some(warn => warn.message.includes('missing'))).toBe(true)
    })

    it('should handle extremely large portfolios', async () => {
      const largePortfolio = Array(1000).fill(null).map((_, i) => ({
        ...mockPositions[0],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: Math.random() * 10000
      }))

      mockClient.getUserPositions.mockResolvedValue(largePortfolio)

      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')
      expect(result.metrics.totalTime).toBeLessThan(30000) // Should complete within 30 seconds
    })

    it('should handle invalid report formats gracefully', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: ['INVALID_FORMAT' as any]
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('failed')
      expect(result.errors).toBeDefined()
      expect(result.errors!.some(err => err.message.includes('Unsupported format'))).toBe(true)
    })
  })

  describe('report content validation', () => {
    it('should include all required sections in executive summary', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      const result = await reportingEngine.generateReport(request)
      const report = JSON.parse(result.outputs[0].content)

      expect(report).toHaveProperty('metadata')
      expect(report).toHaveProperty('executiveSummary')
      expect(report).toHaveProperty('portfolioOverview')
      expect(report).toHaveProperty('positionDetails')
      expect(report).toHaveProperty('performanceAnalysis')
      expect(report).toHaveProperty('riskAnalysis')

      expect(report.executiveSummary).toHaveProperty('totalValue')
      expect(report.executiveSummary).toHaveProperty('totalPositions')
      expect(report.executiveSummary).toHaveProperty('diversificationScore')
      expect(report.executiveSummary).toHaveProperty('performanceRating')
    })

    it('should calculate metrics accurately', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.DETAILED_ANALYSIS,
        format: [ReportFormat.JSON]
      }

      const result = await reportingEngine.generateReport(request)
      const report = JSON.parse(result.outputs[0].content)

      const expectedTotalValue = mockPositions.reduce((sum, pos) => sum + pos.currentValue, 0)
      const expectedTotalPnL = mockPositions.reduce((sum, pos) => sum + pos.pnl, 0)

      expect(report.executiveSummary.totalValue).toBeCloseTo(expectedTotalValue, 2)
      expect(report.executiveSummary.totalValueChange).toBeCloseTo(expectedTotalPnL, 2)
      expect(report.executiveSummary.totalPositions).toBe(mockPositions.length)
    })

    it('should include charts and visualizations', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.DETAILED_ANALYSIS,
        format: [ReportFormat.JSON]
      }

      const result = await reportingEngine.generateReport(request)
      const report = JSON.parse(result.outputs[0].content)

      expect(report.portfolioOverview).toHaveProperty('charts')
      expect(Array.isArray(report.portfolioOverview.charts)).toBe(true)
      expect(report.portfolioOverview.charts.length).toBeGreaterThan(0)

      report.portfolioOverview.charts.forEach((chart: any) => {
        expect(chart).toHaveProperty('id')
        expect(chart).toHaveProperty('title')
        expect(chart).toHaveProperty('type')
        expect(chart).toHaveProperty('data')
        expect(chart).toHaveProperty('configuration')
      })
    })
  })

  describe('internationalization and localization', () => {
    it('should handle different currencies', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.HTML],
        customization: {
          customFields: [
            {
              id: 'currency_field',
              name: 'Portfolio Value EUR',
              type: 'currency' as const,
              source: 'calculated',
              formatting: { prefix: '€', decimals: 2 }
            }
          ]
        }
      }

      const result = await reportingEngine.generateReport(request)

      expect(result.status).toBe('success')
      expect(result.outputs[0].content).toContain('€') // Should include Euro symbol
    })

    it('should handle different date formats', async () => {
      const request = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        reportType: ReportTemplateType.EXECUTIVE_SUMMARY,
        format: [ReportFormat.JSON]
      }

      const result = await reportingEngine.generateReport(request)
      const report = JSON.parse(result.outputs[0].content)

      expect(report.metadata.generatedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) // ISO format
    })
  })
})