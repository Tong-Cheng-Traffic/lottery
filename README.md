# 交通年会抽奖程序

- 基于Three.js、python3 开发的抽奖程序（贴图使用NodeJs生成）

## 功能

- 奖项（总数、抽取频率）可配置
- 参与名单、中奖名单可导入导出
- 前端3D抽奖视觉效果
- 运行端口自定义 (config.cfg)

# 主要开发文件目录
	.
    │── lib           // 类库目录
    │── static        // web静态资源文件存放目录，如:html、js、css、img 等
    │── templates     // 模板存放目录
    │── config.cfg    // 项目配置文件
    |-- helperApp.py  // 辅助 app 入口
    └── webApp.py     // 项目运行入口文件

# 安装开发环境
1、从 https://www.python.org/downloads/release/python-366/  # 下载系统对应的python安装文件并安装
2、pip install flask flask_cors requests xlrd pyOpenSSL xlwt

# 运行命令
python webApp.py

- 浏览器访问 ```http://127.0.0.1:8088```
