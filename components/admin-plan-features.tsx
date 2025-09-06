"use client"
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-context'
import { Plus, Save, X, Trash, ArrowUp, ArrowDown } from 'lucide-react'

interface PlanFeature {
  id?: string
  feature_key: string
  feature_label_en: string
  feature_label_sv: string
  free_value_en: string
  free_value_sv: string
  premium_value_en: string
  premium_value_sv: string
  sort_order: number
  active: boolean
}

export function AdminPlanFeatures() {
  const { user } = useAuth()
  // Supabase user type may not expose user_metadata strongly; cast to any for role check
  const isAdmin = (user as any)?.user_metadata?.role === 'admin'
  const [features, setFeatures] = useState<PlanFeature[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    fetch('/api/admin/plan-features')
      .then(r => r.json())
      .then(d => Array.isArray(d) && setFeatures(d))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const addFeature = () => {
    setFeatures(prev => [...prev, {
      feature_key: `feature_${Date.now()}`,
      feature_label_en: 'New Feature',
      feature_label_sv: 'Ny funktion',
      free_value_en: 'Value',
      free_value_sv: 'Värde',
      premium_value_en: 'Premium',
      premium_value_sv: 'Premium',
      sort_order: prev.length,
      active: true,
    }])
  }

  const updateFeature = (idx: number, patch: Partial<PlanFeature>) => {
    setFeatures(f => f.map((feat, i) => i === idx ? { ...feat, ...patch } : feat))
  }

  const removeFeature = (idx: number) => {
    const feat = features[idx]
    if (feat.id) fetch(`/api/admin/plan-features?id=${feat.id}`, { method: 'DELETE' })
    setFeatures(f => f.filter((_, i) => i !== idx).map((f2, i2) => ({ ...f2, sort_order: i2 })))
  }

  const move = (idx: number, dir: -1 | 1) => {
    setFeatures(f => {
      const next = [...f]
      const target = idx + dir
      if (target < 0 || target >= f.length) return f
      const tmp = next[idx]
      next[idx] = next[target]
      next[target] = tmp
      return next.map((feat, i) => ({ ...feat, sort_order: i }))
    })
  }

  const persistAll = async () => {
    setSaving(true)
    for (const feat of features) {
      const method = feat.id ? 'PUT' : 'POST'
      await fetch('/api/admin/plan-features', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(feat) })
    }
    setSaving(false)
  }

  if (!isAdmin) return null

  return (
    <div className="space-y-4 border border-border rounded-lg p-4 bg-card/50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Plan Features</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addFeature}><Plus className="h-4 w-4 mr-1" />Add</Button>
          <Button size="sm" disabled={saving} onClick={persistAll}><Save className="h-4 w-4 mr-1" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>
      </div>
      {loading && <p className="text-sm opacity-70">Loading...</p>}
      <div className="space-y-6">
        {features.map((feat, idx) => (
          <div key={feat.id || feat.feature_key} className="rounded border border-border p-3 space-y-3 bg-background/40">
            <div className="flex items-center gap-2">
              <Input value={feat.feature_key} onChange={e => updateFeature(idx, { feature_key: e.target.value })} className="font-mono text-xs" />
              <Button size="icon" variant="ghost" onClick={() => move(idx, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => move(idx, 1)}><ArrowDown className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => removeFeature(idx)}><Trash className="h-4 w-4 text-destructive" /></Button>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <Input placeholder="Label EN" value={feat.feature_label_en} onChange={e => updateFeature(idx, { feature_label_en: e.target.value })} />
              <Input placeholder="Label SV" value={feat.feature_label_sv} onChange={e => updateFeature(idx, { feature_label_sv: e.target.value })} />
              <Input placeholder="Free EN" value={feat.free_value_en} onChange={e => updateFeature(idx, { free_value_en: e.target.value })} />
              <Input placeholder="Free SV" value={feat.free_value_sv} onChange={e => updateFeature(idx, { free_value_sv: e.target.value })} />
              <Input placeholder="Premium EN" value={feat.premium_value_en} onChange={e => updateFeature(idx, { premium_value_en: e.target.value })} />
              <Input placeholder="Premium SV" value={feat.premium_value_sv} onChange={e => updateFeature(idx, { premium_value_sv: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={feat.active} onChange={e => updateFeature(idx, { active: e.target.checked })} /> Active
            </label>
          </div>
        ))}
        {!features.length && !loading && <p className="text-sm opacity-60">No features yet.</p>}
      </div>
    </div>
  )
}
