# NullCraft Game Server Panel

**"这只是一个游戏专用服务器管理面板"**
("Just a simple game server management panel")

## 特别提醒

这目前只是一个最基础的前后端分离式的游戏服务器管理工具，目前功能非常基础。
只能做到基本能用，并且**目前没有安全防护**功能!没有用户管理功能，所以请不要在公共网络上部署此工具，如部署则不应该将前后端端口公开映射到外网之中。

**前端默认端口：**`6996`
**后端默认端口：**`9119`

## 部署项目

目前可通过克隆源码部署。

**环境要求：**
- 后端：[NodeJS24](https://nodejs.org/)
- 前端：[Vue3](https://cn.vuejs.org/)

安装好环境后，进行依赖安装。

### 通过脚本配置项目

1. 进入 `脚本(Script)` 文件夹
2. 运行 `0. setup npm install.bat` 脚本配置依赖
3. 运行 `1. 同时启动(Dev all).bat` 脚本运行前后端

### 手动安装依赖并启动项目：

**安装依赖：**

1. 进入后端 `(src/server)` 文件夹
2. 通过命令行 `(cmd/bash)` 运行 `npm install` 命令
3. 进入前端 `(src/web)` 文件夹
4. 通过命令行 `(cmd/bash)` 运行 `npm install` 命令

**启动项目：**

1. 进入后端 `(src/server)` 文件夹
2. 通过命令行 `(cmd/bash)` 运行 `npm run dev` 命令
3. 进入前端 `(src/web)` 文件夹
4. 通过命令行 `(cmd/bash)` 运行 `npm run dev` 命令

## 协助开发

请加入我们的官方用户Q群提交更新建议：[239336981](https://qm.qq.com/q/MxvpAy0g0u)

## 项目图片

![NGSP-Dashbroad](/images/Dashboard-20260405223400.jpeg)
![NGSP-Dashbroad-Dark](/images/Dashboard-Dark-20260405223500.jpeg)
![NGSP-Console](/images/Console-20260405223000.jpeg)
![NGSP-ServerList](/images/ServerList-20260405222500.jpeg)