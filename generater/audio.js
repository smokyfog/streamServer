



// const pathToFfmpeg = require('ffmpeg-static')
const { spawn } = require('child_process');

let firstProcess

// 开启音频合成任务
const startAudioTask = (mediaPath, taskName = '', log = false) => {

    // 拼接命令
  const commands = [
    '-i', 
    mediaPath, 
    '-vn', 
    '-acodec', 
    'pcm_s16le', 
    '-ar', 
    '44100', 
    '-ac', 
    '1', 
    '-f',
    'wav',
    'pipe:1', 
  ]
  if (firstProcess) {
    firstProcess.kill();
  }

  console.log('commands', commands);

  firstProcess = spawn('ffmpeg', commands);
  
  console.log('!!!!!!!!!!!!!!!!!!!!audio taskName', taskName);

  // 创建一个 Buffer 对象来存储音频数据
  global[taskName] = Buffer.alloc(0);
  
  firstProcess.stdout.on('data', (data) => {
    // 将音频数据追加到 Buffer 中
    global[taskName] = Buffer.concat([global[taskName], data]);
  });

  firstProcess.stderr.on('data', (data) => {
    if (log) {
      console.error(data.toString()); // 输出标准错误信息
    }
  });

  

  firstProcess.on('close', (code) => {
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
    console.log('global[taskName].length', global[taskName].length);

  });
}

// startAudioTask('/Users/yanqiang/Documents/gyjswrok/diaoyan/ffmpeg/anchor.webm')

module.exports = {
  start: startAudioTask
}