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
import { Log } from '@ohos/common';
import { DragArea } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { BaseDragHandler } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';
import SmartDockModel from '../model/SmartDockModel';
import SmartDockConstants from '../common/constants/SmartDockConstants';

const TAG = 'SmartDockDragHandler';

/**
 * SmartDock DragHandler
 */
export default class SmartDockDragHandler extends BaseDragHandler {
  private mDockCoordinateData = [];
  private readonly mSmartDockModel: SmartDockModel;
  private readonly mSmartDockStyleConfig: SmartDockStyleConfig;
  private mDevice = CommonConstants.DEFAULT_DEVICE_TYPE;

  constructor() {
    super();
    this.mSmartDockModel = SmartDockModel.getInstance();
    this.mSmartDockStyleConfig = layoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG, SmartDockConstants.FEATURE_NAME);
    Log.showInfo(TAG, 'constructor!');
  }

  static getInstance(): SmartDockDragHandler {
    if (globalThis.SmartDockDragHandler == null) {
      globalThis.SmartDockDragHandler = new SmartDockDragHandler();
    }
    Log.showDebug(TAG, 'getInstance!');
    return globalThis.SmartDockDragHandler;
  }

  setDragEffectArea(effectArea): void {
    Log.showDebug(TAG, `setDragEffectArea: ${JSON.stringify(effectArea)}`);
    AppStorage.SetOrCreate('smartDockDragEffectArea', effectArea);
    super.setDragEffectArea(effectArea);
    this.updateDockParam(effectArea);
  }

  isDragEffectArea(x: number, y: number): boolean {
    const isInEffectArea = super.isDragEffectArea(x, y);
    Log.showDebug(TAG, `isDragEffectArea x: ${x}, y: ${y}, isInEffectArea: ${isInEffectArea}`);
    const deviceType = AppStorage.Get('deviceType');
    const pageDesktopDragEffectArea: DragArea = AppStorage.Get('pageDesktopDragEffectArea');
    Log.showDebug(TAG, `isDragEffectArea pageDesktopDragEffectArea: ${JSON.stringify(pageDesktopDragEffectArea)}`);
    if (pageDesktopDragEffectArea) {
      if (deviceType == CommonConstants.DEFAULT_DEVICE_TYPE) {
        if (isInEffectArea || (y < pageDesktopDragEffectArea.bottom && y > pageDesktopDragEffectArea.top)
        && x < pageDesktopDragEffectArea.right && x > pageDesktopDragEffectArea.left) {
          return true;
        }
        return false;
      }
      return isInEffectArea;
    }
    return false;
  }

  private updateDockParam(effectArea: DragArea): void {
    this.mDockCoordinateData = [];
    const dockWidth = effectArea.right - effectArea.left;
    const dockData: [] = this.getDragRelativeData();
    const dataCount = dockData.length;
    const dockPadding: {right: number, left: number, top: number, bottom: number} = AppStorage.Get('dockPadding');
    const itemSize = this.mSmartDockStyleConfig.mListItemWidth;
    const itemGap = this.mSmartDockStyleConfig.mListItemGap;
    if (dataCount > 0) {
      for (let index = 0; index < dataCount; index++) {
        if (index == dataCount - 1) {
          this.mDockCoordinateData.push(effectArea.right - dockPadding.left - (itemSize / 2));
          return;
        }
        this.mDockCoordinateData.push(effectArea.left + dockPadding.left + (itemSize / 2) + ((itemSize + itemGap) * index));
      }
    } else {
      this.mDockCoordinateData.push(dockWidth);
    }
    Log.showDebug(TAG, `updateDockParam DockCoordinateData: ${JSON.stringify(this.mDockCoordinateData)}`);
  }

  protected getDragRelativeData(): any {
    const dockData: [] = AppStorage.Get('residentList');
    return dockData;
  }

  protected getItemIndex(x: number, y: number): number {
    if (super.isDragEffectArea(x, y)) {
      for (let index = 0; index < this.mDockCoordinateData.length; index++) {
        if (this.mDockCoordinateData[index] > x) {
          return index;
        }
      }
      return this.mDockCoordinateData.length;
    }
    return CommonConstants.INVALID_VALUE;
  }

  /**
   * Get dragItem location by coordinates.
   *
   * @param x - x position
   * @param y - y position
   */
  getDragItemIndexByCoordinates(x: number, y: number): number {
    if (super.isDragEffectArea(x, y)) {
      for (let index = 0; index < this.mDockCoordinateData.length; index++) {
        if (this.mDockCoordinateData[index] + this.mSmartDockStyleConfig.mListItemWidth / 2 >= x) {
          return index;
        }
      }
    }
    return CommonConstants.INVALID_VALUE;
  }

  protected getItemByIndex(index: number): any {
    const dockData: [] = this.getDragRelativeData();
    if (index >= 0 && index < dockData.length) {
      return dockData[index];
    }
    return null;
  }

  layoutAdjustment(insertIndex: number, itemIndex: number): void {
    if (insertIndex != CommonConstants.INVALID_VALUE || itemIndex != CommonConstants.INVALID_VALUE) {
      this.mSmartDockModel.insertItemToIndex(insertIndex, itemIndex);
    }
  }

  protected onDragDrop(x: number, y: number): boolean {
    const dragItemInfo: any = AppStorage.Get('dragItemInfo');
    if (JSON.stringify(dragItemInfo) == '{}') {
      return false;
    }
    const dragItemType: number = AppStorage.Get('dragItemType');
    const insertIndex = this.getItemIndex(x, y);
    if (dragItemType === CommonConstants.DRAG_FROM_DOCK) {
      const selectAppIndex: number = AppStorage.Get('selectAppIndex');
      globalThis.SmartDockDragHandler.layoutAdjustment(insertIndex, selectAppIndex);
      return true;
    }
    if (dragItemType === CommonConstants.DRAG_FROM_DESKTOP
    && AppStorage.Get('deviceType') == CommonConstants.DEFAULT_DEVICE_TYPE) {
      Log.showInfo(TAG, `onDrop insertIndex: ${insertIndex}`);
      this.addItemToSmartDock(dragItemInfo, insertIndex);
      return true;
    }
    return false;
  }

  addItemToSmartDock(dragItemInfo: any, insertIndex: number): boolean {
    let addToDockRes = this.mSmartDockModel.addToSmartdock(dragItemInfo, insertIndex);
    if (addToDockRes) {
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_DELETE, {
        bundleName: undefined,
        keyName: dragItemInfo.keyName
      });
    }
    return true;
  }
}