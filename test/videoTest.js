
const { start } = require('../generater/video')
const json = require('./json/video.json')


const vpath = 'v_' + Date.now()
start({ json, vpath, time: 64.65, log: true })