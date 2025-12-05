// 用户数据控制器
const User = require('../models/userModel');
const Leaderboard = require('../models/leaderboardModel');

class UserController {
    // 获取用户信息
    static async getUserInfo(req, res) {
        try {
            const userId = req.params.id;
            
            // 检查是否是当前用户或管理员
            if (parseInt(userId) !== req.user.id && !req.user.is_admin) {
                return res.status(403).json({ message: '没有权限访问此用户信息' });
            }
            
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: '用户不存在' });
            }
            
            // 获取用户的最佳分数
            const bestScore = await Leaderboard.getUserBestScore(userId);
            
            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    is_admin: user.is_admin,
                    created_at: user.created_at,
                    best_score: bestScore
                }
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 获取当前用户的最佳分数
    static async getCurrentUserBestScore(req, res) {
        try {
            const bestScore = await Leaderboard.getUserBestScore(req.user.id);
            
            res.json({
                best_score: bestScore
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 获取当前用户的所有分数记录
    static async getCurrentUserScores(req, res) {
        try {
            const scores = await Leaderboard.getUserScores(req.user.id);
            
            res.json({
                scores: scores
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 获取所有用户（管理员功能）
    static async getAllUsers(req, res) {
        try {
            // 检查管理员权限
            if (!req.user.is_admin) {
                return res.status(403).json({ message: '没有权限执行此操作' });
            }
            
            const users = await User.getAll();
            
            // 获取每个用户的最佳分数
            const usersWithBestScore = await Promise.all(
                users.map(async user => {
                    const bestScore = await Leaderboard.getUserBestScore(user.id);
                    return {
                        ...user,
                        best_score: bestScore
                    };
                })
            );
            
            res.json({
                users: usersWithBestScore
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
}

module.exports = UserController;
