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

import AppList from './AppList.ets';
import DockItemInfo from '../bean/DockItemInfo';
import SmartDockStyleConfig from '../layoutconfig/SmartDockStyleConfig';
import FeatureConstants from '../../../../../../feature/smartdock/src/main/ets/default/common/constants/FeatureConstants';

@Component
export default struct SmartDockContent {
  @Link @Watch('onDockListChange') dockItemList: Array<DockItemInfo>;
  @StorageLink('dragLocation') @Watch('onTouchEventUpdate') dragLocation: string= "";
  mSmartDockStyleConfig: SmartDockStyleConfig;
  mMaxNum: number;
  mListWidth: number;
  onItemClick: Function;
  onItemTouch: Function;
  onDockListChangeFunc: Function;
  onTouchEventUpdateFunc: Function;
  buildMenu: Function;
  popup: {
    show: boolean,
    showItem: string,
    popup: PopupOption | CustomPopupOption
  };
  onHoverEvent: Function;

  private aboutToAppear(): void  {
  }

  private aboutToDisappear() {
  }

  build() {
    Row() {
      AppList({
        appList: $dockItemList,
        appListStyleConfig: this.mSmartDockStyleConfig,
        onItemClick: this.onItemClick,
        buildMenu: this.buildMenu,
        popup: this.popup,
        onHoverEvent: (onHover, bundleName) => {
          this.onHoverEvent(onHover, bundleName)
        }
      })
    }
    .onTouch((event: TouchEvent) => {
      AppStorage.SetOrCreate('dragFocus', FeatureConstants.FEATURE_NAME);
      this.onItemTouch(event);
    })
    .width(this.mListWidth)
    .height(this.mSmartDockStyleConfig.mDockHeight)
    .backgroundColor(this.mSmartDockStyleConfig.mBackgroundColor)
    .borderRadius(this.mSmartDockStyleConfig.mDockRadius)
    .backdropBlur(this.mSmartDockStyleConfig.mBackdropBlur)
    .padding(this.mSmartDockStyleConfig.mDockPadding)
    .visibility(this.getListWidth(this.dockItemList) === 0 ? Visibility.None : Visibility.Visible)
  }

  public getListWidth(itemList): number {
    let width = 0;
    if (typeof itemList === 'undefined' || itemList == null || itemList.length === 0) {
      return width;
    } else {
      let num = itemList.length;
      if (num > this.mMaxNum) {
        num = this.mMaxNum
      }
      width = this.mSmartDockStyleConfig.mDockPadding * 2 + num * (this.mSmartDockStyleConfig.mListItemWidth) + (num - 1) * (this.mSmartDockStyleConfig.mListItemGap);
    }
    return width;
  }

  private onDockListChange() {
    this.onDockListChangeFunc();
    this.mListWidth = this.getListWidth(this.dockItemList);
  }

  private onTouchEventUpdate() {
    if (AppStorage.Get('dragFocus') == FeatureConstants.FEATURE_NAME) {
      this.onTouchEventUpdateFunc();
    }
  }
}