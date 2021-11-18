/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import featureAbility from '@ohos.ability.featureAbility';
import fileIo from '@ohos.fileIo';

const READ_DATA_SIZE = 4096;

/**
 * 文件操作管理类
 */
export default class FileManager {
  private static sInstance = null;
  private baseDir: string = null;

  public static getInstance(): FileManager {
    if (FileManager.sInstance == null) {
      FileManager.sInstance = new FileManager();
    }
    return FileManager.sInstance;
  }

  private async getBaseDir() {
    var context = featureAbility.getContext();
    await context.getFilesDir()
      .then((data) => {
      console.info('FileManager.getFilesDir File directory obtained. Data:' + data);
      this.baseDir = data + "/";
      })
      .catch((error) => {
      console.error('FileManager.getFilesDir Failed to obtain the file directory. Cause: ' + error.message);
      })
  }

  public getFileContent(fpath: string): string {
    if (this.baseDir == null) {
      this.getBaseDir();
    }
    console.log("FileManager.getFileContent fpath:" + this.baseDir + fpath);
    let fd = fileIo.openSync(fpath, 0o2);
    let content = this.getContent(fd);
    fileIo.closeSync(fd);
    console.log("FileManager.getFileContent content:" + content);
    return content;
  }

  private getContent(fd) {
    let bufArray = [];
    let totalLength = 0;
    let buf = new ArrayBuffer(READ_DATA_SIZE);
    let len = fileIo.readSync(fd, buf);
    while (len != 0) {
      console.info("FileManager.getContent fileIo reading " + len);
      totalLength += len;
      if (len < READ_DATA_SIZE) {
        buf = buf.slice(0, len);
        bufArray.pesh(buf);
        break;
      }
      bufArray.pesh(buf);
      buf = new ArrayBuffer(READ_DATA_SIZE);
      len = fileIo.readSync(fd, buf);
    }
    console.info("FileManager.getContent read finished " + totalLength);
    let contentBuf = new Uint8Array(totalLength);
    let offset = 0;
    for (let bufArr of bufArray) {
      console.info("FileManager.getContent collecting " + offset);
      let uInt8Arr = new Uint8Array(bufArr);
      contentBuf.set(uInt8Arr, offset);
      offset += uInt8Arr.byteLength;
    }
    let content = String.fromCharCode.apply(null, new Uint8Array(contentBuf));
    return content;
  }

  public writeToFile(fpath: string, content: string) {
    if (this.baseDir == null) {
      this.getBaseDir();
    }
    let fd = fileIo.openSync(this.baseDir + fpath, 0o102, 0o666);
    fileIo.writeSync(fd, content);
    fileIo.closeSync(fd);
  }
}