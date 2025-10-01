'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Monitor, Globe, Hash, Clock } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'

export function DisplayPreferences() {
  const { settings, updateDisplayPreferences } = useSettings()
  const { display } = settings

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Theme Settings
          </CardTitle>
          <CardDescription>Customize the appearance of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={display.theme}
              onValueChange={(value) => updateDisplayPreferences({ theme: value as any })}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto (System)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Choose your preferred color scheme
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Currency and Locale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Currency & Locale
          </CardTitle>
          <CardDescription>Set your preferred currency and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Display Currency</Label>
            <Select
              value={display.currency}
              onValueChange={(value) => updateDisplayPreferences({ currency: value as any })}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="SOL">SOL - Solana</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={display.language}
              onValueChange={(value) => updateDisplayPreferences({ language: value as any })}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="24hour">24-Hour Time Format</Label>
              <p className="text-sm text-gray-500">Display time in 24-hour format</p>
            </div>
            <Switch
              id="24hour"
              checked={display.use24Hour}
              onCheckedChange={(checked) => updateDisplayPreferences({ use24Hour: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Number Formatting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Number Formatting
          </CardTitle>
          <CardDescription>Configure how numbers are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numberFormat">Number Format</Label>
            <Select
              value={display.numberFormat}
              onValueChange={(value) => updateDisplayPreferences({ numberFormat: value as any })}
            >
              <SelectTrigger id="numberFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (1,234,567.89)</SelectItem>
                <SelectItem value="compact">Compact (1.23M)</SelectItem>
                <SelectItem value="scientific">Scientific (1.23e6)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="decimals">Decimal Places</Label>
              <span className="text-sm font-medium">{display.showDecimals}</span>
            </div>
            <Slider
              id="decimals"
              min={0}
              max={8}
              step={1}
              value={[display.showDecimals]}
              onValueChange={(value) => updateDisplayPreferences({ showDecimals: value[0] })}
            />
            <p className="text-sm text-gray-500">
              Number of decimal places to display
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact">Compact Large Numbers</Label>
              <p className="text-sm text-gray-500">Display large numbers in compact format</p>
            </div>
            <Switch
              id="compact"
              checked={display.compactNumbers}
              onCheckedChange={(checked) => updateDisplayPreferences({ compactNumbers: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chart Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Chart Preferences
          </CardTitle>
          <CardDescription>Customize chart display options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Chart preferences will sync with your theme and number format settings automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your settings will look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Currency:</span>
              <span className="font-medium">
                {display.currency === 'SOL' ? '◎' : display.currency}
                {' '}
                {display.currency === 'SOL' ? '1.234' : '1,234.56'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number Format:</span>
              <span className="font-medium">
                {display.numberFormat === 'compact' ? '1.23M' :
                 display.numberFormat === 'scientific' ? '1.23e6' :
                 '1,234,567.89'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Decimal Places:</span>
              <span className="font-medium">
                {(1.23456789).toFixed(display.showDecimals)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Format:</span>
              <span className="font-medium">
                {display.use24Hour ? '14:30' : '2:30 PM'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
