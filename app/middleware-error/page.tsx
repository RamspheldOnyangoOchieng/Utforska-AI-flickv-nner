import React from 'react'

export const dynamic = 'force-dynamic'

export default function MiddlewareErrorPage({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined }}) {
  const code = searchParams.code || 'UNKNOWN'
  const trace = searchParams.trace || 'n/a'
  return (
    <div style={{display:'flex',minHeight:'100vh',alignItems:'center',justifyContent:'center',padding:32}}>
      <div style={{maxWidth:560,fontFamily:'sans-serif'}}>
        <h1 style={{fontSize:'1.5rem',marginBottom:12}}>Middleware Blocked Request</h1>
        <p style={{marginBottom:8}}>The edge middleware prevented this request from proceeding.</p>
        <ul style={{margin:'12px 0',paddingLeft:20}}>
          <li><strong>Code:</strong> {code}</li>
          <li><strong>Trace ID:</strong> {trace}</li>
        </ul>
        <p style={{fontSize:'0.875rem',opacity:0.8}}>If this is unexpected, ensure you are logged in, your profile has is_admin=true when accessing /admin routes, and required Supabase environment variables are set on the deployment (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).</p>
        <a href="/" style={{color:'#2563eb',textDecoration:'underline'}}>Go home</a>
      </div>
    </div>
  )
}
