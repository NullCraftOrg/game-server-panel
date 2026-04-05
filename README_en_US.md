# NullCraft Game Server Panel

**"Just a simple game server management panel"**
("这只是一个游戏专用服务器管理面板")

## Special Notice

This is currently a basic game server management tool with a frontend-backend separation architecture. Its functionality is very rudimentary at this stage.

It is only minimally functional and **currently has no security features**! There is no user management functionality. Therefore, please do not deploy this tool on a public network. If deployed, the frontend and backend ports should not be exposed to the external network.

**Default Frontend Port:** `6996`  
**Default Backend Port:** `9119`

## Deployment

Currently, deployment is possible by cloning the source code.

**Environment Requirements:**
- Backend: [NodeJS24](https://nodejs.org/)
- Frontend: [Vue3](https://vuejs.org/)

After setting up the environment, proceed with dependency installation.

### Configure the Project via Scripts

1. Navigate to the `Script` folder
2. Run the `0. setup npm install.bat` script to install dependencies
3. Run the `1. 同时启动(Dev all).bat` script to start the frontend and backend

### Manually Install Dependencies and Start the Project:

**Install Dependencies:**

1. Navigate to the backend (`src/server`) folder
2. Run the `npm install` command via the command line `(cmd/bash)`
3. Navigate to the frontend (`src/web`) folder
4. Run the `npm install` command via the command line `(cmd/bash)`

**Start the Project:**

1. Navigate to the backend (`src/server`) folder
2. Run the `npm run dev` command via the command line (cmd/bash)
3. Navigate to the frontend (`src/web`) folder
4. Run the `npm run dev` command via the command line (cmd/bash)

## Project Images

![NGSP-Dashbroad](/images/Dashboard-20260405223400.jpeg)
![NGSP-Dashbroad-Dark](/images/Dashboard-Dark-20260405223500.jpeg)
![NGSP-Console](/images/Console-20260405223000.jpeg)
![NGSP-ServerList](/images/ServerList-20260405222500.jpeg)