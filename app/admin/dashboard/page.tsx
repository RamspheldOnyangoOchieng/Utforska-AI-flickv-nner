"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { useSite } from "@/components/site-context"
import { useCharacters } from "@/components/character-context"
import {
  Home,
  Save,
  Edit,
  Settings,
  Users,
  MessageSquare,
  CreditCard,
  TrendingUp,
  DollarSign,
  Activity,
  Eye,
  UserPlus,
  Database,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth()
  const { settings, updateSettings } = useSite()
  const { characters } = useCharacters()
  const router = useRouter()
  const [siteName, setSiteName] = useState(settings.siteName)
  const [logoText, setLogoText] = useState(settings.logoText)
  const [currency, setCurrency] = useState(settings.pricing.currency)
  const [currencyPosition, setCurrencyPosition] = useState(settings.pricing.currencyPosition)
  const [monthlyPrice, setMonthlyPrice] = useState(settings.pricing.monthly.price.toString())
  const [monthlyOriginalPrice, setMonthlyOriginalPrice] = useState(settings.pricing.monthly.originalPrice.toString())
  const [monthlyDiscount, setMonthlyDiscount] = useState(settings.pricing.monthly.discount.toString())
  const [quarterlyPrice, setQuarterlyPrice] = useState(settings.pricing.quarterly.price.toString())
  const [quarterlyOriginalPrice, setQuarterlyOriginalPrice] = useState(
    settings.pricing.quarterly.originalPrice.toString(),
  )
  const [quarterlyDiscount, setQuarterlyDiscount] = useState(settings.pricing.quarterly.discount.toString())
  const [yearlyPrice, setYearlyPrice] = useState(settings.pricing.yearly.price.toString())
  const [yearlyOriginalPrice, setYearlyOriginalPrice] = useState(settings.pricing.yearly.originalPrice.toString())
  const [yearlyDiscount, setYearlyDiscount] = useState(settings.pricing.yearly.discount.toString())
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Real stats from actual data
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | undefined>(undefined)
  const [totalRevenue, setTotalRevenue] = useState<number | undefined>(undefined)
  const [totalOrders, setTotalOrders] = useState<number | undefined>(undefined)
  const [totalUsers, setTotalUsers] = useState<number | undefined>(undefined)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const monthlyResponse = await fetch("/api/monthly-revenue", { next: { revalidate: 0 } })
        if (monthlyResponse.ok) {
          const monthlyData = await monthlyResponse.json()
          setMonthlyRevenue(monthlyData.totalRevenue)
        } else {
          setMonthlyRevenue(0)
        }
      } catch (error) {
        console.error("Failed to fetch monthly revenue:", error)
        setMonthlyRevenue(0)
      }

      try {
        const totalResponse = await fetch("/api/revenue", { next: { revalidate: 0 } })
        if (totalResponse.ok) {
          const totalData = await totalResponse.json()
          setTotalRevenue(totalData.totalRevenue)
          setTotalOrders(totalData.totalOrders)
        } else {
          setTotalRevenue(0)
          setTotalOrders(0)
        }
      } catch (error) {
        console.error("Failed to fetch total revenue:", error)
        setTotalRevenue(0)
        setTotalOrders(0)
      }

      try {
        const usersResponse = await fetch("/api/total-users", { next: { revalidate: 0 } })
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setTotalUsers(usersData.totalUsers)
        } else {
          setTotalUsers(0)
        }
      } catch (error) {
        console.error("Failed to fetch total users:", error)
        setTotalUsers(0)
      }

      try {
        const activityResponse = await fetch("/api/recent-activity", { next: { revalidate: 0 } })
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setRecentActivity(activityData.activity)
        } else {
          setRecentActivity([])
        }
      } catch (error) {
        console.error("Failed to fetch recent activity:", error)
        setRecentActivity([])
      }
    }

    fetchData()

    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const { users: authUsers } = useAuth()

  const stats = [
    {
      title: "Total Users",
      value: authUsers.length.toString(),
      change: "0%",
      changeType: "neutral",
      icon: Users,
    },
    {
      title: "Active Characters",
      value: characters?.length?.toString() || "0",
      change: "0%",
      changeType: "neutral",
      icon: MessageSquare,
    },
    {
      title: "Token usage",
      value: typeof monthlyRevenue === 'number' ? `${monthlyRevenue.toFixed(2)}` : "0.00",
      change: "0%",
      changeType: "neutral",
      icon: DollarSign,
    },
    {
      title: "Total Revenue",
      value: typeof totalRevenue === 'number' ? `$${totalRevenue.toFixed(2)}` : "$0.00",
      change: "0%",
      changeType: "neutral",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: typeof totalOrders === 'number' ? totalOrders.toString() : "0",
      change: "0%",
      changeType: "neutral",
      icon: CreditCard,
    },
  ]

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      updateSettings({
        siteName,
        logoText,
        pricing: {
          currency,
          currencyPosition,
          monthly: {
            price: Number.parseFloat(monthlyPrice),
            originalPrice: Number.parseFloat(monthlyOriginalPrice),
            discount: Number.parseInt(monthlyDiscount),
          },
          quarterly: {
            price: Number.parseFloat(quarterlyPrice),
            originalPrice: Number.parseFloat(quarterlyOriginalPrice),
            discount: Number.parseInt(quarterlyDiscount),
          },
          yearly: {
            price: Number.parseFloat(yearlyPrice),
            originalPrice: Number.parseFloat(yearlyOriginalPrice),
            discount: Number.parseInt(yearlyDiscount),
          },
        },
      })
      setSaveMessage("Settings saved successfully!")
      setIsSaving(false)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage("")
      }, 3000)
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back! Here's your platform overview.</p>
        </div>
        <Button onClick={() => router.push("/")} variant="outline" className="flex items-center space-x-2">
          <Home className="h-4 w-4" />
          <span>View Site</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="flex items-center space-x-1 mt-1">
                <Badge
                  variant={
                    stat.changeType === "positive"
                      ? "default"
                      : stat.changeType === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
                <CardDescription>Current system health and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Services</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Image Generation</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Connected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4 bg-transparent"
                    onClick={() => router.push("/admin/dashboard/users")}
                  >
                    <div className="flex items-center space-x-3">
                      <UserPlus className="h-5 w-5 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">Manage Users</div>
                        <div className="text-xs text-slate-500">Add or edit users</div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4 bg-transparent"
                    onClick={() => router.push("/admin/dashboard/characters")}
                  >
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <div className="text-left">
                        <div className="font-medium">Characters</div>
                        <div className="text-xs text-slate-500">Manage AI characters</div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4 bg-transparent"
                    onClick={() => router.push("/admin/payment-methods")}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Payments</div>
                        <div className="text-xs text-slate-500">Configure payments</div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4 bg-transparent"
                    onClick={() => router.push("/admin/dashboard/database")}
                  >
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-orange-500" />
                      <div className="text-left">
                        <div className="font-medium">Database</div>
                        <div className="text-xs text-slate-500">Database tools</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest actions on your platform</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                        <span className="text-white text-sm font-medium">
                          {activity.users_view.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.users_view.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {activity.description}
                        </p>
                      </div>
                      <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No recent activity</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Activity will appear here as users interact with your platform.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic site information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Enter site name"
                  />
                  <p className="text-xs text-slate-500">
                    This will be displayed in the browser tab and various places throughout the site.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoText">Logo Text</Label>
                  <Input
                    id="logoText"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    placeholder="Enter logo text"
                  />
                  <p className="text-xs text-slate-500">The text part of the logo (before the .ai)</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                {saveMessage && <p className="text-green-600 dark:text-green-400 text-sm font-medium">{saveMessage}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>See how your changes will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl font-bold flex items-center text-slate-900 dark:text-white">
                  {logoText}
                  <span className="text-primary">
                    .ai
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Browser title: {siteName}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Premium Pricing Configuration</CardTitle>
              <CardDescription>Set up your subscription pricing and currency settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Symbol</Label>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-24"
                    placeholder="$"
                  />
                  <p className="text-xs text-slate-500">The currency symbol to display (e.g., $, €, £, ¥)</p>
                </div>

                <div className="space-y-3">
                  <Label>Currency Position</Label>
                  <RadioGroup
                    value={currencyPosition}
                    onValueChange={(value) => setCurrencyPosition(value as "left" | "right")}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="left" />
                      <Label htmlFor="left">Left ({currency}100)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="right" />
                      <Label htmlFor="right">Right (100{currency})</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-slate-500">Position of the currency symbol relative to the price</p>
                </div>
              </div>

              <Tabs defaultValue="monthly" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyPrice">Price</Label>
                      <Input
                        id="monthlyPrice"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(e.target.value)}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyOriginalPrice">Original Price</Label>
                      <Input
                        id="monthlyOriginalPrice"
                        value={monthlyOriginalPrice}
                        onChange={(e) => setMonthlyOriginalPrice(e.target.value)}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyDiscount">Discount (%)</Label>
                      <Input
                        id="monthlyDiscount"
                        value={monthlyDiscount}
                        onChange={(e) => setMonthlyDiscount(e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quarterly" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quarterlyPrice">Price</Label>
                      <Input
                        id="quarterlyPrice"
                        value={quarterlyPrice}
                        onChange={(e) => setQuarterlyPrice(e.target.value)}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quarterlyOriginalPrice">Original Price</Label>
                      <Input
                        id="quarterlyOriginalPrice"
                        value={quarterlyOriginalPrice}
                        onChange={(e) => setQuarterlyOriginalPrice(e.target.value)}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quarterlyDiscount">Discount (%)</Label>
                      <Input
                        id="quarterlyDiscount"
                        value={quarterlyDiscount}
                        onChange={(e) => setQuarterlyDiscount(e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearlyPrice">Price</Label>
                      <Input
                        id="yearlyPrice"
                        value={yearlyPrice}
                        onChange={(e) => setYearlyPrice(e.target.value)}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearlyOriginalPrice">Original Price</Label>
                      <Input
                        id="yearlyOriginalPrice"
                        value={yearlyOriginalPrice}
                        onChange={(e) => setYearlyOriginalPrice(e.target.value)}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearlyDiscount">Discount (%)</Label>
                      <Input
                        id="yearlyDiscount"
                        value={yearlyDiscount}
                        onChange={(e) => setYearlyDiscount(e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Pricing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Footer Editor</CardTitle>
              <CardDescription>Customize the site footer content, links, and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Footer Content</CardTitle>
                    <CardDescription>
                      Edit the footer sections, links, and contact information directly on the site.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-3">
                      <Button onClick={() => router.push("/#footer-edit")} variant="outline" className="justify-start">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Footer Content
                      </Button>
                      <Button
                        onClick={() => router.push("/admin/footer-settings")}
                        variant="outline"
                        className="justify-start"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Advanced Footer Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Footer Display Options</CardTitle>
                    <CardDescription>Configure footer visibility and display settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showFooter" defaultChecked />
                      <Label htmlFor="showFooter">Show footer on all pages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showPaymentIcons" defaultChecked />
                      <Label htmlFor="showPaymentIcons">Show payment method icons</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
