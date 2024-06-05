
const genVideo = require('./video2.js')
const genVideoSingle = require('./videoSingle.js')
const genAudio = require('./audio.js')
const { getVideoTime, getFileInfo } = require('../utils/index.js')

// 转换JSON数据
async function handleTransCommand(data) {
  // 图层数据
  const layers =
    data?.layouts?.layers?.filter((item) => !!item.default && !!item.display) ||
    [];
  const arr = [];
  layers?.map(async (item, idx) => {
    if (item.is_anchor) {
      if (Array.isArray(item.default) && item.default?.length) {
        for (let i = 0; i < item.default.length; i++) {
          arr.push(
            getFileInfo({
              ...item,
              aindex: i,
              default: item.default[i],
            })
          );
        }
      } else if (item.default) {
        arr.push(getFileInfo(item));
      }
    } else {
      arr.push(getFileInfo(item));
    }
  });

  return arr;
}

// 开启生成器
async function startGenerate (json, vpath, apath) {
  // const video = json.layouts.layers.find(item => item.is_anchor).default

  if (typeof json === 'object') {
    console.log('转换数据中..');
    console.time()
    // 转换JSON，获取必要数据信息
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

    global.nextPlayTime = genTime
    global.nextPlayFrameNum = genTime
    global.nextPrepareFrame = Math.floor((genTime - 2.5) * 25)
    global.nextChangeFrame = Math.floor(genTime * 25)

    console.timeEnd()
    console.log('genJson', genJson);
    console.log('完成，准备合成..');
    // 开启音频
    genAudio.start({mediaPath: video, apath, log: false,  time: genTime})
    // 开启视频
    genVideo.start({json: genJson, vpath, apath, time: genTime, log: false})
  } else {
    const time = await getVideoTime(json)
    global.nextPlayTime = time
    global.nextPlayFrameNum = time
    global.nextPrepareFrame = Math.floor((time - 2.5) * 25)
    global.nextChangeFrame = Math.floor(time * 25)

    console.log('!!!!!!!!!!!!json', json);
    // 开启视频
    genVideoSingle.start({dir: json, vpath, apath, time, log: true})
    // 开启音频
    genAudio.start({mediaPath: json, apath, log: true,  time})
  }

}

module.exports = startGenerate