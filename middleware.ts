// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  // 静的アセット等を除外して全ルートに適用
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

const COOKIE_NAME = 'event_auth'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const token = url.searchParams.get('t')

  // === 開発用バイパス ===
  // production 以外（= npm run dev 等）は認証をスキップ。
  // ただし、ローカルでもゲートを試したい時は FORCE_AUTH=1 を一時的に設定。
  const isProd = process.env.NODE_ENV === 'production'
  const forceAuth = process.env.FORCE_AUTH === '1'
  if (!isProd && !forceAuth) {
    return NextResponse.next()
  }
  // === ここから先は従来の保護ロジック ===

  // 1) QR の ?t= を受けたら検証 → Cookie を付けつつ rewrite で 200 を返す
  if (token) {
    const payload = await verifyAndGetPayload(token)
    if (payload) {
      const res = NextResponse.rewrite(new URL('/', req.url))
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProd,      // 本番のみ Secure（ローカルHTTPでは自動でfalse）
        sameSite: 'lax',     // 互換性重視
        path: '/',
        maxAge: Math.max(1, Math.floor((payload.exp - Date.now()) / 1000)) // exp に合わせる
      })
      return res
    }
  }

  // 2) Cookie が有効なら通す
  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (cookie) {
    const payload = await verifyAndGetPayload(cookie)
    if (payload) return NextResponse.next()
  }

  // 3) 例外（拒否ページ自体は表示）
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
