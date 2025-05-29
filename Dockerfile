
FROM oven/bun:1.0.25


WORKDIR /app


COPY package.json bun.lockb ./


RUN bun install --frozen-lockfile


COPY . .


RUN bun run build


ENV NODE_ENV=production
ENV PORT=3000


EXPOSE 3000

# 启动服务
CMD ["bun", "run", "start:sse"]

