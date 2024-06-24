/**
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
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

const TAG = 'GridRowManager';

/**
 * GridRowManager.
 */
export default class GridRowManager {
  private columns: number = 0;
  private gutterX: number = 0;
  private gridWidth: number = 0;

  constructor(columns: number, gutterX: number, gridWidth: number) {
    this.columns = columns;
    this.gutterX = gutterX;
    this.gridWidth = gridWidth;
  }

  /**
   * get Span Width
   *
   * @param span span
   */
  getSpanWidth(span: number): number {
    if (span < 1) {
      return 0;
    }
    if (span === 1) {
      return this.getSingleColumnWidth();
    }
    if (span >= this.columns) {
      return this.gridWidth;
    }
    return span * this.getSingleColumnWidth() + (span - 1) * this.gutterX;
  }

  /**
   * getSingleColumnWidth
   */
  getSingleColumnWidth(): number {
    return (this.gridWidth - (this.columns - 1) * this.gutterX) / this.columns;
  }

  /**
   * getColumns
   */
  getColumns(): number {
    return this.columns;
  }

  /**
   * getGutterX
   */
  getGutterX(): number {
    return this.gutterX;
  }
}