// 游戏中心 - 主要交互逻辑

class GameCenter {
    constructor() {
        this.games = [
            {
                id: 1,
                name: "AI模型训练师",
                path: "1_AI_model_trainer/",
                description: "训练强大的AI模型，体验机器学习的魅力",
                features: ["🤖 AI助手", "⚔️ 对战", "🎰 转盘"],
                status: "available"
            },
            {
                id: 2,
                name: "量子计算模拟器",
                path: "2_quantum_simulator/",
                description: "探索量子世界的神秘力量",
                features: ["⚛️ 量子", "🔬 实验", "🌌 探索"],
                status: "coming_soon"
            },
            {
                id: 3,
                name: "区块链挖矿大亨",
                path: "3_blockchain_miner/",
                description: "建立你的数字货币帝国",
                features: ["⛏️ 挖矿", "💎 NFT", "📈 交易"],
                status: "coming_soon"
            },
            {
                id: 4,
                name: "太空殖民计划",
                path: "4_space_colony/",
                description: "征服星辰大海，建设太空基地",
                features: ["🚀 探索", "🏗️ 建设", "👽 外星"],
                status: "coming_soon"
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createParticleEffect();
        this.startAnimations();
        this.trackVisitorStats();
    }

    setupEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                const gameNumber = parseInt(e.key);
                this.navigateToGame(gameNumber);
            }
        });

        // 游戏卡片点击效果
        document.querySelectorAll('.game-card').forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                this.playHoverSound();
                this.createHoverEffect(card);
            });

            card.addEventListener('click', (e) => {
                if (index === 0) { // 只有第一个游戏可用
                    this.playClickSound();
                    this.createClickEffect(e.target);
                }
            });
        });

        // 阻止占位卡片点击
        document.querySelectorAll('.game-card-placeholder').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoonNotification();
            });
        });
    }

    navigateToGame(gameNumber) {
        const game = this.games.find(g => g.id === gameNumber);
        if (game && game.status === 'available') {
            this.playClickSound();
            this.showLoadingAnimation();
            setTimeout(() => {
                window.location.href = game.path;
            }, 1000);
        } else {
            this.showComingSoonNotification();
        }
    }

    createParticleEffect() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'fixed inset-0 pointer-events-none z-0';
        document.body.appendChild(particleContainer);

        // 创建浮动粒子
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-1 h-1 bg-blue-400 rounded-full opacity-30';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.animation = 'float 10s ease-in-out infinite';
            particleContainer.appendChild(particle);
        }
    }

    startAnimations() {
        // 标题打字机效果
        this.typewriterEffect();
        
        // 随机流星效果
        this.createShootingStars();
        
        // 背景颜色渐变
        this.animateBackground();
    }

    typewriterEffect() {
        const title = document.querySelector('h1');
        const originalText = title.textContent;
        title.textContent = '';
        
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < originalText.length) {
                title.textContent += originalText[index];
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, 100);
    }

    createShootingStars() {
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% 概率
                const star = document.createElement('div');
                star.className = 'shooting-star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 50 + '%';
                document.querySelector('.stars').appendChild(star);
                
                setTimeout(() => {
                    star.remove();
                }, 3000);
            }
        }, 2000);
    }

    animateBackground() {
        // 移除动态背景变化，保持HTML中设置的静态渐变背景
        // 原来的动态背景会覆盖 Tailwind CSS 的背景样式
        // 现在使用静态的美丽渐变背景
    }

    createHoverEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'absolute inset-0 bg-white opacity-10 rounded-2xl transform scale-0';
        ripple.style.animation = 'scale-up 0.3s ease-out forwards';
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 300);
    }

    createClickEffect(element) {
        // 创建点击波纹效果
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'fixed w-4 h-4 bg-blue-400 rounded-full pointer-events-none z-50';
        ripple.style.left = rect.left + rect.width / 2 - 8 + 'px';
        ripple.style.top = rect.top + rect.height / 2 - 8 + 'px';
        ripple.style.animation = 'ripple 0.6s ease-out forwards';
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    showLoadingAnimation() {
        const loader = document.createElement('div');
        loader.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
        loader.innerHTML = `
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-white text-xl font-semibold">加载游戏中...</p>
                <p class="text-gray-300 text-sm mt-2">正在进入AI模型训练师</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    showComingSoonNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 z-50 text-center';
        notification.innerHTML = `
            <div class="text-6xl mb-4">🚧</div>
            <h3 class="text-white text-xl font-bold mb-2">敬请期待</h3>
            <p class="text-gray-300 mb-4">这个游戏正在紧张开发中</p>
            <button onclick="this.parentElement.remove()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                知道了
            </button>
        `;
        document.body.appendChild(notification);
        
        // 自动消失
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    playHoverSound() {
        // 创建音频反馈（如果需要）
        if (window.AudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.01;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }

    playClickSound() {
        if (window.AudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 1200;
            gainNode.gain.value = 0.02;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
        }
    }

    trackVisitorStats() {
        // 记录访问统计
        const stats = JSON.parse(localStorage.getItem('gameCenterStats') || '{}');
        stats.visits = (stats.visits || 0) + 1;
        stats.lastVisit = new Date().toISOString();
        localStorage.setItem('gameCenterStats', JSON.stringify(stats));
        
        // 显示访问次数
        if (stats.visits > 1) {
            setTimeout(() => {
                this.showWelcomeBackMessage(stats.visits);
            }, 2000);
        }
    }

    showWelcomeBackMessage(visits) {
        const message = document.createElement('div');
        message.className = 'fixed bottom-4 right-4 bg-green-500/20 border border-green-400/30 backdrop-blur-lg rounded-xl p-4 z-50 transform translate-x-full transition-transform duration-500';
        message.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="text-2xl">👋</div>
                <div>
                    <p class="text-white font-semibold">欢迎回来！</p>
                    <p class="text-green-300 text-sm">这是您第 ${visits} 次访问</p>
                </div>
            </div>
        `;
        document.body.appendChild(message);
        
        // 滑入动画
        setTimeout(() => {
            message.style.transform = 'translateX(0)';
        }, 100);
        
        // 滑出动画
        setTimeout(() => {
            message.style.transform = 'translateX(full)';
            setTimeout(() => message.remove(), 500);
        }, 4000);
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes scale-up {
        to { transform: scale(1); }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化游戏中心
document.addEventListener('DOMContentLoaded', () => {
    new GameCenter();
});

// URL 路由处理
window.addEventListener('load', () => {
    const path = window.location.pathname;
    const gameMatch = path.match(/\/(\d+)$/);
    
    if (gameMatch) {
        const gameNumber = parseInt(gameMatch[1]);
        setTimeout(() => {
            new GameCenter().navigateToGame(gameNumber);
        }, 500);
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('游戏中心错误:', e.error);
});

// 性能监控
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`游戏中心加载时间: ${loadTime.toFixed(2)}ms`);
}); 