const crypto = require('crypto')

const decryptData = (encryptedData, iv, sessionKey, appid) => {
    // base64 decode
    const encryptedDataNew = Buffer.from(encryptedData, 'base64')
    const sessionKeyNew = Buffer.from(sessionKey, 'base64')
    const ivNew = Buffer.from(iv, 'base64')

    let decoded = ''
    try {
        const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyNew, ivNew)
        decipher.setAutoPadding(true) // 设置自动 padding 为 true，删除填充补位
        decoded = decipher.update(encryptedDataNew, 'binary', 'utf8')
        decoded += decipher.final('utf8')
        decoded = JSON.parse(decoded)
    } catch (error) {
        throw new Error('Illegal Buffer', error)
    }
    // 解密后的用户数据中会有一个 watermark 属性，这个属性中包含这个小程序的 appid 和时间戳
    if (decoded.watermark.appid !== appid) {
        throw new Error('Illegal Buffer')
    }
    return decoded
}

module.exports = decryptData
