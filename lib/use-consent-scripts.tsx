"use client"
import { useEffect } from 'react'
import { CONSENT_STORAGE_KEY } from '@/lib/consent-config'

interface ConsentData {
  preferences: { analytics: boolean; marketing: boolean }
}

export function useConsentScripts() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (!raw) return
      const parsed: ConsentData = JSON.parse(raw)
      if (parsed.preferences.analytics) {
        // Example analytics loader (placeholder)
        if (!document.getElementById('dummy-analytics')) {
          const s = document.createElement('script')
          s.id = 'dummy-analytics'
          s.innerHTML = 'window.__analyticsLoaded=true'
          document.head.appendChild(s)
        }
      }
      if (parsed.preferences.marketing) {
        if (!document.getElementById('dummy-marketing')) {
          const s = document.createElement('script')
            s.id = 'dummy-marketing'
            s.innerHTML = 'window.__marketingLoaded=true'
            document.head.appendChild(s)
        }
      }
    } catch {}
  }, [])
}