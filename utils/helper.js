

const { getFileInfo } = require('../utils/index.js')

// 转换JSON数据
exports.handleTransCommand = async function (data) {
  // 图层数据
  const layers =
    data?.layouts?.layers?.filter((item) => !!item.default && !!item.display) ||
    [];
  const arr = [];
  layers?.map(async (item, idx) => {
    if (item.is_anchor) {
      if (Array.isArray(item.default) && item.default?.length) {
        for (let i = 0; i < item.default.length; i++) {
          arr.push(
            getFileInfo({
              ...item,
              aindex: i,
              default: item.default[i],
            })
          );
        }
      } else if (item.default) {
        arr.push(getFileInfo(item));
      }
    } else {
      arr.push(getFileInfo(item));
    }
  });

  return arr;
}

