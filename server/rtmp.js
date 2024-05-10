

const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 7002,
    // chunk_size: 600,
    // gop_cache: true,
    ping: 60,
    ping_timeout: 30
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};

module.exports = {
  start: () => {
    const nms = new NodeMediaServer(config);
    nms.run();
    console.log('RTMP server is running on port 7002');
    console.log('HTTP server is running on port 8000');
  }
}

