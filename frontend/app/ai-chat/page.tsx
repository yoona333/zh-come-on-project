'use client';

import React from 'react';
import AIChat from '@/components/AIChat';
import { Layout } from 'antd';

const { Content } = Layout;

const AIChatPage: React.FC = () => {
    return (
        <Layout className="min-h-screen">
            <Content className="p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">AI助手</h1>
                    <p className="text-gray-600 mb-6">
                        你可以在这里询问关于社团积分、活动信息等问题，AI助手会尽力帮助你。
                    </p>
                    <AIChat />
                </div>
            </Content>
        </Layout>
    );
};

export default AIChatPage; 