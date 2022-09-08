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

import { Log } from '../utils/Log';
import { DragArea } from '../interface/DragArea';
import { CommonConstants } from '../constants/CommonConstants';

const TAG = 'BaseDragHandler';

/**
 * Drag processing base class, drag processing is mainly responsible for the processing of the following tasks:
 * 1.Efficient event distribution based on drag area.
 * 2.Initialize drag function related parameters.
 * 3.Adjust and refresh the desktop layout according to the drag results.
 */
export abstract class BaseDragHandler {
  protected mIsInEffectArea = false;
  protected mDragEffectArea: DragArea | undefined;
  private mDragStateListener = null;
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
  protected abstract getItemIndex(x: number, y: number): number;

  /**
   * Get the object at the target location.
   */
  protected abstract getItemByIndex(index: number): any;

  /**
   * Set the drag effective area.
   */
  setDragEffectArea(effectArea: DragArea): void {
    this.mDragEffectArea = effectArea;
  }

  /**
   * Get valid area.
   */
  protected getDragEffectArea(): DragArea | undefined {
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
    Log.showDebug(TAG, `setDragItemInfo dragItemInfo: ${JSON.stringify(dragItemInfo)}`);
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
    Log.showDebug(TAG, `setIsLongPress isLongPress: ${isLongPress}`);
    AppStorage.SetOrCreate('isLongPress', isLongPress);
  }

  protected isDragEffectArea(x: number, y: number): boolean {
    if (this.mDragEffectArea) {
      if (x >= this.mDragEffectArea.left && x <= this.mDragEffectArea.right
      && y >= this.mDragEffectArea.top && y <= this.mDragEffectArea.bottom) {
        return true;
      }
    }
    return false;
  }
}
