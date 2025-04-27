'use client';

import { Card, Table, DatePicker, Button, message, Row, Col, Statistic, Select, Space, App, Tabs } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  RiseOutlined, 
  BarChartOutlined, 
  PieChartOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TableOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
// 导入Echarts
import ReactECharts from 'echarts-for-react';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface CustomJwtPayload {
  exp?: number;
  role: number;
  userId: number;
}

interface ActivityStat {
  id: number;
  title: string;
  club_name: string;
  participant_count: number;
  max_participants: number;
  start_time: string;
  end_time: string;
  status: number;
}

export default function ActivityStats() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activityStats, setActivityStats] = useState<ActivityStat[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  // 添加统计用的额外状态
  const [activityByStatus, setActivityByStatus] = useState<{[key: string]: number}>({});
  const [participationTrend, setParticipationTrend] = useState<{date: string, count: number}[]>([]);
  const [topClubs, setTopClubs] = useState<{name: string, count: number}[]>([]);
  const [participationByWeekday, setParticipationByWeekday] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const { message: messageApi, notification } = App.useApp();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      messageApi.error('请先登录');
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        messageApi.error('登录已过期，请重新登录');
        router.push('/login');
        return;
      }

      // 只有管理员可以访问
      const role = decoded.role;
      if (role !== 0) {
        messageApi.error('您没有管理员权限');
        router.push('/login');
        return;
      }

      fetchData(token);
    } catch (error) {
      messageApi.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchData = async (token: string) => {
    try {
      setLoading(true);
      let url = 'http://localhost:8080/api/activities/stats';
      
      // 构建查询参数
      const params: any = {};
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      if (statusFilter !== null) {
        params.status = statusFilter;
      }
      
      const response = await axios.get(url, {
        headers: { 'x-access-token': token },
        params
      });

      if (response.data.success) {
        const stats = response.data.data;
        setActivityStats(stats.activities);
        setTotalActivities(stats.total_activities);
        setTotalParticipants(stats.total_participants);
        setCompletionRate(stats.completion_rate);
        
        // 处理额外的统计数据
        processStatisticsData(stats.activities);
      }
    } catch (error) {
      console.error('获取活动统计数据失败:', error);
      notification.error({
        message: '获取活动统计数据失败',
        description: '请检查网络连接或联系管理员',
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理统计数据
  const processStatisticsData = (activities: ActivityStat[]) => {
    // 活动状态统计
    const statusCount: {[key: string]: number} = {
      '待审批': 0,
      '已通过': 0,
      '已拒绝': 0,
      '已完成': 0,
      '已取消': 0
    };
    
    // 社团活动数统计
    const clubsCount: {[key: string]: number} = {};
    
    // 参与趋势数据 (最近14天)
    const trendData: {[key: string]: number} = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendData[dateStr] = 0;
    }
    
    // 星期几参与统计
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // 周日-周六
    
    activities.forEach(activity => {
      // 状态统计
      const statusText = getStatusTag(activity.status);
      statusCount[statusText] = (statusCount[statusText] || 0) + 1;
      
      // 社团统计
      clubsCount[activity.club_name] = (clubsCount[activity.club_name] || 0) + 1;
      
      // 按日期统计参与人数
      const activityDate = new Date(activity.start_time).toISOString().split('T')[0];
      if (trendData[activityDate] !== undefined) {
        trendData[activityDate] += activity.participant_count;
      }
      
      // 星期几统计
      const weekday = new Date(activity.start_time).getDay(); // 0-6 (周日-周六)
      weekdayCounts[weekday] += activity.participant_count;
    });
    
    // 准备图表数据
    setActivityByStatus(statusCount);
    
    // 参与趋势
    const trendArray = Object.entries(trendData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));
    setParticipationTrend(trendArray);
    
    // Top 5社团
    const topClubsArray = Object.entries(clubsCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopClubs(topClubsArray);
    
    // 星期参与统计
    setParticipationByWeekday(weekdayCounts);
  };

  const handleSearch = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData(token);
    }
  };

  const handleReset = () => {
    setDateRange(null);
    setStatusFilter(null);
    const token = localStorage.getItem('token');
    if (token) {
      fetchData(token);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return '待审批';
      case 1:
        return '已通过';
      case 2:
        return '已拒绝';
      case 3:
        return '已完成';
      case 4:
        return '已取消';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return '#faad14'; // 黄色
      case 1:
        return '#52c41a'; // 绿色
      case 2:
        return '#f5222d'; // 红色
      case 3:
        return '#1890ff'; // 蓝色
      case 4:
        return '#d9d9d9'; // 灰色
      default:
        return '#d9d9d9';
    }
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '社团',
      dataIndex: 'club_name',
      key: 'club_name',
    },
    {
      title: '参与人数',
      dataIndex: 'participant_count',
      key: 'participant_count',
      render: (count: number, record: ActivityStat) => `${count}/${record.max_participants}`,
      sorter: (a: ActivityStat, b: ActivityStat) => a.participant_count - b.participant_count,
    },
    {
      title: '参与率',
      key: 'participation_rate',
      render: (_: any, record: ActivityStat) => 
        `${Math.round((record.participant_count / record.max_participants) * 100)}%`,
      sorter: (a: ActivityStat, b: ActivityStat) => 
        (a.participant_count / a.max_participants) - (b.participant_count / b.max_participants),
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a: ActivityStat, b: ActivityStat) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => getStatusTag(status),
    },
  ];

  // 饼图 - 活动状态分布选项
  const getStatusPieOption = () => {
    return {
      title: {
        text: '活动状态分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: Object.keys(activityByStatus)
      },
      series: [
        {
          name: '活动状态',
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
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: Object.entries(activityByStatus).map(([name, value]) => ({
            name,
            value
          }))
        }
      ]
    };
  };

  // 柱状图 - 热门社团选项
  const getTopClubsOption = () => {
    return {
      title: {
        text: '活动数量最多的社团',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: topClubs.map(club => club.name),
        axisLabel: {
          rotate: 30,
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '活动数量'
      },
      series: [
        {
          name: '活动数量',
          type: 'bar',
          data: topClubs.map(club => club.count),
          itemStyle: {
            color: '#1890ff'
          }
        }
      ]
    };
  };

  // 折线图 - 参与趋势选项
  const getTrendOption = () => {
    return {
      title: {
        text: '近14天参与人数趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: participationTrend.map(item => item.date),
        axisLabel: {
          rotate: 45,
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '参与人数'
      },
      series: [
        {
          name: '参与人数',
          type: 'line',
          smooth: true,
          data: participationTrend.map(item => item.count),
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(24, 144, 255, 0.8)'
                },
                {
                  offset: 1,
                  color: 'rgba(24, 144, 255, 0.1)'
                }
              ]
            }
          },
          itemStyle: {
            color: '#1890ff'
          }
        }
      ]
    };
  };

  // 雷达图 - 星期分布选项
  const getWeekdayOption = () => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return {
      title: {
        text: '活动参与按星期分布',
        left: 'center'
      },
      tooltip: {},
      radar: {
        indicator: weekdays.map(day => ({ name: day, max: Math.max(...participationByWeekday) * 1.2 }))
      },
      series: [
        {
          name: '参与人数',
          type: 'radar',
          data: [
            {
              value: participationByWeekday,
              name: '按星期分布',
              areaStyle: {
                color: 'rgba(255, 122, 69, 0.6)'
              },
              lineStyle: {
                color: 'rgba(255, 122, 69, 0.8)'
              },
              itemStyle: {
                color: '#ff7a45'
              }
            }
          ]
        }
      ]
    };
  };

  return (
    <App>
      <div style={{ padding: '24px' }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="活动总数"
                value={totalActivities}
                prefix={<CalendarOutlined style={{ color: '#1890ff' }}/>}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="总参与人次"
                value={totalParticipants}
                prefix={<TeamOutlined style={{ color: '#52c41a' }}/>}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="平均完成率"
                value={completionRate}
                precision={2}
                suffix="%"
                prefix={<RiseOutlined style={{ color: '#faad14' }}/>}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="活动热度"
                value={totalParticipants > 0 ? (totalParticipants / totalActivities).toFixed(2) : 0}
                prefix={<FireOutlined style={{ color: '#f5222d' }}/>}
                valueStyle={{ color: '#f5222d' }}
                suffix="人/活动"
              />
            </Card>
          </Col>
        </Row>

        <Card 
          style={{ marginBottom: 16 }}
          extra={
            <Space>
              <RangePicker 
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              />
              <Select
                placeholder="活动状态"
                style={{ width: 120 }}
                allowClear
                value={statusFilter}
                onChange={value => setStatusFilter(value)}
              >
                <Option value={0}>待审批</Option>
                <Option value={1}>已通过</Option>
                <Option value={2}>已拒绝</Option>
                <Option value={3}>已完成</Option>
                <Option value={4}>已取消</Option>
              </Select>
              <Button type="primary" onClick={handleSearch}>查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          }
        >
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={<span><BarChartOutlined />数据图表</span>}
              key="1"
            >
              <div style={{ height: '16px' }}></div>
              <Row gutter={16}>
                <Col span={12}>
                  <Card>
                    <ReactECharts option={getStatusPieOption()} style={{ height: 300 }} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <ReactECharts option={getTopClubsOption()} style={{ height: 300 }} />
                  </Card>
                </Col>
              </Row>
              <div style={{ height: '16px' }}></div>
              <Row gutter={16}>
                <Col span={12}>
                  <Card>
                    <ReactECharts option={getTrendOption()} style={{ height: 300 }} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <ReactECharts option={getWeekdayOption()} style={{ height: 300 }} />
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane
              tab={<span><TableOutlined />详细数据</span>}
              key="2"
            >
              <Table
                columns={columns}
                dataSource={activityStats}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </App>
  );
} 