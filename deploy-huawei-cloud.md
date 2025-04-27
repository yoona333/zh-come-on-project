# 华为云服务器部署指南 - come-on-project

本文档提供了如何将 come-on-project（前后端整合项目）部署到华为云 ECS（弹性云服务器）的详细步骤。

## 1. 环境准备

### 1.1 确认华为云服务器信息
- 公网IP: 123.60.165.250
- 服务器ID: b05c05fa-fa5b-4f9f-8159-f2c38d91360d
- 私有IP: 192.168.0.41

### 1.2 登录服务器
使用 SSH 客户端连接到华为云服务器：
```bash
ssh root@123.60.165.250
```

请确保你有正确的用户名和密码或密钥文件。

## 2. 安装必要软件

### 2.1 更新系统
```bash
sudo apt update
sudo apt upgrade -y
```

### 2.2 安装 Docker (容器部署方案)
```bash
# 安装必要依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 添加Docker存储库
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 更新包索引
sudo apt update

# 安装Docker CE
sudo apt install -y docker-ce docker-compose

# 验证Docker安装
docker --version
docker-compose --version

# 将当前用户添加到docker组（免sudo运行docker命令）
sudo usermod -aG docker ${USER}
```

### 2.3 安装 Node.js (用于构建项目)
```bash
# 添加 Node.js 源
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js 和 git
sudo apt install -y nodejs git

# 验证安装
node -v
npm -v
```

## 3. 部署项目

### 3.1 创建项目目录
```bash
sudo mkdir -p /opt/come-on-project
sudo chown -R ${USER}:${USER} /opt/come-on-project
```

### 3.2 上传代码
使用 FileZilla 或 SCP 将项目代码上传到服务器：

#### 方法一：使用 FileZilla
1. 下载并安装 [FileZilla](https://filezilla-project.org/download.php)
2. 连接到服务器：
   - 主机：123.60.165.250
   - 用户名：root
   - 密码：你的服务器密码
   - 端口：22
3. 导航到本地项目目录
4. 将整个项目目录上传到 `/opt/come-on-project`，保持目录结构（包含 frontend 和 backend 子目录）

#### 方法二：使用 SCP (本地操作)
```bash
# 在本地执行以下命令
scp -r ./* root@123.60.165.250:/opt/come-on-project/
```

## 4. Docker容器化部署 (解决端口冲突)

### 4.1 创建后端Dockerfile
在后端目录创建Dockerfile：

```bash
cd /opt/come-on-project/backend
cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 指定容器内部运行端口为8000
EXPOSE 8000

CMD ["node", "app.js"]
EOF
```

### 4.2 修改后端代码中的数据库连接配置 (可选)
如果需要使用外部数据库，确保app.js中的数据库连接配置指向正确的主机：

```bash
sed -i 's/host: .*/host: "db", \/\/ Docker容器名/' /opt/come-on-project/backend/app.js
```

### 4.3 创建前端Dockerfile
在前端目录创建Dockerfile：

```bash
cd /opt/come-on-project/frontend
cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8081

CMD ["npm", "start"]
EOF
```

### 4.4 创建Docker Compose配置
在项目根目录创建docker-compose.yml文件，配置端口映射，解决端口冲突问题：

```bash
cd /opt/come-on-project
cat > docker-compose.yml << EOF
version: '3'

services:
  backend:
    build: ./backend
    container_name: come-on-backend
    restart: always
    ports:
      # 将容器内部的8000端口映射到宿主机的9000端口
      # 如果9000端口也有冲突，可以更换为其他未使用端口
      - "9000:8000"
    environment:
      - NODE_ENV=production
      # 确保应用监听在0.0.0.0:8000
      - PORT=8000
    volumes:
      - ./backend/public/uploads:/app/public/uploads

  frontend:
    build: ./frontend
    container_name: come-on-frontend
    restart: always
    ports:
      # 将容器内部的8081端口映射到宿主机的9001端口
      # 如果9001端口也有冲突，可以更换为其他未使用端口
      - "9001:8081"
    environment:
      - NODE_ENV=production
      # 确保API地址指向后端新端口
      - NEXT_PUBLIC_API_URL=http://123.60.165.250:9000

  # 如果需要MySQL数据库
  db:
    image: mysql:8.0
    container_name: come-on-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: come-on-project
    volumes:
      - mysql-data:/var/lib/mysql
      # 将初始化SQL文件挂载到容器中(可选)
      - ./db-init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

volumes:
  mysql-data:
EOF
```

### 4.5 构建并启动容器
```bash
cd /opt/come-on-project
docker-compose up -d --build
```

### 4.6 查看容器状态
```bash
docker-compose ps
```

### 4.7 检查容器日志
```bash
# 查看后端日志
docker logs come-on-backend

# 查看前端日志
docker logs come-on-frontend
```

## 5. 配置防火墙

### 5.1 配置服务器防火墙
```bash
# 安装防火墙
sudo apt install -y ufw

# 允许 SSH 连接
sudo ufw allow ssh

# 允许前端新端口
sudo ufw allow 9001

# 允许后端新端口
sudo ufw allow 9000

# 启用防火墙
sudo ufw enable
```

### 5.2 配置华为云安全组

1. 登录华为云控制台
2. 进入弹性云服务器 > 安全组
3. 找到您的实例所属的安全组
4. 添加入方向规则：
   - 规则1：
     - 协议：TCP
     - 端口范围：9001
     - 源地址：0.0.0.0/0（允许所有IP访问，生产环境建议限制）
   - 规则2：
     - 协议：TCP
     - 端口范围：9000
     - 源地址：0.0.0.0/0（允许所有IP访问，生产环境建议限制）

## 6. 访问应用

完成以上配置后，可以通过以下URL访问应用：
```
# 前端应用
http://123.60.165.250:9001

# 后端API
http://123.60.165.250:9000
```

## 7. Docker常用管理命令

### 7.1 停止服务
```bash
cd /opt/come-on-project
docker-compose down
```

### 7.2 重启服务
```bash
cd /opt/come-on-project
docker-compose restart
```

### 7.3 更新应用
当需要更新应用时，执行以下步骤：
```bash
cd /opt/come-on-project

# 如果使用git管理代码
git pull  

# 重新构建并启动容器
docker-compose up -d --build
```

### 7.4 查看容器资源使用情况
```bash
docker stats
```

## 8. Nginx配置 (可选)

如果想使用Nginx作为反向代理，提供更好的性能和安全性：

### 8.1 安装Nginx
```bash
sudo apt install -y nginx
```

### 8.2 配置Nginx
```bash
sudo nano /etc/nginx/sites-available/come-on-project
```

添加以下内容：
```
server {
    listen 80;
    server_name 123.60.165.250; # 或者你的域名

    # 前端静态文件
    location / {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.3 启用配置并重启Nginx
```bash
sudo ln -s /etc/nginx/sites-available/come-on-project /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

配置Nginx后，你可以通过HTTP端口80直接访问应用：
```
http://123.60.165.250
```

## 9. 数据库备份 (如果使用Docker数据库)

### 9.1 创建数据库备份
```bash
docker exec come-on-db mysqldump -u root -p123456 come-on-project > /opt/backups/db-backup-$(date +%Y%m%d).sql
```

### 9.2 自动备份脚本
```bash
mkdir -p /opt/backups

cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/backups"
docker exec come-on-db mysqldump -u root -p123456 come-on-project > $BACKUP_DIR/db-backup-$TIMESTAMP.sql
# 保留最近10个备份
ls -t $BACKUP_DIR/db-backup-*.sql | tail -n +11 | xargs -r rm
EOF

chmod +x /opt/backup-db.sh

# 添加到crontab每天执行
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-db.sh") | crontab -
```

## 10. 故障排查

### 10.1 容器无法启动
```bash
# 检查Docker日志
docker logs come-on-backend
docker logs come-on-frontend

# 检查容器是否运行
docker ps -a
```

### 10.2 无法访问应用
- 检查容器是否运行：`docker ps`
- 检查端口是否正确映射：`docker-compose ps`
- 确认防火墙设置：`sudo ufw status`
- 验证华为云安全组配置是否正确
- 检查容器内应用是否正常运行：`docker logs come-on-backend`

### 10.3 数据库连接问题
```bash
# 进入后端容器
docker exec -it come-on-backend sh

# 测试数据库连接
ping db
```

## 11. MySQL数据库配置 (详细)

你的项目需要MySQL数据库支持，以下提供两种配置MySQL的方式：直接在服务器上安装和使用Docker容器。

### 11.1 方式一：服务器直接安装MySQL

#### 11.1.1 安装MySQL服务器
```bash
# 更新软件包信息
sudo apt update

# 安装MySQL服务器
sudo apt install -y mysql-server

# 检查MySQL状态
sudo systemctl status mysql
```

#### 11.1.2 配置MySQL安全性
```bash
# 运行MySQL安全配置脚本
sudo mysql_secure_installation
```

按照提示进行以下配置：
- 设置root密码(推荐使用与项目中相同的密码：123456)
- 删除匿名用户
- 禁止root远程登录
- 删除测试数据库
- 重新加载权限表

#### 11.1.3 创建项目数据库和用户
```bash
# 登录MySQL
sudo mysql -u root -p
```

在MySQL提示符下执行以下命令：
```sql
# 创建数据库
CREATE DATABASE `come-on-project` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并设置密码
CREATE USER 'root'@'localhost' IDENTIFIED BY '123456';

# 授予权限
GRANT ALL PRIVILEGES ON `come-on-project`.* TO 'root'@'localhost';

# 刷新权限
FLUSH PRIVILEGES;

# 退出MySQL
EXIT;
```

#### 11.1.4 配置MySQL允许远程连接(可选)
```bash
# 编辑MySQL配置文件
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

找到`bind-address`行并修改为：
```
bind-address = 0.0.0.0
```

然后重启MySQL：
```bash
sudo systemctl restart mysql
```

授予远程访问权限：
```bash
sudo mysql -u root -p
```

在MySQL提示符下执行：
```sql
CREATE USER 'root'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON `come-on-project`.* TO 'root'@'%';
FLUSH PRIVILEGES;
EXIT;
```

#### 11.1.5 配置防火墙允许MySQL连接
```bash
# 允许MySQL默认端口
sudo ufw allow 3306/tcp

# 更新华为云安全组，添加规则允许3306端口
```

### 11.2 方式二：使用Docker配置MySQL

如果你选择使用Docker方式部署（推荐），可以按照以下步骤配置MySQL容器：

#### 11.2.1 修改docker-compose.yml
```bash
cd /opt/come-on-project
nano docker-compose.yml
```

确保docker-compose.yml文件中包含以下MySQL配置：
```yaml
services:
  # ... 其他服务配置 ...
  
  db:
    image: mysql:8.0
    container_name: come-on-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: come-on-project
    volumes:
      - mysql-data:/var/lib/mysql
      # 将初始化SQL文件挂载到容器中(可选)
      - ./db-init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

volumes:
  mysql-data:
```

#### 11.2.2 创建初始化SQL脚本(可选)
如果你有初始数据需要导入，可以创建初始化脚本：

```bash
# 创建初始化脚本目录
mkdir -p /opt/come-on-project/db-init

# 创建初始化SQL文件
cat > /opt/come-on-project/db-init/01-schema.sql << 'EOF'
-- 这里可以放置建表语句
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role INT NOT NULL DEFAULT 1,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  leader_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES users(id)
);

-- 其他表结构
EOF

# 创建数据初始化文件
cat > /opt/come-on-project/db-init/02-data.sql << 'EOF'
-- 这里可以放置初始数据插入语句
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$xVGm8meMXPJXAZZZWHBBTu7Z2GN9vdBnJms3pLaFtWbVRsChVzBuK', 0); -- 密码为123456
EOF
```

#### 11.2.3 启动MySQL容器
```bash
cd /opt/come-on-project
docker-compose up -d db
```

#### 11.2.4 验证MySQL容器运行状态
```bash
# 检查容器状态
docker ps | grep come-on-db

# 连接到MySQL容器检查数据库
docker exec -it come-on-db mysql -u root -p123456
```

在MySQL提示符下执行：
```sql
SHOW DATABASES;
USE come-on-project;
SHOW TABLES;
EXIT;
```

### 11.3 连接到MySQL数据库

#### 11.3.1 在后端配置文件中配置数据库连接
根据你的数据库部署方式，修改后端的数据库连接配置：

**如果是服务器直接安装MySQL：**
```bash
# 编辑后端数据库配置文件
cd /opt/come-on-project/backend
nano app.js
```

找到数据库连接配置，确保设置如下：
```javascript
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'come-on-project'
});
```

**如果是Docker容器MySQL：**
```bash
# 编辑后端数据库配置文件
cd /opt/come-on-project/backend
nano app.js
```

找到数据库连接配置，应该设置为：
```javascript
const db = mysql.createConnection({
  host: 'db', // 使用Docker Compose中的服务名
  user: 'root',
  password: '123456',
  database: 'come-on-project'
});
```

### 11.4 数据库管理与维护

#### 11.4.1 数据库备份
**服务器直接安装MySQL方式：**
```bash
# 创建备份目录
mkdir -p /opt/backups

# 备份命令
mysqldump -u root -p123456 come-on-project > /opt/backups/db-backup-$(date +%Y%m%d).sql

# 创建定期备份脚本
cat > /opt/backup-mysql.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR
mysqldump -u root -p123456 come-on-project > $BACKUP_DIR/db-backup-$TIMESTAMP.sql
# 保留最近10个备份
ls -t $BACKUP_DIR/db-backup-*.sql | tail -n +11 | xargs -r rm
EOF

chmod +x /opt/backup-mysql.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-mysql.sh") | crontab -
```

**Docker容器MySQL方式：**
```bash
# 备份命令
docker exec come-on-db mysqldump -u root -p123456 come-on-project > /opt/backups/db-backup-$(date +%Y%m%d).sql
```

#### 11.4.2 数据库恢复
**服务器直接安装MySQL方式：**
```bash
# 恢复数据库
mysql -u root -p123456 come-on-project < /opt/backups/db-backup-20XXXXXX.sql
```

**Docker容器MySQL方式：**
```bash
# 恢复数据库
cat /opt/backups/db-backup-20XXXXXX.sql | docker exec -i come-on-db mysql -u root -p123456 come-on-project
```

#### 11.4.3 MySQL性能优化(高级)
对于生产环境，可以考虑进行以下MySQL性能优化：

**服务器直接安装MySQL方式：**
```bash
# 编辑MySQL配置文件
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

添加以下配置：
```
# 缓冲池大小，建议设置为可用内存的50%-70%
innodb_buffer_pool_size = 1G

# 查询缓存
query_cache_size = 64M
query_cache_limit = 2M

# 并发连接数
max_connections = 150
```

重启MySQL：
```bash
sudo systemctl restart mysql
```

**Docker容器MySQL方式：**
在docker-compose.yml文件中的MySQL服务配置中添加命令参数：
```yaml
command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --innodb-buffer-pool-size=1G --query-cache-size=64M --query-cache-limit=2M --max-connections=150
```

然后重新启动容器：
```bash
docker-compose up -d db
```

## 12. 修改后端端口配置

在使用Docker容器部署方案中，你需要确保后端应用正确监听8000端口。以下是几种可能的情况和解决方案：

### 12.1 如果后端有明确的端口配置

检查和修改后端代码中的端口配置：

```bash
# 查找后端代码中的端口配置
cd /opt/come-on-project/backend
grep -r "app.listen" .
```

如果找到类似这样的代码：
```javascript
app.listen(8080, () => {
  console.log('后端服务器运行在 http://localhost:8080');
});
```

需要修改为：
```javascript
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`后端服务器运行在 http://0.0.0.0:${PORT}`);
});
```

可以使用以下命令快速修改：
```bash
# 修改端口配置
sed -i 's/app.listen(8080/const PORT = process.env.PORT || 8000;\napp.listen(PORT, "0.0.0.0"/g' app.js
# 修改日志信息
sed -i 's/后端服务器运行在 http:\/\/localhost:8080/后端服务器运行在 http:\/\/0.0.0.0:${PORT}/g' app.js
```

### 12.2 Docker容器端口映射说明

Docker端口映射的格式是 `宿主机端口:容器内部端口`，因此：

```
- "9000:8000"
```

表示将宿主机的9000端口映射到容器内部的8000端口。这意味着：
- 你的应用在容器内部必须监听8000端口
- 外部通过访问服务器的9000端口来连接到你的应用
- 不会与其他占用了8000端口的服务冲突

### 12.3 确保前端正确连接到后端

如果前端代码中硬编码了后端API地址，需要修改它：

```bash
# 查找前端代码中的API调用
cd /opt/come-on-project/frontend
grep -r "http://localhost:8000" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" .
```

如果找到硬编码的API地址，可以使用环境变量来替代：

```javascript
// 修改前
const API_BASE_URL = "http://localhost:8000";

// 修改后
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

## 13. 华为云OBS对象存储配置

华为云对象存储服务(OBS)可以用于存储和管理各种文件，如图片、视频、文档等。以下是配置和使用OBS服务的详细步骤：

### 13.1 创建OBS桶和获取访问密钥

#### 13.1.1 创建OBS桶

1. 登录华为云控制台，进入"对象存储服务 OBS"
2. 点击"创建桶"按钮
3. 设置桶的基本信息：
   - 区域：选择与您的ECS服务器相同的区域，以提高访问速度
   - 桶名称：输入一个全局唯一的名称，例如：`come-on-project-bucket`
   - 存储类别：建议选择"标准存储"
   - 桶策略：可以选择"公共读，私有写"或"私有"（根据安全需求选择）
4. 点击"立即创建"完成桶的创建

#### 13.1.2 获取访问密钥 (AK/SK)

1. 在华为云控制台右上角点击用户名，选择"我的凭证"
2. 在左侧菜单中，选择"访问密钥"
3. 点击"新增访问密钥"按钮
4. 完成身份验证后，系统将生成并下载一个credentials.csv文件，包含：
   - Access Key ID（AK）
   - Secret Access Key（SK）
5. **安全提示**：请妥善保管您的AK/SK，不要将其硬编码在代码中或者公开分享

### 13.2 安装OBS Node.js SDK

#### 13.2.1 在后端项目中安装SDK

```bash
cd /opt/come-on-project/backend
npm install esdk-obs-nodejs --save
```

#### 13.2.2 在Docker容器中安装SDK

如果您使用Docker部署，需要更新Dockerfile来安装OBS SDK：

```bash
# 修改backend的Dockerfile，添加OBS依赖
cd /opt/come-on-project
nano backend/Dockerfile
```

确保Dockerfile包含以下内容：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# 安装依赖包括OBS SDK
RUN npm install

COPY . .

# 指定容器内部运行端口为8000
EXPOSE 8000

CMD ["node", "app.js"]
```

### 13.3 后端集成OBS功能

#### 13.3.1 创建OBS配置文件

为了保证代码安全性，建议创建独立的配置文件来存储OBS配置：

```bash
cd /opt/come-on-project/backend
nano obs-config.js
```

添加以下内容：

```javascript
// OBS配置
module.exports = {
  access_key_id: 'YOUR_ACCESS_KEY_ID',     // 替换为您的AK
  secret_access_key: 'YOUR_SECRET_ACCESS_KEY', // 替换为您的SK
  server: 'https://obs.ap-southeast-3.myhuaweicloud.com', // 替换为您桶所在区域的OBS服务地址
  bucketName: 'come-on-project-bucket',    // 替换为您的桶名称
  // 设置文件URL的前缀，以便前端访问
  fileUrlPrefix: 'https://come-on-project-bucket.obs.ap-southeast-3.myhuaweicloud.com/'
};
```

#### 13.3.2 修改app.js添加OBS文件上传功能

在后端代码中添加OBS文件上传功能，确保在端口配置之前添加以下代码：

```bash
cd /opt/come-on-project/backend
nano app.js
```

添加OBS相关代码：

```javascript
// 引入OBS SDK
const ObsClient = require('esdk-obs-nodejs');
const obsConfig = require('./obs-config');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// 创建OBS客户端实例
const obsClient = new ObsClient({
  access_key_id: obsConfig.access_key_id,
  secret_access_key: obsConfig.secret_access_key,
  server: obsConfig.server
});

// 配置multer临时存储上传文件
const upload = multer({ dest: 'uploads/' });

// 添加文件上传到OBS的接口
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有文件上传' });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const objectKey = `uploads/${Date.now()}${fileExtension}`;
    
    // 上传文件到OBS
    obsClient.putObject({
      Bucket: obsConfig.bucketName,
      Key: objectKey,
      SourceFile: file.path
    }, (err, result) => {
      // 删除临时文件
      fs.unlinkSync(file.path);
      
      if (err) {
        console.error('上传到OBS失败:', err);
        return res.status(500).json({ success: false, message: '文件上传失败', error: err.message });
      }
      
      if (result.CommonMsg.Status < 300) {
        // 生成文件的访问URL
        const fileUrl = `${obsConfig.fileUrlPrefix}${objectKey}`;
        res.json({ 
          success: true, 
          message: '文件上传成功', 
          data: { 
            url: fileUrl,
            filename: file.originalname,
            size: file.size
          } 
        });
      } else {
        res.status(500).json({ success: false, message: '文件上传到OBS失败', result });
      }
    });
  } catch (error) {
    console.error('文件上传异常:', error);
    res.status(500).json({ success: false, message: '服务器异常', error: error.message });
  }
});
```

### 13.4 docker-compose.yml中添加环境变量

为了安全地管理OBS访问密钥，建议在docker-compose.yml文件中通过环境变量传递配置：

```bash
cd /opt/come-on-project
nano docker-compose.yml
```

修改backend服务的环境变量配置：

```yaml
backend:
  build: ./backend
  container_name: come-on-backend
  restart: always
  ports:
    # 将容器内部的8000端口映射到宿主机的9000端口
    # 如果9000端口也有冲突，可以更换为其他未使用端口
    - "9000:8000"
  environment:
    - NODE_ENV=production
    # 确保应用监听在0.0.0.0:8000
    - PORT=8000
    # OBS配置环境变量
    - OBS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
    - OBS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
    - OBS_SERVER=https://obs.ap-southeast-3.myhuaweicloud.com
    - OBS_BUCKET_NAME=come-on-project-bucket
  volumes:
    - ./backend/public/uploads:/app/public/uploads
```

### 13.5 更新obs-config.js使用环境变量

为了更安全地使用环境变量，更新obs-config.js：

```javascript
// OBS配置
module.exports = {
  access_key_id: process.env.OBS_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY_ID',
  secret_access_key: process.env.OBS_SECRET_ACCESS_KEY || 'YOUR_SECRET_ACCESS_KEY',
  server: process.env.OBS_SERVER || 'https://obs.ap-southeast-3.myhuaweicloud.com',
  bucketName: process.env.OBS_BUCKET_NAME || 'come-on-project-bucket',
  fileUrlPrefix: `https://${process.env.OBS_BUCKET_NAME || 'come-on-project-bucket'}.${process.env.OBS_SERVER.replace('https://obs.', '') || 'obs.ap-southeast-3.myhuaweicloud.com'}/`
};
```

### 13.6 测试OBS文件上传功能

1. 重建并启动Docker容器：
```bash
cd /opt/come-on-project
docker-compose up -d --build
```

2. 使用curl测试文件上传接口：
```bash
# 创建测试文件
echo "This is a test file" > test.txt

# 上传测试文件
curl -X POST -F "file=@test.txt" http://123.60.165.250:9000/api/upload
```

3. 检查返回结果，应该包含文件的访问URL和成功消息。

### 13.7 OBS常见操作API示例

以下是一些常见OBS操作的代码示例，可以根据需要添加到项目中：

#### 13.7.1 列出桶中的对象

```javascript
app.get('/api/files', authenticateToken, (req, res) => {
  obsClient.listObjects({
    Bucket: obsConfig.bucketName,
    MaxKeys: 1000
  }, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: '获取文件列表失败', error: err.message });
    }
    
    if (result.CommonMsg.Status < 300 && result.InterfaceResult) {
      const files = result.InterfaceResult.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: `${obsConfig.fileUrlPrefix}${item.Key}`
      }));
      
      res.json({ success: true, files });
    } else {
      res.status(500).json({ success: false, message: '获取文件列表失败', result });
    }
  });
});
```

#### 13.7.2 删除OBS中的对象

```javascript
app.delete('/api/files/:key', authenticateToken, (req, res) => {
  const key = req.params.key;
  
  obsClient.deleteObject({
    Bucket: obsConfig.bucketName,
    Key: key
  }, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: '删除文件失败', error: err.message });
    }
    
    if (result.CommonMsg.Status < 300) {
      res.json({ success: true, message: '文件删除成功' });
    } else {
      res.status(500).json({ success: false, message: '删除文件失败', result });
    }
  });
});
```

### 13.8 前端集成文件上传组件 (可选)

如果需要在前端添加文件上传组件，可以在前端项目中添加以下代码：

```javascript
// 文件上传函数示例 (React/Vue通用)
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('http://123.60.165.250:9000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'x-access-token': localStorage.getItem('token') // 如果需要认证
      }
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('文件上传成功:', result.data.url);
      return result.data;
    } else {
      console.error('文件上传失败:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('文件上传异常:', error);
    throw error;
  }
}
```

### 13.9 OBS安全配置建议

1. **设置桶策略**：根据需要配置桶的访问策略，建议使用最小权限原则
2. **配置CORS**：如果前端需要直接访问OBS中的文件，需要配置跨域资源共享
3. **使用临时访问密钥**：对于前端上传，考虑使用临时访问密钥而不是长期访问密钥
4. **配置对象生命周期**：对于临时文件，设置适当的生命周期策略以自动删除
5. **启用服务端加密**：对敏感数据启用服务端加密保护

完成以上配置后，您的应用将能够安全地将文件上传到华为云OBS服务，并可以通过返回的URL在前端访问这些文件。 