"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function SubscriptionSettings() {
    const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "subscriptions_enabled")
                .maybeSingle()

            if (error) {
                console.error("Error fetching settings:", error);
                setSubscriptionsEnabled(true); // Default on error
            } else if (data) {
                setSubscriptionsEnabled(data.value === null ? true : data.value);
            } else {
                setSubscriptionsEnabled(true);
            }
            setLoading(false)
        }

        fetchSettings()
    }, [supabase])

    const handleToggle = async (enabled: boolean) => {
        setSubscriptionsEnabled(enabled)
        const { error } = await supabase
            .from("settings")
            .upsert({ key: "subscriptions_enabled", value: enabled }, { onConflict: 'key' })

        if (error) {
            toast.error("Failed to save setting: " + error.message);
            setSubscriptionsEnabled(!enabled);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription Settings</CardTitle>
                <CardDescription>Enable or disable subscriptions globally.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="subscriptions-enabled"
                        checked={subscriptionsEnabled}
                        onCheckedChange={handleToggle}
                        disabled={loading}
                    />
                    <Label htmlFor="subscriptions-enabled">
                        {subscriptionsEnabled ? "Subscriptions Enabled" : "Subscriptions Disabled"}
                    </Label>
                </div>
            </CardContent>
        </Card>
    )
}