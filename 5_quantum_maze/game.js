// 量子意识迷宫游戏
class QuantumMaze {
    constructor() {
        this.canvas = document.getElementById('quantumCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = { x: 50, y: 50, radius: 15, inSuperposition: false };
        this.dimensions = [];
        this.currentDimension = 0;
        this.quantumEnergy = 100;
        this.observationCount = 0;
        this.superpositionActive = false;
        this.particles = [];
        this.animationId = null;
        this.tutorialStep = 0;
        this.aiDemoActive = false;
        this.aiDemoStep = 0;
        this.aiDemoInterval = null;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.generateDimensions();
        this.startAnimation();
        this.createInterferencePattern();
        this.setupTutorial();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // 控制按钮
        document.getElementById('observeBtn').addEventListener('click', () => this.observe());
        document.getElementById('superpositionBtn').addEventListener('click', () => this.toggleSuperposition());
        document.getElementById('teleportBtn').addEventListener('click', () => this.quantumTeleport());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('tutorialBtn').addEventListener('click', () => this.showTutorial());
        document.getElementById('aiDemoBtn').addEventListener('click', () => this.startAIDemo());

        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 鼠标控制
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    generateDimensions() {
        // 生成多个维度的迷宫
        for (let i = 0; i < 5; i++) {
            this.dimensions.push(this.generateMaze(i + 1));
        }
        this.updateDimensionButtons();
    }

    generateMaze(level) {
        const cellSize = 40;
        const cols = Math.floor(this.canvas.width / cellSize);
        const rows = Math.floor(this.canvas.height / cellSize);
        
        const maze = {
            level: level,
            cellSize: cellSize,
            cols: cols,
            rows: rows,
            walls: [],
            exit: { x: cols - 2, y: rows - 2 },
            quantumWalls: [], // 可以通过叠加态穿过的墙
            observers: [] // 观察点
        };

        // 生成迷宫墙壁
        this.generateMazeWalls(maze);
        
        // 添加量子特性
        this.addQuantumFeatures(maze);
        
        return maze;
    }

    generateMazeWalls(maze) {
        // 简化的迷宫生成算法
        const { cols, rows, cellSize } = maze;
        
        // 外墙
        for (let x = 0; x < cols; x++) {
            maze.walls.push({ x1: x * cellSize, y1: 0, x2: (x + 1) * cellSize, y2: 0 });
            maze.walls.push({ x1: x * cellSize, y1: rows * cellSize, x2: (x + 1) * cellSize, y2: rows * cellSize });
        }
        
        for (let y = 0; y < rows; y++) {
            maze.walls.push({ x1: 0, y1: y * cellSize, x2: 0, y2: (y + 1) * cellSize });
            maze.walls.push({ x1: cols * cellSize, y1: y * cellSize, x2: cols * cellSize, y2: (y + 1) * cellSize });
        }
        
        // 随机内部墙壁
        for (let i = 0; i < maze.level * 20; i++) {
            const x = Math.floor(Math.random() * (cols - 2)) + 1;
            const y = Math.floor(Math.random() * (rows - 2)) + 1;
            
            if (Math.random() > 0.5) {
                // 垂直墙
                maze.walls.push({
                    x1: x * cellSize,
                    y1: y * cellSize,
                    x2: x * cellSize,
                    y2: (y + 1) * cellSize
                });
            } else {
                // 水平墙
                maze.walls.push({
                    x1: x * cellSize,
                    y1: y * cellSize,
                    x2: (x + 1) * cellSize,
                    y2: y * cellSize
                });
            }
        }
    }

    addQuantumFeatures(maze) {
        // 添加量子墙壁（可以通过叠加态穿过）
        const quantumWallCount = Math.floor(maze.walls.length * 0.3);
        for (let i = 0; i < quantumWallCount; i++) {
            const wallIndex = Math.floor(Math.random() * maze.walls.length);
            maze.quantumWalls.push(wallIndex);
        }
        
        // 添加观察点
        for (let i = 0; i < maze.level * 3; i++) {
            maze.observers.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 30,
                active: false
            });
        }
    }

    updateDimensionButtons() {
        const container = document.getElementById('dimensionButtons');
        container.innerHTML = '';
        
        this.dimensions.forEach((dim, index) => {
            const btn = document.createElement('button');
            btn.className = `dimension-btn ${index === this.currentDimension ? 'active' : ''}`;
            btn.textContent = `D${dim.level}`;
            btn.addEventListener('click', () => this.switchDimension(index));
            container.appendChild(btn);
        });
    }

    switchDimension(index) {
        if (index !== this.currentDimension && this.quantumEnergy >= 20) {
            this.currentDimension = index;
            this.quantumEnergy -= 20;
            this.createTeleportEffect(this.player.x, this.player.y);
            this.updateDimensionButtons();
            this.updateStats();
        }
    }

    handleKeyDown(e) {
        const speed = 5;
        let newX = this.player.x;
        let newY = this.player.y;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                newY -= speed;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newY += speed;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newX -= speed;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newX += speed;
                break;
            case ' ':
                e.preventDefault();
                this.observe();
                break;
        }
        
        if (this.canMoveTo(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.checkCollisions();
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击了观察点
        const maze = this.dimensions[this.currentDimension];
        maze.observers.forEach(observer => {
            const distance = Math.sqrt((observer.x - x) ** 2 + (observer.y - y) ** 2);
            if (distance <= observer.radius) {
                this.activateObserver(observer);
            }
        });
    }

    canMoveTo(x, y) {
        const maze = this.dimensions[this.currentDimension];
        
        for (let i = 0; i < maze.walls.length; i++) {
            const wall = maze.walls[i];
            const isQuantumWall = maze.quantumWalls.includes(i);
            
            // 如果是量子墙且玩家处于叠加态，可以穿过
            if (isQuantumWall && this.superpositionActive) {
                continue;
            }
            
            if (this.lineCircleCollision(wall, { x, y, radius: this.player.radius })) {
                return false;
            }
        }
        
        return x >= this.player.radius && 
               x <= this.canvas.width - this.player.radius &&
               y >= this.player.radius && 
               y <= this.canvas.height - this.player.radius;
    }

    lineCircleCollision(line, circle) {
        const { x1, y1, x2, y2 } = line;
        const { x, y, radius } = circle;
        
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        return dx * dx + dy * dy <= radius * radius;
    }

    observe() {
        if (this.quantumEnergy >= 10) {
            this.observationCount++;
            this.quantumEnergy -= 10;
            
            // 观察改变现实
            this.collapseWaveFunction();
            this.createObservationWave(this.player.x, this.player.y);
            this.updateStats();
        }
    }

    collapseWaveFunction() {
        const maze = this.dimensions[this.currentDimension];
        
        // 随机改变一些量子墙的状态
        maze.quantumWalls = maze.quantumWalls.filter(() => Math.random() > 0.3);
        
        // 添加新的量子墙
        const newQuantumWalls = Math.floor(Math.random() * 5);
        for (let i = 0; i < newQuantumWalls; i++) {
            const wallIndex = Math.floor(Math.random() * maze.walls.length);
            if (!maze.quantumWalls.includes(wallIndex)) {
                maze.quantumWalls.push(wallIndex);
            }
        }
    }

    toggleSuperposition() {
        if (this.quantumEnergy >= 15) {
            this.superpositionActive = !this.superpositionActive;
            this.player.inSuperposition = this.superpositionActive;
            this.quantumEnergy -= 15;
            
            if (this.superpositionActive) {
                this.createSuperpositionEffect(this.player.x, this.player.y);
                setTimeout(() => {
                    this.superpositionActive = false;
                    this.player.inSuperposition = false;
                }, 3000);
            }
            
            this.updateStats();
        }
    }

    quantumTeleport() {
        if (this.quantumEnergy >= 30) {
            const maze = this.dimensions[this.currentDimension];
            let attempts = 0;
            let newX, newY;
            
            do {
                newX = Math.random() * (this.canvas.width - 100) + 50;
                newY = Math.random() * (this.canvas.height - 100) + 50;
                attempts++;
            } while (!this.canMoveTo(newX, newY) && attempts < 50);
            
            if (attempts < 50) {
                this.createTeleportEffect(this.player.x, this.player.y);
                this.player.x = newX;
                this.player.y = newY;
                this.createTeleportEffect(newX, newY);
                this.quantumEnergy -= 30;
                this.updateStats();
            }
        }
    }

    activateObserver(observer) {
        observer.active = true;
        this.createObservationWave(observer.x, observer.y);
        
        // 观察者效应：改变附近的量子状态
        const maze = this.dimensions[this.currentDimension];
        maze.walls.forEach((wall, index) => {
            const wallCenterX = (wall.x1 + wall.x2) / 2;
            const wallCenterY = (wall.y1 + wall.y2) / 2;
            const distance = Math.sqrt((observer.x - wallCenterX) ** 2 + (observer.y - wallCenterY) ** 2);
            
            if (distance < 100) {
                if (Math.random() > 0.5) {
                    if (!maze.quantumWalls.includes(index)) {
                        maze.quantumWalls.push(index);
                    }
                } else {
                    const qIndex = maze.quantumWalls.indexOf(index);
                    if (qIndex > -1) {
                        maze.quantumWalls.splice(qIndex, 1);
                    }
                }
            }
        });
        
        setTimeout(() => {
            observer.active = false;
        }, 2000);
    }

    checkCollisions() {
        const maze = this.dimensions[this.currentDimension];
        
        // 检查是否到达出口
        const exitX = maze.exit.x * maze.cellSize;
        const exitY = maze.exit.y * maze.cellSize;
        const distance = Math.sqrt((this.player.x - exitX) ** 2 + (this.player.y - exitY) ** 2);
        
        if (distance < 30) {
            this.nextLevel();
        }
        
        // 恢复量子能量
        if (this.quantumEnergy < 100) {
            this.quantumEnergy += 0.1;
        }
    }

    nextLevel() {
        if (this.currentDimension < this.dimensions.length - 1) {
            this.currentDimension++;
            this.player.x = 50;
            this.player.y = 50;
            this.quantumEnergy = Math.min(100, this.quantumEnergy + 50);
            this.updateDimensionButtons();
            this.createTeleportEffect(this.player.x, this.player.y);
        } else {
            // 游戏胜利
            this.showVictory();
        }
        this.updateStats();
    }

    showVictory() {
        // 创建胜利效果
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createTeleportEffect(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height
                );
            }, i * 100);
        }
    }

    resetGame() {
        this.player.x = 50;
        this.player.y = 50;
        this.currentDimension = 0;
        this.quantumEnergy = 100;
        this.observationCount = 0;
        this.superpositionActive = false;
        this.player.inSuperposition = false;
        this.generateDimensions();
        this.updateStats();
    }

    createSuperpositionEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'superposition-effect';
        effect.style.left = (x - 25) + 'px';
        effect.style.top = (y - 25) + 'px';
        effect.style.width = '50px';
        effect.style.height = '50px';
        
        document.getElementById('quantumParticles').appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 3000);
    }

    createTeleportEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'teleport-effect';
        effect.style.left = (x - 50) + 'px';
        effect.style.top = (y - 50) + 'px';
        
        document.getElementById('quantumParticles').appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    createObservationWave(x, y) {
        const wave = document.createElement('div');
        wave.className = 'observation-wave';
        wave.style.left = (x - 10) + 'px';
        wave.style.top = (y - 10) + 'px';
        
        document.getElementById('quantumParticles').appendChild(wave);
        
        setTimeout(() => {
            wave.remove();
        }, 1500);
    }

    createInterferencePattern() {
        const pattern = document.createElement('div');
        pattern.className = 'interference-pattern';
        document.body.appendChild(pattern);
    }

    updateStats() {
        document.getElementById('dimensionLevel').textContent = this.currentDimension + 1;
        document.getElementById('superpositionState').textContent = this.superpositionActive ? '激活' : '稳定';
        document.getElementById('quantumEnergy').textContent = Math.round(this.quantumEnergy) + '%';
        document.getElementById('observationCount').textContent = this.observationCount;
    }

    startAnimation() {
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制当前维度的迷宫
        this.drawMaze();
        
        // 绘制玩家
        this.drawPlayer();
        
        // 绘制量子粒子
        this.updateQuantumParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawMaze() {
        const maze = this.dimensions[this.currentDimension];
        
        // 绘制普通墙壁
        maze.walls.forEach((wall, index) => {
            const isQuantumWall = maze.quantumWalls.includes(index);
            
            this.ctx.strokeStyle = isQuantumWall ? 
                'rgba(168, 85, 247, 0.6)' : 
                'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = isQuantumWall ? 1 : 2;
            
            if (isQuantumWall) {
                this.ctx.setLineDash([5, 5]);
            } else {
                this.ctx.setLineDash([]);
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(wall.x1, wall.y1);
            this.ctx.lineTo(wall.x2, wall.y2);
            this.ctx.stroke();
        });
        
        // 绘制出口
        const exitX = maze.exit.x * maze.cellSize;
        const exitY = maze.exit.y * maze.cellSize;
        
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.arc(exitX, exitY, 20, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 绘制观察者
        maze.observers.forEach(observer => {
            this.ctx.fillStyle = observer.active ? 
                'rgba(6, 182, 212, 0.6)' : 
                'rgba(6, 182, 212, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(observer.x, observer.y, observer.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 观察者符号
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('👁️', observer.x, observer.y);
        });
        
        this.ctx.setLineDash([]);
    }

    drawPlayer() {
        // 玩家主体
        this.ctx.fillStyle = this.player.inSuperposition ? 
            'rgba(168, 85, 247, 0.6)' : 
            '#06b6d4';
        this.ctx.strokeStyle = this.player.inSuperposition ? 
            '#a855f7' : 
            '#0891b2';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 玩家发光效果
        if (this.player.inSuperposition) {
            this.ctx.shadowColor = '#a855f7';
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.radius + 5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }

    updateQuantumParticles() {
        // 创建量子粒子
        if (Math.random() < 0.1) {
            this.createQuantumParticle();
        }
        
        // 更新现有粒子
        this.particles = this.particles.filter(particle => {
            particle.life--;
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.life > 0) {
                this.ctx.fillStyle = `rgba(${particle.color}, ${particle.life / 100})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                return true;
            }
            return false;
        });
    }

    createQuantumParticle() {
        const particle = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            life: 100,
            color: Math.random() > 0.5 ? '168, 85, 247' : '6, 182, 212'
        };
        
        this.particles.push(particle);
    }

    setupTutorial() {
        const tutorialSteps = [
            {
                title: "欢迎来到量子意识迷宫",
                content: "在这个多维度迷宫中，你将体验量子力学的奇妙现象。使用WASD或方向键移动，探索不同的维度空间！",
                highlight: null
            },
            {
                title: "观察与坍缩",
                content: "点击'👁️ 观察'按钮或按空格键进行观察。观察会让量子状态坍缩，改变迷宫的结构。但要小心，观察会消耗量子能量！",
                highlight: "observeBtn"
            },
            {
                title: "量子叠加态",
                content: "点击'🌀 叠加态'按钮进入叠加态模式。在叠加态下，你可以穿过量子墙壁（虚线墙壁），但会持续消耗能量。",
                highlight: "superpositionBtn"
            },
            {
                title: "量子传送",
                content: "点击'⚡ 传送'按钮进行量子传送，瞬间移动到随机位置。这在被困时非常有用，但需要消耗大量量子能量。",
                highlight: "teleportBtn"
            },
            {
                title: "维度切换",
                content: "点击右侧的维度按钮（D1-D5）可以切换到不同的维度层级。每个维度都有独特的迷宫结构和挑战！",
                highlight: null
            },
            {
                title: "开始探索",
                content: "现在你已经掌握了基本操作。尝试到达迷宫的出口（黄色圆圈），体验量子世界的奇妙！点击'🤖 AI演示'可以看AI自动探索。",
                highlight: "aiDemoBtn"
            }
        ];

        this.tutorialSteps = tutorialSteps;
        this.setupTutorialEvents();
    }

    setupTutorialEvents() {
        document.getElementById('closeTutorial').addEventListener('click', () => this.hideTutorial());
        document.getElementById('prevStep').addEventListener('click', () => this.prevTutorialStep());
        document.getElementById('nextStep').addEventListener('click', () => this.nextTutorialStep());
    }

    showTutorial() {
        this.tutorialStep = 0;
        this.updateTutorialContent();
        document.getElementById('tutorialModal').classList.remove('hidden');
    }

    hideTutorial() {
        document.getElementById('tutorialModal').classList.add('hidden');
        this.removeHighlight();
    }

    prevTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.updateTutorialContent();
        }
    }

    nextTutorialStep() {
        if (this.tutorialStep < this.tutorialSteps.length - 1) {
            this.tutorialStep++;
            this.updateTutorialContent();
        } else {
            this.hideTutorial();
        }
    }

    updateTutorialContent() {
        const step = this.tutorialSteps[this.tutorialStep];
        const content = document.getElementById('tutorialContent');
        const indicator = document.getElementById('stepIndicator');
        
        content.innerHTML = `
            <h3 class="text-xl font-bold text-purple-300 mb-4">${step.title}</h3>
            <p class="text-gray-200 leading-relaxed">${step.content}</p>
        `;
        
        indicator.textContent = `${this.tutorialStep + 1} / ${this.tutorialSteps.length}`;
        
        // 更新按钮状态
        document.getElementById('prevStep').style.opacity = this.tutorialStep === 0 ? '0.5' : '1';
        document.getElementById('nextStep').textContent = this.tutorialStep === this.tutorialSteps.length - 1 ? '完成' : '下一步';
        
        // 高亮相关按钮
        this.removeHighlight();
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }
    }

    highlightElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('tutorial-highlight');
        }
    }

    removeHighlight() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }

    startAIDemo() {
        if (this.aiDemoActive) {
            this.stopAIDemo();
            return;
        }

        this.aiDemoActive = true;
        this.aiDemoStep = 0;
        document.getElementById('aiDemoBtn').textContent = '⏹️ 停止演示';
        
        // 重置游戏状态
        this.resetGame();
        
        // 开始AI演示
        this.runAIDemo();
    }

    stopAIDemo() {
        this.aiDemoActive = false;
        this.aiDemoStep = 0;
        if (this.aiDemoInterval) {
            clearInterval(this.aiDemoInterval);
            this.aiDemoInterval = null;
        }
        document.getElementById('aiDemoBtn').textContent = '🤖 AI演示';
    }

    runAIDemo() {
        const demoSteps = [
            () => this.aiDemoMove(),
            () => this.aiDemoObserve(),
            () => this.aiDemoSuperposition(),
            () => this.aiDemoMove(),
            () => this.aiDemoTeleport(),
            () => this.aiDemoSwitchDimension(),
            () => this.aiDemoMove(),
            () => this.aiDemoExplore()
        ];

        this.aiDemoInterval = setInterval(() => {
            if (!this.aiDemoActive) return;
            
            if (this.aiDemoStep < demoSteps.length) {
                demoSteps[this.aiDemoStep]();
                this.aiDemoStep++;
            } else {
                // 重新开始演示
                this.aiDemoStep = 0;
                this.resetGame();
            }
        }, 2000);
    }

    aiDemoMove() {
        // AI智能移动
        const maze = this.dimensions[this.currentDimension];
        const targetX = maze.exit.x * maze.cellSize + maze.cellSize / 2;
        const targetY = maze.exit.y * maze.cellSize + maze.cellSize / 2;
        
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        
        const moveDistance = 20;
        let newX = this.player.x;
        let newY = this.player.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            newX += dx > 0 ? moveDistance : -moveDistance;
        } else {
            newY += dy > 0 ? moveDistance : -moveDistance;
        }
        
        if (this.canMoveTo(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }
        
        this.checkCollisions();
    }

    aiDemoObserve() {
        if (this.quantumEnergy >= 10) {
            this.observe();
        }
    }

    aiDemoSuperposition() {
        if (this.quantumEnergy >= 30 && !this.superpositionActive) {
            this.toggleSuperposition();
        }
    }

    aiDemoTeleport() {
        if (this.quantumEnergy >= 50) {
            this.quantumTeleport();
        }
    }

    aiDemoSwitchDimension() {
        if (this.quantumEnergy >= 20) {
            const nextDim = (this.currentDimension + 1) % this.dimensions.length;
            this.switchDimension(nextDim);
        }
    }

    aiDemoExplore() {
        // AI随机探索
        const directions = [
            { x: 20, y: 0 },
            { x: -20, y: 0 },
            { x: 0, y: 20 },
            { x: 0, y: -20 }
        ];
        
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const newX = this.player.x + randomDir.x;
        const newY = this.player.y + randomDir.y;
        
        if (this.canMoveTo(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }
        
        this.checkCollisions();
    }
}

// 资源加载检测
function waitForResources() {
    return new Promise((resolve) => {
        let resourcesLoaded = 0;
        const totalResources = 2; // CSS + Tailwind
        
        function checkResource() {
            resourcesLoaded++;
            if (resourcesLoaded >= totalResources) {
                resolve();
            }
        }
        
        // 检查CSS是否加载
        const cssCheck = setInterval(() => {
            const testEl = document.createElement('div');
            testEl.className = 'quantum-particle';
            document.body.appendChild(testEl);
            const computedStyle = window.getComputedStyle(testEl);
            const hasStyles = computedStyle.position === 'absolute' || 
                            computedStyle.animation !== '' || 
                            computedStyle.animationName !== 'none';
            document.body.removeChild(testEl);
            
            if (hasStyles) {
                clearInterval(cssCheck);
                checkResource();
            }
        }, 50);
        
        // 检查Tailwind是否加载
        const tailwindCheck = setInterval(() => {
            const testEl = document.createElement('div');
            testEl.className = 'bg-purple-500';
            document.body.appendChild(testEl);
            const hasColor = window.getComputedStyle(testEl).backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                            window.getComputedStyle(testEl).backgroundColor !== '';
            document.body.removeChild(testEl);
            
            if (hasColor || document.body.classList.contains('tailwind-fallback')) {
                clearInterval(tailwindCheck);
                checkResource();
            }
        }, 50);
        
        // 超时保护
        setTimeout(() => {
            resolve();
        }, 5000);
    });
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', async () => {
    // 等待资源加载完成
    await waitForResources();
    
    // 隐藏加载指示器
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('show');
    }
    
    // 延迟一点确保所有样式都应用完成
    setTimeout(() => {
        try {
            new QuantumMaze();
        } catch (error) {
            console.error('游戏初始化失败:', error);
            // 重试机制
            setTimeout(() => {
                try {
                    new QuantumMaze();
                } catch (retryError) {
                    console.error('游戏重试初始化失败:', retryError);
                    alert('游戏加载失败，请刷新页面重试');
                }
            }, 1000);
        }
    }, 100);
}); 