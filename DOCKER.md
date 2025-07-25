# 🐳 Docker 使用指南

本项目提供了完整的 Docker 化解决方案，支持开发、测试和生产环境。

## 📋 目录

- [快速开始](#快速开始)
- [GitHub Container Registry](#github-container-registry)
- [本地构建](#本地构建)
- [开发环境](#开发环境)
- [生产部署](#生产部署)
- [故障排除](#故障排除)

## 🚀 快速开始

### 使用预构建镜像

```bash
# 从 GitHub Container Registry 拉取最新镜像
docker pull ghcr.io/bnb-chain/bnbchain-mcp-1:latest

# SSE 模式运行 (默认)
docker run --rm -p 3000:3000 ghcr.io/bnb-chain/bnbchain-mcp-1:latest

# STDIO 模式运行
docker run --rm ghcr.io/bnb-chain/bnbchain-mcp-1:latest node dist/index.js
```

### 使用 Docker Compose

```bash
# SSE 模式 (推荐)
docker-compose --profile sse up

# STDIO 模式
docker-compose --profile stdio up

# 开发模式 (热重载)
docker-compose --profile dev up
```

## 📦 GitHub Container Registry

### 自动构建

GitHub Actions 会在以下情况自动构建并发布镜像：

- 推送到 `main` 或 `develop` 分支
- 创建版本标签 (如 `v1.0.0`)
- 手动触发 workflow

### 镜像标签策略

| 触发条件 | 标签 | 示例 |
|---------|------|------|
| 主分支推送 | `latest` | `ghcr.io/owner/repo:latest` |
| 版本标签 | 语义版本 | `ghcr.io/owner/repo:v1.0.0` |
| 分支推送 | 分支名 | `ghcr.io/owner/repo:develop` |
| PR | PR编号 | `ghcr.io/owner/repo:pr-123` |

### 手动触发构建

1. 访问 GitHub 仓库的 Actions 页面
2. 选择 "构建和发布 Docker 镜像" workflow
3. 点击 "Run workflow" 按钮

## 🔨 本地构建

### 生产镜像

```bash
# 构建镜像
docker build -t bnbchain-mcp:latest .

# 多平台构建
docker buildx build --platform linux/amd64,linux/arm64 -t bnbchain-mcp:latest .
```

### 开发镜像

```bash
# 构建开发镜像
docker build -f Dockerfile.dev -t bnbchain-mcp:dev .
```

## 💻 开发环境

### 使用 Docker Compose 开发

```bash
# 启动开发环境 (支持热重载)
docker-compose --profile dev up

# 查看日志
docker-compose --profile dev logs -f

# 停止服务
docker-compose --profile dev down
```

### 开发环境特性

- ✅ 代码热重载
- ✅ 源代码映射
- ✅ 开发依赖包含
- ✅ 调试端口暴露

## 🚀 生产部署

### 环境变量

| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| `NODE_ENV` | `production` | 运行环境 |
| `PORT` | `3000` | SSE 模式端口 |
| `LOGLEVEL` | `info` | 日志级别 |

### 部署示例

#### Docker Run

```bash
# SSE 模式 (默认)
docker run -d \
  --name bnbchain-mcp-sse \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e LOGLEVEL=info \
  ghcr.io/bnb-chain/bnbchain-mcp-1:latest

# STDIO 模式
docker run -d \
  --name bnbchain-mcp-stdio \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e LOGLEVEL=info \
  ghcr.io/bnb-chain/bnbchain-mcp-1:latest \
  node dist/index.js
```

#### Docker Compose

```bash
# 生产环境 - SSE 模式 (推荐)
docker-compose --profile sse up -d

# 生产环境 - STDIO 模式
docker-compose --profile stdio up -d
```

#### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bnbchain-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bnbchain-mcp
  template:
    metadata:
      labels:
        app: bnbchain-mcp
    spec:
      containers:
      - name: bnbchain-mcp
        image: ghcr.io/bnb-chain/bnbchain-mcp-1:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        args: ["node", "dist/index.js", "--sse"]
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: bnbchain-mcp-service
spec:
  selector:
    app: bnbchain-mcp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 🔍 健康检查

镜像内置了健康检查功能：

```bash
# 检查容器健康状态
docker ps --filter "name=bnbchain-mcp"

# 查看健康检查日志
docker inspect bnbchain-mcp-sse | jq '.[0].State.Health'
```

## 🛠 故障排除

### 常见问题

#### 1. 端口冲突

```bash
# 检查端口占用
lsof -i :3000

# 使用不同端口
docker run -p 3001:3000 ...
```

#### 2. 内存不足

```bash
# 设置内存限制
docker run --memory=512m ...

# 监控资源使用
docker stats bnbchain-mcp-sse
```

#### 3. 权限问题

```bash
# 检查文件权限
docker exec -it bnbchain-mcp-sse ls -la

# 以root用户调试
docker exec -it --user root bnbchain-mcp-sse /bin/sh
```

### 调试命令

```bash
# 查看容器日志
docker logs bnbchain-mcp-sse

# 进入容器调试
docker exec -it bnbchain-mcp-sse /bin/sh

# 检查环境变量
docker exec bnbchain-mcp-sse printenv

# 测试网络连接
docker exec bnbchain-mcp-sse wget -qO- http://localhost:3000/health
```

## 📈 监控和日志

### 日志收集

```bash
# 使用 Docker 日志驱动
docker run --log-driver=json-file --log-opt max-size=10m --log-opt max-file=3 ...

# 结合 Fluentd 收集日志
docker run --log-driver=fluentd --log-opt fluentd-address=localhost:24224 ...
```

### 监控指标

```bash
# 获取容器统计信息
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# 导出 Prometheus 指标 (如果应用支持)
curl http://localhost:3000/metrics
```

## 🔐 安全最佳实践

1. **使用非 root 用户运行**：镜像已配置为使用 `nodejs` 用户
2. **最小权限原则**：只暴露必要的端口
3. **定期更新**：使用自动构建的最新镜像
4. **漏洞扫描**：CI/CD 自动进行安全扫描
5. **敏感信息**：通过环境变量或 secrets 管理

---

如有问题，请查看 [Issues](https://github.com/bnb-chain/bnbchain-mcp-1/issues) 或创建新的 issue。 