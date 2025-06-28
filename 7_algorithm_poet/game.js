class AlgorithmPoet {
    constructor() {
        this.currentTheme = 'love';
        this.currentStyle = 'romantic';
        this.poems = [];
        this.currentPoem = { lines: [], title: '' };
        this.creativityDepth = 0;
        this.inspirationLevel = 100;
        this.collaborationLevel = 0;
        this.tutorialStep = 0;
        this.aiDemoActive = false;
        this.aiDemoStep = 0;
        this.aiDemoInterval = null;
        this.isCreating = false;
        
        this.setupEventListeners();
        this.setupTutorial();
        this.initializePoetryEngine();
        this.startInspirationParticles();
        this.updateThemeBackground();
    }

    setupEventListeners() {
        // 主要控制按钮
        document.getElementById('generateBtn').addEventListener('click', () => this.generatePoetry());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveCurrentPoem());
        document.getElementById('newPoemBtn').addEventListener('click', () => this.startNewPoem());
        document.getElementById('shareBtn').addEventListener('click', () => this.sharePoem());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportPoem());
        
        // 控制面板按钮
        document.getElementById('tutorialBtn').addEventListener('click', () => this.showTutorial());
        document.getElementById('aiDemoBtn').addEventListener('click', () => this.startAIDemo());
        document.getElementById('inspirationBtn').addEventListener('click', () => this.triggerInspiration());
        document.getElementById('randomBtn').addEventListener('click', () => this.randomizeSettings());
        
        // 主题和风格选择
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        
        // 风格按钮
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', () => this.changeStyle(btn.dataset.style));
        });
        
        // 用户输入
        document.getElementById('userInput').addEventListener('input', () => this.updateCollaboration());
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generatePoetry();
            }
        });
    }

    setupTutorial() {
        const tutorialSteps = [
            {
                title: "欢迎来到算法诗人",
                content: "在这里，你将与AI共同创作美丽的诗歌。选择主题、风格，输入你的诗句，AI将为你续写创作！",
                highlight: null
            },
            {
                title: "选择创作主题",
                content: "首先选择一个主题，比如爱情、自然、科技等。不同主题会影响AI的创作风格和词汇选择。",
                highlight: "themeSelect"
            },
            {
                title: "设定创作风格",
                content: "选择你喜欢的创作风格：浪漫、现代、古典或抽象。每种风格都有独特的表达方式。",
                highlight: null
            },
            {
                title: "开始创作诗句",
                content: "在左侧输入框中写下你的诗句，然后点击'✨ AI续写'按钮，AI将为你续写下一句。你们可以轮流创作！",
                highlight: "generateBtn"
            },
            {
                title: "享受创作之旅",
                content: "保存你喜欢的作品，分享给朋友，或者点击'🤖 AI演示'看AI自己创作。现在开始你的诗歌创作之旅吧！",
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
            <h3 class="text-xl font-bold text-pink-300 mb-4">${step.title}</h3>
            <p class="text-gray-200 leading-relaxed">${step.content}</p>
        `;
        
        indicator.textContent = `${this.tutorialStep + 1} / ${this.tutorialSteps.length}`;
        
        // 更新按钮状态
        document.getElementById('prevStep').style.opacity = this.tutorialStep === 0 ? '0.5' : '1';
        document.getElementById('nextStep').textContent = this.tutorialStep === this.tutorialSteps.length - 1 ? '完成' : '下一步';
        
        // 高亮相关元素
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

    initializePoetryEngine() {
        // 诗歌模板和词库
        this.poetryTemplates = {
            love: {
                romantic: [
                    "在{time}的{place}，我想起了你",
                    "你的{feature}如{metaphor}般美丽",
                    "爱情是{emotion}，是{action}",
                    "当{weather}的时候，我{feeling}着你"
                ],
                modern: [
                    "城市里的{place}，藏着我们的{memory}",
                    "手机屏幕上的{symbol}，诉说着{emotion}",
                    "在{number}点{number}分，我{action}了你",
                    "这个{adjective}的世界，因你而{change}"
                ]
            },
            nature: {
                classical: [
                    "{season}风{action}过{place}",
                    "{flower}开在{location}，{emotion}满{space}",
                    "山{height}水{depth}，{feeling}如{metaphor}",
                    "{weather}时节，{nature}更{adjective}"
                ],
                modern: [
                    "生态圈里的{creature}，{action}着{message}",
                    "绿色的{object}，诉说着{story}",
                    "在{place}的{time}，{nature}{action}",
                    "环保的{concept}，{feeling}着{future}"
                ]
            },
            technology: {
                modern: [
                    "算法的{process}，{action}着{data}",
                    "代码中的{symbol}，{meaning}着{concept}",
                    "在{device}的{screen}上，{display}着{information}",
                    "人工智能的{capability}，{change}着{world}"
                ],
                abstract: [
                    "数字的{pattern}，{flow}在{space}中",
                    "量子的{state}，{exist}于{dimension}",
                    "信息的{stream}，{connect}着{reality}",
                    "虚拟的{world}，{reflect}着{truth}"
                ]
            }
        };

        this.wordBank = {
            time: ['黄昏', '清晨', '深夜', '午后', '黎明', '傍晚'],
            place: ['花园', '海边', '山顶', '街角', '窗前', '桥上'],
            feature: ['眼眸', '笑容', '声音', '身影', '手指', '发丝'],
            metaphor: ['星辰', '月光', '春风', '花朵', '清泉', '彩虹'],
            emotion: ['温柔', '深情', '眷恋', '思念', '甜蜜', '浪漫'],
            action: ['吹拂', '流淌', '闪烁', '轻抚', '飞舞', '绽放'],
            feeling: ['思念', '想念', '怀念', '眷恋', '牵挂', '深爱'],
            weather: ['下雨', '飘雪', '起风', '放晴', '多云', '雾起'],
            season: ['春', '夏', '秋', '冬', '暮春', '初夏'],
            flower: ['桃花', '樱花', '荷花', '菊花', '梅花', '兰花'],
            location: ['枝头', '池塘', '山坡', '庭院', '路边', '田野'],
            space: ['天地', '人间', '心中', '眼前', '梦里', '记忆'],
            height: ['高', '峻', '巍峨', '雄伟', '险峻', '秀丽'],
            depth: ['深', '清', '澄澈', '幽深', '静谧', '悠远'],
            nature: ['鸟儿', '花朵', '树木', '溪水', '云朵', '星星'],
            adjective: ['美丽', '动人', '迷人', '可爱', '优雅', '纯净'],
            creature: ['蝴蝶', '蜜蜂', '小鸟', '鱼儿', '兔子', '鹿群'],
            message: ['生命', '希望', '自由', '和谐', '美好', '纯真'],
            object: ['叶子', '花瓣', '草地', '树枝', '石头', '河流'],
            story: ['传说', '故事', '秘密', '回忆', '梦想', '奇迹'],
            future: ['明天', '未来', '希望', '梦想', '可能', '奇迹'],
            concept: ['理念', '想法', '观念', '思想', '哲学', '智慧'],
            process: ['运算', '计算', '分析', '处理', '优化', '学习'],
            data: ['信息', '数据', '知识', '智慧', '真理', '秘密'],
            symbol: ['符号', '代码', '字符', '标记', '图标', '信号'],
            meaning: ['代表', '象征', '意味', '表达', '传达', '诠释'],
            device: ['屏幕', '手机', '电脑', '设备', '终端', '界面'],
            screen: ['显示器', '屏幕', '界面', '窗口', '画面', '视野'],
            display: ['显示', '展示', '呈现', '表现', '映射', '反映'],
            information: ['信息', '消息', '数据', '内容', '知识', '智慧'],
            capability: ['能力', '智慧', '思维', '学习', '创造', '理解'],
            change: ['改变', '变革', '转变', '影响', '塑造', '重构'],
            world: ['世界', '宇宙', '现实', '生活', '社会', '未来'],
            pattern: ['模式', '规律', '结构', '秩序', '逻辑', '设计'],
            flow: ['流动', '传播', '扩散', '穿越', '游走', '飞舞'],
            space: ['空间', '维度', '领域', '世界', '宇宙', '虚空'],
            state: ['状态', '形态', '存在', '本质', '特性', '属性'],
            exist: ['存在', '漂浮', '游荡', '徘徊', '闪烁', '跳跃'],
            dimension: ['维度', '空间', '层面', '境界', '世界', '领域'],
            stream: ['流', '河', '溪', '潮', '波', '浪'],
            connect: ['连接', '联系', '沟通', '桥接', '融合', '交织'],
            reality: ['现实', '真实', '存在', '本质', '真理', '世界'],
            reflect: ['反映', '映射', '折射', '体现', '表达', '诠释'],
            truth: ['真理', '真相', '本质', '智慧', '答案', '秘密'],
            memory: ['回忆', '记忆', '往事', '过去', '痕迹', '印象'],
            number: ['三', '五', '七', '九', '十一', '十二']
        };
    }

    changeTheme(theme) {
        this.currentTheme = theme;
        this.updateThemeBackground();
        this.triggerInspiration();
    }

    changeStyle(style) {
        // 移除所有风格按钮的active类
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 添加active类到当前选中的按钮
        document.querySelector(`[data-style="${style}"]`).classList.add('active');
        
        this.currentStyle = style;
        this.createWordFlow('风格已切换');
    }

    updateThemeBackground() {
        // 移除所有主题背景类
        document.body.classList.remove(...Object.keys(this.wordBank).map(key => `theme-${key}`));
        
        // 添加当前主题背景类
        document.body.classList.add(`theme-${this.currentTheme}`);
    }

    async generatePoetry() {
        if (this.isCreating) return;
        
        const userInput = document.getElementById('userInput').value.trim();
        if (!userInput) {
            this.showMessage('请先输入你的诗句');
            return;
        }

        this.isCreating = true;
        this.showCreatingIndicator();
        
        // 添加用户诗句
        this.addPoemLine(userInput, 'user');
        
        // 清空输入框
        document.getElementById('userInput').value = '';
        
        // 生成AI续写
        setTimeout(() => {
            const aiLine = this.generateAILine(userInput);
            this.addPoemLine(aiLine, 'ai');
            this.isCreating = false;
            this.hideCreatingIndicator();
            this.updateStats();
            this.updateCollaboration();
        }, 1500);
    }

    generateAILine(userInput) {
        const templates = this.poetryTemplates[this.currentTheme]?.[this.currentStyle] || 
                         this.poetryTemplates.love.romantic;
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // 替换模板中的占位符
        let aiLine = template;
        const placeholders = aiLine.match(/\{(\w+)\}/g);
        
        if (placeholders) {
            placeholders.forEach(placeholder => {
                const key = placeholder.replace(/[{}]/g, '');
                const words = this.wordBank[key] || ['美好'];
                const word = words[Math.floor(Math.random() * words.length)];
                aiLine = aiLine.replace(placeholder, word);
            });
        }
        
        return aiLine;
    }

    addPoemLine(line, type) {
        const poemDisplay = document.getElementById('currentPoem');
        const lineElement = document.createElement('div');
        lineElement.className = `poem-line ${type}-line`;
        lineElement.textContent = line;
        
        // 如果是第一行，清除提示文字
        if (this.currentPoem.lines.length === 0) {
            poemDisplay.innerHTML = '';
        }
        
        poemDisplay.appendChild(lineElement);
        this.currentPoem.lines.push({ text: line, type: type });
        
        // 滚动到底部
        poemDisplay.scrollTop = poemDisplay.scrollHeight;
        
        // 创建文字流动效果
        this.createWordFlow(line);
    }

    showCreatingIndicator() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.innerHTML = '<span class="creating-indicator"></span>AI创作中...';
        generateBtn.disabled = true;
    }

    hideCreatingIndicator() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.innerHTML = '✨ AI续写';
        generateBtn.disabled = false;
    }

    saveCurrentPoem() {
        if (this.currentPoem.lines.length === 0) {
            this.showMessage('没有可保存的诗歌');
            return;
        }

        // 生成诗歌标题
        const title = this.generatePoemTitle();
        this.currentPoem.title = title;
        this.currentPoem.theme = this.currentTheme;
        this.currentPoem.style = this.currentStyle;
        this.currentPoem.createdAt = new Date();
        
        // 保存到历史
        this.poems.push({ ...this.currentPoem });
        this.updatePoemHistory();
        this.updateStats();
        
        this.showMessage('诗歌已保存');
        this.triggerInspiration();
    }

    generatePoemTitle() {
        const themes = {
            love: ['爱的', '情的', '心的', '梦的'],
            nature: ['春的', '花的', '山的', '水的'],
            technology: ['数字的', '未来的', '智能的', '虚拟的'],
            dreams: ['梦想的', '希望的', '理想的', '憧憬的'],
            time: ['时光的', '岁月的', '瞬间的', '永恒的'],
            space: ['星空的', '宇宙的', '银河的', '无限的'],
            emotion: ['心灵的', '情感的', '内心的', '深情的'],
            freedom: ['自由的', '飞翔的', '解放的', '无束的']
        };
        
        const suffixes = ['吟唱', '诗篇', '咏叹', '颂歌', '絮语', '心声', '印象', '随想'];
        
        const themeWords = themes[this.currentTheme] || themes.love;
        const prefix = themeWords[Math.floor(Math.random() * themeWords.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return prefix + suffix;
    }

    startNewPoem() {
        this.currentPoem = { lines: [], title: '' };
        document.getElementById('currentPoem').innerHTML = `
            <div class="text-center text-gray-400 mt-8">
                开始创作你的新诗吧！
            </div>
        `;
        document.getElementById('userInput').value = '';
        this.updateStats();
    }

    sharePoem() {
        if (this.currentPoem.lines.length === 0) {
            this.showMessage('没有可分享的诗歌');
            return;
        }

        const poemText = this.currentPoem.lines.map(line => line.text).join('\n');
        const title = this.currentPoem.title || '无题';
        const shareText = `《${title}》\n\n${poemText}\n\n—— 与AI共同创作于算法诗人`;
        
        if (navigator.share) {
            navigator.share({
                title: title,
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('诗歌已复制到剪贴板');
            });
        }
    }

    exportPoem() {
        if (this.currentPoem.lines.length === 0) {
            this.showMessage('没有可导出的诗歌');
            return;
        }

        const poemText = this.currentPoem.lines.map(line => line.text).join('\n');
        const title = this.currentPoem.title || '无题';
        const fullText = `《${title}》\n\n${poemText}\n\n—— 创作于${new Date().toLocaleDateString()}`;
        
        const blob = new Blob([fullText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showMessage('诗歌已导出');
    }

    updatePoemHistory() {
        const historyContainer = document.getElementById('poemHistory');
        historyContainer.innerHTML = '';
        
        this.poems.slice(-5).reverse().forEach((poem, index) => {
            const item = document.createElement('div');
            item.className = 'poem-history-item';
            item.innerHTML = `
                <div class="title">${poem.title}</div>
                <div class="preview">${poem.lines[0]?.text || ''}</div>
            `;
            
            item.addEventListener('click', () => this.loadPoem(poem));
            historyContainer.appendChild(item);
        });
    }

    loadPoem(poem) {
        this.currentPoem = { ...poem };
        const poemDisplay = document.getElementById('currentPoem');
        poemDisplay.innerHTML = '';
        
        poem.lines.forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.className = `poem-line ${line.type}-line`;
            lineElement.textContent = line.text;
            poemDisplay.appendChild(lineElement);
        });
    }

    triggerInspiration() {
        // 创建灵感爆发效果
        const burst = document.createElement('div');
        burst.className = 'inspiration-burst';
        burst.style.left = Math.random() * window.innerWidth + 'px';
        burst.style.top = Math.random() * window.innerHeight + 'px';
        document.getElementById('inspirationParticles').appendChild(burst);
        
        setTimeout(() => burst.remove(), 1000);
        
        // 增加灵感值
        this.inspirationLevel = Math.min(100, this.inspirationLevel + 10);
        this.updateStats();
        
        // 创建灵感粒子
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.createInspirationParticle(), i * 200);
        }
    }

    randomizeSettings() {
        // 随机选择主题
        const themes = ['love', 'nature', 'technology', 'dreams', 'time', 'space', 'emotion', 'freedom'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        document.getElementById('themeSelect').value = randomTheme;
        this.changeTheme(randomTheme);
        
        // 随机选择风格
        const styles = ['romantic', 'modern', 'classical', 'abstract'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        this.changeStyle(randomStyle);
        
        this.showMessage('已随机设置主题和风格');
        this.triggerInspiration();
    }

    updateCollaboration() {
        const userInput = document.getElementById('userInput').value;
        const inputLength = userInput.length;
        const poemLength = this.currentPoem.lines.reduce((sum, line) => sum + line.text.length, 0);
        
        if (poemLength > 0) {
            this.collaborationLevel = Math.min(100, (inputLength + poemLength) / (poemLength + inputLength + 1) * 100);
        } else {
            this.collaborationLevel = inputLength > 0 ? 50 : 0;
        }
        
        this.updateStats();
    }

    updateStats() {
        document.getElementById('creativityDepth').textContent = this.creativityDepth;
        document.getElementById('poemCount').textContent = this.poems.length;
        document.getElementById('inspirationLevel').textContent = Math.floor(this.inspirationLevel) + '%';
        document.getElementById('collaborationLevel').textContent = Math.floor(this.collaborationLevel) + '%';
        
        // 更新创作深度
        this.creativityDepth = this.currentPoem.lines.length;
    }

    startInspirationParticles() {
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createInspirationParticle();
            }
        }, 2000);
    }

    createInspirationParticle() {
        const particle = document.createElement('div');
        particle.className = 'inspiration-particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        
        document.getElementById('inspirationParticles').appendChild(particle);
        
        setTimeout(() => particle.remove(), 3000);
    }

    createWordFlow(text) {
        const words = text.split('').slice(0, 5); // 取前5个字符
        words.forEach((word, index) => {
            setTimeout(() => {
                const wordElement = document.createElement('div');
                wordElement.className = 'word-flow';
                wordElement.textContent = word;
                wordElement.style.left = (Math.random() * window.innerWidth) + 'px';
                wordElement.style.top = (Math.random() * window.innerHeight) + 'px';
                
                document.getElementById('inspirationParticles').appendChild(wordElement);
                
                setTimeout(() => wordElement.remove(), 3000);
            }, index * 100);
        });
    }

    showMessage(message) {
        // 创建临时消息显示
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.remove(), 2000);
    }

    startAIDemo() {
        if (this.aiDemoActive) {
            this.stopAIDemo();
            return;
        }

        this.aiDemoActive = true;
        this.aiDemoStep = 0;
        document.getElementById('aiDemoBtn').textContent = '⏹️ 停止演示';
        
        // 开始新诗
        this.startNewPoem();
        
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
            () => this.aiDemoChangeTheme(),
            () => this.aiDemoChangeStyle(),
            () => this.aiDemoStartPoem(),
            () => this.aiDemoAddLine(),
            () => this.aiDemoAddLine(),
            () => this.aiDemoAddLine(),
            () => this.aiDemoSavePoem(),
            () => this.aiDemoNewPoem()
        ];

        this.aiDemoInterval = setInterval(() => {
            if (!this.aiDemoActive) return;
            
            if (this.aiDemoStep < demoSteps.length) {
                demoSteps[this.aiDemoStep]();
                this.aiDemoStep++;
            } else {
                // 重新开始演示
                this.aiDemoStep = 0;
            }
        }, 3000);
    }

    aiDemoChangeTheme() {
        const themes = ['love', 'nature', 'technology', 'dreams', 'space'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        document.getElementById('themeSelect').value = randomTheme;
        this.changeTheme(randomTheme);
    }

    aiDemoChangeStyle() {
        const styles = ['romantic', 'modern', 'classical', 'abstract'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        this.changeStyle(randomStyle);
    }

    aiDemoStartPoem() {
        const starters = [
            '在这个美好的夜晚',
            '当星星开始闪烁',
            '微风轻抚着大地',
            '时光静静流淌',
            '梦想在心中绽放'
        ];
        
        const starter = starters[Math.floor(Math.random() * starters.length)];
        document.getElementById('userInput').value = starter;
        this.generatePoetry();
    }

    aiDemoAddLine() {
        if (this.isCreating) return;
        
        const continuations = [
            '我看见了希望的光芒',
            '心中涌起无限的感动',
            '世界变得如此美丽',
            '爱意在空气中飞舞',
            '生命展现着它的奇迹'
        ];
        
        const continuation = continuations[Math.floor(Math.random() * continuations.length)];
        document.getElementById('userInput').value = continuation;
        
        setTimeout(() => {
            if (this.aiDemoActive) {
                this.generatePoetry();
            }
        }, 1000);
    }

    aiDemoSavePoem() {
        this.saveCurrentPoem();
    }

    aiDemoNewPoem() {
        this.startNewPoem();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new AlgorithmPoet();
}); 