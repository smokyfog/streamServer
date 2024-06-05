
class pushServer {
  constructor({ fps = 25, index = 1, videoDir = '', audioDir = '' }) {
    this.errNum = 0
    this.fps = fps
    this.index = index
    this.videoDir = videoDir
    this.audioDir = audioDir
  }

  // 插入数据
  change({ videoDir = '', audioDir = '', index = 1 }) {
    console.log('videoDir', videoDir);
    console.log('audioDir', audioDir);
    global.curPlayTime = global.curPlayTime
    global.curPlayFrameNum = global.nextPlayFrameNum
    global.prepareFrame = global.nextPrepareFrame
    global.changeFrame = global.nextChangeFrame 
    this.errNum = 0
    if (this.audioDir) {
      const afterDir = this.audioDir
      setTimeout(() => {
        console.log('清除上次音频缓存数据', afterDir);
        delete global?.[afterDir]
      }, 1000)
    }

    if (this.videoDir) {
      const afterDir = this.videoDir
      setTimeout(() => {
        console.log('清除上次视频缓存数据', afterDir);
        delete global?.[afterDir]
      }, 1000)
    }
    this.videoDir = videoDir
    this.audioDir = audioDir
    this.index = index

  }

  // 开启服务
  start1() {
    if (global.interval) {
      clearInterval(global.interval)
    }

    global.interval = setInterval(() => {
      // 不允许没有目录
      if (!this.videoDir || !this.audioDir) {
        return
      }
      if ((this.index + 1) === global.prepareFrame) {
        global.playListServer?.prepareNext?.()
        console.log('预生成下一个视频', global.a_next, global.v_next );
      }
      try {
        const abuffer = this.pushAudio2()
        const vbuffer = this.pushVideo()

        Promise.all([abuffer, vbuffer]).then(buffer => {
          // global.acIns.input(buffer[0]);
          // global.vcIns.input(buffer[1]);

          global.mixedIns.inputVideo(buffer[1]);
          global.mixedIns.inputAudio(buffer[0]);
          this.index++
        }).catch(err => {
          console.log(err);
        })

      } catch (err) {
        console.log('错误，可能是文件尚未生成，本次等待', err);
      }
      if ((this.index + 1) === global.changeFrame) {
        global.playListServer?.nextForPrepared?.()
        console.log('！！！！！！切换下一个' );
      }
    }, 1000 / this.fps)
  }

  // 开启服务
  start() {
    const interval = 1000 / this.fps
    let nextExecutTime = Date.now()
    this.serverStart = true
    const that = this
    // console.log('----------经过了8888');
    // console.log('interval', interval);
    setInterval(() => {
      if (Date.now() >= nextExecutTime) {
        // console.log('----------经过了11');
        // console.log('that.videoDir', that.videoDir);
        // console.log('that.audioDir', that.audioDir);
        // 不允许没有目录
        if (!that.videoDir || !that.audioDir) {
          return
        }
        // console.log('interval', interval);
        nextExecutTime += interval
        if ((this.index + 1) === global.prepareFrame) {
          global.playListServer?.prepareNext?.()
          console.log('预生成下一个视频', global.a_next, global.v_next );
        }
        try {
          const abuffer = this.pushAudio2()
          const vbuffer = this.pushVideo()
  
          Promise.all([abuffer, vbuffer]).then(buffer => {
            // global.acIns.input(buffer[0]);
            // global.vcIns.input(buffer[1]);
            global.mixedIns.inputVideo(buffer[1]);
            // console.log('buffer[0]?.length', buffer[0]?.length);
            if (buffer[0]?.length) {
              global.mixedIns.inputAudio(buffer[0]);
            }
            this.index++
          }).catch(err => {
            console.log(err);
            console.log('错误，可能是文件尚未生成，本次等待', err);
            // if (global.changeFrame - (this.index + 1) <= 10) {
            //   global.playListServer?.nextForPrepared?.()
            //   console.log('如果小于十帧，则直接切换下一个' );
            // }
          })
  
          // console.log(global.changeFrame, this.index + 1);
          if ((this.index + 1) === global.changeFrame) {
            global.playListServer?.nextForPrepared?.()
            console.log('！！！！！！切换下一个' );
          }
        } catch (err) {
          console.log('错误，可能是文件尚未生成，本次等待', err);
          // console.log(global.changeFrame, this.index + 1);
        }
      }
    }, 10)
      
  }

  // 获取视频文件
  pushVideo() {
    let buffer = global[this.videoDir]?.[this.index]
    return new Promise((resolve, rejects) => {
      if (buffer?.length) {
        resolve(buffer)
      } else {
        rejects('视频数据未加载')
      }
    })
  }

   // 获取视频文件
   pushAudio2() {
    const wavFrameNum = Math.floor((44100 * 2) / 25);
    const totalFrames = global[this.audioDir].length;

    // 计算最后一个片段的起始和结束索引
    const startIdx = this.index * wavFrameNum;
    const endIdx = Math.min((this.index + 1) * wavFrameNum, totalFrames);

    // // 计算实际的音频帧数
    const actualFrames = endIdx - startIdx;

    let speechSegment

    if (actualFrames < wavFrameNum) {
      console.log('小于预期');
    }

    // // 如果实际帧数少于预期的帧数
    // if (actualFrames < wavFrameNum) {
    //   // 计算需要填充的静音帧数
    //   const silentFrames = wavFrameNum - actualFrames;

    //   // 创建一个静音缓冲区
    //   const silentBuffer = Buffer.alloc(silentFrames, 0); // 16位音频，每个样本占两个字节

    //   // 将静音缓冲区添加到最后一个片段的末尾
    //   speechSegment = Buffer.concat([
    //       global[this.audioDir].slice(startIdx, endIdx), // 实际音频数据
    //       silentBuffer // 静音数据
    //   ]);

    // } else {
    //   // 如果实际帧数已经足够，直接使用实际音频数据
    //   speechSegment = global[this.audioDir].slice(startIdx, endIdx);
    // }

    speechSegment = global[this.audioDir].slice(startIdx, endIdx);

    return new Promise((resolve, rejects) => {
      // console.log('speechSegment', speechSegment);
      resolve(speechSegment)
    })
  }

  // 获取视频文件
  pushAudio() {
    const wavFrameNum = Math.floor((44100 * 2) / 25);
    const startIdx = this.index * wavFrameNum;
    const endIdx = (this.index + 1) * wavFrameNum;

    console.log('global[this.audioDir].length', global[this.audioDir].length, startIdx, endIdx);
    const speechSegment = global[this.audioDir].slice(startIdx, endIdx);

    return new Promise((resolve, rejects) => {
      if (speechSegment?.length) {
        resolve(speechSegment)
      } else {
        rejects('音频数据未加载')
      }
    })
  }

}

module.exports = pushServer