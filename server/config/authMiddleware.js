// JWT认证中间件
const JWT = require('./jwt');
const User = require('../models/userModel');

// 认证中间件
async function authenticate(req, res, next) {
    try {
        // 从请求头获取令牌
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: '未提供认证令牌' });
        }
        
        // 验证令牌
        const decoded = JWT.verifyToken(token);
        
        // 查找用户
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: '无效的认证令牌' });
        }
        
        // 将用户信息添加到请求对象
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: '认证令牌已过期' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: '无效的认证令牌' });
        } else {
            return res.status(500).json({ message: '服务器内部错误' });
        }
    }
}

// 管理员权限中间件
function authorizeAdmin(req, res, next) {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ message: '没有权限执行此操作' });
    }
    next();
}

module.exports = {
    authenticate,
    authorizeAdmin
};
