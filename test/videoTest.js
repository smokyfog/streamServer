

// const playlist = require('./json/playListSub.json')
// const vpath = 'v_' + Date.now()
// start({ dir: playlist[0], vpath, time: 10, log: true })




const playlist = require('./json/playList.json')
const { start } = require('../generater/video2')
const { handleTransCommand } = require('../utils/helper')

async function main(json) {

  const transJson = await handleTransCommand(json);
    // 等待JSON数据加载完成
    const genJson = await Promise.all(transJson);
    let video
    // 延迟
    let genTime = 0;
    for (let i = 0; i <= genJson.length; i++) {
      if (genJson[i]?.is_anchor) {
        video = genJson[i]?.default
        genJson[i].delay = genTime;
        genTime += genJson[i]?.duration;
      }
    }
  const vpath = 'v_' + Date.now()
  start({ json: genJson, vpath, time: 10, log: true })

}



main(playlist[0])