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

import Pinyin from './Pinyin';

/**
 * An util that provides sort for pinyin and other character(such as $#%^).
 */
export class PinyinSort {
  private readonly pinyin;

  /**
   * Constructor.
   *
   * @param {boolean} checkPolyphone - Whether to check for polyphonic words.
   * @param {number} charCase - Output pinyin case mode, 0- first letter capitalization; 1- All lowercase; 2 - all uppercase.
   */
  constructor(checkPolyphone = false, charCase = 1) {
    this.pinyin = new Pinyin({
      checkPolyphone: checkPolyphone,
      charCase: charCase
    });
  }

  /**
   * Sort data for appinfo,compared by appName.
   *
   * @param {object} a - appinfo for compare.
   * @return {object} b - appinfo for compare.
   */
  sortByAppName(a, b) {
    return this.getChar(a.appName) - this.getChar(b.appName);
  }

  /**
   * Sort data for folderInfo,compared by folderName.
   *
   * @param {object} firstFolder - folderInfo for compare.
   * @return {object} secondFolder - folderInfo for compare.
   */
  sortByFolderName(firstFolder, secondFolder) {
    return firstFolder.folderName.localeCompare(secondFolder.folderName);
  }

  /**
   * Get first char for pinyin.
   *
   * @param {string} str - chinese string.
   * @return {char} charCode.
   */
  private getChar(str) {
    return this.pinyin.getFullChars(str).charCodeAt(0);
  }
}
