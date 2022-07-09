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

import CommonConstants from '../constants/CommonConstants';
import Log from '../utils/Log';

const TAG = 'BaseDragHandler';

interface Area {
  left: number,
  right: number,
  top: number,
  bottom: number
}

/**
 * Drag processing base class, drag processing is mainly responsible for the processing of the following tasks:
 * 1.Efficient event distribution based on drag area.
 * 2.Initialize drag function related parameters.
 * 3.Adjust and refresh the desktop layout according to the drag results.
 */
export default abstract class BaseDragHandler {
  protected mIsInEffectArea = false;

  protected mDragEffectArea: Area | undefined;

  private mDragStateListener = null;

  private mIsDraging = false;

  private mSelectItemIndex: number = CommonConstants.INVALID_VALUE;

  constructor() {
    this.setIsLongPress(false);
  }

  /**
   * Get the data object corresponding to the drag operation.
   */
  protected abstract getDragRelativeData(): any;

  /**
   * Get the position of the drag target.
   */
  protected abstract getItemIndex(event: any): number;

  /**
   * Get the object at the target location.
   */
  protected abstract getItemByIndex(index: number): any;

  /**
   * Set the drag effective area.
   */
  setDragEffectArea(effectArea: Area): void {
    this.mDragEffectArea = effectArea;
  }

  /**
   * Get valid area.
   */
  protected getDragEffectArea(): Area | undefined {
    return this.mDragEffectArea;
  }

  /**
   * Set up drag listeners.
   */
  setDragStateListener(dragStateListener): void {
    this.mDragStateListener = dragStateListener;
  }

  /**
   * Set drag and drop item information.
   *
   * @param dragItemInfo
   */
  protected setDragItemInfo(dragItemInfo): void {
    Log.showInfo(TAG, `setDragItemInfo dragItemInfo: ${JSON.stringify(dragItemInfo)}`);
    AppStorage.SetOrCreate('dragItemInfo', dragItemInfo);
  }

  /**
   * Get drag item information.
   *
   * @return dragItemInfo
   */
  protected getDragItemInfo() {
    const dragItemInfo: any = AppStorage.Get('dragItemInfo');
    // avoid dragItemInfo from AppStorage is undefined
    return dragItemInfo ? dragItemInfo : {};
  }

  /**
   * Get IsLongPress parameter.
   *
   * @return isLongPress
   */
  protected getIsLongPress(): boolean {
    const isLongPress: boolean = AppStorage.Get('isLongPress');
    return isLongPress;
  }

  /**
   * Set the IsLongPress parameter.
   */
  protected setIsLongPress(isLongPress): void {
    Log.showInfo(TAG, `setIsLongPress isLongPress: ${isLongPress}`);
    AppStorage.SetOrCreate('isLongPress', isLongPress);
  }

  /**
   * Get whether it is a drag within the component.
   *
   * @return
   */
  protected isSelfDrag(): boolean {
    return this.mIsDraging;
  }

  /**
   * Get whether the dragged position is dropped outside the component
   */
  protected isDropOutSide(): boolean {
    return this.isSelfDrag() && !this.mIsInEffectArea;
  }

  /**
   * Notify that the drag event has changed
   */
  notifyTouchEventUpdate(event: any): void {
    AppStorage.SetOrCreate('dragEvent', event);
    let dragLocation = event.touches[0].screenX + '_' + event.touches[0].screenY + '_' + event.type;
    AppStorage.SetOrCreate('dragLocation', dragLocation);
    if (event.type == CommonConstants.TOUCH_TYPE_UP) {
      dragLocation = event.touches[0].screenX + '_' + event.touches[0].screenY;
      AppStorage.SetOrCreate('dragEvent', {});
      AppStorage.SetOrCreate('dragLocation', dragLocation);
      AppStorage.SetOrCreate('dragResult', false);
    }
  }

  /**
   * The drag event changes
   */
  onTouchEventUpdate(event: any): void {
    if (event.type == undefined) {
      Log.showInfo(TAG, 'onTouchEventUpdate event:undefined');
      const dragResult: boolean = AppStorage.Get('dragResult');
      this.onDragEnd(dragResult);
      this.setIsLongPress(false);
      this.mIsDraging = false;
      this.mIsInEffectArea = false;
      this.mSelectItemIndex = CommonConstants.INVALID_VALUE;
      return;
    }
    if (event.type == CommonConstants.TOUCH_TYPE_DOWN) {
      this.mSelectItemIndex = this.getItemIndex(event);
      Log.showInfo(TAG, `onTouchEventUpdate event:down mSelectItemIndex: ${this.mSelectItemIndex}`);
    }
    if (event.type == CommonConstants.TOUCH_TYPE_MOVE) {
      const isLongPress = this.getIsLongPress();
      if (!isLongPress && this.mSelectItemIndex != CommonConstants.INVALID_VALUE) {
        Log.showInfo(TAG,'onTouchEventUpdate event:move invalid move!');
        return;
      }
      if (!this.mIsInEffectArea && this.isInEffectArea(event)) {
        this.mIsInEffectArea = true;
        Log.showInfo(TAG, 'onTouchEventUpdate event:move onDragEnter');
        this.onDragEnter(event);
      } else if (this.mIsInEffectArea && !this.isInEffectArea(event)) {
        this.mIsInEffectArea = false;
        Log.showInfo(TAG, 'onTouchEventUpdate event:move onDragLeave');
        this.onDragLeave(event);
      }
      if (this.mIsInEffectArea) {
        if (!this.mIsDraging && this.mSelectItemIndex != CommonConstants.INVALID_VALUE) {
          this.mIsDraging = true;
          Log.showInfo(TAG, 'onTouchEventUpdate event:move onDragStart');
          this.onDragStart(event, this.mSelectItemIndex);
        } else {
          const insertIndex = this.getItemIndex(event);
          this.onDragMove(event, insertIndex, this.mSelectItemIndex);
        }
      }
    }
    if (event.type == CommonConstants.TOUCH_TYPE_UP) {
      if (this.mIsDraging || this.mIsInEffectArea) {
        const insertIndex = this.getItemIndex(event);
        Log.showInfo(TAG, `onTouchEventUpdate event:up insertIndex: ${insertIndex}`);
        const dragResult = this.onDragDrop(event, insertIndex, this.mSelectItemIndex);
        if (dragResult) {
          AppStorage.SetOrCreate('dragResult', dragResult);
        }
      }
      this.reset();
    }
  }

  reset(): void {
    this.setIsLongPress(false);
    this.mIsDraging = false;
    this.mIsInEffectArea = false;
    this.mSelectItemIndex = CommonConstants.INVALID_VALUE;
  }

  private isInEffectArea(event: any): boolean {
    const positionX = event.touches[0].screenX;
    const positionY = event.touches[0].screenY;
    const effectArea = this.getDragEffectArea();
    if (positionX > effectArea.left && positionX < effectArea.right
      && positionY > effectArea.top && positionY < effectArea.bottom) {
      return true;
    }
    return false;
  }

  /**
   * Start dragging
   */
  protected onDragStart(event: any, itemIndex: number): void {
    const dragItemInfo = this.getItemByIndex(itemIndex);
    if (this.mDragStateListener && this.mDragStateListener.onItemDragStart && dragItemInfo) {
      this.mDragStateListener.onItemDragStart(event, itemIndex);
    }
    ContextMenu.close();
    this.setDragItemInfo(dragItemInfo);
  }

  /**
   * Drag the position into the target area
   */
  protected onDragEnter(event: any): void {
    if (this.mDragStateListener && this.mDragStateListener.onItemDragEnter) {
      this.mDragStateListener.onItemDragEnter(event);
    }
  }

  /**
   * Drag the position away from the target area
   */
  protected onDragLeave(event: any): void {
    if (this.mDragStateListener && this.mDragStateListener.onItemDragLeave) {
      this.mDragStateListener.onItemDragLeave(event);
    }
  }

  /**
   * While the drag target is moving
   */
  protected onDragMove(event: any, insertIndex: number, itemIndex: number): void {
    if (this.mDragStateListener && this.mDragStateListener.onItemDragMove) {
      this.mDragStateListener.onItemDragMove(event, insertIndex, itemIndex);
    }
  }

  /**
   * drag and drop
   */
  protected onDragDrop(event: any, insertIndex: number, itemIndex: number): boolean {
    if (this.mDragStateListener && this.mDragStateListener.onItemDrop) {
      this.mDragStateListener.onItemDrop(event, insertIndex, itemIndex);
    }
    return true;
  }

  /**
   * end drag
   */
  protected onDragEnd(isSuccess: boolean): void {
    if (this.mDragStateListener && this.mDragStateListener.onItemDragEnd) {
      this.mDragStateListener.onItemDragEnd();
    }
  }
}
