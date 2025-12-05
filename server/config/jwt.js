// JWT配置和工具
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT配置
const jwtConfig = {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
};

class JWT {
    // 生成访问令牌
    static generateAccessToken(user) {
        return jwt.sign(
            { id: user.id, username: user.username, is_admin: user.is_admin },
            jwtConfig.secret,
            { expiresIn: jwtConfig.accessExpiry }
        );
    }
    
    // 生成刷新令牌
    static generateRefreshToken(user) {
        return jwt.sign(
            { id: user.id },
            jwtConfig.secret,
            { expiresIn: jwtConfig.refreshExpiry }
        );
    }
    
    // 验证令牌
    static verifyToken(token) {
        try {
            return jwt.verify(token, jwtConfig.secret);
        } catch (error) {
            throw error;
        }
    }
    
    // 解码令牌（不验证）
    static decodeToken(token) {
        return jwt.decode(token);
    }
}

module.exports = JWT;
