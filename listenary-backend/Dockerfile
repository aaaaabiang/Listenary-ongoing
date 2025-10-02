# listenary-backend/Dockerfile

# --- Stage 1: Build Stage (构建阶段) ---
# 使用一个包含完整 TypeScript 工具链的 Node.js 镜像
FROM node:20 AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖，包括构建 TypeScript 所需的 devDependencies
RUN npm install

# 复制所有源代码
COPY . .

# 【关键】运行构建命令，将 TypeScript 编译成 JavaScript
# 这会读取 tsconfig.json 并将 src/ 目录下的 .ts 文件编译到 dist/ 目录
RUN npm run build


# --- Stage 2: Production Stage (生产阶段) ---
# 使用一个更轻量的 Node.js 镜像来运行应用
FROM node:20-slim

WORKDIR /app

# 从 'builder' 阶段，只复制生产环境必需的文件
COPY --from=builder /app/package*.json ./

# 【关键】只安装生产依赖，忽略 devDependencies，减小镜像体积
RUN npm install --production

# 从 'builder' 阶段，只复制编译后的 JavaScript 代码 (dist/ 目录)
COPY --from=builder /app/dist ./dist

# 暴露应用端口
EXPOSE 3000

# 定义容器启动命令，运行编译后的代码
CMD [ "npm", "start" ]