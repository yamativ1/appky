// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

const COOKIE_NAME = 'event_auth'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl

  // 1) QRのURLに ?t= が付いていたら検証してCookie発行 → パラメータを消してリダイレクト
  const token = url.searchParams.get('t')
  if (token && await verify(token)) {
    const clean = new URL(url.href)
    clean.searchParams.delete('t')
    const res = NextResponse.redirect(clean)
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7// 1week
    })
    return res
  }

  // 2) 既にCookieがあれば通す
  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (cookie && await verify(cookie)) return NextResponse.next()

  // 3) 誰でも見せてよいページを許可（必要に応じて調整）
  if (['/access-denied'].some(p => url.pathname.startsWith(p))) return NextResponse.next()

  // 4) ここまでで通らない場合は拒否
  const deny = new URL('/access-denied', req.url)
  return NextResponse.redirect(deny)
}

async function verify(token: string) {
  try {
    const [payloadB64, sigB64] = token.split('.')
    if (!payloadB64 || !sigB64) return false

    const payloadJson = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)))
    if (typeof payloadJson.exp !== 'number' || Date.now() > payloadJson.exp) return false

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(process.env.EVENT_TOKEN_SECRET || ''),
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

    return !!ok
  } catch {
    return false
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
