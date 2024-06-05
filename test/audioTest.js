
const { start } = require('../generater/audio')
const json = require('./json/video.json')
const { getVideoTime } = require('../utils/index')


async function Test() {
  const path = '/home/mirror/yanqiang/material/guyu/p1.mp4'
  const apath = 'v_' + Date.now()
  const time = await getVideoTime(path)
  console.log('!!!!!!!!time', time);
  start({mediaPath : path, time, apath, log:true })
}

Test()