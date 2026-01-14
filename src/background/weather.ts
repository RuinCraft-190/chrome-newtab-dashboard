import { SignJWT, importPKCS8 } from 'jose'

interface QWeatherJWTParams {
  keyId: string      // 凭据ID (kid)
  projectId: string  // 项目ID (sub)
  privateKey: string
  exp?: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * 生成和风天气 JWT Token (在 background 中运行)
 */
export async function generateQWeatherToken(params: QWeatherJWTParams): Promise<string> {
  const { keyId, projectId, privateKey, exp = 3600 } = params

  console.log('[JWT] Generating token with:', { keyId, projectId })

  // 转换为 PEM 格式（如果需要）
  const pemKey = privateKey.includes('BEGIN')
    ? privateKey
    : `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`

  // 导入私钥
  const privateKeyObj = await importPKCS8(pemKey, 'Ed25519')

  // 当前时间，减去30秒防止时间误差
  const now = Math.floor(Date.now() / 1000) - 30

  // 生成 JWT
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'EdDSA', kid: keyId })
    .setSubject(projectId)
    .setIssuedAt(now)
    .setExpirationTime(now + exp)
    .sign(privateKeyObj)

  console.log('[JWT] Token generated:', token.substring(0, 50) + '...')

  return token
}

/**
 * 获取或生成 JWT Token（带缓存）
 */
export async function getQWeatherToken(keyId: string, projectId: string, privateKey: string): Promise<string> {
  // 检查缓存
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log('[JWT] Using cached token')
    return cachedToken.token
  }

  // 生成新 token
  const token = await generateQWeatherToken({ keyId, projectId, privateKey })

  // 缓存 token（提前5分钟刷新）
  cachedToken = {
    token: `Bearer ${token}`,
    expiresAt: Date.now() + 30 * 60 * 1000
  }

  console.log('[JWT] New token cached')
  return cachedToken.token
}
