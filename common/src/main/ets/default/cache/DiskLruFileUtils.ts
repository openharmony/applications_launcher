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
import fileIO from '@ohos.fileio';
import Log from '../utils/Log';

const TAG = 'DiskLruFileUtils';
const writeFilePath = globalThis.desktopContext.cacheDir + '/';
const journalPath = writeFilePath + 'journal.txt';
const READ_DATA_SIZE = 4096;

/**
 * An util that provides io functionality which is used by DiskLruCache.
 */
export default class DiskLruFileUtils {

  /**
   * Read Json file from disk by bundleName.
   *
   * @param {string} bundleName - bundleName of the target file
   * @return {any} read object from file
   */
  static readJsonObj(bundleName: string): any {
    Log.showInfo(TAG, 'readJsonObj start execution');
    const filePath = writeFilePath + bundleName + '.json';
    return this.readJsonFile(filePath);
  }

  /**
   * Read Json file from disk by file path.
   *
   * @param {string} path - path of the target file.
   * @return {any} read object from file
   */
  static readJsonFile(path: string): any {
    Log.showInfo(TAG, 'readJsonFile start execution');
    let readStreamSync;
    try {
      readStreamSync = fileIO.createStreamSync(path, 'r');
      const content = this.getContent(readStreamSync);
      Log.showInfo(TAG, `readJsonFile finish execution ${content}`);
      return JSON.parse(content);
    } catch (e) {
      Log.showInfo(TAG, `readJsonFile error: ${e}`);
    } finally {
      readStreamSync.closeSync();
    }
  }

  /**
   * Write Json object to a file.
   *
   * @param {any} jsonObj - target JSON object will be written
   * @param {string} bundleName - use bundleName as target file name
   */
  static writeJsonObj(jsonObj: any, bundleName: string) {
    Log.showInfo(TAG, 'writeJsonObj start execution');
    const filePath = writeFilePath + bundleName + '.json';
    const content = JSON.stringify(jsonObj);
    let writeStreamSync = null;
    try {
      writeStreamSync = fileIO.createStreamSync(filePath, 'w+');
      writeStreamSync.writeSync(content);
    } catch (e) {
      Log.showInfo(TAG, `writeJsonObj error: ${e}`);
    } finally {
      writeStreamSync.closeSync();
      Log.showInfo(TAG, 'writeJsonObj close sync');
    }
  }

  /**
   * Read JSON object from a file.
   *
   * @param {fileIO.Stream} readStreamSync - stream of target file
   * @return {object} object read from file stream
   */
  static getContent(readStreamSync) {
    Log.showInfo(TAG, 'getContent start');
    const bufArray: ArrayBuffer[] = [];
    let totalLength = 0;
    let buf = new ArrayBuffer(READ_DATA_SIZE);
    let len = readStreamSync.readSync(buf);
    while (len != 0) {
      Log.showInfo(TAG, `getContent FileIO reading ${len}`);
      totalLength += len;
      if (len < READ_DATA_SIZE) {
        buf = buf.slice(0, len);
        bufArray.push(buf);
        break;
      }
      bufArray.push(buf);
      buf = new ArrayBuffer(READ_DATA_SIZE);
      len = readStreamSync.readSync(buf);
    }
    Log.showInfo(TAG, `getContent read finished ${totalLength}`);
    const contentBuf = new Uint8Array(totalLength);
    let offset = 0;
    for (const bufArr of bufArray) {
      Log.showInfo(TAG, `getContent collecting ${offset}`);
      const uInt8Arr = new Uint8Array(bufArr);
      contentBuf.set(uInt8Arr, offset);
      offset += uInt8Arr.byteLength;
    }

    const content = String.fromCharCode.apply(null, new Uint8Array(contentBuf));
    return content;
  }

  /**
   * Remove file.
   *
   * @param {string} bundleName - bundleName as target file name
   */
  static removeFile(bundleName: string) {
    try {
      Log.showInfo(TAG, 'Launcher FileUtil removeFile');
      //remove file,key : bundlename
      fileIO.unlinkSync(writeFilePath + bundleName + '.json');
    } catch (e) {
      Log.showInfo(TAG, `removeFile delete has failed for: ${e}`);
    }
  }
}
