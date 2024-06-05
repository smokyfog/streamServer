

const pathToFfmpeg = require('ffmpeg-static')
console.log(pathToFfmpeg)
const fs = require("fs");
const { spawn } = require('child_process')
const {
  getFileTypeByUrl,
} = require("../utils");

let firstProcess;

function getCommand({ layers, time = 0, output = "" }) {
  let command = [];
  // 贴片
  let patch = ["color=0x00000000:1080x1920[bg]"];
  // 图层
  let scene = [];
  let audio = [];
  // 贴片个数
  const length = layers.length;
  // 生成命令
  layers?.map(async (item, idx) => {
    // 如果是动图
    if (item.default?.toLowerCase?.()?.trim?.()?.endsWith?.(".gif")) {
      command.push("-ignore_loop", 0);
    }
    if (getFileTypeByUrl(item.default) === 4 && !item.is_anchor) {
      command.push(`-an`);
      if (item.is_loop) {
        command.push("-stream_loop", "-1");
      }
    }
    if (item.is_anchor) {
      if (item.default?.toLowerCase?.()?.trim?.()?.endsWith?.(".webm")) {
        command.push(`-c:v`);
        command.push(`libvpx-vp9`);
      }
      audio.push({
        idx: idx,
        ...item,
      });
    }
    // 命令
    command.push("-i");
    command.push(item.default);
    const width = item.r - item.l;
    const height = item.b - item.t;

    // console.log("item.field", item.field);

    const gtTime = time - item.duration > 0 ? time - item.duration : time;
    const ltTime = item.duration > time ? time : item.duration;

    if (item.is_anchor) {
      // 贴片
      patch.push(
        `[${idx}:v]fps=25,setpts=PTS-STARTPTS+${item.delay
        }/TB,scale=${1080}:${1920}[tp${idx}]`
      );
    } else if (item.field === "user_uploaded_video_cos_path") {
      // 如果是近景视频
      patch.push(
        `[${idx}:v]fps=25,setpts=PTS-STARTPTS+${gtTime}/TB,scale=${width}:${height}[tp${idx}]`
      );
    } else {
      // 贴片
      patch.push(`[${idx}:v]fps=25,scale=${width}:${height}[tp${idx}]`);
    }

    if (idx === 0) {
      if (item.is_anchor) {
        // 第一个不命名直接输出
        scene.unshift(
          `[scene${length - idx - 2
          }][tp${idx}]overlay=${0}:${0}:enable='between(t,${item.delay},${item.delay + item.duration
          })'`
        );
      } else if (item.field === "user_uploaded_video_cos_path") {
        // 如果是近景视频，放置在视频尾部
        scene.unshift(
          `[scene${length - idx - 2}][tp${idx}]overlay=${item.l}:${item.t
          }:enable='gte(t,${gtTime})'`
        );
      } else if (
        getFileTypeByUrl(item.default) === 4 &&
        !item.is_anchor &&
        !item.is_loop
      ) {
        // 如果是近景视频，放置在视频尾部
        scene.unshift(
          `[scene${length - idx - 2}][tp${idx}]overlay=${item.l}:${item.t
          }:enable='between(t,${0},${ltTime})'`
        );
      } else {
        // 第一个不命名直接输出
        scene.unshift(
          `[scene${length - idx - 2}][tp${idx}]overlay=${item.l}:${item.t}`
        );
      }
    } else if (idx === layers?.length - 1) {
      if (item.is_anchor) {
        // 最后一个贴片和黑色背景放一起，放在最下层
        scene.unshift(
          `[bg][tp${idx}]overlay=${0}:${0}:enable='between(t,${item.delay},${item.delay + item.duration
          })'[scene${length - idx - 1}]`
        );
      } else if (item.field === "user_uploaded_video_cos_path") {
        // 如果是近景视频，放置在视频尾部
        scene.unshift(
          `[bg][tp${idx}]overlay=${item.l}:${item.t
          }:enable='gte(t,${gtTime})'[scene${length - idx - 1}]`
        );
      } else if (
        getFileTypeByUrl(item.default) === 4 &&
        !item.is_anchor &&
        !item.is_loop
      ) {
        scene.unshift(
          `[bg][tp${idx}]overlay=${item.l}:${item.t
          }:enable='between(t,${0},${ltTime})'[scene${length - idx - 1}]`
        );
      } else {
        // 最后一个贴片和黑色背景放一起，放在最下层
        scene.unshift(
          `[bg][tp${idx}]overlay=${item.l}:${item.t}[scene${length - idx - 1}]`
        );
      }
    } else {
      if (item.is_anchor) {
        scene.unshift(
          `[scene${length - idx - 2
          }][tp${idx}]overlay=${0}:${0}:enable='between(t,${item.delay},${item.delay + item.duration
          })'[scene${length - idx - 1}]`
        );
      } else if (item.field === "user_uploaded_video_cos_path") {
        // 如果是近景视频，放置在视频尾部
        scene.unshift(
          `[scene${length - idx - 2}][tp${idx}]overlay=${item.l}:${item.t
          }:enable='gte(t,${gtTime})'[scene${length - idx - 1}]`
        );
      } else if (
        getFileTypeByUrl(item.default) === 4 &&
        !item.is_anchor &&
        !item.is_loop
      ) {
        scene.unshift(
          `[scene${length - idx - 2}][tp${idx}]overlay=${item.l}:${item.t
          }:enable='between(t,${0},${ltTime})'[scene${length - idx - 1}]`
        );
      } else {
        scene.unshift(
          `[scene${length - idx - 2}][tp${idx}]overlay=${item.l}:${item.t
          }[scene${length - idx - 1}]`
        );
      }
    }
  });
  // // 滤镜参数
  let filter_complex = patch.join(";") + ";" + scene.join(";");
  // let audo_layer = ";";
  // let audo_complex = "";
  // audio.forEach((item) => {
  //   audo_layer += `[${item.idx}:a]adelay=${item.delay * 1000}|${item.delay * 1000
  //     }[a${item.idx}];`;
  //   audo_complex += `[a${item.idx}]`;
  // });

  // audo_complex += `amix=inputs=${audio.length}[a]`;

  // filter_complex += audo_layer + audo_complex;
  // 拼接命令
  const commands = [
    ...command,
    "-filter_complex",
    filter_complex,
    // "-map",
    // "[a]",
    "-y",
    "-t",
    time,
    "-preset",
    "veryfast", // ultrafast superfast  veryfast
    // 下面是图片帧的形式
    "-c:v",
    "mjpeg", // 设置输出视频编解码器为mjpeg
    "-q:v",
    "1", // 设置JPEG输出的质量，可以根据需要调整
    '-f', 'image2pipe', // 设置输出格式为image2pipe
    'pipe:1', // 将输出写入stdout

    // 下面是视频流的形式
    // '-vf', 'fps=25,scale=1080:1920', // 确保以指定的帧率输出帧
    // '-pix_fmt', 'rgb24', // 设置像素格式为rgb24
    // '-f', 'rawvideo', // 设置输出格式为rawvideo
    // 'pipe:1', // 将输出写入stdout

    // 下面是视频的形式
    // '-b:v', '2M',
    // "-c:v",
    // "libx264",
    // output,
  ];

  return commands || [];
}

// 开始任务
async function startTask({ json = json, vpath = '', time = 0, log = false }) {

  if (firstProcess) {
    firstProcess?.kill?.();
  }

  const commands = await getCommand({
    layers: json,
    time,
  })

  console.log('commands', commands);

  firstProcess = spawn(pathToFfmpeg, commands)

  let buffers = Buffer.alloc(0);

  global[vpath] = []


  // 下面三行测试直播输出视频流
  const frameSize = 1080 * 1920 * 3;
  let bufferPool = Buffer.alloc(frameSize);
  let bufferOffset = 0;

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
    
    // let chunkOffset = 0;
    // while (chunkOffset < buffer.length) {
    //   const bytesToCopy = Math.min(frameSize - bufferOffset, buffer.length - chunkOffset);
    //   buffer.copy(bufferPool, bufferOffset, chunkOffset, chunkOffset + bytesToCopy);
    //   bufferOffset += bytesToCopy;
    //   chunkOffset += bytesToCopy;

    //   if (bufferOffset === frameSize) {
    //     global[vpath].push(bufferPool);
    //     bufferPool = Buffer.alloc(frameSize);
    //     bufferOffset = 0;
    //   }
    // }
  })

  firstProcess.stderr.on('data', (data) => {
    // if (log) {
      console.error(data.toString());
    // }
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