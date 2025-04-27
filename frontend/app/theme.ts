import { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    borderRadius: 4,
  },
  components: {
    Button: {
      colorPrimary: '#1890ff',
      algorithm: true,
    },
    Card: {
      colorBgContainer: '#ffffff',
    },
    Menu: {
      colorItemBgSelected: 'rgba(24, 144, 255, 0.1)',
      colorItemTextSelected: '#1890ff',
      colorItemTextHover: '#1890ff',
      colorItemBgHover: 'rgba(24, 144, 255, 0.05)',
      fontWeightStrong: 600,
      motionDurationSlow: '0.3s',
      motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)'
    },
  },
};

export default theme; 