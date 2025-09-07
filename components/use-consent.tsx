"use client"
import { useEffect, useState } from 'react'
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, POLICY_VERSION } from '@/lib/consent-config'

interface ConsentData {
  version: number
  policyVersion: number
  preferences: { analytics: boolean; marketing: boolean }
  confirmations: { age: boolean; terms: boolean }
}

export function useConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadConsent = () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (raw) {
        setConsent(JSON.parse(raw))
      } else {
        setConsent(null)
      }
    } catch {
      setConsent(null)
    }
  }

  useEffect(() => {
    loadConsent()
    setIsLoaded(true)
  }, [])

  const updateConsent = (preferences: { analytics: boolean; marketing: boolean }) => {
    try {
      const payload = {
        version: CONSENT_VERSION,
        policyVersion: POLICY_VERSION,
        timestamp: Date.now(),
        preferences,
        confirmations: { age: true, terms: true }
      }
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload))
      setConsent(payload)
    } catch {}
  }

  return { consent, isLoaded, updateConsent }
}

export function AnalyticsLoader() {
  const { consent, isLoaded } = useConsent()
  
  useEffect(() => {
    // Prevent multiple executions
    if (!isLoaded) return
    if (document.getElementById('plausible-script')) return
    
    const analyticsEnabled = consent?.preferences?.analytics
    if (!analyticsEnabled) return
    
    try {
      // Integrate Plausible without infinite re-renders
      const script = document.createElement('script')
      script.id = 'plausible-script'
      script.setAttribute('defer', 'true')
      const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'aidamskompis.com'
      script.setAttribute('data-domain', domain)
      script.src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js'
      document.head.appendChild(script)

      // Optional marketing event tracking
      const marketingEnabled = consent?.preferences?.marketing
      ;(window as any).trackMarketingEvent = (name: string, props?: Record<string, any>) => {
        if (!marketingEnabled) return
        ;(window as any).plausible?.(name, { props })
      }
    } catch (error) {
      console.error('Analytics loading error:', error)
    }
  }, [isLoaded, consent?.preferences?.analytics, consent?.preferences?.marketing]) // Use specific primitive values
  
  return null
}
