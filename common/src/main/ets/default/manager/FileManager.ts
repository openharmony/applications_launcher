/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
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
import fileIo from '@ohos.fileio';
import { Log } from '../utils/Log';

const TAG = 'FileManager';
const READ_DATA_SIZE = 4096;

/**
 * Wrapper class for fileIo interfaces.
 */
export default class FileManager {
  private baseDir: string | undefined;

  static getInstance(): FileManager {
    if (globalThis.FileManagerInstance == null) {
      globalThis.FileManagerInstance = new FileManager();
    }
    return globalThis.FileManagerInstance;
  }

  private async getBaseDir(): Promise<void> {
    const context = featureAbility.getContext();
    await context.getFilesDir()
      .then((data) => {
        Log.showDebug(TAG, `getFilesDir File directory obtained. Data: ${JSON.stringify(data)}`);
        this.baseDir = data + '/';
      }).catch((error) => {
        Log.showError(TAG, `getFilesDir Failed to obtain the file directory. Cause: ${JSON.stringify(error)}`);
      });
  }

  async getFileContent(fpath: string): Promise<string> {
    if (this.baseDir == undefined) {
      await this.getBaseDir();
    }
    Log.showDebug(TAG, `getFileContent fpath: ${fpath}`);
    const fd = fileIo.openSync(fpath, 0o2);
    const content = this.getContent(fd);
    fileIo.closeSync(fd);
    return content;
  }

  private getContent(fd): string {
    const bufArray = [];
    let totalLength = 0;
    let buf = new ArrayBuffer(READ_DATA_SIZE);
    let len = fileIo.readSync(fd, buf);
    while (len != 0) {
      Log.showDebug(TAG, `getContent fileIo reading ${len}`);
      totalLength += len;
      if (len < READ_DATA_SIZE) {
        buf = buf.slice(0, len);
        bufArray.push(buf);
        break;
      }
      bufArray.push(buf);
      buf = new ArrayBuffer(READ_DATA_SIZE);
      len = fileIo.readSync(fd, buf);
    }
    Log.showDebug(TAG, `getContent read finished ${totalLength}`);
    const contentBuf = new Uint8Array(totalLength);
    let offset = 0;
    for (const bufArr of bufArray) {
      Log.showDebug(TAG, `getContent collecting ${offset}`);
      const uInt8Arr = new Uint8Array(bufArr);
      contentBuf.set(uInt8Arr, offset);
      offset += uInt8Arr.byteLength;
    }
    const content = String.fromCharCode.apply(null, new Uint8Array(contentBuf));
    return content;
  }

  writeToFile(fpath: string, content: string): void {
    if (this.baseDir == undefined) {
      this.getBaseDir();
    }
    const fd = fileIo.openSync(this.baseDir + fpath, 0o102, 0o666);
    fileIo.writeSync(fd, content);
    fileIo.closeSync(fd);
  }
}