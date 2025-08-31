"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type StripeKeys, updateStripeKeys } from "./actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentMethodsFormProps {
  initialData: StripeKeys | null
}

export default function PaymentMethodsForm({ initialData }: PaymentMethodsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StripeKeys>({
    defaultValues:
      initialData ||
      ({
        test_publishable_key: "",
        test_secret_key: "",
        live_publishable_key: "",
        live_secret_key: "",
      } as any),
  })

  const onSubmit = async (data: StripeKeys) => {
    setIsLoading(true)
    try {
      const result = await updateStripeKeys({
        id: initialData?.id,
        ...data,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Stripe keys updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update Stripe keys",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="test">
        <TabsList className="mb-4">
          <TabsTrigger value="test">Test Keys</TabsTrigger>
          <TabsTrigger value="live">Live Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Mode API Keys</CardTitle>
              <CardDescription>These keys are used for testing. No real charges will be made.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test_publishable_key">Publishable Key</Label>
                <Input id="test_publishable_key" {...register("test_publishable_key")} placeholder="pk_test_..." />
                {errors.test_publishable_key && (
                  <p className="text-sm text-red-500">{errors.test_publishable_key.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="test_secret_key">Secret Key</Label>
                <Input
                  id="test_secret_key"
                  type="password"
                  {...register("test_secret_key")}
                  placeholder="sk_test_..."
                />
                {errors.test_secret_key && <p className="text-sm text-red-500">{errors.test_secret_key.message}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle>Live Mode API Keys</CardTitle>
              <CardDescription>These keys will process real charges. Use with caution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="live_publishable_key">Publishable Key</Label>
                <Input id="live_publishable_key" {...register("live_publishable_key")} placeholder="pk_live_..." />
                {errors.live_publishable_key && (
                  <p className="text-sm text-red-500">{errors.live_publishable_key.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="live_secret_key">Secret Key</Label>
                <Input
                  id="live_secret_key"
                  type="password"
                  {...register("live_secret_key")}
                  placeholder="sk_live_..."
                />
                {errors.live_secret_key && <p className="text-sm text-red-500">{errors.live_secret_key.message}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
