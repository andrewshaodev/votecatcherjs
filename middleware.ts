import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Check allowed hosts
  const host = request.headers.get('host')
  const allowedHosts = ['demo.votecatcher.org', 'localhost:3000', 'localhost']
  
  if (!host || !allowedHosts.includes(host)) {
    return NextResponse.json({ error: 'Unauthorized host' }, { status: 403 })
  }

  // update user's auth session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}