
const genVideo = require('./video.js')
const genAudio = require('./audio.js')
const { getVideoTime } = require('../utils/index.js')


// 开启生成器
async function startGenerate (json, vpath, apath) {
  const video = json.layouts.layers.find(item => item.is_anchor).default
  
  const time = await getVideoTime(video)
  global.nextPlayTime = time
  global.nextPlayFrameNum = time
  global.nextPrepareFrame = Math.floor((time - 1.5) * 25)
  global.nextChangeFrame = Math.floor(time * 25)

  // 开启视频
  genVideo.start({json, vpath, time, log: true})
  // 开启音频
  genAudio.start(video, apath)
}

module.exports = startGenerate