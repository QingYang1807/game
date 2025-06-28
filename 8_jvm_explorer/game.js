// JVM探索者游戏主逻辑

// 游戏化组件：增强的游戏状态管理
let gameState = {
    level: 1,
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    knowledgePoints: 0,
    unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9], // 暂时全部解锁
    playerLevel: 1,
    playerExp: 0,
    expToNextLevel: 100,
    achievements: [],
    completedLevels: [],
    levelStartTime: null,
    tutorialStep: 0,
    showTutorial: true
};

// 成就系统配置
const achievements = {
    'first_level': { name: '新手探索者', desc: '完成第一个关卡', icon: '🏆', exp: 50 },
    'class_expert': { name: '类加载专家', desc: '完成类加载机制关卡', icon: '🔗', exp: 75 },
    'memory_master': { name: '内存大师', desc: '完成内存结构关卡', icon: '🧠', exp: 100 },
    'memory_architect': { name: '内存建筑师', desc: '完成堆内存管理关卡', icon: '🏗️', exp: 125 },
    'gc_expert': { name: 'GC专家', desc: '完成垃圾回收关卡', icon: '🗑️', exp: 150 },
    'metadata_guardian': { name: '元数据守护者', desc: '完成方法区关卡', icon: '📚', exp: 175 },
    'compilation_master': { name: '编译大师', desc: '完成JIT编译关卡', icon: '⚡', exp: 200 },
    'concurrency_expert': { name: '并发专家', desc: '完成并发关卡', icon: '🔒', exp: 225 },
    'jvm_master': { name: 'JVM大师', desc: '完成所有关卡', icon: '👑', exp: 500 },
    'perfectionist': { name: '完美主义者', desc: '所有关卡满分通过', icon: '💎', exp: 300 },
    'speed_runner': { name: '速度之王', desc: '5分钟内完成关卡', icon: '⚡', exp: 100 }
};

// 粒子效果系统
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.getElementById('particleContainer');
        if (this.container) {
            this.init();
        }
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < 20; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (3 + Math.random() * 3) + 's';
        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    animate() {
        setInterval(() => {
            this.particles.forEach(particle => {
                if (Math.random() < 0.01) {
                    particle.style.left = Math.random() * 100 + '%';
                }
            });
        }, 100);
    }

    burst(x, y, color = '#ffd700') {
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.background = color;
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            const angle = (i / 10) * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.animation = `burstParticle 1s ease-out forwards`;
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
}

// 教学引导系统
class TutorialSystem {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
        this.overlay = document.getElementById('tutorialOverlay');
        this.textElement = document.getElementById('tutorialText');
    }

    startTutorial(levelNum) {
        if (!gameState.showTutorial || !this.overlay) return;
        
        this.steps = this.getTutorialSteps(levelNum);
        this.currentStep = 0;
        this.showStep();
    }

    getTutorialSteps(levelNum) {
        const tutorials = {
            1: [
                "欢迎来到JVM探索之旅！🚀",
                "在这里，你将学习Java虚拟机的核心概念。",
                "点击JVM组件可以查看详细信息。",
                "完成交互任务来加深理解。",
                "最后回答问题检验学习成果！"
            ],
            2: [
                "现在让我们探索类加载机制！",
                "观察类是如何被加载到JVM中的。",
                "尝试点击不同的类加载器！"
            ],
            3: [
                "内存结构是JVM的核心！",
                "了解不同内存区域的作用。",
                "观察对象是如何分配内存的。"
            ]
        };
        return tutorials[levelNum] || ["开始你的学习之旅吧！"];
    }

    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.endTutorial();
            return;
        }

        if (this.textElement) {
            this.textElement.textContent = this.steps[this.currentStep];
        }
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
        }
    }

    nextStep() {
        this.currentStep++;
        this.showStep();
    }

    skipTutorial() {
        gameState.showTutorial = false;
        this.endTutorial();
    }

    endTutorial() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
    }
}

class JVMExplorerGame {
    constructor() {
        this.currentLevel = 1;
        this.playerData = {
            level: 1,
            experience: 0,
            knowledgePoints: 0,
            unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9], // 解锁所有关卡用于测试
            completedLevels: []
        };
        this.currentQuizIndex = 0;
        this.currentQuestions = [];
        this.selectedAnswer = null;
        this.gameStartTime = null;
        
        // 初始化游戏化组件
        this.particleSystem = new ParticleSystem();
        this.tutorialSystem = new TutorialSystem();
        
        this.InitializeGame();
        this.LoadPlayerData();
        this.UpdatePlayerStats();
        this.InitializeGameState();
    }
    
    // 初始化游戏化状态
    InitializeGameState() {
        this.LoadGameState();
        this.UpdateGameUI();
        this.setupGameEventListeners();
    }
    
    LoadGameState() {
        const saved = localStorage.getItem('jvmGameState');
        if (saved) {
            gameState = { ...gameState, ...JSON.parse(saved) };
        }
    }
    
    SaveGameState() {
        localStorage.setItem('jvmGameState', JSON.stringify(gameState));
    }
    
    UpdateGameUI() {
        const elements = {
            'playerLevel': gameState.playerLevel,
            'playerExp': `${gameState.playerExp}/${gameState.expToNextLevel}`,
            'knowledgeCount': gameState.knowledgePoints,
            'achievementCount': gameState.achievements.length
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        // 更新总体进度
        const overallProgress = (gameState.completedLevels.length / 9) * 100;
        const progressElement = document.getElementById('overallProgress');
        const progressTextElement = document.getElementById('overallProgressText');
        if (progressElement) progressElement.style.width = overallProgress + '%';
        if (progressTextElement) progressTextElement.textContent = Math.round(overallProgress) + '%';
        
        // 更新关卡状态
        this.updateLevelCards();
    }
    
    updateLevelCards() {
        const levelCards = document.querySelectorAll('.level-card');
        levelCards.forEach((card, index) => {
            const levelNum = index + 1;
            if (gameState.completedLevels.includes(levelNum)) {
                card.classList.add('completed');
            }
        });
    }
    
    setupGameEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'h' || e.key === 'H') {
                this.ShowHelp();
            }
        });
    }
    
    // 成就系统方法
    unlockAchievement(achievementId) {
        if (gameState.achievements.includes(achievementId)) return;
        
        gameState.achievements.push(achievementId);
        const achievement = achievements[achievementId];
        
        this.addExp(achievement.exp);
        this.showAchievementModal(achievement);
        this.SaveGameState();
    }
    
    showAchievementModal(achievement) {
        const nameElement = document.getElementById('achievementName');
        const descElement = document.getElementById('achievementDesc');
        const modalElement = document.getElementById('achievementModal');
        
        if (nameElement) nameElement.textContent = achievement.name;
        if (descElement) descElement.textContent = achievement.desc;
        if (modalElement) modalElement.classList.remove('hidden');
        
        // 粒子爆炸效果
        setTimeout(() => {
            this.particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, '#ffd700');
        }, 200);
    }
    
    CloseAchievementModal() {
        const modalElement = document.getElementById('achievementModal');
        if (modalElement) modalElement.classList.add('hidden');
    }
    
    addExp(amount) {
        gameState.playerExp += amount;
        
        // 检查是否升级
        while (gameState.playerExp >= gameState.expToNextLevel) {
            gameState.playerExp -= gameState.expToNextLevel;
            gameState.playerLevel++;
            gameState.expToNextLevel = Math.floor(gameState.expToNextLevel * 1.2);
            
            // 升级效果
            this.showLevelUpEffect();
        }
        
        this.UpdateGameUI();
    }
    
    showLevelUpEffect() {
        const levelUpDiv = document.createElement('div');
        levelUpDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: linear-gradient(135deg, #ffd700, #ffed4e); 
                        color: #92400e; padding: 2rem; border-radius: 20px; 
                        font-size: 1.5rem; font-weight: bold; z-index: 2000;
                        animation: levelUpPop 2s ease-out forwards;">
                🎉 等级提升！<br>
                <span style="font-size: 1rem;">现在是 ${gameState.playerLevel} 级！</span>
            </div>
        `;
        document.body.appendChild(levelUpDiv);
        
        setTimeout(() => {
            if (levelUpDiv.parentNode) {
                document.body.removeChild(levelUpDiv);
            }
        }, 2000);
        
        // 粒子效果
        this.particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, '#ffd700');
    }
    
    ShowAchievements() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>🏆 成就系统</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        ${Object.entries(achievements).map(([id, achievement]) => `
                            <div style="padding: 1rem; border-radius: 12px; 
                                        background: ${gameState.achievements.includes(id) ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : '#f3f4f6'};
                                        ${gameState.achievements.includes(id) ? 'color: #92400e;' : 'color: #6b7280;'}">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${achievement.icon}</div>
                                <div style="font-weight: bold; margin-bottom: 0.25rem;">${achievement.name}</div>
                                <div style="font-size: 0.9rem;">${achievement.desc}</div>
                                <div style="font-size: 0.8rem; margin-top: 0.5rem;">+${achievement.exp} EXP</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    ShowProgress() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>📊 学习进度</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span>等级: ${gameState.playerLevel}</span>
                            <span>经验: ${gameState.playerExp}/${gameState.expToNextLevel}</span>
                        </div>
                        <div style="background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
                            <div style="background: #4f46e5; height: 100%; width: ${(gameState.playerExp / gameState.expToNextLevel) * 100}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                        <div>
                            <div style="font-size: 2rem; color: #4f46e5;">${gameState.completedLevels.length}</div>
                            <div style="font-size: 0.9rem; color: #6b7280;">完成关卡</div>
                        </div>
                        <div>
                            <div style="font-size: 2rem; color: #10b981;">${gameState.knowledgePoints}</div>
                            <div style="font-size: 0.9rem; color: #6b7280;">知识点</div>
                        </div>
                        <div>
                            <div style="font-size: 2rem; color: #fbbf24;">${gameState.achievements.length}</div>
                            <div style="font-size: 0.9rem; color: #6b7280;">成就数量</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    ShowHelp() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>❓ 游戏帮助</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>🎮 游戏玩法</h4>
                    <ul style="margin-bottom: 1rem;">
                        <li>选择关卡开始学习JVM概念</li>
                        <li>点击可视化组件查看详细信息</li>
                        <li>完成交互任务加深理解</li>
                        <li>回答问题检验学习成果</li>
                        <li>获得经验值和成就</li>
                    </ul>
                    <h4>⌨️ 快捷键</h4>
                    <ul style="margin-bottom: 1rem;">
                        <li>ESC - 返回关卡选择</li>
                        <li>H - 显示帮助</li>
                    </ul>
                    <h4>🏆 成就系统</h4>
                    <p>完成关卡、回答正确、快速通关都能获得成就和经验值！</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    ShowHint() {
        const hints = {
            1: "JVM是Java程序运行的基础平台，它负责将字节码转换为机器码执行。",
            2: "类加载器按照双亲委派模型工作，确保类的安全和一致性。",
            3: "JVM内存分为堆、方法区、栈等区域，各有不同的作用。"
        };
        
        const hint = hints[this.currentLevel] || "仔细观察可视化界面，点击组件获取更多信息！";
        
        const hintContentElement = document.getElementById('hintContent');
        if (hintContentElement) {
            hintContentElement.innerHTML = `
                <div style="padding: 1rem; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 8px;">
                    <div style="font-weight: bold; margin-bottom: 0.5rem;">💡 学习提示</div>
                    <div>${hint}</div>
                </div>
            `;
        }
        
        const hintModalElement = document.getElementById('hintModal');
        if (hintModalElement) {
            hintModalElement.classList.remove('hidden');
        }
    }
    
    NextTutorialStep() {
        this.tutorialSystem.nextStep();
    }
    
    SkipTutorial() {
        this.tutorialSystem.skipTutorial();
    }

    InitializeGame() {
        console.log('Initializing JVM Explorer Game...');
        this.SetupEventListeners();
        this.SetupLevelCardListeners();
        this.ShowLevelSelector();
        console.log('Game initialization complete');
    }

    SetupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.CloseModal(e.target.id);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal:not(.hidden)');
                if (openModal) {
                    this.CloseModal(openModal.id);
                }
            }
        });
    }

    SetupLevelCardListeners() {
        console.log('Setting up level card listeners...');
        const levelCards = document.querySelectorAll('.level-card');
        
        levelCards.forEach((card, index) => {
            const levelNumber = index + 1;
            console.log(`Setting up listener for level ${levelNumber}`);
            
            // 移除之前的事件监听器（如果有的话）
            card.replaceWith(card.cloneNode(true));
            const newCard = document.querySelectorAll('.level-card')[index];
            
            newCard.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Level card ${levelNumber} clicked via event listener`);
                this.StartLevel(levelNumber);
            });
            
            // 添加悬停效果
            newCard.addEventListener('mouseenter', () => {
                if (!newCard.classList.contains('locked')) {
                    newCard.style.transform = 'translateY(-5px)';
                }
            });
            
            newCard.addEventListener('mouseleave', () => {
                newCard.style.transform = 'translateY(0)';
            });
        });
        
        console.log(`Set up listeners for ${levelCards.length} level cards`);
    }

    LoadPlayerData() {
        const saved = localStorage.getItem('jvmExplorerProgress');
        if (saved) {
            this.playerData = { ...this.playerData, ...JSON.parse(saved) };
        }
    }

    SavePlayerData() {
        localStorage.setItem('jvmExplorerProgress', JSON.stringify(this.playerData));
    }

    UpdatePlayerStats() {
        // 更新玩家统计信息
        const playerLevelEl = document.getElementById('playerLevel');
        const playerExpEl = document.getElementById('playerExp');
        const knowledgePointsEl = document.getElementById('knowledgePoints');
        const achievementCountEl = document.getElementById('achievementCount');
        
        if (playerLevelEl) playerLevelEl.textContent = this.playerData.level;
        if (playerExpEl) playerExpEl.textContent = `${this.playerData.experience}/${this.playerData.level * 100}`;
        if (knowledgePointsEl) knowledgePointsEl.textContent = this.playerData.knowledgePoints;
        if (achievementCountEl) achievementCountEl.textContent = gameState.achievements.length;

        // 更新关卡卡片状态
        const levelCards = document.querySelectorAll('.level-card');
        levelCards.forEach((card, index) => {
            const levelNumber = index + 1;
            const statusElement = card.querySelector('.level-status');
            
            if (statusElement) {
                if (this.playerData.unlockedLevels.includes(levelNumber)) {
                    statusElement.textContent = '已解锁';
                    statusElement.className = 'level-status unlocked';
                    card.classList.remove('locked');
                    card.classList.add('unlocked');
                } else {
                    statusElement.textContent = '未解锁';
                    statusElement.className = 'level-status locked';
                    card.classList.add('locked');
                    card.classList.remove('unlocked');
                }
                
                // 标记已完成的关卡
                if (this.playerData.completedLevels.includes(levelNumber)) {
                    card.classList.add('completed');
                    statusElement.textContent = '已完成';
                }
            }
        });
    }

    ShowLevelSelector() {
        document.getElementById('levelSelector').classList.remove('hidden');
        document.getElementById('gameArea').classList.add('hidden');
        document.getElementById('quizArea').classList.add('hidden');
        document.getElementById('levelComplete').classList.add('hidden');
    }

    StartLevel(levelNumber) {
        if (!this.playerData.unlockedLevels.includes(levelNumber)) {
            alert('该关卡尚未解锁！');
            return;
        }

        this.currentLevel = levelNumber;
        this.gameStartTime = Date.now();
        
        // 确保所有界面状态正确
        document.getElementById('levelSelector').classList.add('hidden');
        document.getElementById('gameArea').classList.remove('hidden');
        document.getElementById('quizArea').classList.add('hidden');
        document.getElementById('levelComplete').classList.add('hidden');
        
        const levelData = this.GetLevelData(levelNumber);
        document.getElementById('currentLevelTitle').textContent = 
            `关卡 ${levelNumber.toString().padStart(2, '0')}: ${levelData.title}`;
        
        // 显示关卡奖励预览
        const rewards = {
            1: "💎 +50 EXP", 2: "💎 +75 EXP", 3: "💎 +100 EXP",
            4: "💎 +125 EXP", 5: "💎 +150 EXP", 6: "💎 +175 EXP",
            7: "💎 +200 EXP", 8: "💎 +225 EXP", 9: "💎 +250 EXP"
        };
        const rewardElement = document.getElementById('currentLevelReward');
        if (rewardElement) {
            rewardElement.textContent = rewards[levelNumber];
        }
        
        // 显示学习引导
        if (gameState && gameState.showTutorial && this.tutorialSystem) {
            setTimeout(() => {
                this.tutorialSystem.startTutorial(levelNumber);
            }, 1000);
        }
        
        this.UpdateProgress(0);
        this.InitializeLevel(levelNumber);
        
        // 添加交互提示
        this.ShowInteractionHints(levelNumber);
        
        // 粒子效果
        if (this.particleSystem) {
            this.particleSystem.burst(window.innerWidth / 2, 100);
        }
    }
    
    // 显示交互提示
    ShowInteractionHints(levelNumber) {
        const hints = {
            1: [
                { icon: "💡", text: "点击JVM组件查看详细信息" },
                { icon: "🎯", text: "完成右侧的学习任务" }
            ],
            2: [
                { icon: "🔄", text: "观察类加载的过程" },
                { icon: "👆", text: "点击类加载器了解层次结构" }
            ],
            3: [
                { icon: "🧠", text: "探索不同的内存区域" },
                { icon: "📊", text: "查看内存使用情况" }
            ],
            4: [
                { icon: "🏗️", text: "创建对象观察内存分配" },
                { icon: "♻️", text: "触发GC看垃圾回收过程" }
            ],
            5: [
                { icon: "🗑️", text: "启动垃圾回收循环" },
                { icon: "📈", text: "比较不同GC算法性能" }
            ]
        };
        
        const levelHints = hints[levelNumber] || hints[1];
        const hintsContainer = document.getElementById('interactionHints');
        if (!hintsContainer) return;
        
        hintsContainer.innerHTML = '';
        
        levelHints.forEach((hint, index) => {
            const hintElement = document.createElement('div');
            hintElement.className = 'hint-item';
            hintElement.style.animationDelay = (index * 0.5) + 's';
            hintElement.innerHTML = `
                <span class="hint-icon">${hint.icon}</span>
                <span class="hint-text">${hint.text}</span>
            `;
            hintsContainer.appendChild(hintElement);
            
            // 3秒后自动隐藏提示
            setTimeout(() => {
                hintElement.style.opacity = '0';
                setTimeout(() => {
                    if (hintElement.parentNode) {
                        hintElement.parentNode.removeChild(hintElement);
                    }
                }, 500);
            }, 3000 + (index * 500));
        });
    }

    GetLevelData(levelNumber) {
        const levels = {
            1: {
                title: 'JVM基础概念',
                description: '了解Java虚拟机的基本概念和作用',
                tasks: [
                    '了解什么是JVM及其在Java生态中的核心地位',
                    '理解JVM的作用和跨平台实现原理',
                    '认识JVM的主要组成部分和架构设计'
                ],
                knowledge: [
                    '🔹 JVM定义：Java Virtual Machine，Java程序的运行环境，是Java技术的核心组件',
                    '🔹 JVM规范：由Oracle制定，定义了JVM的行为标准，不同厂商可以有不同实现',
                    '🔹 主流实现：HotSpot(Oracle)、OpenJ9(Eclipse)、GraalVM(Oracle)、Zing(Azul)',
                    '🔹 跨平台原理："一次编译，到处运行"通过JVM抽象层实现平台无关性',
                    '🔹 核心架构：类加载子系统 + 运行时数据区 + 执行引擎 + 本地方法接口',
                    '🔹 字节码格式：.class文件包含魔数(CAFEBABE)、版本号、常量池、类描述信息',
                    '🔹 JVM生命周期：启动 → 类加载 → 执行main方法 → 程序结束 → JVM退出',
                    '🔹 JVM参数：标准参数(-cp)、非标准参数(-X)、高级参数(-XX)控制JVM行为',
                    '🔹 性能特点：解释执行 + JIT编译，兼顾启动速度和运行效率',
                    '🔹 内存管理：自动内存分配、垃圾回收，解放程序员手动管理内存的负担'
                ]
            },
            2: {
                title: '类加载机制',
                description: '探索类是如何被加载到JVM中的',
                tasks: [
                    '观察类加载的完整过程和各个阶段',
                    '理解类加载器层次结构和职责分工',
                    '体验双亲委派模型的安全保障机制'
                ],
                knowledge: [
                    '🔹 类加载时机：首次主动使用时触发，包括new、访问静态成员、反射、main方法',
                    '🔹 加载阶段：通过类全限定名获取二进制字节流 → 转为方法区数据结构 → 生成Class对象',
                    '🔹 验证阶段：文件格式验证、元数据验证、字节码验证、符号引用验证',
                    '🔹 准备阶段：为静态变量分配内存并设置默认初始值（非初始化值）',
                    '🔹 解析阶段：将符号引用转换为直接引用，包括类、字段、方法的解析',
                    '🔹 初始化阶段：执行<clinit>()方法，包含静态变量赋值和静态代码块',
                    '🔹 双亲委派：子加载器先委托父加载器，避免核心类被恶意替换',
                    '🔹 类加载器层次：Bootstrap → Extension → Application → Custom',
                    '🔹 自定义加载器：继承ClassLoader，重写findClass，实现热部署、加密等功能',
                    '🔹 类卸载条件：类的所有实例被回收 + 类加载器被回收 + Class对象无引用'
                ]
            },
            3: {
                title: '内存结构概览',
                description: '了解JVM的内存布局和各个区域',
                tasks: [
                    '探索堆内存区域的结构和对象存储',
                    '了解方法区的作用和存储内容',
                    '认识栈内存的栈帧结构和方法调用',
                    '理解程序计数器和本地方法栈的作用'
                ],
                knowledge: [
                    '🔹 堆内存特征：线程共享，存储对象实例和数组，GC主要区域，分新生代和老年代',
                    '🔹 栈内存结构：线程私有，存储栈帧（局部变量表、操作数栈、动态链接、返回地址）',
                    '🔹 方法区作用：存储类信息、常量、静态变量、JIT编译代码，JDK8后用元空间实现',
                    '🔹 程序计数器：线程私有，记录当前执行字节码指令地址，唯一不会OOM的区域',
                    '🔹 本地方法栈：为Native方法服务，与虚拟机栈功能类似',
                    '🔹 直接内存：不属于JVM规范但广泛使用，NIO、Netty等框架大量使用',
                    '🔹 对象分配：优先Eden分配 → Eden满时Minor GC → 大对象直接老年代',
                    '🔹 内存溢出：堆溢出(OutOfMemoryError)、栈溢出(StackOverflowError)、方法区溢出',
                    '🔹 内存参数：-Xms(初始堆)、-Xmx(最大堆)、-Xss(栈大小)、-XX:MetaspaceSize',
                    '🔹 内存监控：jstat、jmap、jhat、VisualVM等工具监控内存使用情况'
                ]
            },
            4: {
                title: '堆内存管理',
                description: '深入了解堆内存的分配和管理',
                tasks: [
                    '观察新生代的三个区域和对象分配过程',
                    '理解对象的年龄增长和晋升机制',
                    '体验不同大小对象的分配策略'
                ],
                knowledge: [
                    '🔹 新生代结构：Eden区(80%) + Survivor0(10%) + Survivor1(10%)，默认比例8:1:1',
                    '🔹 对象分配流程：新对象优先在Eden分配 → Eden满触发Minor GC → 存活对象进Survivor',
                    '🔹 Survivor机制：两个Survivor区交替使用，每次GC存活对象年龄+1',
                    '🔹 晋升规则：对象年龄达到阈值(默认15)进入老年代，可通过-XX:MaxTenuringThreshold调整',
                    '🔹 大对象处理：超过-XX:PretenureSizeThreshold直接分配到老年代，避免复制开销',
                    '🔹 动态年龄判定：Survivor中相同年龄对象大小超过一半，该年龄及以上对象晋升',
                    '🔹 空间分配担保：Minor GC前检查老年代可用空间，确保能容纳新生代所有对象',
                    '🔹 TLAB优化：Thread Local Allocation Buffer，线程私有分配缓冲，减少同步开销',
                    '🔹 指针碰撞：堆内存规整时使用，移动指针分配内存，速度快',
                    '🔹 空闲列表：堆内存不规整时使用，维护可用内存块列表进行分配'
                ]
            },
            5: {
                title: '垃圾回收机制',
                description: '学习GC算法和垃圾回收过程',
                tasks: [
                    '理解垃圾回收的基本概念和必要性',
                    '观察不同GC算法的工作过程',
                    '比较各种垃圾收集器的特点和适用场景'
                ],
                knowledge: [
                    '🔹 GC基本概念：自动内存管理，回收不再使用的对象，解决内存泄漏问题',
                    '🔹 对象存活判定：可达性分析算法，从GC Roots开始遍历引用链',
                    '🔹 GC Roots类型：虚拟机栈引用、方法区静态引用、方法区常量引用、本地方法栈引用',
                    '🔹 标记-清除：标记垃圾对象后清除，简单但产生内存碎片',
                    '🔹 标记-复制：将内存分两块，存活对象复制到另一块，无碎片但空间利用率低',
                    '🔹 标记-整理：标记后将存活对象向一端移动，无碎片但移动成本高',
                    '🔹 分代收集：新生代用复制算法，老年代用标记-整理或标记-清除',
                    '🔹 Serial GC：单线程收集，适合小型应用，STW时间较长',
                    '🔹 Parallel GC：多线程收集，适合吞吐量优先的服务端应用',
                    '🔹 G1 GC：低延迟收集器，适合大堆内存应用，可预测停顿时间'
                ]
            },
            6: {
                title: '方法区与元空间',
                description: '理解方法区的演变和元空间',
                tasks: [
                    '了解方法区的逻辑概念和存储内容',
                    '理解永久代的问题和元空间的优势',
                    '观察类元数据和常量池的组织结构'
                ],
                knowledge: [
                    '🔹 方法区定义：JVM规范中的逻辑概念，存储类级别信息，线程共享',
                    '🔹 永久代问题：JDK7及之前实现，固定大小容易OOM，GC效率低',
                    '🔹 元空间优势：JDK8引入，使用本地内存，自动扩展，减少OOM风险',
                    '🔹 类元数据：类信息（字段、方法、访问修饰符）、方法字节码、注解信息',
                    '🔹 运行时常量池：Class文件常量池的运行时表示，支持动态添加',
                    '🔹 字符串常量池：存储字符串字面量，JDK7后移至堆中，减少永久代压力',
                    '🔹 常量池类型：字符串常量、类和接口的符号引用、字段和方法的符号引用',
                    '🔹 类卸载机制：满足条件的类可以被卸载，释放元空间内存',
                    '🔹 元空间参数：-XX:MetaspaceSize、-XX:MaxMetaspaceSize、-XX:CompressedClassSpaceSize',
                    '🔹 内存泄漏风险：动态类生成（如CGLib）可能导致元空间泄漏'
                ]
            },
            7: {
                title: 'JIT编译优化',
                description: '探索即时编译器的优化策略',
                tasks: [
                    '理解JIT编译的基本原理和触发条件',
                    '观察分层编译的工作流程',
                    '了解各种编译优化技术的应用'
                ],
                knowledge: [
                    '🔹 JIT基本原理：运行时将热点字节码编译为本地机器码，提高执行效率',
                    '🔹 热点检测：基于方法调用计数器和回边计数器，超过阈值触发编译',
                    '🔹 分层编译：0层解释执行 → 1-3层C1编译 → 4层C2编译，平衡编译时间和执行效率',
                    '🔹 C1编译器：客户端编译器，编译速度快，优化程度中等',
                    '🔹 C2编译器：服务端编译器，编译速度慢，优化程度高',
                    '🔹 方法内联：将小方法调用替换为方法体，减少调用开销，最重要的优化',
                    '🔹 逃逸分析：分析对象作用域，实现栈上分配、同步消除、标量替换',
                    '🔹 循环优化：循环展开、循环不变量外提、强度削减等技术',
                    '🔹 去虚拟化：将虚方法调用转为直接调用，配合内联进一步优化',
                    '🔹 编译参数：-XX:CompileThreshold、-XX:TieredCompilation、-XX:+PrintCompilation'
                ]
            },
            8: {
                title: '并发与线程安全',
                description: '理解JVM中的并发机制',
                tasks: [
                    '理解Java内存模型和线程间通信',
                    '观察内存可见性问题和解决方案',
                    '体验不同同步机制的工作原理'
                ],
                knowledge: [
                    '🔹 Java内存模型：定义线程间通信规则，解决可见性、有序性、原子性问题',
                    '🔹 主内存与工作内存：线程对变量的操作在工作内存进行，需要与主内存同步',
                    '🔹 内存操作：lock、unlock、read、load、use、assign、store、write八种原子操作',
                    '🔹 volatile语义：保证可见性和有序性，禁止指令重排序，但不保证原子性',
                    '🔹 synchronized原理：基于监视器锁(Monitor)，保证原子性、可见性、有序性',
                    '🔹 锁优化：偏向锁、轻量级锁、重量级锁的升级过程',
                    '🔹 自旋锁：避免线程阻塞，适合锁持有时间短的场景',
                    '🔹 happens-before：程序次序规则、监视器锁规则、volatile规则、传递性规则',
                    '🔹 CAS操作：Compare And Swap，无锁并发的基础，AQS的核心',
                    '🔹 并发工具：CountDownLatch、CyclicBarrier、Semaphore等同步器'
                ]
            },
            9: {
                title: '性能调优实战',
                description: '掌握JVM性能调优技巧',
                tasks: [
                    '建立性能监控和分析体系',
                    '学会使用各种JVM调优参数',
                    '掌握性能问题的定位和解决方法'
                ],
                knowledge: [
                    '🔹 性能指标：吞吐量(Throughput)、延迟(Latency)、并发数、资源利用率',
                    '🔹 GC调优目标：减少GC频率、降低GC停顿时间、提高内存利用率',
                    '🔹 堆内存调优：-Xms/-Xmx设置堆大小，-Xmn设置新生代大小',
                    '🔹 GC收集器选择：Serial、Parallel、CMS、G1、ZGC根据应用特点选择',
                    '🔹 监控工具：jstat(GC统计)、jmap(内存映像)、jstack(线程堆栈)',
                    '🔹 可视化工具：VisualVM、JConsole、JProfiler、MAT(内存分析)',
                    '🔹 性能分析流程：建立基线 → 压力测试 → 瓶颈定位 → 参数调优 → 效果验证',
                    '🔹 常见问题：内存泄漏、频繁GC、线程死锁、CPU使用率过高',
                    '🔹 调优原则：监控先行、小步快跑、A/B测试、记录文档',
                    '🔹 最佳实践：合理设置堆大小、选择合适GC、优化代码逻辑、持续监控'
                ]
            }
        };
        return levels[levelNumber] || levels[1];
    }

    InitializeLevel(levelNumber) {
        const levelData = this.GetLevelData(levelNumber);
        
        this.DisplayKnowledge(levelData.knowledge);
        this.DisplayTask(levelData.tasks[0], 0, levelData.tasks.length);
        this.InitializeJVMVisualization(levelNumber);
        this.SetupLevelControls(levelNumber);
    }

    DisplayKnowledge(knowledgePoints) {
        const container = document.getElementById('knowledgeDisplay');
        container.innerHTML = knowledgePoints.map((point, index) => 
            `<div class="knowledge-item mb-2">
                <strong>${index + 1}.</strong> ${point}
            </div>`
        ).join('');
    }

    DisplayTask(task, current, total) {
        document.getElementById('taskContent').innerHTML = task;
        document.getElementById('taskProgress').innerHTML = 
            `进度: ${current + 1}/${total}`;
    }

    InitializeJVMVisualization(levelNumber) {
        const container = document.getElementById('jvmContainer');
        
        switch(levelNumber) {
            case 1:
                this.CreateBasicJVMView(container);
                break;
            case 2:
                this.CreateClassLoaderView(container);
                break;
            case 3:
                this.CreateMemoryStructureView(container);
                break;
            case 4:
                this.CreateHeapMemoryView(container);
                break;
            case 5:
                this.CreateGCView(container);
                break;
            case 6:
                this.CreateMethodAreaView(container);
                break;
            case 7:
                this.CreateJITView(container);
                break;
            case 8:
                this.CreateConcurrencyView(container);
                break;
            case 9:
                this.CreatePerformanceView(container);
                break;
            default:
                this.CreateBasicJVMView(container);
        }
    }

    CreateBasicJVMView(container) {
        container.innerHTML = `
            <div class="jvm-component" id="javaCode">
                <div class="component-title">Java源代码</div>
                <div class="component-content">
                    <div class="code-block">
                        public class HelloWorld {<br>
                        &nbsp;&nbsp;public static void main(String[] args) {<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;System.out.println("Hello, JVM!");<br>
                        &nbsp;&nbsp;}<br>
                        }
                    </div>
                </div>
            </div>
            <div class="jvm-component" id="bytecode">
                <div class="component-title">字节码</div>
                <div class="component-content">
                    编译后的.class文件<br>
                    包含JVM指令
                </div>
            </div>
            <div class="jvm-component" id="jvmEngine">
                <div class="component-title">JVM引擎</div>
                <div class="component-content">
                    解释执行字节码<br>
                    管理内存和线程
                </div>
            </div>
            <div class="jvm-component" id="nativeCode">
                <div class="component-title">本地机器码</div>
                <div class="component-content">
                    最终执行的<br>
                    机器指令
                </div>
            </div>
        `;
    }

    CreateClassLoaderView(container) {
        container.innerHTML = `
            <div class="jvm-component" id="bootstrapLoader">
                <div class="component-title">启动类加载器</div>
                <div class="component-content">
                    加载核心类库<br>
                    (rt.jar等)
                </div>
            </div>
            <div class="jvm-component" id="extensionLoader">
                <div class="component-title">扩展类加载器</div>
                <div class="component-content">
                    加载扩展类库<br>
                    (ext目录)
                </div>
            </div>
            <div class="jvm-component" id="applicationLoader">
                <div class="component-title">应用类加载器</div>
                <div class="component-content">
                    加载应用程序类<br>
                    (classpath)
                </div>
            </div>
            <div class="jvm-component" id="customLoader">
                <div class="component-title">自定义类加载器</div>
                <div class="component-content">
                    用户自定义的<br>
                    类加载器
                </div>
            </div>
        `;
    }

    CreateMemoryStructureView(container) {
        container.innerHTML = `
            <div class="memory-area" id="heapArea">
                <div class="component-title">堆内存 (Heap)</div>
                <div class="component-content">
                    <div class="memory-block">对象实例</div>
                    <div class="memory-block">数组</div>
                    <div class="memory-block">实例变量</div>
                </div>
            </div>
            <div class="memory-area" id="methodArea">
                <div class="component-title">方法区 (Method Area)</div>
                <div class="component-content">
                    <div class="memory-block">类信息</div>
                    <div class="memory-block">常量池</div>
                    <div class="memory-block">静态变量</div>
                </div>
            </div>
            <div class="memory-area" id="stackArea">
                <div class="component-title">栈内存 (Stack)</div>
                <div class="component-content">
                    <div class="memory-block">局部变量</div>
                    <div class="memory-block">方法参数</div>
                    <div class="memory-block">返回地址</div>
                </div>
            </div>
            <div class="memory-area" id="pcRegister">
                <div class="component-title">程序计数器 (PC)</div>
                <div class="component-content">
                    <div class="memory-block">当前指令地址</div>
                </div>
            </div>
        `;
    }

    CreateHeapMemoryView(container) {
        container.innerHTML = `
            <div class="memory-area heap-structure" id="youngGen">
                <div class="component-title">新生代 (Young Generation)</div>
                <div class="component-content">
                    <div class="memory-section eden-space" id="edenSpace">
                        <strong>Eden区</strong>
                        <div class="memory-usage">使用率: <span id="edenUsage">0%</span></div>
                        <div class="object-container" id="edenObjects"></div>
                    </div>
                    <div class="memory-section survivor-space" id="survivor0">
                        <strong>Survivor0</strong>
                        <div class="memory-usage">使用率: <span id="s0Usage">0%</span></div>
                        <div class="object-container" id="s0Objects"></div>
                    </div>
                    <div class="memory-section survivor-space" id="survivor1">
                        <strong>Survivor1</strong>
                        <div class="memory-usage">使用率: <span id="s1Usage">0%</span></div>
                        <div class="object-container" id="s1Objects"></div>
                    </div>
                </div>
            </div>
            <div class="memory-area heap-structure" id="oldGen">
                <div class="component-title">老年代 (Old Generation)</div>
                <div class="component-content">
                    <div class="memory-usage">使用率: <span id="oldUsage">0%</span></div>
                    <div class="object-container" id="oldObjects">
                        <div class="memory-block long-lived">长期存活对象1</div>
                        <div class="memory-block long-lived">长期存活对象2</div>
                    </div>
                </div>
            </div>
        `;
    }

    CreateGCView(container) {
        container.innerHTML = `
            <div class="gc-visualization">
                <div class="gc-step" id="gcStep1">
                    <div class="component-title">1. 标记阶段</div>
                    <div class="component-content">
                        <div class="gc-object reachable" id="obj1">存活对象A</div>
                        <div class="gc-object unreachable" id="obj2">垃圾对象B</div>
                        <div class="gc-object reachable" id="obj3">存活对象C</div>
                        <div class="gc-object unreachable" id="obj4">垃圾对象D</div>
                    </div>
                </div>
                <div class="gc-step" id="gcStep2">
                    <div class="component-title">2. 清除阶段</div>
                    <div class="component-content">
                        <div class="gc-progress-bar">
                            <div class="gc-progress-fill" id="gcProgress"></div>
                        </div>
                        <div class="gc-stats">
                            <div>回收对象: <span id="gcCollected">0</span></div>
                            <div>释放内存: <span id="gcFreed">0KB</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gc-algorithms">
                <div class="algorithm-card" id="serialGC">
                    <div class="algorithm-title">Serial GC</div>
                    <div class="algorithm-desc">单线程垃圾回收</div>
                    <div class="algorithm-metrics">
                        <div>暂停时间: 高</div>
                        <div>吞吐量: 低</div>
                    </div>
                </div>
                <div class="algorithm-card" id="parallelGC">
                    <div class="algorithm-title">Parallel GC</div>
                    <div class="algorithm-desc">多线程垃圾回收</div>
                    <div class="algorithm-metrics">
                        <div>暂停时间: 中</div>
                        <div>吞吐量: 高</div>
                    </div>
                </div>
                <div class="algorithm-card" id="g1GC">
                    <div class="algorithm-title">G1 GC</div>
                    <div class="algorithm-desc">低延迟垃圾回收</div>
                    <div class="algorithm-metrics">
                        <div>暂停时间: 低</div>
                        <div>吞吐量: 中</div>
                    </div>
                </div>
            </div>
        `;
    }

    CreateMethodAreaView(container) {
        container.innerHTML = `
            <div class="memory-area method-area" id="metaspace">
                <div class="component-title">元空间 (Metaspace)</div>
                <div class="component-content">
                    <div class="class-metadata" id="classData">
                        <div class="class-item">
                            <strong>类: HelloWorld</strong>
                            <div class="class-details">
                                <div class="method-info">方法: main(String[])</div>
                                <div class="field-info">字段: 无</div>
                                <div class="constant-info">常量: "Hello, JVM!"</div>
                            </div>
                        </div>
                    </div>
                    <div class="memory-usage">使用: <span id="metaspaceUsage">256KB</span></div>
                </div>
            </div>
            <div class="memory-area constant-pool" id="constantPool">
                <div class="component-title">常量池</div>
                <div class="component-content">
                    <div class="constant-item string-constant" id="const1">
                        <span class="const-type">[String]</span>
                        <span class="const-value">"Hello, JVM!"</span>
                    </div>
                    <div class="constant-item class-constant" id="const2">
                        <span class="const-type">[Class]</span>
                        <span class="const-value">java/lang/System</span>
                    </div>
                    <div class="constant-item method-constant" id="const3">
                        <span class="const-type">[Method]</span>
                        <span class="const-value">println(Ljava/lang/String;)V</span>
                    </div>
                </div>
            </div>
        `;
    }

    CreateJITView(container) {
        container.innerHTML = `
            <div class="jit-pipeline">
                <div class="jit-stage" id="interpretation">
                    <div class="component-title">解释执行</div>
                    <div class="component-content">
                        <div class="bytecode-line">iconst_1</div>
                        <div class="bytecode-line">istore_1</div>
                        <div class="bytecode-line">iload_1</div>
                        <div class="execution-speed">执行速度: 慢</div>
                    </div>
                </div>
                <div class="jit-stage" id="profiling">
                    <div class="component-title">性能分析</div>
                    <div class="component-content">
                        <div class="hotspot-counter">
                            <div>方法调用次数: <span id="callCount">0</span></div>
                            <div>循环次数: <span id="loopCount">0</span></div>
                            <div>热点阈值: <span id="hotThreshold">10000</span></div>
                        </div>
                        <div class="hotspot-indicator" id="hotspotStatus">冷代码</div>
                    </div>
                </div>
                <div class="jit-stage" id="compilation">
                    <div class="component-title">JIT编译</div>
                    <div class="component-content">
                        <div class="compiler-tier">
                            <div class="tier-name">C1编译器</div>
                            <div class="tier-desc">快速编译，基础优化</div>
                        </div>
                        <div class="compiler-tier">
                            <div class="tier-name">C2编译器</div>
                            <div class="tier-desc">深度优化，高性能</div>
                        </div>
                        <div class="compilation-progress" id="compileProgress">待编译</div>
                    </div>
                </div>
                <div class="jit-stage" id="nativeExecution">
                    <div class="component-title">本地执行</div>
                    <div class="component-content">
                        <div class="native-code">mov %eax, %ebx</div>
                        <div class="native-code">add $1, %eax</div>
                        <div class="native-code">ret</div>
                        <div class="execution-speed">执行速度: 快</div>
                    </div>
                </div>
            </div>
        `;
    }

    CreateConcurrencyView(container) {
        container.innerHTML = `
            <div class="memory-model">
                <div class="memory-area main-memory" id="mainMemory">
                    <div class="component-title">主内存 (Main Memory)</div>
                    <div class="component-content">
                        <div class="shared-variable" id="sharedVar1">
                            <span class="var-name">count</span>
                            <span class="var-value" id="countValue">0</span>
                        </div>
                        <div class="shared-variable" id="sharedVar2">
                            <span class="var-name">flag</span>
                            <span class="var-value" id="flagValue">false</span>
                        </div>
                    </div>
                </div>
                <div class="thread-memory" id="thread1Memory">
                    <div class="component-title">线程1工作内存</div>
                    <div class="component-content">
                        <div class="local-variable">
                            <span class="var-name">count (本地)</span>
                            <span class="var-value" id="t1CountValue">0</span>
                        </div>
                        <div class="sync-status" id="t1SyncStatus">未同步</div>
                    </div>
                </div>
                <div class="thread-memory" id="thread2Memory">
                    <div class="component-title">线程2工作内存</div>
                    <div class="component-content">
                        <div class="local-variable">
                            <span class="var-name">count (本地)</span>
                            <span class="var-value" id="t2CountValue">0</span>
                        </div>
                        <div class="sync-status" id="t2SyncStatus">未同步</div>
                    </div>
                </div>
            </div>
            <div class="synchronization-mechanisms">
                <div class="sync-method" id="synchronizedMethod">
                    <div class="sync-title">synchronized</div>
                    <div class="sync-desc">互斥锁，确保原子性</div>
                    <div class="lock-status" id="syncLockStatus">未锁定</div>
                </div>
                <div class="sync-method" id="volatileKeyword">
                    <div class="sync-title">volatile</div>
                    <div class="sync-desc">保证可见性和有序性</div>
                    <div class="visibility-status" id="volatileStatus">不可见</div>
                </div>
            </div>
        `;
    }

    CreatePerformanceView(container) {
        container.innerHTML = `
            <div class="performance-dashboard">
                <div class="metric-card" id="throughputMetric">
                    <div class="metric-title">吞吐量</div>
                    <div class="metric-value" id="throughputValue">0</div>
                    <div class="metric-unit">ops/sec</div>
                    <div class="metric-chart">
                        <div class="chart-bar" style="height: 60%"></div>
                        <div class="chart-bar" style="height: 80%"></div>
                        <div class="chart-bar" style="height: 70%"></div>
                        <div class="chart-bar" style="height: 90%"></div>
                    </div>
                </div>
                <div class="metric-card" id="latencyMetric">
                    <div class="metric-title">延迟</div>
                    <div class="metric-value" id="latencyValue">0</div>
                    <div class="metric-unit">ms</div>
                    <div class="latency-breakdown">
                        <div class="latency-item">GC暂停: <span id="gcPause">5ms</span></div>
                        <div class="latency-item">编译时间: <span id="compileTime">2ms</span></div>
                    </div>
                </div>
                <div class="metric-card" id="memoryMetric">
                    <div class="metric-title">内存使用</div>
                    <div class="metric-value" id="memoryValue">0</div>
                    <div class="metric-unit">MB</div>
                    <div class="memory-breakdown">
                        <div class="memory-segment heap-memory" style="width: 60%">堆内存</div>
                        <div class="memory-segment non-heap-memory" style="width: 20%">非堆</div>
                        <div class="memory-segment free-memory" style="width: 20%">空闲</div>
                    </div>
                </div>
                <div class="metric-card" id="gcMetric">
                    <div class="metric-title">垃圾回收</div>
                    <div class="metric-value" id="gcValue">0</div>
                    <div class="metric-unit">次/分钟</div>
                    <div class="gc-breakdown">
                        <div class="gc-item">Minor GC: <span id="minorGCCount">0</span></div>
                        <div class="gc-item">Major GC: <span id="majorGCCount">0</span></div>
                    </div>
                </div>
            </div>
            <div class="tuning-panel">
                <div class="tuning-section">
                    <div class="tuning-title">JVM参数调优</div>
                    <div class="parameter-control">
                        <label>-Xmx (最大堆内存)</label>
                        <input type="range" id="maxHeapSlider" min="512" max="8192" value="2048">
                        <span id="maxHeapValue">2048MB</span>
                    </div>
                    <div class="parameter-control">
                        <label>-XX:NewRatio (新生代比例)</label>
                        <input type="range" id="newRatioSlider" min="1" max="8" value="2">
                        <span id="newRatioValue">1:2</span>
                    </div>
                    <div class="parameter-control">
                        <label>GC收集器</label>
                        <select id="gcCollectorSelect">
                            <option value="serial">Serial GC</option>
                            <option value="parallel">Parallel GC</option>
                            <option value="g1">G1 GC</option>
                            <option value="zgc">ZGC</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    SetupLevelControls(levelNumber) {
        const container = document.getElementById('gameControls');
        
        switch(levelNumber) {
            case 1:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.ExecuteJavaProgram()">执行Java程序</button>
                    <button class="control-btn" onclick="game.ShowCompilationProcess()">查看编译过程</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            case 2:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.LoadClass()">加载类</button>
                    <button class="control-btn" onclick="game.ShowDelegationModel()">双亲委派</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            case 3:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.AllocateObject()">分配对象</button>
                    <button class="control-btn" onclick="game.CallMethod()">调用方法</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            case 4:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.CreateNewObject()">创建新对象</button>
                    <button class="control-btn" onclick="game.TriggerMinorGC()">触发Minor GC</button>
                    <button class="control-btn" onclick="game.PromoteToOldGen()">提升到老年代</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            case 5:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.StartGCCycle()">开始GC循环</button>
                    <button class="control-btn" onclick="game.CompareGCAlgorithms()">比较GC算法</button>
                    <button class="control-btn" onclick="game.ViewGCStats()">查看GC统计</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            case 6:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.LoadClassMetadata()">加载类元数据</button>
                    <button class="control-btn" onclick="game.ViewConstantPool()">查看常量池</button>
                    <button class="control-btn" onclick="game.ShowMetaspaceUsage()">元空间使用情况</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            case 7:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.StartProfiling()">开始性能分析</button>
                    <button class="control-btn" onclick="game.TriggerJITCompilation()">触发JIT编译</button>
                    <button class="control-btn" onclick="game.ComparePerformance()">性能对比</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            case 8:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.SimulateThreads()">模拟多线程</button>
                    <button class="control-btn" onclick="game.TestSynchronization()">测试同步机制</button>
                    <button class="control-btn" onclick="game.ShowMemoryModel()">内存模型演示</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            case 9:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.RunPerformanceTest()">运行性能测试</button>
                    <button class="control-btn" onclick="game.TuneJVMParameters()">调优JVM参数</button>
                    <button class="control-btn" onclick="game.AnalyzeBottlenecks()">分析性能瓶颈</button>
                    <button class="control-btn" onclick="game.NextTask()">下一步</button>
                `;
                break;
            default:
                container.innerHTML = `
                    <button class="control-btn" onclick="game.NextTask()">开始学习</button>
                `;
        }
    }

    ExecuteJavaProgram() {
        this.AnimateComponent('javaCode', 'jvmEngine');
        this.UpdateProgress(25);
        this.ShowMessage('Java程序开始执行！');
    }

    ShowCompilationProcess() {
        this.AnimateComponent('javaCode', 'bytecode');
        this.UpdateProgress(50);
        this.ShowMessage('源代码编译为字节码！');
    }

    LoadClass() {
        this.AnimateComponent('applicationLoader', 'bootstrapLoader');
        this.UpdateProgress(33);
        this.ShowMessage('类加载器开始工作！');
    }

    ShowDelegationModel() {
        this.AnimateComponent('customLoader', 'applicationLoader');
        this.AnimateComponent('applicationLoader', 'extensionLoader');
        this.AnimateComponent('extensionLoader', 'bootstrapLoader');
        this.UpdateProgress(66);
        this.ShowMessage('双亲委派模型确保安全性！');
    }

    AllocateObject() {
        const heapArea = document.getElementById('heapArea');
        if (heapArea) {
            const newBlock = document.createElement('div');
            newBlock.className = 'memory-block';
            newBlock.textContent = '新对象';
            newBlock.style.animation = 'fadeIn 0.5s ease';
            heapArea.querySelector('.component-content').appendChild(newBlock);
        }
        this.UpdateProgress(30);
        this.ShowMessage('对象在堆内存分配！');
    }

    CallMethod() {
        this.AnimateComponent('heapArea', 'stackArea');
        this.UpdateProgress(60);
        this.ShowMessage('方法调用，栈帧入栈！');
    }

    // 第4关：堆内存管理
    CreateNewObject() {
        const edenSpace = document.getElementById('edenObjects');
        const edenUsage = document.getElementById('edenUsage');
        
        if (edenSpace) {
            const newObject = document.createElement('div');
            newObject.className = 'memory-block new-object';
            newObject.textContent = `对象${Math.floor(Math.random() * 100)}`;
            newObject.style.animation = 'fadeIn 0.5s ease';
            edenSpace.appendChild(newObject);
            
            const currentUsage = parseInt(edenUsage.textContent) || 0;
            const newUsage = Math.min(currentUsage + 15, 100);
            edenUsage.textContent = `${newUsage}%`;
            
            this.UpdateProgress(25);
            this.ShowMessage('新对象在Eden区分配！');
        }
    }

    TriggerMinorGC() {
        const edenObjects = document.getElementById('edenObjects');
        const s0Objects = document.getElementById('s0Objects');
        const s0Usage = document.getElementById('s0Usage');
        
        if (edenObjects && s0Objects) {
            // 模拟将存活对象移动到Survivor0
            const aliveObjects = edenObjects.querySelectorAll('.memory-block');
            let survivorCount = 0;
            
            aliveObjects.forEach((obj, index) => {
                if (index % 3 === 0) { // 1/3对象存活
                    const survivorObj = obj.cloneNode(true);
                    survivorObj.classList.add('survivor-object');
                    s0Objects.appendChild(survivorObj);
                    survivorCount++;
                }
                obj.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => obj.remove(), 500);
            });
            
            // 更新使用率
            document.getElementById('edenUsage').textContent = '0%';
            s0Usage.textContent = `${survivorCount * 10}%`;
            
            this.UpdateProgress(50);
            this.ShowMessage('Minor GC完成！存活对象移至Survivor区');
        }
    }

    PromoteToOldGen() {
        const s0Objects = document.getElementById('s0Objects');
        const oldObjects = document.getElementById('oldObjects');
        const oldUsage = document.getElementById('oldUsage');
        
        if (s0Objects && oldObjects) {
            const survivorObjects = s0Objects.querySelectorAll('.memory-block');
            let promotedCount = 0;
            
            survivorObjects.forEach((obj, index) => {
                if (index % 2 === 0) { // 一半对象提升
                    const oldObj = obj.cloneNode(true);
                    oldObj.classList.add('old-generation');
                    oldObj.textContent = oldObj.textContent + ' (老年代)';
                    oldObjects.appendChild(oldObj);
                    promotedCount++;
                    obj.remove();
                }
            });
            
            const currentOldUsage = parseInt(oldUsage.textContent) || 20;
            oldUsage.textContent = `${Math.min(currentOldUsage + promotedCount * 5, 80)}%`;
            
            this.UpdateProgress(75);
            this.ShowMessage('长期存活对象提升到老年代！');
        }
    }

    // 第5关：垃圾回收机制
    StartGCCycle() {
        const gcProgress = document.getElementById('gcProgress');
        const gcCollected = document.getElementById('gcCollected');
        const gcFreed = document.getElementById('gcFreed');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (gcProgress) gcProgress.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                if (gcCollected) gcCollected.textContent = '12';
                if (gcFreed) gcFreed.textContent = '248KB';
                this.ShowMessage('GC循环完成！释放了248KB内存');
                this.UpdateProgress(30);
            }
        }, 200);
        
        // 标记垃圾对象
        document.querySelectorAll('.gc-object.unreachable').forEach(obj => {
            obj.style.backgroundColor = '#ff6b6b';
            obj.style.animation = 'pulse 1s infinite';
        });
    }

    CompareGCAlgorithms() {
        const algorithms = ['serialGC', 'parallelGC', 'g1GC'];
        algorithms.forEach((id, index) => {
            const card = document.getElementById(id);
            if (card) {
                setTimeout(() => {
                    card.classList.add('active');
                    card.style.transform = 'scale(1.05)';
                }, index * 300);
            }
        });
        
        this.UpdateProgress(60);
        this.ShowMessage('比较不同GC算法的特性');
    }

    ViewGCStats() {
        this.UpdateProgress(90);
        this.ShowMessage('GC统计：Minor GC 15次，Major GC 2次');
    }

    // 第6关：方法区与元空间
    LoadClassMetadata() {
        const classData = document.getElementById('classData');
        if (classData) {
            const newClass = document.createElement('div');
            newClass.className = 'class-item';
            newClass.innerHTML = `
                <strong>类: ArrayList</strong>
                <div class="class-details">
                    <div class="method-info">方法: add(E), get(int), size()</div>
                    <div class="field-info">字段: elementData[], size</div>
                    <div class="constant-info">常量: DEFAULT_CAPACITY = 10</div>
                </div>
            `;
            newClass.style.animation = 'slideIn 0.5s ease';
            classData.appendChild(newClass);
        }
        
        this.UpdateProgress(30);
        this.ShowMessage('ArrayList类元数据加载到元空间！');
    }

    ViewConstantPool() {
        document.querySelectorAll('.constant-item').forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('active');
                item.style.backgroundColor = '#e3f2fd';
            }, index * 200);
        });
        
        this.UpdateProgress(60);
        this.ShowMessage('常量池包含字符串、类引用和方法引用');
    }

    ShowMetaspaceUsage() {
        const usage = document.getElementById('metaspaceUsage');
        if (usage) {
            let currentSize = 256;
            const interval = setInterval(() => {
                currentSize += 32;
                usage.textContent = `${currentSize}KB`;
                if (currentSize >= 512) {
                    clearInterval(interval);
                }
            }, 100);
        }
        
        this.UpdateProgress(90);
        this.ShowMessage('元空间使用量增长，动态扩展！');
    }

    // 第7关：JIT编译优化
    StartProfiling() {
        const callCount = document.getElementById('callCount');
        const loopCount = document.getElementById('loopCount');
        const hotspotStatus = document.getElementById('hotspotStatus');
        
        let calls = 0;
        let loops = 0;
        
        const interval = setInterval(() => {
            calls += Math.floor(Math.random() * 500) + 100;
            loops += Math.floor(Math.random() * 200) + 50;
            
            if (callCount) callCount.textContent = calls;
            if (loopCount) loopCount.textContent = loops;
            
            if (calls > 5000 && hotspotStatus) {
                hotspotStatus.textContent = '热点代码';
                hotspotStatus.style.color = '#ff6b6b';
                clearInterval(interval);
                this.ShowMessage('检测到热点代码，准备JIT编译！');
            }
        }, 300);
        
        this.UpdateProgress(30);
    }

    TriggerJITCompilation() {
        const compileProgress = document.getElementById('compileProgress');
        const stages = ['C1编译中...', 'C2优化中...', '编译完成'];
        let stage = 0;
        
        const interval = setInterval(() => {
            if (compileProgress) compileProgress.textContent = stages[stage];
            stage++;
            
            if (stage >= stages.length) {
                clearInterval(interval);
                document.getElementById('nativeExecution').classList.add('active');
                this.ShowMessage('JIT编译完成，切换到本地代码执行！');
            }
        }, 1000);
        
        this.UpdateProgress(60);
    }

    ComparePerformance() {
        this.UpdateProgress(90);
        this.ShowMessage('性能提升：解释执行 vs JIT编译 = 1:10');
    }

    // 第8关：并发与线程安全
    SimulateThreads() {
        const countValue = document.getElementById('countValue');
        const t1CountValue = document.getElementById('t1CountValue');
        const t2CountValue = document.getElementById('t2CountValue');
        
        let mainCount = 0;
        let t1Count = 0;
        let t2Count = 0;
        
        // 模拟并发修改
        const interval1 = setInterval(() => {
            t1Count++;
            if (t1CountValue) t1CountValue.textContent = t1Count;
            
            // 偶尔同步到主内存
            if (t1Count % 3 === 0) {
                mainCount = Math.max(mainCount, t1Count);
                if (countValue) countValue.textContent = mainCount;
            }
        }, 500);
        
        const interval2 = setInterval(() => {
            t2Count++;
            if (t2CountValue) t2CountValue.textContent = t2Count;
            
            // 偶尔同步到主内存
            if (t2Count % 4 === 0) {
                mainCount = Math.max(mainCount, t2Count);
                if (countValue) countValue.textContent = mainCount;
            }
        }, 700);
        
        setTimeout(() => {
            clearInterval(interval1);
            clearInterval(interval2);
            this.ShowMessage('线程间数据不一致！需要同步机制');
        }, 5000);
        
        this.UpdateProgress(30);
    }

    TestSynchronization() {
        const syncLockStatus = document.getElementById('syncLockStatus');
        const t1SyncStatus = document.getElementById('t1SyncStatus');
        const t2SyncStatus = document.getElementById('t2SyncStatus');
        
        if (syncLockStatus) syncLockStatus.textContent = '线程1持有锁';
        if (t1SyncStatus) {
            t1SyncStatus.textContent = '已同步';
            t1SyncStatus.style.color = '#4caf50';
        }
        if (t2SyncStatus) {
            t2SyncStatus.textContent = '等待锁';
            t2SyncStatus.style.color = '#ff9800';
        }
        
        setTimeout(() => {
            if (syncLockStatus) syncLockStatus.textContent = '线程2持有锁';
            if (t1SyncStatus) {
                t1SyncStatus.textContent = '等待锁';
                t1SyncStatus.style.color = '#ff9800';
            }
            if (t2SyncStatus) {
                t2SyncStatus.textContent = '已同步';
                t2SyncStatus.style.color = '#4caf50';
            }
        }, 2000);
        
        this.UpdateProgress(60);
        this.ShowMessage('synchronized确保互斥访问');
    }

    ShowMemoryModel() {
        const volatileStatus = document.getElementById('volatileStatus');
        if (volatileStatus) {
            volatileStatus.textContent = '立即可见';
            volatileStatus.style.color = '#4caf50';
        }
        
        this.UpdateProgress(90);
        this.ShowMessage('volatile关键字保证内存可见性');
    }

    // 第9关：性能调优实战
    RunPerformanceTest() {
        const throughputValue = document.getElementById('throughputValue');
        const latencyValue = document.getElementById('latencyValue');
        const memoryValue = document.getElementById('memoryValue');
        const gcValue = document.getElementById('gcValue');
        
        // 模拟性能指标变化
        let throughput = 1000;
        let latency = 50;
        let memory = 1024;
        let gcCount = 5;
        
        const interval = setInterval(() => {
            throughput += Math.floor(Math.random() * 200) - 100;
            latency += Math.floor(Math.random() * 20) - 10;
            memory += Math.floor(Math.random() * 100) - 50;
            gcCount += Math.floor(Math.random() * 3);
            
            if (throughputValue) throughputValue.textContent = Math.max(throughput, 0);
            if (latencyValue) latencyValue.textContent = Math.max(latency, 1);
            if (memoryValue) memoryValue.textContent = Math.max(memory, 512);
            if (gcValue) gcValue.textContent = Math.max(gcCount, 0);
        }, 500);
        
        setTimeout(() => {
            clearInterval(interval);
            this.ShowMessage('性能基线测试完成！');
        }, 3000);
        
        this.UpdateProgress(30);
    }

    TuneJVMParameters() {
        const maxHeapSlider = document.getElementById('maxHeapSlider');
        const maxHeapValue = document.getElementById('maxHeapValue');
        const newRatioSlider = document.getElementById('newRatioSlider');
        const newRatioValue = document.getElementById('newRatioValue');
        
        if (maxHeapSlider) {
            maxHeapSlider.addEventListener('input', (e) => {
                if (maxHeapValue) maxHeapValue.textContent = `${e.target.value}MB`;
                this.ShowMessage(`堆内存调整为${e.target.value}MB`);
            });
        }
        
        if (newRatioSlider) {
            newRatioSlider.addEventListener('input', (e) => {
                if (newRatioValue) newRatioValue.textContent = `1:${e.target.value}`;
                this.ShowMessage(`新生代比例调整为1:${e.target.value}`);
            });
        }
        
        this.UpdateProgress(60);
        this.ShowMessage('开始JVM参数调优');
    }

    AnalyzeBottlenecks() {
        this.UpdateProgress(90);
        this.ShowMessage('分析完成：GC频繁是主要瓶颈，建议增大堆内存');
    }

    AnimateComponent(fromId, toId) {
        const fromElement = document.getElementById(fromId);
        const toElement = document.getElementById(toId);
        
        if (fromElement) fromElement.classList.add('active');
        if (toElement) {
            setTimeout(() => {
                toElement.classList.add('active');
            }, 500);
        }
    }

    UpdateProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
    }

    ShowMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-popup';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4f46e5;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1001;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 2000);
    }

    // 调试函数：检查当前界面状态
    DebugUIState() {
        const states = {
            levelSelector: !document.getElementById('levelSelector').classList.contains('hidden'),
            gameArea: !document.getElementById('gameArea').classList.contains('hidden'),
            quizArea: !document.getElementById('quizArea').classList.contains('hidden'),
            levelComplete: !document.getElementById('levelComplete').classList.contains('hidden')
        };
        console.log('UI State:', states);
        return states;
    }

    NextTask() {
        this.StartQuiz();
    }

    StartQuiz() {
        document.getElementById('gameArea').classList.add('hidden');
        document.getElementById('quizArea').classList.remove('hidden');
        
        this.currentQuestions = this.GetQuizQuestions(this.currentLevel);
        this.currentQuizIndex = 0;
        this.selectedAnswer = null;
        
        this.DisplayQuestion();
    }

    GetQuizQuestions(levelNumber) {
        const quizData = {
            1: [
                {
                    question: "JVM的全称是什么？",
                    options: ["Java Virtual Machine", "Java Version Manager", "Java Variable Method", "Java Visual Model"],
                    correct: 0,
                    explanation: "JVM是Java Virtual Machine的缩写，即Java虚拟机。"
                },
                {
                    question: "JVM的主要作用是什么？",
                    options: ["编译Java源代码", "执行Java字节码", "管理Java项目", "设计Java界面"],
                    correct: 1,
                    explanation: "JVM的主要作用是执行Java字节码，为Java程序提供运行环境。"
                },
                {
                    question: "以下哪个不是JVM的组成部分？",
                    options: ["类加载器", "执行引擎", "运行时数据区", "源代码编辑器"],
                    correct: 3,
                    explanation: "源代码编辑器不是JVM的组成部分，它是开发工具。"
                }
            ],
            2: [
                {
                    question: "类加载的三个主要阶段是什么？",
                    options: ["编译、链接、运行", "加载、链接、初始化", "读取、解析、执行", "扫描、分析、加载"],
                    correct: 1,
                    explanation: "类加载的三个阶段是：加载(Loading)、链接(Linking)、初始化(Initialization)。"
                },
                {
                    question: "双亲委派模型的主要目的是什么？",
                    options: ["提高加载速度", "确保类加载安全", "减少内存使用", "简化代码结构"],
                    correct: 1,
                    explanation: "双亲委派模型确保核心类库的安全性，防止用户代码替换系统类。"
                }
            ],
            3: [
                {
                    question: "以下哪个区域存储对象实例？",
                    options: ["方法区", "堆内存", "栈内存", "程序计数器"],
                    correct: 1,
                    explanation: "堆内存(Heap)是存储对象实例的主要区域。"
                },
                {
                    question: "程序计数器的作用是什么？",
                    options: ["计算程序运行时间", "记录当前执行指令位置", "统计程序行数", "计算内存使用量"],
                    correct: 1,
                    explanation: "程序计数器记录当前线程执行的字节码指令位置。"
                }
            ],
            4: [
                {
                    question: "新生代包含哪些区域？",
                    options: ["Eden + Survivor0", "Eden + Survivor0 + Survivor1", "Eden + Old Generation", "Survivor0 + Survivor1"],
                    correct: 1,
                    explanation: "新生代包含Eden区、Survivor0区和Survivor1区三个部分。"
                },
                {
                    question: "对象什么时候会被提升到老年代？",
                    options: ["刚创建时", "第一次GC后", "在Survivor区存活足够长时间", "被引用时"],
                    correct: 2,
                    explanation: "对象在Survivor区经历多次GC后仍存活，会被提升到老年代。"
                },
                {
                    question: "Eden区的主要作用是什么？",
                    options: ["存储老对象", "分配新对象", "垃圾回收", "方法调用"],
                    correct: 1,
                    explanation: "Eden区是新对象分配的主要区域。"
                }
            ],
            5: [
                {
                    question: "Minor GC主要清理哪个区域？",
                    options: ["老年代", "新生代", "方法区", "栈内存"],
                    correct: 1,
                    explanation: "Minor GC主要清理新生代中的垃圾对象。"
                },
                {
                    question: "G1 GC的主要优势是什么？",
                    options: ["吞吐量最高", "内存使用最少", "低延迟", "实现最简单"],
                    correct: 2,
                    explanation: "G1 GC的主要优势是提供可预测的低延迟垃圾回收。"
                },
                {
                    question: "标记-清除算法的缺点是什么？",
                    options: ["速度慢", "内存碎片", "占用CPU高", "实现复杂"],
                    correct: 1,
                    explanation: "标记-清除算法会产生内存碎片，影响大对象的分配。"
                }
            ],
            6: [
                {
                    question: "元空间(Metaspace)存储什么内容？",
                    options: ["对象实例", "类的元数据", "方法的字节码", "常量值"],
                    correct: 1,
                    explanation: "元空间存储类的元数据信息，如类结构、方法信息等。"
                },
                {
                    question: "常量池中不包含以下哪种类型？",
                    options: ["字符串常量", "类引用", "方法引用", "对象实例"],
                    correct: 3,
                    explanation: "常量池包含各种常量和符号引用，但不包含对象实例。"
                },
                {
                    question: "JDK8之前方法区的实现是什么？",
                    options: ["元空间", "永久代", "堆内存", "栈内存"],
                    correct: 1,
                    explanation: "JDK8之前方法区通过永久代(PermGen)实现。"
                }
            ],
            7: [
                {
                    question: "JIT编译器什么时候开始工作？",
                    options: ["程序启动时", "检测到热点代码时", "内存不足时", "程序结束时"],
                    correct: 1,
                    explanation: "JIT编译器在检测到热点代码（频繁执行的代码）时开始工作。"
                },
                {
                    question: "C1和C2编译器的区别是什么？",
                    options: ["C1快速编译，C2深度优化", "C1处理客户端，C2处理服务端", "C1编译字节码，C2编译源码", "没有区别"],
                    correct: 0,
                    explanation: "C1编译器快速编译，C2编译器进行深度优化，提供更高性能。"
                },
                {
                    question: "JIT编译的主要优势是什么？",
                    options: ["减少内存使用", "提高执行速度", "简化代码", "增强安全性"],
                    correct: 1,
                    explanation: "JIT编译将热点代码编译为本地机器码，大幅提高执行速度。"
                }
            ],
            8: [
                {
                    question: "Java内存模型中，线程间如何共享数据？",
                    options: ["直接访问对方内存", "通过主内存", "通过消息传递", "通过文件系统"],
                    correct: 1,
                    explanation: "Java内存模型中，线程通过主内存进行数据共享。"
                },
                {
                    question: "volatile关键字的作用是什么？",
                    options: ["提高性能", "保证原子性", "保证可见性", "减少内存使用"],
                    correct: 2,
                    explanation: "volatile关键字保证变量的可见性和有序性，但不保证原子性。"
                },
                {
                    question: "synchronized关键字解决什么问题？",
                    options: ["内存泄漏", "性能问题", "线程安全", "编译错误"],
                    correct: 2,
                    explanation: "synchronized关键字通过互斥锁解决多线程环境下的线程安全问题。"
                }
            ],
            9: [
                {
                    question: "JVM性能调优的主要指标是什么？",
                    options: ["代码行数", "吞吐量和延迟", "内存大小", "CPU频率"],
                    correct: 1,
                    explanation: "JVM性能调优主要关注吞吐量（处理能力）和延迟（响应时间）。"
                },
                {
                    question: "-Xmx参数的作用是什么？",
                    options: ["设置最小堆内存", "设置最大堆内存", "设置栈大小", "设置方法区大小"],
                    correct: 1,
                    explanation: "-Xmx参数用于设置JVM的最大堆内存大小。"
                },
                {
                    question: "性能调优时，如果GC频繁应该怎么办？",
                    options: ["减少堆内存", "增加堆内存", "关闭GC", "重启应用"],
                    correct: 1,
                    explanation: "GC频繁通常是因为堆内存不足，应该适当增加堆内存大小。"
                }
            ]
        };
        
        return quizData[levelNumber] || [];
    }

    DisplayQuestion() {
        if (this.currentQuizIndex >= this.currentQuestions.length) {
            this.CompleteQuiz();
            return;
        }

        const question = this.currentQuestions[this.currentQuizIndex];
        
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('quizProgressText').textContent = 
            `问题 ${this.currentQuizIndex + 1}/${this.currentQuestions.length}`;

        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = question.options.map((option, index) => 
            `<div class="option" onclick="game.SelectAnswer(${index})">${option}</div>`
        ).join('');

        // 重置状态
        this.selectedAnswer = null;
        const submitBtn = document.getElementById('submitAnswer');
        const nextBtn = document.getElementById('nextQuestion');
        
        submitBtn.disabled = true;
        submitBtn.classList.remove('hidden');
        nextBtn.classList.add('hidden');
        
        document.getElementById('quizFeedback').innerHTML = '';
        document.getElementById('quizFeedback').className = 'quiz-feedback';
    }

    SelectAnswer(answerIndex) {
        // 清除之前的选择
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });

        // 选择当前答案
        document.querySelectorAll('.option')[answerIndex].classList.add('selected');
        this.selectedAnswer = answerIndex;
        
        // 启用提交按钮
        const submitBtn = document.getElementById('submitAnswer');
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    }

    SubmitAnswer() {
        if (this.selectedAnswer === null) return;

        const question = this.currentQuestions[this.currentQuizIndex];
        const isCorrect = this.selectedAnswer === question.correct;
        
        document.querySelectorAll('.option').forEach((option, index) => {
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === this.selectedAnswer && !isCorrect) {
                option.classList.add('incorrect');
            }
            option.style.pointerEvents = 'none';
        });

        const feedback = document.getElementById('quizFeedback');
        feedback.innerHTML = `
            <div>${isCorrect ? '✅ 正确！' : '❌ 错误！'}</div>
            <div style="margin-top: 0.5rem; font-size: 0.9rem;">${question.explanation}</div>
        `;
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;

        if (isCorrect) {
            this.playerData.experience += 20;
        }

        document.getElementById('submitAnswer').classList.add('hidden');
        document.getElementById('nextQuestion').classList.remove('hidden');
    }

    NextQuestion() {
        this.currentQuizIndex++;
        this.DisplayQuestion();
    }

    CompleteQuiz() {
        document.getElementById('quizArea').classList.add('hidden');
        this.CompleteLevel();
    }

    CompleteLevel() {
        const completionTime = this.gameStartTime ? 
            Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
        
        const baseExp = [50, 75, 100, 125, 150, 175, 200, 225, 250];
        const expReward = baseExp[this.currentLevel - 1] || 50;
        const knowledgeReward = 10; // 增加知识点奖励
        
        this.playerData.experience += expReward;
        this.playerData.knowledgePoints += knowledgeReward;
        
        // 计算正确率
        const accuracy = this.currentQuestions ? 
            Math.round((this.correctAnswers / this.currentQuestions.length) * 100) : 100;
        
        const requiredExp = this.playerData.level * 100;
        if (this.playerData.experience >= requiredExp) {
            this.playerData.level++;
            this.playerData.experience -= requiredExp;
            
            // 升级效果
            this.showLevelUpEffect();
        }
        
        if (!this.playerData.unlockedLevels.includes(this.currentLevel + 1) && 
            this.currentLevel < 9) {
            this.playerData.unlockedLevels.push(this.currentLevel + 1);
        }
        
        if (!this.playerData.completedLevels.includes(this.currentLevel)) {
            this.playerData.completedLevels.push(this.currentLevel);
        }
        
        // 检查成就
        this.CheckAchievements(completionTime, accuracy);
        
        this.SavePlayerData();
        
        // 更新完成界面
        document.getElementById('earnedExp').textContent = `+${expReward}`;
        const accuracyElement = document.getElementById('accuracyRate');
        if (accuracyElement) {
            accuracyElement.textContent = `${accuracy}%`;
        }
        
        document.getElementById('completionTime').textContent = 
            `${Math.floor(completionTime / 60)}:${(completionTime % 60).toString().padStart(2, '0')}`;
        
        // 显示新成就
        const newAchievement = this.GetLatestAchievement();
        const achievementElement = document.getElementById('newAchievement');
        if (achievementElement && newAchievement) {
            achievementElement.textContent = newAchievement;
        }
        
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (nextLevelBtn) {
            if (this.currentLevel < 9) {
                nextLevelBtn.style.display = 'block';
            } else {
                nextLevelBtn.style.display = 'none';
            }
        }
        
        document.getElementById('levelComplete').classList.remove('hidden');
        this.UpdatePlayerStats();
        
        // 粒子庆祝效果
        if (this.particleSystem) {
            setTimeout(() => {
                this.particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, '#ffd700');
            }, 500);
        }
    }
    
    CheckAchievements(completionTime, accuracy) {
        const achievementIds = {
            1: 'first_level',
            2: 'class_expert', 
            3: 'memory_master',
            4: 'memory_architect',
            5: 'gc_expert',
            6: 'metadata_guardian',
            7: 'compilation_master',
            8: 'concurrency_expert',
            9: 'jvm_master'
        };
        
        // 关卡完成成就
        const levelAchievement = achievementIds[this.currentLevel];
        if (levelAchievement) {
            this.unlockAchievement(levelAchievement);
        }
        
        // 速度成就
        if (completionTime <= 300) { // 5分钟内
            this.unlockAchievement('speed_runner');
        }
        
        // 完美主义者成就
        if (accuracy === 100) {
            this.unlockAchievement('perfectionist');
        }
        
        // 全部完成成就
        if (this.playerData.completedLevels.length === 9) {
            this.unlockAchievement('jvm_master');
        }
    }
    
    GetLatestAchievement() {
        const achievementNames = {
            'first_level': '🏆 新手探索者',
            'class_expert': '🔗 类加载专家',
            'memory_master': '🧠 内存大师',
            'memory_architect': '🏗️ 内存建筑师',
            'gc_expert': '🗑️ GC专家',
            'metadata_guardian': '📚 元数据守护者',
            'compilation_master': '⚡ 编译大师',
            'concurrency_expert': '🔒 并发专家',
            'jvm_master': '👑 JVM大师',
            'perfectionist': '💎 完美主义者',
            'speed_runner': '⚡ 速度之王'
        };
        
        if (window.gameState && gameState.achievements && gameState.achievements.length > 0) {
            const latestAchievement = gameState.achievements[gameState.achievements.length - 1];
            return achievementNames[latestAchievement] || '🏆 新成就';
        }
        
        return '🏆 学习达人';
    }

    BackToLevels() {
        // 关闭所有弹窗
        document.getElementById('levelComplete').classList.add('hidden');
        document.getElementById('gameArea').classList.add('hidden');
        document.getElementById('quizArea').classList.add('hidden');
        
        // 显示关卡选择界面
        this.ShowLevelSelector();
        this.UpdatePlayerStats();
    }

    NextLevel() {
        if (this.currentLevel < 9) {
            // 关闭完成弹窗
            document.getElementById('levelComplete').classList.add('hidden');
            // 开始下一关
            this.StartLevel(this.currentLevel + 1);
        }
    }

    RestartLevel() {
        // 关闭完成弹窗
        document.getElementById('levelComplete').classList.add('hidden');
        // 重新开始当前关卡
        this.StartLevel(this.currentLevel);
    }

    ShowModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    CloseModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
}

// 全局函数
function goBack() {
    window.location.href = '../index.html';
}

function StartLevel(levelNumber) {
    console.log('StartLevel called with:', levelNumber);
    const game = ensureGameInstance();
    if (game && game.StartLevel) {
        game.StartLevel(levelNumber);
    } else {
        console.error('Game instance or StartLevel method not available');
    }
}

function BackToLevels() {
    console.log('BackToLevels called');
    const game = ensureGameInstance();
    if (game && game.BackToLevels) {
        game.BackToLevels();
    }
}

function NextLevel() {
    console.log('NextLevel called');
    const game = ensureGameInstance();
    if (game && game.NextLevel) {
        game.NextLevel();
    }
}

function RestartLevel() {
    console.log('RestartLevel called');
    const game = ensureGameInstance();
    if (game && game.RestartLevel) {
        game.RestartLevel();
    }
}

function SubmitAnswer() {
    console.log('SubmitAnswer called');
    const game = ensureGameInstance();
    if (game && game.SubmitAnswer) {
        game.SubmitAnswer();
    }
}

function NextQuestion() {
    console.log('NextQuestion called');
    const game = ensureGameInstance();
    if (game && game.NextQuestion) {
        game.NextQuestion();
    }
}

function ShowModal(modalId) {
    console.log('ShowModal called with:', modalId);
    const game = ensureGameInstance();
    if (game && game.ShowModal) {
        game.ShowModal(modalId);
    }
}

function CloseModal(modalId) {
    console.log('CloseModal called with:', modalId);
    const game = ensureGameInstance();
    if (game && game.CloseModal) {
        game.CloseModal(modalId);
    }
}

// 全局游戏化功能函数
window.game = {
    NextTutorialStep: function() {
        console.log('NextTutorialStep called');
        const game = ensureGameInstance();
        if (game && game.NextTutorialStep) {
            game.NextTutorialStep();
        }
    },
    SkipTutorial: function() {
        console.log('SkipTutorial called');
        const game = ensureGameInstance();
        if (game && game.SkipTutorial) {
            game.SkipTutorial();
        }
    },
    ShowAchievements: function() {
        console.log('ShowAchievements called');
        const game = ensureGameInstance();
        if (game && game.ShowAchievements) {
            game.ShowAchievements();
        }
    },
    ShowProgress: function() {
        console.log('ShowProgress called');
        const game = ensureGameInstance();
        if (game && game.ShowProgress) {
            game.ShowProgress();
        }
    },
    ShowHelp: function() {
        console.log('ShowHelp called');
        const game = ensureGameInstance();
        if (game && game.ShowHelp) {
            game.ShowHelp();
        }
    },
    ShowHint: function() {
        console.log('ShowHint called');
        const game = ensureGameInstance();
        if (game && game.ShowHint) {
            game.ShowHint();
        }
    },
    CloseAchievementModal: function() {
        console.log('CloseAchievementModal called');
        const game = ensureGameInstance();
        if (game && game.CloseAchievementModal) {
            game.CloseAchievementModal();
        }
    },
    
    // 关卡1：JVM基础概念
    ExecuteJavaProgram: function() {
        console.log('ExecuteJavaProgram called');
        const game = ensureGameInstance();
        if (game && game.ExecuteJavaProgram) {
            game.ExecuteJavaProgram();
        }
    },
    ShowCompilationProcess: function() {
        console.log('ShowCompilationProcess called');
        const game = ensureGameInstance();
        if (game && game.ShowCompilationProcess) {
            game.ShowCompilationProcess();
        }
    },
    
    // 关卡2：类加载机制
    LoadClass: function() {
        console.log('LoadClass called');
        const game = ensureGameInstance();
        if (game && game.LoadClass) {
            game.LoadClass();
        }
    },
    ShowDelegationModel: function() {
        console.log('ShowDelegationModel called');
        const game = ensureGameInstance();
        if (game && game.ShowDelegationModel) {
            game.ShowDelegationModel();
        }
    },
    
    // 关卡3：内存结构概览
    AllocateObject: function() {
        console.log('AllocateObject called');
        const game = ensureGameInstance();
        if (game && game.AllocateObject) {
            game.AllocateObject();
        }
    },
    CallMethod: function() {
        console.log('CallMethod called');
        const game = ensureGameInstance();
        if (game && game.CallMethod) {
            game.CallMethod();
        }
    },
    
    // 关卡4：堆内存管理
    CreateNewObject: function() {
        console.log('CreateNewObject called');
        const game = ensureGameInstance();
        if (game && game.CreateNewObject) {
            game.CreateNewObject();
        }
    },
    TriggerMinorGC: function() {
        console.log('TriggerMinorGC called');
        const game = ensureGameInstance();
        if (game && game.TriggerMinorGC) {
            game.TriggerMinorGC();
        }
    },
    PromoteToOldGen: function() {
        console.log('PromoteToOldGen called');
        const game = ensureGameInstance();
        if (game && game.PromoteToOldGen) {
            game.PromoteToOldGen();
        }
    },
    
    // 关卡5：垃圾回收机制
    StartGCCycle: function() {
        console.log('StartGCCycle called');
        const game = ensureGameInstance();
        if (game && game.StartGCCycle) {
            game.StartGCCycle();
        }
    },
    CompareGCAlgorithms: function() {
        console.log('CompareGCAlgorithms called');
        const game = ensureGameInstance();
        if (game && game.CompareGCAlgorithms) {
            game.CompareGCAlgorithms();
        }
    },
    ViewGCStats: function() {
        console.log('ViewGCStats called');
        const game = ensureGameInstance();
        if (game && game.ViewGCStats) {
            game.ViewGCStats();
        }
    },
    
    // 关卡6：方法区与元空间
    LoadClassMetadata: function() {
        console.log('LoadClassMetadata called');
        const game = ensureGameInstance();
        if (game && game.LoadClassMetadata) {
            game.LoadClassMetadata();
        }
    },
    ViewConstantPool: function() {
        console.log('ViewConstantPool called');
        const game = ensureGameInstance();
        if (game && game.ViewConstantPool) {
            game.ViewConstantPool();
        }
    },
    ShowMetaspaceUsage: function() {
        console.log('ShowMetaspaceUsage called');
        const game = ensureGameInstance();
        if (game && game.ShowMetaspaceUsage) {
            game.ShowMetaspaceUsage();
        }
    },
    
    // 关卡7：JIT编译优化
    StartProfiling: function() {
        console.log('StartProfiling called');
        const game = ensureGameInstance();
        if (game && game.StartProfiling) {
            game.StartProfiling();
        }
    },
    TriggerJITCompilation: function() {
        console.log('TriggerJITCompilation called');
        const game = ensureGameInstance();
        if (game && game.TriggerJITCompilation) {
            game.TriggerJITCompilation();
        }
    },
    ComparePerformance: function() {
        console.log('ComparePerformance called');
        const game = ensureGameInstance();
        if (game && game.ComparePerformance) {
            game.ComparePerformance();
        }
    },
    
    // 关卡8：并发与线程安全
    SimulateThreads: function() {
        console.log('SimulateThreads called');
        const game = ensureGameInstance();
        if (game && game.SimulateThreads) {
            game.SimulateThreads();
        }
    },
    TestSynchronization: function() {
        console.log('TestSynchronization called');
        const game = ensureGameInstance();
        if (game && game.TestSynchronization) {
            game.TestSynchronization();
        }
    },
    ShowMemoryModel: function() {
        console.log('ShowMemoryModel called');
        const game = ensureGameInstance();
        if (game && game.ShowMemoryModel) {
            game.ShowMemoryModel();
        }
    },
    
    // 关卡9：性能调优实战
    RunPerformanceTest: function() {
        console.log('RunPerformanceTest called');
        const game = ensureGameInstance();
        if (game && game.RunPerformanceTest) {
            game.RunPerformanceTest();
        }
    },
    TuneJVMParameters: function() {
        console.log('TuneJVMParameters called');
        const game = ensureGameInstance();
        if (game && game.TuneJVMParameters) {
            game.TuneJVMParameters();
        }
    },
    AnalyzeBottlenecks: function() {
        console.log('AnalyzeBottlenecks called');
        const game = ensureGameInstance();
        if (game && game.AnalyzeBottlenecks) {
            game.AnalyzeBottlenecks();
        }
    },
    
    // 通用任务控制
    NextTask: function() {
        console.log('NextTask called');
        const game = ensureGameInstance();
        if (game && game.NextTask) {
            game.NextTask();
        }
    }
};

// 初始化游戏
let gameInstance;

// 确保游戏实例在DOM加载完成后立即创建
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    gameInstance = new JVMExplorerGame();
    console.log('Game instance created:', gameInstance);
});

// 备用初始化方法，确保游戏实例存在
function ensureGameInstance() {
    if (!gameInstance) {
        console.log('Creating game instance...');
        gameInstance = new JVMExplorerGame();
    }
    return gameInstance;
} 