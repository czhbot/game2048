// 用户认证系统
class AuthSystem {
    constructor() {
        this.apiBaseUrl = window.apiBaseUrl || '/api';
        this.isLoggedIn = false;
    }

    init() {
        // 绑定事件
        this.bindEvents();
        // 检查自动登录状态
        this.checkAutoLogin();
        // 初始化密码强度检测
        this.initPasswordStrength();
    }



    // 计算用户名长度（中文字符计为2，英文字符计为1）
    calculateUsernameLength(username) {
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

    // 绑定事件
    bindEvents() {
        // 注册表单提交
        const registerForm = document.getElementById('registerForm').querySelector('form');
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // 登录表单提交
        const loginForm = document.getElementById('loginForm').querySelector('form');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // 切换到登录界面
        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // 切换到注册界面
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        // 切换注册密码可见性
        document.getElementById('toggleRegisterPassword').addEventListener('click', () => {
            this.togglePasswordVisibility('registerPassword');
        });

        // 切换登录密码可见性
        document.getElementById('toggleLoginPassword').addEventListener('click', () => {
            this.togglePasswordVisibility('loginPassword');
        });

        // 注册密码输入监听
        document.getElementById('registerPassword').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        // 注册用户名实时监听
        document.getElementById('registerUsername').addEventListener('input', (e) => {
            this.validateUsername(e.target.value);
        });

        // 退出登录按钮事件
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // 显示登录界面
    showLogin() {
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    }

    // 显示注册界面
    showRegister() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }

    // 切换密码可见性
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
    }

    // 初始化密码强度检测
    initPasswordStrength() {
        const strengthIndicator = document.getElementById('passwordStrength');
        strengthIndicator.textContent = '密码强度：无';
        strengthIndicator.className = 'password-strength';
    }

    // 检查密码强度
    checkPasswordStrength(password) {
        const strengthIndicator = document.getElementById('passwordStrength');
        let strength = 0;
        let strengthText = '弱';
        let strengthClass = 'weak';

        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        if (strength === 0 || strength === 1) {
            strengthText = '弱';
            strengthClass = 'weak';
        } else if (strength === 2 || strength === 3) {
            strengthText = '中';
            strengthClass = 'medium';
        } else {
            strengthText = '强';
            strengthClass = 'strong';
        }

        strengthIndicator.textContent = `密码强度：${strengthText}`;
        strengthIndicator.className = `password-strength ${strengthClass}`;
    }

    // 验证用户名（实时）
    validateUsername(username) {
        const usernameError = document.getElementById('usernameError');
        const length = this.calculateUsernameLength(username);
        
        if (username.length === 0) {
            usernameError.textContent = '';
            return true;
        }
        
        if (length > 12) {
            usernameError.textContent = `用户名长度超过限制（当前: ${length}/12字符长度单位，中文计2，英文计1）`;
            return false;
        } else if (username.length < 3) {
            usernameError.textContent = '用户名长度至少为3个字符';
            return false;
        } else {
            usernameError.textContent = '';
            return true;
        }
    }

    // 验证注册表单
    validateRegisterForm() {
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        let isValid = true;

        // 重置错误消息
        document.getElementById('usernameError').textContent = '';
        document.getElementById('passwordError').textContent = '';

        // 验证用户名
        const usernameLength = this.calculateUsernameLength(username);
        if (username.length < 3) {
            document.getElementById('usernameError').textContent = '用户名长度至少为3个字符';
            isValid = false;
        } else if (usernameLength > 12) {
            document.getElementById('usernameError').textContent = `用户名长度超过限制（当前: ${usernameLength}/12字符长度单位，中文计2，英文计1）`;
            isValid = false;
        }

        // 验证密码
        if (password.length < 8) {
            document.getElementById('passwordError').textContent = '密码长度至少为8个字符';
            isValid = false;
        } else if (password.length > 20) {
            document.getElementById('passwordError').textContent = '密码长度不能超过20个字符';
            isValid = false;
        } else {
            // 验证密码只能包含英文字母、数字、下划线和普通符号
            const passwordRegex = /^[a-zA-Z0-9_!@#$%^&*(),.?":{}|<>]+$/;
            if (!passwordRegex.test(password)) {
                document.getElementById('passwordError').textContent = '密码只能包含英文字母、数字、下划线和普通符号';
                isValid = false;
            }
        }

        return isValid;
    }

    // 验证登录表单
    validateLoginForm() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        let isValid = true;

        // 重置错误消息
        document.getElementById('loginUsernameError').textContent = '';
        document.getElementById('loginPasswordError').textContent = '';

        // 验证用户名
        if (!username) {
            document.getElementById('loginUsernameError').textContent = '请输入用户名';
            isValid = false;
        }

        // 验证密码
        if (!password) {
            document.getElementById('loginPasswordError').textContent = '请输入密码';
            isValid = false;
        }

        return isValid;
    }

    // 处理注册
    async handleRegister() {
        if (!this.validateRegisterForm()) {
            return;
        }

        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                credentials: 'include', // 包含cookie
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 检查是否勾选了自动登录
                const autoLogin = document.getElementById('autoLogin').checked;
                if (autoLogin) {
                    localStorage.setItem('autoLogin', 'true');
                } else {
                    localStorage.removeItem('autoLogin');
                }
                
                // 保存访问令牌
                this.setAccessToken(data.accessToken);
                // 登录成功，先设置登录状态
                this.isLoggedIn = true;
                // 然后更新账户信息
                this.updateAccountInfo(data.user);
                // 隐藏认证界面
                document.getElementById('authOverlay').style.display = 'none';
                
                // 检查是否已存在GameManager实例，避免重复初始化
                if (window.gameManager) {
                    // 更新游戏状态和UI组件
                    window.gameManager.updateAccountBestScore();
                    window.gameManager.renderLeaderboard();
                } else {
                    // 首次登录，创建GameManager实例
                    window.gameManager = new GameManager();
                }
            } else {
                document.getElementById('usernameError').textContent = data.message;
            }
        } catch (error) {
            console.error('注册失败:', error);
            document.getElementById('usernameError').textContent = '注册失败，请稍后重试';
        }
    }

    // 处理登录
    async handleLogin() {
        if (!this.validateLoginForm()) {
            return;
        }

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                credentials: 'include', // 包含cookie
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 检查是否勾选了自动登录
                const autoLogin = document.getElementById('loginAutoLogin').checked;
                if (autoLogin) {
                    localStorage.setItem('autoLogin', 'true');
                } else {
                    localStorage.removeItem('autoLogin');
                }
                
                // 保存访问令牌
                this.setAccessToken(data.accessToken);
                // 登录成功，先设置登录状态
                this.isLoggedIn = true;
                // 然后更新账户信息
                this.updateAccountInfo(data.user);
                // 隐藏认证界面
                document.getElementById('authOverlay').style.display = 'none';
                
                // 检查是否已存在GameManager实例，避免重复初始化
                if (window.gameManager) {
                    // 更新游戏状态和UI组件
                    window.gameManager.updateAccountBestScore();
                    window.gameManager.renderLeaderboard();
                } else {
                    // 首次登录，创建GameManager实例
                    window.gameManager = new GameManager();
                }
            } else {
                document.getElementById('loginPasswordError').textContent = data.message;
            }
        } catch (error) {
            console.error('登录失败:', error);
            document.getElementById('loginPasswordError').textContent = '登录失败，请稍后重试';
        }
    }

    // 获取当前用户信息
    async getCurrentUserInfo() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.getAccessToken()}`
                },
                credentials: 'include' // 包含cookie
            });

            if (response.ok) {
                const data = await response.json();
                this.isLoggedIn = true;
                this.updateAccountInfo(data.user);

                if (typeof window.gameManager === 'undefined') {
                    // 首次登录，创建GameManager实例
                    window.gameManager = new GameManager();
                } else {
                    // 更新游戏状态和UI组件
                    window.gameManager.updateAccountBestScore();
                    window.gameManager.renderLeaderboard();
                    // 更新清除排行榜按钮显示
                    window.gameManager.toggleClearLeaderboardButton();
                }

                return;
            } else if (response.status === 401) {
                // 令牌无效或过期，尝试刷新令牌
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // 刷新成功，再次尝试获取用户信息
                    await this.getCurrentUserInfo();
                }
            } else {
                // 其他错误，清除登录状态
                this.logout();
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            // 网络错误，尝试刷新令牌
            try {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // 刷新成功，再次尝试获取用户信息
                    await this.getCurrentUserInfo();
                } else {
                    this.logout();
                }
            } catch (refreshError) {
                console.error('刷新令牌失败:', refreshError);
                this.logout();
            }
        }
    }

    // 更新账户信息
    async updateAccountInfo(user) {
        // 🚨 未登录禁止更新账户信息
        if (!this.isLoggedIn) return;
        
        // 保存用户权限信息到localStorage
        localStorage.setItem('isAdmin', user.is_admin ? 'true' : 'false');
        
        // 更新账户信息显示
        document.getElementById('currentUsername').textContent = user.username;
        document.getElementById('accountStatus').textContent = '在线';
        
        // 获取并更新最佳分数
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/me/best-score`, {
                headers: {
                    'Authorization': `Bearer ${this.getAccessToken()}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // 更新账户信息区域的最佳分数
                document.getElementById('bestScore').textContent = data.best_score;
                
                // 更新游戏界面顶部的最佳分数
                if (typeof window.gameManager !== 'undefined' && typeof window.gameManager.updateBestScoreDisplay === 'function') {
                    window.gameManager.updateBestScoreDisplay(data.best_score);
                }
            }
        } catch (error) {
            console.error('获取最佳分数失败:', error);
        }
        
        // 更新排行榜显示
        if (typeof window.gameManager !== 'undefined' && typeof window.gameManager.renderLeaderboard === 'function') {
            window.gameManager.renderLeaderboard();
        }
    }

    // 退出登录
    async logout() {
        try {
            await fetch(`${this.apiBaseUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('退出登录失败:', error);
        }
        
        // 清除登录状态和权限信息
        this.removeAccessToken();
        localStorage.removeItem('isAdmin');
        this.isLoggedIn = false;
        
        // 更新账户信息显示
        document.getElementById('currentUsername').textContent = '未登录';
        document.getElementById('accountStatus').textContent = '离线';
        document.getElementById('bestScore').textContent = '0';
        
        // 更新清除排行榜按钮显示
        if (typeof window.gameManager !== 'undefined' && typeof window.gameManager.toggleClearLeaderboardButton === 'function') {
            window.gameManager.toggleClearLeaderboardButton();
        }
        
        // 显示认证界面
        document.getElementById('authOverlay').style.display = 'flex';
        this.showLogin();
    }

    // 检查自动登录
    async checkAutoLogin() {
        // 检查是否开启了自动登录
        const autoLogin = localStorage.getItem('autoLogin');
        if (!autoLogin) {
            // 用户不希望自动登录 → 直接显示登录界面
            document.getElementById('authOverlay').style.display = 'flex';
            this.showLogin();
            return;
        }
        
        const token = this.getAccessToken();
        
        if (token) {
            // 尝试用现有 accessToken 获取用户信息
            const ok = await this.tryGetUserInfo();
            if (ok) {
                document.getElementById('authOverlay').style.display = 'none';
                return;
            }
        }
        
        // 尝试使用 refresh token 刷新 accessToken
        const refreshed = await this.refreshToken();
        if (refreshed) {
            const ok2 = await this.tryGetUserInfo();
            if (ok2) {
                document.getElementById('authOverlay').style.display = 'none';
                return;
            }
        }
        
        // 无法自动登录
        document.getElementById('authOverlay').style.display = 'flex';
        this.showLogin();
    }
    
    async tryGetUserInfo() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.getAccessToken()}` },
                credentials: 'include' // not strictly necessary for bearer, but harmless
            });
            
            if (!response.ok) return false;
            const data = await response.json();
            this.isLoggedIn = true;
            this.updateAccountInfo(data.user);
            
            // 检查是否已存在GameManager实例，避免重复初始化
            if (typeof window.gameManager === 'undefined') {
                // 首次登录，创建GameManager实例
                window.gameManager = new GameManager();
            } else {
                // 更新游戏状态和UI组件
                window.gameManager.updateAccountBestScore();
                window.gameManager.renderLeaderboard();
            }
            
            return true;
        } catch (e) {
            return false;
        }
    }

    // 获取访问令牌
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    // 保存访问令牌
    setAccessToken(token) {
        localStorage.setItem('accessToken', token);
    }

    // 移除访问令牌
    removeAccessToken() {
        localStorage.removeItem('accessToken');
    }

    // 刷新令牌
    async refreshToken() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/refresh-token`, {
                method: 'POST',
                credentials: 'include' // 包含cookie中的刷新令牌
            });

            if (response.ok) {
                const data = await response.json();
                this.setAccessToken(data.accessToken);
                this.isLoggedIn = true;
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('刷新令牌失败:', error);
            this.logout();
            return false;
        }
    }
}

// 初始化认证系统
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();  // ← 挂到全局 
    window.authSystem.init();
});
