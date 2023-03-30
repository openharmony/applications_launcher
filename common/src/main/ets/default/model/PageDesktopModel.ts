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

import { EventConstants } from '../constants/EventConstants';
import { localEventManager } from '../manager/LocalEventManager';
import { Log } from '../utils/Log';

const TAG = 'PageDesktopModel';

/**
 * PageDesktop Model
 */

export class PageDesktopModel {
  private isAddByDraggingFlag = false;

  private constructor() {
  }

  /**
  * Obtains the pageDesktop data model object.
  *
  * @return PageDesktopModel
   */
  static getInstance(): PageDesktopModel {
    if (globalThis.PageDesktopModel == null) {
      globalThis.PageDesktopModel = new PageDesktopModel();
    }
    return globalThis.PageDesktopModel;
  }

  /**
  * Register for the PageDesktop application list add event.
  *
  * @param listener
   */
  registerPageDesktopItemAddEvent(listener): void {
    localEventManager.registerEventListener(listener, [
      EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD,
      EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_DELETE,
      EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE,
      EventConstants.EVENT_REQUEST_PAGEDESK_FORM_ITEM_ADD,
      EventConstants.EVENT_SMARTDOCK_INIT_FINISHED,
      EventConstants.EVENT_REQUEST_PAGEDESK_REFRESH,
      EventConstants.EVENT_REQUEST_FORM_ITEM_VISIBLE
    ]);
  }

  /**
  * register badge update event.
  *
  * @param listener
   */
  registerPageDesktopBadgeUpdateEvent(listener): void {
    localEventManager.registerEventListener(listener, [
      EventConstants.EVENT_BADGE_UPDATE
    ]);
  }

  /**
  * Unregister application list change listener.
  *
  * @param listener
   */
  unregisterEventListener(listener): void {
    localEventManager.unregisterEventListener(listener);
  }

  sendDockItemChangeEvent(appInfo): void {
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_DOCK_ITEM_ADD, appInfo);
  }

  /**
   * delete blank page from layoutInfo
   *
   * @param layoutInfo
   * @param page
   */
  deleteBlankPageFromLayoutInfo(layoutInfo, page): boolean {
    for (let i = 0; i < layoutInfo.layoutInfo.length; i++) {
      if (layoutInfo.layoutInfo[i].page == page) {
        return false;
      }
    }
    if (layoutInfo.layoutDescription.pageCount <= 1) {
      return false;
    }
    layoutInfo.layoutDescription.pageCount--;
    for (let m = 0; m < layoutInfo.layoutInfo.length; m++) {
      if (layoutInfo.layoutInfo[m].page > page) {
        layoutInfo.layoutInfo[m].page--;
      }
    }
    return true;
  }

  /**
   * get the addByDragging flag
   */
  isAddByDragging(): boolean {
    return this.isAddByDraggingFlag;
  }

  /**
   * set the addByDragging flag
   * @param {boolean} isAddByDragging
   */
  setAddByDragging(isAddByDragging: boolean): void {
    this.isAddByDraggingFlag = isAddByDragging
  }

  updateAppItemLayoutInfo(info, item): void {
    const pageCount = info.layoutDescription.pageCount;
    const row = info.layoutDescription.row;
    const column = info.layoutDescription.column;
    const layoutInfo = info.layoutInfo;
    // current page has space
    let isNeedNewPage = true;
    pageCycle: for (let i = 0; i < pageCount; i++) {
      for (let y = 0; y < row; y++) {
        for (let x = 0; x < column; x++) {
          if (this.isPositionValid(info, item, i, x, y)) {
            Log.showDebug(TAG, `updateAppItemLayoutInfo isPositionValid: x:${x} y:${y} page:${i}`);
            isNeedNewPage = false;
            layoutInfo.push({
              bundleName: item.bundleName,
              typeId: item.typeId,
              abilityName: item.abilityName,
              moduleName: item.moduleName,
              keyName: item.keyName,
              badgeNumber:item.badgeNumber,
              area: item.area,
              page: i,
              column: x,
              row: y
            });
            break pageCycle;
          }
        }
      }
    }
    if (isNeedNewPage) {
      layoutInfo.push({
        bundleName: item.bundleName,
        typeId: item.typeId,
        abilityName: item.abilityName,
        moduleName: item.moduleName,
        keyName: item.keyName,
        badgeNumber:item.badgeNumber,
        area: item.area,
        page: pageCount,
        column: 0,
        row: 0
      });
      ++info.layoutDescription.pageCount;
    }
  }

  updatePageDesktopLayoutInfo(info, item): boolean {
    const pageCount = info.layoutDescription.pageCount;
    const row = info.layoutDescription.row;
    const column = info.layoutDescription.column;
    // current page has space
    let isNeedNewPage = true;
    const curPageIndex = this.getPageIndex();
    const max = pageCount - 1 > curPageIndex ? curPageIndex + 1 : pageCount - 1;
    pageCycle: for (let i = curPageIndex; i <= max; i++) {
      for (let y = 0; y < row; y++) {
        for (let x = 0; x < column; x++) {
          if (this.isPositionValid(info, item, i, x, y)) {
            Log.showDebug(TAG, `updatePageDesktopLayoutInfo isPositionValid: x:${x} y:${y} page:${i}`);
            isNeedNewPage = false;
            item.page = i;
            item.column = x;
            item.row = y;
            break pageCycle;
          }
        }
      }
    }
    if (isNeedNewPage) {
      item.page = curPageIndex + 1;
      item.column = 0;
      item.row = 0;
    }
    return isNeedNewPage;
  }

  private isPositionValid(info, item, page, startColumn, startRow): boolean {
    const row = info.layoutDescription.row;
    const column = info.layoutDescription.column;
    if ((startColumn + item.area[0]) > column || (startRow + item.area[1]) > row) {
      return false;
    }
    let isValid = true;
    for (let x = startColumn; x < startColumn + item.area[0]; x++) {
      for (let y = startRow; y < startRow + item.area[1]; y++) {
        if (this.isPositionOccupied(info, page, x, y)) {
          isValid = false;
          break;
        }
      }
    }
    return isValid;
  }

  private isPositionOccupied(info, page, column, row): boolean {
    const pageCount = info.layoutDescription.pageCount;
    const layoutInfo = info.layoutInfo;
    // current page has space
    for (const layout of layoutInfo) {
      if (layout.page == page) {
        const xMatch = (column >= layout.column) && (column < layout.column + layout.area[0]);
        const yMatch = (row >= layout.row) && (row < layout.row + layout.area[1]);
        if (xMatch && yMatch) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Changing the Desktop Page Number.
   *
   * @param idx: Page number
   */
  setPageIndex(idx: number): void {
    Log.showInfo(TAG, 'setPageIndex: ' + idx);
    AppStorage.SetOrCreate('pageIndex', idx);
  }

  /**
   * Get the Desktop Page Number.
   */
  getPageIndex(): number {
    return AppStorage.Get('pageIndex');
  }
}