// 神经网络编织师游戏
class NeuralWeaver {
    constructor() {
        this.canvas = document.getElementById('neuralCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.neurons = [];
        this.connections = [];
        this.particles = [];
        this.mode = 'create'; // create, connect, pulse
        this.selectedNeuron = null;
        this.isConnecting = false;
        this.connectionStart = null;
        this.animationId = null;
        this.tutorialStep = 0;
        this.aiDemoActive = false;
        this.aiDemoStep = 0;
        this.aiDemoInterval = null;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.startAnimation();
        this.createStarField();
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
        document.getElementById('createMode').addEventListener('click', () => this.setMode('create'));
        document.getElementById('connectMode').addEventListener('click', () => this.setMode('connect'));
        document.getElementById('pulseMode').addEventListener('click', () => this.setMode('pulse'));
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('tutorialBtn').addEventListener('click', () => this.showTutorial());
        document.getElementById('aiDemoBtn').addEventListener('click', () => this.startAIDemo());

        // 画布事件
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setMode(mode) {
        this.mode = mode;
        this.selectedNeuron = null;
        this.isConnecting = false;
        this.connectionStart = null;
        
        // 更新按钮样式
        document.querySelectorAll('.bg-cyan-500\\/30, .bg-purple-500\\/30, .bg-pink-500\\/30').forEach(btn => {
            btn.classList.remove('mode-active');
        });
        
        const activeButton = {
            'create': 'createMode',
            'connect': 'connectMode',
            'pulse': 'pulseMode'
        }[mode];
        
        document.getElementById(activeButton).classList.add('mode-active');
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.mode === 'create') {
            this.createNeuron(x, y);
        } else if (this.mode === 'pulse') {
            this.createThoughtPulse(x, y);
        }
    }

    handleMouseDown(e) {
        if (this.mode !== 'connect') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const neuron = this.getNeuronAt(x, y);
        if (neuron) {
            this.isConnecting = true;
            this.connectionStart = neuron;
            this.selectedNeuron = neuron;
        }
    }

    handleMouseMove(e) {
        if (!this.isConnecting || this.mode !== 'connect') return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    handleMouseUp(e) {
        if (!this.isConnecting || this.mode !== 'connect') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const targetNeuron = this.getNeuronAt(x, y);
        if (targetNeuron && targetNeuron !== this.connectionStart) {
            this.createConnection(this.connectionStart, targetNeuron);
        }
        
        this.isConnecting = false;
        this.connectionStart = null;
        this.selectedNeuron = null;
    }

    createNeuron(x, y) {
        const neuron = {
            id: Date.now() + Math.random(),
            x: x,
            y: y,
            radius: 15 + Math.random() * 10,
            color: this.getRandomNeuronColor(),
            type: this.getRandomNeuronType(),
            activation: 0,
            pulseTime: 0,
            connections: []
        };
        
        this.neurons.push(neuron);
        this.createRippleEffect(x, y);
        this.updateStats();
    }

    createConnection(from, to) {
        // 检查是否已存在连接
        const existingConnection = this.connections.find(conn => 
            (conn.from === from && conn.to === to) || (conn.from === to && conn.to === from)
        );
        
        if (existingConnection) return;
        
        const connection = {
            id: Date.now() + Math.random(),
            from: from,
            to: to,
            strength: Math.random() * 0.8 + 0.2,
            pulseTime: 0,
            particles: []
        };
        
        this.connections.push(connection);
        from.connections.push(connection);
        to.connections.push(connection);
        
        this.updateStats();
    }

    createThoughtPulse(x, y) {
        const nearbyNeurons = this.neurons.filter(neuron => {
            const distance = Math.sqrt((neuron.x - x) ** 2 + (neuron.y - y) ** 2);
            return distance < 100;
        });
        
        nearbyNeurons.forEach(neuron => {
            neuron.activation = 1;
            neuron.pulseTime = Date.now();
            this.propagateSignal(neuron);
        });
        
        this.createRippleEffect(x, y);
    }

    propagateSignal(neuron) {
        neuron.connections.forEach(connection => {
            const targetNeuron = connection.from === neuron ? connection.to : connection.from;
            
            setTimeout(() => {
                targetNeuron.activation = Math.min(1, targetNeuron.activation + connection.strength * 0.5);
                targetNeuron.pulseTime = Date.now();
                
                // 创建传播粒子
                this.createConnectionParticle(connection);
                
                // 继续传播（递减强度）
                if (connection.strength > 0.3) {
                    connection.strength *= 0.8;
                    this.propagateSignal(targetNeuron);
                }
            }, Math.random() * 200 + 100);
        });
    }

    createConnectionParticle(connection) {
        const particle = {
            id: Date.now() + Math.random(),
            startX: connection.from.x,
            startY: connection.from.y,
            endX: connection.to.x,
            endY: connection.to.y,
            progress: 0,
            speed: 0.02 + Math.random() * 0.03,
            color: `hsl(${Math.random() * 60 + 180}, 70%, 60%)`,
            size: 3 + Math.random() * 3
        };
        
        this.particles.push(particle);
    }

    createRippleEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'thought-ripple';
        ripple.style.left = (x - 50) + 'px';
        ripple.style.top = (y - 50) + 'px';
        
        document.getElementById('particleContainer').appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 1500);
    }

    createStarField() {
        const starContainer = document.createElement('div');
        starContainer.className = 'stars';
        document.body.appendChild(starContainer);
    }

    getNeuronAt(x, y) {
        return this.neurons.find(neuron => {
            const distance = Math.sqrt((neuron.x - x) ** 2 + (neuron.y - y) ** 2);
            return distance <= neuron.radius;
        });
    }

    getRandomNeuronColor() {
        const colors = [
            '#60a5fa', // blue
            '#a78bfa', // purple
            '#f472b6', // pink
            '#34d399', // green
            '#fbbf24', // yellow
            '#fb7185'  // red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomNeuronType() {
        const types = ['input', 'hidden', 'output'];
        return types[Math.floor(Math.random() * types.length)];
    }

    clearAll() {
        this.neurons = [];
        this.connections = [];
        this.particles = [];
        this.selectedNeuron = null;
        this.isConnecting = false;
        this.connectionStart = null;
        this.updateStats();
    }

    updateStats() {
        document.getElementById('connectionCount').textContent = this.connections.length;
        document.getElementById('networkDepth').textContent = this.calculateNetworkDepth();
        document.getElementById('thoughtIntensity').textContent = this.calculateThoughtIntensity() + '%';
    }

    calculateNetworkDepth() {
        if (this.neurons.length === 0) return 0;
        // 简化的深度计算
        return Math.min(this.neurons.length, Math.floor(this.connections.length / 2) + 1);
    }

    calculateThoughtIntensity() {
        if (this.neurons.length === 0) return 0;
        const avgActivation = this.neurons.reduce((sum, neuron) => sum + neuron.activation, 0) / this.neurons.length;
        return Math.round(avgActivation * 100);
    }

    startAnimation() {
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景网格
        this.drawBackgroundGrid();
        
        // 绘制连接线
        this.drawConnections();
        
        // 绘制神经元
        this.drawNeurons();
        
        // 绘制粒子
        this.drawParticles();
        
        // 绘制连接预览
        if (this.isConnecting && this.connectionStart) {
            this.drawConnectionPreview();
        }
        
        // 更新动画状态
        this.updateAnimationStates();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackgroundGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawNeurons() {
        this.neurons.forEach(neuron => {
            const now = Date.now();
            const timeSincePulse = now - neuron.pulseTime;
            
            // 神经元主体
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
            
            // 根据激活状态调整颜色和大小
            const pulseIntensity = Math.max(0, 1 - timeSincePulse / 1000);
            const glowRadius = neuron.radius + pulseIntensity * 10;
            
            // 外发光
            if (neuron.activation > 0) {
                const gradient = this.ctx.createRadialGradient(
                    neuron.x, neuron.y, 0,
                    neuron.x, neuron.y, glowRadius
                );
                gradient.addColorStop(0, neuron.color + '80');
                gradient.addColorStop(1, neuron.color + '00');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(neuron.x, neuron.y, glowRadius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 神经元本体
            this.ctx.fillStyle = neuron.color;
            this.ctx.shadowColor = neuron.color;
            this.ctx.shadowBlur = 10 + neuron.activation * 20;
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 重置阴影
            this.ctx.shadowBlur = 0;
            
            // 神经元类型指示器
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const typeSymbol = {
                'input': '▶',
                'hidden': '●',
                'output': '◀'
            }[neuron.type];
            
            this.ctx.fillText(typeSymbol, neuron.x, neuron.y);
            
            // 激活衰减
            neuron.activation *= 0.995;
        });
    }

    drawConnections() {
        this.connections.forEach(connection => {
            const dx = connection.to.x - connection.from.x;
            const dy = connection.to.y - connection.from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 连接线样式
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + connection.strength * 0.4})`;
            this.ctx.lineWidth = 1 + connection.strength * 3;
            this.ctx.lineCap = 'round';
            
            // 绘制连接线
            this.ctx.beginPath();
            this.ctx.moveTo(connection.from.x, connection.from.y);
            this.ctx.lineTo(connection.to.x, connection.to.y);
            this.ctx.stroke();
            
            // 方向箭头
            const arrowSize = 8;
            const angle = Math.atan2(dy, dx);
            const arrowX = connection.to.x - Math.cos(angle) * (connection.to.radius + 5);
            const arrowY = connection.to.y - Math.sin(angle) * (connection.to.radius + 5);
            
            this.ctx.fillStyle = this.ctx.strokeStyle;
            this.ctx.beginPath();
            this.ctx.moveTo(arrowX, arrowY);
            this.ctx.lineTo(
                arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
                arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            this.ctx.lineTo(
                arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
                arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            this.ctx.closePath();
            this.ctx.fill();
        });
    }

    drawParticles() {
        this.particles = this.particles.filter(particle => {
            // 更新粒子位置
            particle.progress += particle.speed;
            
            if (particle.progress >= 1) {
                return false; // 移除完成的粒子
            }
            
            // 计算当前位置
            const x = particle.startX + (particle.endX - particle.startX) * particle.progress;
            const y = particle.startY + (particle.endY - particle.startY) * particle.progress;
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            return true;
        });
    }

    drawConnectionPreview() {
        if (!this.mouseX || !this.mouseY) return;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.connectionStart.x, this.connectionStart.y);
        this.ctx.lineTo(this.mouseX, this.mouseY);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }

    updateAnimationStates() {
            // 这里可以添加更多的动画状态更新逻辑
        this.updateStats();
        
        // AI演示逻辑
        if (this.aiDemoActive) {
            this.updateAIDemo();
        }
    }

    setupTutorial() {
        const tutorialSteps = [
            {
                title: "欢迎来到神经网络编织师",
                content: "在这个游戏中，你将创建和连接神经元，观察思维的传播。让我们开始学习基本操作！",
                highlight: null
            },
            {
                title: "创建神经元",
                content: "点击 '➕ 创建模式' 按钮，然后在画布上点击任意位置创建神经元。不同颜色的神经元代表不同类型：输入(▶)、隐藏(●)、输出(◀)。",
                highlight: "createMode"
            },
            {
                title: "连接神经元",
                content: "点击 '🔗 连接模式' 按钮，然后从一个神经元拖拽到另一个神经元来创建连接。连接线的粗细表示连接强度。",
                highlight: "connectMode"
            },
            {
                title: "观察思维传播",
                content: "点击 '⚡ 脉冲模式' 按钮，然后点击画布任意位置发送思维脉冲。观察信号如何通过神经网络传播！",
                highlight: "pulseMode"
            },
            {
                title: "开始创造吧！",
                content: "现在你已经掌握了基本操作。尝试创建复杂的神经网络，观察不同的连接模式如何影响思维传播。点击 '🤖 AI演示' 可以看AI自动创建网络！",
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
        
        // 清空现有内容
        this.clearAll();
        
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
            () => this.aiCreateNeuronCluster(),
            () => this.aiConnectNeurons(),
            () => this.aiCreateSecondLayer(),
            () => this.aiConnectLayers(),
            () => this.aiSendPulses(),
            () => this.aiOptimizeNetwork(),
            () => this.aiCreateComplexPattern()
        ];

        this.aiDemoInterval = setInterval(() => {
            if (!this.aiDemoActive) return;
            
            if (this.aiDemoStep < demoSteps.length) {
                demoSteps[this.aiDemoStep]();
                this.aiDemoStep++;
            } else {
                // 重新开始演示
                this.aiDemoStep = 0;
                this.clearAll();
            }
        }, 2000);
    }

    aiCreateNeuronCluster() {
        // AI创建一组神经元
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 100;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.createNeuron(x, y);
        }
    }

    aiConnectNeurons() {
        // AI连接现有神经元
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = i + 1; j < this.neurons.length; j++) {
                if (Math.random() > 0.5) {
                    this.createConnection(this.neurons[i], this.neurons[j]);
                }
            }
        }
    }

    aiCreateSecondLayer() {
        // AI创建第二层神经元
        const y = this.canvas.height / 2 + 200;
        
        for (let i = 0; i < 3; i++) {
            const x = this.canvas.width / 2 + (i - 1) * 150;
            this.createNeuron(x, y);
        }
    }

    aiConnectLayers() {
        // AI连接不同层的神经元
        const firstLayer = this.neurons.slice(0, 5);
        const secondLayer = this.neurons.slice(5);
        
        firstLayer.forEach(neuron1 => {
            secondLayer.forEach(neuron2 => {
                if (Math.random() > 0.3) {
                    this.createConnection(neuron1, neuron2);
                }
            });
        });
    }

    aiSendPulses() {
        // AI发送思维脉冲
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                this.createThoughtPulse(x, y);
            }, i * 500);
        }
    }

    aiOptimizeNetwork() {
        // AI优化网络连接
        this.connections.forEach(connection => {
            connection.strength = Math.random() * 0.8 + 0.2;
        });
    }

    aiCreateComplexPattern() {
        // AI创建复杂模式
        const patterns = [
            () => this.createSpiralPattern(),
            () => this.createGridPattern(),
            () => this.createStarPattern()
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern();
    }

    createSpiralPattern() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 4;
            const radius = i * 20;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (x > 0 && x < this.canvas.width && y > 0 && y < this.canvas.height) {
                this.createNeuron(x, y);
            }
        }
    }

    createGridPattern() {
        const startX = 200;
        const startY = 200;
        const spacing = 80;
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const x = startX + i * spacing;
                const y = startY + j * spacing;
                this.createNeuron(x, y);
            }
        }
    }

    createStarPattern() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 创建五角星
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const outerRadius = 120;
            const innerRadius = 60;
            
            // 外点
            const x1 = centerX + Math.cos(angle) * outerRadius;
            const y1 = centerY + Math.sin(angle) * outerRadius;
            this.createNeuron(x1, y1);
            
            // 内点
            const innerAngle = angle + Math.PI / 5;
            const x2 = centerX + Math.cos(innerAngle) * innerRadius;
            const y2 = centerY + Math.sin(innerAngle) * innerRadius;
            this.createNeuron(x2, y2);
        }
    }

    updateAIDemo() {
        // AI演示期间的特殊效果
        if (Math.random() < 0.1) {
            const randomNeuron = this.neurons[Math.floor(Math.random() * this.neurons.length)];
            if (randomNeuron) {
                randomNeuron.activation = 1;
                randomNeuron.pulseTime = Date.now();
                this.propagateSignal(randomNeuron);
            }
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new NeuralWeaver();
}); 