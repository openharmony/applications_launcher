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

import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PageDesktopViewModel from '../common/viewmodel/PageDesktopViewModel';
import PageDesktopDragHandler from '../common/PageDesktopDragHandler';
import GridSwiper from '../common/components/GridSwiper.ets';
import FeatureConstants from '../common/constants/FeatureConstants';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import AppMenu from '../../../../../../../common/src/main/ets/default/uicomponents/AppMenu.ets';
import MenuInfo from '../../../../../../../common/src/main/ets/default/bean/MenuInfo';

let mPageDesktopViewModel: PageDesktopViewModel = null;
const TAG = "PageDesktopLayout";

@Component
export default struct PageDesktopLayout {
  @StorageLink('appListInfo') AppListInfo: {
    appGridInfo: [[]]
  } = { appGridInfo: [[]] };
  @StorageLink('dragLocation') @Watch('onTouchEventUpdate') dragLocation: string = '';
  @StorageLink('workSpaceWidth') @Watch('updateDeskTopParams') workSpaceWidth: number = 0;
  @StorageLink('workSpaceHeight') @Watch('updateDeskTopParams') workSpaceHeight: number = 0;
  @State device: string = 'phone';
  @State @Watch('updateDeskTopParams') mMargin: number = 0;
  @State mTop: number = 0;
  @State @Watch('changeGridConfig') gridConfig: string = '';
  @StorageLink('menuId') menuId: number = 0;
  private mPageDesktopDragHandler : PageDesktopDragHandler = null;
  private isPad: boolean = false;

  private aboutToAppear(): void  {
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.gridConfig = mPageDesktopViewModel.getGridConfig().layout;
    this.updateStyle();
    mPageDesktopViewModel.getGridList();
    if (this.device != CommonConstants.PAD_DEVICE_TYPE) {
      mPageDesktopViewModel.registerAppListChangeCallback();
    }
  }

  private updateStyle() {
    mPageDesktopViewModel.setDevice(this.device);
    this.isPad = mPageDesktopViewModel.getDevice();
    Log.showInfo(TAG, `updateStyle isPad: ${this.isPad}`);
  }

  private updateDeskTopParams() {
    this.mMargin = mPageDesktopViewModel.getPageDesktopStyleConfig().mMargin;
    this.mTop = mPageDesktopViewModel.getPageDesktopStyleConfig().mDesktopMarginTop;
    Log.showInfo(TAG, `updateDeskTopParams mMargin: ${this.mMargin}, this.mTop: ${this.mTop}`);
    if (this.mPageDesktopDragHandler != null) {
      this.mPageDesktopDragHandler.setDragEffectArea({
        left: this.mMargin,
        top: this.mTop,
        right: this.workSpaceWidth - this.mMargin,
        bottom: this.workSpaceHeight
      });
    }
  }

  private onTouchEventUpdate() {
    if (AppStorage.Get('device') === 'phone' || AppStorage.Get('dragFocus') == FeatureConstants.FEATURE_NAME) {
      this.mPageDesktopDragHandler.onTouchEventUpdate(AppStorage.Get('dragEvent'));
    }
  }

  private changeGridConfig(): void {
    Log.showInfo(TAG, `changeGridConfig GridConfig: ${this.gridConfig}`);
    this.updateDeskTopParams();
    mPageDesktopViewModel.getGridList();
  }

  private buildLog(): boolean {
    Log.showInfo(TAG, 'build start');
    return true;
  }

  private getMenu() {
    let menuInfoList = new Array<MenuInfo>();
    let setting = new MenuInfo();
    setting.menuType = CommonConstants.MENU_TYPE_FIXED
    setting.menuImgSrc = "/common/pics/ic_public_settings.svg"
    setting.menuText = $r('app.string.into_settings')
    setting.onMenuClick = () => {
      Trace.start(Trace.CORE_METHOD_START_SETTINGS);
      mPageDesktopViewModel.intoSetting();
    }
    menuInfoList.push(setting);

    let addOrDeleteBlankPage = new MenuInfo();
    addOrDeleteBlankPage.menuType = CommonConstants.MENU_TYPE_FIXED
    addOrDeleteBlankPage.menuImgSrc = mPageDesktopViewModel.getBlankPageBtnIcon()
    addOrDeleteBlankPage.menuText = mPageDesktopViewModel.getBlankPageBtnStr()
    addOrDeleteBlankPage.onMenuClick = () => {
      mPageDesktopViewModel.addOrDeleteBlankPage();
    }
    menuInfoList.push(addOrDeleteBlankPage);
    return menuInfoList;
  }

  private logId() {
    Log.showInfo(TAG, `MenuBuilder build start ${this.menuId}`);
    return true;
  }

  @Builder MenuBuilder() {
    if (this.logId()) {
      Flex({ direction: FlexDirection.Column, justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
        AppMenu({
          menuInfoList: this.getMenu()
        })
      }
      .width(StyleConstants.CONTEXT_MENU_WIDTH)
      .borderRadius(StyleConstants.DEFAULT_12)
    }
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      if (this.buildLog()) {
      }
      Column() {
        GridSwiper({
          mAppGridInfo: this.AppListInfo.appGridInfo,
          gridConfig: this.gridConfig,
          mPageDesktopViewModel: mPageDesktopViewModel
        })
      }
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
    }
    .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
    .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
    .onClick(() => {
      AppStorage.SetOrCreate('selectDesktopAppItem', null)
    })
  }
}