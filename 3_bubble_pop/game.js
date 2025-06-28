// 泡泡爆破游戏 - 魔性解压小游戏
class BubblePopGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.bubbles = [];
        this.particles = [];
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.power = 0;
        this.maxPower = 100;
        this.gameRunning = true;
        this.isPaused = false;
        this.boostMode = false;
        this.boostTimer = 0;
        this.achievements = [];
        this.highScore = parseInt(localStorage.getItem('bubblePopHighScore')) || 0;
        
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        
        this.achievementList = [
            { id: 'first_pop', name: '初次爆破', desc: '爆破第一个泡泡', threshold: 1, achieved: false },
            { id: 'combo_5', name: '连击新手', desc: '达成5连击', threshold: 5, achieved: false },
            { id: 'combo_10', name: '连击高手', desc: '达成10连击', threshold: 10, achieved: false },
            { id: 'combo_20', name: '连击大师', desc: '达成20连击', threshold: 20, achieved: false },
            { id: 'combo_50', name: '连击之神', desc: '达成50连击', threshold: 50, achieved: false },
            { id: 'score_1000', name: '千分达人', desc: '得分超过1000', threshold: 1000, achieved: false },
            { id: 'score_5000', name: '五千勇士', desc: '得分超过5000', threshold: 5000, achieved: false },
            { id: 'score_10000', name: '万分传说', desc: '得分超过10000', threshold: 10000, achieved: false },
            { id: 'boost_master', name: '爆炸专家', desc: '使用爆炸模式', threshold: 1, achieved: false },
            { id: 'speed_demon', name: '速度恶魔', desc: '1分钟内爆破100个泡泡', threshold: 100, achieved: false },
            { id: 'perfectionist', name: '完美主义者', desc: '连续50次点击都命中', threshold: 50, achieved: false }
        ];
        
        // 添加统计数据
        this.stats = {
            totalBubblesPoppedInMinute: 0,
            consecutiveHits: 0,
            startTime: Date.now()
        };
        
        this.InitCanvas();
        this.InitEventListeners();
        this.UpdateUI();
        this.GameLoop();
        this.SpawnBubbles();
    }
    
    InitCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    InitEventListeners() {
        // 点击事件
        this.canvas.addEventListener('click', (e) => this.HandleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.HandleClick({ clientX: touch.clientX, clientY: touch.clientY });
        });
        
        // 控制按钮
        document.getElementById('pauseBtn').addEventListener('click', () => this.TogglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.RestartGame());
        document.getElementById('boostBtn').addEventListener('click', () => this.ActivateBoost());
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.TogglePause();
            } else if (e.code === 'KeyR') {
                this.RestartGame();
            } else if (e.code === 'KeyB') {
                this.ActivateBoost();
            }
        });
    }
    
    HandleClick(e) {
        if (!this.gameRunning || this.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let hit = false;
        
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
            
            if (distance < bubble.radius) {
                this.PopBubble(bubble, i, x, y);
                hit = true;
                break;
            }
        }
        
        if (!hit) {
            this.ResetCombo();
            this.stats.consecutiveHits = 0; // 重置连续命中
        } else {
            this.stats.consecutiveHits++;
            this.stats.totalBubblesPoppedInMinute++;
        }
    }
    
    PopBubble(bubble, index, clickX, clickY) {
        // 计算分数
        let points = Math.floor(bubble.radius * 2);
        if (this.combo > 0) {
            points *= (1 + this.combo * 0.1);
        }
        if (this.boostMode) {
            points *= 2;
        }
        
        // 特殊泡泡效果
        if (bubble.isSpecial) {
            switch (bubble.specialType) {
                case 'rainbow':
                    points *= 5;
                    this.CreateRainbowExplosion(bubble.x, bubble.y);
                    break;
                case 'giant':
                    points *= 3;
                    this.CreateGiantExplosion(bubble.x, bubble.y);
                    break;
                case 'multiplier':
                    points *= 2;
                    this.combo += 3; // 额外连击奖励
                    break;
            }
        }
        
        this.score += Math.floor(points);
        this.combo++;
        this.comboTimer = 120; // 2秒连击时间
        this.power = Math.min(this.maxPower, this.power + 5);
        
        // 创建粒子效果
        this.CreateParticles(bubble.x, bubble.y, bubble.color);
        
        // 显示浮动分数
        this.ShowFloatingScore(clickX, clickY, Math.floor(points));
        
        // 移除泡泡
        this.bubbles.splice(index, 1);
        
        // 检查成就
        this.CheckAchievements();
        
        // 更新UI
        this.UpdateUI();
        
        // 爆炸模式下的连锁反应
        if (this.boostMode) {
            this.CreateExplosion(bubble.x, bubble.y, bubble.radius * 2);
        }
        
        // 播放音效（模拟）
        this.PlayPopSound(bubble.radius);
        
        // 震动反馈
        this.TriggerVibration(bubble.radius);
    }
    
    CreateParticles(x, y, color) {
        const particleCount = 8 + Math.floor(Math.random() * 8);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 6 + 2,
                color: color,
                life: 30 + Math.random() * 30,
                maxLife: 30 + Math.random() * 30
            });
        }
    }
    
    CreateExplosion(x, y, radius) {
        // 爆炸波及范围内的泡泡
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
            
            if (distance < radius) {
                this.PopBubble(bubble, i, bubble.x, bubble.y);
            }
        }
    }
    
    ShowFloatingScore(x, y, points) {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'floating-score';
        scoreElement.textContent = `+${points}`;
        scoreElement.style.left = x + 'px';
        scoreElement.style.top = y + 'px';
        
        document.body.appendChild(scoreElement);
        
        setTimeout(() => {
            if (scoreElement.parentNode) {
                scoreElement.parentNode.removeChild(scoreElement);
            }
        }, 1000);
    }
    
    PlayPopSound(radius) {
        // 使用Web Audio API创建音效
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            try {
                const audioContext = new (AudioContext || webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                const frequency = 200 + (50 - radius) * 10;
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(frequency * 2, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (e) {
                // 音效创建失败，静默处理
            }
        }
    }
    
    TriggerVibration(radius) {
        // 为移动设备添加震动反馈
        if (navigator.vibrate) {
            const intensity = Math.min(100, radius * 2);
            navigator.vibrate(intensity);
        }
    }
    
    CreateRainbowExplosion(x, y) {
        // 创建彩虹爆炸效果
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 60 + Math.random() * 30,
                maxLife: 60 + Math.random() * 30
            });
        }
    }
    
    CreateGiantExplosion(x, y) {
        // 创建巨大爆炸效果
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 12 + 6,
                color: '#FFD700',
                life: 80 + Math.random() * 40,
                maxLife: 80 + Math.random() * 40
            });
        }
    }
    
    SpawnBubbles() {
        if (!this.gameRunning || this.isPaused) {
            setTimeout(() => this.SpawnBubbles(), 100);
            return;
        }
        
        const isSpecial = Math.random() < 0.05; // 5%概率生成特殊泡泡
        const bubble = {
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: this.canvas.height + 50,
            radius: 20 + Math.random() * 30,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            speed: 1 + Math.random() * 2,
            life: 300 + Math.random() * 200,
            maxLife: 300 + Math.random() * 200,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            isSpecial: isSpecial,
            specialType: isSpecial ? ['rainbow', 'giant', 'multiplier'][Math.floor(Math.random() * 3)] : null
        };
        
        this.bubbles.push(bubble);
        
        // 控制生成速度
        let spawnDelay = 800 - this.score * 0.5;
        spawnDelay = Math.max(200, spawnDelay);
        
        if (this.boostMode) {
            spawnDelay *= 0.5;
        }
        
        setTimeout(() => this.SpawnBubbles(), spawnDelay);
    }
    
    UpdateBubbles() {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            // 移动泡泡
            bubble.y -= bubble.speed;
            bubble.x += Math.sin(bubble.wobble) * 0.5;
            bubble.wobble += bubble.wobbleSpeed;
            
            // 生命周期
            bubble.life--;
            
            // 移除超出屏幕或生命结束的泡泡
            if (bubble.y + bubble.radius < 0 || bubble.life <= 0) {
                this.bubbles.splice(i, 1);
                if (bubble.life <= 0) {
                    this.ResetCombo();
                }
            }
        }
    }
    
    UpdateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // 重力
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    UpdateCombo() {
        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else if (this.combo > 0) {
            this.ResetCombo();
        }
    }
    
    UpdateBoost() {
        if (this.boostMode) {
            this.boostTimer--;
            if (this.boostTimer <= 0) {
                this.boostMode = false;
                document.getElementById('boostBtn').style.background = 'rgba(255, 100, 100, 0.3)';
            }
        }
        
        if (this.power > 0 && !this.boostMode) {
            this.power = Math.max(0, this.power - 0.2);
        }
    }
    
    ResetCombo() {
        this.combo = 0;
        this.comboTimer = 0;
        this.UpdateUI();
    }
    
    ActivateBoost() {
        if (this.power >= 50 && !this.boostMode) {
            this.boostMode = true;
            this.boostTimer = 300; // 5秒
            this.power = Math.max(0, this.power - 50);
            document.getElementById('boostBtn').style.background = 'rgba(255, 50, 50, 0.8)';
            
            // 检查爆炸专家成就
            const achievement = this.achievementList.find(a => a.id === 'boost_master');
            if (achievement && !achievement.achieved) {
                achievement.achieved = true;
                this.ShowAchievement(achievement);
            }
        }
    }
    
    CheckAchievements() {
        this.achievementList.forEach(achievement => {
            if (achievement.achieved) return;
            
            let shouldUnlock = false;
            
            switch (achievement.id) {
                case 'first_pop':
                    shouldUnlock = this.score > 0;
                    break;
                case 'combo_5':
                    shouldUnlock = this.combo >= 5;
                    break;
                case 'combo_10':
                    shouldUnlock = this.combo >= 10;
                    break;
                case 'combo_20':
                    shouldUnlock = this.combo >= 20;
                    break;
                case 'combo_50':
                    shouldUnlock = this.combo >= 50;
                    break;
                case 'score_1000':
                    shouldUnlock = this.score >= 1000;
                    break;
                case 'score_5000':
                    shouldUnlock = this.score >= 5000;
                    break;
                case 'score_10000':
                    shouldUnlock = this.score >= 10000;
                    break;
                case 'speed_demon':
                    const timeElapsed = (Date.now() - this.stats.startTime) / 1000;
                    shouldUnlock = timeElapsed <= 60 && this.stats.totalBubblesPoppedInMinute >= 100;
                    break;
                case 'perfectionist':
                    shouldUnlock = this.stats.consecutiveHits >= 50;
                    break;
            }
            
            if (shouldUnlock) {
                achievement.achieved = true;
                this.ShowAchievement(achievement);
            }
        });
    }
    
    ShowAchievement(achievement) {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement';
        achievementElement.innerHTML = `
            <div style="font-size: 16px;">🏆 ${achievement.name}</div>
            <div style="font-size: 12px; opacity: 0.8;">${achievement.desc}</div>
        `;
        
        document.getElementById('achievements').appendChild(achievementElement);
        
        setTimeout(() => {
            if (achievementElement.parentNode) {
                achievementElement.parentNode.removeChild(achievementElement);
            }
        }, 3000);
    }
    
    Render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景效果
        this.RenderBackground();
        
        // 绘制泡泡
        this.bubbles.forEach(bubble => this.RenderBubble(bubble));
        
        // 绘制粒子
        this.particles.forEach(particle => this.RenderParticle(particle));
        
        // 绘制爆炸模式效果
        if (this.boostMode) {
            this.RenderBoostEffect();
        }
    }
    
    RenderBackground() {
        // 动态背景
        const time = Date.now() * 0.001;
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2 + Math.sin(time) * 100,
            this.canvas.height / 2 + Math.cos(time) * 100,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height)
        );
        
        gradient.addColorStop(0, `rgba(30, 144, 255, ${0.1 + Math.sin(time) * 0.05})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    RenderBubble(bubble) {
        const alpha = Math.min(1, bubble.life / bubble.maxLife);
        
        // 泡泡主体
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // 特殊泡泡效果
        if (bubble.isSpecial) {
            // 特殊泡泡的闪烁效果
            const time = Date.now() * 0.01;
            this.ctx.globalAlpha = alpha * (0.7 + Math.sin(time) * 0.3);
            
            // 特殊泡泡的外圈彩虹光晕
            if (bubble.specialType === 'rainbow') {
                const rainbowGradient = this.ctx.createRadialGradient(
                    bubble.x, bubble.y, 0,
                    bubble.x, bubble.y, bubble.radius + 20
                );
                rainbowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
                rainbowGradient.addColorStop(0.2, 'rgba(255, 127, 0, 0.6)');
                rainbowGradient.addColorStop(0.4, 'rgba(255, 255, 0, 0.4)');
                rainbowGradient.addColorStop(0.6, 'rgba(0, 255, 0, 0.2)');
                rainbowGradient.addColorStop(0.8, 'rgba(0, 0, 255, 0.1)');
                rainbowGradient.addColorStop(1, 'rgba(148, 0, 211, 0)');
                
                this.ctx.fillStyle = rainbowGradient;
                this.ctx.beginPath();
                this.ctx.arc(bubble.x, bubble.y, bubble.radius + 20, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // 外圈光晕
        const glowGradient = this.ctx.createRadialGradient(
            bubble.x, bubble.y, 0,
            bubble.x, bubble.y, bubble.radius + 10
        );
        glowGradient.addColorStop(0, bubble.color + '80');
        glowGradient.addColorStop(1, bubble.color + '00');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(bubble.x, bubble.y, bubble.radius + 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 泡泡本体
        const bubbleGradient = this.ctx.createRadialGradient(
            bubble.x - bubble.radius * 0.3,
            bubble.y - bubble.radius * 0.3,
            0,
            bubble.x,
            bubble.y,
            bubble.radius
        );
        bubbleGradient.addColorStop(0, bubble.color + 'CC');
        bubbleGradient.addColorStop(0.7, bubble.color + '88');
        bubbleGradient.addColorStop(1, bubble.color + '44');
        
        this.ctx.fillStyle = bubbleGradient;
        this.ctx.beginPath();
        this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 高光效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(
            bubble.x - bubble.radius * 0.3,
            bubble.y - bubble.radius * 0.3,
            bubble.radius * 0.3,
            0, Math.PI * 2
        );
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    RenderParticle(particle) {
        const alpha = particle.life / particle.maxLife;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    RenderBoostEffect() {
        const time = Date.now() * 0.01;
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#FF6B6B';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 10]);
        this.ctx.lineDashOffset = time;
        this.ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
        this.ctx.restore();
    }
    
    UpdateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        
        const comboDisplay = document.getElementById('comboDisplay');
        if (this.combo > 1) {
            comboDisplay.style.display = 'block';
            comboDisplay.className = this.combo > 5 ? 'combo-display active' : 'combo-display';
            document.getElementById('comboValue').textContent = this.combo;
        } else {
            comboDisplay.style.display = 'none';
        }
        
        const powerPercentage = (this.power / this.maxPower) * 100;
        document.getElementById('powerFill').style.height = powerPercentage + '%';
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('bubblePopHighScore', this.highScore.toString());
        }
        
        // 更新按钮状态
        document.getElementById('pauseBtn').textContent = this.isPaused ? '▶️ 继续' : '⏸️ 暂停';
        
        const boostBtn = document.getElementById('boostBtn');
        boostBtn.disabled = this.power < 50 && !this.boostMode;
        boostBtn.style.opacity = boostBtn.disabled ? '0.5' : '1';
    }
    
    TogglePause() {
        this.isPaused = !this.isPaused;
        this.UpdateUI();
    }
    
    RestartGame() {
        this.bubbles = [];
        this.particles = [];
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.power = 0;
        this.boostMode = false;
        this.boostTimer = 0;
        this.isPaused = false;
        this.gameRunning = true;
        
        // 重置成就状态
        this.achievementList.forEach(achievement => {
            achievement.achieved = false;
        });
        
        // 重置统计数据
        this.stats = {
            totalBubblesPoppedInMinute: 0,
            consecutiveHits: 0,
            startTime: Date.now()
        };
        
        this.UpdateUI();
        
        // 清除浮动分数
        document.querySelectorAll('.floating-score').forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        
        // 清除成就显示
        document.getElementById('achievements').innerHTML = '';
    }
    
    GameLoop() {
        if (this.gameRunning && !this.isPaused) {
            this.UpdateBubbles();
            this.UpdateParticles();
            this.UpdateCombo();
            this.UpdateBoost();
        }
        
        this.Render();
        this.UpdateUI();
        
        requestAnimationFrame(() => this.GameLoop());
    }
}

// 返回游戏中心
function GoBack() {
    window.location.href = '../index.html';
}

// 启动游戏
let game;
window.addEventListener('load', () => {
    game = new BubblePopGame();
});

// 防止页面滚动
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false }); 