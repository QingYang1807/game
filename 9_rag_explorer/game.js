class RAGExplorer {
    constructor() {
        this.knowledgeBase = [];
        this.currentStep = 0;
        this.tutorialStep = 0;
        this.queryVector = null;
        this.searchResults = [];
        this.isProcessing = false;
        this.currentScenario = null;
        this.currentQuery = '';
        this.gameScore = 0;
        this.scenarios = {
            'ai_basics': {
                name: 'AI基础问答',
                questions: [
                    '什么是人工智能？',
                    '机器学习有哪些分类？',
                    '深度学习的特点是什么？'
                ],
                description: '探索AI基础概念'
            },
            'ml_comparison': {
                name: '技术对比',
                questions: [
                    '监督学习和无监督学习的区别',
                    'CNN和RNN的应用场景',
                    '计算机视觉和自然语言处理的差异'
                ],
                description: '对比不同AI技术'
            },
            'code_help': {
                name: '编程助手',
                questions: [
                    '如何实现一个简单的神经网络？',
                    'RAG系统的核心组件有哪些？',
                    '向量数据库的工作原理'
                ],
                description: '编程相关问题解答'
            }
        };
        
        this.tutorialSteps = [
            {
                title: "欢迎来到RAG探索者！",
                content: "RAG（检索增强生成）是一种结合了信息检索和文本生成的AI技术。它能够从大量文档中检索相关信息，然后基于这些信息生成准确的回答。"
            },
            {
                title: "第一步：查询向量化",
                content: "当用户输入问题时，系统首先将文本转换为数学向量。这个过程使用了词嵌入技术，将语义相似的词汇映射到相似的向量空间位置。"
            },
            {
                title: "第二步：相似度检索",
                content: "系统使用查询向量与知识库中所有文档的向量进行相似度计算（通常使用余弦相似度）。相似度越高，说明文档与查询越相关。"
            },
            {
                title: "第三步：上下文构建",
                content: "从检索结果中选择最相关的几个文档片段，组装成上下文。这个过程需要平衡信息的相关性和多样性。"
            },
            {
                title: "第四步：AI生成回答",
                content: "将原始查询和检索到的上下文一起输入到大语言模型中，生成最终的回答。模型会综合考虑查询意图和上下文信息。"
            }
        ];

        this.initializeKnowledgeBase();
        this.createAnimatedBackground();
        this.setupEventListeners();
    }

    initializeKnowledgeBase() {
        const documents = [
            {
                id: 1,
                title: "人工智能基础",
                content: "人工智能是计算机科学的一个分支，旨在创造能够执行通常需要人类智能的任务的机器。它包括机器学习、深度学习、自然语言处理等多个子领域。",
                category: "AI基础",
                vector: this.generateVector("人工智能 机器学习 深度学习 自然语言处理 计算机科学"),
                embedding: [0.8, 0.6, 0.9, 0.7, 0.5]
            },
            {
                id: 2,
                title: "机器学习原理",
                content: "机器学习是人工智能的核心技术，通过算法让计算机从数据中学习模式，无需明确编程。主要包括监督学习、无监督学习和强化学习三大类。",
                category: "机器学习",
                vector: this.generateVector("机器学习 算法 数据 模式 监督学习 无监督学习 强化学习"),
                embedding: [0.9, 0.8, 0.7, 0.6, 0.8]
            },
            {
                id: 3,
                title: "深度学习网络",
                content: "深度学习是机器学习的子集，使用多层神经网络来学习数据的复杂模式。卷积神经网络（CNN）适用于图像处理，循环神经网络（RNN）适用于序列数据。",
                category: "深度学习",
                vector: this.generateVector("深度学习 神经网络 卷积神经网络 循环神经网络 图像处理 序列数据"),
                embedding: [0.7, 0.9, 0.8, 0.5, 0.6]
            },
            {
                id: 4,
                title: "自然语言处理",
                content: "自然语言处理（NLP）是AI的重要分支，专注于让计算机理解和生成人类语言。包括文本分析、情感分析、机器翻译、问答系统等应用。",
                category: "NLP",
                vector: this.generateVector("自然语言处理 文本分析 情感分析 机器翻译 问答系统 语言理解"),
                embedding: [0.6, 0.7, 0.9, 0.8, 0.7]
            },
            {
                id: 5,
                title: "计算机视觉",
                content: "计算机视觉使计算机能够从数字图像或视频中获取有意义的信息。应用包括图像识别、物体检测、人脸识别、医学影像分析等。",
                category: "计算机视觉",
                vector: this.generateVector("计算机视觉 图像识别 物体检测 人脸识别 医学影像 数字图像"),
                embedding: [0.5, 0.6, 0.8, 0.9, 0.7]
            },
            {
                id: 6,
                title: "RAG技术详解",
                content: "检索增强生成（RAG）结合了信息检索和文本生成，通过从外部知识库检索相关信息来增强语言模型的回答质量。它解决了大模型知识更新滞后的问题。RAG系统包含文档索引、向量检索、上下文组装和答案生成四个核心组件。",
                category: "RAG技术",
                vector: this.generateVector("检索增强生成 RAG 信息检索 文本生成 知识库 语言模型 向量检索 上下文组装"),
                embedding: [0.8, 0.9, 0.6, 0.7, 0.8]
            },
            {
                id: 7,
                title: "向量数据库原理",
                content: "向量数据库是专门存储和检索向量数据的数据库系统。它使用向量索引技术，如LSH、HNSW等算法实现高效的相似度搜索。在RAG系统中，向量数据库负责存储文档的向量表示并快速检索相关内容。",
                category: "RAG技术",
                vector: this.generateVector("向量数据库 向量索引 相似度搜索 LSH HNSW RAG 检索"),
                embedding: [0.7, 0.8, 0.9, 0.6, 0.7]
            },
            {
                id: 8,
                title: "Transformer架构",
                content: "Transformer是基于注意力机制的神经网络架构，由编码器和解码器组成。它使用自注意力机制处理序列数据，在自然语言处理任务中表现优异。GPT、BERT等模型都基于Transformer架构。",
                category: "深度学习",
                vector: this.generateVector("Transformer 注意力机制 编码器 解码器 自注意力 GPT BERT"),
                embedding: [0.6, 0.9, 0.8, 0.7, 0.6]
            },
            {
                id: 9,
                title: "监督学习vs无监督学习",
                content: "监督学习使用标记数据训练模型，目标是学习输入和输出之间的映射关系，如分类和回归。无监督学习处理无标记数据，发现数据中的隐藏模式，如聚类和降维。强化学习通过与环境交互学习最优策略。",
                category: "机器学习",
                vector: this.generateVector("监督学习 无监督学习 强化学习 分类 回归 聚类 降维 标记数据"),
                embedding: [0.8, 0.7, 0.6, 0.9, 0.7]
            }
        ];

        this.knowledgeBase = documents;
        this.renderKnowledgeBase();
    }

    generateVector(text) {
        // 改进的向量化过程，基于词频和语义特征
        const words = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, '').split(/\s+/);
        const wordCount = {};
        const keyWords = ['人工智能', '机器学习', '深度学习', '神经网络', '算法', '数据', '模型', '训练', 'AI', 'RAG', '检索', '生成', '向量', '相似度'];
        
        // 计算词频
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        const vector = [];
        // 基于关键词生成向量特征
        keyWords.forEach(keyword => {
            let score = 0;
            words.forEach(word => {
                if (word.includes(keyword) || keyword.includes(word)) {
                    score += wordCount[word] || 0;
                }
            });
            vector.push(score / words.length + Math.random() * 0.1);
        });
        
        // 补充到固定维度
        while (vector.length < 20) {
            vector.push(Math.random() * 0.3);
        }
        
        return vector.slice(0, 20);
    }

    calculateSimilarity(vector1, vector2) {
        // 改进的余弦相似度计算，加入权重调整
        if (!vector1 || !vector2) return 0;
        
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        const weights = [2, 2, 2, 1.5, 1.5, 1.2, 1.2, 1, 1, 1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.5, 0.5, 0.5, 0.5, 0.5]; // 关键词权重
        
        for (let i = 0; i < Math.min(vector1.length, vector2.length, weights.length); i++) {
            const weight = weights[i] || 1;
            const v1 = vector1[i] * weight;
            const v2 = vector2[i] * weight;
            dotProduct += v1 * v2;
            norm1 += v1 * v1;
            norm2 += v2 * v2;
        }
        
        const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
        return Math.max(0, Math.min(1, similarity)); // 确保在0-1范围内
    }

    renderKnowledgeBase() {
        const container = document.getElementById('knowledgeBase');
        container.innerHTML = '';

        this.knowledgeBase.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-card bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300';
            docElement.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-white font-medium text-sm">${doc.title}</h4>
                    <span class="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">${doc.category}</span>
                </div>
                <p class="text-gray-300 text-xs mb-3 line-clamp-3">${doc.content}</p>
                <div class="flex justify-between items-center">
                    <div class="text-xs text-gray-400">向量维度: ${doc.vector.length}</div>
                    <div class="w-16 h-2 bg-white/20 rounded">
                        <div class="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded" style="width: ${Math.random() * 100}%"></div>
                    </div>
                </div>
            `;
            container.appendChild(docElement);
        });
    }

    createAnimatedBackground() {
        const background = document.querySelector('.animated-bg');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.width = Math.random() * 20 + 10 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            background.appendChild(particle);
        }
    }

    setupEventListeners() {
        // 添加键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTutorial();
                this.closeDocumentUploader();
            }
        });
    }

    // 游戏场景相关方法
    startScenario(scenarioType) {
        if (scenarioType === 'custom') {
            this.showCustomQueryInput();
            return;
        }
        
        this.currentScenario = this.scenarios[scenarioType];
        if (!this.currentScenario) return;
        
        this.renderScenarioQuestions();
        this.resetProgress();
        this.gameScore = 0;
        this.updateGameStats();
    }
    
    showCustomQueryInput() {
        const container = document.getElementById('currentScenario');
        container.innerHTML = `
            <div class="space-y-4">
                <h4 class="text-white font-bold">✨ 自由探索模式</h4>
                <textarea 
                    id="customQuery"
                    class="w-full p-4 rounded-lg bg-white/90 text-gray-800 resize-none"
                    rows="3"
                    placeholder="输入您的问题，体验RAG检索过程..."
                ></textarea>
                <button 
                    onclick="processCustomQuery()"
                    class="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-300"
                >
                    🚀 开始RAG处理
                </button>
            </div>
        `;
        document.getElementById('scenarioQuestions').classList.add('hidden');
    }
    
    renderScenarioQuestions() {
        const container = document.getElementById('currentScenario');
        const questionsContainer = document.getElementById('scenarioQuestions');
        
        container.innerHTML = `
            <div class="text-center">
                <h4 class="text-white font-bold text-lg mb-2">${this.currentScenario.name}</h4>
                <p class="text-gray-300 text-sm mb-4">${this.currentScenario.description}</p>
                <div class="bg-blue-500/20 rounded-lg p-3">
                    <div class="text-blue-300 text-sm">游戏得分: <span id="gameScore">${this.gameScore}</span></div>
                </div>
            </div>
        `;
        
        questionsContainer.innerHTML = '';
        this.currentScenario.questions.forEach((question, index) => {
            const questionElement = document.createElement('button');
            questionElement.className = 'w-full p-4 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-all duration-300 text-white';
            questionElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="text-sm">${question}</span>
                    <span class="text-xs bg-purple-500/30 px-2 py-1 rounded">点击查询</span>
                </div>
            `;
            questionElement.onclick = () => this.processRAGQuery(question);
            questionsContainer.appendChild(questionElement);
        });
        
        questionsContainer.classList.remove('hidden');
    }
    
    updateGameStats() {
        const scoreElement = document.getElementById('gameScore');
        if (scoreElement) {
            scoreElement.textContent = this.gameScore;
        }
    }

    async processRAGQuery(query = null) {
        if (!query) {
            const customQueryElement = document.getElementById('customQuery');
            if (customQueryElement) {
                query = customQueryElement.value.trim();
            }
        }
        if (!query || this.isProcessing) return;

        // 保存当前查询以供后续步骤使用
        this.currentQuery = query;
        this.isProcessing = true;
        this.resetProgress();
        
        try {
            // 第一步：查询向量化
            await this.stepQueryVectorization(query);
            await this.sleep(1000);

            // 第二步：相似度检索
            await this.stepSimilaritySearch();
            await this.sleep(1000);

            // 第三步：上下文构建
            await this.stepContextBuilding();
            await this.sleep(1000);

            // 第四步：AI生成回答
            await this.stepGenerateAnswer();
            
        } catch (error) {
            console.error('RAG处理错误:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    async stepQueryVectorization(query) {
        this.updateProgress(25, '正在进行查询向量化...');
        this.activateStep(1);

        // 模拟向量化过程
        this.queryVector = this.generateVector(query);
        
        const step1Details = document.getElementById('step1Details');
        step1Details.innerHTML = `
            <div class="text-xs space-y-1">
                <div>✅ 查询文本: "${query}"</div>
                <div>✅ 分词结果: [${query.split(' ').join('], [')}]</div>
                <div>✅ 向量维度: ${this.queryVector.length}</div>
                <div>✅ 向量示例: [${this.queryVector.slice(0, 3).map(v => v.toFixed(3)).join(', ')}...]</div>
            </div>
        `;
    }

    async stepSimilaritySearch() {
        this.updateProgress(50, '正在检索相关文档...');
        this.activateStep(2);

        // 计算相似度并排序
        const results = this.knowledgeBase.map(doc => ({
            ...doc,
            similarity: this.calculateSimilarity(this.queryVector, doc.vector)
        })).sort((a, b) => b.similarity - a.similarity);

        this.searchResults = results.slice(0, 3); // 取前3个最相关的

        const step2Details = document.getElementById('step2Details');
        step2Details.innerHTML = `
            <div class="text-xs space-y-1">
                <div>✅ 检索文档数: ${this.knowledgeBase.length}</div>
                <div>✅ 相似度算法: 余弦相似度</div>
                <div>✅ 最高相似度: ${(this.searchResults[0]?.similarity * 100).toFixed(1)}%</div>
                <div>✅ 返回结果: Top ${this.searchResults.length}</div>
            </div>
        `;

        // 渲染搜索结果
        this.renderSearchResults();
    }

    async stepContextBuilding() {
        this.updateProgress(75, '正在构建上下文...');
        this.activateStep(3);

        const contextLength = this.searchResults.reduce((acc, result) => acc + result.content.length, 0);
        
        const step3Details = document.getElementById('step3Details');
        step3Details.innerHTML = `
            <div class="text-xs space-y-1">
                <div>✅ 上下文文档: ${this.searchResults.length}篇</div>
                <div>✅ 总字符数: ${contextLength}</div>
                <div>✅ 平均相似度: ${(this.searchResults.reduce((acc, r) => acc + r.similarity, 0) / this.searchResults.length * 100).toFixed(1)}%</div>
                <div>✅ 上下文构建: 完成</div>
            </div>
        `;
    }

    async stepGenerateAnswer() {
        this.updateProgress(100, 'RAG流程完成！');
        this.activateStep(4);

        // 获取当前查询文本
        let query = '';
        const customQueryElement = document.getElementById('customQuery');
        if (customQueryElement) {
            query = customQueryElement.value.trim();
        }
        // 如果没有自定义查询，使用当前处理的查询
        if (!query && this.currentQuery) {
            query = this.currentQuery;
        }
        
        const startTime = Date.now();

        // 模拟AI生成过程
        const answer = this.generateResponse(query, this.searchResults);
        const responseTime = Date.now() - startTime;

        const step4Details = document.getElementById('step4Details');
        step4Details.innerHTML = `
            <div class="text-xs space-y-1">
                <div>✅ 模型: GPT-Enhanced-RAG</div>
                <div>✅ 上下文令牌: ~${Math.floor(this.searchResults.reduce((acc, r) => acc + r.content.length, 0) / 4)}</div>
                <div>✅ 生成策略: 检索增强</div>
                <div>✅ 质量评分: ${(Math.random() * 20 + 80).toFixed(1)}/100</div>
            </div>
        `;

        // 渲染AI回答
        this.renderAIAnswer(answer, responseTime);
        
        // 增加游戏分数
        const qualityScore = Math.round(this.searchResults.reduce((acc, r) => acc + r.similarity, 0) / this.searchResults.length * 100);
        const bonusPoints = Math.max(1, Math.floor(qualityScore / 10));
        this.gameScore += bonusPoints;
        this.updateGameStats();
        
        if (qualityScore > 80) {
            this.showMessage(`优秀的检索结果！获得${bonusPoints}分奖励`, 'success');
        } else if (qualityScore > 60) {
            this.showMessage(`不错的检索结果！获得${bonusPoints}分奖励`, 'info');
        }
    }

    generateResponse(query, context) {
        // 确保query存在
        if (!query || query.trim() === '') {
            return "抱歉，没有检测到有效的查询内容。请重新输入您的问题。";
        }
        
        // 基于查询和上下文生成回答的智能模拟
        const queryLower = query.toLowerCase();
        
        // RAG相关问题
        if (queryLower.includes('rag') || queryLower.includes('检索增强') || queryLower.includes('retrieval')) {
            return `基于检索到的文档信息，RAG（检索增强生成）是一种革命性的AI技术。它巧妙地结合了信息检索和文本生成两大核心能力：首先从外部知识库中检索与查询相关的文档片段，然后将这些上下文信息输入到大语言模型中生成准确、时效性强的回答。这种架构有效解决了传统语言模型知识更新滞后、容易产生幻觉等问题，特别适用于问答系统、智能客服、知识管理等应用场景。`;
        }
        
        // 人工智能基础
        if (queryLower.includes('人工智能') || queryLower.includes('ai') || queryLower.includes('什么是')) {
            return `根据知识库检索结果，人工智能是计算机科学的重要分支，致力于创造能够模拟人类智能行为的机器系统。它涵盖了机器学习、深度学习、自然语言处理、计算机视觉等多个子领域。现代AI系统通过算法让计算机从大量数据中学习模式和规律，从而在图像识别、语音理解、决策制定等任务中表现出类似甚至超越人类的能力。`;
        }
        
        // 机器学习相关
        if (queryLower.includes('机器学习') || queryLower.includes('监督') || queryLower.includes('无监督') || queryLower.includes('分类')) {
            return `基于检索的相关文档，机器学习是AI的核心驱动技术。主要分为三大类型：监督学习使用带标签的训练数据学习输入输出映射关系，适用于分类和回归任务；无监督学习从无标签数据中发现隐藏模式，常用于聚类和降维；强化学习通过与环境交互获得反馈来学习最优策略。每种方法都有其独特的应用场景和算法实现。`;
        }
        
        // 深度学习和神经网络
        if (queryLower.includes('深度学习') || queryLower.includes('神经网络') || queryLower.includes('cnn') || queryLower.includes('rnn') || queryLower.includes('transformer')) {
            return `根据检索到的技术文档，深度学习是机器学习的高级形式，使用多层神经网络学习数据的复杂表示。主要架构包括：卷积神经网络(CNN)擅长处理图像数据，循环神经网络(RNN)适合序列数据处理，而Transformer架构通过注意力机制革新了自然语言处理领域。这些技术在计算机视觉、语音识别、机器翻译等领域取得了突破性进展。`;
        }
        
        // 计算机视觉
        if (queryLower.includes('计算机视觉') || queryLower.includes('图像') || queryLower.includes('视觉') || queryLower.includes('识别')) {
            return `基于知识库信息，计算机视觉是让机器"看懂"世界的技术。它使计算机能够从数字图像和视频中提取、分析和理解有用信息。主要应用包括图像分类、物体检测、人脸识别、医学影像分析、自动驾驶等。现代计算机视觉大量采用深度学习技术，特别是卷积神经网络，在准确性和效率方面都有显著提升。`;
        }
        
        // 自然语言处理
        if (queryLower.includes('自然语言') || queryLower.includes('nlp') || queryLower.includes('文本') || queryLower.includes('语言')) {
            return `根据相关文档检索，自然语言处理(NLP)专注于让计算机理解、处理和生成人类语言。核心任务包括文本分析、情感分析、机器翻译、问答系统、文本摘要等。现代NLP大量采用Transformer架构和预训练语言模型，如BERT、GPT系列，这些技术在理解语言语义和生成流畅文本方面表现出色。`;
        }
        
        // 向量数据库
        if (queryLower.includes('向量') || queryLower.includes('数据库') || queryLower.includes('检索') || queryLower.includes('相似度')) {
            return `基于检索结果，向量数据库是专门存储和检索高维向量数据的数据库系统。它使用先进的索引技术如LSH(局部敏感哈希)、HNSW(分层导航小世界)等算法实现高效的相似度搜索。在RAG系统中，向量数据库负责存储文档的向量表示，并根据查询向量快速检索最相关的文档片段，是实现语义搜索的关键技术组件。`;
        }
        
        // 编程实现相关
        if (queryLower.includes('实现') || queryLower.includes('代码') || queryLower.includes('如何') || queryLower.includes('编程')) {
            return `根据技术文档，实现相关AI系统需要考虑多个技术层面：数据预处理、模型架构设计、训练策略、评估指标等。以RAG系统为例，核心组件包括文档预处理模块、向量化编码器、向量数据库、检索器和生成器。实现时需要选择合适的嵌入模型、相似度计算方法和生成模型，并注意系统的可扩展性和响应速度。`;
        }
        
        // 技术对比
        if (queryLower.includes('区别') || queryLower.includes('对比') || queryLower.includes('差异') || queryLower.includes('vs')) {
            return `基于检索的对比分析，不同AI技术各有特点和适用场景。例如监督学习vs无监督学习：前者需要标记数据但准确性高，后者无需标签但解释性较差。CNN vs RNN：CNN擅长空间特征提取适合图像，RNN善于时序建模适合文本。选择技术时需要根据具体问题、数据特点和性能要求进行权衡。`;
        }
        
        // 基于上下文的通用回答
        if (context && context.length > 0) {
            const topResult = context[0];
            return `根据检索到的最相关文档《${topResult.title}》，${topResult.content.substring(0, 200)}... 基于这些信息，您的问题"${query}"涉及到${topResult.category}领域的核心概念。建议您查看右侧的详细检索结果以获得更全面的理解。如需了解更多相关内容，可以尝试不同的查询方式或添加更多相关文档到知识库中。`;
        }
        
        // 兜底回答
        return `感谢您的提问："${query}"。虽然当前检索结果可能不够完整，但这正体现了RAG系统的工作原理：通过不断优化知识库内容和检索算法来提升回答质量。建议您尝试：1）使用更具体的关键词重新提问；2）向知识库添加相关文档；3）尝试不同的问题表述方式。这样可以帮助系统更好地理解您的需求并提供准确的答案。`;
    }

    renderSearchResults() {
        const container = document.getElementById('searchResults');
        container.innerHTML = '';

        this.searchResults.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-fade-in bg-white/5 p-4 rounded-lg border border-white/10';
            
            const similarityPercent = Math.round(result.similarity * 100);
            const similarityColor = similarityPercent > 80 ? 'bg-green-500' : 
                                  similarityPercent > 60 ? 'bg-yellow-500' : 'bg-red-500';
            
            resultElement.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center">
                        <span class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">${index + 1}</span>
                        <h4 class="text-white font-medium text-sm">${result.title}</h4>
                    </div>
                    <span class="text-xs ${similarityColor.replace('bg-', 'bg-')}/20 ${similarityColor.replace('bg-', 'text-')}-300 px-2 py-1 rounded">${similarityPercent}%</span>
                </div>
                <p class="text-gray-300 text-xs mb-3">${result.content.substring(0, 150)}...</p>
                <div class="w-full bg-white/20 rounded-full h-1">
                    <div class="similarity-bar ${similarityColor}" style="width: ${similarityPercent}%"></div>
                </div>
            `;
            
            container.appendChild(resultElement);
        });
    }

    renderAIAnswer(answer, responseTime) {
        const container = document.getElementById('aiAnswer');
        const confidenceScore = Math.round(Math.random() * 20 + 75); // 75-95的随机置信度
        
        // 打字机效果
        container.innerHTML = '<div class="text-gray-200 typing-effect" id="typingText"></div>';
        
        this.typeWriterEffect(answer, 'typingText');
        
        // 更新统计信息
        document.getElementById('confidenceScore').textContent = `${confidenceScore}%`;
        document.getElementById('responseTime').textContent = `${responseTime}ms`;
    }

    typeWriterEffect(text, elementId) {
        const element = document.getElementById(elementId);
        let index = 0;
        
        const timer = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(timer);
                element.classList.remove('typing-effect');
            }
        }, 30);
    }

    updateProgress(percent, text) {
        document.getElementById('progressBar').style.width = `${percent}%`;
        document.getElementById('progressText').textContent = `${percent}%`;
    }

    activateStep(stepNumber) {
        // 重置所有步骤
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).classList.remove('active');
        }
        
        // 激活当前步骤
        document.getElementById(`step${stepNumber}`).classList.add('active');
    }

    resetProgress() {
        this.updateProgress(0, '准备开始...');
        this.currentStep = 0;
        
        // 重置所有步骤详情
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}Details`).innerHTML = '';
            document.getElementById(`step${i}`).classList.remove('active');
        }
        
        // 重置结果显示
        document.getElementById('searchResults').innerHTML = '<div class="text-gray-400 text-center py-8">等待检索结果...</div>';
        document.getElementById('aiAnswer').innerHTML = '<div class="text-gray-400 text-center py-8">等待AI生成回答...</div>';
        document.getElementById('confidenceScore').textContent = '--';
        document.getElementById('responseTime').textContent = '--';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 教程相关方法
    showTutorial() {
        this.tutorialStep = 0;
        document.getElementById('tutorialModal').classList.remove('hidden');
        this.updateTutorialContent();
    }

    closeTutorial() {
        document.getElementById('tutorialModal').classList.add('hidden');
    }

    nextTutorialStep() {
        if (this.tutorialStep < this.tutorialSteps.length - 1) {
            this.tutorialStep++;
            this.updateTutorialContent();
        }
    }

    previousTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.updateTutorialContent();
        }
    }

    updateTutorialContent() {
        const step = this.tutorialSteps[this.tutorialStep];
        const content = document.getElementById('tutorialContent');
        
        content.innerHTML = `
            <div class="mb-4">
                <h4 class="text-xl font-bold text-white mb-2">${step.title}</h4>
                <p class="text-gray-300 leading-relaxed">${step.content}</p>
            </div>
            <div class="flex justify-center mb-4">
                <div class="flex space-x-2">
                    ${this.tutorialSteps.map((_, index) => 
                        `<div class="w-3 h-3 rounded-full ${index === this.tutorialStep ? 'bg-blue-500' : 'bg-gray-600'}"></div>`
                    ).join('')}
                </div>
            </div>
            <div class="text-center text-sm text-gray-400">
                第 ${this.tutorialStep + 1} 步，共 ${this.tutorialSteps.length} 步
            </div>
        `;
    }

    // 文档上传器相关方法
    showDocumentUploader() {
        document.getElementById('documentUploaderModal').classList.remove('hidden');
    }
    
    closeDocumentUploader() {
        document.getElementById('documentUploaderModal').classList.add('hidden');
        // 清空表单
        document.getElementById('docTitle').value = '';
        document.getElementById('docContent').value = '';
        document.getElementById('docCategory').value = 'AI基础';
    }
    
    addCustomDocument() {
        const title = document.getElementById('docTitle').value.trim();
        const content = document.getElementById('docContent').value.trim();
        const category = document.getElementById('docCategory').value;
        
        if (!title || !content) {
            this.showMessage('请填写完整的文档信息！', 'error');
            return;
        }
        
        const newDoc = {
            id: this.knowledgeBase.length + 1,
            title: title,
            content: content,
            category: category,
            vector: this.generateVector(content),
            embedding: Array.from({length: 5}, () => Math.random())
        };
        
        this.knowledgeBase.push(newDoc);
        this.renderKnowledgeBase();
        this.closeDocumentUploader();
        
        // 显示成功消息并增加游戏分数
        this.gameScore += 10;
        this.updateGameStats();
        this.showMessage('文档添加成功！获得10分奖励', 'success');
    }

    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } animate-bounce`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    resetGame() {
        this.knowledgeBase = [];
        this.currentStep = 0;
        this.queryVector = null;
        this.searchResults = [];
        this.isProcessing = false;
        this.currentScenario = null;
        this.gameScore = 0;
        
        // 重新初始化
        this.initializeKnowledgeBase();
        this.resetProgress();
        
        // 重置界面
        document.getElementById('currentScenario').innerHTML = '<div class="text-center py-8 text-gray-400">请选择一个场景开始游戏</div>';
        document.getElementById('scenarioQuestions').classList.add('hidden');
        
        this.showMessage('游戏已重置！', 'info');
    }
}

// 全局函数，供HTML调用
let ragExplorer;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    ragExplorer = new RAGExplorer();
});

// 全局函数定义
function processRAGQuery() {
    if (ragExplorer) {
        ragExplorer.processRAGQuery();
    }
}

function processCustomQuery() {
    if (ragExplorer) {
        ragExplorer.processRAGQuery();
    }
}

function startScenario(scenarioType) {
    if (ragExplorer) {
        ragExplorer.startScenario(scenarioType);
    }
}

function showTutorial() {
    if (ragExplorer) {
        ragExplorer.showTutorial();
    }
}

function closeTutorial() {
    if (ragExplorer) {
        ragExplorer.closeTutorial();
    }
}

function nextTutorialStep() {
    if (ragExplorer) {
        ragExplorer.nextTutorialStep();
    }
}

function previousTutorialStep() {
    if (ragExplorer) {
        ragExplorer.previousTutorialStep();
    }
}

function addCustomDocument() {
    if (ragExplorer) {
        ragExplorer.addCustomDocument();
    }
}

function showDocumentUploader() {
    if (ragExplorer) {
        ragExplorer.showDocumentUploader();
    }
}

function closeDocumentUploader() {
    if (ragExplorer) {
        ragExplorer.closeDocumentUploader();
    }
}

function resetGame() {
    if (ragExplorer) {
        ragExplorer.resetGame();
    }
} 