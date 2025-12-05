// 排行榜路由
const express = require('express');
const router = express.Router();
const LeaderboardController = require('../controllers/leaderboardController');
const { authenticate } = require('../config/authMiddleware');

// 开始游戏会话（生成session_id）
router.post('/start-session', authenticate, LeaderboardController.startSession);

// 提交分数（需要认证）
router.post('/submit', authenticate, LeaderboardController.submitScore);

// 获取排行榜数据
router.get('/', LeaderboardController.getLeaderboard);

// 获取用户的最佳分数
router.get('/best-score/:id', LeaderboardController.getUserBestScore);

// 获取用户的排名
router.get('/rank/:id', LeaderboardController.getUserRank);

// 清除排行榜数据（需要管理员权限）
router.delete('/', authenticate, LeaderboardController.clearLeaderboard);

module.exports = router;
