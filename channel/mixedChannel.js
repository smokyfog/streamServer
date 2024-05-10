
const { spawn } = require('child_process');

// 视频流
const rtmpUrl1 = 'rtmp://127.0.0.1:7002/local/video';

class videoChannel {
  constructor({ rtmpUrl = rtmpUrl1, fps = 25, log = true }) {
    this.videoStream = undefined
    this.audioStreamPip = undefined
    this.videoStreamPip = undefined
    this.rtmpUrl = rtmpUrl
    this.fps = fps
    this.log = log

    console.log('视频流 rtmp', this.rtmpUrl);
    console.log('视频流 fps', this.fps);
    console.log('视频流 log', this.log);
  }

  // 开启视频通道
  start() {
    if (this.videoStream) {
      this.videoStream.kill()
    }
    console.log('即将推流到', this.rtmpUrl);

    try {
      // 启动FFmpeg进程
      this.videoStream = spawn('ffmpeg', [
        '-y',
        '-an', 
        '-f', 'mjpeg',   // 添加这一行
        // '-pix_fmt', 'bgr24',
        '-r', '25',
        '-i', 'pipe:0',
        '-f', 's16le',
        '-acodec', 'pcm_s16le',
        '-i', 'pipe:1',
        '-preset', 'fast',
        // '-profile:v', 'baseline',
        '-tune', 'zerolatency',
        '-bf', '0',
        '-g', '1',
        '-b:v', "15000k",
        '-ac', '1',
        '-ar', '44100',
        '-acodec', 'pcm_s16le',
        '-c:v', 'libx264',

        //  '-shortest',
        '-rtmp_buffer',
        '300',  
        '-f', 'flv',
        this.rtmpUrl                 // RTMP输出地址
      ]);

      console.log(this.videoStream.stdio?.length);

      this.videoStream.stdout.on('data', (data) => {
        console.log(`videoStream stdout: ${data}`);
      });
      
      this.videoStream.stderr.on('data', (data) => {
        console.error(`videoStream stderr: ${data}`);
      });

      this.videoStream.stderr.on('data', (data) => {
        // if (this.log) {
          console.error(`videoStream stderr: ${data}`);
        // }
      });

      this.videoStream.on('exit', (code) => {
          console.log(`99999999999- exit !!! child exit exited with code ${code}`);
      });

      this.videoStream.on('close', (code) => {
        // if (this.log) {
          console.log(`99999999999  close !!!! child process exited with code ${code}`);
        // }
      });

        // 监听 stdin 的 close 事件，确保等待输入后再关闭
      this.videoStream.stdin.on('close', () => {
        console.log('99999999999  stdin closed, waiting for input...');
      });
    } catch (err) {
      console.log('!!!!!!!!!!!!!!!!!!!!!!! 运行出错');
    }
     
  }

  // 输入视频数据
  inputVideo(frameBuffer) {
    if (frameBuffer) {
      this.videoStream.stdio[0].write(frameBuffer)
    }
    
  }

   // 输入视频数据
   inputAudio(frameBuffer) {
    this.videoStream.stdio[1].write(frameBuffer)
  }

  // 停止视频流
  stop() {
    if (this.videoStream) {
      this.videoStream.stdin.end();
      this.videoStream.kill()
    }
    
  }
}


module.exports = videoChannel