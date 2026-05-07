import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  const checks: Record<string, string> = {
    SUPABASE_URL:              process.env.SUPABASE_URL              ? 'OK' : 'FALTA',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'FALTA',
    NEXT_PUBLIC_SUPABASE_URL:  process.env.NEXT_PUBLIC_SUPABASE_URL  ? 'OK' : 'FALTA',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'FALTA',
    RESEND_API_KEY:            process.env.RESEND_API_KEY            ? 'OK' : 'FALTA',
  }

  let dbStatus = 'OK'
  let dbError  = ''
  let ideasCount = 0
  try {
    const { data, error, count } = await supabase
      .from('ideas')
      .select('id', { count: 'exact', head: false })
      .limit(1)
    if (error) {
      dbStatus = 'ERROR'
      dbError  = error.message
    } else {
      ideasCount = count ?? (data?.length ?? 0)
    }
  } catch (err) {
    dbStatus = 'EXCEPCION'
    dbError  = (err as Error).message
  }

  const allOk = Object.values(checks).every(v => v === 'OK') && dbStatus === 'OK'

  return NextResponse.json({
    ok: allOk,
    env: checks,
    db: { status: dbStatus, ideasCount, ...(dbError ? { error: dbError } : {}) },
  }, { status: allOk ? 200 : 500 })
}
