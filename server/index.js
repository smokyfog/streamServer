
const channelServer = require('../server/channelServer')
const pushServer = require('../server/pushServer')
const playList = require('./playListServer')

// 开启服务
function startServer({rtmp = '' }) {
  // 通道服务
  channelServer.start({rtmp})
  // 推流服务
  global.PushServer = new pushServer({})
  global.PushServer.start()
  // 播单服务
  global.playListServer = new playList()
}

module.exports = {
  startServer
}