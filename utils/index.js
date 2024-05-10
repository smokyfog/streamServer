const { exec } = require('child_process');

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

module.exports = {
  parseWavHeader,
  getVideoTime
}

