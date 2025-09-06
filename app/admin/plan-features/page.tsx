"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-context'

interface PlanFeatureRow {
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

export default function PlanFeaturesAdmin() {
  const supabase = createClient()
  const { user } = useAuth()
  const [rows, setRows] = useState<PlanFeatureRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase.from('plan_features').select('*').order('sort_order')
      if (data) setRows(data as any)
      setLoading(false)
    }
    load()
  }, [supabase])

  if (!user) return <div className="p-8">Login required</div>
  // Basic admin gate client-side; production should enforce server route protection
  // @ts-ignore
  if (!user?.user_metadata?.role && !user?.is_admin) return <div className="p-8">Not authorized</div>

  const addRow = () => {
    setRows(r => [...r, { feature_key: `feature_${Date.now()}`, feature_label_en: 'Label EN', feature_label_sv: 'Label SV', free_value_en: '-', free_value_sv: '-', premium_value_en: '-', premium_value_sv: '-', sort_order: rows.length * 10, active: true }])
  }

  const updateRow = (idx:number, patch: Partial<PlanFeatureRow>) => {
    setRows(r => r.map((row,i)=> i===idx ? { ...row, ...patch } : row))
  }

  const removeRow = (idx:number) => {
    const row = rows[idx]
    if (row.id) {
      supabase.from('plan_features').delete().eq('id', row.id)
    }
    setRows(r => r.filter((_,i)=> i!==idx))
  }

  const saveAll = async () => {
    setSaving(true)
    for (const row of rows) {
      if (row.id) {
        await supabase.from('plan_features').update({ ...row }).eq('id', row.id)
      } else {
        const { data } = await supabase.from('plan_features').insert({ ...row }).select().single()
        if (data) {
          setRows(r => r.map(rr => (rr === row ? (data as any) : rr)))
        }
      }
    }
    setSaving(false)
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Plan Features</h1>
      <div className="flex gap-3">
        <Button onClick={addRow} variant="outline">Add Feature</Button>
        <Button onClick={saveAll} disabled={saving}>{saving ? 'Saving...' : 'Save All'}</Button>
      </div>
      {loading && <div>Loading...</div>}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Key</th>
              <th className="p-2 text-left">Label EN</th>
              <th className="p-2 text-left">Label SV</th>
              <th className="p-2 text-left">Free EN</th>
              <th className="p-2 text-left">Free SV</th>
              <th className="p-2 text-left">Premium EN</th>
              <th className="p-2 text-left">Premium SV</th>
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">Active</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id || row.feature_key} className="border-t">
                <td className="p-2"><input className="bg-background border px-1 rounded" value={row.feature_key} onChange={e=>updateRow(idx,{ feature_key: e.target.value })} /></td>
                <td className="p-2"><input className="bg-background border px-1 rounded" value={row.feature_label_en} onChange={e=>updateRow(idx,{ feature_label_en: e.target.value })} /></td>
                <td className="p-2"><input className="bg-background border px-1 rounded" value={row.feature_label_sv} onChange={e=>updateRow(idx,{ feature_label_sv: e.target.value })} /></td>
                <td className="p-2"><input className="bg-background border px-1 rounded" value={row.free_value_en} onChange={e=>updateRow(idx,{ free_value_en: e.target.value })} /></td>
                <td className="p-2"><input className="bg-background border px-1 rounded" value={row.free_value_sv} onChange={e=>updateRow(idx,{ free_value_sv: e.target.value })} /></td>
                <td className="p-2"><input className="bg-background border px-1 rounded" value={row.premium_value_en} onChange={e=>updateRow(idx,{ premium_value_en: e.target.value })} /></td>
                <td className="p-2"><input className="bg-background border px-1 rounded" value={row.premium_value_sv} onChange={e=>updateRow(idx,{ premium_value_sv: e.target.value })} /></td>
                <td className="p-2 w-20"><input type="number" className="bg-background border px-1 rounded w-20" value={row.sort_order} onChange={e=>updateRow(idx,{ sort_order: Number(e.target.value) })} /></td>
                <td className="p-2 text-center"><input type="checkbox" checked={row.active} onChange={e=>updateRow(idx,{ active: e.target.checked })} /></td>
                <td className="p-2"><Button variant="destructive" size="sm" onClick={()=>removeRow(idx)}>X</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Changes are persisted when you click Save All. Deleting an existing row removes it immediately.</p>
    </div>
  )
}
