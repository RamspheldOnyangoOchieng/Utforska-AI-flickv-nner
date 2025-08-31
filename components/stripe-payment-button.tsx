"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface StripePaymentButtonProps {
  planId: string
  userId?: string
  email?: string
  buttonText?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  showLogos?: boolean
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function StripePaymentButton({
  planId,
  userId,
  email,
  buttonText = "Subscribe",
  className,
  variant = "default",
  size = "default",
  disabled = false,
  showLogos = true,
  onSuccess,
  onError,
}: StripePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

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
          // The success URL should already be configured to redirect to /premium/success
          // which will then redirect to /profile after payment verification
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
    <div className="flex flex-col items-center">
      <Button
        onClick={handlePayment}
        disabled={isLoading || disabled}
        className={`${className} w-full`}
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

      {showLogos && isClient && (
        <div className="flex items-center justify-center mt-2 space-x-2">
          <Image src="/visa-logo.svg" alt="Visa" width={32} height={20} />
          <Image src="/mastercard-logo.svg" alt="Mastercard" width={32} height={20} />
        </div>
      )}
    </div>
  )
}
