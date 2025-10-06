// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

const COOKIE_NAME = 'event_auth'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const token = url.searchParams.get('t')

  // 観測ログ（Vercel: Functions → Logs に出ます）
  console.log('[mw] hasSecret:', !!process.env.EVENT_TOKEN_SECRET, 'path:', url.pathname, 'hasToken:', !!token)

  // 1) ?t= が来たら検証 → Cookie 発行 → クエリ除去リダイレクト
  if (token) {
    const payload = await verifyAndGetPayload(token)
    console.log('[mw] verify on query:', !!payload)
    if (payload) {
      const clean = new URL(url.href)
      clean.searchParams.delete('t')

      const res = NextResponse.redirect(clean)
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: Math.max(1, Math.floor((payload.exp - Date.now()) / 1000)) // exp と一致
      })
      return res
    }
  }

  // 2) Cookie が有効なら通す
  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (cookie) {
    const payload = await verifyAndGetPayload(cookie)
    console.log('[mw] verify on cookie:', !!payload)
    if (payload) return NextResponse.next()
  } else {
    console.log('[mw] cookie missing')
  }

  // 3) 公開ページの例外
  if (url.pathname.startsWith('/access-denied')) return NextResponse.next()

  // 4) 否認
  console.log('[mw] deny → /access-denied')
  return NextResponse.redirect(new URL('/access-denied', req.url))
}

async function verifyAndGetPayload(token: string): Promise<{ exp: number } | null> {
  try {
    const [payloadB64, sigB64] = token.split('.')
    if (!payloadB64 || !sigB64) return null

    const secret = process.env.EVENT_TOKEN_SECRET || ''
    if (!secret) return null

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlToBytes(sigB64),
      new TextEncoder().encode(payloadB64)
    )
    if (!ok) return null

    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)))
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null

    return payload
  } catch (e) {
    console.log('[mw] verify error')
    return null
  }
}

function b64urlToBytes(s: string) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4
  if (pad) s += '='.repeat(4 - pad)
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
