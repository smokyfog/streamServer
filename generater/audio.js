

// const pathToFfmpeg = require('ffmpeg-static')
const { spawn } = require('child_process');

let firstProcess

// 开启音频合成任务
const startAudioTask = ({mediaPath, apath = '', time = 0, log = false}) => {
  console.time()
    // 拼接命令
  const commands = [
    '-y',
    '-i', 
    mediaPath, 
    // "-t",
    // time,
    '-af',
    `apad=pad_dur=${time},atrim=duration=${time}`,
    '-vn', 
    '-acodec', 
    'pcm_s16le', 
    '-ar', 
    '44100', 
    '-ac', 
    '1', 
    '-f',
    'wav',
    // '/home/mirror/yanqiang/streamServer/output/output.wav'
    'pipe:1', 
  ]
  if (firstProcess) {
    firstProcess.kill();
  }

  console.log('commands', commands);

  firstProcess = spawn('ffmpeg', commands);
  
  console.log('!!!!!!!!!!!!!!!!!!!!audio apath', apath);

  // 创建一个 Buffer 对象来存储音频数据
  global[apath] = Buffer.alloc(0);
  
  firstProcess.stdout.on('data', (data) => {
    // 将音频数据追加到 Buffer 中
    global[apath] = Buffer.concat([global[apath], data]);
  });

  firstProcess.stderr.on('data', (data) => {
    if (log) {
      console.error('audio log', data.toString()); // 输出标准错误信息
    }
  });

  

  firstProcess.on('close', (code) => {
    console.timeEnd()
    if (log) {
      console.log(`child process close all stdio with code ${code}`);
    }
  });

  firstProcess.on('error', (err) => {
    if (log) {
      console.log(`audio gen child process err:  ${err}`);
    }
  });

  firstProcess.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
    console.log('global[apath].length', global[apath].length);

  });
}

// startAudioTask('/Users/yanqiang/Documents/gyjswrok/diaoyan/ffmpeg/anchor.webm')

module.exports = {
  start: startAudioTask
}