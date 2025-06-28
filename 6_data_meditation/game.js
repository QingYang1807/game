// 数据流冥想游戏
class DataMeditation {
    constructor() {
        this.canvas = document.getElementById('dataCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dataStreams = [];
        this.dataNodes = [];
        this.flowConnections = [];
        this.mode = 'gentle'; // gentle, flow, harmony
        this.harmonyLevel = 0;
        this.purityLevel = 100;
        this.meditationDepth = 0;
        this.guidanceCount = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastGuidanceTime = 0;
        this.animationId = null;
        this.tutorialStep = 0;
        this.aiDemoActive = false;
        this.aiDemoStep = 0;
        this.aiDemoInterval = null;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeDataFlow();
        this.startAnimation();
        this.createZenBackground();
        this.startMeditationGuide();
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
        // 模式切换按钮
        document.getElementById('gentleMode').addEventListener('click', () => this.setMode('gentle'));
        document.getElementById('flowMode').addEventListener('click', () => this.setMode('flow'));
        document.getElementById('harmonyMode').addEventListener('click', () => this.setMode('harmony'));
        document.getElementById('resetFlow').addEventListener('click', () => this.resetFlow());
        document.getElementById('tutorialBtn').addEventListener('click', () => this.showTutorial());
        document.getElementById('aiDemoBtn').addEventListener('click', () => this.startAIDemo());

        // 鼠标移动追踪
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    setMode(mode) {
        this.mode = mode;
        this.updateModeButtons();
        this.adjustDataFlowToMode();
        
        // 模式切换效果
        this.canvas.classList.add('mode-transition');
        setTimeout(() => {
            this.canvas.classList.remove('mode-transition');
        }, 1000);
    }

    updateModeButtons() {
        document.querySelectorAll('.bg-blue-500\\/30, .bg-cyan-500\\/30, .bg-green-500\\/30').forEach(btn => {
            btn.classList.remove('flow-mode-active');
        });
        
        const activeButton = {
            'gentle': 'gentleMode',
            'flow': 'flowMode',
            'harmony': 'harmonyMode'
        }[this.mode];
        
        document.getElementById(activeButton).classList.add('flow-mode-active');
    }

    adjustDataFlowToMode() {
        switch(this.mode) {
            case 'gentle':
                this.adjustGentleMode();
                break;
            case 'flow':
                this.adjustFlowMode();
                break;
            case 'harmony':
                this.adjustHarmonyMode();
                break;
        }
    }

    adjustGentleMode() {
        // 减少数据流密度，增加平和感
        this.dataStreams.forEach(stream => {
            stream.speed *= 0.5;
            stream.opacity = Math.min(0.6, stream.opacity);
        });
    }

    adjustFlowMode() {
        // 增加流动性和连接性
        this.dataStreams.forEach(stream => {
            stream.speed *= 1.5;
            stream.turbulence = Math.min(0.3, stream.turbulence);
        });
        this.createMoreConnections();
    }

    adjustHarmonyMode() {
        // 创建和谐的数据模式
        this.synchronizeDataFlow();
        this.createHarmonyResonance();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // 轻柔引导数据流
        this.gentleGuidance();
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.createGuidanceRipple(x, y);
        this.guidanceCount++;
        this.updateStats();
    }

    handleKeyDown(e) {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                this.deepMeditation();
                break;
            case 'r':
            case 'R':
                this.resetFlow();
                break;
        }
    }

    initializeDataFlow() {
        // 创建初始数据流
        for (let i = 0; i < 20; i++) {
            this.createDataStream();
        }
        
        // 创建数据节点
        for (let i = 0; i < 8; i++) {
            this.createDataNode();
        }
        
        // 创建流动连接
        this.createFlowConnections();
    }

    createDataStream() {
        const stream = {
            id: Date.now() + Math.random(),
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            speed: Math.random() * 2 + 0.5,
            size: Math.random() * 4 + 2,
            opacity: Math.random() * 0.8 + 0.2,
            color: this.getFlowColor(),
            turbulence: Math.random() * 0.1,
            life: Math.random() * 1000 + 500,
            maxLife: 1000,
            trail: []
        };
        
        this.dataStreams.push(stream);
    }

    createDataNode() {
        const node = {
            id: Date.now() + Math.random(),
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            radius: Math.random() * 15 + 10,
            pulsePhase: Math.random() * Math.PI * 2,
            connections: [],
            energy: Math.random() * 100,
            color: this.getNodeColor()
        };
        
        this.dataNodes.push(node);
    }

    createFlowConnections() {
        this.dataNodes.forEach((node, index) => {
            // 连接到最近的几个节点
            const nearbyNodes = this.dataNodes
                .filter(other => other !== node)
                .sort((a, b) => {
                    const distA = Math.sqrt((a.x - node.x) ** 2 + (a.y - node.y) ** 2);
                    const distB = Math.sqrt((b.x - node.x) ** 2 + (b.y - node.y) ** 2);
                    return distA - distB;
                })
                .slice(0, 2);
            
            nearbyNodes.forEach(target => {
                const connection = {
                    from: node,
                    to: target,
                    strength: Math.random() * 0.8 + 0.2,
                    pulsePhase: Math.random() * Math.PI * 2,
                    active: true
                };
                
                this.flowConnections.push(connection);
            });
        });
    }

    createMoreConnections() {
        // 在流动模式下创建更多连接
        const additionalConnections = 5;
        for (let i = 0; i < additionalConnections; i++) {
            if (this.dataNodes.length >= 2) {
                const from = this.dataNodes[Math.floor(Math.random() * this.dataNodes.length)];
                const to = this.dataNodes[Math.floor(Math.random() * this.dataNodes.length)];
                
                if (from !== to) {
                    const connection = {
                        from: from,
                        to: to,
                        strength: Math.random() * 0.6 + 0.4,
                        pulsePhase: Math.random() * Math.PI * 2,
                        active: true
                    };
                    
                    this.flowConnections.push(connection);
                }
            }
        }
    }

    synchronizeDataFlow() {
        // 同步数据流以创建和谐
        const basePhase = Date.now() * 0.001;
        
        this.dataStreams.forEach((stream, index) => {
            stream.vx = Math.sin(basePhase + index * 0.5) * stream.speed;
            stream.vy = Math.cos(basePhase + index * 0.5) * stream.speed;
        });
        
        this.dataNodes.forEach((node, index) => {
            node.pulsePhase = basePhase + index * 0.3;
        });
    }

    createHarmonyResonance() {
        // 创建和谐共振效果
        this.dataNodes.forEach(node => {
            const resonance = document.createElement('div');
            resonance.className = 'harmony-resonance';
            resonance.style.left = (node.x - 50) + 'px';
            resonance.style.top = (node.y - 50) + 'px';
            resonance.style.width = '100px';
            resonance.style.height = '100px';
            
            document.getElementById('dataFlowContainer').appendChild(resonance);
            
            setTimeout(() => {
                resonance.remove();
            }, 3000);
        });
    }

    gentleGuidance() {
        const now = Date.now();
        if (now - this.lastGuidanceTime < 100) return;
        
        this.lastGuidanceTime = now;
        
        // 轻柔地影响附近的数据流
        this.dataStreams.forEach(stream => {
            const distance = Math.sqrt((stream.x - this.mouseX) ** 2 + (stream.y - this.mouseY) ** 2);
            
            if (distance < 100) {
                const influence = (100 - distance) / 100 * 0.1;
                const angle = Math.atan2(this.mouseY - stream.y, this.mouseX - stream.x);
                
                stream.vx += Math.cos(angle) * influence;
                stream.vy += Math.sin(angle) * influence;
                
                // 限制速度
                const speed = Math.sqrt(stream.vx ** 2 + stream.vy ** 2);
                if (speed > 3) {
                    stream.vx = (stream.vx / speed) * 3;
                    stream.vy = (stream.vy / speed) * 3;
                }
            }
        });
        
        this.createGuidanceGesture(this.mouseX, this.mouseY);
    }

    createGuidanceGesture(x, y) {
        if (Math.random() < 0.1) { // 偶尔创建手势效果
            const gesture = document.createElement('div');
            gesture.className = 'guidance-gesture';
            gesture.style.left = (x - 15) + 'px';
            gesture.style.top = (y - 15) + 'px';
            
            document.getElementById('dataFlowContainer').appendChild(gesture);
            
            setTimeout(() => {
                gesture.remove();
            }, 1500);
        }
    }

    createGuidanceRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'harmony-ripple';
        ripple.style.left = (x - 5) + 'px';
        ripple.style.top = (y - 5) + 'px';
        
        document.getElementById('dataFlowContainer').appendChild(ripple);
        
        // 影响附近的数据流
        this.dataStreams.forEach(stream => {
            const distance = Math.sqrt((stream.x - x) ** 2 + (stream.y - y) ** 2);
            if (distance < 150) {
                stream.opacity = Math.min(1, stream.opacity + 0.3);
                stream.size = Math.min(8, stream.size + 1);
            }
        });
        
        setTimeout(() => {
            ripple.remove();
        }, 2000);
    }

    deepMeditation() {
        this.meditationDepth++;
        
        // 创建深度冥想效果
        this.createPurificationWave();
        this.harmonizeDataFlow();
        this.updateStats();
    }

    createPurificationWave() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const wave = document.createElement('div');
        wave.className = 'data-purification';
        wave.style.left = (centerX - 10) + 'px';
        wave.style.top = (centerY - 10) + 'px';
        
        document.getElementById('dataFlowContainer').appendChild(wave);
        
        // 净化数据流
        this.dataStreams.forEach(stream => {
            stream.turbulence *= 0.5;
            stream.opacity = Math.max(0.3, stream.opacity);
        });
        
        this.purityLevel = Math.min(100, this.purityLevel + 10);
        
        setTimeout(() => {
            wave.remove();
        }, 2000);
    }

    harmonizeDataFlow() {
        // 增加和谐度
        this.harmonyLevel = Math.min(100, this.harmonyLevel + 15);
        
        // 同步所有数据流
        this.synchronizeDataFlow();
        
        // 创建和谐指示器
        this.updateFlowStateIndicator();
    }

    resetFlow() {
        this.dataStreams = [];
        this.dataNodes = [];
        this.flowConnections = [];
        this.harmonyLevel = 0;
        this.purityLevel = 100;
        this.meditationDepth = 0;
        this.guidanceCount = 0;
        
        this.initializeDataFlow();
        this.updateStats();
        
        // 清除所有效果
        document.getElementById('dataFlowContainer').innerHTML = '';
    }

    getFlowColor() {
        const colors = [
            '#06b6d4', // cyan
            '#0891b2', // cyan-600
            '#10b981', // emerald
            '#059669', // emerald-600
            '#3b82f6', // blue
            '#2563eb'  // blue-600
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getNodeColor() {
        const colors = [
            '#06b6d4', // cyan
            '#10b981', // emerald
            '#3b82f6'  // blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createZenBackground() {
        const background = document.createElement('div');
        background.className = 'zen-background';
        document.body.appendChild(background);
    }

    startMeditationGuide() {
        const guides = [
            "深呼吸，感受数据的流动...",
            "让思维如水般自然流淌...",
            "观察，不要判断...",
            "每一个数据点都有其意义...",
            "在混沌中寻找秩序...",
            "让和谐从内心涌现...",
            "数据即生命，生命即数据...",
            "在静默中聆听信息的声音...",
            "引导，而非强迫...",
            "万物皆有其流动的节奏..."
        ];
        
        let currentGuide = 0;
        
        setInterval(() => {
            document.getElementById('guideText').textContent = guides[currentGuide];
            currentGuide = (currentGuide + 1) % guides.length;
        }, 8000);
    }

    updateStats() {
        document.getElementById('harmonyLevel').textContent = Math.round(this.harmonyLevel) + '%';
        document.getElementById('purityLevel').textContent = Math.round(this.purityLevel) + '%';
        document.getElementById('meditationDepth').textContent = this.meditationDepth;
        document.getElementById('guidanceCount').textContent = this.guidanceCount;
        
        this.updateFlowStateIndicator();
    }

    updateFlowStateIndicator() {
        const flowLevel = document.getElementById('flowLevel');
        const flowText = document.getElementById('flowStateText');
        
        const totalFlow = (this.harmonyLevel + this.purityLevel) / 2;
        flowLevel.style.height = totalFlow + '%';
        
        if (totalFlow < 25) {
            flowLevel.className = 'absolute bottom-0 left-0 w-full transition-all duration-1000 flow-state-chaotic';
            flowText.textContent = '混乱';
        } else if (totalFlow < 50) {
            flowLevel.className = 'absolute bottom-0 left-0 w-full transition-all duration-1000 flow-state-turbulent';
            flowText.textContent = '湍流';
        } else if (totalFlow < 75) {
            flowLevel.className = 'absolute bottom-0 left-0 w-full transition-all duration-1000 flow-state-active';
            flowText.textContent = '活跃';
        } else {
            flowLevel.className = 'absolute bottom-0 left-0 w-full transition-all duration-1000 flow-state-calm';
            flowText.textContent = '平静';
        }
    }

    startAnimation() {
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和绘制数据流
        this.updateDataStreams();
        this.drawDataStreams();
        
        // 更新和绘制数据节点
        this.updateDataNodes();
        this.drawDataNodes();
        
        // 绘制流动连接
        this.drawFlowConnections();
        
        // 更新统计信息
        this.updateFlowMetrics();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateDataStreams() {
        this.dataStreams = this.dataStreams.filter(stream => {
            // 更新位置
            stream.x += stream.vx;
            stream.y += stream.vy;
            
            // 添加轻微的随机扰动
            stream.vx += (Math.random() - 0.5) * stream.turbulence;
            stream.vy += (Math.random() - 0.5) * stream.turbulence;
            
            // 边界处理
            if (stream.x < 0 || stream.x > this.canvas.width) {
                stream.vx *= -0.8;
                stream.x = Math.max(0, Math.min(this.canvas.width, stream.x));
            }
            if (stream.y < 0 || stream.y > this.canvas.height) {
                stream.vy *= -0.8;
                stream.y = Math.max(0, Math.min(this.canvas.height, stream.y));
            }
            
            // 更新轨迹
            stream.trail.push({ x: stream.x, y: stream.y, opacity: stream.opacity });
            if (stream.trail.length > 10) {
                stream.trail.shift();
            }
            
            // 生命周期
            stream.life--;
            if (stream.life <= 0) {
                return false; // 移除
            }
            
            // 重新创建新的数据流
            if (Math.random() < 0.01) {
                this.createDataStream();
            }
            
            return true;
        });
    }

    drawDataStreams() {
        this.dataStreams.forEach(stream => {
            // 绘制轨迹
            if (stream.trail.length > 1) {
                this.ctx.strokeStyle = stream.color + '40';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(stream.trail[0].x, stream.trail[0].y);
                
                for (let i = 1; i < stream.trail.length; i++) {
                    this.ctx.lineTo(stream.trail[i].x, stream.trail[i].y);
                }
                this.ctx.stroke();
            }
            
            // 绘制主体
            this.ctx.fillStyle = stream.color + Math.floor(stream.opacity * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(stream.x, stream.y, stream.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 发光效果
            this.ctx.shadowColor = stream.color;
            this.ctx.shadowBlur = stream.size * 2;
            this.ctx.beginPath();
            this.ctx.arc(stream.x, stream.y, stream.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    updateDataNodes() {
        this.dataNodes.forEach(node => {
            // 更新脉冲
            node.pulsePhase += 0.05;
            
            // 能量变化
            node.energy += (Math.random() - 0.5) * 2;
            node.energy = Math.max(0, Math.min(100, node.energy));
        });
    }

    drawDataNodes() {
        this.dataNodes.forEach(node => {
            const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7;
            const currentRadius = node.radius * pulse;
            
            // 外发光
            this.ctx.fillStyle = node.color + '40';
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, currentRadius * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 主体
            this.ctx.fillStyle = node.color + 'CC';
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 内核
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, currentRadius * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawFlowConnections() {
        this.flowConnections.forEach(connection => {
            if (!connection.active) return;
            
            const pulse = Math.sin(connection.pulsePhase) * 0.5 + 0.5;
            connection.pulsePhase += 0.03;
            
            this.ctx.strokeStyle = '#06b6d4' + Math.floor(pulse * connection.strength * 255).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 1 + pulse * 2;
            this.ctx.setLineDash([5, 5]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(connection.from.x, connection.from.y);
            this.ctx.lineTo(connection.to.x, connection.to.y);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]);
        });
    }

    updateFlowMetrics() {
        // 计算和谐度
        const avgDistance = this.calculateAverageDistance();
        const flowSynchronization = this.calculateFlowSynchronization();
        
        this.harmonyLevel = Math.max(0, Math.min(100, 
            (100 - avgDistance / 10) * 0.5 + flowSynchronization * 0.5
        ));
        
        // 计算纯净度
        const avgTurbulence = this.dataStreams.reduce((sum, stream) => 
            sum + stream.turbulence, 0) / this.dataStreams.length;
        
        this.purityLevel = Math.max(0, Math.min(100, 100 - avgTurbulence * 1000));
        
        this.updateStats();
    }

    calculateAverageDistance() {
        if (this.dataNodes.length < 2) return 0;
        
        let totalDistance = 0;
        let count = 0;
        
        for (let i = 0; i < this.dataNodes.length; i++) {
            for (let j = i + 1; j < this.dataNodes.length; j++) {
                const dx = this.dataNodes[i].x - this.dataNodes[j].x;
                const dy = this.dataNodes[i].y - this.dataNodes[j].y;
                totalDistance += Math.sqrt(dx * dx + dy * dy);
                count++;
            }
        }
        
        return count > 0 ? totalDistance / count : 0;
    }

    calculateFlowSynchronization() {
        if (this.dataStreams.length < 2) return 0;
        
        let synchronization = 0;
        const avgVx = this.dataStreams.reduce((sum, s) => sum + s.vx, 0) / this.dataStreams.length;
        const avgVy = this.dataStreams.reduce((sum, s) => sum + s.vy, 0) / this.dataStreams.length;
        
        this.dataStreams.forEach(stream => {
            const similarity = 1 - (Math.abs(stream.vx - avgVx) + Math.abs(stream.vy - avgVy)) / 4;
            synchronization += Math.max(0, similarity);
        });
        
        return synchronization / this.dataStreams.length * 100;
    }

    setupTutorial() {
        const tutorialSteps = [
            {
                title: "欢迎来到数据流冥想",
                content: "在这个禅意的数字世界中，你将观察数据的流动，体验数字冥想的宁静。让心灵与数据共舞，找到内心的平静。",
                highlight: null
            },
            {
                title: "选择冥想模式",
                content: "有三种冥想模式：轻柔模式（平和宁静）、流动模式（动态平衡）、和谐模式（同步共振）。每种模式带来不同的冥想体验。",
                highlight: null
            },
            {
                title: "引导数据流",
                content: "轻柔移动鼠标来引导数据流的方向。观察数据如何响应你的引导，感受人与数字的和谐互动。",
                highlight: null
            },
            {
                title: "创造波纹",
                content: "点击画布任意位置创造引导波纹。波纹会影响周围的数据流，创造美丽的流动模式。",
                highlight: null
            },
            {
                title: "深度冥想",
                content: "按空格键进入深度冥想状态。这会净化数据流，提升冥想深度，带来更深层的宁静体验。点击'🤖 AI演示'可以看AI自动冥想。",
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
            <h3 class="text-xl font-bold text-cyan-300 mb-4">${step.title}</h3>
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
        
        // 重置流动状态
        this.resetFlow();
        
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
            () => this.aiDemoSwitchMode(),
            () => this.aiDemoGuideFlow(),
            () => this.aiDemoCreateRipples(),
            () => this.aiDemoDeepMeditation(),
            () => this.aiDemoHarmonize(),
            () => this.aiDemoFlowPattern(),
            () => this.aiDemoGentleMode()
        ];

        this.aiDemoInterval = setInterval(() => {
            if (!this.aiDemoActive) return;
            
            if (this.aiDemoStep < demoSteps.length) {
                demoSteps[this.aiDemoStep]();
                this.aiDemoStep++;
            } else {
                // 重新开始演示
                this.aiDemoStep = 0;
                this.resetFlow();
            }
        }, 3000);
    }

    aiDemoSwitchMode() {
        const modes = ['gentle', 'flow', 'harmony'];
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        this.setMode(randomMode);
    }

    aiDemoGuideFlow() {
        // AI模拟鼠标移动引导数据流
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 100;
        const angle = Date.now() * 0.001;
        
        this.mouseX = centerX + Math.cos(angle) * radius;
        this.mouseY = centerY + Math.sin(angle) * radius;
        
        this.gentleGuidance();
    }

    aiDemoCreateRipples() {
        // AI创建多个波纹
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                this.createGuidanceRipple(x, y);
            }, i * 500);
        }
    }

    aiDemoDeepMeditation() {
        this.deepMeditation();
    }

    aiDemoHarmonize() {
        this.harmonizeDataFlow();
        this.createHarmonyResonance();
    }

    aiDemoFlowPattern() {
        // AI创建流动模式
        this.setMode('flow');
        this.synchronizeDataFlow();
    }

    aiDemoGentleMode() {
        this.setMode('gentle');
        this.createPurificationWave();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new DataMeditation();
}); 