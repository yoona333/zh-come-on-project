'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Input, Spin, Upload, Modal, message } from 'antd';
import { SendOutlined, UploadOutlined, SettingOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import '@/app/styles/aichat.scss';

const AIChat: React.FC = () => {
    const [messages, setMessages] = useState<{ content: string; isUser: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // 在页面加载时添加欢迎消息
    useEffect(() => {
        setMessages([
            {
                content: '你好！我是你的积分活动助手。你可以向我咨询关于校园积分、活动参与等问题。',
                isUser: false
            }
        ]);
    }, []);

    // 滚动到最新消息
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // 从localStorage加载API密钥
    useEffect(() => {
        const savedApiKey = localStorage.getItem('ollama_api_key');
        if (savedApiKey) {
            setApiKey(savedApiKey);
        }
    }, []);

    // 发送消息到Ollama API
    const sendMessage = async () => {
        if (!inputValue.trim() || isProcessing) return;

        // 添加用户消息到聊天界面
        const userMessage = inputValue.trim();
        setMessages(prev => [...prev, { content: userMessage, isUser: true }]);
        setInputValue('');
        setIsProcessing(true);

        try {
            // 构建提示信息
            let prompt = `你是一个专业的积分活动规划专家，请回答以下问题：${userMessage}`;
            
            // 构建请求体
            const requestBody = {
                model: 'deepseek-r1:7b',
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            };

            // 发送请求到Ollama API
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`服务器错误: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response) {
                // 添加AI响应到聊天界面
                setMessages(prev => [...prev, { content: data.response, isUser: false }]);
            } else {
                throw new Error('无效的API响应格式');
            }
        } catch (error) {
            console.error('API调用错误:', error);
            let errorMessage = '连接AI服务失败。';
            
            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Ollama服务不可用。请确保服务正在运行，并使用命令 ollama run deepseek-r1:7b 启动模型。';
                } else {
                    errorMessage = `错误: ${error.message}`;
                }
            }
            
            // 添加错误消息到聊天界面
            setMessages(prev => [...prev, { content: errorMessage, isUser: false }]);
        } finally {
            setIsProcessing(false);
        }
    };

    // 处理文件上传
    const handleUpload = async (file: File) => {
        try {
            // 读取文件内容
            const content = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target?.result as string || '');
                reader.onerror = reject;
                reader.readAsText(file);
            });
            
            // 保存到本地存储
            const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
            uploadedFiles.push({
                name: file.name,
                size: file.size,
                date: new Date().toLocaleDateString(),
                content: content
            });
            localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
            
            // 添加AI响应
            setMessages(prev => [...prev, {
                content: `文件 "${file.name}" 已成功上传！我已经学习了其中的内容，现在你可以问我关于这个文件的问题了。`,
                isUser: false
            }]);
            
            message.success(`文件 ${file.name} 上传成功！`);
        } catch (error) {
            console.error('文件上传失败:', error);
            message.error('文件上传失败');
        }
    };
    
    // 保存API密钥
    const saveApiKey = () => {
        localStorage.setItem('ollama_api_key', apiKey);
        setIsSettingsModalVisible(false);
        message.success('API密钥已保存');
    };

    return (
        <Card className="shadow-lg rounded-lg overflow-hidden h-[600px] flex flex-col">
            {/* 聊天消息区域 */}
            <div 
                className="flex-1 p-4 overflow-y-auto" 
                style={{ height: '450px' }} 
                ref={chatContainerRef}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-4 max-w-[80%] ${msg.isUser ? 'ml-auto' : 'mr-auto'}`}
                    >
                        <div
                            className={`p-3 rounded-lg ${
                                msg.isUser
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                            }`}
                        >
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-200 p-3 rounded-lg rounded-bl-none">
                            <Spin size="small" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* 输入区域 */}
            <div className="border-t p-4 flex gap-2">
                <Button
                    icon={<SettingOutlined />}
                    onClick={() => setIsSettingsModalVisible(true)}
                    className="mr-1"
                    type="text"
                />
                <Upload
                    beforeUpload={(file) => {
                        handleUpload(file);
                        return false;
                    }}
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />} type="text" />
                </Upload>
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder="输入您的问题..."
                    disabled={isProcessing}
                    autoFocus
                    className="flex-1"
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isProcessing}
                >
                    发送
                </Button>
            </div>
            
            {/* 设置模态框 */}
            <Modal
                title="API设置"
                open={isSettingsModalVisible}
                onOk={saveApiKey}
                onCancel={() => setIsSettingsModalVisible(false)}
            >
                <p className="mb-2">配置Ollama API（可选）</p>
                <Input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="API密钥或自定义设置"
                    className="mb-4"
                />
                <p className="text-sm text-gray-500">
                    默认使用本地Ollama服务。如果您想使用其他模型或服务，可以在此处进行设置。
                </p>
            </Modal>
        </Card>
    );
};

export default AIChat; 