// 用户模型
const safeQuery = require('../config/safeQuery');
const bcrypt = require('bcrypt');

class User {
    // 创建新用户
    static async create(username, password, now) {
        try {
            // 哈希密码
            const hashedPassword = await bcrypt.hash(password, 8);
            
            // 检查用户是否已存在
            const [existingUsers] = await safeQuery(
                `SELECT id FROM users WHERE username = ?`,
                [username]
            );
            
            if (existingUsers.length > 0) {
                throw new Error('用户名已存在');
            }
            
            // 插入新用户
            const isAdmin = username === 'czzzzh';
            const [result] = await safeQuery(
                `INSERT INTO users (username, password, is_admin, created_at) VALUES (?, ?, ?, ?)`,
                [username, hashedPassword, isAdmin, now]
            );
            
            return {
                id: result.insertId,
                username,
                is_admin: isAdmin
            };
        } catch (error) {
            throw error;
        }
    }
    
    // 根据用户名查找用户
    static async findByUsername(username) {
        try {
            const [users] = await safeQuery(
                `SELECT * FROM users WHERE username = ?`,
                [username]
            );
            
            const user = users[0] || null;
            if (user && user.created_at) {
                // 安全处理created_at字段
                let created_at_timestamp = null;
                try {
                    created_at_timestamp = new Date(user.created_at).getTime();
                    if (isNaN(created_at_timestamp)) {
                        created_at_timestamp = null;
                    }
                } catch (e) {
                    console.error('Invalid created_at value:', user.created_at, e);
                }
                
                // 使用展开运算符保留原对象的所有属性，同时添加/更新时间戳字段
                const result = {
                    ...user,
                    created_at_timestamp: created_at_timestamp
                };
                
                // 删除原有的日期字符串字段
                delete result.created_at;
                
                return result;
            }
            
            return user;
        } catch (error) {
            console.error('根据用户名查找用户失败:', error);
            return null;
        }
    }
    
    // 根据ID查找用户
    static async findById(id) {
        try {
            const [users] = await safeQuery(
                `SELECT * FROM users WHERE id = ?`,
                [id]
            );
            
            const user = users[0] || null;
            if (user && user.created_at) {
                // 安全处理created_at字段
                let created_at_timestamp = null;
                try {
                    created_at_timestamp = new Date(user.created_at).getTime();
                    if (isNaN(created_at_timestamp)) {
                        created_at_timestamp = null;
                    }
                } catch (e) {
                    console.error('Invalid created_at value:', user.created_at, e);
                }
                
                // 使用展开运算符保留原对象的所有属性，同时添加/更新时间戳字段
                const result = {
                    ...user,
                    created_at_timestamp: created_at_timestamp
                };
                
                // 删除原有的日期字符串字段
                delete result.created_at;
                
                return result;
            }
            
            return user;
        } catch (error) {
            console.error('根据ID查找用户失败:', error);
            return null;
        }
    }
    
    // 验证密码
    static async verifyPassword(user, password) {
        try {
            return await bcrypt.compare(password, user.password);
        } catch (error) {
            throw error;
        }
    }
    
    // 获取所有用户（管理员功能）
    static async getAll() {
        try {
            const [users] = await safeQuery(
                'SELECT id, username, is_admin, created_at FROM users',
                []
            );
            
            // 将created_at转换为created_at_timestamp，使用展开运算符保留原属性
            return users.map(user => {
                // 安全处理created_at字段
                let created_at_timestamp = null;
                try {
                    if (user.created_at) {
                        created_at_timestamp = new Date(user.created_at).getTime();
                        if (isNaN(created_at_timestamp)) {
                            created_at_timestamp = null;
                        }
                    }
                } catch (e) {
                    console.error('Invalid created_at value:', user.created_at, e);
                    created_at_timestamp = null;
                }
                
                // 使用展开运算符保留原对象的所有属性，同时添加/更新时间戳字段
                const result = {
                    ...user,
                    created_at_timestamp: created_at_timestamp
                };
                
                // 删除原有的日期字符串字段
                delete result.created_at;
                
                return result;
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
