// 排行榜控制器
const crypto = require('crypto');
const Leaderboard = require('../models/leaderboardModel');
const { getStandardBeijingTime } = require('../config/ntp-client');

class LeaderboardController {
    // 开始游戏会话
    static async startSession(req, res) {
        try {
            // 生成安全的session_id
            const sessionId = crypto.randomUUID();
            
            res.json({
                message: '游戏会话创建成功',
                session_id: sessionId
            });
        } catch (error) {
            console.error('创建游戏会话失败:', error);
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 提交分数
    static async submitScore(req, res) {
        try {
            const { score, sessionId } = req.body;
            
            // 验证输入
            if (!score || score <= 0) {
                return res.status(400).json({ message: '分数必须是正数' });
            }
            
            if (!sessionId) {
                return res.status(400).json({ message: '缺少游戏会话ID' });
            }
            
            // 获取标准北京时间
            const now = await getStandardBeijingTime();
            
            // 保存分数记录，传递sessionId和当前时间
            const result = await Leaderboard.saveScore(req.user.id, score, sessionId, now);
            
            // 获取用户的最佳分数
            const bestScore = await Leaderboard.getUserBestScore(req.user.id);
            
            res.json({
                message: result.inserted || result.updated ? '分数提交成功' : '分数未更新',
                score_record: result.record,
                best_score: bestScore,
                inserted: result.inserted,
                updated: result.updated
            });
        } catch (error) {
            console.error('提交分数失败:', error);
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 获取排行榜数据
    static async getLeaderboard(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const leaderboard = await Leaderboard.getTopScores(limit);
            
            res.json({
                leaderboard: leaderboard,
                count: leaderboard.length
            });
        } catch (error) {
            console.error('获取排行榜数据失败:', error);
            res.status(500).json({ 
                message: '获取排行榜数据失败',
                leaderboard: [],
                count: 0
            });
        }
    }
    
    // 获取用户的最佳分数
    static async getUserBestScore(req, res) {
        try {
            const userId = req.params.id;
            const bestScore = await Leaderboard.getUserBestScore(userId);
            
            res.json({
                best_score: bestScore
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 获取用户的排名
    static async getUserRank(req, res) {
        try {
            const userId = req.params.id;
            const rank = await Leaderboard.getUserRank(userId);
            
            res.json({
                rank: rank
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
    
    // 清除排行榜数据（管理员功能）
    static async clearLeaderboard(req, res) {
        try {
            // 检查管理员权限
            if (!req.user.is_admin) {
                return res.status(403).json({ message: '没有权限执行此操作' });
            }
            
            const affectedRows = await Leaderboard.clear();
            
            res.json({
                message: '排行榜数据已清除',
                affected_rows: affectedRows
            });
        } catch (error) {
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
}

module.exports = LeaderboardController;
