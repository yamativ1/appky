// scripts/mint-token.ts
import { createHmac, randomBytes } from 'crypto'

// 環境変数から設定（未指定時のデフォルトも用意）
const BASE_URL = process.env.BASE_URL || 'https://appky.vercel.app/'
const SECRET = process.env.EVENT_TOKEN_SECRET || ''
const HOURS = Number(process.env.HOURS || 1) // 既定1時間

if (!SECRET) {
  // 初回の人向け: シークレット未設定なら勝手に提案して終了
  const suggestion = randomBytes(32).toString('hex')
  console.error('ERROR: EVENT_TOKEN_SECRET が未設定です。例：')
  console.error(`$env:EVENT_TOKEN_SECRET = "${suggestion}"`)
  process.exit(1)
}

const exp = Date.now() + HOURS * 60 * 60 * 1000// 有効期限(ミリ秒)

// 署名付きトークン: payload.exp を base64url、HMAC-SHA256 で署名
const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url')
const sig = createHmac('sha256', SECRET).update(payload).digest('base64url')
const token = `${payload}.${sig}`

const url = `${BASE_URL}?t=${token}`
console.log(url)
