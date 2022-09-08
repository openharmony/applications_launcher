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

/**
 * An util that provides io functionality between file and JSON object.
 */
import Fileio from '@ohos.fileio';
import util from '@ohos.util';
import { Log } from './Log';

const TAG = 'FileUtils';

const READ_DATA_SIZE = 4096;

export default class FileUtils {

  /**
   * Read Json file from disk by file path.
   *
   * @param {string} filePath - filePath as the absolute path to the target file.
   * @return {any} - read object from file
   */
  static readJsonFile(filePath: string): any {
    Log.showDebug(TAG, 'readJsonFile start execution');
    let readStreamSync = null;
    try {
      readStreamSync = Fileio.createStreamSync(filePath, 'r');
      const content = this.getContent(readStreamSync);
      return JSON.parse(content);
    } catch (e) {
      Log.showError(TAG, `readJsonFile error: ${e.toString()}`);
    } finally {
      readStreamSync.closeSync();
    }
  }

  /**
   * Read String from disk by bundleName.
   *
   * @param {string} filePath - filePath as the absolute path to the target file.
   * @return {string} - read string from file
   */
  static readStringFromFile(filePath: string): string {
    Log.showDebug(TAG, 'readStringFromFile start execution');
    let readStreamSync = null;
    try {
      readStreamSync = Fileio.createStreamSync(filePath, 'r');
      const content = this.getContent(readStreamSync);
      return content;
    } catch (e) {
      Log.showError(TAG, `readStringFromFile error: ${e.toString()}, filePath: ${filePath}`);
    } finally {
      if (readStreamSync) {
        readStreamSync.closeSync();
      }
    }
  }

  /**
   * Write string to a file.
   *
   * @param {string} str - target string will be written to file.
   * @param {string} filePath - filePath as the absolute path to the target file.
   */
  static writeStringToFile(str: string, filePath: string): void {
    Log.showDebug(TAG, 'writeStringToFile start execution');
    let writeStreamSync = null;
    try {
      writeStreamSync = Fileio.createStreamSync(filePath, 'w+');
      let number = writeStreamSync.writeSync(str);
      Log.showDebug(TAG, 'writeStringToFile number: ' + number);
    } catch (e) {
      Log.showError(TAG, `writeStringToFile error: ${e.toString()}`);
    } finally {
      writeStreamSync.closeSync();
      Log.showDebug(TAG, 'writeStringToFile close sync');
    }
  }

  /**
   * Read JSON object from a file.
   *
   * @param {object} readStreamSync - stream of target file
   * @return {object} - object read from file stream
   */
  static getContent(readStreamSync: any): string {
    Log.showDebug(TAG, 'getContent start');
    const bufArray = [];
    let totalLength = 0;
    let buf = new ArrayBuffer(READ_DATA_SIZE);
    let len = readStreamSync.readSync(buf);
    while (len != 0) {
      Log.showDebug(TAG, `getContent FileIO reading ${len}`);
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
    Log.showDebug(TAG, `getContent read finished: ${totalLength}`);
    const contentBuf = new Uint8Array(totalLength);
    let offset = 0;
    for (const bufArr of bufArray) {
      Log.showDebug(TAG, `getContent collecting: ${offset}`);
      const uInt8Arr = new Uint8Array(bufArr);
      contentBuf.set(uInt8Arr, offset);
      offset += uInt8Arr.byteLength;
    }
    let textDecoder = new util.TextDecoder('utf-8', {ignoreBOM: true});
    const content = textDecoder.decode(contentBuf, {stream: false});
    return content;
  }

  /**
   * Check if the file exists.
   *
   * @param {string} filePath - filePath as the absolute path to the target file.
   * @return {boolean} - boolean true(Exist)
   */
  static isExist(filePath: string): boolean {
    try {
      Fileio.accessSync(filePath);
      Log.showDebug(TAG, 'accessSync success.');
    } catch(e) {
      Log.showError(TAG, `isExit error: ${e.toString()}`);
      return false;
    }
    return true;
  }

  /**
   * Delete Files.
   *
   * @param {string} filePath - filePath as the absolute path to the target file.
   */
  static deleteConfigFile(filePath: string): void {
    try {
      Fileio.unlinkSync(filePath);
    } catch(e) {
      Log.showError(TAG, `deleteFile error: ${e.toString()}`);
    }
  }
}