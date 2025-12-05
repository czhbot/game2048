// 用户数据路由
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate } = require('../config/authMiddleware');

// 获取用户信息（需要认证）
router.get('/:id', authenticate, UserController.getUserInfo);

// 获取当前用户的最佳分数（需要认证）
router.get('/me/best-score', authenticate, UserController.getCurrentUserBestScore);

// 获取当前用户的所有分数记录（需要认证）
router.get('/me/scores', authenticate, UserController.getCurrentUserScores);

// 获取所有用户（需要管理员权限）
router.get('/', authenticate, UserController.getAllUsers);

module.exports = router;
