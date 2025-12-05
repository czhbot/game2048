// 用户认证控制器
const User = require('../models/userModel');
const JWT = require('../config/jwt');
const { getStandardBeijingTime } = require('../config/ntp-client');

class AuthController {
    // 计算用户名长度（中文字符计为2，英文字符计为1）
    static calculateUsernameLength(username) {
        let length = 0;
        for (let i = 0; i < username.length; i++) {
            // 检查是否为中文字符（Unicode范围）
            if (username.charCodeAt(i) > 127) {
                length += 2;
            } else {
                length += 1;
            }
        }
        return length;
    }

    // 用户注册
    static async register(req, res) {
        try {
            const { username, password } = req.body;
            
            // 验证输入
            if (!username || !password) {
                return res.status(400).json({ message: '用户名和密码不能为空' });
            }
            
            // 验证用户名长度
            if (username.length < 3) {
                return res.status(400).json({ message: '用户名长度至少为3个字符' });
            }
            
            const usernameLength = AuthController.calculateUsernameLength(username);
            if (usernameLength > 12) {
                return res.status(400).json({ message: '用户名长度超过限制（中文计2字符，英文计1字符，总长度不得超过12字符长度单位）' });
            }
            
            if (password.length < 8) {
                return res.status(400).json({ message: '密码长度至少为8个字符' });
            }
            
            // 获取标准北京时间
            const now = await getStandardBeijingTime();
            
            // 创建用户，传递当前时间
            const user = await User.create(username, password, now);
            
            // 生成令牌
            const accessToken = JWT.generateAccessToken(user);
            const refreshToken = JWT.generateRefreshToken(user);
            
            // 配置cookie选项
            const isProd = process.env.NODE_ENV === 'production';
            
            // 将刷新令牌存储在HttpOnly cookie中
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isProd,                // prod = https
                sameSite: isProd ? 'None' : 'Lax',
            });
            
            // 返回用户信息和访问令牌
            res.status(201).json({
                message: '注册成功',
                user: {
                    id: user.id,
                    username: user.username,
                    is_admin: user.is_admin
                },
                accessToken
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    
    // 用户登录
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            
            // 验证输入
            if (!username || !password) {
                return res.status(400).json({ message: '用户名和密码不能为空' });
            }
            
            // 查找用户
            const user = await User.findByUsername(username);
            
            if (!user) {
                return res.status(401).json({ message: '用户名或密码错误' });
            }
            
            // 验证密码
            const isPasswordValid = await User.verifyPassword(user, password);
            
            if (!isPasswordValid) {
                return res.status(401).json({ message: '用户名或密码错误' });
            }
            
            // 生成令牌
            const accessToken = JWT.generateAccessToken(user);
            const refreshToken = JWT.generateRefreshToken(user);
            
            // 配置cookie选项
            const isProd = process.env.NODE_ENV === 'production';
            
            // 将刷新令牌存储在HttpOnly cookie中
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isProd,                // prod = https
                sameSite: isProd ? 'None' : 'Lax',
            });
            
            // 返回用户信息和访问令牌
            res.json({
                message: '登录成功',
                user: {
                    id: user.id,
                    username: user.username,
                    is_admin: user.is_admin
                },
                accessToken
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 刷新令牌
    static async refreshToken(req, res) {
        try {
            // 从cookie中获取刷新令牌
            const refreshToken = req.cookies.refreshToken;
            
            if (!refreshToken) {
                return res.status(401).json({ message: '未提供刷新令牌' });
            }
            
            // 验证刷新令牌
            const decoded = JWT.verifyToken(refreshToken);
            
            // 查找用户
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return res.status(401).json({ message: '无效的刷新令牌' });
            }
            
            // 生成新的访问令牌
            const accessToken = JWT.generateAccessToken(user);
            
            res.json({
                message: '令牌刷新成功',
                accessToken
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: '刷新令牌已过期' });
            } else {
                return res.status(401).json({ message: '无效的刷新令牌' });
            }
        }
    }
    
    // 用户退出
    static async logout(req, res) {
        try {
            // 配置cookie选项
            const isProd = process.env.NODE_ENV === 'production';
            
            // 清除刷新令牌cookie - 使用与设置时相同的参数
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: isProd,                // 与登录/注册相同
                sameSite: isProd ? 'None' : 'Lax', // 与登录/注册相同
            });
            
            res.json({ message: '退出成功' });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 获取当前用户信息
    static async getCurrentUser(req, res) {
        try {
            res.json({
                user: {
                    id: req.user.id,
                    username: req.user.username,
                    is_admin: req.user.is_admin
                }
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
}

module.exports = AuthController;
