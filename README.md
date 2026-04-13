# NullCraft Game Server Panel

**"这只是一个游戏专用服务器管理面板"**
("Just a simple game server management panel")

## 特别提醒

一个基础的前后端分离式的游戏专用服务器管理面板，目前实现了基本的服务器新建、管理、和基本的权限控制管理，目前还在持续开发维护中，如有新想发欢迎提交代码参与开发，或通过 [issue](https://github.com/NullCraftOrg/game-server-panel/issues) 提交更新方向建议。

查看更新线路图可前往：[Roadmap看板](https://github.com/orgs/NullCraftOrg/projects/1)

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

![NGSP-Dashbroad](/images/Dashborad-20260413-155800.png)
![NGSP-Dashbroad-Dark](/images/Dashborad-Dark-20260413-155800.png)
![NGSP-Console](/images/Console-20260413-160558.png)
![NGSP-Console](/images/Console-Dark-20260413-160558.png)
![NGSP-ServerList](/images/ServerList-20260405222500.jpeg)