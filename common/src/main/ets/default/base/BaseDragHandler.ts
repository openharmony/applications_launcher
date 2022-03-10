/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

interface Area {
  left: number,
  right: number,
  top: number,
  bottom: number
}

/**
 * 拖拽处理基类，拖拽处理主要负责以下任务的处理：
 * 1、进行拖拽事件的分发：通过组件对dragEvent和dragItemInfo变化通过onDragEventUpdate进行通知，
 * 根据getDragEffectArea进行有效性分发（在系统拖拽能力框架ready后去掉这部分能力）
 * 2、初始化拖拽功能相关参数
 * 3、根据拖拽结果调整刷新布局数据
 */
export default abstract class BaseDragHandler {
  protected mIsInEffectArea = false;

  protected mDragEffectArea: Area = null;

  private mDragStateListener = null;

  private mIsDraging = false;

  private mSelectItemIndex: number = CommonConstants.INVALID_VALUE;

  constructor() {
    this.setIsLongPress(false);
  }

  /**
   * 获取拖拽操作对应的数据对象
   */
  protected abstract getDragRelativeData(): any;

  /**
   * 获取拖拽目标的位置
   */
  protected abstract getItemIndex(event: any): number;

  /**
   * 获取目标位置的对象
   */
  protected abstract getItemByIndex(index: number): any;

  /**
   * 设置拖拽有效区域(拖拽能力ready后删除)
   */
  setDragEffectArea(effectArea: Area): void {
    this.mDragEffectArea = effectArea;
  }

  /**
   * 获取有效区域(拖拽能力ready后删除)
   */
  protected getDragEffectArea(): Area {
    return this.mDragEffectArea;
  }

  /**
   * 设置拖拽监听器
   */
  setDragStateListener(dragStateListener) {
    this.mDragStateListener = dragStateListener;
  }

  /**
   * 设置拖拽条目信息
   *
   * @param dragItemInfo 拖拽条目信息
   */
  protected setDragItemInfo(dragItemInfo) {
    console.info('Launcher DragHandler setDragItemInfo dragItemInfo');
    AppStorage.SetOrCreate('dragItemInfo', dragItemInfo);
  }

  /**
   * 获取拖拽条目信息
   *
   * @return dragItemInfo 拖拽条目信息
   */
  protected getDragItemInfo() {
    const dragItemInfo: any = AppStorage.Get('dragItemInfo');
    return dragItemInfo;
  }

  /**
   * getIsLongPress
   *
   * @return isLongPress
   */
  protected getIsLongPress() {
    const isLongPress: boolean = AppStorage.Get('isLongPress');
    return isLongPress;
  }

  /**
   * setIsLongPress
   */
  protected setIsLongPress(isLongPress) {
    console.info('Launcher DragHandler setIsLongPress isLongPress');
    AppStorage.SetOrCreate('isLongPress', isLongPress);
  }

  /**
   * 获取是否是自己发起的拖拽
   */
  protected isSelfDrag(): boolean {
    return this.mIsDraging;
  }

  /**
   * 获取是否自己发起的拖拽在外部放下了
   */
  protected isDropOutSide() {
    return this.isSelfDrag() && !this.mIsInEffectArea;
  }

  /**
   * 通知拖拽事件发生改变(拖拽能力ready后删除)
   */
  notifyTouchEventUpdate(event: any) {
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
   * 拖拽事件发生改变(拖拽能力ready后删除)
   */
  onTouchEventUpdate(event: any) {
    if (event.type == undefined) {
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
      console.info('Launcher DragHandler onTouchEventUpdate mSelectItemIndex ' + this.mSelectItemIndex);
    }
    if (event.type == CommonConstants.TOUCH_TYPE_MOVE) {
      const isLongPress = this.getIsLongPress();
      if (!isLongPress && this.mSelectItemIndex != CommonConstants.INVALID_VALUE) {
        console.info(`Launcher DragHandler onTouchEventUpdate invalid move ${isLongPress}`);
        return;
      }
      if (!this.mIsInEffectArea && this.isInEffectArea(event)) {
        this.mIsInEffectArea = true;
        console.info('Launcher DragHandler onDragEnter');
        this.onDragEnter(event);
      } else if (this.mIsInEffectArea && !this.isInEffectArea(event)) {
        this.mIsInEffectArea = false;
        console.info('Launcher DragHandler onDragLeave');
        this.onDragLeave(event);
      }
      if (this.mIsInEffectArea) {
        if (!this.mIsDraging && this.mSelectItemIndex != CommonConstants.INVALID_VALUE) {
          this.mIsDraging = true;
          console.info('Launcher DragHandler onDragStart');
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
        console.info('Launcher DragHandler onTouchEventUpdate insertIndex:' + insertIndex);
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
   * 开始拖拽
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
   * 拖拽进入区域
   */
  protected onDragEnter(event: any): void {
    if (this.mDragStateListener && this.mDragStateListener.onItemDragEnter) {
      this.mDragStateListener.onItemDragEnter(event);
    }
  }

  /**
   * 拖拽离开区域
   */
  protected onDragLeave(event: any): void {
    if (this.mDragStateListener && this.mDragStateListener.onItemDragLeave) {
      this.mDragStateListener.onItemDragLeave(event);
    }
  }

  /**
   * 拖拽移动
   */
  protected onDragMove(event: any, insertIndex: number, itemIndex: number): void {
    if (this.mDragStateListener && this.mDragStateListener.onItemDragMove) {
      this.mDragStateListener.onItemDragMove(event, insertIndex, itemIndex);
    }
  }

  /**
   * 停止拖拽
   */
  protected onDragDrop(event: any, insertIndex: number, itemIndex: number): boolean {
    if (this.mDragStateListener && this.mDragStateListener.onItemDrop) {
      this.mDragStateListener.onItemDrop(event, insertIndex, itemIndex);
    }
    return true;
  }

  /**
   * 停止拖拽
   */
  protected onDragEnd(isSuccess: boolean): void {
    if (this.mDragStateListener && this.mDragStateListener.onItemDragEnd) {
      this.mDragStateListener.onItemDragEnd();
    }
  }
}
