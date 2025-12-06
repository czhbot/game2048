// 2048 Game - Combined Game Logic

// Tile Class (from tile.js)
function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value
  };
};

// Grid Class (from grid.js)
function Grid(size) {
    this.size = size;
    this.cells = [];
    this.init();
}

// 初始化棋盘
Grid.prototype.init = function() {
    this.cells = [];
    for (let x = 0; x < this.size; x++) {
        this.cells[x] = [];
        for (let y = 0; y < this.size; y++) {
            this.cells[x][y] = null;
        }
    }
};

// 获取指定位置的单元格
Grid.prototype.cellContent = function(position) {
    if (this.withinBounds(position)) {
        return this.cells[position.x][position.y];
    } else {
        return null;
    }
};

// 设置指定位置的单元格
Grid.prototype.insertTile = function(tile) {
    this.cells[tile.x][tile.y] = tile;
};

// 清除指定位置的单元格
Grid.prototype.removeTile = function(tile) {
    this.cells[tile.x][tile.y] = null;
};

// 检查位置是否在棋盘内
Grid.prototype.withinBounds = function(position) {
    return position.x >= 0 && position.x < this.size && 
           position.y >= 0 && position.y < this.size;
};

// 查找空单元格
Grid.prototype.availableCells = function() {
    let cells = [];
    for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
            if (!this.cells[x][y]) {
                cells.push({ x: x, y: y });
            }
        }
    }
    return cells;
};

// 检查是否有空单元格
Grid.prototype.hasAvailableCells = function() {
    return this.availableCells().length > 0;
};

// 随机选择一个空单元格
Grid.prototype.randomAvailableCell = function() {
    let cells = this.availableCells();
    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
    }
};

// 检查指定位置是否被占用
Grid.prototype.cellOccupied = function(position) {
    return !!this.cellContent(position);
};

// 保存棋盘状态
Grid.prototype.serialize = function() {
    let cellState = [];
    for (let x = 0; x < this.size; x++) {
        cellState[x] = [];
        for (let y = 0; y < this.size; y++) {
            cellState[x][y] = this.cells[x][y] ? this.cells[x][y].serialize() : null;
        }
    }
    return {
        size: this.size,
        cells: cellState
    };
};

// 从序列化数据恢复棋盘状态
Grid.prototype.deserialize = function(data) {
    this.size = data.size;
    this.cells = [];
    for (let x = 0; x < this.size; x++) {
        this.cells[x] = [];
        for (let y = 0; y < this.size; y++) {
            if (data.cells[x][y]) {
                let tile = new Tile(data.cells[x][y].position, data.cells[x][y].value);
                this.cells[x][y] = tile;
            } else {
                this.cells[x][y] = null;
            }
        }
    }
};

// HTMLActuator Class (from html_actuator.js)
function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container .value");
  this.bestContainer    = document.querySelector(".best-container .value");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Don't render the tiles that merged to avoid color residue
    // Render the tiles that merged
    // tile.mergedFrom.forEach(function (merged) {
    //   self.addTile(merged);
    // });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;
  this.adjustFontSize(this.scoreContainer);

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
  this.adjustFontSize(this.bestContainer);
};

// 动态调整字体大小的方法
HTMLActuator.prototype.adjustFontSize = function (element) {
  // 根据数字位数设置合适的字体大小
  const digitCount = element.textContent.length;
  
  if (digitCount >= 9) {
    element.style.fontSize = "18px";
  } else if (digitCount >= 8) {
    element.style.fontSize = "20px";
  } else if (digitCount >= 7) {
    element.style.fontSize = "24px";
  } else if (digitCount >= 6) {
    element.style.fontSize = "28px";
  } else if (digitCount >= 5) {
    element.style.fontSize = "32px";
  } else {
    element.style.fontSize = "32px";
  }
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "恭喜你赢了!" : "游戏结束!";

  this.messageContainer.classList.add(type);
  this.messageContainer.classList.add("show");
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  // this.clearContainer(this.sharingContainer);
  // this.sharingContainer.appendChild(this.scoreTweetButton());
  // twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
  this.messageContainer.classList.remove("show");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  // tweet.setAttribute("data-via", "gabrielecirulli");
  tweet.setAttribute("data-url", "http://2048game.com");
  tweet.setAttribute("data-counturl", "http://2048game.com");
  tweet.textContent = "Tweet";

  var text = "I scored " + this.score + " points at 2048, a game where you " +
             "join numbers to score high! #2048game";
  tweet.setAttribute("data-text", text);

  return tweet;
};

// GameManager Class (from game_manager.js)
function GameManager() {
    this.size           = 4;
    this.grid           = new Grid(this.size);
    this.actuator       = new HTMLActuator();
    this.score          = 0;
    this.bestScore      = 0; // 初始化为0，后续从服务器获取
    this.over           = false;
    this.won            = false;
    this.keepPlaying    = false;
    this.sessionId      = null; // 初始化为null，后续从服务器获取
    
    // 输入队列，防止高频移动导致的丢步问题
    this.inputQueue     = [];
    this.isMoving       = false;
    
    // 初始化游戏
    this.setup();
    this.bindEvents();
}

// 开始新游戏会话，从后端获取session_id
GameManager.prototype.startNewSession = async function() {
    // 获取当前登录用户的访问令牌
    var accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/leaderboard/start-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            this.sessionId = data.session_id;
            console.log('获取游戏会话ID成功:', this.sessionId);
        }
    } catch (error) {
        console.error('获取游戏会话ID失败:', error);
    }
};

// 格式化时间戳为指定时区
GameManager.prototype.formatTimestamp = function(timestamp) {
    if (!timestamp) return '未知时间';
    try {
        return new Date(timestamp).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai'
        });
    } catch (e) {
        console.error('时间格式化失败:', e);
        return '未知时间';
    }
};

// 初始化游戏
GameManager.prototype.setup = function() {
    // 确保网格正确初始化
    if (!this.grid) {
        this.grid = new Grid(this.size);
    } else {
        this.grid.init();
    }
    
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false;
    
    // 清空旧方块（额外保护）
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            this.grid.cells[x][y] = null;
        }
    }
    
    // 清除游戏结束消息
    this.actuator.clearMessage();
    
    // 随机生成两个初始方块
    this.addRandomTile();
    this.addRandomTile();
    
    // 渲染初始状态
    this.actuate();
    
    // 渲染排行榜
    this.renderLeaderboard();
    
    // 开始新游戏会话，获取新的session_id
    this.startNewSession();
};

// 更新游戏界面顶部的最佳分数
GameManager.prototype.updateBestScoreDisplay = function(bestScore) {
    // 更新游戏管理器的最佳分数
    this.bestScore = bestScore;
    // 调用actuate方法，只更新分数显示，不重新渲染游戏界面
    this.actuator.actuate(this.grid, {
        score: this.score,
        bestScore: this.bestScore,
        over: this.over,
        won: this.won,
        terminated: this.over || (this.won && !this.keepPlaying)
    });
};

// 处理输入队列
    GameManager.prototype.processQueue = function() {
        var self = this;
        if (self.isMoving) return;
        if (!self.inputQueue.length) return;

        const direction = self.inputQueue.shift();
        self.move(direction.dx, direction.dy);
    };
    
    // 绑定事件
    GameManager.prototype.bindEvents = function() {
        var self = this;
        
        // 键盘事件
        var keydownHandler = function(event) {
            // 检查是否正在显示认证界面
            var authOverlay = document.getElementById('authOverlay');
            var isOverlayVisible = false;
            
            // 使用getComputedStyle来获取实际显示状态
            if (authOverlay) {
                var computedStyle = window.getComputedStyle(authOverlay);
                isOverlayVisible = computedStyle.display !== 'none';
            }
            
            if (isOverlayVisible) {
                // 认证界面可见，不处理键盘事件，允许密码框输入
                return;
            }
            
            // 阻止默认行为，避免页面滚动等
            event.preventDefault();
            
            if (self.over || self.won && !self.keepPlaying) return;
            
            var key = event.which;
            var direction = null;
            
            switch (key) {
                case 37: // 左箭头
                    direction = { dx: 0, dy: -1 };
                    break;
                case 38: // 上箭头
                    direction = { dx: -1, dy: 0 };
                    break;
                case 39: // 右箭头
                    direction = { dx: 0, dy: 1 };
                    break;
                case 40: // 下箭头
                    direction = { dx: 1, dy: 0 };
                    break;
            }
            
            if (direction) {
                // 判断方向是否发生变化
                var lastDirection = self.inputQueue.length > 0 ? 
                    self.inputQueue[self.inputQueue.length - 1] : null;
                
                // 如果方向发生变化，清空队列
                if (lastDirection && 
                    (lastDirection.dx !== direction.dx || lastDirection.dy !== direction.dy)) {
                    self.inputQueue = []; // 清空队列
                    self.isMoving = false; // 重置移动状态
                }
                
                // 如果已经在移动中，且方向没有变化，可以跳过重复的输入
                if (self.isMoving && lastDirection && 
                    lastDirection.dx === direction.dx && 
                    lastDirection.dy === direction.dy) {
                    return; // 跳过重复输入
                }
                
                self.inputQueue.push(direction);
                self.processQueue();
            }
        };
        
        // 绑定键盘事件
        document.addEventListener('keydown', keydownHandler);
        
        // 重新开始按钮事件
        document.querySelector('.restart-button').addEventListener('click', function() {
            const finalScore = self.score;
    
            // 1. 游戏立即初始化（不卡顿）
            self.setup();
    
            // 2. 后台异步保存和刷新排行榜（不阻塞 UI）
            if (finalScore > 0) {
                (async () => {
                    await self.saveScoreToLeaderboard(finalScore);
                    self.renderLeaderboard();   // 不 await
                })();
            }
        });
        
        // 重新开始按钮事件
        document.querySelector('.retry-button').addEventListener('click', function() {
            const finalScore = self.score;
            
            self.setup();  // 立即初始化
            
            if (finalScore > 0) {
                (async () => {
                    await self.saveScoreToLeaderboard(finalScore);
                    self.renderLeaderboard();
                })();
            }
        });
        
        // 继续游戏按钮事件
        document.querySelector('.keep-playing-button').addEventListener('click', function() {
            self.keepPlaying = true;
            self.actuator.clearMessage();
        });
    };

// 随机生成方块
GameManager.prototype.addRandomTile = function() {
    if (this.grid.hasAvailableCells()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        var tile = new Tile(this.grid.randomAvailableCell(), value);
        this.grid.insertTile(tile);
    }
};

// 渲染游戏状态
GameManager.prototype.actuate = function() {
    // 更新本地最佳分数记录（仅客户端）
    if (this.score > this.bestScore) {
        this.bestScore = this.score;
    }
    
    // 仅更新游戏界面，不发送API请求
    this.actuator.actuate(this.grid, {
        score: this.score,
        bestScore: this.bestScore,
        over: this.over,
        won: this.won,
        terminated: this.over || (this.won && !this.keepPlaying)
    });
    
};

// 更新账户信息模块的最佳分数
GameManager.prototype.updateAccountBestScore = async function() {
    // 获取当前登录用户的访问令牌
    var accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        try {
            // 1. 先将当前分数提交到服务器，确保服务器有最新的最佳分数
            await this.saveScoreToLeaderboard(this.score);
            
            // 2. 更新本地显示，立即反映最新的最佳分数
            if (document.getElementById('bestScore')) {
                document.getElementById('bestScore').textContent = this.bestScore;
            }
            
            // 3. 从服务器获取最新的最佳分数，确保数据一致性
            const response = await fetch('http://localhost:3000/api/users/me/best-score', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // 更新显示，确保与服务器数据一致
                if (document.getElementById('bestScore')) {
                    document.getElementById('bestScore').textContent = data.best_score;
                }
                // 更新游戏管理器中的最佳分数
                this.bestScore = data.best_score;
            }
        } catch (error) {
            console.error('更新最佳分数失败:', error);
        }
    }
};



// 移动方块
    GameManager.prototype.move = function(dx, dy) {
        var self = this;
        var moved = false;
        var previousScore = this.score;
        
        // 设置正在移动状态
        this.isMoving = true;
        
        // 保存方块当前位置，用于动画效果
        this.prepareTiles();
        
        // 使用buildTraversals方法确定遍历顺序
        var vector = { x: dx, y: dy };
        var traversals = this.buildTraversals(vector);
        
        // 遍历所有方块
        traversals.x.forEach(function (x) {
            traversals.y.forEach(function (y) {
            var tile = self.grid.cellContent({ x: x, y: y });
            
            if (tile) {
                // 保存当前位置
                var current = { x: x, y: y };
                
                // 找到方块移动的目标位置
                var target = self.findFarthestPosition(current, { x: dx, y: dy });
                
                // 检查是否可以合并
                var next = self.grid.cellContent(target.next);
                
                // 如果可以合并
                if (next && next.value === tile.value && !next.mergedFrom) {
                    // 创建合并后的方块
                    var merged = new Tile(target.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];
                    
                    // 移除原始方块
                    self.grid.removeTile(tile);
                    self.grid.removeTile(next);
                    
                    // 插入合并后的方块到正确位置
                    self.grid.insertTile(merged);
                    
                    // 更新分数
                    self.score += merged.value;
                    
                    // 检查是否获胜
                    if (merged.value === 2048 || window.debugWin) {
                        self.won = true;
                    }
                    
                    moved = true;
                } else {
                    // 不合并，只移动
                    self.moveTile(tile, target.farthest);
                    
                    if (!self.positionsEqual(current, target.farthest)) {
                        moved = true;
                    }
                }
            }
        });
    });
    
    if (moved) {
        this.addRandomTile();
        this.checkGameEnd();
        this.actuate();
    }
    
    // 动画结束后处理队列，动画时间与CSS过渡时间匹配（0.08秒）
    setTimeout(function() {
        self.isMoving = false;
        self.processQueue(); // 继续处理下一个输入
    }, 80);
    
    return moved;
};

// 移动方块到目标位置
GameManager.prototype.moveTile = function(tile, position) {
    this.grid.removeTile(tile);
    tile.updatePosition(position);
    this.grid.insertTile(tile);
};

// 保存所有方块的当前位置
GameManager.prototype.prepareTiles = function() {
    this.grid.cells.forEach(function(column) {
        column.forEach(function(cell) {
            if (cell) {
                cell.mergedFrom = null;
                cell.savePosition();
            }
        });
    });
};

// 构建遍历顺序
GameManager.prototype.buildTraversals = function(vector) {
    var traversals = { x: [], y: [] };
    
    for (var i = 0; i < this.size; i++) {
        traversals.x.push(i);
        traversals.y.push(i);
    }
    
    // 根据移动方向确定遍历顺序：总是从移动方向的反方向开始遍历
    // 例如：向右移动时，从最右边开始遍历；向下移动时，从最下边开始遍历
    if (vector.y === 1) traversals.y.reverse(); // 向右移动，从右到左遍历
    if (vector.y === -1) traversals.y; // 向左移动，从左到右遍历
    if (vector.x === 1) traversals.x.reverse(); // 向下移动，从下到上遍历
    if (vector.x === -1) traversals.x; // 向上移动，从上到下遍历
    
    return traversals;
};

// 查找方块最远可移动位置
GameManager.prototype.findFarthestPosition = function(position, vector) {
    var previous = position;
    var next;
    
    // 一直移动直到遇到边界或其他方块
    while (true) {
        previous = next || position;
        next = {
            x: previous.x + vector.x,
            y: previous.y + vector.y
        };
        
        if (!this.grid.withinBounds(next) || this.grid.cellContent(next)) {
            break;
        }
    }
    
    return {
        farthest: previous,
        next: next // 下一个位置，用于检查是否可以合并
    };
};

// 检查两个位置是否相同
GameManager.prototype.positionsEqual = function(first, second) {
    return first.x === second.x && first.y === second.y;
};

// 检查游戏是否结束
GameManager.prototype.checkGameEnd = function() {
    if (!this.over && !this.canMove()) {
        this.over = true;
        // 游戏结束时保存分数到排行榜
        this.saveScoreToLeaderboard(this.score);
    }
};

// 保存分数到排行榜
GameManager.prototype.saveScoreToLeaderboard = async function(scoreToSave) {
    const token = localStorage.getItem("accessToken");
    if (!token || !scoreToSave || scoreToSave <= 0) return;

    try {
        await fetch("http://localhost:3000/api/leaderboard/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                score: scoreToSave,
                sessionId: this.sessionId
            })
        });

        // ⬅⬅⬅ 新增 —— 提交分数成功后重新更新账户资料
        await this.refreshUserInfoUI();

        // 若需要也可以刷新排行榜
        this.renderLeaderboard();

    } catch (e) {
        console.error("保存分数失败:", e);
    }
};

// 刷新用户信息 UI
GameManager.prototype.refreshUserInfoUI = async function() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            credentials: 'include' // 包含cookie
        });

        if (!res.ok) return;

        const data = await res.json();
        const user = data.user;

        // 更新右侧账户栏 UI
        if (document.getElementById('currentUsername')) {
            document.getElementById('currentUsername').textContent = user.username;
        }

        // 获取并更新最佳分数
        const bestScoreRes = await fetch("http://localhost:3000/api/users/me/best-score", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (bestScoreRes.ok) {
            const bestScoreData = await bestScoreRes.json();
            if (document.getElementById('bestScore')) {
                document.getElementById('bestScore').textContent = bestScoreData.best_score;
            }
            // 更新游戏界面的最佳分数
            this.bestScore = bestScoreData.best_score;
            this.actuate();
        }
    } catch (e) {
        console.error("刷新用户信息失败:", e);
    }
};



// 获取排行榜数据
GameManager.prototype.getLeaderboard = async function() {
    try {
        const response = await fetch('http://localhost:3000/api/leaderboard');
        if (response.ok) {
            const data = await response.json();
            return data.leaderboard;
        }
        return [];
    } catch (error) {
        console.error('获取排行榜数据失败:', error);
        return [];
    }
};

// 渲染排行榜
GameManager.prototype.renderLeaderboard = async function() {
    var leaderboard = await this.getLeaderboard();
    var leaderboardList = document.getElementById('leaderboard-list');
    
    // 清空现有内容
    leaderboardList.innerHTML = '';
    
    // 添加排行榜项
    leaderboard.forEach(function(record, index) {
        var item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="player-name">${record.username}</div>
            <div class="player-score">${record.score}</div>
            <div class="player-time">${this.formatTimestamp(record.created_at_timestamp)}</div>
        `;
        
        leaderboardList.appendChild(item);
    }.bind(this));
    
    // 显示或隐藏清除排行榜按钮
    this.toggleClearLeaderboardButton();
};

// 切换清除排行榜按钮显示
GameManager.prototype.toggleClearLeaderboardButton = function() {
    var clearButton = document.getElementById('clearLeaderboard');
    if (clearButton) {
        var accessToken = localStorage.getItem('accessToken');
        // 简化处理，仅在有访问令牌时显示清除按钮
        clearButton.style.display = accessToken ? 'block' : 'none';
        
        // 如果已登录，绑定事件
        if (accessToken) {
            clearButton.onclick = async function() {
                if (confirm('确定要清除所有排行榜数据吗？')) {
                    await this.clearLeaderboard();
                }
            }.bind(this);
        }
    }
};

// 清除排行榜
GameManager.prototype.clearLeaderboard = async function() {
    // 获取当前登录用户的访问令牌
    var accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
        alert('您没有权限执行此操作！');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/leaderboard', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (response.ok) {
            // 更新显示
            this.renderLeaderboard();
            // 更新账户信息模块的最佳分数
            this.updateAccountBestScore();
        } else {
            alert('您没有权限执行此操作！');
        }
    } catch (error) {
        console.error('清除排行榜失败:', error);
    }
};

// 检查是否可以移动
GameManager.prototype.canMove = function() {
    if (this.grid.hasAvailableCells()) {
        return true;
    }
    
    // 检查是否有可以合并的方块
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            var tile = this.grid.cellContent({ x: x, y: y });
            
            // 检查四个方向的邻居
            if (tile) {
                for (var direction = 0; direction < 4; direction++) {
                    var vector = this.getVector(direction);
                    var newPosition = {
                        x: x + vector.x,
                        y: y + vector.y
                    };
                    
                    var neighbor = this.grid.cellContent(newPosition);
                    if (neighbor && neighbor.value === tile.value) {
                        return true; // 可以合并
                    }
                }
            }
        }
    }
    
    return false;
};

// 获取方向向量
GameManager.prototype.getVector = function(direction) {
    var map = {
        0: { x: 0, y: -1 }, // 上
        1: { x: 1, y: 0 },  // 右
        2: { x: 0, y: 1 },  // 下
        3: { x: -1, y: 0 }  // 左
    };
    
    return map[direction];
};

// 继续游戏（获胜后继续）
GameManager.prototype.continuePlaying = function() {
    this.keepPlaying = true;
    this.actuate();
};

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已经登录，如果未登录，不要初始化GameManager
    // 登录状态由authSystem管理，登录成功后会初始化GameManager
    // 这样可以防止未登录状态下游戏自动启动
    // 同时避免了重复初始化的问题
});