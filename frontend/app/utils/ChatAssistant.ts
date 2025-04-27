// 声明 bootstrap 类型
declare const bootstrap: {
    Modal: {
        new(element: HTMLElement | null): {
            show(): void;
            hide(): void;
        };
    };
};

class ChatAssistant {
    // DOM elements
    private chatButton: HTMLElement | null;
    private chatContainer: HTMLElement | null;
    private closeChatBtn: HTMLElement | null;
    private chatMessages: HTMLElement | null;
    private chatInput: HTMLInputElement | null;
    private sendMessageBtn: HTMLButtonElement | null;
    private settingsBtn: HTMLElement | null;
    private apiKeyModal: any; // Using any for bootstrap.Modal as it's not defined
    private apiKeyInput: HTMLInputElement | null;
    private saveApiKeyBtn: HTMLButtonElement | null;
    private uploadBtn: HTMLElement | null;
    private fileUploadArea: HTMLElement | null;
    private uploadArea: HTMLElement | null;
    private fileInput: HTMLInputElement | null;
    private fileList: HTMLElement | null;

    // State variables
    private isProcessing: boolean;
    private apiEndpoint: string;
    private modelName: string;
    private knowledgeBase: Record<string, any>;
    private systemPrompt: { role: string; content: string };
    private conversationHistory: Array<{ role: string; content: string }>;
    private uploadedFiles: Array<{
        name: string;
        size: number;
        date: string;
        content: string;
    }>;

    constructor() {
        this.chatButton = document.getElementById('chatButton');
        this.chatContainer = document.getElementById('chatContainer');
        this.closeChatBtn = document.getElementById('closeChatBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput') as HTMLInputElement;
        this.sendMessageBtn = document.getElementById('sendMessageBtn') as HTMLButtonElement;
        this.settingsBtn = document.getElementById('settingsBtn');
        this.apiKeyModal = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(document.getElementById('apiKeyModal')) : null;
        this.apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
        this.saveApiKeyBtn = document.getElementById('saveApiKeyBtn') as HTMLButtonElement;

        this.isProcessing = false;

        // Ollama API 端点
        this.apiEndpoint = 'http://localhost:11434/api/generate';  // 修改为 generate 端点
        this.modelName = 'deepseek-r1:7b';  // 使用正确的模型名称

        // 知识库管理
        this.knowledgeBase = this.loadKnowledgeBase();

        // 系统提示信息
        this.systemPrompt = {
            role: "system",
            content: `你是一个专业的积分活动规划专家，可以为学生提供活动咨询推荐等服务。
请用友好的语气回答用户的问题，并提供具体的建议。
以下是你可以参考的知识库信息：
${this.formatKnowledgeBase()}`
        };

        // 对话历史
        this.conversationHistory = [this.systemPrompt];

        // 确保聊天按钮可见
        if (this.chatButton) {
            this.chatButton.style.display = 'flex';
        }

        // 初始化发送按钮状态
        if (this.sendMessageBtn) {
            this.sendMessageBtn.disabled = true;
        }

        // 文件上传相关元素
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput') as HTMLInputElement;
        this.fileList = document.getElementById('fileList');

        // 已上传文件存储
        this.uploadedFiles = this.loadUploadedFiles();

        // 初始化文件上传相关事件监听
        this.initFileUploadListeners();

        // 显示已上传文件列表
        this.displayUploadedFiles();

        this.initEventListeners();
    }

    initEventListeners() {
        if (!this.chatButton || !this.chatContainer || !this.closeChatBtn || !this.chatInput || !this.sendMessageBtn) {
            console.error('Chat elements not found');
            return;
        }

        // 打开聊天窗口
        this.chatButton.addEventListener('click', () => {
            if (this.chatContainer && this.chatInput) {
                this.chatContainer.classList.add('active');
                this.chatInput.focus();
            }
        });

        // 关闭聊天窗口
        this.closeChatBtn.addEventListener('click', () => {
            if (this.chatContainer) {
                this.chatContainer.classList.remove('active');
            }
        });

        // 发送消息
        this.sendMessageBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // 按回车发送消息
        this.chatInput.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 输入框内容变化时更新发送按钮状态
        this.chatInput.addEventListener('input', () => {
            if (this.sendMessageBtn && this.chatInput) {
                this.sendMessageBtn.disabled = !this.chatInput.value.trim();
            }
        });

        // 打开设置模态框
        if (this.settingsBtn && this.apiKeyModal) {
            this.settingsBtn.addEventListener('click', () => {
                this.apiKeyModal.show();
            });
        }

        // 保存 API Key
        if (this.saveApiKeyBtn && this.apiKeyInput && this.apiKeyModal) {
            this.saveApiKeyBtn.addEventListener('click', () => {
                if (!this.apiKeyInput) return;
                const newApiKey = this.apiKeyInput.value.trim();
                if (this.setApiKey(newApiKey)) {
                    this.apiKeyModal.hide();
                }
            });
        }

        // 上传按钮点击事件
        if (this.uploadBtn) {
            this.uploadBtn.addEventListener('click', () => {
                this.toggleFileUploadArea();
            });
        }
    }

    // 切换文件上传区域显示状态
    toggleFileUploadArea() {
        if (!this.fileUploadArea || !this.chatMessages) return;

        const isVisible = this.fileUploadArea.style.display !== 'none';
        this.fileUploadArea.style.display = isVisible ? 'none' : 'block';

        // 调整聊天消息区域的高度
        if (isVisible) {
            this.chatMessages.style.flex = '1';
        } else {
            this.chatMessages.style.flex = '0.6';
        }
    }

    // 初始化文件上传相关事件监听
    initFileUploadListeners() {
        if (!this.uploadArea || !this.fileInput || !this.fileList) {
            console.error('File upload elements not found');
            return;
        }

        // 点击上传区域触发文件选择
        this.uploadArea.addEventListener('click', () => {
            if (this.fileInput) {
                this.fileInput.click();
            }
        });

        // 处理文件选择
        this.fileInput.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (files && files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // 处理拖放
        this.uploadArea.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.uploadArea) {
                this.uploadArea.style.borderColor = '#007bff';
            }
        });

        this.uploadArea.addEventListener('dragleave', (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.uploadArea) {
                this.uploadArea.style.borderColor = '#ccc';
            }
        });

        this.uploadArea.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.uploadArea) {
                this.uploadArea.style.borderColor = '#ccc';
            }

            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    // 加载知识库
    loadKnowledgeBase() {
        const defaultKnowledge = {
            '积分活动': {
                '志愿服务': '参与校内外志愿服务活动可获得积分奖励，根据服务时长和贡献度评定。',
                '学术讲座': '参加学术讲座并提交心得体会可获得积分，每场讲座基础分为2分。',
                '社团活动': '参与校级社团组织的活动可获得1-5不等的积分奖励。'
            },
            '积分兑换': {
                '奖学金加分': '积分可作为奖学金评定的加分项，100积分可兑换1分加分。',
                '实习推荐': '高积分学生可优先获得实习推荐机会。',
                '证书认证': '达到一定积分可获得学校颁发的社会实践证书。'
            },
            '积分规则': {
                '基本规则': '积分按学期统计，每学期初始积分为0。',
                '加分项目': '志愿服务、学术活动、社团活动、竞赛获奖等均可获得积分。',
                '积分上限': '单个活动类型积分有上限，防止积分过度集中。'
            }
        };

        try {
            const savedKnowledge = localStorage.getItem('pointsKnowledgeBase');
            return savedKnowledge ? JSON.parse(savedKnowledge) : defaultKnowledge;
        } catch (error) {
            console.error('加载知识库失败:', error);
            return defaultKnowledge;
        }
    }

    // 格式化知识库为文本
    formatKnowledgeBase() {
        let formattedText = '';
        for (const [category, items] of Object.entries(this.knowledgeBase)) {
            formattedText += `\n【${category}】\n`;
            if (typeof items === 'object') {
                for (const [item, desc] of Object.entries(items as Record<string, string>)) {
                    formattedText += `- ${item}: ${desc}\n`;
                }
            } else if (items.content) {
                // 处理文件内容，提取关键信息
                const content = this.processFileContent(items.content);
                formattedText += `\n文件：${category}\n${content}\n`;
            }
        }
        return formattedText;
    }

    // 处理文件内容，提取关键信息
    processFileContent(content: string): string {
        // 移除多余的空白字符
        content = content.replace(/\s+/g, ' ').trim();

        // 如果内容太长，进行摘要
        if (content.length > 1000) {
            content = content.substring(0, 1000) + '...（内容已截断）';
        }

        return content;
    }

    // 添加知识条目
    addKnowledgeItem(category: string, item: string, description: string) {
        if (!this.knowledgeBase[category]) {
            this.knowledgeBase[category] = {};
        }
        this.knowledgeBase[category][item] = description;
        this.saveKnowledgeBase();

        // 更新系统提示
        this.updateSystemPrompt();
    }

    // 保存知识库
    saveKnowledgeBase() {
        try {
            localStorage.setItem('pointsKnowledgeBase', JSON.stringify(this.knowledgeBase));
            console.log('知识库已保存');
        } catch (error) {
            console.error('保存知识库失败:', error);
        }
    }

    // 添加消息到对话历史
    addToHistory(role: string, content: string) {
        this.conversationHistory.push({ role, content });
        // 保持历史记录在合理范围内（例如最新的10条消息）
        if (this.conversationHistory.length > 11) { // 系统提示+10条消息
            this.conversationHistory.splice(1, 1); // 保留系统提示，删除最早的用户消息
        }
    }

    // 添加消息到界面
    addMessage(content: string, isUser = false) {
        if (!this.chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : ''}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.escapeHtml(content)}
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // 转义 HTML 特殊字符
    escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 获取 AI 响应
    async getAIResponse() {
        try {
            console.log('正在发送请求到:', this.apiEndpoint);

            // 构建完整的提示信息
            let prompt = `你是一个专业的积分活动规划专家，请基于以下知识回答用户的问题。
如果问题可以用知识库中的内容回答，请直接使用知识库内容。
如果需要补充其他信息，请明确指出"补充信息："。

知识库内容：\n`;

            // 添加默认知识库内容
            for (const [category, items] of Object.entries(this.knowledgeBase)) {
                if (typeof items === 'object' && !items.content) {
                    prompt += `\n【${category}】\n`;
                    for (const [item, desc] of Object.entries(items as Record<string, string>)) {
                        prompt += `- ${item}: ${desc}\n`;
                    }
                }
            }

            // 添加上传的文件内容
            if (this.uploadedFiles.length > 0) {
                prompt += "\n【用户上传的资料】\n";
                this.uploadedFiles.forEach(file => {
                    prompt += `\n=== ${file.name} ===\n${file.content}\n`;
                });
            }

            // 添加用户问题
            const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
            prompt += `\n当前问题：${lastMessage.content}\n`;
            prompt += "\n请基于以上知识回答问题，回答要有条理，要引用具体的信息来源。";

            // 构建 Ollama API 请求体
            const requestBody = {
                model: this.modelName,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            };

            console.log('发送到 Ollama 的提示:', prompt);

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 错误响应:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Ollama API 响应:', data);

            if (data.response) {
                return data.response;
            } else {
                throw new Error('无效的 API 响应格式');
            }
        } catch (error) {
            console.error('API 调用错误:', error);
            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    this.addMessage('错误：无法连接到 Ollama 服务。请确保：\n1. Ollama 服务正在运行\n2. 使用命令 ollama run deepseek-r1:7b 启动模型\n3. 端口 11434 可访问');
                } else {
                    this.addMessage(`错误：${error.message}\n\n请确保已经使用命令 ollama run deepseek-r1:7b 启动了模型。`);
                }
            } else {
                this.addMessage('发生未知错误，请检查控制台获取详细信息。');
            }
            throw error;
        }
    }

    // 发送消息
    async sendMessage() {
        if (!this.chatInput || !this.sendMessageBtn) return;

        if (this.isProcessing || !this.chatInput.value.trim()) {
            return;
        }

        const userMessage = this.chatInput.value.trim();
        this.addMessage(userMessage, true);
        this.chatInput.value = '';
        this.sendMessageBtn.disabled = true;
        this.isProcessing = true;

        try {
            console.log('发送用户消息:', userMessage);
            // 添加用户消息到历史记录
            this.addToHistory("user", userMessage);

            const response = await this.getAIResponse();
            if (response) {
                console.log('收到 AI 响应:', response);
                this.addMessage(response);
                // 添加AI响应到历史记录
                this.addToHistory("assistant", response);
            }
        } catch (error) {
            console.error('消息处理错误:', error);
            // 错误消息已经在 getAIResponse 中添加，这里不需要重复添加
        } finally {
            this.isProcessing = false;
            if (this.sendMessageBtn) {
                this.sendMessageBtn.disabled = false;
            }
            if (this.chatInput) {
                this.chatInput.focus();
            }
        }
    }

    // 设置 API Key
    setApiKey(key: string): boolean {
        if (!key || typeof key !== 'string') {
            console.error('无效的 API Key 格式');
            this.addMessage('错误：无效的 API Key 格式。');
            return false;
        }
        localStorage.setItem('ollama_api_key', key);
        this.addMessage('API Key 设置成功！现在你可以开始对话了。');
        return true;
    }

    // 加载已上传文件列表
    loadUploadedFiles() {
        try {
            const savedFiles = localStorage.getItem('uploadedFiles');
            return savedFiles ? JSON.parse(savedFiles) : [];
        } catch (error) {
            console.error('加载已上传文件列表失败:', error);
            return [];
        }
    }

    // 保存已上传文件列表
    saveUploadedFiles() {
        try {
            localStorage.setItem('uploadedFiles', JSON.stringify(this.uploadedFiles));
        } catch (error) {
            console.error('保存已上传文件列表失败:', error);
        }
    }

    // 显示已上传文件列表
    displayUploadedFiles() {
        if (!this.fileList) return;

        this.fileList.innerHTML = '';
        this.uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-alt file-icon"></i>
                    <div>
                        <h6 class="file-name">${file.name}</h6>
                        <span class="file-meta">${file.size} bytes · ${file.date}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="delete-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // 添加删除按钮事件监听
            const deleteBtn = fileItem.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deleteFile(index);
                });
            }

            if (this.fileList) {
                this.fileList.appendChild(fileItem);
            }
        });
    }

    // 处理文件上传
    async handleFileUpload(file: File) {
        try {
            const content = await this.readFileContent(file);

            // 将文件信息添加到已上传文件列表
            this.uploadedFiles.push({
                name: file.name,
                size: file.size,
                date: new Date().toLocaleDateString(),
                content: content as string
            });

            // 保存文件列表
            this.saveUploadedFiles();

            // 更新显示
            this.displayUploadedFiles();

            // 添加到知识库
            this.addFileContentToKnowledgeBase(content as string, file.name);

            // 显示成功消息
            this.addMessage(`文件 "${file.name}" 已成功上传并添加到知识库。\n\n文件内容：\n${(content as string).substring(0, 200)}${(content as string).length > 200 ? '...' : ''}\n\n现在你可以问我关于这个文件的问题了！`);
        } catch (error) {
            console.error('文件上传失败:', error);
            this.addMessage(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    // 读取文件内容
    readFileContent(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    resolve(e.target.result as string);
                } else {
                    reject(new Error('文件读取失败'));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }

    // 删除文件
    deleteFile(index: number) {
        if (index < 0 || index >= this.uploadedFiles.length) return;

        // 从知识库中移除该文件的内容
        const fileName = this.uploadedFiles[index].name;
        delete this.knowledgeBase[fileName];

        // 从上传列表中移除
        this.uploadedFiles.splice(index, 1);

        // 保存更改
        this.saveUploadedFiles();
        this.saveKnowledgeBase();

        // 更新显示
        this.displayUploadedFiles();

        // 更新系统提示
        this.updateSystemPrompt();

        // 显示成功消息
        this.addMessage(`文件已成功删除`);
    }

    // 将文件内容添加到知识库
    addFileContentToKnowledgeBase(content: string, fileName: string) {
        // 将文件内容直接存储到知识库
        this.knowledgeBase[fileName] = {
            content: content,
            uploadTime: new Date().toISOString()
        };

        // 保存知识库
        this.saveKnowledgeBase();

        // 更新系统提示
        this.updateSystemPrompt();
    }

    // 更新系统提示
    updateSystemPrompt() {
        const knowledgeBaseContent = this.formatKnowledgeBase();
        this.systemPrompt = {
            role: "system",
            content: `你是一个专业的积分活动规划专家，可以为学生提供活动咨询推荐等服务。
你的回答应该基于用户上传的知识库内容。如果用户的问题与知识库内容相关，请优先使用知识库中的信息来回答。
如果问题超出知识库范围，你可以使用自己的知识来补充，但要明确指出这是补充信息。

当前知识库包含以下内容：
${knowledgeBaseContent}

请用友好的语气回答用户的问题，并尽可能提供具体的建议。如果用户的问题涉及到特定文件的内容，请明确指出信息来源。`
        };

        // 更新对话历史中的系统提示
        this.conversationHistory[0] = this.systemPrompt;
    }
}

export default ChatAssistant; 