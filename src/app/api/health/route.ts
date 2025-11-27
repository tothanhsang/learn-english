import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test database connection by querying the words table
    const { error } = await supabase.from('words').select('id').limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        hint: error.hint || 'Check if migration was run'
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Database connected successfully',
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: 'Connection error',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
