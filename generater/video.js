

const pathToFfmpeg = require('ffmpeg-static')
console.log(pathToFfmpeg)
const { spawn } = require('child_process')
const json = require('../test/json/scene.json')

let firstProcess;


function getCommand (data = json, taskName = '', time = 0) {
  // 图层数据
  const layers =  data?.layouts?.layers?.filter(item => !!item.default) || []
  let command = []
  // 贴片
  let patch = ['color=0x00000000:1080x1920[bg]']
  // let audio = [0]
  // 图层
  let scene = []
  // 贴片个数
  const length = layers.length
  // 生成命令
  layers?.forEach((item, idx) => {
    // 如果是动图
    if (item.default?.toLowerCase?.()?.trim?.()?.endsWith?.('.gif')) {
      command.push('-ignore_loop', 0)
    }
    if (item.is_anchor) {
      command.push(`-c:v`)
      command.push(`libvpx-vp9`)
    }
    // 命令
    command.push('-i')
    command.push(item.default)
    const width = item.r - item.l
    const height = item.b - item.t
    
    if (item.is_anchor) {
      // 贴片
      patch.push(`[${idx}:v]fps=25,scale=${1080}:${1920}[tp${idx}]`)
    } else {
      // 贴片
      patch.push(`[${idx}:v]fps=25,scale=${width}:${height}[tp${idx}]`)
    }

    if (idx === 0) {
      if (item.is_anchor) {
        // 第一个不命名直接输出
        scene.unshift(
          `[scene${length -idx - 2}][tp${idx}]overlay=${0}:${0}`
        )
      } else {
        // 第一个不命名直接输出
        scene.unshift(
          `[scene${length -idx - 2}][tp${idx}]overlay=${item.l}:${item.t}`
        )
      }
    } else if (idx === layers?.length - 1) {
      if (item.is_anchor) {
        // 最后一个贴片和黑色背景放一起，放在最下层
        scene.unshift(
          `[bg][tp${idx}]overlay=${0}:${0}[scene${length - idx - 1}]`
        )
      } else {
        // 最后一个贴片和黑色背景放一起，放在最下层
        scene.unshift(
          `[bg][tp${idx}]overlay=${item.l}:${item.t}[scene${length - idx - 1}]`
        )
      }
      
    } else {
      if (item.is_anchor) {
        scene.unshift(
          `[scene${length -idx - 2}][tp${idx}]overlay=${0}:${0}[scene${length - idx - 1}]`
        )
      } else {
        scene.unshift(
          `[scene${length -idx - 2}][tp${idx}]overlay=${item.l}:${item.t}[scene${length - idx - 1}]`
        )
      }
     
    }
  })
  // 滤镜参数
  let filter_complex = patch.join(';') + ';' + scene.join(';')


  // let audo_complex = ''
  // audio.forEach(item => {
  //   audo_complex += `[${item}:a]`
  // })

  // audo_complex += `amix=inputs=${audio.length}[a]`
   // 拼接命令
   const commands = [
    ...command,
    '-filter_complex',
    filter_complex, 
    // "-filter_complex",
    // audo_complex,
    '-y',
    '-t', time,
    '-preset', 'veryfast', // ultrafast superfast  veryfast 
    '-c:v', 'mjpeg', // 设置输出视频编解码器为mjpeg
    '-q:v', '25', // 设置JPEG输出的质量，可以根据需要调整
    
    '-f', 'image2pipe', // 设置输出格式为image2pipe
    'pipe:1', // 将输出写入stdout
    // "-c:v",
    // "libx264",
    // '/Users/yanqiang/Documents/gyjswrok/diaoyan/ffmpeg/app/test/test5.mp4'
  ]


    
  return commands || []
}

// 开始任务
function startTask({json = json, vpath = '', time = 0, log = false}) {

  if (firstProcess) {
    firstProcess?.kill?.();
  }

  const commands = getCommand(json, vpath, time)

  console.log('commands', commands);

  firstProcess = spawn(pathToFfmpeg, commands)

  let buffers = Buffer.alloc(0);

  console.log('!!!!!!!!!!!!!!!!!!!!video vpath', vpath);

  global[vpath] = []

  firstProcess.stdout.on('data', (buffer) => {
    // 寻找图片结尾的标志
    const jpegEndIndex = buffer.indexOf(Buffer.from([0xFF, 0xD9]));
    if (jpegEndIndex !== -1) {
      buffers = Buffer.concat([buffers, buffer.slice(0, jpegEndIndex + 2)])  
      global[vpath].push(buffers)
      buffers = Buffer.alloc(0);
      buffers = Buffer.concat([buffers, buffer.slice(jpegEndIndex + 2)])  
    } else {
      buffers = Buffer.concat([buffers, buffer])  
    }
  })

  firstProcess.stderr.on('data', (data) => {
    if (log) {
      console.error(data.toString());
    }
  });

  firstProcess.on('close', (code) => {
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