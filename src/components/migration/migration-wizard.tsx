'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Wand2,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'

export function MigrationWizard() {
  const { positions } = useUserPositions()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState({
    sourcePosition: '',
    targetPool: '',
    targetFeeTier: '',
    amount: '100',
    slippage: '1.0',
    priorityFee: 'medium'
  })

  const steps = [
    { id: 1, name: 'Select Position', icon: Circle },
    { id: 2, name: 'Choose Target', icon: Circle },
    { id: 3, name: 'Configure', icon: Circle },
    { id: 4, name: 'Review', icon: Circle },
    { id: 5, name: 'Execute', icon: Circle }
  ]

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const StepIcon = steps[currentStep - 1].icon

  return (
    <div className="space-y-6">
      {/* Wizard Progress */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            Migration Planning Wizard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep > step.id
                      ? 'bg-green-600 border-green-600'
                      : currentStep === step.id
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-white border-gray-300'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <span className={`text-sm font-bold ${currentStep === step.id ? 'text-white' : 'text-gray-400'}`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-2 text-center ${currentStep >= step.id ? 'font-medium' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>

          <Badge variant="outline" className="w-full justify-center py-2">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}
          </Badge>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StepIcon className="h-5 w-5" />
            {steps[currentStep - 1].name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Select Position */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the position you want to migrate to a different pool or fee tier.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {positions.map((pos) => {
                  const poolName = `${pos.tokenX?.symbol}/${pos.tokenY?.symbol}`
                  const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000
                  const isSelected = wizardData.sourcePosition === pos.id

                  return (
                    <button
                      key={pos.id}
                      onClick={() => setWizardData({ ...wizardData, sourcePosition: pos.id })}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{poolName}</p>
                      <p className="text-sm text-gray-600">${value.toFixed(2)}</p>
                      {isSelected && (
                        <Badge className="mt-2 bg-purple-600">Selected</Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Choose Target */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the target pool and fee tier for migration.
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="target-pool">Target Pool</Label>
                  <select
                    id="target-pool"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
                    value={wizardData.targetPool}
                    onChange={(e) => setWizardData({ ...wizardData, targetPool: e.target.value })}
                  >
                    <option value="">Select pool...</option>
                    <option value="SOL/USDC">SOL/USDC</option>
                    <option value="RAY/SOL">RAY/SOL</option>
                    <option value="ORCA/USDC">ORCA/USDC</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="fee-tier">Target Fee Tier</Label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {['0.01%', '0.05%', '0.25%', '1.00%'].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setWizardData({ ...wizardData, targetFeeTier: tier })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          wizardData.targetFeeTier === tier
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">{tier}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Configure */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure migration parameters and risk tolerance.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount to Migrate (%)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={wizardData.amount}
                    onChange={(e) => setWizardData({ ...wizardData, amount: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Migrate 100% of position or partial amount
                  </p>
                </div>

                <div>
                  <Label htmlFor="slippage">Max Slippage (%)</Label>
                  <Input
                    id="slippage"
                    type="number"
                    step="0.1"
                    value={wizardData.slippage}
                    onChange={(e) => setWizardData({ ...wizardData, slippage: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Priority Fee</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { value: 'low', label: 'Low', desc: 'Slower' },
                      { value: 'medium', label: 'Medium', desc: 'Normal' },
                      { value: 'high', label: 'High', desc: 'Faster' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setWizardData({ ...wizardData, priorityFee: option.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          wizardData.priorityFee === option.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Review your migration plan before execution.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Source Position:</span>
                  <span className="font-medium">SOL/USDC (0.03%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Pool:</span>
                  <span className="font-medium">{wizardData.targetPool || 'Not selected'} ({wizardData.targetFeeTier || ''})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{wizardData.amount}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slippage Tolerance:</span>
                  <span className="font-medium">{wizardData.slippage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority Fee:</span>
                  <span className="font-medium capitalize">{wizardData.priorityFee}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-medium">
                    <span>Estimated Gas Cost:</span>
                    <span className="text-red-600">$2.50</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Estimated Time:</span>
                    <span>~30 seconds</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">Pre-Flight Checks</p>
                  <ul className="mt-2 space-y-1 text-yellow-800">
                    <li>✓ Sufficient balance for gas fees</li>
                    <li>✓ Target pool liquidity adequate</li>
                    <li>✓ No pending transactions</li>
                    <li>✓ Network conditions normal</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Execute */}
          {currentStep === 5 && (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto">
                <Wand2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Execute Migration
                </h3>
                <p className="text-gray-600">
                  Click the button below to start the migration process. This action cannot be undone.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-blue-900 mb-2">What happens next:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Remove liquidity from current position</li>
                  <li>Swap tokens if needed for target pool</li>
                  <li>Add liquidity to target pool</li>
                  <li>Confirm transaction and update records</li>
                </ol>
              </div>

              <Button className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Execute Migration Now
              </Button>

              <p className="text-xs text-gray-500">
                Estimated completion: 30-60 seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === 5}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
