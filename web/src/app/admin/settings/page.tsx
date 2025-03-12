"use client"
import { useEffect, useState } from "react"
import { settingsAPI, handleApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

// Add these interfaces before the component
interface Settings {
  general: {
    companyName: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    darkMode: boolean;
  };
  pricing: {
    hourlyRate: number;
    dailyRate: number;
    monthlyRate: number;
    weekendPricing: boolean;
  };
  api: {
    plateRecognizerKey: string;
    paymentGatewayKey: string;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    capacityAlertsEnabled: boolean;
  };
}

type SettingsCategory = keyof Settings;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    general: {
      companyName: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
      darkMode: false
    },
    pricing: {
      hourlyRate: 0,
      dailyRate: 0,
      monthlyRate: 0,
      weekendPricing: false
    },
    api: {
      plateRecognizerKey: "",
      paymentGatewayKey: ""
    },
    notifications: {
      emailEnabled: false,
      smsEnabled: false,
      capacityAlertsEnabled: false
    }
  })
  console.log(settings);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getAllSettings();
      console.log("API Response:", response.data);

      if (response.data?.data?.settings) {
        setSettings(prev => ({
          general: { ...prev.general, ...response.data.data.settings.general },
          pricing: {
            ...prev.pricing,
            ...response.data.data.settings.pricing,
            monthlyRate: response.data.data.settings.pricing?.monthlyRate || 0,
            weekendPricing: response.data.data.settings.pricing?.weekendPricing || false,
          },
          api: {
            ...prev.api,
            ...response.data.data.settings.api,
            paymentGatewayKey: response.data.data.settings.api?.paymentGatewayKey || "",
          },
          notifications: prev.notifications, // Keep defaults since it's missing
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category: SettingsCategory, data: Settings[SettingsCategory]) => {
    try {
      await settingsAPI.upsertSetting({ category, ...data })
      // Refresh settings
      await fetchSettings()
    } catch (error) {
      console.error('Error saving settings:', handleApiError(error))
    }
  }

  if (loading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your system settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={settings.general?.companyName}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, companyName: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.general?.address}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, address: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={settings.general?.contactEmail}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, contactEmail: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={settings.general?.contactPhone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, contactPhone: e.target.value }
                  }))}
                />
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode for the dashboard</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.general?.darkMode}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, darkMode: checked }
                  }))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings('general', settings.general)}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Set up parking rates and pricing rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly-rate"
                  type="number"
                  value={settings.pricing?.hourlyRate}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, hourlyRate: parseFloat(e.target.value) }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-rate">Daily Maximum Rate ($)</Label>
                <Input
                  id="daily-rate"
                  type="number"
                  value={settings.pricing?.dailyRate}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, dailyRate: parseFloat(e.target.value) }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-rate">Monthly Pass Rate ($)</Label>
                <Input
                  id="monthly-rate"
                  type="number"
                  value={settings.pricing?.monthlyRate}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, monthlyRate: parseFloat(e.target.value) }
                  }))}
                />
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekend-pricing">Weekend Pricing</Label>
                  <p className="text-sm text-muted-foreground">Apply different rates on weekends</p>
                </div>
                <Switch
                  id="weekend-pricing"
                  checked={settings.pricing?.weekendPricing}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, weekendPricing: checked }
                  }))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings('pricing', settings.pricing)}>
                Save Pricing
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plate-recognizer-api">Plate Recognizer API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="plate-recognizer-api"
                    type="password"
                    value={settings.api?.plateRecognizerKey}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      api: { ...prev.api, plateRecognizerKey: e.target.value }
                    }))}
                  />
                  <Button variant="outline">Show</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-gateway-api">Payment Gateway API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="payment-gateway-api"
                    type="password"
                    value={settings.api?.paymentGatewayKey}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      api: { ...prev.api, paymentGatewayKey: e.target.value }
                    }))}
                  />
                  <Button variant="outline">Show</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings('api', settings.api)}>
                Save API Keys
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications?.emailEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, emailEnabled: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS notifications for critical alerts</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={settings.notifications?.smsEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, smsEnabled: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="capacity-alerts">Capacity Alerts</Label>
                  <p className="text-sm text-muted-foreground">Send alerts when parking is near capacity</p>
                </div>
                <Switch
                  id="capacity-alerts"
                  checked={settings.notifications?.capacityAlertsEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, capacityAlertsEnabled: checked }
                  }))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings('notifications', settings.notifications)}>
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
