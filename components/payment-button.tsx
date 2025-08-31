"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface PaymentButtonProps {
  planId: string
  userId?: string
  email?: string
  buttonText?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function PaymentButton({
  planId,
  userId,
  email,
  buttonText = "Subscribe",
  className,
  variant = "default",
  size = "default",
  disabled = false,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          userId,
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        if (onSuccess) {
          onSuccess(data.url)
        } else {
          // Redirect to Stripe checkout
          window.location.href = data.url
        }
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error: any) {
      console.error("Payment error:", error.message)
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      })
      if (onError) {
        onError(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || disabled}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </Button>
  )
}
