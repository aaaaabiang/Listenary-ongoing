# server/Dockerfile

# --- Stage 1: Build Stage (第一阶段：构建阶段) ---
# 使用官方 Node.js 20 的 slim 版本作为基础镜像。
# "AS builder" 给这个阶段起个名字，方便后面引用。
FROM node:20-slim AS builder

# 在容器内部创建一个 /app 目录作为我们的工作空间。
WORKDIR /app

# 复制 package.json 和 package-lock.json 文件。
# 提前复制这两个文件可以利用 Docker 的缓存机制，如果它们没有变化，
# 下一步的 npm install 就可以跳过，大大加快后续构建速度。
COPY package*.json ./

# 在容器内运行 npm install 来安装所有项目依赖。
RUN npm install

# 复制当前目录下的所有其他代码 (index.js, routes/, controllers/ 等) 到容器的 /app 目录。
COPY . .


# --- Stage 2: Production Stage (第二阶段：生产阶段) ---
# 再次使用一个干净、轻量的 Node.js 镜像作为最终运行环境。
FROM node:20-slim

# 同样设置工作目录。
WORKDIR /app

# 从第一阶段 (builder) 中，只复制我们运行应用所必需的文件。
# 这样可以确保最终的镜像不包含任何不必要的开发工具 (如 nodemon)。
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# 声明容器内的应用将会监听 3000 端口。这主要是一个文档性声明。
EXPOSE 3000

# 定义容器启动时要执行的默认命令。
# ["npm", "start"] 会执行 package.json 中 "scripts" 下的 "start" 命令。
CMD [ "npm", "start" ]