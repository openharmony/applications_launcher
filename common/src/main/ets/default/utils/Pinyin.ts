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
 * Pinyin.
 *
 * @typedef Option.
 * @type Object.
 * @property {Boolean} [checkPolyphone=false] Whether to check for polyphonic words.
 * @property {Number} [charCase=0] Output pinyin case mode, 0- first letter capitalization; 1- All lowercase; 2 - all uppercase.
 */
import { dict } from './dict';

class Pinyin {
  private options;
  private char_dict;
  private full_dict;
  private polyphone;

  /**
   * Constructor.
   *
   * @param {object} options - the options for chinese transform to pinyin
   */
  constructor(options) {
    this.setOptions(options);
    this.initialize();
  }

  /**
   * set params.
   *
   * @param {object} options - the options for chinese transform to pinyin
   */
  setOptions(options) {
    options = options || {};
    this.options = Object.assign({ checkPolyphone: false, charCase: 0 }, options);
  }

  /**
   * initialize data.
   *
   */
  initialize() {
    this.char_dict = dict.char_dict;
    this.full_dict = dict.full_dict;
    this.polyphone = dict.polyphone;
  }

  /**
   * Get the initials of pinyin.
   *
   * @param {string} str - The input Chinese string
   * @return {object} - result for CamelChars.
   */
  getCamelChars(str) {
    if (typeof (str) != 'string')
      throw new Error('getCamelChars need string param!');
    const chars = [];
    let i = 0;
    while (i< str.length){
      //get unicode
      const ch = str.charAt(i);
      //Check whether the Unicode code is within the range of processing, if it returns the pinyin first letter of the Chinese character reflected by the code, if it is not, call other functions to process
      chars.push(this.getChar(ch));
      i++;
    }

    let result = this.getResult(chars);

    switch (this.options.charCase) {
      case 1:
        result = result.toLowerCase();
        break;
      case 2:
        result = result.toUpperCase();
        break;
      default: {};
        break;
    }
    return result;
  }

  /**
   * Get Pinyin.
   *
   * @param {string} str - The input Chinese string.
   * @return {object} result for FullChars.
   */
  getFullChars(str) {
    let result = '';
    const reg = new RegExp('[a-zA-Z0-9\- ]');
    let i = 0;
    while (i < str.length){
      const ch = str.substr(i, 1);
      const unicode = ch.charCodeAt(0);
      if (unicode > 19968 && unicode < 40869) {
        const name = this.getFullChar(ch);
        if (name !== false) {
          result += name;
        }
      }else {
        result += ch;
      }
      i++;
    }

    switch (this.options.charCase) {
      case 1:
        result = result.toLowerCase();
        break;
      case 2:
        result = result.toUpperCase();
        break;
      default: {};
        break;
    }
    return result;
  }

  getFullChar(ch) {
    for (const key in this.full_dict) {
      if (this.full_dict[key].indexOf(ch) != -1) {
        return this.capitalize(key);
      }
    }
    return false;
  }

  capitalize(str) {
    if (str.length <= 0)
      throw new Error('The length of str should be greater than 0');
      const first = str.substr(0, 1).toUpperCase();
      const spare = str.substr(1, str.length);
      return first + spare;
  }

  getChar(ch) {
    const unicode = ch.charCodeAt(0);
    // Determine whether it is within the range of Chinese character processing
    if (unicode > 19968 && unicode < 40869){
      //To check if it is polyphonic, it is polyphonic rather than looking for the corresponding letter in the string strChineseFirstPY
      if (!this.options.checkPolyphone) {
        return this.char_dict.charAt(unicode - 19968);
      }
      return this.polyphone[unicode] ? this.polyphone[unicode] : this.char_dict.charAt(unicode - 19968);
    } else {
      // If it is not a kanji, return an atomic string
      return ch;
    }
  }

  getResult(chars) {
    if (!this.options.checkPolyphone) {
      return chars.join('');
    }
    let result = [''];
    let i= 0;
    let len = chars.length;
    while (i < len) {
      const str = chars[i];
      const strlen = str.length;
      if (strlen == 1) {
        for (let j = 0; j < result.length; j++) {
          result[j] += str;
        }
      } else {
        const swap1 = result.slice(0);
        result = [];
        for (let j = 0; j < strlen; j++) {
          const swap2 = swap1.slice(0);
          for (let k = 0; k < swap2.length; k++) {
            swap2[k] += str.charAt(j);
          }
          result = result.concat(swap2);
        }
      }
      i++;
    }
    return result;
  }
}

export default Pinyin;