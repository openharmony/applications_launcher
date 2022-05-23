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
import EventConstants from '../../../../../../../common/src/main/ets/default/constants/EventConstants';
import localEventManager from '../../../../../../../common/src/main/ets/default/manager/LocalEventManager';
import BaseDragHandler from '../../../../../../../common/src/main/ets/default/base/BaseDragHandler';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import FeatureConstants from '../common/constants/FeatureConstants';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import SmartDockModel from '../model/SmartDockModel';
import SmartDockStyleConfig from './SmartDockStyleConfig';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';

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
    this.mSmartDockStyleConfig = LayoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG, FeatureConstants.FEATURE_NAME);
    Log.showInfo(TAG, 'constructor!');
  }

  static getInstance(): SmartDockDragHandler {
    if (globalThis.SmartDockDragHandler == null) {
      globalThis.SmartDockDragHandler = new SmartDockDragHandler();
    }
    Log.showInfo(TAG, 'getInstance!');
    return globalThis.SmartDockDragHandler;
  }

  setDragEffectArea(effectArea): void {
    Log.showInfo(TAG, `setDragEffectArea: ${JSON.stringify(effectArea)}`);
    super.setDragEffectArea(effectArea);
    this.updateDockParam(effectArea);
  }

  private updateDockParam(effectArea) {
    this.mDockCoordinateData = [];
    const dockWidth = effectArea.right - effectArea.left;
    const dockData: [] = this.getDragRelativeData();
    const dataCount = dockData.length;
    Log.showInfo(TAG, `updateDockParam dockWidth: ${dockWidth}, dataCount: ${dataCount}`);
    if (dataCount > 0) {
      for (let index = 1; index <= dataCount; index++) {
        this.mDockCoordinateData.push(dockWidth / dataCount * index + effectArea.left);
      }
    } else {
      this.mDockCoordinateData.push(dockWidth);
    }
    Log.showInfo(TAG, `updateDockParam DockCoordinateData: ${JSON.stringify(this.mDockCoordinateData)}`);
  }

  protected getDragRelativeData(): any {
    const dockData: [] = AppStorage.Get('residentList');
    return dockData;
  }

  protected getItemIndex(event: any): number {
    const x = event.touches[0].screenX;
    const y = event.touches[0].screenY;
    if (x > this.mDragEffectArea.left && x < this.mDragEffectArea.right
    && y > this.mDragEffectArea.top && y < this.mDragEffectArea.bottom) {
      for (let index = 0; index < this.mDockCoordinateData.length; index++) {
        if (this.mDockCoordinateData[index] > x) {
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

  protected onDragStart(event: any, itemIndex: number): void {
    super.onDragStart(event, itemIndex);
    const moveAppX = event.touches[0].screenX;
    const moveAppY = event.touches[0].screenY;
    Log.showInfo(TAG, `onDragStart itemIndex: ${itemIndex}, dragItemInfo: ${this.getDragItemInfo()}`);
    AppStorage.SetOrCreate('overlayPositionX', moveAppX);
    AppStorage.SetOrCreate('overlayPositionY', moveAppY);
    AppStorage.SetOrCreate('overlayData', {
      iconSize: this.mSmartDockStyleConfig.mIconSize,
      appInfo: this.getDragItemInfo(),
    });
    AppStorage.SetOrCreate('withBlur', false);
    AppStorage.SetOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_APP_ICON);
  }

  protected onDragMove(event: any, insertIndex: number, itemIndex: number): void {
    super.onDragMove(event, insertIndex, itemIndex);
    Log.showInfo(TAG, `onDragMove insertIndex: ${insertIndex}`);
    const moveAppX = event.touches[0].screenX;
    const moveAppY = event.touches[0].screenY;
    AppStorage.SetOrCreate('overlayPositionX', moveAppX - (this.mSmartDockStyleConfig.mIconSize / 2));
    AppStorage.SetOrCreate('overlayPositionY', moveAppY - (this.mSmartDockStyleConfig.mIconSize / 2));
  }

  protected onDragDrop(event: any, insertIndex: number, itemIndex: number): boolean {
    this.mDevice = AppStorage.Get('device');
    super.onDragDrop(event, insertIndex, itemIndex);
    Log.showInfo(TAG, `onDragDrop insertIndex: ${insertIndex}, IsInEffectArea: ${this.mIsInEffectArea}`);
    AppStorage.SetOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    let isDragSuccess = true;
    if (this.mIsInEffectArea) {
      if (this.isSelfDrag()) {
        this.layoutAdjustment(insertIndex, itemIndex);
        isDragSuccess = true;
      } else if (this.mDevice == CommonConstants.DEFAULT_DEVICE_TYPE) {
        const dragItemInfo = this.getDragItemInfo();
        Log.showInfo(TAG, `onDragDrop addItem: ${JSON.stringify(dragItemInfo)}`);
        isDragSuccess = this.addItemToSmartDock(dragItemInfo, insertIndex);
      }
    } else if (this.mDevice == CommonConstants.DEFAULT_DEVICE_TYPE) {
      Log.showInfo(TAG, 'onDragDrop remove item');
      const dragItemInfo = this.getDragItemInfo();
      let deleteDockRes = this.mSmartDockModel.deleteDockItem(dragItemInfo.bundleName, SmartDockConstants.RESIDENT_DOCK_TYPE);
      if (deleteDockRes) {
        localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD, dragItemInfo);
      }
    }
    return isDragSuccess;
  }

  protected onDragEnd(isSuccess: boolean): void {
    this.mDevice = AppStorage.Get('device');
    super.onDragEnd(isSuccess);
    if (this.isDropOutSide() && isSuccess) {
      Log.showInfo(TAG, 'onDragEnd dropOutSide');
    }
  }

  private layoutAdjustment(insertIndex: number, itemIndex: number): void {
    this.mSmartDockModel.inserItemToIndex(insertIndex, itemIndex);
  }

  private addItemToSmartDock(dragItemInfo: any, insertIndex: number): boolean {
    let addToDockRes = this.mSmartDockModel.addToSmartdock(dragItemInfo, insertIndex);
    if (addToDockRes) {
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_DELETE, dragItemInfo.bundleName);
    }
    return true;
  }
}