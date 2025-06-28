class FishBattleGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.fishCount = 35; // 减少初始鱼的数量，降低难度
        this.combo = 0; // 连击数
        this.comboTimer = 0; // 连击计时器
        this.coins = 0; // 金币
        this.autoMode = false; // AI自动模式
        this.autoTarget = null; // AI目标
        this.isMobile = this.IsMobileDevice(); // 检测移动设备
        this.mobileDirection = { x: 0, y: 0 }; // 移动端方向
        this.boostActive = false; // 加速状态
        this.boostCooldown = 0; // 加速冷却
        
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 25,
            speed: 3,
            color: '#FFD700',
            direction: 0,
            scale: 1.0,
            maxSize: 200,
            isDead: false,
            deathTime: 0
        };
        
        this.mouse = { x: 0, y: 0 };
        this.fishes = [];
        this.particles = [];
        this.bubbles = [];
        this.achievements = [];
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.InitializeGame();
        this.SetupEventListeners();
        this.CreateBubbles();
        this.SetupDeviceUI();
        this.StartGameLoop();
    }
    
    InitializeGame() {
        this.fishes = [];
        this.particles = [];
        this.CreateFishes();
        this.UpdateUI();
    }
    
    CreateFishes() {
        for (let i = 0; i < this.fishCount; i++) {
            this.fishes.push(this.CreateRandomFish());
        }
    }
    
    CreateRandomFish() {
        // 调整鱼的大小分布，减少大鱼数量
        let size;
        const rand = Math.random();
        if (rand < 0.5) {
            size = 8 + Math.random() * 15; // 50% 小鱼 (8-23)
        } else if (rand < 0.8) {
            size = 20 + Math.random() * 25; // 30% 中鱼 (20-45)
        } else if (rand < 0.95) {
            size = 40 + Math.random() * 30; // 15% 大鱼 (40-70)
        } else {
            size = 70 + Math.random() * 50; // 5% 巨鱼 (70-120)
        }
        
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: size,
            speed: Math.max(0.5, 4 - size / 50), // 大鱼游得慢
            direction: Math.random() * Math.PI * 2,
            turnSpeed: (Math.random() - 0.5) * 0.02,
            color: this.GetFishColor(size),
            type: size < 20 ? 'small' : size < 60 ? 'medium' : 'large',
            scale: 1.0,
            flipX: Math.random() > 0.5,
            wiggle: Math.random() * Math.PI * 2,
            wiggleSpeed: 0.1 + Math.random() * 0.1,
            isFleeing: false,
            fleeTime: 0,
            isAggressive: size > 80 && Math.random() > 0.8, // 降低攻击性
            value: Math.floor(size * 2) // 鱼的价值
        };
    }
    
    GetFishColor(size) {
        if (size < 20) return '#00BFFF'; // 小鱼蓝色
        if (size < 40) return '#32CD32'; // 中鱼绿色
        if (size < 70) return '#FF6347'; // 大鱼橙色
        if (size < 100) return '#DC143C'; // 更大鱼红色
        return '#8B0000'; // 巨鱼深红色
    }
    
    SetupEventListeners() {
        // PC端鼠标控制
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isMobile) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
                
                // 更新自定义光标位置
                const cursor = document.getElementById('customCursor');
                cursor.style.left = this.mouse.x - 16 + 'px';
                cursor.style.top = this.mouse.y - 16 + 'px';
            }
        });
        
        // 触屏控制
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isMobile && !this.autoMode) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.mouse.x = touch.clientX - rect.left;
                this.mouse.y = touch.clientY - rect.top;
            }
        });
        
        // PC键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.isMobile && this.gameState === 'playing' && !this.autoMode) {
                const speed = 20;
                switch(e.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        this.mouse.y = Math.max(0, this.mouse.y - speed);
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        this.mouse.y = Math.min(this.canvas.height, this.mouse.y + speed);
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        this.mouse.x = Math.max(0, this.mouse.x - speed);
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        this.mouse.x = Math.min(this.canvas.width, this.mouse.x + speed);
                        break;
                    case 'Space':
                        e.preventDefault();
                        this.PauseGame();
                        break;
                    case 'ShiftLeft':
                    case 'ShiftRight':
                        this.ActivateBoost();
                        break;
                }
            } else if (e.code === 'Space' && this.gameState === 'paused') {
                this.ResumeGame();
            }
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.StartGame());
        document.getElementById('autoBtn').addEventListener('click', () => this.ToggleAutoMode());
        document.getElementById('pauseBtn').addEventListener('click', () => this.PauseGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.ResumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.RestartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.RestartGame());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.BackToMenu());
        
        // 移动端控制按钮
        if (this.isMobile) {
            this.SetupMobileControls();
        }
        
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    IsMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }
    
    SetupMobileControls() {
        // 显示移动端控制
        document.getElementById('mobileControls').classList.remove('hidden');
        
        // 方向按钮
        const setupDirectionBtn = (id, dirX, dirY) => {
            const btn = document.getElementById(id);
            
            const start = () => {
                this.mobileDirection.x = dirX;
                this.mobileDirection.y = dirY;
            };
            
            const stop = () => {
                this.mobileDirection.x = 0;
                this.mobileDirection.y = 0;
            };
            
            btn.addEventListener('touchstart', start);
            btn.addEventListener('mousedown', start);
            btn.addEventListener('touchend', stop);
            btn.addEventListener('mouseup', stop);
            btn.addEventListener('mouseleave', stop);
        };
        
        setupDirectionBtn('upBtn', 0, -1);
        setupDirectionBtn('downBtn', 0, 1);
        setupDirectionBtn('leftBtn', -1, 0);
        setupDirectionBtn('rightBtn', 1, 0);
        
        // 加速按钮
        document.getElementById('boostBtn').addEventListener('click', () => this.ActivateBoost());
        
        // 移动端AI按钮
        document.getElementById('mobileAutoBtn').addEventListener('click', () => this.ToggleAutoMode());
    }
    
    SetupDeviceUI() {
        if (this.isMobile) {
            // 显示移动端操作说明
            document.getElementById('pcControls').classList.add('hidden');
            document.getElementById('mobileControlsInfo').classList.remove('hidden');
            document.getElementById('deviceTip').textContent = '💡 提示：触摸屏幕或使用虚拟按键控制！';
        } else {
            // 显示PC端操作说明
            document.getElementById('pcControls').classList.remove('hidden');
            document.getElementById('mobileControlsInfo').classList.add('hidden');
            document.getElementById('deviceTip').textContent = '💡 提示：鼠标或键盘控制，鱼儿会游向目标位置！';
        }
    }
    
    StartGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // 设置光标
        if (this.isMobile) {
            this.canvas.style.cursor = 'default';
        } else {
            this.canvas.style.cursor = 'none';
            document.getElementById('customCursor').classList.remove('hidden');
        }
        
        // 显示游戏提示
        this.ShowGameHints();
    }
    
    ActivateBoost() {
        if (this.boostCooldown <= 0 && this.gameState === 'playing') {
            this.boostActive = true;
            this.boostCooldown = 3000; // 3秒冷却
            
            setTimeout(() => {
                this.boostActive = false;
            }, 1000); // 1秒加速时间
        }
    }
    
    PauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseScreen').style.display = 'flex';
        }
    }
    
    ResumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseScreen').style.display = 'none';
        }
    }
    
    RestartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.comboTimer = 0;
        this.coins = 0;
        this.player.size = 25;
        this.player.scale = 1.0;
        this.player.isDead = false;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        
        this.InitializeGame();
        this.StartGame();
    }
    
    ToggleAutoMode() {
        this.autoMode = !this.autoMode;
        
        // 更新PC端按钮
        const autoText = document.getElementById('autoText');
        const autoBtn = document.getElementById('autoBtn');
        
        if (this.autoMode) {
            autoText.textContent = '🎮 手动';
            autoBtn.className = 'bg-purple-500/80 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold transition-all';
        } else {
            autoText.textContent = '🤖 AI代玩';
            autoBtn.className = 'bg-green-500/80 hover:bg-green-500 px-4 py-2 rounded-lg font-bold transition-all';
        }
        
        // 更新移动端按钮
        if (this.isMobile) {
            const mobileAutoText = document.getElementById('mobileAutoText');
            const mobileAutoBtn = document.getElementById('mobileAutoBtn');
            
            if (this.autoMode) {
                mobileAutoText.textContent = '手动';
                mobileAutoBtn.className = 'w-16 h-16 bg-purple-500/80 hover:bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs';
            } else {
                mobileAutoText.textContent = 'AI';
                mobileAutoBtn.className = 'w-16 h-16 bg-green-500/80 hover:bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs';
            }
        }
    }
    
    BackToMenu() {
        window.location.href = '../index.html';
    }
    
    Update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.UpdatePlayer(deltaTime);
        this.UpdateFishes(deltaTime);
        this.UpdateParticles(deltaTime);
        this.UpdateBubbles(deltaTime);
        this.CheckCollisions();
        this.CleanupObjects();
        this.SpawnNewFishes();
        this.CheckLevelUp();
    }
    
    UpdatePlayer(deltaTime) {
        if (this.player.isDead) {
            this.player.deathTime += deltaTime;
            if (this.player.deathTime > 2000) {
                this.lives--;
                if (this.lives <= 0) {
                    this.GameOver();
                    return;
                } else {
                    this.RespawnPlayer();
                }
            }
            return;
        }
        
        // 更新连击计时器
        this.comboTimer -= deltaTime;
        if (this.comboTimer <= 0 && this.combo > 0) {
            this.combo = 0;
            this.UpdateUI();
        }
        
        // 更新加速冷却
        this.boostCooldown = Math.max(0, this.boostCooldown - deltaTime);
        
        let targetX, targetY;
        
        if (this.autoMode) {
            // AI自动寻找目标
            const target = this.FindBestTarget();
            if (target) {
                targetX = target.x;
                targetY = target.y;
            } else {
                targetX = this.player.x;
                targetY = this.player.y;
            }
        } else if (this.isMobile && (this.mobileDirection.x !== 0 || this.mobileDirection.y !== 0)) {
            // 移动端按钮控制
            const moveSpeed = 8;
            targetX = this.player.x + this.mobileDirection.x * moveSpeed;
            targetY = this.player.y + this.mobileDirection.y * moveSpeed;
        } else {
            // 跟随鼠标/触屏
            targetX = this.mouse.x;
            targetY = this.mouse.y;
        }
        
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.player.direction = Math.atan2(dy, dx);
            
            // 计算移动速度（包含加速效果）
            let moveSpeed = this.player.speed;
            if (this.boostActive) {
                moveSpeed *= 2.5; // 加速时速度提升2.5倍
            }
            
            this.player.x += Math.cos(this.player.direction) * moveSpeed;
            this.player.y += Math.sin(this.player.direction) * moveSpeed;
        }
        
        // 边界检查
        this.player.x = Math.max(this.player.size, Math.min(this.canvas.width - this.player.size, this.player.x));
        this.player.y = Math.max(this.player.size, Math.min(this.canvas.height - this.player.size, this.player.y));
    }
    
    FindBestTarget() {
        let bestTarget = null;
        let bestScore = -1;
        
        for (const fish of this.fishes) {
            if (fish.size < this.player.size * 0.9) {
                const distance = this.GetDistance(this.player, fish);
                const safety = this.CalculateSafety(fish);
                const value = fish.value || fish.size;
                
                // 综合评分：价值高、距离近、安全的鱼优先
                const score = (value / (distance + 1)) * safety;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = fish;
                }
            }
        }
        
        return bestTarget;
    }
    
    CalculateSafety(targetFish) {
        let safety = 1.0;
        
        // 检查附近是否有危险的大鱼
        for (const fish of this.fishes) {
            if (fish !== targetFish && fish.size > this.player.size * 1.1) {
                const distanceToTarget = this.GetDistance(this.player, targetFish);
                const distanceToDanger = this.GetDistance(targetFish, fish);
                
                if (distanceToDanger < 100) {
                    safety *= 0.3; // 降低安全评分
                }
            }
        }
        
        return safety;
    }
    
    UpdateFishes(deltaTime) {
        this.fishes.forEach(fish => {
            // AI行为
            this.UpdateFishAI(fish, deltaTime);
            
            // 移动
            fish.x += Math.cos(fish.direction) * fish.speed;
            fish.y += Math.sin(fish.direction) * fish.speed;
            
            // 摆尾动画
            fish.wiggle += fish.wiggleSpeed;
            
            // 边界处理
            if (fish.x < 0 || fish.x > this.canvas.width) {
                fish.direction = Math.PI - fish.direction;
                fish.flipX = !fish.flipX;
            }
            if (fish.y < 0 || fish.y > this.canvas.height) {
                fish.direction = -fish.direction;
            }
            
            fish.x = Math.max(0, Math.min(this.canvas.width, fish.x));
            fish.y = Math.max(0, Math.min(this.canvas.height, fish.y));
        });
    }
    
    UpdateFishAI(fish, deltaTime) {
        const playerDist = this.GetDistance(fish, this.player);
        
        if (!this.player.isDead && playerDist < 150) {
            if (fish.size < this.player.size * 0.8) {
                // 小鱼逃跑
                fish.isFleeing = true;
                fish.fleeTime = 1000;
                const escapeAngle = Math.atan2(fish.y - this.player.y, fish.x - this.player.x);
                fish.direction = escapeAngle;
                fish.speed = Math.min(fish.speed * 1.5, 6);
            } else if (fish.size > this.player.size * 1.2 && fish.isAggressive) {
                // 大鱼追击
                const chaseAngle = Math.atan2(this.player.y - fish.y, this.player.x - fish.x);
                fish.direction = chaseAngle;
                fish.speed = Math.min(fish.speed * 1.2, 4);
            }
        }
        
        if (fish.isFleeing) {
            fish.fleeTime -= deltaTime;
            if (fish.fleeTime <= 0) {
                fish.isFleeing = false;
                fish.speed = Math.max(0.5, 4 - fish.size / 50);
            }
        }
        
        // 随机转向
        if (Math.random() < 0.02) {
            fish.direction += (Math.random() - 0.5) * 0.5;
        }
    }
    
    UpdateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // 重力
            particle.size *= 0.98;
            return particle.life > 0 && particle.size > 0.5;
        });
    }
    
    UpdateBubbles(deltaTime) {
        this.bubbles = this.bubbles.filter(bubble => {
            bubble.y -= bubble.speed;
            bubble.x += Math.sin(bubble.y * 0.01) * 0.5;
            return bubble.y > -50;
        });
        
        // 随机生成新气泡
        if (Math.random() < 0.3) {
            this.CreateBubble();
        }
    }
    
    CheckCollisions() {
        if (this.player.isDead) return;
        
        for (let i = this.fishes.length - 1; i >= 0; i--) {
            const fish = this.fishes[i];
            const distance = this.GetDistance(this.player, fish);
            
            if (distance < (this.player.size + fish.size) / 2) {
                if (fish.size < this.player.size * 0.9) {
                    // 吃掉小鱼
                    this.EatFish(fish, i);
                } else if (fish.size > this.player.size * 1.1) {
                    // 被大鱼吃掉
                    this.PlayerEaten();
                }
            }
        }
    }
    
    EatFish(fish, index) {
        // 基础分数
        let points = Math.floor(fish.size * 2);
        
        // 连击系统
        this.combo++;
        this.comboTimer = 3000; // 3秒连击时间
        
        // 连击加成
        if (this.combo > 1) {
            const comboBonus = Math.min(this.combo * 0.5, 3.0); // 最多3倍加成
            points = Math.floor(points * (1 + comboBonus));
        }
        
        this.score += points;
        
        // 金币奖励
        let coinReward = Math.floor(fish.size / 5) + 1;
        if (this.combo >= 5) coinReward *= 2; // 连击5次以上双倍金币
        if (this.combo >= 10) coinReward *= 2; // 连击10次以上四倍金币
        this.coins += coinReward;
        
        // 玩家成长
        this.player.size = Math.min(this.player.maxSize, this.player.size + fish.size * 0.05);
        this.player.scale = this.player.size / 25;
        
        // 创建粒子效果
        this.CreateEatParticles(fish.x, fish.y, fish.color);
        
        // 显示分数和连击
        this.ShowScorePopup(fish.x, fish.y, points, coinReward, this.combo);
        
        // 连击特效
        if (this.combo >= 5) {
            this.ShowComboEffect(fish.x, fish.y, this.combo);
        }
        
        // 移除被吃的鱼
        this.fishes.splice(index, 1);
        
        // 检查成就
        this.CheckAchievements();
        
        this.UpdateUI();
    }
    
    PlayerEaten() {
        this.player.isDead = true;
        this.player.deathTime = 0;
        
        // 死亡粒子效果
        this.CreateDeathParticles(this.player.x, this.player.y);
    }
    
    RespawnPlayer() {
        this.player.isDead = false;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.size = Math.max(20, this.player.size * 0.8); // 死亡后略微变小
        this.player.scale = this.player.size / 25;
    }
    
    GameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('maxSize').textContent = this.player.scale.toFixed(1);
        
        // 显示成就
        let achievementText = '';
        if (this.score > 1000) achievementText = '🏆 分数达人！';
        else if (this.player.scale > 3) achievementText = '🐋 巨鱼成就！';
        else if (this.score > 500) achievementText = '⭐ 不错的表现！';
        
        document.getElementById('achievementText').textContent = achievementText;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
    
    CreateEatParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 5 + 2,
                color: color,
                life: 1000 + Math.random() * 500
            });
        }
    }
    
    CreateDeathParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 8 + 3,
                color: '#FF0000',
                life: 2000 + Math.random() * 1000
            });
        }
    }
    
    CreateBubbles() {
        for (let i = 0; i < 20; i++) {
            this.CreateBubble();
        }
    }
    
    CreateBubble() {
        this.bubbles.push({
            x: Math.random() * this.canvas.width,
            y: this.canvas.height + 50,
            size: Math.random() * 15 + 5,
            speed: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    ShowScorePopup(x, y, points, coins, combo) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        
        let content = `+${points}`;
        if (coins > 0) content += ` 💰+${coins}`;
        if (combo > 1) content += ` ⚡${combo}x`;
        
        popup.innerHTML = content;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        
        // 连击越高颜色越亮
        if (combo >= 10) {
            popup.style.color = '#FF1493'; // 深粉色
            popup.style.fontSize = '28px';
        } else if (combo >= 5) {
            popup.style.color = '#FF6347'; // 橙红色
            popup.style.fontSize = '24px';
        } else if (combo >= 3) {
            popup.style.color = '#FFD700'; // 金色
        }
        
        document.getElementById('gameContainer').appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 2000);
    }
    
    ShowComboEffect(x, y, combo) {
        const effect = document.createElement('div');
        effect.className = 'score-popup';
        effect.style.left = x + 'px';
        effect.style.top = (y - 50) + 'px';
        effect.style.fontSize = '32px';
        effect.style.fontWeight = 'bold';
        
        if (combo >= 15) {
            effect.innerHTML = '🔥 超神！！！';
            effect.style.color = '#FF0000';
        } else if (combo >= 10) {
            effect.innerHTML = '⚡ 无敌！！';
            effect.style.color = '#FF1493';
        } else if (combo >= 5) {
            effect.innerHTML = '💥 连击！';
            effect.style.color = '#FF6347';
        }
        
        document.getElementById('gameContainer').appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 3000);
    }
    
    CheckAchievements() {
        // 分数成就
        if (this.score >= 100 && !this.achievements.includes('first100')) {
            this.ShowAchievement('🎯 首次100分！奖励50金币！');
            this.achievements.push('first100');
            this.coins += 50;
        }
        
        if (this.score >= 500 && !this.achievements.includes('score500')) {
            this.ShowAchievement('⭐ 分数高手！奖励100金币！');
            this.achievements.push('score500');
            this.coins += 100;
        }
        
        if (this.score >= 1000 && !this.achievements.includes('score1000')) {
            this.ShowAchievement('🏆 千分达人！奖励200金币！');
            this.achievements.push('score1000');
            this.coins += 200;
        }
        
        // 体型成就
        if (this.player.scale >= 2 && !this.achievements.includes('doubleSize')) {
            this.ShowAchievement('📈 体型翻倍！奖励80金币！');
            this.achievements.push('doubleSize');
            this.coins += 80;
        }
        
        if (this.player.scale >= 4 && !this.achievements.includes('quadSize')) {
            this.ShowAchievement('🐋 海洋巨兽！奖励150金币！');
            this.achievements.push('quadSize');
            this.coins += 150;
        }
        
        // 连击成就
        if (this.combo >= 5 && !this.achievements.includes('combo5')) {
            this.ShowAchievement('⚡ 连击新手！奖励30金币！');
            this.achievements.push('combo5');
            this.coins += 30;
        }
        
        if (this.combo >= 10 && !this.achievements.includes('combo10')) {
            this.ShowAchievement('💥 连击专家！奖励80金币！');
            this.achievements.push('combo10');
            this.coins += 80;
        }
        
        if (this.combo >= 20 && !this.achievements.includes('combo20')) {
            this.ShowAchievement('🔥 连击大师！奖励200金币！');
            this.achievements.push('combo20');
            this.coins += 200;
        }
        
        // 金币成就
        if (this.coins >= 500 && !this.achievements.includes('rich500')) {
            this.ShowAchievement('💰 小富翁！');
            this.achievements.push('rich500');
        }
        
        if (this.coins >= 1000 && !this.achievements.includes('rich1000')) {
            this.ShowAchievement('🤑 海洋富豪！');
            this.achievements.push('rich1000');
        }
    }
    
    ShowAchievement(message) {
        const popup = document.getElementById('achievementPopup');
        const messageElement = document.getElementById('achievementMessage');
        
        messageElement.textContent = message;
        popup.classList.remove('hidden');
        
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 3000);
    }
    
    ShowGameHints() {
        const hints = this.isMobile ? [
            "📱 触屏或使用方向按钮控制鱼儿",
            "🚀 点击加速按钮获得爆发速度",
            "🐟 蓝色和绿色鱼可以安全吃掉",
            "⚠️ 红色和深红鱼会吃掉你！",
            "📈 吃鱼成长，体型越大越强",
            "🤖 点击AI按钮让电脑代玩"
        ] : [
            "🖱️ 鼠标移动或WASD/方向键控制",
            "⚡ 按Shift键或点击加速按钮冲刺",
            "🐟 蓝色和绿色鱼可以安全吃掉",
            "⚠️ 红色和深红鱼会吃掉你！",
            "📈 吃鱼成长，体型越大越强",
            "⌨️ 按空格键暂停，AI按钮自动代玩"
        ];
        
        let currentHint = 0;
        const hintElement = document.getElementById('gameHints');
        const hintText = document.getElementById('hintText');
        
        hintElement.classList.remove('hidden');
        
        const showNextHint = () => {
            if (this.gameState === 'playing' && currentHint < hints.length) {
                hintText.textContent = hints[currentHint];
                currentHint++;
                
                setTimeout(() => {
                    if (currentHint >= hints.length) {
                        hintElement.classList.add('hidden');
                    } else {
                        showNextHint();
                    }
                }, 3000);
            }
        };
        
        showNextHint();
    }
    
    SpawnNewFishes() {
        // 保持鱼的数量
        while (this.fishes.length < this.fishCount) {
            this.fishes.push(this.CreateRandomFish());
        }
    }
    
    CheckLevelUp() {
        const newLevel = Math.floor(this.score / 300) + 1; // 提升等级所需分数增加
        if (newLevel > this.level) {
            this.level = newLevel;
            this.fishCount = Math.min(50, 35 + this.level * 3); // 减少鱼的数量增长
            this.ShowAchievement(`🎊 等级提升到 ${this.level}！奖励100金币！`);
            this.coins += 100; // 升级奖励金币
            this.UpdateUI();
        }
    }
    
    CleanupObjects() {
        // 清理超出边界太远的鱼
        this.fishes = this.fishes.filter(fish => {
            return fish.x >= -100 && fish.x <= this.canvas.width + 100 &&
                   fish.y >= -100 && fish.y <= this.canvas.height + 100;
        });
    }
    
    GetDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    LightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const B = (num >> 8 & 0x00FF) + amt;
        const G = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                     (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + 
                     (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
    }
    
    DarkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const B = (num >> 8 & 0x00FF) - amt;
        const G = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 + 
                     (B > 255 ? 255 : B < 0 ? 0 : B) * 0x100 + 
                     (G > 255 ? 255 : G < 0 ? 0 : G)).toString(16).slice(1);
    }
    
    UpdateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('fishSize').textContent = this.player.scale.toFixed(1);
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('combo').textContent = this.combo;
        document.getElementById('coins').textContent = this.coins;
        
        // 连击显示特效
        const comboElement = document.getElementById('combo');
        if (this.combo >= 10) {
            comboElement.style.color = '#FF1493';
            comboElement.style.textShadow = '0 0 10px #FF1493';
        } else if (this.combo >= 5) {
            comboElement.style.color = '#FF6347';
            comboElement.style.textShadow = '0 0 8px #FF6347';
        } else if (this.combo >= 3) {
            comboElement.style.color = '#FFD700';
            comboElement.style.textShadow = '0 0 6px #FFD700';
        } else {
            comboElement.style.color = '';
            comboElement.style.textShadow = '';
        }
    }
    
    Render() {
        // 绘制海洋背景
        this.RenderOceanBackground();
        
        // 绘制气泡
        this.RenderBubbles();
        
        // 绘制其他鱼
        this.fishes.forEach(fish => this.RenderFish(fish));
        
        // 绘制玩家
        if (!this.player.isDead) {
            this.RenderPlayer();
        }
        
        // 绘制粒子
        this.RenderParticles();
        
        // 绘制海洋表面效果
        this.RenderWaterSurface();
    }
    
    RenderOceanBackground() {
        // 深度渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // 浅蓝色 - 海面
        gradient.addColorStop(0.3, '#4682B4'); // 钢蓝色
        gradient.addColorStop(0.7, '#2F4F4F'); // 深灰蓝
        gradient.addColorStop(1, '#191970'); // 深蓝色 - 海底
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 添加光线效果
        const time = Date.now() * 0.001;
        for (let i = 0; i < 5; i++) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.1 + Math.sin(time + i) * 0.05;
            const lightGradient = this.ctx.createLinearGradient(
                this.canvas.width * (0.2 + i * 0.15), 0,
                this.canvas.width * (0.2 + i * 0.15), this.canvas.height * 0.6
            );
            lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = lightGradient;
            this.ctx.fillRect(
                this.canvas.width * (0.15 + i * 0.15), 0,
                this.canvas.width * 0.1, this.canvas.height * 0.8
            );
            this.ctx.restore();
        }
    }
    
    RenderWaterSurface() {
        // 水面波浪效果
        const time = Date.now() * 0.003;
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 20 + i * 10);
            
            for (let x = 0; x <= this.canvas.width; x += 20) {
                const y = 20 + i * 10 + Math.sin((x * 0.01) + time + i) * 8;
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 - i * 0.1})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    RenderBubbles() {
        this.bubbles.forEach(bubble => {
            this.ctx.save();
            this.ctx.globalAlpha = bubble.opacity;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.stroke();
            this.ctx.restore();
        });
    }
    
    RenderFish(fish) {
        this.ctx.save();
        this.ctx.translate(fish.x, fish.y);
        this.ctx.rotate(fish.direction + (fish.flipX ? Math.PI : 0));
        this.ctx.scale(fish.flipX ? -1 : 1, 1);
        
        // 鱼身阴影
        this.ctx.save();
        this.ctx.translate(3, 3);
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, fish.size, fish.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        this.ctx.restore();
        
        // 鱼身渐变
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, fish.size);
        gradient.addColorStop(0, this.LightenColor(fish.color, 40));
        gradient.addColorStop(0.7, fish.color);
        gradient.addColorStop(1, this.DarkenColor(fish.color, 30));
        
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, fish.size, fish.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.strokeStyle = this.DarkenColor(fish.color, 50);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 鱼鳞纹理
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        for (let i = -fish.size * 0.5; i < fish.size * 0.5; i += fish.size * 0.2) {
            this.ctx.beginPath();
            this.ctx.arc(i, 0, fish.size * 0.15, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        this.ctx.restore();
        
        // 鱼尾
        const tailWiggle = Math.sin(fish.wiggle) * 0.3;
        const tailGradient = this.ctx.createLinearGradient(-fish.size, 0, -fish.size * 1.8, 0);
        tailGradient.addColorStop(0, fish.color);
        tailGradient.addColorStop(1, this.DarkenColor(fish.color, 40));
        
        this.ctx.beginPath();
        this.ctx.moveTo(-fish.size, 0);
        this.ctx.lineTo(-fish.size * 1.5, -fish.size * 0.4 + tailWiggle);
        this.ctx.lineTo(-fish.size * 1.8, 0 + tailWiggle);
        this.ctx.lineTo(-fish.size * 1.5, fish.size * 0.4 + tailWiggle);
        this.ctx.closePath();
        this.ctx.fillStyle = tailGradient;
        this.ctx.fill();
        this.ctx.strokeStyle = this.DarkenColor(fish.color, 50);
        this.ctx.stroke();
        
        // 背鳍
        this.ctx.beginPath();
        this.ctx.moveTo(-fish.size * 0.2, -fish.size * 0.6);
        this.ctx.lineTo(0, -fish.size * 0.9);
        this.ctx.lineTo(fish.size * 0.2, -fish.size * 0.6);
        this.ctx.fillStyle = this.DarkenColor(fish.color, 20);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 眼睛
        this.ctx.beginPath();
        this.ctx.arc(fish.size * 0.3, -fish.size * 0.2, fish.size * 0.12, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.strokeStyle = 'gray';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // 瞳孔
        this.ctx.beginPath();
        this.ctx.arc(fish.size * 0.35, -fish.size * 0.2, fish.size * 0.06, 0, Math.PI * 2);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        
        // 眼睛高光
        this.ctx.beginPath();
        this.ctx.arc(fish.size * 0.37, -fish.size * 0.22, fish.size * 0.02, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        
        // 嘴巴
        this.ctx.beginPath();
        this.ctx.arc(fish.size * 0.8, 0, fish.size * 0.08, 0, Math.PI * 2);
        this.ctx.fillStyle = this.DarkenColor(fish.color, 60);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    RenderPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.direction);
        
        // 玩家光环动画
        const time = Date.now() * 0.005;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.player.size + 8 + i * 4 + Math.sin(time + i) * 3, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 - i * 0.2})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // 鱼身阴影
        this.ctx.save();
        this.ctx.translate(4, 4);
        this.ctx.globalAlpha = 0.4;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.player.size, this.player.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        this.ctx.restore();
        
        // 鱼身渐变
        const bodyGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.player.size);
        bodyGradient.addColorStop(0, '#FFFF99');
        bodyGradient.addColorStop(0.5, this.player.color);
        bodyGradient.addColorStop(1, '#FF8C00');
        
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.player.size, this.player.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = bodyGradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#FF8C00';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 王冠效果（当鱼足够大时）
        if (this.player.size > 40) {
            this.ctx.save();
            this.ctx.translate(0, -this.player.size * 0.8);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.moveTo(-10, 0);
            this.ctx.lineTo(-5, -15);
            this.ctx.lineTo(0, -8);
            this.ctx.lineTo(5, -15);
            this.ctx.lineTo(10, 0);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.restore();
        }
        
        // 鱼鳞纹理
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        for (let i = -this.player.size * 0.5; i < this.player.size * 0.5; i += this.player.size * 0.15) {
            for (let j = -this.player.size * 0.3; j < this.player.size * 0.3; j += this.player.size * 0.15) {
                this.ctx.beginPath();
                this.ctx.arc(i, j, this.player.size * 0.08, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#FFFF99';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
        this.ctx.restore();
        
        // 鱼尾渐变
        const tailGradient = this.ctx.createLinearGradient(-this.player.size, 0, -this.player.size * 1.8, 0);
        tailGradient.addColorStop(0, this.player.color);
        tailGradient.addColorStop(1, '#FF8C00');
        
        this.ctx.beginPath();
        this.ctx.moveTo(-this.player.size, 0);
        this.ctx.lineTo(-this.player.size * 1.5, -this.player.size * 0.4);
        this.ctx.lineTo(-this.player.size * 1.8, 0);
        this.ctx.lineTo(-this.player.size * 1.5, this.player.size * 0.4);
        this.ctx.closePath();
        this.ctx.fillStyle = tailGradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#FF8C00';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 背鳍
        this.ctx.beginPath();
        this.ctx.moveTo(-this.player.size * 0.2, -this.player.size * 0.6);
        this.ctx.lineTo(0, -this.player.size * 0.9);
        this.ctx.lineTo(this.player.size * 0.2, -this.player.size * 0.6);
        this.ctx.fillStyle = '#FFA500';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FF8C00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 眼睛
        this.ctx.beginPath();
        this.ctx.arc(this.player.size * 0.3, -this.player.size * 0.2, this.player.size * 0.12, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.strokeStyle = 'gold';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 瞳孔
        this.ctx.beginPath();
        this.ctx.arc(this.player.size * 0.35, -this.player.size * 0.2, this.player.size * 0.06, 0, Math.PI * 2);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        
        // 眼睛高光
        this.ctx.beginPath();
        this.ctx.arc(this.player.size * 0.37, -this.player.size * 0.22, this.player.size * 0.02, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        
        // 嘴巴
        this.ctx.beginPath();
        this.ctx.arc(this.player.size * 0.8, 0, this.player.size * 0.08, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FF6347';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    RenderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life / 1000;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    StartGameLoop() {
        const gameLoop = (currentTime) => {
            this.deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            this.Update(this.deltaTime);
            this.Render();
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }
}

// 游戏初始化
window.addEventListener('load', () => {
    new FishBattleGame();
}); 