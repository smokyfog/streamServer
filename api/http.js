const Koa = require('koa');  
const Router = require('koa-router');  
const bodyParser = require('koa-bodyparser');  
const index = require('./routes/index')

const app = new Koa();  
const router = new Router();  
  
function startServer() {
  app.use(bodyParser()); // 解析请求体  
  app.use(router.routes());  
  app.use(router.allowedMethods());  
  app.use(index.routes(), index.allowedMethods())
    
  app.listen(3030, () => {  
    console.log('服务器已启动在3030端口');  
  });
}

module.exports = {
  start: startServer
}

