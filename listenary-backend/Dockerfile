# listenary-backend/Dockerfile

# --- Stage 1: Build Stage (构建阶段) ---
# 使用一个包含完整 TypeScript 工具链的 Node.js 镜像作为构建环境。
# 我们给这个阶段命名为 "builder"，以便后续引用。
FROM node:20 AS builder

# 在容器内部设置工作目录为 /app。
WORKDIR /app

# 复制 package.json 和 package-lock.json 文件。
# 这样做是为了利用 Docker 的层缓存机制：只要这两个文件不改变，
# 下一步的 npm install 就可以使用缓存，从而极大地加快构建速度。
COPY package*.json ./

# 安装所有依赖，包括构建 TypeScript 所需的 devDependencies。
RUN npm install

# 复制项目中的所有其他文件（源代码、配置文件等）。
COPY . .

# 【关键步骤】运行 package.json 中定义的 "build" 脚本。
# 这会调用 TypeScript 编译器 (tsc)，将 src/ 目录下的 .ts 文件
# 编译成 Node.js 能运行的 .js 文件，并输出到 dist/ 目录。
RUN npm run build


# --- Stage 2: Production Stage (生产阶段) ---
# 使用一个更轻量的 Node.js 镜像 (slim 版本) 作为最终的运行环境，以减小镜像体积。
FROM node:20-slim

# 同样设置工作目录。
WORKDIR /app

# 从 'builder' 阶段，只复制生产环境必需的文件。
COPY --from=builder /app/package*.json ./

# 【关键优化】只安装生产环境所需的依赖 (dependencies)，忽略 devDependencies。
# 这能显著减小最终镜像的大小，并提高安全性。
RUN npm install --production

# 从 'builder'  阶段，只复制编译后的 JavaScript 代码 (dist/ 目录)。
# 我们不需要将原始的 .ts 源代码包含在最终的生产镜像中。
COPY --from=builder /app/dist ./dist

# 声明容器内的应用将会监听 3000 端口。
# 这主要是一个元数据声明，方便使用者和平台了解容器的网络配置。
EXPOSE 3000

# 定义容器启动时要执行的默认命令。
# ["npm", "start"] 会执行 package.json 中 "scripts" 下的 "start" 脚本,
# 也就是 "node dist/server.js"，从而运行我们编译后的应用。
CMD [ "npm", "start" ]