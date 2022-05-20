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

export default class BitSet {

  private static readonly NUMBER_BITS_NUM = 64;

  private readonly mBitArray: number[] = null;

  private readonly mSize: number;

  /**
   * constructor
   *
   * @param {number} size, size of BitSet
   */
  constructor(size: number) {
    this.mSize = size;
    const allocSize = Math.ceil(size / BitSet.NUMBER_BITS_NUM);
    this.mBitArray = new Array<number>(allocSize);
    for (let i = 0; i < this.mBitArray.length; i++) {
      this.mBitArray[i] = 0;
    }
  }

  /**
   * get the bit value of index
   *
   * @param {number} index, index of BitSet
   * @return {boolean} true if set
   */
  get(index: number): boolean {
    if (index < 0 || index >= this.mSize) {
      return false;
    }

    const arrayIndex = Math.floor(index / BitSet.NUMBER_BITS_NUM);
    const bitIndex = index % BitSet.NUMBER_BITS_NUM;
    return (this.mBitArray[arrayIndex] & (1 << bitIndex)) != 0;
  }

  /**
   * set the bit value of index as true
   *
   * @param {number} index, index of BitSet
   */
  set(index: number) {
    if (index < 0 || index >= this.mSize) {
      return;
    }

    const arrayIndex = Math.floor(index / BitSet.NUMBER_BITS_NUM);
    const bitIndex = index % BitSet.NUMBER_BITS_NUM;
    this.mBitArray[arrayIndex] |= 1 << bitIndex;
  }

  /**
   * call all the bit value of the BitSet
   *
   */
  clear() {
    this.mBitArray.fill(0);
  }
}