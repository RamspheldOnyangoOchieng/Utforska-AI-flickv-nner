// Centralized consent & policy versioning
export const CONSENT_STORAGE_KEY = "cookieConsentV2"
export const CONSENT_VERSION = 1 // bump if consent data structure changes
export const POLICY_VERSION = 1 // bump if legal text / required confirmations change

export interface StoredConsent {
  version: number
  policyVersion: number
  timestamp: number
  preferences: { analytics: boolean; marketing: boolean }
  confirmations: { age: boolean; terms: boolean }
}
