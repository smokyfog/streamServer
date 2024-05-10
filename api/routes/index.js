const router = require('koa-router')()
const { startServer } = require('../../server/index')

// 开启推流服务
router.post('/start', async (ctx, next) => {  
  const { rtmp = '' } = ctx.request.body;  
  try {
    startServer({rtmp})
    ctx.body = { code: 0, msg: '启动成功！' }
  } catch (err) {
    console.log(err);
    ctx.body = { code: -1, msg: '启动失败！' }
  }
});


// 设置播单
router.post('/playlist/set', async (ctx, next) => {
  try {
    const { playlist = [] } = ctx.request.body;  
    global.playListServer?.set(playlist)
    ctx.body = { code: 0, msg: '成功！', data: null }
  } catch (err) {
    console.log(err);
    ctx.body = { code: -1, msg: '启动失败！' }
  }
});


// 获取当前播单数据
router.get('/playlist', async (ctx, next) => {
  try {
    ctx.body = {
      code: 0,
      msg: '成功！',
      data: global.playListServer?.get?.() || [] 
    }
  } catch (err) {
    console.log(err);
    ctx.body = { code: -1, msg: '启动失败！' }
  }
});

// 插入直播数据  
router.post('/insert', async (ctx, next) => {  
  const { data = [], immediate = false } = ctx.request.body;  
  global.playListServer?.insert?.(data, immediate)
  ctx.body = { code: 0, message: '插入直播成功' }; 
});  


module.exports = router
