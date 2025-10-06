// scripts/mint-token.ts
import { createHmac, randomBytes } from 'crypto'

const BASE_URL = process.env.BASE_URL || 'https://appky.vercel.app'
const SECRET = process.env.EVENT_TOKEN_SECRET || ''
const HOURS = Number(process.env.HOURS || '6')

if (!SECRET) {
  const suggestion = randomBytes(32).toString('hex')
  console.error('ERROR: EVENT_TOKEN_SECRET が未設定です。例：')
  console.error(`$env:EVENT_TOKEN_SECRET = "${suggestion}"`)
  process.exit(1)
}

const exp = Date.now() + HOURS * 60 * 60 * 1000  // ここは “×24×7” を入れない
const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url')
const sig = createHmac('sha256', SECRET).update(payload).digest('base64url')
const token = `${payload}.${sig}`

console.log(`${BASE_URL}?t=${token}`)
