// 定义学生信息接口
import Web3 from 'web3';
export interface StudentInfo {
  id: number;
  username: string;
  major: string;
  grade: string;
  class: string;
  points: number;
  created_at: number;
  exists: boolean;
}

// 更新ABI以匹配实际合约
const contractABI =[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getStudentPoints",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_major",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_grade",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_class",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_points",
				"type": "uint256"
			}
		],
		"name": "setStudentPoints",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "students",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "major",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "grade",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "class",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "points",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "created_at",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

// Sepolia测试网上的合约地址
const contractAddress = '0x7bf6dD462428999Ff1c93b1A2dFd5B406164DC56';

// 创建Web3实例的函数
function createWeb3(): Web3 | null {
  try {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      console.error('非浏览器环境无法创建Web3实例');
      return null;
    }
    
    // 检查是否安装了MetaMask
    if (typeof (window as any).ethereum !== 'undefined') {
      // 现代DApp浏览器
      const { ethereum } = window as any;
      return new Web3(ethereum);
    } else if (typeof (window as any).web3 !== 'undefined') {
      // 传统DApp浏览器
      return new Web3((window as any).web3.currentProvider);
    } else {
      console.error('MetaMask未安装或未启用!');
      throw new Error('MetaMask未安装');
    }
  } catch (error) {
    console.error('创建Web3实例时发生错误:', error);
    throw error;
  }
}

// 创建合约接口类
export class StudentPointsContractInterface {
  private web3: Web3 | null;
  private contract: any;
  private ethereum: any;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ethereum = (window as any).ethereum;
      this.web3 = createWeb3();
    } else {
      console.error('此接口只能在浏览器环境中使用');
      this.web3 = null;
    }
  }

  // 连接到以太坊账户并初始化合约
  async connect(): Promise<string> {
    try {
      if (!this.ethereum) {
        throw new Error('MetaMask未安装');
      }

      // 设置超时时间更短，避免长时间等待
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('MetaMask响应超时，请检查MetaMask是否已打开并解锁')), 15000);
      });

      // 检测当前网络ID
      let chainId;
      try {
        chainId = await Promise.race([
          this.ethereum.request({ method: 'eth_chainId' }),
          timeout
        ]);
      } catch (error) {
        console.error('获取链ID失败:', error);
        throw new Error('无法获取当前网络，请确保MetaMask已解锁且正常工作');
      }
      
      const sepoliaChainId = '0xaa36a7'; // Sepolia的chainId
      
      // 如果不是Sepolia测试网，则尝试切换
      if (chainId !== sepoliaChainId) {
        console.log('当前不是Sepolia测试网，尝试切换...');
        
        // 尝试切换网络，使用更短的超时时间
        try {
          await Promise.race([
            this.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: sepoliaChainId }]
            }).catch(async (switchError: any) => {
              // 如果用户没有添加Sepolia网络，则添加
              if (switchError.code === 4902) {
                console.log('Sepolia网络未添加，尝试添加网络...');
                return this.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: sepoliaChainId,
                      chainName: 'Sepolia Testnet',
                      nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                      },
                      rpcUrls: ['https://sepolia.infura.io/v3/'],
                      blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }
                  ],
                });
              }
              throw switchError;
            }),
            timeout
          ]);
          console.log('网络已切换到Sepolia测试网');
        } catch (error: any) {
          if (error.message?.includes('timeout') || error.message?.includes('超时')) {
            throw new Error('切换网络超时，请手动在MetaMask中切换到Sepolia测试网');
          }
          throw error;
        }
      } else {
        console.log('已经在Sepolia测试网上');
      }

      // 请求账户
      console.log('请求访问MetaMask账户...');
      let accounts;
      try {
        accounts = await Promise.race([
          this.ethereum.request({ method: 'eth_requestAccounts' }),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('账户请求超时')), 15000);
          })
        ]);
      } catch (error: any) {
        if (error.message?.includes('timeout') || error.message?.includes('超时')) {
          throw new Error('MetaMask未响应，请确保MetaMask已解锁并检查是否有待处理的请求');
        }
        throw error;
      }
      
      if (!accounts || accounts.length === 0) {
        throw new Error('未能获取账户，请确保MetaMask已解锁');
      }
      
      console.log('成功获取账户:', accounts[0]);
      
      if (this.web3) {
        // 创建合约实例
        this.contract = new this.web3.eth.Contract(contractABI as any, contractAddress);
      } else {
        throw new Error('无法创建Web3实例');
      }
      
      return accounts[0];
    } catch (error: any) {
      console.error('连接到以太坊账户失败:', error);
      
      // 改进错误处理
      if (error.code === 4001) {
        throw new Error('用户拒绝了请求');
      } else if (error.code === 4902) {
        throw new Error('需要添加Sepolia测试网，请允许MetaMask中的网络添加请求');
      } else if (error.message?.includes('timeout') || error.message?.includes('超时')) {
        throw new Error('连接MetaMask超时，请确保MetaMask已打开并解锁，然后刷新页面重试');
      } else if (error.message?.includes('already pending')) {
        throw new Error('已有一个待处理的连接请求，请检查MetaMask插件并确认或拒绝待处理的请求');
      } else if (error.message?.includes('MetaMask未安装')) {
        throw new Error('MetaMask未安装');
      }
      
      throw error;
    }
  }

  // 设置学生积分 - 直接对应合约方法
  async setStudentPoints(
    studentId: number,
    username: string,
    major: string,
    grade: string,
    className: string,
    points: number
  ): Promise<any> {
    try {
      if (!this.contract) await this.connect();
      
      console.log(`调用setStudentPoints: ID=${studentId}, 学生=${username}, 专业=${major}, 年级=${grade}, 班级=${className}, 积分=${points}`);
      
      if (this.web3) {
        const accounts = await this.web3.eth.getAccounts();
        
        // 检查当前用户是否是合约所有者
        const contractOwner = await this.getOwner();
        console.log(`合约所有者: ${contractOwner}`);
        console.log(`当前账户: ${accounts[0]}`);
        
        if (contractOwner.toLowerCase() !== accounts[0].toLowerCase()) {
          throw new Error('只有合约所有者才能设置积分');
        }
        
        console.log('准备发送交易...');
        
        // 使用Web3直接调用合约的setStudentPoints方法
        console.log("发送交易创建/更新学生信息");
        const tx = await this.contract.methods.setStudentPoints(
          studentId,
          username,
          major,
          grade,
          className,
          points
        ).send({ 
          from: accounts[0]
        });
        
        return tx;
      } else {
        throw new Error('Web3实例未初始化');
      }
    } catch (error) {
      console.error('设置学生积分失败:', error);
      throw error;
    }
  }

  // 获取学生信息 - 直接从映射读取
  async getStudentInfo(userId: number): Promise<StudentInfo> {
    try {
      if (!this.contract) await this.connect();
      
      const result = await this.contract.methods.students(userId).call();
      
      return {
        id: parseInt(result.id),
        username: result.username,
        major: result.major,
        grade: result.grade,
        class: result.class,
        points: parseInt(result.points),
        created_at: parseInt(result.created_at),
        exists: result.exists
      };
    } catch (error) {
      console.error('获取学生信息失败:', error);
      throw error;
    }
  }

  // 获取学生积分 - 直接对应合约方法
  async getStudentPoints(userId: number): Promise<number> {
    try {
      if (!this.contract) await this.connect();
      
      const result = await this.contract.methods.getStudentPoints(userId).call();
      return parseInt(result);
    } catch (error) {
      console.error('获取学生积分失败:', error);
      throw error;
    }
  }
  
  // 获取合约所有者
  async getOwner(): Promise<string> {
    try {
      if (!this.contract) await this.connect();
      
      return await this.contract.methods.owner().call();
    } catch (error) {
      console.error('获取合约所有者失败:', error);
      throw error;
    }
  }

  // 检查用户是否是合约所有者
  async isContractOwner(): Promise<boolean> {
    try {
      if (!this.contract) await this.connect();
      
      if (this.web3) {
        const accounts = await this.web3.eth.getAccounts();
        const contractOwner = await this.getOwner();
        return contractOwner.toLowerCase() === accounts[0].toLowerCase();
      }
      return false;
    } catch (error) {
      console.error('检查合约所有者失败:', error);
      return false;
    }
  }
} 