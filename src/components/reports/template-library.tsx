'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Layout,
  Download,
  Star,
  FileText,
  TrendingUp,
  DollarSign,
  Shield,
  Eye,
  Copy
} from 'lucide-react'
import { getDefaultReportTemplates, type ReportTemplate } from '@/lib/reports/report-generator'

interface TemplateLibraryProps {
  onUseTemplate: (template: ReportTemplate) => void
}

export function TemplateLibrary({ onUseTemplate }: TemplateLibraryProps) {
  const [templates] = useState<ReportTemplate[]>(getDefaultReportTemplates())
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'portfolio':
        return <TrendingUp className="h-6 w-6" />
      case 'tax':
        return <FileText className="h-6 w-6" />
      case 'performance':
        return <DollarSign className="h-6 w-6" />
      case 'risk':
        return <Shield className="h-6 w-6" />
      default:
        return <Layout className="h-6 w-6" />
    }
  }

  const getTemplateColor = (type: string) => {
    switch (type) {
      case 'portfolio':
        return 'from-indigo-600 to-purple-600'
      case 'tax':
        return 'from-green-600 to-emerald-600'
      case 'performance':
        return 'from-blue-600 to-cyan-600'
      case 'risk':
        return 'from-red-600 to-orange-600'
      default:
        return 'from-gray-600 to-slate-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Library Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Professional Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Choose from professionally designed report templates or create your own custom templates
          </p>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`border-2 transition-all cursor-pointer ${
                  selectedTemplate?.id === template.id
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-6">
                  {/* Template Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${getTemplateColor(template.type)} flex items-center justify-center text-white mb-4`}>
                    {getTemplateIcon(template.type)}
                  </div>

                  {/* Template Info */}
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

                  {/* Template Stats */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {template.sections.length} sections
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.defaultFormat.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Template Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        onUseTemplate(template)
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTemplate(template)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Details */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Details: {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Template Overview */}
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getTemplateColor(selectedTemplate.type)} flex items-center justify-center text-white flex-shrink-0`}>
                    {getTemplateIcon(selectedTemplate.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h3>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary">
                        {selectedTemplate.type}
                      </Badge>
                      <Badge variant="outline">
                        {selectedTemplate.defaultFormat} format
                      </Badge>
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        Professional
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Sections */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Included Sections</h4>
                <div className="space-y-2">
                  {selectedTemplate.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{section.title}</p>
                        <p className="text-sm text-gray-600 capitalize">{section.type}</p>
                      </div>
                      {section.enabled && (
                        <Badge variant="outline" className="text-xs">
                          Enabled
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => onUseTemplate(selectedTemplate)}
                  className="flex-1"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Use This Template
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    // Future: Clone template functionality
                    console.log('Clone template:', selectedTemplate.id)
                  }}
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Clone
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Template Creation (Placeholder) */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <Layout className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Custom Template</h3>
          <p className="text-gray-600 mb-4">
            Build your own report template with custom sections and branding
          </p>
          <Button variant="outline">
            <Layout className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </CardContent>
      </Card>

      {/* Template Tips */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-indigo-600 mt-0.5 fill-indigo-600" />
            <div>
              <h4 className="font-semibold text-indigo-900 mb-2">Template Best Practices</h4>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>Portfolio Summary: Best for regular performance reviews</li>
                <li>Tax Report: Essential for year-end tax filing</li>
                <li>Performance Analysis: Ideal for detailed analytics</li>
                <li>Risk Assessment: Important for risk management</li>
                <li>Fee Earnings: Perfect for tracking revenue</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
