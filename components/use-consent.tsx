"use client"
import { useEffect, useState } from 'react'
import { CONSENT_STORAGE_KEY } from '@/lib/consent-config'

interface ConsentData {
  version: number
  policyVersion: number
  preferences: { analytics: boolean; marketing: boolean }
  confirmations: { age: boolean; terms: boolean }
}

export function useConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null)

  useEffect(()=>{
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (raw) setConsent(JSON.parse(raw))
    } catch {}
  },[])

  return consent
}

export function AnalyticsLoader() {
  const consent = useConsent()
  useEffect(() => {
    if (!consent?.preferences.analytics) return
    if (document.getElementById('plausible-script')) return
    // Integrate Plausible (self-host or plausible.io) without cookies; marketing consent could gate outbound events
    const script = document.createElement('script')
    script.id = 'plausible-script'
    script.setAttribute('defer', 'true')
    // Domain from env or fallback; ensure this env is exposed (NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
    const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || window.location.hostname
    script.setAttribute('data-domain', domain)
    script.src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js'
    document.head.appendChild(script)

    // Optional example of gating custom events by marketing preference
    ;(window as any).trackMarketingEvent = (name: string, props?: Record<string, any>) => {
      if (!consent.preferences.marketing) return
      ;(window as any).plausible?.(name, { props })
    }
  }, [consent])
  return null
}
