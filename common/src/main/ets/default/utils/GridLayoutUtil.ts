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
import BitSet from './BitSet';

export default class GridLayoutUtil {
  /**
   * update GridLayoutInfo
   *
   * @param newLayoutRows new layout rows
   * @param newLayoutColumns new layout columns
   *
   * @return new GridLayoutInfo
   */
  static updateGridLayoutInfo(gridLayoutInfo: any, newLayoutRows: number, newLayoutColumns: number): any {
    gridLayoutInfo.layoutDescription.pageCount = GridLayoutUtil.updateLayoutInfo(
      gridLayoutInfo.layoutInfo, newLayoutRows, newLayoutColumns);
    gridLayoutInfo.layoutDescription.row = newLayoutRows;
    gridLayoutInfo.layoutDescription.column = newLayoutColumns;
    return gridLayoutInfo;
  }

  /**
   * update layoutInfo
   *
   * @param layoutInfo appLayoutInfo List
   * @param newLayoutRows new layout rows
   * @param newLayoutColumns new layout columns
   *
   * @return new layout pages num
   */
  private static updateLayoutInfo(layoutInfo: any, newLayoutRows: number, newLayoutColumns: number): number {
    let currentPage = -1;
    let insertPages = 0;
    const currentPageBitset = new BitSet(newLayoutRows * newLayoutColumns);

    for (let i = 0; i < layoutInfo.length;) {
      if (currentPage != layoutInfo[i].page) {
        currentPage = layoutInfo[i].page;
        currentPageBitset.clear();
      }

      while (i < layoutInfo.length && layoutInfo[i].page == currentPage) {
        if (GridLayoutUtil.updatePositionSuccess(layoutInfo[i], currentPageBitset, newLayoutRows, newLayoutColumns, currentPage + insertPages)) {
          i++;
        } else {
          currentPageBitset.clear();
          insertPages++;
        }
      }
    }

    return currentPage + insertPages + 1;
  }

  /**
   * update app position info
   *
   * @param appLayout appLayoutInfo List Item
   * @param currentPageBitset current page bitset
   * @param layoutRows new layout rows
   * @param layoutColumns new layout columns
   * @param currentPage app pages index
   *
   * @return whether update success
   */
  private static updatePositionSuccess(appLayout: any, currentPageBitset: BitSet,
    layoutRows: number, layoutColumns: number, currentPage: number): boolean {
    for (let r = 0; r < layoutRows; r++) {
      for (let c = 0; c < layoutColumns; c++) {
        if (!currentPageBitset.get(r * layoutColumns + c)) {
          appLayout.page = currentPage;
          appLayout.row = r;
          appLayout.column = c;
          currentPageBitset.set(r * layoutColumns + c);
          return true;
        }
      }
    }
    return false;
  }
}