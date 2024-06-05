

const mixedChannel = require('../channel/mixedChannel.js')

// const rtmpUrl = 'rtmp://127.0.0.1:7002/local/mix'
// const rtmpUrl = 'rtmp://211.157.135.152:1985/myapp/test'


function startChannelServer ({ rtmp = '' }) {
  console.log('rtmp', rtmp);

  // 混流实例
  const mixedIns = new mixedChannel({
    rtmpUrl: rtmp,
    log: true
  })
  global.mixedIns = mixedIns
  mixedIns.start()
}

module.exports = {
  start: startChannelServer
}