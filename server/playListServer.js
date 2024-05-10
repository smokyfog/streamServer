const startGenerate = require('../generater/index')

class playList {
  constructor() {
    global.playList = []
    global.curPlayIndex = 0
  }

  // 设置播单
  set(list = []) {
    global.playList = list
    global.playListTmp = JSON.parse(JSON.stringify(list))
    if (global.curPlayIndex) {
      global.curPlayIndex = list?.length - 1
    } else {
      const vpath = 'v_' + Date.now()
      const apath = 'a_' + Date.now()
      this.prepare(list[0], vpath, apath)
      setTimeout(() => {
        global.PushServer?.change?.({
          videoDir: vpath,
          audioDir: apath
        })
      }, 1500);
    }
  }

  // 获取当前播单
  get() {
    return global.playList || []
  }

  // 准备生成数据
  prepare(info, vpath, apath) {
    startGenerate(info, vpath, apath)
  }

  // 插入播单
  insert(data = [], immediate = false) {
    if (immediate) {
      const vpath = 'v_' + Date.now()
      const apath = 'a_' + Date.now()
      this.prepare(data[0], vpath, apath)
      setTimeout(() => {
        global.PushServer?.change?.({
          videoDir: vpath,
          audioDir: apath
        })
      }, 1500);
    } else {
      global.playList.splice(global.curPlayIndex, 0, ...data)
    }
  }

  // 获取下一个是第几个
  getNextIdx() {
    const idx =  (global.curPlayIndex || 0) + 1
    if (global?.playList?.[idx]) {
      return idx
    } else {
      return 0
    }
  }

  // 准备下一个
  prepareNext() {
    const info = global.playList[this.getNextIdx()]
    const vpath = 'v_' + Date.now()
    const apath = 'a_' + Date.now()
    global.a_next = apath
    global.v_next = vpath
    this.prepare(info, v_next, a_next)
  }

  // 切换下一个
  nextForPrepared() {
    const idx = this.getNextIdx()
    global.curPlayIndex = idx
    global.PushServer?.change?.({
      videoDir: global.v_next,
      audioDir: global.a_next,
      index: 1
    })
  }
  
}

module.exports = playList