// 排行榜模型
const safeQuery = require('../config/safeQuery');

class Leaderboard {
    // 保存分数记录
    static async saveScore(userId, score, sessionId, now) {
        try {
            // 使用 INSERT ... ON DUPLICATE KEY UPDATE 确保同一用户同一会话只保存最高分
            // 使用传入的now参数作为created_at和updated_at的值
            const [result] = await safeQuery(
                `INSERT INTO leaderboard (user_id, session_id, score, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 score = GREATEST(score, VALUES(score)),
                 updated_at = ?`,
                [userId, sessionId, score, now, now, now]
            );
            
            let inserted = false;
            let updated = false;
            
            // 判断是插入还是更新
            if (result.affectedRows === 1) {
                // 插入了新记录
                inserted = true;
            } else {
                // 更新了现有记录
                updated = true;
            }
            
            // 获取完整的记录信息
            const [updatedRecords] = await safeQuery(
                `SELECT id, user_id, session_id, score, created_at, updated_at 
                 FROM leaderboard 
                 WHERE user_id = ? AND session_id = ?`,
                [userId, sessionId]
            );
            
            let record = updatedRecords[0];
            
            // 将created_at和updated_at转换为时间戳
            if (record) {
                record = {
                    id: record.id,
                    user_id: record.user_id,
                    session_id: record.session_id,
                    score: record.score,
                    created_at_timestamp: new Date(record.created_at).getTime(),
                    updated_at_timestamp: new Date(record.updated_at).getTime()
                };
            }
            
            // 只保留每个用户最近10条记录
            await safeQuery(
                `DELETE FROM leaderboard 
                 WHERE id NOT IN ( 
                     SELECT id FROM ( 
                         SELECT id FROM leaderboard 
                         WHERE user_id = ? 
                         ORDER BY created_at DESC 
                         LIMIT 10 
                     ) AS recent_scores 
                 ) AND user_id = ?`,
                [userId, userId]
            );
            
            return {
                inserted,
                updated,
                record
            };
        } catch (error) {
            console.error('保存分数记录失败:', error);
            throw error;
        }
    }
    
    // 获取排行榜数据（前10名）
    static async getTopScores(limit = 10) {
        try {
            // 确保limit是整数
            const limitInt = parseInt(limit) || 10;
            // 简化查询，直接获取所有记录，按分数降序排序
            // 由于unique(user_id, session_id)约束，每个记录代表一个唯一游戏会话的最高分
            const [scores] = await safeQuery(
                `SELECT l.id, l.user_id, u.username, l.score, l.created_at 
                 FROM leaderboard l 
                 JOIN users u ON l.user_id = u.id 
                 ORDER BY l.score DESC, l.created_at ASC 
                 LIMIT ?`,
                [limitInt]
            );
            
            // 将created_at转换为created_at_timestamp
            return scores.map(score => {
                return {
                    id: score.id,
                    user_id: score.user_id,
                    username: score.username,
                    score: score.score,
                    created_at_timestamp: new Date(score.created_at).getTime()
                };
            });
        } catch (error) {
            console.error('获取排行榜数据失败:', error);
            // 返回空数组作为默认值
            return [];
        }
    }
    
    // 获取用户的最佳分数
    static async getUserBestScore(userId) {
        try {
            const [result] = await safeQuery(
                `SELECT MAX(score) as best_score 
                 FROM leaderboard 
                 WHERE user_id = ?`,
                [userId]
            );
            
            return result[0].best_score || 0;
        } catch (error) {
            console.error('获取用户最佳分数失败:', error);
            return 0;
        }
    }
    
    // 获取用户的所有分数记录
    static async getUserScores(userId) {
        try {
            const [scores] = await safeQuery(
                `SELECT id, score, created_at 
                 FROM leaderboard 
                 WHERE user_id = ? 
                 ORDER BY score DESC, created_at ASC`,
                [userId]
            );
            
            // 将created_at转换为created_at_timestamp
            return scores.map(score => {
                return {
                    id: score.id,
                    score: score.score,
                    created_at_timestamp: new Date(score.created_at).getTime()
                };
            });
        } catch (error) {
            console.error('获取用户分数记录失败:', error);
            // 返回空数组作为默认值
            return [];
        }
    }
    
    // 获取用户的排名
    static async getUserRank(userId) {
        try {
            // 先获取用户的最佳分数
            const [bestScoreResult] = await safeQuery(
                `SELECT MAX(score) as best_score FROM leaderboard WHERE user_id = ?`,
                [userId]
            );
            
            const bestScore = bestScoreResult[0].best_score || 0;
            
            // 计算排名
            const [result] = await safeQuery(
                `SELECT COUNT(*) + 1 as rank FROM leaderboard WHERE score > ?`,
                [bestScore]
            );
            
            return result[0].rank;
        } catch (error) {
            console.error('获取用户排名失败:', error);
            return 0;
        }
    }
    
    // 清除排行榜数据（管理员功能）
    static async clear() {
        try {
            const [result] = await safeQuery(
                'DELETE FROM leaderboard',
                []
            );
            
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Leaderboard;
