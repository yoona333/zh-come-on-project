-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role TINYINT NOT NULL COMMENT '0:管理员, 1:学生, 2:社长',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 社团表
CREATE TABLE IF NOT EXISTS clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id)
);

-- 社团成员表
CREATE TABLE IF NOT EXISTS club_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    user_id INT NOT NULL,
    role TINYINT NOT NULL COMMENT '1:普通成员, 2:社长',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1:正常, 0:已退出',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_member (club_id, user_id)
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    club_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    max_participants INT NOT NULL,
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:待审批, 1:已通过, 2:已拒绝',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- 活动参与记录表
CREATE TABLE IF NOT EXISTS activity_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    user_id INT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1:已报名, 2:已签到, 3:已取消',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_participation (activity_id, user_id)
);

-- 积分记录表
CREATE TABLE IF NOT EXISTS points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_id INT,
    points INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- 积分兑换记录表
CREATE TABLE IF NOT EXISTS points_exchange_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT,
    points INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 产品/奖品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    description TEXT,
    points_required INT NOT NULL,
    image VARCHAR(255),
    remaining_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1. 添加用户数据
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 0),  -- 管理员
('zhangsan', '123456', 1), -- 学生
('lisi', '123456', 1),     -- 学生
('wangwu', '123456', 1),   -- 学生
('zhaoliu', '123456', 1),  -- 学生
('qianqi', '123456', 1),   -- 学生
('sunba', '123456', 1),    -- 学生
('zhoujiu', '123456', 1),  -- 学生
('wushi', '123456', 1);    -- 学生

-- 2. 添加社团数据
INSERT INTO clubs (name, description, leader_id) VALUES
('计算机协会', '计算机技术交流与学习', 2),  -- 社长：zhangsan
('音乐社', '音乐创作与表演', 3),           -- 社长：lisi
('篮球社', '篮球运动与比赛', 4),           -- 社长：wangwu
('志愿者协会', '志愿服务与公益活动', 5),    -- 社长：zhaoliu
('创业协会', '创新创业与项目孵化', 6);      -- 社长：qianqi

-- 3. 添加社团成员数据
INSERT INTO club_members (club_id, user_id, role) VALUES
-- 计算机协会成员
(1, 2, 2),  -- zhangsan 是社长
(1, 3, 1),  -- lisi 是普通成员
(1, 4, 1),  -- wangwu 是普通成员

-- 音乐社成员
(2, 3, 2),  -- lisi 是社长
(2, 5, 1),  -- zhaoliu 是普通成员
(2, 6, 1),  -- qianqi 是普通成员

-- 篮球社成员
(3, 4, 2),  -- wangwu 是社长
(3, 7, 1),  -- sunba 是普通成员
(3, 8, 1),  -- zhoujiu 是普通成员

-- 志愿者协会成员
(4, 5, 2),  -- zhaoliu 是社长
(4, 9, 1),  -- wushi 是普通成员
(4, 2, 1),  -- zhangsan 是普通成员

-- 创业协会成员
(5, 6, 2),  -- qianqi 是社长
(5, 3, 1),  -- lisi 是普通成员
(5, 4, 1);  -- wangwu 是普通成员

-- 4. 添加活动数据
INSERT INTO activities (title, description, club_id, start_time, end_time, location, max_participants, status) VALUES
('校园歌唱比赛', '校园歌手大赛决赛', 2, '2024-03-15 19:00:00', '2024-03-15 22:00:00', '大礼堂', 200, 1),
('程序设计大赛', 'ACM程序设计竞赛', 1, '2024-03-20 09:00:00', '2024-03-20 17:00:00', '计算机楼', 100, 1),
('篮球友谊赛', '校际篮球友谊赛', 3, '2024-03-25 15:00:00', '2024-03-25 17:00:00', '体育馆', 50, 0),
('志愿者服务日', '社区志愿服务', 4, '2024-03-28 08:00:00', '2024-03-28 17:00:00', '社区中心', 30, 0),
('创业讲座', '大学生创业经验分享', 5, '2024-04-01 14:00:00', '2024-04-01 16:00:00', '报告厅', 150, 1),
('音乐节', '校园音乐节', 2, '2024-04-05 18:00:00', '2024-04-05 22:00:00', '操场', 500, 0),
('编程工作坊', 'Python编程入门', 1, '2024-04-10 13:00:00', '2024-04-10 16:00:00', '计算机楼', 40, 1);

-- 5. 添加活动参与记录
INSERT INTO activity_participants (activity_id, user_id, status) VALUES
(1, 2, 1),  -- zhangsan 参加歌唱比赛
(1, 3, 1),  -- lisi 参加歌唱比赛
(2, 4, 1),  -- wangwu 参加程序设计大赛
(2, 5, 1),  -- zhaoliu 参加程序设计大赛
(3, 6, 1),  -- qianqi 参加篮球友谊赛
(3, 7, 1),  -- sunba 参加篮球友谊赛
(4, 8, 1),  -- zhoujiu 参加志愿者服务
(4, 9, 1),  -- wushi 参加志愿者服务
(5, 2, 1),  -- zhangsan 参加创业讲座
(5, 3, 1);  -- lisi 参加创业讲座

-- 6. 添加积分记录
INSERT INTO points (user_id, activity_id, points, description) VALUES
(2, 1, 10, '参加校园歌唱比赛'),
(3, 1, 10, '参加校园歌唱比赛'),
(4, 2, 15, '参加程序设计大赛'),
(5, 2, 15, '参加程序设计大赛'),
(6, 3, 8, '参加篮球友谊赛'),
(7, 3, 8, '参加篮球友谊赛'),
(8, 4, 12, '参加志愿者服务'),
(9, 4, 12, '参加志愿者服务'),
(2, 5, 5, '参加创业讲座'),
(3, 5, 5, '参加创业讲座'); 

ALTER TABLE activities 
ADD COLUMN points INT DEFAULT 0,
ADD COLUMN tags VARCHAR(255),
ADD COLUMN contact VARCHAR(100);
ALTER TABLE club_members ADD COLUMN join_date DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users ADD COLUMN avatar VARCHAR(255);



-- 添加用户个人信息相关字段
ALTER TABLE users 
ADD COLUMN email VARCHAR(100),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN department VARCHAR(100),
ADD COLUMN major VARCHAR(100),
ADD COLUMN grade VARCHAR(20),
ADD COLUMN class VARCHAR(50),
ADD COLUMN address VARCHAR(200),
ADD COLUMN bio TEXT;

-- 更新现有用户数据添加示例信息
UPDATE users SET 
email = 'admin@example.com',
phone = '13800000000',
department = '系统管理部门',
bio = '系统管理员，负责整个系统的运营管理。'
WHERE username = 'admin';

UPDATE users SET 
email = 'zhangsan@student.edu.cn',
phone = '13811111111',
department = '计算机科学与技术学院',
major = '软件工程',
grade = '2021级',
class = '软工2班',
address = '学生公寓3号楼422室',
bio = '热爱编程和设计，喜欢参加各种校园活动。'
WHERE username = 'zhangsan';

UPDATE users SET 
email = 'lisi@student.edu.cn',
phone = '13822222222',
department = '音乐学院',
major = '音乐表演',
grade = '2022级',
class = '音乐2班',
address = '学生公寓5号楼308室',
bio = '音乐爱好者，擅长钢琴和吉他。'
WHERE username = 'lisi';

UPDATE users SET 
email = 'wangwu@student.edu.cn',
phone = '13833333333',
department = '体育学院',
major = '体育教育',
grade = '2021级',
class = '体教1班',
address = '学生公寓2号楼516室',
bio = '篮球爱好者，校篮球队队长。'
WHERE username = 'wangwu';

UPDATE users SET 
email = 'zhaoliu@student.edu.cn',
phone = '13844444444',
department = '社会学院',
major = '社会工作',
grade = '2022级',
class = '社工1班',
address = '学生公寓6号楼203室',
bio = '热心公益，志愿者协会核心成员。'
WHERE username = 'zhaoliu';

UPDATE users SET 
email = 'qianqi@student.edu.cn',
phone = '13855555555',
department = '商学院',
major = '市场营销',
grade = '2020级',
class = '营销3班',
address = '学生公寓1号楼108室',
bio = '对创业和商业模式非常感兴趣，多次参加创业比赛。'
WHERE username = 'qianqi';

UPDATE users SET 
email = 'sunba@student.edu.cn',
phone = '13866666666',
department = '体育学院',
major = '运动训练',
grade = '2023级',
class = '运训2班',
address = '学生公寓4号楼411室',
bio = '篮球和足球都很擅长，经常参加学校比赛。'
WHERE username = 'sunba';

UPDATE users SET 
email = 'zhoujiu@student.edu.cn',
phone = '13877777777',
department = '数学学院',
major = '应用数学',
grade = '2022级',
class = '数学1班',
address = '学生公寓7号楼302室',
bio = '喜欢数学和逻辑思维，同时热爱运动。'
WHERE username = 'zhoujiu';

UPDATE users SET 
email = 'wushi@student.edu.cn',
phone = '13888888888',
department = '社会学院',
major = '公共管理',
grade = '2021级',
class = '公管2班',
address = '学生公寓8号楼105室',
bio = '关注社会问题，积极参与志愿服务活动。'
WHERE username = 'wushi';

-- 给新增用户添加信息
UPDATE users SET 
email = 'luoshiyi@student.edu.cn',
phone = '13899999999',
department = '艺术学院',
major = '美术设计',
grade = '2023级',
class = '设计1班',
address = '学生公寓9号楼215室',
bio = '擅长平面设计，喜欢创作和艺术表达。'
WHERE username = 'luoshiyi';

-- 为用户添加默认头像
UPDATE users SET avatar = CONCAT('/avatars/default_', id % 5 + 1, '.png');


-- 1. 先更新用户表，设置中文名
UPDATE users SET username = '张三' WHERE id = 2 AND username = 'zhangsan';
UPDATE users SET username = '李四' WHERE id = 3 AND username = 'lisi';
UPDATE users SET username = '王五' WHERE id = 4 AND username = 'wangwu';
UPDATE users SET username = '赵六' WHERE id = 5 AND username = 'zhaoliu';
UPDATE users SET username = '钱七' WHERE id = 6 AND username = 'qianqi';
UPDATE users SET username = '孙八' WHERE id = 7 AND username = 'sunba';
UPDATE users SET username = '周九' WHERE id = 8 AND username = 'zhoujiu';
UPDATE users SET username = '吴十' WHERE id = 9 AND username = 'wushi';
UPDATE users SET username = '罗师一' WHERE id = 10 AND username = 'luoshiyi';
UPDATE users SET username = '管理员' WHERE id = 1 AND username = 'admin';

-- 2. 新增更多用户数据（使用中文名）
INSERT INTO users (username, password, role, created_at, email, phone, department, major, grade, class, address, bio) VALUES
('程希', '123456', 1, NOW(), 'chengxi@student.edu.cn', '13700001111', '文学院', '汉语言文学', '2022级', '汉语2班', '学生公寓10号楼108室', '喜欢文学创作，曾获校级写作比赛一等奖。'),
('郭伟', '123456', 1, NOW(), 'guowei@student.edu.cn', '13700002222', '物理学院', '应用物理', '2021级', '物理1班', '学生公寓11号楼212室', '对物理实验和理论研究充满热情。'),
('江明', '123456', 1, NOW(), 'jiangming@student.edu.cn', '13700003333', '化学学院', '应用化学', '2023级', '化学3班', '学生公寓12号楼305室', '化学实验能手，喜欢钻研新材料。'),
('何林', '123456', 1, NOW(), 'helin@student.edu.cn', '13700004444', '外国语学院', '英语', '2022级', '英语4班', '学生公寓13号楼407室', '英语口语流利，热爱英美文学。'),
('杨慧', '123456', 1, NOW(), 'yanghui@student.edu.cn', '13700005555', '经济学院', '国际经济与贸易', '2021级', '国贸2班', '学生公寓14号楼509室', '对经济学和金融市场有深入研究。'),
('张敏', '123456', 1, NOW(), 'zhangmin@student.edu.cn', '13700006666', '管理学院', '工商管理', '2022级', '工管1班', '学生公寓15号楼601室', '有较强的组织和领导能力，参与多个学生组织。'),
('林宏', '123456', 1, NOW(), 'linhong@student.edu.cn', '13700007777', '医学院', '临床医学', '2020级', '临床3班', '学生公寓16号楼702室', '有志于从医，经常参加医疗志愿活动。'),
('王晨', '123456', 1, NOW(), 'wangchen@student.edu.cn', '13700008888', '法学院', '法学', '2021级', '法学2班', '学生公寓17号楼803室', '对法律案例分析有浓厚兴趣，参加过模拟法庭比赛。'),
('赵军', '123456', 1, NOW(), 'zhaojun@student.edu.cn', '13700009999', '建筑学院', '建筑设计', '2022级', '建筑1班', '学生公寓18号楼904室', '擅长建筑设计，作品曾在校展中展出。'),
('刘洋', '123456', 1, NOW(), 'liuyang@student.edu.cn', '13711111111', '电子信息学院', '通信工程', '2021级', '通信2班', '学生公寓19号楼105室', '对通信技术和信号处理有浓厚兴趣。'),
('陈佳', '123456', 1, NOW(), 'chenjia@student.edu.cn', '13722222222', '环境学院', '环境工程', '2023级', '环工1班', '学生公寓20号楼208室', '关注环保问题，积极参与环保活动。'),
('马腾', '123456', 1, NOW(), 'mateng@student.edu.cn', '13733333333', '机械学院', '机械设计', '2022级', '机设3班', '学生公寓21号楼301室', '机械创新设计爱好者，参加过多项竞赛。'),
('黄婷', '123456', 1, NOW(), 'huangting@student.edu.cn', '13744444444', '美术学院', '视觉传达', '2021级', '视传2班', '学生公寓22号楼405室', '擅长设计和绘画，作品多次获奖。'),
('徐亮', '123456', 1, NOW(), 'xuliang@student.edu.cn', '13755555555', '教育学院', '教育技术', '2022级', '教技1班', '学生公寓23号楼507室', '对教育创新和科技融合有独到见解。'),
('朱晓', '123456', 1, NOW(), 'zhuxiao@student.edu.cn', '13766666666', '数学学院', '统计学', '2023级', '统计3班', '学生公寓24号楼609室', '数据分析能力强，热爱数学建模。');

-- 确保新用户有头像
UPDATE users SET avatar = CONCAT('/avatars/default_', id % 5 + 1, '.png') WHERE avatar IS NULL;

-- 3. 更新activities表中的老师姓名格式
UPDATE activities SET contact = '李明老师 13912345678' WHERE id = 1;
UPDATE activities SET contact = '王强教授 13812345678' WHERE id = 2;
UPDATE activities SET contact = '张伟教练 13712345678' WHERE id = 3;
UPDATE activities SET contact = '赵娜老师 13612345678' WHERE id = 4;
UPDATE activities SET contact = '钱宇教授 13512345678' WHERE id = 5;
UPDATE activities SET contact = '孙雨老师 13412345678' WHERE id = 6;
UPDATE activities SET contact = '周刚老师 13312345678' WHERE id = 7;

-- 4. 新增更多activities数据（包含完整的老师姓名）
INSERT INTO activities (title, description, club_id, start_time, end_time, location, max_participants, status, points, tags, contact) VALUES
('摄影展', '校园风光摄影作品展', 4, '2024-04-15 10:00:00', '2024-04-17 18:00:00', '艺术馆', 100, 1, 6, '摄影,艺术,展览', '吴凡老师 13212345678'),
('创业沙龙', '创业经验交流会', 5, '2024-04-20 14:00:00', '2024-04-20 17:00:00', '会议中心', 50, 1, 7, '创业,交流,沙龙', '郑浩教授 13112345678'),
('算法讲座', '高级算法与数据结构', 1, '2024-04-22 15:00:00', '2024-04-22 17:00:00', '计算机楼报告厅', 80, 1, 8, '算法,讲座,技术', '冯华教授 13012345678'),
('合唱比赛', '校合唱团选拔赛', 2, '2024-04-25 18:30:00', '2024-04-25 21:00:00', '音乐厅', 60, 1, 9, '音乐,合唱,选拔', '陈琳老师 18812345678'),
('足球联赛', '院系足球友谊赛', 3, '2024-04-28 14:00:00', '2024-04-28 16:00:00', '足球场', 60, 1, 7, '足球,体育,比赛', '杨波教练 18712345678'),
('爱心募捐', '贫困地区儿童爱心捐赠活动', 4, '2024-05-01 09:00:00', '2024-05-03 17:00:00', '学生中心', 80, 1, 10, '公益,捐赠,爱心', '徐婷老师 18612345678'),
('投资讲座', '大学生理财与投资指南', 5, '2024-05-05 14:30:00', '2024-05-05 16:30:00', '经济学院报告厅', 120, 1, 6, '投资,理财,讲座', '朱国教授 18512345678'),
('黑客马拉松', '24小时编程挑战赛', 1, '2024-05-11 12:00:00', '2024-05-12 12:00:00', '创新中心', 50, 1, 20, '编程,比赛,黑客松', '魏明教授 18412345678'),
('民乐表演', '传统民族乐器演奏会', 2, '2024-05-15 19:00:00', '2024-05-15 21:00:00', '大礼堂', 150, 1, 7, '音乐,民乐,表演', '秦艺老师 18312345678'),
('羽毛球赛', '校园羽毛球锦标赛', 3, '2024-05-18 09:00:00', '2024-05-19 17:00:00', '体育馆', 40, 1, 9, '羽毛球,体育,比赛', '孔健教练 18212345678'),
('环保行动', '校园环境保护志愿活动', 4, '2024-05-22 14:00:00', '2024-05-22 17:00:00', '校园各处', 100, 1, 8, '环保,志愿,公益', '谭绿老师 18112345678'),
('创业大赛', '大学生创业计划比赛', 5, '2024-05-25 08:30:00', '2024-05-26 17:30:00', '商学院', 80, 1, 15, '创业,比赛,创新', '姚远教授 18012345678'),
('软件开发讲座', '前端开发技术讲解', 1, '2024-05-28 15:00:00', '2024-05-28 17:00:00', '计算机楼', 70, 1, 8, '软件,前端,讲座', '宋杰教授 17912345678'),
('电影沙龙', '经典电影赏析与讨论', 2, '2024-06-01 19:00:00', '2024-06-01 22:00:00', '文化中心', 60, 1, 5, '电影,文化,讨论', '方亮老师 17812345678'),
('乒乓球赛', '校园乒乓球挑战赛', 3, '2024-06-05 14:00:00', '2024-06-05 18:00:00', '体育馆', 32, 1, 8, '乒乓,体育,比赛', '刘强教练 17712345678'),
('心理健康讲座', '大学生心理健康与压力管理', 4, '2024-06-10 15:30:00', '2024-06-10 17:30:00', '心理咨询中心', 80, 1, 6, '心理,健康,讲座', '田心老师 17612345678'),
('人工智能论坛', 'AI技术前沿与应用探讨', 1, '2024-06-15 09:00:00', '2024-06-15 17:00:00', '科技楼报告厅', 120, 1, 10, 'AI,技术,论坛', '高智教授 17512345678'),
('舞蹈比赛', '校园舞蹈大赛', 2, '2024-06-20 18:30:00', '2024-06-20 21:30:00', '艺术中心', 40, 1, 12, '舞蹈,艺术,比赛', '林舞老师 17412345678'),
('志愿者培训', '志愿服务技能培训课程', 4, '2024-06-25 14:00:00', '2024-06-25 17:00:00', '志愿者中心', 50, 1, 7, '志愿,培训,服务', '何爱老师 17312345678'),
('就业指导讲座', '大学生就业策略与简历制作', 5, '2024-06-30 10:00:00', '2024-06-30 12:00:00', '就业中心', 100, 1, 8, '就业,指导,简历', '曾才教授 17212345678');

-- 5. 新增更多社团成员数据
INSERT INTO club_members (club_id, user_id, role, join_date) VALUES
-- 计算机协会新成员
(1, 11, 1, '2023-09-10'), -- 程希
(1, 12, 1, '2023-09-15'), -- 郭伟
(1, 13, 1, '2023-10-01'), -- 江明
(1, 20, 1, '2023-10-12'), -- 刘洋
(1, 22, 1, '2023-11-05'), -- 马腾
(1, 25, 1, '2023-11-15'), -- 朱晓

-- 音乐社新成员
(2, 14, 1, '2023-09-05'), -- 何林
(2, 15, 1, '2023-09-20'), -- 杨慧
(2, 16, 1, '2023-10-15'), -- 张敏
(2, 21, 1, '2023-10-25'), -- 陈佳
(2, 23, 1, '2023-11-10'), -- 黄婷
(2, 24, 1, '2023-11-30'), -- 徐亮

-- 篮球社新成员
(3, 17, 1, '2023-09-02'), -- 林宏
(3, 18, 1, '2023-09-18'), -- 王晨
(3, 19, 1, '2023-10-08'), -- 赵军
(3, 12, 1, '2023-10-22'), -- 郭伟
(3, 15, 1, '2023-11-03'), -- 杨慧
(3, 24, 1, '2023-11-20'), -- 徐亮

-- 志愿者协会新成员
(4, 20, 1, '2023-09-12'), -- 刘洋
(4, 11, 1, '2023-09-25'), -- 程希
(4, 12, 1, '2023-10-05'), -- 郭伟
(4, 13, 1, '2023-10-20'), -- 江明
(4, 16, 1, '2023-11-08'), -- 张敏
(4, 23, 1, '2023-11-25'), -- 黄婷

-- 创业协会新成员
(5, 13, 1, '2023-09-08'), -- 江明
(5, 14, 1, '2023-09-22'), -- 何林
(5, 15, 1, '2023-10-12'), -- 杨慧
(5, 17, 1, '2023-10-30'), -- 林宏
(5, 18, 1, '2023-11-12'), -- 王晨
(5, 22, 1, '2023-11-28'); -- 马腾

-- 6. 新增更多活动参与记录
INSERT INTO activity_participants (activity_id, user_id, status) VALUES
-- 校园歌唱比赛参与者
(1, 11, 1), -- 程希
(1, 14, 1), -- 何林
(1, 17, 1), -- 林宏
(1, 21, 1), -- 陈佳
(1, 23, 1), -- 黄婷
(1, 24, 1), -- 徐亮

-- 程序设计大赛参与者
(2, 12, 1), -- 郭伟
(2, 15, 1), -- 杨慧
(2, 19, 1), -- 赵军
(2, 20, 1), -- 刘洋
(2, 22, 1), -- 马腾
(2, 25, 1), -- 朱晓

-- 篮球友谊赛参与者
(3, 13, 1), -- 江明
(3, 16, 1), -- 张敏
(3, 18, 1), -- 王晨
(3, 12, 1), -- 郭伟
(3, 24, 1), -- 徐亮
(3, 22, 1), -- 马腾

-- 志愿者服务日参与者
(4, 14, 1), -- 何林
(4, 17, 1), -- 林宏
(4, 20, 1), -- 刘洋
(4, 11, 1), -- 程希
(4, 16, 1), -- 张敏
(4, 23, 1), -- 黄婷

-- 创业讲座参与者
(5, 15, 1), -- 杨慧
(5, 18, 1), -- 王晨
(5, 11, 1), -- 程希
(5, 13, 1), -- 江明
(5, 17, 1), -- 林宏
(5, 22, 1), -- 马腾

-- 音乐节参与者
(6, 16, 1), -- 张敏
(6, 19, 1), -- 赵军
(6, 12, 1), -- 郭伟
(6, 14, 1), -- 何林
(6, 21, 1), -- 陈佳
(6, 23, 1), -- 黄婷

-- 编程工作坊参与者
(7, 17, 1), -- 林宏
(7, 20, 1), -- 刘洋
(7, 13, 1), -- 江明
(7, 12, 1), -- 郭伟
(7, 25, 1), -- 朱晓
(7, 22, 1), -- 马腾

-- 摄影展参与者
(8, 11, 1), -- 程希
(8, 14, 1), -- 何林
(8, 17, 1), -- 林宏
(8, 19, 1), -- 赵军
(8, 23, 1), -- 黄婷
(8, 21, 1), -- 陈佳

-- 创业沙龙参与者
(9, 12, 1), -- 郭伟
(9, 15, 1), -- 杨慧
(9, 18, 1), -- 王晨
(9, 13, 1), -- 江明
(9, 17, 1), -- 林宏
(9, 22, 1), -- 马腾

-- 算法讲座参与者
(10, 13, 1), -- 江明
(10, 16, 1), -- 张敏
(10, 19, 1), -- 赵军
(10, 20, 1), -- 刘洋
(10, 25, 1), -- 朱晓
(10, 12, 1), -- 郭伟

-- 合唱比赛参与者
(11, 14, 1), -- 何林
(11, 21, 1), -- 陈佳
(11, 23, 1), -- 黄婷
(11, 11, 1), -- 程希
(11, 16, 1), -- 张敏
(11, 24, 1), -- 徐亮

-- 足球联赛参与者
(12, 15, 1), -- 杨慧
(12, 18, 1), -- 王晨
(12, 22, 1), -- 马腾
(12, 12, 1), -- 郭伟
(12, 17, 1), -- 林宏
(12, 19, 1); -- 赵军

-- 7. 新增更多积分记录
INSERT INTO points (user_id, activity_id, points, description) VALUES
-- 校园歌唱比赛积分
(11, 1, 10, '参加校园歌唱比赛'),
(14, 1, 10, '参加校园歌唱比赛'),
(17, 1, 10, '参加校园歌唱比赛'),
(21, 1, 10, '参加校园歌唱比赛'),
(23, 1, 10, '参加校园歌唱比赛'),
(24, 1, 10, '参加校园歌唱比赛'),

-- 程序设计大赛积分
(12, 2, 15, '参加程序设计大赛'),
(15, 2, 15, '参加程序设计大赛'),
(19, 2, 15, '参加程序设计大赛'),
(20, 2, 15, '参加程序设计大赛'),
(22, 2, 15, '参加程序设计大赛'),
(25, 2, 15, '参加程序设计大赛'),

-- 篮球友谊赛积分
(13, 3, 8, '参加篮球友谊赛'),
(16, 3, 8, '参加篮球友谊赛'),
(18, 3, 8, '参加篮球友谊赛'),
(12, 3, 8, '参加篮球友谊赛'),
(24, 3, 8, '参加篮球友谊赛'),
(22, 3, 8, '参加篮球友谊赛'),

-- 志愿者服务日积分
(14, 4, 12, '参加志愿者服务'),
(17, 4, 12, '参加志愿者服务'),
(20, 4, 12, '参加志愿者服务'),
(11, 4, 12, '参加志愿者服务'),
(16, 4, 12, '参加志愿者服务'),
(23, 4, 12, '参加志愿者服务'),

-- 创业讲座积分
(15, 5, 5, '参加创业讲座'),
(18, 5, 5, '参加创业讲座'),
(11, 5, 5, '参加创业讲座'),
(13, 5, 5, '参加创业讲座'),
(17, 5, 5, '参加创业讲座'),
(22, 5, 5, '参加创业讲座');

-- 添加一些奖励积分记录
INSERT INTO points (user_id, activity_id, points, description) VALUES
(2, 1, 15, '歌唱比赛一等奖'),
(3, 1, 10, '歌唱比赛二等奖'),
(4, 2, 20, '程序设计大赛特等奖'),
(5, 2, 15, '程序设计大赛一等奖'),
(6, 2, 10, '程序设计大赛二等奖'),
(7, 3, 12, '篮球友谊赛最有价值球员'),
(8, 3, 8, '篮球友谊赛最佳防守球员'),
(9, 4, 15, '志愿服务优秀志愿者'),
(11, 1, 12, '歌唱比赛最佳人气奖'),
(14, 1, 15, '歌唱比赛一等奖'),
(23, 1, 10, '歌唱比赛二等奖'),
(12, 2, 15, '程序设计大赛一等奖'),
(20, 2, 10, '程序设计大赛二等奖'),
(25, 2, 10, '程序设计大赛最佳创意奖'),
(13, 3, 8, '篮球友谊赛最佳进步奖'),
(18, 3, 10, '篮球友谊赛最佳组织奖'),
(14, 4, 10, '志愿服务贡献奖'),
(20, 4, 15, '志愿服务最长时间奖'),
(15, 5, 8, '创业讲座优秀提问奖'),
(11, 5, 10, '创业讲座最佳创业计划奖');

-- 添加更多类型的积分记录
INSERT INTO points (user_id, activity_id, points, description) VALUES
(16, NULL, 20, '担任学生会干部学期奖励'),
(17, NULL, 15, '参与校园环保活动'),
(18, NULL, 10, '协助组织迎新晚会'),
(19, NULL, 12, '参加校外学术交流活动'),
(20, NULL, 18, '代表学校参加省级比赛'),
(21, NULL, 15, '协助老师完成科研项目'),
(22, NULL, 10, '参与校园文化建设'),
(23, NULL, 8, '班级活动组织'),
(24, NULL, 12, '协助图书馆整理工作'),
(25, NULL, 20, '学术论文发表奖励'),
(11, NULL, 15, '参与开放日校园导览'),
(12, NULL, 10, '帮助新生入学指导'),
(13, NULL, 12, '参与学院迎新工作'),
(14, NULL, 8, '担任课程助教'),
(15, NULL, 10, '参与校园安全宣传'),
(2, NULL, 25, '学年优秀学生干部'),
(3, NULL, 30, '校级优秀学生'),
(4, NULL, 20, '学术创新奖'),
(5, NULL, 15, '社会实践优秀个人'),
(6, NULL, 18, '体育比赛校级冠军');


-- 为每个社团保留创建最早的一个社长，其他改为普通成员
CREATE TEMPORARY TABLE temp_leaders AS
SELECT club_id, MIN(id) as keeper_id
FROM club_members
WHERE role = 2
GROUP BY club_id;

UPDATE club_members cm
JOIN temp_leaders tl ON cm.club_id = tl.club_id
SET cm.role = 1
WHERE cm.role = 2 AND cm.id != tl.keeper_id;

DROP TEMPORARY TABLE temp_leaders;

