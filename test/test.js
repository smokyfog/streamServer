const { startServer } = require('../server/index')
const { sleep } = require('../utils')
const playlist = require('./json/playList.json')
const playlistSub = require('./json/playListSub.json')

async function startTest({ rtmp = '' }) {
  // 开启服务
  startServer({rtmp})
  // 等待两秒
  await sleep(2)
  // 设置播单
  // global.playListServer?.set(playlist)
  global.playListServer?.set(playlistSub)
}

// 开启服务
startTest({
  rtmp: 'rtmp://jdpush.jd.com/live/24615988?auth_key=1724913103-0-0-c5eb3397b12aa800a542b0cb74775490'
})

// // 开启服务
// startTest({
//   rtmp: 'rtmp://192.168.0.170:7002/local/1'
// })