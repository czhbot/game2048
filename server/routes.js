// 合并后的路由文件
const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('./config/authMiddleware');

// 控制器
const AuthController = require('./controllers/authController');
const UserController = require('./controllers/userController');
const LeaderboardController = require('./controllers/leaderboardController');

// API 路由前缀
const apiRouter = express.Router();

// 认证路由
apiRouter.post('/auth/register', AuthController.register);
apiRouter.post('/auth/login', AuthController.login);
apiRouter.post('/auth/refresh-token', AuthController.refreshToken);
apiRouter.post('/auth/logout', AuthController.logout);
apiRouter.get('/auth/me', authenticate, AuthController.getCurrentUser);

// 用户路由
apiRouter.get('/users/:id', authenticate, UserController.getUserInfo);
apiRouter.get('/users/me/best-score', authenticate, UserController.getCurrentUserBestScore);
apiRouter.get('/users/me/scores', authenticate, UserController.getCurrentUserScores);
apiRouter.get('/users', authenticate, UserController.getAllUsers);

// 排行榜路由
apiRouter.post('/leaderboard/start-session', authenticate, LeaderboardController.startSession);
apiRouter.post('/leaderboard/submit', authenticate, LeaderboardController.submitScore);
apiRouter.get('/leaderboard', LeaderboardController.getLeaderboard);
apiRouter.get('/leaderboard/best-score/:id', LeaderboardController.getUserBestScore);
apiRouter.get('/leaderboard/rank/:id', LeaderboardController.getUserRank);
apiRouter.delete('/leaderboard', authenticate, LeaderboardController.clearLeaderboard);

// 主应用使用 API 路由
router.use('/api', apiRouter);

module.exports = router;