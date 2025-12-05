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
