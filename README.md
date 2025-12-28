# 欢迎使用你的秒哒应用代码包
秒哒应用链接
    URL:https://www.miaoda.cn/projects/app-8j8h897c969t

## 介绍

**AI Matrix Lab** 是一个基于Web的线性代数可视化实验室，通过交互式界面帮助用户理解2x2矩阵变换的数学原理和几何意义。

### 核心功能

- 🎯 **自然语言输入**：使用自然语言描述变换（如"Rotate 45 degrees"），自动转换为矩阵
- 🔢 **矩阵手动输入**：直接输入2x2矩阵的四个元素
- 📊 **实时可视化**：Canvas绘制坐标系，显示原始图形和变换后图形的对比
- 🧮 **数学属性计算**：自动计算并显示行列式、特征值和特征向量
- 🎨 **预设变换**：提供旋转、反射、剪切、缩放等常见变换的快速演示
- 🤖 **AI集成**：支持OpenAI API和本地Mock模式

### 技术特点

- 使用Canvas进行高性能图形绘制
- 实现完整的矩阵运算库（无需NumPy）
- 支持复数特征值的计算和显示
- 响应式设计，适配桌面和移动设备

### 使用说明

1. **Mock模式（推荐新手）**：
   - 默认开启Mock AI模式
   - 支持的命令：rotate 45, reflect x-axis, scale 2, shear 1.5, squeeze
   - 在自然语言输入框输入命令，点击"转换"按钮

2. **真实AI模式**：
   - 关闭Mock AI开关
   - 输入OpenAI API密钥
   - 可选：修改API地址（支持DeepSeek、Moonshot等兼容API）
   - 输入任意变换描述，AI将自动生成对应矩阵

3. **手动输入**：
   - 直接在矩阵输入区修改四个数值
   - 实时查看变换效果

4. **预设变换**：
   - 点击预设按钮快速体验常见变换
   - 包括：单位矩阵、旋转90°、旋转45°、X轴反射、Y轴反射、剪切、挤压、缩放2倍

5. **图形类型**：
   - 正方形：基础单位正方形
   - F字形：更复杂的图形，便于观察变换效果
   - 网格点：点阵模式

### 可视化说明

- **蓝色虚线**：原始图形
- **红色实线**：变换后的图形
- **绿色箭头**：特征向量（仅当特征值为实数时显示）
- **坐标系**：固定范围[-5, 5]，带网格线

## 目录结构

```
├── README.md # 说明文档
├── components.json # 组件库配置
├── index.html # 入口文件
├── package.json # 包管理
├── postcss.config.js # postcss 配置
├── public # 静态资源目录
│   ├── favicon.png # 图标
│   └── images # 图片资源
├── src # 源码目录
│   ├── App.tsx # 入口文件
│   ├── components # 组件目录
│   ├── contexts # 上下文目录
│   ├── db # 数据库配置目录
│   ├── hooks # 通用钩子函数目录
│   ├── index.css # 全局样式
│   ├── layout # 布局目录
│   ├── lib # 工具库目录
│   ├── main.tsx # 入口文件
│   ├── routes.tsx # 路由配置
│   ├── pages # 页面目录
│   ├── services  # 数据库交互目录
│   ├── types   # 类型定义目录
├── tsconfig.app.json  # ts 前端配置文件
├── tsconfig.json # ts 配置文件
├── tsconfig.node.json # ts node端配置文件
└── vite.config.ts # vite 配置文件
```

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI组件库**：shadcn/ui + Radix UI
- **样式方案**：Tailwind CSS
- **图形绘制**：Canvas API
- **AI集成**：OpenAI API（兼容其他API）
- **数学计算**：自研矩阵运算库

## 本地开发

### 如何在本地编辑代码？

您可以选择 [VSCode](https://code.visualstudio.com/Download) 或者您常用的任何 IDE 编辑器，唯一的要求是安装 Node.js 和 npm.

### 环境要求

```
# Node.js ≥ 20
# npm ≥ 10
例如：
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

具体安装步骤如下：

### 在 Windows 上安装 Node.js

```
# Step 1: 访问Node.js官网：https://nodejs.org/，点击下载后，会根据你的系统自动选择合适的版本（32位或64位）。
# Step 2: 运行安装程序：下载完成后，双击运行安装程序。
# Step 3: 完成安装：按照安装向导完成安装过程。
# Step 4: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 在 macOS 上安装 Node.js

```
# Step 1: 使用Homebrew安装（推荐方法）：打开终端。输入命令brew install node并回车。如果尚未安装Homebrew，需要先安装Homebrew，
可以通过在终端中运行如下命令来安装：
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
或者使用官网安装程序：访问Node.js官网。下载macOS的.pkg安装包。打开下载的.pkg文件，按照提示完成安装。
# Step 2: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 安装完后按照如下步骤操作：

```
# Step 1: 下载代码包
# Step 2: 解压代码包
# Step 3: 用IDE打开代码包，进入代码目录
# Step 4: IDE终端输入命令行，安装依赖：npm i
# Step 5: IDE终端输入命令行，启动开发服务器：npm run dev -- --host 127.0.0.1
```

### 如何开发后端服务？

配置环境变量，安装相关依赖
如需使用数据库，请使用 supabase 官方版本或自行部署开源版本的 Supabase

### 如何配置应用中的三方 API？

具体三方 API 调用方法，请参考帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。

## 了解更多

您也可以查看帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。
