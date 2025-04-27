'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Button, Typography, Spin, message, Tabs, Divider } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, TrophyOutlined, ClockCircleOutlined, InfoCircleOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from '../../src/styles/Student.module.scss';
import ReactECharts from 'echarts-for-react';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Activity {
  id: number;
  title: string;
  location: string;
  start_time: string;
  tags: string;
  points: number;
}

interface UserInfo {
  id: number;
  username: string;
  role: number;
  avatar?: string;
}

interface PointHistoryItem {
  id: number;
  points: number;
  activity_name?: string;
  reason?: string;
  description?: string; 
  created_at: string;
}

interface ActivityStatsData {
  types: Array<{category: string, count: number}>;
  status: Array<{status: number, count: number}>;
  trend: Array<{month: string, count: number}>;
}

const statusMap: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
  3: '已完成',
  4: '已取消'
};

const categoryMap: Record<string, string> = {
  'sports': '体育活动',
  'academic': '学术活动',
  'art': '艺术活动',
  'community': '社区服务',
  'technology': '科技活动',
  'other': '其他活动'
};

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState({
    activitiesCount: 0,
    pointsCount: 0,
    clubsCount: 0
  });
  const [pointsHistory, setPointsHistory] = useState<{
    earn: PointHistoryItem[];
    spend: PointHistoryItem[];
  }>({
    earn: [],
    spend: []
  });
  const [activityStats, setActivityStats] = useState<ActivityStatsData>({
    types: [],
    status: [],
    trend: []
  });

  useEffect(() => {
    const verifyUserAndLoadData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        router.push('/login');
        return;
      }
      
      try {
        // 验证用户身份和角色
        const authResponse = await axios.get('http://localhost:8080/api/user/profile', {
          headers: { 'x-access-token': token }
        });
        
        if (!authResponse.data.success) {
          message.error('会话已过期，请重新登录');
          router.push('/login');
          return;
        }
        
        const userData = authResponse.data.data;
        setUserInfo(userData);
        const actualRole = userData.role.toString();
        
        // 检查是否有权限访问学生页面 (角色为学生或社长)
        if (actualRole !== '1' && actualRole !== '2') {
          message.error('您没有权限访问此页面');
          router.push('/login');
          return;
        }
        
        // 如果存储的角色与实际角色不匹配，更新localStorage
        const storedRole = localStorage.getItem('role');
        if (storedRole !== actualRole) {
          localStorage.setItem('role', actualRole);
        }
        
        // 加载数据
        await Promise.all([
          fetchStats(token),
          fetchUpcomingActivities(token),
          fetchAnalyticsData(token)
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('验证身份失败:', error);
        message.error('验证用户身份失败，请重新登录');
        router.push('/login');
      }
    };
    
    verifyUserAndLoadData();
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      // 获取我参加的活动数量
      const activitiesResponse = await axios.get('http://localhost:8080/api/activities/my', {
        headers: { 'x-access-token': token }
      });
      
      // 获取我的积分总数
      const pointsResponse = await axios.get('http://localhost:8080/api/user/points', {
        headers: { 'x-access-token': token }
      });
      
      // 获取我加入的社团数量
      const clubsResponse = await axios.get('http://localhost:8080/api/user/clubs', {
        headers: { 'x-access-token': token }
      });
      
      setStats({
        activitiesCount: activitiesResponse.data.data?.length || 0,
        pointsCount: pointsResponse.data.total || 0,
        clubsCount: clubsResponse.data.data?.length || 0
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败，请检查网络连接');
      
      // 使用模拟数据
      setStats({
        activitiesCount: Math.floor(Math.random() * 10) + 5,
        pointsCount: Math.floor(Math.random() * 500) + 200,
        clubsCount: Math.floor(Math.random() * 5) + 1
      });
    }
  };

  const fetchAnalyticsData = async (token: string) => {
    try {
      // 获取积分历史
      const historyResponse = await axios.get('http://localhost:8080/api/user/points/history', {
        headers: { 'x-access-token': token }
      });
      
      if (historyResponse.data.success) {
        setPointsHistory(historyResponse.data);
      } else {
        console.error('获取积分历史数据失败:', historyResponse.data.message);
        message.error('获取积分历史数据失败');
        setPointsHistory(generateMockPointsHistory());
      }
      
      // 获取活动统计数据
      const activityStatsResponse = await axios.get('http://localhost:8080/api/user/activity-stats', {
        headers: { 'x-access-token': token }
      });
      
      if (activityStatsResponse.data.success) {
        setActivityStats(activityStatsResponse.data.data);
      } else {
        console.error('获取活动统计数据失败:', activityStatsResponse.data.message);
        message.error('获取活动统计数据失败');
        setActivityStats(generateMockActivityStats());
      }
    } catch (error) {
      console.error('获取数据分析失败:', error);
      message.error('获取数据分析失败，请检查网络连接');
      
      // 使用模拟数据
      setPointsHistory(generateMockPointsHistory());
      setActivityStats(generateMockActivityStats());
    }
  };

  const fetchUpcomingActivities = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:8080/api/activities', {
        headers: { 'x-access-token': token },
        params: { status: 1, upcoming: true }
      });
      
      if (response.data.success) {
        // 过滤获取未来的活动（开始时间大于当前时间）
        const now = new Date();
        const upcomingActivities = response.data.data.filter((activity: Activity) => 
          new Date(activity.start_time) > now
        ).slice(0, 3); // 只取前3个活动
        
        setActivities(upcomingActivities);
      } else {
        console.error('获取即将开始的活动失败:', response.data.message);
        message.error('获取活动数据失败');
        setActivities(generateMockActivities());
      }
    } catch (error) {
      console.error('获取即将开始的活动失败:', error);
      message.error('获取活动数据失败，请检查网络连接');
      
      // 使用模拟数据
      setActivities(generateMockActivities());
    }
  };

  const handleActivitySignup = async (activityId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        return;
      }
      
      const response = await axios.post(`http://localhost:8080/api/activities/${activityId}/signup`, {}, {
        headers: { 'x-access-token': token }
      });
      
      if (response.data.success) {
        message.success('报名成功');
        // 可以在这里更新活动状态
      }
    } catch (error: any) {
      console.error('报名失败:', error);
      message.error(error.response?.data?.message || '报名失败，请稍后再试');
    }
  };

  // 获取活动类型分布图配置
  const getActivityTypesOption = () => {
    const data = activityStats.types.map(item => ({
      name: categoryMap[item.category] || item.category,
      value: item.count
    }));
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(item => item.name)
      },
      series: [
        {
          name: '活动类型',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    };
  };

  // 获取活动趋势图配置
  const getActivityTrendOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: activityStats.trend.map(item => item.month)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '活动数量',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: activityStats.trend.map(item => item.count)
        }
      ]
    };
  };
  
  // 获取积分收支图表配置
  const getPointsChartOption = () => {
    // 计算每个月的积分收入
    const earnByMonth: Record<string, number> = {};
    pointsHistory.earn.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      earnByMonth[monthKey] = (earnByMonth[monthKey] || 0) + item.points;
    });
    
    // 计算每个月的积分支出
    const spendByMonth: Record<string, number> = {};
    pointsHistory.spend.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      spendByMonth[monthKey] = (spendByMonth[monthKey] || 0) + item.points;
    });
    
    // 生成近6个月的月份列表
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['获得积分', '使用积分']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '获得积分',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: months.map(month => earnByMonth[month] || 0)
        },
        {
          name: '使用积分',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: months.map(month => -(spendByMonth[month] || 0))
        }
      ]
    };
  };

  // 生成模拟活动数据
  const generateMockActivities = (): Activity[] => {
    const mockActivities: Activity[] = [];
    const activityNames = ['校园文化节', '足球联赛', '演讲比赛', '志愿者服务日', '科技创新大赛'];
    const locations = ['大礼堂', '运动场', '教学楼B101', '社区中心', '图书馆'];
    const tags = ['文化,艺术', '体育,团队', '学术,能力', '志愿者,公益', '科技,创新'];
    
    for (let i = 0; i < 3; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 14) + 1);
      
      mockActivities.push({
        id: i + 1,
        title: activityNames[i],
        location: locations[i],
        start_time: randomDate.toISOString(),
        tags: tags[i],
        points: Math.floor(Math.random() * 50) + 10
      });
    }
    
    return mockActivities;
  };
  
  // 生成模拟积分历史数据
  const generateMockPointsHistory = () => {
    const earn: PointHistoryItem[] = [];
    const spend: PointHistoryItem[] = [];
    const activityNames = ['校园文化节', '足球联赛', '演讲比赛', '志愿者服务日', '科技创新大赛'];
    const spendReasons = ['兑换礼品', '课程抵扣', '活动报名', '会员升级'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 5);
      
      earn.push({
        id: i + 1,
        points: Math.floor(Math.random() * 50) + 10,
        activity_name: activityNames[i % activityNames.length],
        created_at: date.toISOString()
      });
      
      if (i < 3) {
        const spendDate = new Date();
        spendDate.setDate(spendDate.getDate() - i * 7);
        
        spend.push({
          id: 100 + i,
          points: Math.floor(Math.random() * 30) + 5,
          description: spendReasons[i % spendReasons.length],
          created_at: spendDate.toISOString()
        });
      }
    }
    
    return { earn, spend };
  };
  
  // 生成模拟活动统计数据
  const generateMockActivityStats = (): ActivityStatsData => {
    // 生成活动类型分布
    const types = [
      { category: 'sports', count: Math.floor(Math.random() * 20) + 5 },
      { category: 'academic', count: Math.floor(Math.random() * 15) + 5 },
      { category: 'art', count: Math.floor(Math.random() * 10) + 3 },
      { category: 'community', count: Math.floor(Math.random() * 10) + 2 },
      { category: 'technology', count: Math.floor(Math.random() * 8) + 1 }
    ];
    
    // 生成活动状态分布
    const status = [
      { status: 1, count: Math.floor(Math.random() * 15) + 10 },
      { status: 3, count: Math.floor(Math.random() * 25) + 15 },
      { status: 4, count: Math.floor(Math.random() * 5) + 1 }
    ];
    
    // 生成活动参与趋势
    const trend = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trend.push({
        month: monthStr,
        count: Math.floor(Math.random() * 8) + 1
      });
    }
    
    return { types, status, trend };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title level={4} className={styles.welcome}>
        欢迎回来，{userInfo?.username || '同学'}！
      </Title>
      
      <Row gutter={16} className={styles.statsRow}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic 
              title="参与活动" 
              value={stats.activitiesCount} 
              prefix={<CalendarOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic 
              title="获得积分" 
              value={stats.pointsCount} 
              prefix={<TrophyOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic 
              title="加入社团" 
              value={stats.clubsCount} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <div className={styles.sectionHeader}>
        <Title level={5}>即将开始的活动</Title>
        <Link href="/student/activities">
          <Button type="link">查看全部</Button>
        </Link>
      </div>
      
      <List
        itemLayout="horizontal"
        dataSource={activities}
        renderItem={activity => (
          <List.Item
            actions={[
              <Button key="signup" type="primary" onClick={() => handleActivitySignup(activity.id)}>
                立即报名
              </Button>
            ]}
          >
            <List.Item.Meta
              title={activity.title}
              description={
                <div>
                  <p>
                    <ClockCircleOutlined style={{ marginRight: 8 }} /> 
                    {new Date(activity.start_time).toLocaleString()}
                  </p>
                  <p>
                    <EnvironmentOutlined style={{ marginRight: 8 }} /> 
                    {activity.location}
                  </p>
                  <div>
                    {activity.tags.split(',').map(tag => (
                      <Tag key={tag} color="blue" style={{ marginBottom: 5 }}>{tag}</Tag>
                    ))}
                    <Tag color="green">+{activity.points} 积分</Tag>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      
      <Divider />
      
      <div className={styles.sectionHeader}>
        <Title level={5}>
          <LineChartOutlined style={{ marginRight: 8 }} />
          数据分析看板
        </Title>
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane 
          tab={<span><TrophyOutlined />积分趋势</span>} 
          key="1"
        >
          <Card title="积分收支趋势" bordered={false}>
            <ReactECharts option={getPointsChartOption()} style={{ height: '300px' }} />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={<span><PieChartOutlined />活动统计</span>} 
          key="2"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card title="活动类型分布" bordered={false}>
                <ReactECharts option={getActivityTypesOption()} style={{ height: '300px' }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="活动参与趋势" bordered={false}>
                <ReactECharts option={getActivityTrendOption()} style={{ height: '300px' }} />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
      
      <Divider />
      
      <Title level={5}>最近积分记录</Title>
      <List
        itemLayout="horizontal"
        dataSource={[...pointsHistory.earn, ...pointsHistory.spend]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={item.activity_name || item.description || '积分记录'}
              description={new Date(item.created_at).toLocaleString()}
            />
            <div style={{ color: item.activity_name ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
              {item.activity_name ? `+${item.points}` : `-${item.points}`}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}