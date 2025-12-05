// 用户认证路由
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../config/authMiddleware');

// 注册路由
router.post('/register', AuthController.register);

// 登录路由
router.post('/login', AuthController.login);

// 刷新令牌路由
router.post('/refresh-token', AuthController.refreshToken);

// 退出路由
router.post('/logout', AuthController.logout);

// 获取当前用户信息路由（需要认证）
router.get('/me', authenticate, AuthController.getCurrentUser);

module.exports = router;
