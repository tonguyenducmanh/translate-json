import fs from "fs/promises";
import util from "util";
// import file
import config from "../config.js";

export default async function () {
  // convert file text nhiều kết quả về 1 json duy nhất
  let result = {};
  let data = await fs.readFile(config.outputPath, config.formatText, (err) => {
    if (err) throw err;
  });
  if (data) {
    // lọc ra toàn bộ các đoạn bắt đầu bằng { và kết thúc bằng } đưa vào mảng
    try {
      let arr = [];
      while (data && data.length > 0 && data.length != "") {
        let startIndex = data.indexOf("{");
        let nextIndex = data.indexOf("}") + 1;
        let temp = data.substring(startIndex, nextIndex);
        if (temp && temp != "") {
          arr.push(temp);
        }
        data = data.substring(nextIndex);
        if (startIndex == nextIndex - 1) {
          break;
        }
      }
      if (arr) {
        arr.forEach((item) => {
          if (item && JSON.parse(item)) {
            result = { ...result, ...JSON.parse(item) };
          }
        });
      }
    } catch (error) {
      console.log(error);
    }

    // đưa object trải phẳng về object nhiều level nếu có thể
    if (result) {
      result = rollBackLevelObject(result);
    }

    // save vào file javascript
    if (result) {
      await fs.writeFile(
        config.outputJSPath,
        config.exportDefault + util.inspect(result),
        (err) => {
          if (err) throw err;
        }
      );
    }
  } else {
    if (err) throw err;
  }
}

/**
 * đưa object 1 level về thành object nhiều level
 * @param {*} originalObject object đã được trải phẳng
 * @returns object nhiều level giống cấu trúc ban đầu
 */
function rollBackLevelObject(originalObject) {
  let result = {};
  try {
    if (originalObject) {
      for (const key in originalObject) {
        if (!originalObject.hasOwnProperty(key)) {
          continue;
        }

        // nếu chưa ký tự ngăn cách tức là object
        if (key.includes(config.seperateLevelChar)) {
          if (result.hasOwnProperty[key]) {
          } else {
            result[key] = {};
          }
        } else {
          // không chưa ký tự ngăn cách thì gán thẳng value
          result[key] = originalObject[key];
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  return result;
}