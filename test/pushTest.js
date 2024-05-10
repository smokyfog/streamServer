
const audioChannel = require('./channel/audioChannel.js')
const videoChannel = require('./channel/videoChannel.js')
const mixChannel = require('./channel/mixChannel.js')
// const RtmpServer = require('./server/rtmp.js')
const genVideo = require('../generater/video.js')
const genAudio = require('../generater/audio.js')
const Ctrl = require('./controller/index.js')

// 编排数据
const json = require('../../scene.json')
// 主视频
const video = json.layouts.layers.find(item => item.is_anchor).default

// const rtmpUrl = 'rtmp://211.157.135.152:1985/myapp/test';
const rtmpUrl = 'rtmp://127.0.0.1:7002/local/mix'
// 视频流
const rtmpVideoDef = 'rtmp://127.0.0.1:7002/local/video';
// 音频流
const rtmpAudioDef = 'rtmp://127.0.0.1:7002/local/audio';


// 开启rtmp视频
// RtmpServer.start()

// 开启视频
genVideo.start(json, 'temp/test_video1')
// 开启音频
genAudio.start(video, 'temp/test_audio1')


// 视频流实例
const vcIns = new videoChannel({
  rtmpUrl: rtmpVideoDef,
  log: false
})
global.vcIns = vcIns
vcIns.start()

// 音频流实例
const acIns = new audioChannel({
  rtmpUrl: rtmpAudioDef,
  log: false
})
global.acIns = acIns
acIns.start()

// 混流实例
const mixIns = new mixChannel({rtmpUrl, rtmpAudio: rtmpAudioDef, rtmpVideo: rtmpVideoDef, log: true })
global.mixIns = mixIns
mixIns.start()



setTimeout(() => {
  Ctrl.startPush('temp/test_video1', 'temp/test_audio1')
}, 1500)