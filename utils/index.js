
const fs = require("fs");
const { exec } = require('child_process');

// 获取文件详情并赋值真实宽高和位置
async function getFileInfo(info) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(info.default)) {
      throw new Error(info.default + "： 文件不存在");
    }
    getMediaInfo(info.default).then((res) => {
      // console.log("res", res);
      const wbox = info.r - info.l;
      const ybox = info.b - info.t;
      const scaleBox = wbox / ybox;
      const scaleItem = res.width / res.height;
      let useWidth = 0;
      let useHeight = 0;
      if (scaleBox > scaleItem) {
        useHeight = ybox;
        useWidth = ybox * scaleItem;
        info.l = info.l + (wbox - useWidth) / 2;
        info.r = info.l + useWidth;
      } else {
        useWidth = wbox;
        useHeight = wbox / scaleItem;
        info.t = info.t + (ybox - useHeight) / 2;
        info.b = info.t + useHeight;
      }
      resolve({
        ...info,
        duration: res.duration || 0,
      });
    });
  });
}

function checkDirectoryExists(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.access(directoryPath, fs.constants.F_OK, (err) => {
      if (err) {
        // 文件夹不存在
        if (err.code === 'ENOENT') {
          resolve(false);
        } else {
          reject(err);
        }
      } else {
        // 文件夹存在
        resolve(true);
      }
    });
  });
}

// 如果文件夹不存在则新建文件夹
function ensureDirectoryExists(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.access(directoryPath, fs.constants.F_OK, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // 文件夹不存在，创建文件夹
          fs.mkdir(directoryPath, { recursive: true }, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(true); // 文件夹已创建
            }
          });
        } else {
          reject(err);
        }
      } else {
        resolve(true); // 文件夹已存在
      }
    });
  });
}

// 解析参数
function parseArgs () {
  const args = process.argv.slice(2); // Remove the first two default args
  const result = {};

  for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('-')) {
          const key = arg.replace(/^-+/, '');
          const nextArg = args[i + 1];

          if (nextArg && !nextArg.startsWith('-')) {
              try {
                  result[key] = JSON.parse(nextArg);
              } catch (e) {
                  result[key] = nextArg;
              }
              i++;
          } else {
              result[key] = true; // Handle flags without values
          }
      }
  }

  return result;
};

// 根据文件链接获取文件类型
function getFileTypeByUrl(url) {
  const extension = url
    ?.split?.(".")
    ?.[url?.split?.(".")?.length - 1]?.toLowerCase?.();
  const imageExtensions = ["jpg", "jpeg", "png", "bmp"];
  const videoExtensions = ["mp4", "avi", "mkv", "mov", "webm"];
  const audioExtensions = ["mp3", "wav"];
  const gifExtensions = ['gif'];
  // const excelExtensions = ["xlsx", "xls"];
  const txtExtensions = ["txt"];

  if (txtExtensions.includes(extension)) {
    return 1;
  } else if (imageExtensions.includes(extension)) {
    return 2;
  } else if (audioExtensions.includes(extension)) {
    return 3;
  } else if (videoExtensions.includes(extension)) {
    return 4;
  }else if (gifExtensions.includes(extension)) {
    return 5;
  } else {
    return 0;
  }
}

// 获取媒体文件信息
function getMediaInfo(mediaPath) {
  return new Promise((resolve, reject) => {
    // FFmpeg 命令行
    const ffmpegCommand = `ffmpeg -i "${mediaPath}" 2>&1`;

    // 执行 FFmpeg 命令
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        // return;
      }

      // 使用正则表达式从输出中提取时长、宽度和高度信息
      const durationMatch = stdout.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      const widthMatch = stdout.match(/(\d{3,})x(\d{3,})/);

      // 获取到的时长字符串
      const durationInSeconds = durationMatch ? parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60 + parseFloat(durationMatch[3]) : 0;

      // 获取到的宽度和高度
      const width = widthMatch ? parseInt(widthMatch[1]) : 0;
      const height = widthMatch ? parseInt(widthMatch[2]) : 0;

      resolve({ duration: durationInSeconds, width, height });
    });
  });
}


function parseWavHeader(view) {
  const riffChunkID = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riffChunkID !== 'RIFF') {
    throw new Error('Not a valid RIFF file');
  }

  const fileSize = view.getUint32(4, true);
  const waveChunkID = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (waveChunkID !== 'WAVE') {
    throw new Error('Not a valid WAV file');
  }

  const fmtChunkID = String.fromCharCode(view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15));
  if (fmtChunkID !== 'fmt ') {
    throw new Error('Not a valid WAV file (missing fmt chunk)');
  }

  const formatSize = view.getUint32(16, true);
  // 解析更多的格式信息，具体取决于 WAV 文件的格式

  const dataOffset = 12 + formatSize; // WAV 文件头部长度
  return { dataOffset };
}


// 获取视频时长
function getVideoTime (videoPath) {
  return new Promise((resolve, reject) => {
    // FFmpeg 命令行
    const ffmpegCommand = `ffmpeg -i "${videoPath}" 2>&1 | grep "Duration" | cut -d ' ' -f 4 | sed s/,//`;

    // 执行 FFmpeg 命令
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      // 获取到的时长字符串
      const durationString = stdout.trim();

      // 将时长字符串转换为秒数
      const timeArray = durationString.split(':');
      const durationInSeconds = parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60 + parseFloat(timeArray[2]);

      console.log(`视频时长：${durationInSeconds} 秒`);
      resolve(durationInSeconds)
    });
  })
  
}


function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time * 1000)
  })
}

module.exports = {
  sleep,
  getFileInfo,
  parseArgs,
  getMediaInfo,
  parseWavHeader,
  getVideoTime,
  getFileTypeByUrl,
  checkDirectoryExists,
  ensureDirectoryExists
}

