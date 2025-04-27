const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// 定义颜色
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
  }
};

console.log(`${colors.fg.cyan}${colors.bright}启动前端和后端服务...${colors.reset}\n`);

// 确定是Windows还是类Unix系统
const isWindows = os.platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 启动前端
const frontend = spawn(npmCmd, ['run', 'dev'], { 
  cwd: path.join(__dirname, 'frontend'),
  shell: true
});

// 前端输出
frontend.stdout.on('data', (data) => {
  console.log(`${colors.fg.green}[前端] ${colors.reset}${data}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`${colors.fg.red}[前端错误] ${colors.reset}${data}`);
});

// 启动后端
const backend = spawn(npmCmd, ['run', 'dev'], { 
  cwd: path.join(__dirname, 'backend'),
  shell: true
});

// 后端输出
backend.stdout.on('data', (data) => {
  console.log(`${colors.fg.blue}[后端] ${colors.reset}${data}`);
});

backend.stderr.on('data', (data) => {
  console.error(`${colors.fg.red}[后端错误] ${colors.reset}${data}`);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log(`${colors.fg.yellow}正在关闭所有服务...${colors.reset}`);
  frontend.kill();
  backend.kill();
  process.exit(0);
});

// 处理子进程退出
frontend.on('close', (code) => {
  console.log(`${colors.fg.yellow}前端进程已退出，退出码 ${code}${colors.reset}`);
});

backend.on('close', (code) => {
  console.log(`${colors.fg.yellow}后端进程已退出，退出码 ${code}${colors.reset}`);
}); 