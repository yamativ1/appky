// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

const COOKIE_NAME = 'event_auth'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const token = url.searchParams.get('t')

  // 1) ?t= があれば検証→Cookie発行→クリーンURLへ
  if (token) {
    const payload = await verifyAndGetPayload(token)
    if (payload) {
      const clean = new URL(url.href)
      clean.searchParams.delete('t')

      const res = NextResponse.redirect(clean)
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: Math.max(1, Math.floor((payload.exp - Date.now()) / 1000))
      })
      return res
    }
  }

  // 2) 既存Cookieが有効なら通す
  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (cookie) {
    const payload = await verifyAndGetPayload(cookie)
    if (payload) return NextResponse.next()
  }

  // 3) 公開ページ（必要なら追加）
  if (url.pathname.startsWith('/access-denied')) return NextResponse.next()

  // 4) それ以外は拒否
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
  } catch {
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
