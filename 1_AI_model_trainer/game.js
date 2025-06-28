// AI模型训练师游戏 - 核心逻辑
class AITrainerGame {
    constructor() {
        this.gameState = {
            coins: 1000,
            energy: 100,
            maxEnergy: 100,
            level: 1,
            experience: 0,
            experienceToNext: 100,
            models: [],
            selectedModel: null,
            isTraining: false,
            achievements: [],
            completedTasks: [],
            autoTrain: false,
            pendingRewards: 0,
            streakDays: 0,
            lastLogin: Date.now(),
            totalTrainings: 0,
            // 被动收益系统
            passiveIncome: {
                perSecond: 0,
                multiplier: 1,
                lastUpdate: Date.now()
            },
            // 连击系统
            combo: {
                count: 0,
                multiplier: 1,
                lastAction: 0,
                maxCombo: 0
            },
            // AI助手系统
            aiAssistant: {
                isActive: false,
                strategy: 'balanced',
                decisions: 0,
                successRate: 0
            },
            // 竞技场系统
            arena: {
                wins: 0,
                losses: 0,
                currentOpponent: null,
                lastBattleTime: 0
            },
            // 研究系统
            research: {
                currentProject: null,
                progress: 0,
                completed: []
            },
            upgrades: {
                energyRegen: 1,
                trainingSpeed: 1,
                coinMultiplier: 1,
                maxEnergy: 100
            }
        };

        this.modelTypes = [
            { name: 'Neural Network', emoji: '🧠', accuracy: 60, speed: 80, cost: 500, color: 'blue' },
            { name: 'CNN Vision', emoji: '👁️', accuracy: 75, speed: 60, cost: 800, color: 'green' },
            { name: 'Transformer', emoji: '🔄', accuracy: 85, speed: 45, cost: 1200, color: 'purple' },
            { name: 'LSTM Memory', emoji: '🧩', accuracy: 70, speed: 70, cost: 1000, color: 'yellow' },
            { name: 'GAN Creator', emoji: '🎨', accuracy: 90, speed: 30, cost: 1500, color: 'pink' },
            { name: 'Reinforcement', emoji: '🎮', accuracy: 80, speed: 55, cost: 1300, color: 'red' }
        ];

        this.taskTypes = [
            { name: '图像分类', reward: 50, difficulty: 1, requiredAccuracy: 60, emoji: '🖼️' },
            { name: '文本分析', reward: 80, difficulty: 2, requiredAccuracy: 70, emoji: '📝' },
            { name: '语音识别', reward: 120, difficulty: 3, requiredAccuracy: 75, emoji: '🎤' },
            { name: '预测分析', reward: 150, difficulty: 4, requiredAccuracy: 80, emoji: '📊' },
            { name: '创意生成', reward: 200, difficulty: 5, requiredAccuracy: 85, emoji: '🎭' },
            { name: '游戏AI', reward: 300, difficulty: 6, requiredAccuracy: 90, emoji: '🎯' }
        ];

        this.achievementsList = [
            { id: 'first_model', name: '第一个模型', description: '购买你的第一个AI模型', reward: 100, emoji: '🥇' },
            { id: 'train_master', name: '训练大师', description: '完成100次训练', reward: 500, emoji: '🏆' },
            { id: 'task_expert', name: '任务专家', description: '完成50个任务', reward: 300, emoji: '⭐' },
            { id: 'millionaire', name: '百万富翁', description: '拥有10000金币', reward: 1000, emoji: '💰' },
            { id: 'collector', name: '收藏家', description: '拥有所有类型的模型', reward: 800, emoji: '📚' }
        ];

        this.init();
    }

    init() {
        this.LoadGameState();
        this.SetupEventListeners();
        this.UpdateUI();
        this.GenerateInitialTasks();
        this.RenderAchievements();
        this.RenderUpgradeShop();
        this.UpdateResearchDisplay();
        
        // 给玩家一个初始模型
        if (this.gameState.models.length === 0) {
            this.AddModel(this.modelTypes[0]);
        }
        
        // 初始化竞技场对手
        setTimeout(() => this.GenerateArenaOpponent(), 2000);
        
        // 欢迎消息
        setTimeout(() => {
            this.ShowNotification('🎮 欢迎来到AI模型训练师！试试启动AI助手让游戏自动运行！', 'info');
        }, 1000);
    }

    SetupEventListeners() {
        // 购买模型按钮
        document.getElementById('addModelBtn').addEventListener('click', () => this.ShowModelPurchaseModal());
        
        // 开始训练按钮
        document.getElementById('startTrainingBtn').addEventListener('click', () => this.StartTraining());
        
        // AI助手按钮
        document.getElementById('aiToggleBtn').addEventListener('click', () => this.ToggleAIAssistant());
        
        // AI策略选择
        document.getElementById('aiStrategySelect').addEventListener('change', (e) => {
            this.gameState.aiAssistant.strategy = e.target.value;
            this.ShowNotification(`AI策略已切换为: ${this.GetStrategyName(e.target.value)}`, 'info');
        });
        
        // 竞技场挑战按钮
        document.getElementById('challengeBtn').addEventListener('click', () => this.StartBattle());
        
        // 研究按钮
        document.getElementById('researchBtn').addEventListener('click', () => this.StartResearch());
        
        // 收集奖励按钮
        document.getElementById('collectAllBtn').addEventListener('click', () => this.CollectAllRewards());
        
        // 幸运转盘按钮
        document.getElementById('spinBtn').addEventListener('click', () => this.SpinWheel());
        
        // 模型融合按钮
        document.getElementById('fuseBtn').addEventListener('click', () => this.FuseModels());
        
        // 被动收益提升按钮
        document.getElementById('boostIncomeBtn').addEventListener('click', () => this.BoostPassiveIncome());
        
        // 连击点击按钮
        document.getElementById('clickBoostBtn').addEventListener('click', () => this.ClickBoost());
        
        // 自动保存游戏状态
        setInterval(() => this.SaveGameState(), 5000);
        
        // 自动能量回复
        this.SetupEnergyRegen();
        
        // 自动任务刷新
        setInterval(() => this.RefreshTasks(), 30000);
        
        // AI助手决策循环
        setInterval(() => this.AIAssistantTick(), 3000);
        
        // 竞技场对手生成
        setInterval(() => this.GenerateArenaOpponent(), 60000);
        
        // 研究进度更新
        setInterval(() => this.UpdateResearch(), 5000);
        
        // 特殊事件生成
        setInterval(() => this.GenerateSpecialEvent(), 45000);
        
        // 更新排行榜
        setInterval(() => this.UpdateLeaderboards(), 10000);
        
        // 更新模型融合选项
        setInterval(() => this.UpdateFusionOptions(), 2000);
        
        // 被动收益更新
        setInterval(() => this.UpdatePassiveIncome(), 1000);
        
        // 连击系统衰减
        setInterval(() => this.UpdateComboSystem(), 500);
        
        // 粒子效果和动画
        setInterval(() => this.UpdateVisualEffects(), 100);
    }

    ShowModelPurchaseModal() {
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = `
            <h3 class="text-2xl font-bold text-white mb-4">🛒 购买新模型</h3>
            <div class="space-y-3 max-h-96 overflow-y-auto">
                ${this.modelTypes.map((type, index) => `
                    <div class="bg-white/10 p-4 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer" onclick="game.PurchaseModel(${index})">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">${type.emoji}</span>
                                <div>
                                    <h4 class="text-white font-semibold">${type.name}</h4>
                                    <p class="text-gray-300 text-sm">精度: ${type.accuracy}% | 速度: ${type.speed}%</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-yellow-400 font-bold">${type.cost}💰</p>
                                <p class="text-xs text-gray-400">${this.gameState.coins >= type.cost ? '可购买' : '金币不足'}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button onclick="game.CloseModal()" class="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                关闭
            </button>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    PurchaseModel(typeIndex) {
        const modelType = this.modelTypes[typeIndex];
        
        // 检查是否已拥有该模型
        const alreadyOwned = this.gameState.models.some(model => model.name === modelType.name);
        if (alreadyOwned) {
            this.ShowNotification('你已经拥有这个模型了！', 'warning');
            return;
        }
        
        if (this.gameState.coins >= modelType.cost) {
            this.gameState.coins -= modelType.cost;
            this.AddModel(modelType);
            this.CloseModal();
            this.ShowNotification(`🎉 成功购买 ${modelType.name}！`, 'success');
            this.CheckAchievement('first_model');
            this.CheckAchievement('collector');
            this.UpdateUI();
        } else {
            this.ShowNotification('金币不足！', 'error');
        }
    }

    AddModel(modelType) {
        const newModel = {
            id: Date.now(),
            ...modelType,
            level: 1,
            experience: 0,
            trainingCount: 0,
            isActive: false
        };
        
        this.gameState.models.push(newModel);
        this.UpdateUI();
    }

    StartTraining() {
        if (!this.gameState.selectedModel) {
            this.ShowNotification('请先选择一个模型！', 'warning');
            return;
        }

        if (this.gameState.energy < 10) {
            this.ShowNotification('能量不足！需要10点能量才能训练。', 'error');
            return;
        }

        if (this.gameState.isTraining) {
            this.ShowNotification('已经在训练中！', 'warning');
            return;
        }

        this.gameState.energy -= 10;
        this.gameState.isTraining = true;
        
        const trainingBtn = document.getElementById('startTrainingBtn');
        const trainingProgress = document.getElementById('trainingProgress');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        trainingBtn.disabled = true;
        trainingProgress.classList.remove('hidden');

        // 训练动画
        let progress = 0;
        const trainingSpeed = this.gameState.upgrades.trainingSpeed;
        const interval = setInterval(() => {
            progress += (1 + trainingSpeed * 0.5);
            progressBar.style.width = `${Math.min(progress, 100)}%`;
            progressText.textContent = `训练进度: ${Math.floor(Math.min(progress, 100))}%`;

            if (progress >= 100) {
                clearInterval(interval);
                this.CompleteTraining();
            }
        }, 50);
    }

    CompleteTraining() {
        const model = this.gameState.selectedModel;
        
        // 增加训练计数
        this.gameState.totalTrainings += 1;
        
        // 增加模型经验和玩家经验
        const expGain = Math.floor(Math.random() * 20) + 10;
        model.experience += expGain;
        model.trainingCount += 1;
        
        // 检查模型升级
        if (model.experience >= model.level * 50) {
            model.level += 1;
            model.accuracy = Math.min(model.accuracy + 2, 100);
            model.speed = Math.min(model.speed + 1, 100);
            this.ShowNotification(`🎉 ${model.name} 升级到 Lv.${model.level}！`, 'success');
            // 升级奖励
            this.AddPendingReward(model.level * 50);
        }

        // 增加玩家经验
        this.GainExperience(expGain);

        // 获得金币奖励（基础奖励 + 倍率 + 连击奖励）
        let coinReward = Math.floor((expGain * this.gameState.upgrades.coinMultiplier));
        
        // 连续训练奖励
        if (this.gameState.totalTrainings % 10 === 0) {
            coinReward *= 2;
            this.ShowNotification(`🔥 连续训练10次！金币翻倍！`, 'achievement');
        }
        
        // 暴击奖励 (5%概率)
        if (Math.random() < 0.05) {
            coinReward *= 5;
            this.ShowNotification(`💥 暴击！获得5倍金币奖励！`, 'achievement');
        }

        this.gameState.coins += coinReward;

        // 重置训练状态
        this.gameState.isTraining = false;
        document.getElementById('startTrainingBtn').disabled = false;
        document.getElementById('trainingProgress').classList.add('hidden');
        document.getElementById('progressBar').style.width = '0%';

        this.ShowNotification(`训练完成！获得 ${expGain} 经验和 ${coinReward} 金币`, 'success');
        this.AddCombo(); // 添加连击
        this.CreateFloatingText(`+${coinReward}💰`, '#00FF00'); // 显示浮动文字
        this.UpdateUI();
        this.CheckAchievement('train_master');
        
        // 随机掉落额外奖励
        this.RandomDropReward();
    }

    SelectModel(modelId) {
        this.gameState.selectedModel = this.gameState.models.find(m => m.id === modelId);
        this.UpdateTrainingDisplay();
        this.UpdateModelList();
    }

    UpdateTrainingDisplay() {
        const trainingDisplay = document.getElementById('trainingDisplay');
        
        if (this.gameState.selectedModel) {
            const model = this.gameState.selectedModel;
            trainingDisplay.innerHTML = `
                <div class="text-6xl mb-4 animate-pulse-slow">${model.emoji}</div>
                <h3 class="text-2xl font-bold text-white mb-2">${model.name}</h3>
                <p class="text-white mb-2">等级: ${model.level} | 经验: ${model.experience}/${model.level * 50}</p>
                <div class="flex justify-center gap-4 text-sm">
                    <span class="bg-blue-500/20 px-3 py-1 rounded-full text-blue-300">
                        精度: ${model.accuracy}%
                    </span>
                    <span class="bg-green-500/20 px-3 py-1 rounded-full text-green-300">
                        速度: ${model.speed}%
                    </span>
                </div>
            `;
        }
    }

    GenerateInitialTasks() {
        const taskList = document.getElementById('taskList');
        const tasks = this.GenerateRandomTasks(4);
        
        taskList.innerHTML = tasks.map(task => `
            <div class="bg-white/10 p-4 rounded-lg border-l-4 border-blue-500">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">${task.emoji}</span>
                        <h4 class="text-white font-semibold">${task.name}</h4>
                    </div>
                    <span class="text-yellow-400 font-bold">${task.reward}💰</span>
                </div>
                <p class="text-gray-300 text-sm mb-2">难度: ${'⭐'.repeat(task.difficulty)}</p>
                <p class="text-gray-300 text-sm mb-3">需要精度: ${task.requiredAccuracy}%</p>
                <button onclick="game.AttemptTask('${task.id}')" class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 py-2 rounded text-sm font-semibold transition-all duration-200">
                    接受任务
                </button>
            </div>
        `).join('');
        
        this.currentTasks = tasks;
    }

    GenerateRandomTasks(count) {
        const tasks = [];
        for (let i = 0; i < count; i++) {
            const baseTask = this.taskTypes[Math.floor(Math.random() * this.taskTypes.length)];
            tasks.push({
                id: `task_${Date.now()}_${i}`,
                ...baseTask,
                reward: baseTask.reward + Math.floor(Math.random() * 50)
            });
        }
        return tasks;
    }

    AttemptTask(taskId) {
        if (!this.gameState.selectedModel) {
            this.ShowNotification('请先选择一个模型来执行任务！', 'warning');
            return;
        }

        const task = this.currentTasks.find(t => t.id === taskId);
        const model = this.gameState.selectedModel;

        if (model.accuracy >= task.requiredAccuracy) {
            // 任务成功
            this.gameState.coins += task.reward;
            this.gameState.completedTasks.push(taskId);
            this.GainExperience(task.difficulty * 10);
            
            this.ShowNotification(`任务完成！获得 ${task.reward} 金币`, 'success');
            this.AddCombo(); // 添加连击
            this.CreateFloatingText(`+${task.reward}💰`, '#00BFFF'); // 显示浮动文字
            this.CheckAchievement('task_expert');
            this.CheckAchievement('millionaire');
            
            // 移除完成的任务，生成新任务
            this.currentTasks = this.currentTasks.filter(t => t.id !== taskId);
            this.currentTasks.push(...this.GenerateRandomTasks(1));
            this.GenerateInitialTasks();
        } else {
            this.ShowNotification(`任务失败！模型精度不够 (需要${task.requiredAccuracy}%，当前${model.accuracy}%)`, 'error');
        }
        
        this.UpdateUI();
    }

    GainExperience(amount) {
        this.gameState.experience += amount;
        
        while (this.gameState.experience >= this.gameState.experienceToNext) {
            this.gameState.experience -= this.gameState.experienceToNext;
            this.gameState.level += 1;
            this.gameState.experienceToNext = this.gameState.level * 100;
            this.gameState.maxEnergy += 10;
            this.gameState.energy = this.gameState.maxEnergy;
            
            this.ShowNotification(`等级提升！现在是 ${this.gameState.level} 级！`, 'success');
        }
    }

    RenderUpgradeShop() {
        const upgradeShop = document.getElementById('upgradeShop');
        const upgrades = [
            { name: '能量回复', current: this.gameState.upgrades.energyRegen, cost: 200, emoji: '⚡', key: 'energyRegen' },
            { name: '训练加速', current: this.gameState.upgrades.trainingSpeed, cost: 300, emoji: '🚀', key: 'trainingSpeed' },
            { name: '金币倍率', current: this.gameState.upgrades.coinMultiplier, cost: 500, emoji: '💰', key: 'coinMultiplier' }
        ];

        upgradeShop.innerHTML = upgrades.map((upgrade) => `
            <div class="bg-white/10 p-3 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">${upgrade.emoji}</span>
                        <span class="text-white font-semibold">${upgrade.name}</span>
                    </div>
                    <span class="text-yellow-400">Lv.${upgrade.current}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-300 text-sm">${upgrade.cost * upgrade.current}💰</span>
                    <button onclick="game.PurchaseUpgrade('${upgrade.key}')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-all duration-200">
                        升级
                    </button>
                </div>
            </div>
        `).join('');
    }

    PurchaseUpgrade(upgradeType) {
        const costs = { energyRegen: 200, trainingSpeed: 300, coinMultiplier: 500 };
        const cost = costs[upgradeType] * this.gameState.upgrades[upgradeType];

        if (this.gameState.coins >= cost) {
            this.gameState.coins -= cost;
            this.gameState.upgrades[upgradeType] += 1;
            this.ShowNotification(`升级成功！`, 'success');
            this.RenderUpgradeShop();
            this.UpdateUI();
        } else {
            this.ShowNotification('金币不足！', 'error');
        }
    }

    RenderAchievements() {
        const achievementList = document.getElementById('achievementList');
        
        achievementList.innerHTML = this.achievementsList.map(achievement => {
            const isCompleted = this.gameState.achievements.includes(achievement.id);
            return `
                <div class="bg-white/10 p-4 rounded-lg ${isCompleted ? 'border-2 border-yellow-500' : 'border border-gray-600'}">
                    <div class="text-center">
                        <div class="text-3xl mb-2 ${isCompleted ? '' : 'grayscale opacity-50'}">${achievement.emoji}</div>
                        <h4 class="text-white font-semibold text-sm mb-1">${achievement.name}</h4>
                        <p class="text-gray-300 text-xs mb-2">${achievement.description}</p>
                        ${isCompleted ? 
                            '<span class="text-green-400 text-xs">✅ 已完成</span>' : 
                            `<span class="text-yellow-400 text-xs">🎁 ${achievement.reward}💰</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    CheckAchievement(achievementId) {
        if (this.gameState.achievements.includes(achievementId)) return;

        let shouldUnlock = false;
        switch (achievementId) {
            case 'first_model':
                shouldUnlock = this.gameState.models.length >= 1;
                break;
            case 'train_master':
                shouldUnlock = this.gameState.models.reduce((total, model) => total + model.trainingCount, 0) >= 100;
                break;
            case 'task_expert':
                shouldUnlock = this.gameState.completedTasks.length >= 50;
                break;
            case 'millionaire':
                shouldUnlock = this.gameState.coins >= 10000;
                break;
            case 'collector':
                shouldUnlock = this.gameState.models.length >= this.modelTypes.length;
                break;
        }

        if (shouldUnlock) {
            this.gameState.achievements.push(achievementId);
            const achievement = this.achievementsList.find(a => a.id === achievementId);
            this.gameState.coins += achievement.reward;
            this.ShowNotification(`🏆 成就解锁：${achievement.name}！获得 ${achievement.reward} 金币`, 'achievement');
            this.RenderAchievements();
        }
    }

    SetupEnergyRegen() {
        setInterval(() => {
            if (this.gameState.energy < this.gameState.maxEnergy) {
                this.gameState.energy = Math.min(
                    this.gameState.energy + this.gameState.upgrades.energyRegen,
                    this.gameState.maxEnergy
                );
                this.UpdateUI();
            }
        }, 3000);
    }

    UpdateUI() {
        // 更新状态栏
        document.getElementById('coins').textContent = this.gameState.coins.toLocaleString();
        document.getElementById('energy').textContent = this.gameState.energy;
        document.getElementById('maxEnergy').textContent = this.gameState.maxEnergy;
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('experience').textContent = this.gameState.experience;
        document.getElementById('experienceToNext').textContent = this.gameState.experienceToNext;
        
        // 更新经验条
        const expPercentage = (this.gameState.experience / this.gameState.experienceToNext) * 100;
        document.getElementById('experienceBar').style.width = `${expPercentage}%`;

        // 更新模型列表
        this.UpdateModelList();
        
        // 更新训练按钮状态
        const trainingBtn = document.getElementById('startTrainingBtn');
        trainingBtn.disabled = !this.gameState.selectedModel || this.gameState.energy < 10 || this.gameState.isTraining;
    }

    UpdateModelList() {
        const modelList = document.getElementById('modelList');
        
        modelList.innerHTML = this.gameState.models.map(model => {
            const isSelected = this.gameState.selectedModel && this.gameState.selectedModel.id === model.id;
            const expPercent = (model.experience / (model.level * 50)) * 100;
            return `
                <div onclick="game.SelectModel(${model.id})" class="bg-white/10 p-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-500/20' : 'hover:bg-white/20'}">
                    <div class="flex items-center gap-2">
                        <span class="text-xl ${isSelected ? 'animate-pulse' : ''}">${model.emoji}</span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <h4 class="text-white font-semibold text-sm truncate">${model.name}</h4>
                                ${isSelected ? '<span class="text-blue-400 text-sm">✓</span>' : ''}
                            </div>
                            <p class="text-gray-300 text-xs">Lv.${model.level} | ${model.accuracy}%精度</p>
                            <div class="mt-1">
                                <div class="bg-gray-600 rounded-full h-1">
                                    <div class="bg-gradient-to-r from-blue-400 to-purple-600 h-1 rounded-full transition-all duration-300" style="width: ${expPercent}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    ShowNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        
        const colors = {
            success: 'from-green-500 to-emerald-600',
            error: 'from-red-500 to-rose-600',
            warning: 'from-yellow-500 to-orange-600',
            info: 'from-blue-500 to-cyan-600',
            achievement: 'from-purple-500 to-pink-600'
        };

        notification.className = `bg-gradient-to-r ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // 自动消失
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notifications.removeChild(notification);
            }, 300);
        }, 3000);
    }

    CloseModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    SaveGameState() {
        localStorage.setItem('aiTrainerGame', JSON.stringify(this.gameState));
    }

    LoadGameState() {
        const saved = localStorage.getItem('aiTrainerGame');
        if (saved) {
            const loadedState = JSON.parse(saved);
            this.gameState = { ...this.gameState, ...loadedState };
            this.CheckLoginStreak();
        }
    }

    CheckLoginStreak() {
        const now = Date.now();
        const lastLogin = this.gameState.lastLogin || now;
        const daysSinceLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLogin === 1) {
            this.gameState.streakDays += 1;
            this.ShowNotification(`连续登录 ${this.gameState.streakDays} 天！获得奖励！`, 'success');
            this.gameState.coins += this.gameState.streakDays * 100;
        } else if (daysSinceLogin > 1) {
            this.gameState.streakDays = 1;
            this.ShowNotification('欢迎回来！开始新的连续登录！', 'info');
        }
        
        this.gameState.lastLogin = now;
    }



    CollectAllRewards() {
        if (this.gameState.pendingRewards > 0) {
            this.gameState.coins += this.gameState.pendingRewards;
            this.ShowNotification(`收集了 ${this.gameState.pendingRewards} 金币奖励！`, 'success');
            this.gameState.pendingRewards = 0;
            this.UpdateUI();
        } else {
            this.ShowNotification('没有待收集的奖励！', 'warning');
        }
    }

    RefreshTasks() {
        // 随机刷新一个任务
        if (this.currentTasks && this.currentTasks.length < 6) {
            this.currentTasks.push(...this.GenerateRandomTasks(1));
            this.GenerateInitialTasks();
            this.ShowNotification('新任务已刷新！', 'info');
        }
    }

    AddPendingReward(amount) {
        this.gameState.pendingRewards += amount;
        const collectBtn = document.getElementById('collectAllBtn');
        if (this.gameState.pendingRewards > 0) {
            collectBtn.textContent = `📦 收集奖励 (${this.gameState.pendingRewards}💰)`;
            collectBtn.classList.add('animate-bounce');
        } else {
            collectBtn.textContent = '📦 收集奖励';
            collectBtn.classList.remove('animate-bounce');
        }
    }

    RandomDropReward() {
        const chance = Math.random();
        if (chance < 0.1) { // 10%概率掉落奖励
            const rewards = [
                { type: 'coins', amount: 100, message: '🎁 发现宝箱！获得100金币！' },
                { type: 'energy', amount: 20, message: '⚡ 发现能量水晶！回复20能量！' },
                { type: 'experience', amount: 50, message: '📚 发现知识卷轴！获得50经验！' }
            ];
            
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            
            switch (reward.type) {
                case 'coins':
                    this.AddPendingReward(reward.amount);
                    break;
                case 'energy':
                    this.gameState.energy = Math.min(this.gameState.energy + reward.amount, this.gameState.maxEnergy);
                    break;
                case 'experience':
                    this.GainExperience(reward.amount);
                    break;
            }
            
            this.ShowNotification(reward.message, 'achievement');
        }
    }

    // ==================== AI助手系统 ====================
    ToggleAIAssistant() {
        this.gameState.aiAssistant.isActive = !this.gameState.aiAssistant.isActive;
        const btn = document.getElementById('aiToggleBtn');
        const status = document.getElementById('aiStatus');
        
        if (this.gameState.aiAssistant.isActive) {
            btn.textContent = '⏸️ 停止AI助手';
            btn.classList.remove('from-purple-500', 'to-pink-600');
            btn.classList.add('from-red-500', 'to-red-600');
            status.textContent = `AI状态: 激活中 (${this.GetStrategyName(this.gameState.aiAssistant.strategy)})`;
            this.ShowNotification('🤖 AI助手已激活！将根据策略自动管理游戏', 'success');
        } else {
            btn.textContent = '🧠 启动AI助手';
            btn.classList.remove('from-red-500', 'to-red-600');
            btn.classList.add('from-purple-500', 'to-pink-600');
            status.textContent = 'AI状态: 休眠中';
            this.ShowNotification('😴 AI助手已休眠', 'info');
        }
    }

    GetStrategyName(strategy) {
        const names = {
            balanced: '平衡发展',
            aggressive: '激进扩张',
            conservative: '保守稳健',
            profit: '利润优先'
        };
        return names[strategy] || '未知策略';
    }

    AIAssistantTick() {
        if (!this.gameState.aiAssistant.isActive) return;

        this.gameState.aiAssistant.decisions++;
        const strategy = this.gameState.aiAssistant.strategy;

        // AI决策优先级
        const decisions = [];

        // 1. 选择最优模型
        if (!this.gameState.selectedModel || this.ShouldSwitchModel()) {
            decisions.push(() => this.AISelectBestModel());
        }

        // 2. 训练决策
        if (this.gameState.energy >= 10 && !this.gameState.isTraining) {
            decisions.push(() => this.AITrainDecision());
        }

        // 3. 任务执行决策
        if (this.HasAvailableTasks()) {
            decisions.push(() => this.AITaskDecision());
        }

        // 4. 购买决策
        if (this.ShouldAIPurchase(strategy)) {
            decisions.push(() => this.AIPurchaseDecision(strategy));
        }

        // 5. 升级决策
        if (this.ShouldAIUpgrade(strategy)) {
            decisions.push(() => this.AIUpgradeDecision(strategy));
        }

        // 执行一个随机决策
        if (decisions.length > 0) {
            const decision = decisions[Math.floor(Math.random() * decisions.length)];
            const success = decision();
            if (success) {
                this.gameState.aiAssistant.successRate = 
                    (this.gameState.aiAssistant.successRate * 0.9) + (success ? 10 : 0);
            }
        }

        // 更新AI状态显示
        this.UpdateAIStatus();
    }

    AISelectBestModel() {
        if (this.gameState.models.length === 0) return false;
        
        let bestModel = this.gameState.models[0];
        for (const model of this.gameState.models) {
            if (model.accuracy > bestModel.accuracy || 
                (model.accuracy === bestModel.accuracy && model.level > bestModel.level)) {
                bestModel = model;
            }
        }
        
        if (bestModel !== this.gameState.selectedModel) {
            this.SelectModel(bestModel.id);
            this.ShowNotification(`🤖 AI选择了 ${bestModel.name} (精度: ${bestModel.accuracy}%)`, 'info');
            return true;
        }
        return false;
    }

    AITrainDecision() {
        const strategy = this.gameState.aiAssistant.strategy;
        
        // 根据策略决定是否训练
        let shouldTrain = false;
        switch (strategy) {
            case 'aggressive':
                shouldTrain = this.gameState.energy >= 10;
                break;
            case 'conservative':
                shouldTrain = this.gameState.energy >= 50;
                break;
            case 'balanced':
                shouldTrain = this.gameState.energy >= 30;
                break;
            case 'profit':
                shouldTrain = this.gameState.energy >= 20 && this.gameState.selectedModel.accuracy < 90;
                break;
        }

        if (shouldTrain) {
            this.StartTraining();
            return true;
        }
        return false;
    }

    AITaskDecision() {
        if (!this.currentTasks || this.currentTasks.length === 0) return false;
        
        // 找到适合当前模型的最佳任务
        const suitableTasks = this.currentTasks.filter(task => 
            this.gameState.selectedModel && 
            this.gameState.selectedModel.accuracy >= task.requiredAccuracy
        );
        
        if (suitableTasks.length > 0) {
            // 选择奖励最高的任务
            const bestTask = suitableTasks.reduce((best, current) => 
                current.reward > best.reward ? current : best
            );
            
            this.AttemptTask(bestTask.id);
            this.ShowNotification(`🤖 AI执行了任务: ${bestTask.name}`, 'info');
            return true;
        }
        return false;
    }

    AIPurchaseDecision(strategy) {
        const affordableModels = this.modelTypes.filter(model => 
            this.gameState.coins >= model.cost &&
            !this.gameState.models.some(owned => owned.name === model.name)
        );

        if (affordableModels.length > 0) {
            let targetModel;
            switch (strategy) {
                case 'aggressive':
                    // 买最贵的
                    targetModel = affordableModels.reduce((best, current) => 
                        current.cost > best.cost ? current : best
                    );
                    break;
                case 'conservative':
                    // 买最便宜的
                    targetModel = affordableModels.reduce((best, current) => 
                        current.cost < best.cost ? current : best
                    );
                    break;
                case 'balanced':
                    // 买性价比最高的
                    targetModel = affordableModels.reduce((best, current) => 
                        (current.accuracy / current.cost) > (best.accuracy / best.cost) ? current : best
                    );
                    break;
                case 'profit':
                    // 买精度最高的
                    targetModel = affordableModels.reduce((best, current) => 
                        current.accuracy > best.accuracy ? current : best
                    );
                    break;
            }

            if (targetModel) {
                const typeIndex = this.modelTypes.indexOf(targetModel);
                this.PurchaseModel(typeIndex);
                this.ShowNotification(`🤖 AI购买了 ${targetModel.name}`, 'success');
                return true;
            }
        }
        return false;
    }

    AIUpgradeDecision(strategy) {
        const upgrades = ['energyRegen', 'trainingSpeed', 'coinMultiplier'];
        const costs = { energyRegen: 200, trainingSpeed: 300, coinMultiplier: 500 };
        
        const affordableUpgrades = upgrades.filter(upgrade => 
            this.gameState.coins >= costs[upgrade] * this.gameState.upgrades[upgrade]
        );

        if (affordableUpgrades.length > 0) {
            let targetUpgrade;
            switch (strategy) {
                case 'aggressive':
                    targetUpgrade = 'trainingSpeed';
                    break;
                case 'conservative':
                    targetUpgrade = 'energyRegen';
                    break;
                case 'balanced':
                    targetUpgrade = affordableUpgrades[0];
                    break;
                case 'profit':
                    targetUpgrade = 'coinMultiplier';
                    break;
            }

            if (affordableUpgrades.includes(targetUpgrade)) {
                this.PurchaseUpgrade(targetUpgrade);
                this.ShowNotification(`🤖 AI升级了 ${targetUpgrade}`, 'success');
                return true;
            }
        }
        return false;
    }

    ShouldSwitchModel() {
        if (!this.gameState.selectedModel) return true;
        
        // 如果有更好的模型就切换
        return this.gameState.models.some(model => 
            model.accuracy > this.gameState.selectedModel.accuracy && 
            model !== this.gameState.selectedModel
        );
    }

    HasAvailableTasks() {
        return this.currentTasks && this.currentTasks.some(task => 
            this.gameState.selectedModel && 
            this.gameState.selectedModel.accuracy >= task.requiredAccuracy
        );
    }

    ShouldAIPurchase(strategy) {
        const thresholds = {
            aggressive: 1000,
            conservative: 5000,
            balanced: 2000,
            profit: 1500
        };
        return this.gameState.coins >= thresholds[strategy];
    }

    ShouldAIUpgrade(strategy) {
        const thresholds = {
            aggressive: 800,
            conservative: 3000,
            balanced: 1500,
            profit: 1000
        };
        return this.gameState.coins >= thresholds[strategy];
    }

    UpdateAIStatus() {
        const status = document.getElementById('aiStatus');
        if (this.gameState.aiAssistant.isActive) {
            const successRate = Math.round(this.gameState.aiAssistant.successRate);
            status.textContent = `AI状态: 激活中 | 决策: ${this.gameState.aiAssistant.decisions} | 成功率: ${successRate}%`;
        }
    }

    // ==================== 竞技场系统 ====================
    GenerateArenaOpponent() {
        if (this.gameState.arena.currentOpponent) return; // 已有对手

        const opponentTypes = [
            { name: '新手训练师', emoji: '🤖', level: Math.max(1, this.gameState.level - 2), accuracy: 50 },
            { name: '进阶训练师', emoji: '🦾', level: this.gameState.level, accuracy: 70 },
            { name: '专家训练师', emoji: '🧠', level: this.gameState.level + 1, accuracy: 85 },
            { name: '大师训练师', emoji: '👑', level: this.gameState.level + 3, accuracy: 95 }
        ];

        const opponent = opponentTypes[Math.floor(Math.random() * opponentTypes.length)];
        this.gameState.arena.currentOpponent = {
            ...opponent,
            reward: opponent.level * 100 + Math.floor(Math.random() * 200)
        };

        this.UpdateArenaDisplay();
    }

    UpdateArenaDisplay() {
        const arenaOpponent = document.getElementById('arenaOpponent');
        const opponent = this.gameState.arena.currentOpponent;

        if (opponent) {
            arenaOpponent.innerHTML = `
                <div class="text-2xl mb-1">${opponent.emoji}</div>
                <div class="text-xs text-white font-semibold">${opponent.name}</div>
                <div class="text-xs text-gray-300">Lv.${opponent.level} | ${opponent.accuracy}%精度</div>
                <div class="text-xs text-yellow-400">奖励: ${opponent.reward}💰</div>
            `;
        }
    }

    StartBattle() {
        if (!this.gameState.selectedModel) {
            this.ShowNotification('请先选择一个模型参战！', 'warning');
            return;
        }

        if (!this.gameState.arena.currentOpponent) {
            this.ShowNotification('没有可挑战的对手！', 'warning');
            return;
        }

        const myModel = this.gameState.selectedModel;
        const opponent = this.gameState.arena.currentOpponent;

        // 模拟战斗
        const myPower = myModel.accuracy * myModel.level;
        const opponentPower = opponent.accuracy * opponent.level;
        
        // 添加随机因素
        const myRoll = myPower + Math.random() * 50;
        const opponentRoll = opponentPower + Math.random() * 50;

        const battleLog = document.getElementById('battleLog');
        let logText = `🥊 ${myModel.name} VS ${opponent.name}\n`;

        if (myRoll > opponentRoll) {
            // 胜利
            this.gameState.arena.wins++;
            this.gameState.coins += opponent.reward;
            this.GainExperience(opponent.level * 20);
            
            logText += `🎉 胜利！获得 ${opponent.reward}💰 和 ${opponent.level * 20} 经验\n`;
            this.ShowNotification(`🏆 击败了 ${opponent.name}！`, 'success');
        } else {
            // 失败
            this.gameState.arena.losses++;
            const consolationPrize = Math.floor(opponent.reward * 0.3);
            this.gameState.coins += consolationPrize;
            
            logText += `😢 失败！获得安慰奖 ${consolationPrize}💰\n`;
            this.ShowNotification(`💔 被 ${opponent.name} 击败了...`, 'error');
        }

        battleLog.textContent = logText;
        this.gameState.arena.currentOpponent = null;
        this.gameState.arena.lastBattleTime = Date.now();
        
        // 清除对手显示
        document.getElementById('arenaOpponent').innerHTML = `
            <div class="text-2xl mb-1">🤖</div>
            <div class="text-xs text-gray-300">寻找新对手中...</div>
        `;

        // 5秒后生成新对手
        setTimeout(() => this.GenerateArenaOpponent(), 5000);
        this.UpdateUI();
    }

    // ==================== 研究系统 ====================
    StartResearch() {
        if (this.gameState.research.currentProject) {
            this.ShowNotification('已有研究项目在进行中！', 'warning');
            return;
        }

        if (this.gameState.coins < 500) {
            this.ShowNotification('研究需要500金币！', 'error');
            return;
        }

        const researchProjects = [
            { name: '效率优化', description: '提升训练效率', bonus: 'trainingSpeed', value: 0.5 },
            { name: '能量管理', description: '提升能量回复', bonus: 'energyRegen', value: 1 },
            { name: '利润分析', description: '提升金币收益', bonus: 'coinMultiplier', value: 0.3 },
            { name: '模型进化', description: '随机提升所有模型', bonus: 'modelBonus', value: 2 }
        ];

        const project = researchProjects[Math.floor(Math.random() * researchProjects.length)];
        
        this.gameState.coins -= 500;
        this.gameState.research.currentProject = project;
        this.gameState.research.progress = 0;

        this.ShowNotification(`🔬 开始研究: ${project.name}`, 'success');
        this.UpdateResearchDisplay();
    }

    UpdateResearch() {
        if (!this.gameState.research.currentProject) return;

        this.gameState.research.progress += Math.floor(Math.random() * 5) + 1;

        if (this.gameState.research.progress >= 100) {
            this.CompleteResearch();
        } else {
            this.UpdateResearchDisplay();
        }
    }

    CompleteResearch() {
        const project = this.gameState.research.currentProject;
        
        // 应用研究奖励
        switch (project.bonus) {
            case 'trainingSpeed':
                this.gameState.upgrades.trainingSpeed += project.value;
                break;
            case 'energyRegen':
                this.gameState.upgrades.energyRegen += project.value;
                break;
            case 'coinMultiplier':
                this.gameState.upgrades.coinMultiplier += project.value;
                break;
            case 'modelBonus':
                this.gameState.models.forEach(model => {
                    model.accuracy = Math.min(model.accuracy + project.value, 100);
                });
                break;
        }

        this.gameState.research.completed.push(project);
        this.gameState.research.currentProject = null;
        this.gameState.research.progress = 0;

        this.ShowNotification(`🎉 研究完成: ${project.name}！`, 'achievement');
        this.UpdateResearchDisplay();
        this.UpdateUI();
    }

    UpdateResearchDisplay() {
        const researchProgress = document.getElementById('researchProgress');
        const researchBtn = document.getElementById('researchBtn');

        if (this.gameState.research.currentProject) {
            researchProgress.textContent = `研究: ${this.gameState.research.currentProject.name} (${this.gameState.research.progress}/100)`;
            researchBtn.textContent = '🔬 研究中...';
            researchBtn.disabled = true;
        } else {
            researchProgress.textContent = '研究进度: 0/100';
            researchBtn.textContent = '🔬 开始研究 (500💰)';
            researchBtn.disabled = false;
        }
    }

    // ==================== 特殊事件系统 ====================
    GenerateSpecialEvent() {
        const events = [
            { name: '金币雨', emoji: '💰', description: '天降金币！', effect: () => { 
                const bonus = Math.floor(Math.random() * 1000) + 500; 
                this.gameState.coins += bonus; 
                return `获得 ${bonus} 金币！`; 
            }},
            { name: '能量风暴', emoji: '⚡', description: '能量满溢！', effect: () => { 
                this.gameState.energy = this.gameState.maxEnergy; 
                return '能量已充满！'; 
            }},
            { name: '经验加速', emoji: '📚', description: '智慧之光！', effect: () => { 
                const bonus = Math.floor(Math.random() * 200) + 100; 
                this.GainExperience(bonus); 
                return `获得 ${bonus} 经验！`; 
            }},
            { name: '模型进化', emoji: '🧬', description: 'DNA突变！', effect: () => { 
                if (this.gameState.models.length > 0) {
                    const randomModel = this.gameState.models[Math.floor(Math.random() * this.gameState.models.length)];
                    randomModel.accuracy = Math.min(randomModel.accuracy + 5, 100);
                    return `${randomModel.name} 精度提升了5%！`;
                }
                return '需要拥有模型才能进化！';
            }}
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        const eventDiv = document.getElementById('specialEvent');
        
        eventDiv.innerHTML = `
            <div class="text-4xl mb-2 animate-bounce">${event.emoji}</div>
            <div class="text-xs text-yellow-400 font-semibold">${event.name}</div>
            <div class="text-xs text-gray-300">${event.description}</div>
            <button onclick="game.TriggerSpecialEvent('${events.indexOf(event)}')" class="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded text-xs font-bold">
                立即触发！
            </button>
        `;

        this.currentSpecialEvent = event;
        
        // 5分钟后自动消失
        setTimeout(() => {
            eventDiv.innerHTML = `
                <div class="text-4xl mb-2">🌟</div>
                <div class="text-xs text-gray-300">等待奇迹降临...</div>
            `;
            this.currentSpecialEvent = null;
        }, 300000);
    }

    TriggerSpecialEvent(eventIndex) {
        if (this.currentSpecialEvent) {
            const result = this.currentSpecialEvent.effect();
            this.ShowNotification(`🌟 ${this.currentSpecialEvent.name}: ${result}`, 'achievement');
            this.UpdateUI();
            
            // 清除事件
            document.getElementById('specialEvent').innerHTML = `
                <div class="text-4xl mb-2">🌟</div>
                <div class="text-xs text-gray-300">等待奇迹降临...</div>
            `;
            this.currentSpecialEvent = null;
        }
    }

    SpinWheel() {
        if (this.gameState.coins < 100) {
            this.ShowNotification('需要100金币才能转动转盘！', 'error');
            return;
        }

        this.gameState.coins -= 100;
        
        const rewards = [
            { name: '小奖', emoji: '🥉', value: 50, chance: 40 },
            { name: '中奖', emoji: '🥈', value: 200, chance: 30 },
            { name: '大奖', emoji: '🥇', value: 500, chance: 20 },
            { name: '超级大奖', emoji: '💎', value: 1000, chance: 9 },
            { name: '传说奖励', emoji: '👑', value: 5000, chance: 1 }
        ];

        // 根据概率选择奖励
        let random = Math.random() * 100;
        let selectedReward = rewards[0];
        
        for (const reward of rewards) {
            if (random <= reward.chance) {
                selectedReward = reward;
                break;
            }
            random -= reward.chance;
        }

        this.gameState.coins += selectedReward.value;
        this.ShowNotification(`🎰 ${selectedReward.emoji} ${selectedReward.name}！获得 ${selectedReward.value} 金币！`, 'achievement');
        this.UpdateUI();
    }

    // ==================== 模型融合系统 ====================
    UpdateFusionOptions() {
        const fuseModel1 = document.getElementById('fuseModel1');
        const fuseModel2 = document.getElementById('fuseModel2');
        
        // 更新模型选择列表
        const options = this.gameState.models.map(model => 
            `<option value="${model.id}">${model.name} (Lv.${model.level})</option>`
        ).join('');
        
        fuseModel1.innerHTML = '<option value="">选择模型1</option>' + options;
        fuseModel2.innerHTML = '<option value="">选择模型2</option>' + options;
    }

    FuseModels() {
        const model1Id = document.getElementById('fuseModel1').value;
        const model2Id = document.getElementById('fuseModel2').value;

        if (!model1Id || !model2Id) {
            this.ShowNotification('请选择两个不同的模型进行融合！', 'warning');
            return;
        }

        if (model1Id === model2Id) {
            this.ShowNotification('不能选择相同的模型！', 'warning');
            return;
        }

        if (this.gameState.coins < 1000) {
            this.ShowNotification('模型融合需要1000金币！', 'error');
            return;
        }

        const model1 = this.gameState.models.find(m => m.id == model1Id);
        const model2 = this.gameState.models.find(m => m.id == model2Id);

        this.gameState.coins -= 1000;

        // 创建融合模型
        const fusedModel = {
            id: Date.now(),
            name: `融合${model1.name.slice(0,2)}${model2.name.slice(0,2)}`,
            emoji: '🔮',
            accuracy: Math.min(Math.floor((model1.accuracy + model2.accuracy) / 2) + 10, 100),
            speed: Math.min(Math.floor((model1.speed + model2.speed) / 2) + 5, 100),
            cost: 0,
            color: 'rainbow',
            level: Math.max(model1.level, model2.level),
            experience: 0,
            trainingCount: 0,
            isActive: false,
            isFused: true
        };

        // 移除原模型
        this.gameState.models = this.gameState.models.filter(m => m.id != model1Id && m.id != model2Id);
        
        // 添加融合模型
        this.gameState.models.push(fusedModel);

        this.ShowNotification(`🔮 融合成功！创造了 ${fusedModel.name} (精度: ${fusedModel.accuracy}%)`, 'achievement');
        this.UpdateUI();
        this.UpdateFusionOptions();
    }

    // ==================== 排行榜系统 ====================
    UpdateLeaderboards() {
        // 更新玩家在排行榜中的位置
        document.getElementById('myWealthRank').textContent = this.CalculateWealthRank();
        document.getElementById('myBattleRecord').textContent = `${this.gameState.arena.wins}胜${this.gameState.arena.losses}负`;
        document.getElementById('myLevel').textContent = this.gameState.level;
    }

    CalculateWealthRank() {
        // 模拟排名计算
        if (this.gameState.coins >= 10000000) return '1';
        if (this.gameState.coins >= 1000000) return '2-10';
        if (this.gameState.coins >= 100000) return '11-100';
        if (this.gameState.coins >= 10000) return '101-1000';
                 return '1000+';
     }

    // ==================== 被动收益系统 ====================
    UpdatePassiveIncome() {
        const now = Date.now();
        const timeDiff = (now - this.gameState.passiveIncome.lastUpdate) / 1000;
        
        if (timeDiff >= 1) {
            const income = this.gameState.passiveIncome.perSecond * this.gameState.passiveIncome.multiplier;
            this.gameState.coins += Math.floor(income * timeDiff);
            this.gameState.passiveIncome.lastUpdate = now;
            
            // 更新显示
            document.getElementById('incomePerSecond').textContent = `+${Math.floor(income)}/秒`;
            
            // 如果有收益，显示粒子效果
            if (income > 0) {
                this.CreateFloatingText(`+${Math.floor(income * timeDiff)}💰`, '#FFD700');
            }
        }
        
        this.UpdateUI();
    }

    BoostPassiveIncome() {
        if (this.gameState.coins < 500) {
            this.ShowNotification('需要500金币才能提升被动收益！', 'error');
            return;
        }

        this.gameState.coins -= 500;
        this.gameState.passiveIncome.perSecond += this.gameState.level * 2;
        this.ShowNotification(`🚀 被动收益提升！现在每秒获得 ${this.gameState.passiveIncome.perSecond} 金币`, 'success');
        this.UpdateUI();
    }

    // ==================== 连击系统 ====================
    AddCombo() {
        const now = Date.now();
        
        // 如果上次操作在3秒内，增加连击
        if (now - this.gameState.combo.lastAction < 3000) {
            this.gameState.combo.count++;
        } else {
            this.gameState.combo.count = 1;
        }
        
        this.gameState.combo.lastAction = now;
        this.gameState.combo.maxCombo = Math.max(this.gameState.combo.maxCombo, this.gameState.combo.count);
        
        // 计算倍率
        this.gameState.combo.multiplier = 1 + (this.gameState.combo.count * 0.1);
        
        this.UpdateComboDisplay();
    }

    UpdateComboSystem() {
        const now = Date.now();
        
        // 连击衰减
        if (now - this.gameState.combo.lastAction > 3000 && this.gameState.combo.count > 0) {
            this.gameState.combo.count = Math.max(0, this.gameState.combo.count - 1);
            this.gameState.combo.multiplier = 1 + (this.gameState.combo.count * 0.1);
            this.UpdateComboDisplay();
        }
    }

    UpdateComboDisplay() {
        const comboEmoji = document.getElementById('comboEmoji');
        const comboCount = document.getElementById('comboCount');
        const comboBar = document.getElementById('comboBar');
        
        if (this.gameState.combo.count > 0) {
            comboCount.textContent = `x${this.gameState.combo.multiplier.toFixed(1)}`;
            comboBar.style.width = `${Math.min(this.gameState.combo.count * 10, 100)}%`;
            
            // 根据连击数改变表情和颜色
            if (this.gameState.combo.count >= 50) {
                comboEmoji.textContent = '🌟';
                comboEmoji.className = 'text-3xl mb-2 animate-spin';
            } else if (this.gameState.combo.count >= 20) {
                comboEmoji.textContent = '⚡';
                comboEmoji.className = 'text-3xl mb-2 animate-bounce';
            } else if (this.gameState.combo.count >= 10) {
                comboEmoji.textContent = '🔥';
                comboEmoji.className = 'text-3xl mb-2 animate-pulse';
            } else {
                comboEmoji.textContent = '🔥';
                comboEmoji.className = 'text-3xl mb-2';
            }
        } else {
            comboCount.textContent = 'x0';
            comboBar.style.width = '0%';
            comboEmoji.textContent = '🔥';
            comboEmoji.className = 'text-3xl mb-2';
        }
    }

    ClickBoost() {
        this.AddCombo();
        
        // 获得基于连击的金币奖励
        const baseReward = 10;
        const comboReward = Math.floor(baseReward * this.gameState.combo.multiplier);
        this.gameState.coins += comboReward;
        
        // 显示奖励文字
        this.CreateFloatingText(`+${comboReward}💰`, '#FFD700');
        
        // 增加被动收益
        this.gameState.passiveIncome.perSecond += 0.1;
        
        // 特殊连击奖励
        if (this.gameState.combo.count % 10 === 0 && this.gameState.combo.count > 0) {
            const bonusReward = this.gameState.combo.count * 50;
            this.gameState.coins += bonusReward;
            this.CreateFloatingText(`🎉 连击奖励 +${bonusReward}💰`, '#FF6B6B');
            this.ShowNotification(`🎉 ${this.gameState.combo.count}连击！获得特殊奖励！`, 'achievement');
        }
        
        this.UpdateUI();
    }

    // ==================== 视觉效果系统 ====================
    CreateFloatingText(text, color) {
        const gameContainer = document.getElementById('gameContainer');
        const floatingText = document.createElement('div');
        
        floatingText.textContent = text;
        floatingText.className = 'fixed text-lg font-bold pointer-events-none z-50';
        floatingText.style.color = color;
        floatingText.style.left = Math.random() * 200 + 'px';
        floatingText.style.top = Math.random() * 100 + 200 + 'px';
        floatingText.style.transform = 'translateY(0px)';
        floatingText.style.opacity = '1';
        floatingText.style.transition = 'all 2s ease-out';
        
        document.body.appendChild(floatingText);
        
        // 动画效果
        setTimeout(() => {
            floatingText.style.transform = 'translateY(-100px)';
            floatingText.style.opacity = '0';
        }, 100);
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(floatingText);
        }, 2100);
    }

    UpdateVisualEffects() {
        // 添加随机闪烁效果
        if (Math.random() < 0.01) {
            const elements = document.querySelectorAll('.animate-pulse, .animate-bounce');
            elements.forEach(el => {
                if (Math.random() < 0.3) {
                    el.style.filter = 'brightness(1.5)';
                    setTimeout(() => {
                        el.style.filter = 'brightness(1)';
                    }, 200);
                }
            });
        }
    }
}

// 初始化游戏
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new AITrainerGame();
});

// 点击模态框外部关闭
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        game.CloseModal();
    }
}); 