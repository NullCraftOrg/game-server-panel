# NullCraft Game Server Panel

**"Just a simple game server management panel"**
("这只是一个游戏专用服务器管理面板")

## Special Notice

A basic game server management panel with a frontend-backend separation architecture. Currently, it implements fundamental server creation, management, and basic permission control. It is still under continuous development and maintenance. If you have new ideas, you are welcome to submit code for development, or suggest update directions via [issue](https://github.com/NullCraftOrg/game-server-panel/issues).

To view the update roadmap, please visit: [Roadmap Board](https://github.com/orgs/NullCraftOrg/projects/1)

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

![NGSP-Dashbroad](/images/Dashborad-20260413-155800.png)
![NGSP-Dashbroad-Dark](/images/Dashborad-Dark-20260413-155800.png)
![NGSP-Console](/images/Console-20260413-160558.png)
![NGSP-Console](/images/Console-Dark-20260413-160558.png)
![NGSP-ServerList](/images/ServerList-20260405222500.jpeg)