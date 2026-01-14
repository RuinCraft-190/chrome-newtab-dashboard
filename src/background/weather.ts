import { SignJWT, importPKCS8 } from 'jose'

interface QWeatherJWTParams {
  apiId: string
  privateKey: string
  exp?: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * 生成和风天气 JWT Token (在 background 中运行)
 */
export async function generateQWeatherToken(params: QWeatherJWTParams): Promise<string> {
  const { apiId, privateKey, exp = 3600 } = params

  // 转换为 PEM 格式（如果需要）
  const pemKey = privateKey.includes('BEGIN')
    ? privateKey
    : `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`

  // 导入私钥
  const privateKeyObj = await importPKCS8(pemKey, 'Ed25519')

  // 生成 JWT
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'EdDSA', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(apiId)
    .setExpirationTime(Math.floor(Date.now() / 1000) + exp)
    .sign(privateKeyObj)

  return token
}

/**
 * 获取或生成 JWT Token（带缓存）
 */
export async function getQWeatherToken(apiId: string, privateKey: string): Promise<string> {
  // 检查缓存
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  // 生成新 token
  const token = await generateQWeatherToken({ apiId, privateKey })

  // 缓存 token（提前5分钟刷新）
  cachedToken = {
    token: `Bearer ${token}`,
    expiresAt: Date.now() + 30 * 60 * 1000
  }

  return cachedToken.token
}
