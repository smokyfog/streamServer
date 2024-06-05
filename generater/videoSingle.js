

const pathToFfmpeg = require('ffmpeg-static')
console.log(pathToFfmpeg)
const { spawn } = require('child_process')

let firstProcess;


function getCommand(dir = '', time = 0) {
  // 拼接命令
  const commands = [
    '-i', dir,
    '-y',
    '-t', time,
    '-vf', 'fps=25,scale=1080:1920', // 确保以指定的帧率输出帧
    '-pix_fmt', 'rgb24', // 设置像素格式为rgb24
    '-f', 'rawvideo', // 设置输出格式为rawvideo
    'pipe:1', // 将输出写入stdout
  ]

  return commands || []
}

// 开始任务
function startTask({ dir = '', vpath = '', time = 0, log = false }) {

  if (firstProcess) {
    firstProcess?.kill?.();
  }

  const commands = getCommand(dir, time)

  console.log('commands', commands);

  firstProcess = spawn(pathToFfmpeg, commands)

  const frameSize = 1080 * 1920 * 3;
  let bufferPool = Buffer.alloc(frameSize);
  let bufferOffset = 0;

  global[vpath] = []

  firstProcess.stdout.on('data', (chunk) => {
    let chunkOffset = 0;
    while (chunkOffset < chunk.length) {
      const bytesToCopy = Math.min(frameSize - bufferOffset, chunk.length - chunkOffset);
      chunk.copy(bufferPool, bufferOffset, chunkOffset, chunkOffset + bytesToCopy);
      bufferOffset += bytesToCopy;
      chunkOffset += bytesToCopy;

      if (bufferOffset === frameSize) {
        global[vpath].push(bufferPool);
        bufferPool = Buffer.alloc(frameSize);
        bufferOffset = 0;
      }
    }

  })

  firstProcess.stderr.on('data', (data) => {
    if (log) {
      console.error(data.toString());
    }
  });

  firstProcess.on('close', (code) => {
    console.log('global[vpath]', global[vpath]?.length);
    if (log) {
      console.log(`11111- child process close all stdio with code ${code}`);
    }

  });

  firstProcess.on('error', (err) => {
    if (log) {
      console.log(`11111- child process err:  ${err}`);
    }
  });

  firstProcess.on('exit', (code) => {
    console.log(`11111- child process exited with code ${code}`);
  });
}


module.exports = {
  start: startTask
}