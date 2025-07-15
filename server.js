const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // 导入并初始化Socket.IO服务器
  let socketServer;
  if (!dev) {
    try {
      const { initSocketServer } = require('./dist/lib/socket');
      socketServer = initSocketServer(server);
      console.log('Socket.IO服务器初始化成功');
    } catch (error) {
      console.error('Socket.IO服务器初始化失败:', error);
    }
  } else {
    try {
      // 在开发环境中，使用require.resolve找到正确的路径
      const socketPath = require.resolve('./src/lib/socket');
      const { initSocketServer } = require(socketPath);
      socketServer = initSocketServer(server);
      console.log('Socket.IO服务器初始化成功 (开发环境)');
    } catch (error) {
      console.error('Socket.IO服务器初始化失败 (开发环境):', error);
    }
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> 服务器运行在 http://localhost:${PORT}`);
  });
}); 