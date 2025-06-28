class AgentBuilderGame {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 6;
        this.agentBuilt = false;
        this.completedModules = new Set();
        this.agentPerformance = {
            accuracy: 0,
            speed: 0,
            creativity: 0,
            reliability: 0
        };
        this.achievements = new Set();
        this.knowledgeGraph = new Map();
        this.multiAgentMode = false;
        this.agents = [];
        
        this.initializeGame();
        this.bindEvents();
        this.createParticles();
        this.initializeKnowledgeGraph();
        this.createFloatingElements();
    }

    initializeGame() {
        // 初始化游戏状态
        this.updateProgress(0);
        this.showNotification('欢迎来到Agent构建师！🚀 准备探索AI Agent的奇妙世界', 'info');
        this.loadUserProgress();
    }

    loadUserProgress() {
        // 从localStorage加载用户进度
        const savedProgress = localStorage.getItem('agent-builder-progress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.completedModules = new Set(progress.completedModules || []);
            this.achievements = new Set(progress.achievements || []);
            this.agentPerformance = progress.agentPerformance || this.agentPerformance;
        }
    }

    saveUserProgress() {
        // 保存用户进度到localStorage
        const progress = {
            completedModules: Array.from(this.completedModules),
            achievements: Array.from(this.achievements),
            agentPerformance: this.agentPerformance,
            timestamp: Date.now()
        };
        localStorage.setItem('agent-builder-progress', JSON.stringify(progress));
    }

    initializeKnowledgeGraph() {
        // 初始化知识图谱
        this.knowledgeGraph.set('perception', {
            connections: ['reasoning', 'memory'],
            strength: 0.8,
            concepts: ['tokenization', 'embedding', 'context', 'multimodal']
        });
        this.knowledgeGraph.set('reasoning', {
            connections: ['tools', 'planning'],
            strength: 0.9,
            concepts: ['logic', 'inference', 'planning', 'decision']
        });
        this.knowledgeGraph.set('tools', {
            connections: ['feedback', 'execution'],
            strength: 0.7,
            concepts: ['api', 'function', 'integration', 'automation']
        });
        this.knowledgeGraph.set('feedback', {
            connections: ['perception', 'learning'],
            strength: 0.85,
            concepts: ['evaluation', 'optimization', 'adaptation', 'improvement']
        });
    }

    createFloatingElements() {
        // 创建更丰富的浮动元素
        const container = document.getElementById('particles-container');
        
        // 添加一些特殊的浮动元素
        setInterval(() => {
            if (Math.random() > 0.85) {
                const element = document.createElement('div');
                const symbols = ['🧠', '⚡', '🔧', '🔄', '💡', '🎯', '🌟', '✨'];
                element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                element.className = 'floating-symbol';
                element.style.left = Math.random() * 100 + '%';
                element.style.fontSize = (12 + Math.random() * 8) + 'px';
                element.style.animationDuration = (4 + Math.random() * 4) + 's';
                
                container.appendChild(element);
                
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }, 8000);
            }
        }, 2000);
    }

    bindEvents() {
        // 开始学习之旅
        document.getElementById('start-journey').addEventListener('click', () => {
            this.startJourney();
        });

        // 重置按钮
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        // 流程步骤点击事件
        document.querySelectorAll('.step-indicator').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(e.currentTarget.dataset.step);
                this.showStepDetails(stepNumber);
            });
        });

        // 交互式演示按钮
        document.querySelectorAll('.interactive-demo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const demoType = e.target.dataset.demo;
                this.runDemo(demoType);
            });
        });

        // Agent构建
        document.getElementById('build-agent').addEventListener('click', () => {
            this.buildAgent();
        });

        // 聊天功能
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // 重新开始
        document.getElementById('restart-journey').addEventListener('click', () => {
            this.resetGame();
        });

        // 分享成就
        document.getElementById('share-achievement').addEventListener('click', () => {
            this.shareAchievement();
        });
    }

    createParticles() {
        const container = document.getElementById('particles-container');
        
        // 创建浮动粒子
        setInterval(() => {
            if (Math.random() > 0.7) {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 2 + 's';
                
                container.appendChild(particle);
                
                // 6秒后移除粒子
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 6000);
            }
        }, 500);
    }

    startJourney() {
        // 隐藏介绍，显示流程图
        document.getElementById('intro-section').style.display = 'none';
        document.getElementById('agent-pipeline').classList.remove('hidden');
        
        this.currentStep = 1;
        this.updateProgress(16.67);
        this.showNotification('开始学习Agent构建流程！', 'success');
        
        // 延迟显示学习模块
        setTimeout(() => {
            document.getElementById('learning-modules').classList.remove('hidden');
            this.animateStepActivation(1);
        }, 1000);
    }

    animateStepActivation(stepNumber) {
        // 激活对应步骤
        document.querySelectorAll('.step-indicator').forEach(step => {
            step.classList.remove('active');
        });
        
        const currentStepElement = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // 激活连接线
        document.querySelectorAll('.connection-line').forEach(line => {
            line.classList.remove('active');
        });
        
        if (stepNumber <= 4) {
            const connectionId = stepNumber === 4 ? 'connection-4-1' : `connection-${stepNumber}-${stepNumber + 1}`;
            const connection = document.getElementById(connectionId);
            if (connection) {
                connection.classList.add('active');
            }
        }
    }

    showStepDetails(stepNumber) {
        const moduleMap = {
            1: 'perception-module',
            2: 'reasoning-module',
            3: 'tools-module',
            4: 'feedback-module'
        };

        // 隐藏所有模块
        Object.values(moduleMap).forEach(moduleId => {
            document.getElementById(moduleId).classList.add('hidden');
        });

        // 显示选中的模块
        const targetModule = moduleMap[stepNumber];
        if (targetModule) {
            document.getElementById(targetModule).classList.remove('hidden');
            this.animateStepActivation(stepNumber);
            this.completedModules.add(stepNumber);
            
            // 更新进度
            const progress = 16.67 + (this.completedModules.size * 16.67);
            this.updateProgress(progress);
            
            this.showNotification(`正在学习: ${this.getStepName(stepNumber)}`, 'info');
            
            // 显示性能面板
            if (this.completedModules.size >= 1) {
                document.getElementById('performance-section').classList.remove('hidden');
            }
            
            // 如果所有模块都学习完成，显示其他高级功能
            if (this.completedModules.size === 4) {
                setTimeout(() => {
                    this.showPracticeSection();
                    this.showKnowledgeGraph();
                    this.showMultiAgentDemo();
                }, 2000);
            }
        }
    }

    getStepName(stepNumber) {
        const names = {
            1: '感知模块',
            2: '推理引擎',
            3: '工具调用',
            4: '反馈循环'
        };
        return names[stepNumber] || '未知模块';
    }

    showPracticeSection() {
        document.getElementById('practice-section').classList.remove('hidden');
        this.updateProgress(83.33);
        this.showNotification('🎯 开始实践环节！', 'success');
        
        // 滚动到实践环节
        document.getElementById('practice-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    runDemo(demoType) {
        const demoMessages = {
            perception: {
                title: '🧠 感知模块实时演示',
                content: `正在处理输入: "帮我分析这段代码的性能问题"

📥 输入处理阶段:
1. 文本分词: ["帮我", "分析", "这段", "代码", "性能", "问题"]
2. 语义理解: 代码分析请求 → 性能优化任务
3. 上下文分析: 检测到编程相关内容
4. 意图识别: 代码审查 + 性能分析
5. 状态建模: 用户需要技术支持

🔍 多模态处理:
- 文本理解: ✓ 完成
- 代码识别: ✓ 检测到代码模式
- 上下文关联: ✓ 建立任务上下文

⚡ 输出状态:
感知置信度: 95% | 处理时间: 23ms`,
                color: 'blue'
            },
            reasoning: {
                title: '⚡ 推理引擎深度分析',
                content: `推理链构建过程:

🎯 任务分解:
1. 主任务: 代码性能分析
2. 子任务: [语法检查, 算法分析, 资源使用评估]
3. 优先级: 高 (技术问题需要准确回答)

🧮 知识检索:
- 编程最佳实践库: ✓ 已加载
- 性能优化模式: ✓ 已检索
- 常见问题数据库: ✓ 已匹配

🔄 推理步骤:
1. 分析代码结构 → 识别潜在瓶颈
2. 评估算法复杂度 → 计算时间/空间复杂度
3. 检查资源使用 → 内存/CPU使用模式
4. 生成优化建议 → 具体改进方案

📊 推理结果:
置信度: 92% | 推理深度: 4层 | 耗时: 156ms`,
                color: 'purple'
            },
            tools: {
                title: '🛠️ 工具调用协调中心',
                content: `工具编排执行流程:

🔧 工具选择阶段:
- 代码分析器: ✓ 已激活
- 性能监测器: ✓ 已就绪  
- 优化建议生成器: ✓ 已加载
- 报告生成器: ✓ 待命中

📡 API调用序列:
1. CodeAnalyzer.analyze(code_snippet)
   → 返回: 语法树 + 复杂度分析
2. PerformanceProfiler.profile(analysis_result)
   → 返回: 性能指标 + 瓶颈识别
3. OptimizationEngine.suggest(performance_data)
   → 返回: 优化建议列表
4. ReportGenerator.create(suggestions)
   → 返回: 格式化报告

⚡ 执行状态:
并发调用: 3个工具 | 成功率: 100% | 总耗时: 340ms`,
                color: 'green'
            },
            feedback: {
                title: '🔄 反馈循环智能优化',
                content: `自适应学习过程:

📈 性能评估:
- 用户满意度: 4.8/5.0 ⭐
- 响应准确率: 94.2%
- 处理速度: 平均 234ms
- 工具调用成功率: 98.5%

🎯 优化策略:
1. 检测到代码分析请求增多
   → 预加载编程相关知识库
2. 用户偏好技术深度内容
   → 调整回答详细程度权重
3. 性能分析工具使用频繁
   → 优化工具调用缓存策略

🔄 自动调整:
- 知识库权重: 编程 +15%, 通用 -5%
- 响应模式: 技术详细模式 ✓
- 工具预热: 代码分析工具常驻内存

📊 学习效果:
模型适应度: +12% | 用户体验: +8% | 效率提升: +15%`,
                color: 'orange'
            }
        };

        const demo = demoMessages[demoType];
        if (demo) {
            this.showDetailedNotification(demo.title, demo.content, demo.color);
            this.updateAgentPerformance(demoType);
            this.checkAchievements();
        }
    }

    updateAgentPerformance(demoType) {
        // 根据演示类型更新Agent性能指标
        const performanceBoosts = {
            perception: { accuracy: 5, speed: 3 },
            reasoning: { accuracy: 8, creativity: 6 },
            tools: { speed: 7, reliability: 5 },
            feedback: { reliability: 8, accuracy: 4 }
        };

        const boost = performanceBoosts[demoType];
        if (boost) {
            Object.keys(boost).forEach(metric => {
                this.agentPerformance[metric] = Math.min(100, 
                    this.agentPerformance[metric] + boost[metric]);
            });
            this.updatePerformanceDisplay();
            this.saveUserProgress();
        }
    }

    updatePerformanceDisplay() {
        // 更新性能显示
        Object.keys(this.agentPerformance).forEach(metric => {
            const bar = document.getElementById(`${metric}-bar`);
            const value = document.getElementById(`${metric}-value`);
            if (bar && value) {
                bar.style.width = this.agentPerformance[metric] + '%';
                value.textContent = this.agentPerformance[metric] + '%';
            }
        });
    }

    checkAchievements() {
        // 检查并解锁成就
        const newAchievements = [];

        if (this.completedModules.size >= 4 && !this.achievements.has('master_learner')) {
            this.achievements.add('master_learner');
            newAchievements.push('🎓 学习大师 - 完成所有核心模块学习');
        }

        if (this.agentPerformance.accuracy >= 80 && !this.achievements.has('accuracy_expert')) {
            this.achievements.add('accuracy_expert');
            newAchievements.push('🎯 精准专家 - Agent准确率达到80%');
        }

        if (Object.values(this.agentPerformance).every(v => v >= 50) && !this.achievements.has('balanced_builder')) {
            this.achievements.add('balanced_builder');
            newAchievements.push('⚖️ 平衡构建师 - 所有性能指标均衡发展');
        }

        // 显示新解锁的成就
        newAchievements.forEach(achievement => {
            setTimeout(() => {
                this.showNotification(achievement, 'success');
            }, Math.random() * 2000);
        });

        this.saveUserProgress();
    }

    buildAgent() {
        const agentName = document.getElementById('agent-name').value || '智能助手';
        const agentFunction = document.getElementById('agent-function').value;
        const selectedTools = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        if (!agentName.trim()) {
            this.showNotification('请输入Agent名称！', 'error');
            return;
        }

        // 创建构建动画
        this.showBuildingAnimation();

        // 模拟构建过程
        this.showNotification('🔧 正在初始化Agent架构...', 'info');
        
        setTimeout(() => {
            this.showNotification('🧠 配置感知模块...', 'info');
        }, 800);

        setTimeout(() => {
            this.showNotification('⚡ 加载推理引擎...', 'info');
        }, 1600);

        setTimeout(() => {
            this.showNotification('🛠️ 集成工具系统...', 'info');
        }, 2400);

        setTimeout(() => {
            this.showNotification('🔄 建立反馈循环...', 'info');
        }, 3200);

        setTimeout(() => {
            this.agentBuilt = true;
            this.enableChat();
            this.updateProgress(100);
            
            // 创建Agent实例
            const newAgent = {
                name: agentName,
                function: agentFunction,
                tools: selectedTools,
                performance: { ...this.agentPerformance },
                createdAt: new Date().toISOString()
            };
            this.agents.push(newAgent);
            
            const chatArea = document.getElementById('agent-chat');
            chatArea.innerHTML = `
                <div class="mb-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                    <div class="flex items-center mb-2">
                        <div class="text-2xl mr-3">🤖</div>
                        <div>
                            <div class="font-semibold text-blue-300">${agentName}</div>
                            <div class="text-xs text-gray-400">类型: ${this.getFunctionName(agentFunction)} | 工具: ${selectedTools.length}个</div>
                        </div>
                    </div>
                    <div class="text-sm text-gray-300">
                        🎉 恭喜！我是${agentName}，一个全新的${this.getFunctionName(agentFunction)}。
                        我已经配备了${selectedTools.length > 0 ? selectedTools.join('、') : '基础对话能力'}等强大功能。
                        
                        💡 我的当前能力指标：
                        • 准确率: ${this.agentPerformance.accuracy}%
                        • 处理速度: ${this.agentPerformance.speed}%
                        • 创造力: ${this.agentPerformance.creativity}%
                        • 可靠性: ${this.agentPerformance.reliability}%
                        
                        有什么可以帮助你的吗？我已经准备好为你服务了！✨
                    </div>
                </div>
            `;
            
            this.showNotification(`🎉 ${agentName} 构建成功！性能评分: ${this.calculateOverallScore()}`, 'success');
            this.achievements.add('first_agent_built');
            this.checkAchievements();
            
            // 显示高级概念
            setTimeout(() => {
                this.showAdvancedConcepts();
            }, 3000);
        }, 4000);
    }

    calculateOverallScore() {
        const scores = Object.values(this.agentPerformance);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        return Math.round(average);
    }

    showBuildingAnimation() {
        // 创建构建动画效果
        const buildingOverlay = document.createElement('div');
        buildingOverlay.id = 'building-overlay';
        buildingOverlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
        buildingOverlay.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 border border-blue-500/30">
                <div class="text-center">
                    <div class="text-4xl mb-4 animate-spin">🔧</div>
                    <h3 class="text-xl font-bold text-white mb-4">构建Agent中...</h3>
                    <div class="w-full bg-gray-700 rounded-full h-2 mb-4">
                        <div id="build-progress" class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <div id="build-status" class="text-sm text-gray-400">初始化中...</div>
                </div>
            </div>
        `;
        document.body.appendChild(buildingOverlay);

        // 动画进度条
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            document.getElementById('build-progress').style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    buildingOverlay.remove();
                }, 500);
            }
        }, 80);
    }

    getFunctionName(functionType) {
        const names = {
            qa: '问答助手',
            search: '搜索助手',
            calculator: '计算助手',
            creative: '创作助手'
        };
        return names[functionType] || '通用助手';
    }

    enableChat() {
        document.getElementById('chat-input').disabled = false;
        document.getElementById('send-message').disabled = false;
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        const chatArea = document.getElementById('agent-chat');
        
        // 添加用户消息
        const userMessage = document.createElement('div');
        userMessage.className = 'mb-3 p-3 bg-gray-700 rounded-lg ml-8';
        userMessage.innerHTML = `
            <div class="font-semibold text-green-300">👤 你</div>
            <div class="text-sm text-gray-300 mt-1">${message}</div>
        `;
        chatArea.appendChild(userMessage);

        // 清空输入
        input.value = '';

        // 模拟Agent思考
        const thinkingMessage = document.createElement('div');
        thinkingMessage.className = 'mb-3 p-3 bg-blue-500/20 rounded-lg mr-8';
        thinkingMessage.innerHTML = `
            <div class="font-semibold text-blue-300">🤖 Agent</div>
            <div class="text-sm text-gray-300 mt-1">正在思考中...</div>
        `;
        chatArea.appendChild(thinkingMessage);

        // 滚动到底部
        chatArea.scrollTop = chatArea.scrollHeight;

        // 模拟Agent回复
        setTimeout(() => {
            const response = this.generateAgentResponse(message);
            thinkingMessage.innerHTML = `
                <div class="font-semibold text-blue-300">🤖 Agent</div>
                <div class="text-sm text-gray-300 mt-1">${response}</div>
            `;
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 1500);
    }

    generateAgentResponse(message) {
        const responses = [
            `我理解你说的"${message}"。让我通过以下步骤来处理：\n\n🧠 感知阶段：分析你的输入内容和意图\n⚡ 推理阶段：基于知识库进行逻辑推理\n🛠️ 工具调用：选择最适合的工具来帮助你\n🔄 反馈优化：根据你的反应不断改进\n\n我的当前性能指标：准确率 ${this.agentPerformance.accuracy}% | 速度 ${this.agentPerformance.speed}%`,
            
            `收到你的消息："${message}"。我正在运用我的多层推理引擎来分析这个问题：\n\n📊 复杂度分析：中等\n🎯 置信度评估：${85 + Math.floor(Math.random() * 10)}%\n⚡ 预计处理时间：${100 + Math.floor(Math.random() * 200)}ms\n🔧 推荐工具：${this.getRandomTool()}\n\n正在为你生成最优解决方案...`,
            
            `基于你的输入"${message}"，我的感知模块已经完成了深度分析：\n\n🔍 语义理解：✓ 完成\n📝 意图识别：✓ ${Math.floor(Math.random() * 20 + 80)}%匹配\n🌐 上下文关联：✓ 已建立\n💡 知识检索：✓ 找到${Math.floor(Math.random() * 50 + 10)}个相关条目\n\n现在让我运用我的工具调用能力来为你提供精准的回答。`,
            
            `我已经通过多模态感知接收到你的消息。当前Agent状态报告：\n\n📈 系统负载：${Math.floor(Math.random() * 30 + 20)}%\n🔋 能量水平：${Math.floor(Math.random() * 20 + 80)}%\n🧠 记忆使用：${Math.floor(Math.random() * 40 + 30)}%\n⚡ 推理效率：${this.agentPerformance.speed}%\n\n正在调用${this.getRandomTool()}来处理你的请求...`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getRandomTool() {
        const tools = ['搜索引擎', '计算器', '代码分析器', '知识图谱', '翻译器', '图像识别器'];
        return tools[Math.floor(Math.random() * tools.length)];
    }

    showKnowledgeGraph() {
        document.getElementById('knowledge-graph-section').classList.remove('hidden');
        this.initializeKnowledgeGraphInteraction();
        this.showNotification('🧠 知识图谱已激活！点击节点查看详细信息', 'info');
    }

    initializeKnowledgeGraphInteraction() {
        // 为知识图谱节点添加交互事件
        document.querySelectorAll('.knowledge-node').forEach(node => {
            node.addEventListener('click', (e) => {
                const concept = e.target.dataset.concept;
                this.showConceptDetails(concept);
                this.animateKnowledgeConnections(concept);
            });
        });
    }

    showConceptDetails(concept) {
        const conceptDetails = {
            perception: {
                title: '🧠 感知模块详解',
                content: '负责接收和处理外部信息，包括文本、图像、音频等多模态输入的理解和编码。\n\n核心功能：\n• 文本分词和语义理解\n• 多模态信息融合\n• 上下文信息提取\n• 环境状态建模'
            },
            reasoning: {
                title: '⚡ 推理引擎详解', 
                content: '基于大语言模型的核心推理能力，处理复杂的逻辑推理、规划和决策制定。\n\n核心能力：\n• 逻辑推理和因果分析\n• 计划生成和任务分解\n• 知识检索和应用\n• 决策制定和优先级排序'
            },
            tools: {
                title: '🛠️ 工具调用详解',
                content: '管理和调用外部工具和API，实现Agent与外部系统的交互和功能扩展。\n\n工具类型：\n• 搜索引擎和知识库查询\n• 计算器和数据分析工具\n• 文件操作和代码执行\n• API调用和外部服务集成'
            },
            feedback: {
                title: '🔄 反馈循环详解',
                content: '通过评估执行结果和用户反馈，不断优化Agent的性能和响应质量。\n\n优化机制：\n• 执行结果评估和分析\n• 错误检测和修正策略\n• 性能指标监控和优化\n• 学习模式更新和调整'
            }
        };

        const detail = conceptDetails[concept];
        if (detail) {
            this.showDetailedNotification(detail.title, detail.content, 'blue');
        }
    }

    animateKnowledgeConnections(concept) {
        // 重置所有连接
        document.querySelectorAll('.knowledge-connection').forEach(conn => {
            conn.classList.remove('active');
        });

        // 激活相关连接
        const connections = {
            perception: ['conn-1-2', 'conn-3-1'],
            reasoning: ['conn-1-2', 'conn-2-4'],
            tools: ['conn-3-1', 'conn-4-3'],
            feedback: ['conn-2-4', 'conn-4-3']
        };

        const activeConnections = connections[concept];
        if (activeConnections) {
            activeConnections.forEach(connId => {
                const conn = document.getElementById(connId);
                if (conn) {
                    conn.classList.add('active');
                }
            });
        }
    }

    showMultiAgentDemo() {
        document.getElementById('multi-agent-section').classList.remove('hidden');
        this.startMultiAgentSimulation();
        this.showNotification('🤝 多Agent协作演示已启动！', 'success');
    }

    startMultiAgentSimulation() {
        // 模拟多Agent状态变化
        const agents = document.querySelectorAll('.agent-status');
        
        setInterval(() => {
            agents.forEach(agent => {
                const statuses = ['active', 'thinking', 'idle'];
                const currentStatus = Array.from(agent.classList).find(cls => statuses.includes(cls));
                const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                if (currentStatus !== newStatus) {
                    agent.classList.remove(currentStatus);
                    agent.classList.add(newStatus);
                    
                    const statusText = {
                        active: '活跃中',
                        thinking: '思考中', 
                        idle: '待命中'
                    };
                    agent.textContent = statusText[newStatus];
                }
            });
        }, 3000);
    }

    showAdvancedConcepts() {
        document.getElementById('advanced-concepts').classList.remove('hidden');
        this.showNotification('🎓 解锁高级概念！', 'success');
        
        // 显示完成界面
        setTimeout(() => {
            this.showConclusion();
        }, 5000);
    }

    showConclusion() {
        document.getElementById('conclusion-section').classList.remove('hidden');
        this.showNotification('🎉 恭喜完成所有学习内容！', 'success');
        
        // 滚动到结论
        document.getElementById('conclusion-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    shareAchievement() {
        const shareText = `我刚刚在Agent构建师游戏中完成了AI Agent的学习之旅！掌握了感知模块、推理引擎、工具调用和反馈循环等核心概念，还成功构建了自己的第一个Agent！🤖✨`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Agent构建师 - 学习成就',
                text: shareText,
                url: window.location.href
            });
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('成就内容已复制到剪贴板！', 'success');
            });
        }
    }

    updateProgress(percentage) {
        const progressBar = document.getElementById('main-progress');
        const progressText = document.getElementById('progress-text');
        
        progressBar.style.width = percentage + '%';
        progressText.textContent = Math.round(percentage) + '%';
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const colors = {
            info: 'rgba(59, 130, 246, 0.9)',
            success: 'rgba(16, 185, 129, 0.9)',
            error: 'rgba(239, 68, 68, 0.9)',
            warning: 'rgba(245, 158, 11, 0.9)'
        };
        
        notification.style.background = colors[type];
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    showDetailedNotification(title, content, color) {
        const notification = document.getElementById('notification');
        const colors = {
            blue: 'rgba(59, 130, 246, 0.9)',
            purple: 'rgba(168, 85, 247, 0.9)',
            green: 'rgba(16, 185, 129, 0.9)',
            orange: 'rgba(249, 115, 22, 0.9)'
        };
        
        notification.style.background = colors[color];
        notification.innerHTML = `
            <div class="font-bold mb-2">${title}</div>
            <div class="text-sm whitespace-pre-line">${content}</div>
        `;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 8000);
    }

    resetGame() {
        // 重置所有状态
        this.currentStep = 0;
        this.agentBuilt = false;
        this.completedModules.clear();
        
        // 重置UI
        document.getElementById('intro-section').style.display = 'block';
        document.getElementById('agent-pipeline').classList.add('hidden');
        document.getElementById('learning-modules').classList.add('hidden');
        document.getElementById('practice-section').classList.add('hidden');
        document.getElementById('advanced-concepts').classList.add('hidden');
        document.getElementById('conclusion-section').classList.add('hidden');
        
        // 重置表单
        document.getElementById('agent-name').value = '';
        document.getElementById('agent-function').value = 'qa';
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('chat-input').disabled = true;
        document.getElementById('send-message').disabled = true;
        document.getElementById('agent-chat').innerHTML = '<div class="text-gray-400 text-center">Agent构建完成后，你可以在这里与它对话测试</div>';
        
        // 重置进度
        this.updateProgress(0);
        
        // 重置步骤状态
        document.querySelectorAll('.step-indicator').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelectorAll('.connection-line').forEach(line => {
            line.classList.remove('active');
        });
        
        // 隐藏所有学习模块
        ['perception-module', 'reasoning-module', 'tools-module', 'feedback-module'].forEach(moduleId => {
            document.getElementById(moduleId).classList.add('hidden');
        });
        
        this.showNotification('游戏已重置，可以重新开始学习！', 'info');
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    new AgentBuilderGame();
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // ESC键重置游戏
            const game = window.agentGame;
            if (game) {
                game.resetGame();
            }
        }
    });
});

// 页面可见性API - 当页面重新获得焦点时刷新粒子效果
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // 页面重新获得焦点，可以在这里添加一些特效
        console.log('Agent构建师游戏重新获得焦点');
    }
});

// 窗口大小改变时的响应式处理
window.addEventListener('resize', () => {
    // 可以在这里添加响应式布局调整逻辑
    console.log('窗口大小已改变，调整布局');
});

// 保存游戏实例到全局变量，方便调试
window.agentGame = null;
document.addEventListener('DOMContentLoaded', () => {
    window.agentGame = new AgentBuilderGame();
}); 