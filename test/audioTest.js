
const { start } = require('../generater/audio')
const json = require('./json/video.json')


const apath = 'v_' + Date.now()
start('/Users/yanqiang/Desktop/streamTest/hfs/kb/kb1.webm',apath, true )