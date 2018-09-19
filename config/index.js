const { env } = process

module.exports = {
  host: env.host,
  port: env.port,
  jwtSecret: env.JWT_SECRET,
  wxAppid: env.WX_APPID,
  wxSecret: env.WX_SECRET
}
