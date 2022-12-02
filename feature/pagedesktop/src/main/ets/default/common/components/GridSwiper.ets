/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Log, Trace, StyleConstants, CommonConstants, AppMenu, MenuInfo } from '@ohos/common';
import SwiperPage from './SwiperPage';

const TAG = "GridSwiper";

@Component
export default struct GridSwiper {
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  @StorageLink('isDesktopLoadFinished') desktopLoadFinished: boolean = false;
  @Prop gridConfig: string;
  @StorageLink('pageIndex') pageIndex: number = 0;
  private mPageDesktopViewModel;
  @StorageLink('appListInfo') appListInfo: {
    appGridInfo: [[]]
  } = { appGridInfo: [[]] };
  private swiperController: SwiperController = new SwiperController();
  private dialogController: CustomDialogController;

  aboutToAppear(): void {
    this.mPageDesktopViewModel.setSwiperController(this.swiperController);
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, 'aboutToDisappear');
  }

  private buildLog(): boolean {
    let isDesktopLoadFinished = AppStorage.Get('isDesktopLoadFinished');
    Log.showDebug(TAG, `build start ${isDesktopLoadFinished} page ${this.pageIndex}`);
    return isDesktopLoadFinished == true;
  }

  @Builder MenuBuilder() {
    Flex({ direction: FlexDirection.Column, justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
      AppMenu({
        getMenuInfoList: this.getMenu.bind(this),
      })
    }
    .width(StyleConstants.CONTEXT_MENU_WIDTH)
    .borderRadius(StyleConstants.DEFAULT_12)
  }

  private getMenu(): MenuInfo[] {
    let menuInfoList = new Array<MenuInfo>();
    let setting = new MenuInfo();
    setting.menuType = CommonConstants.MENU_TYPE_FIXED
    setting.menuImgSrc = "/common/pics/ic_public_settings.svg"
    setting.menuText = $r('app.string.into_settings')
    setting.onMenuClick = () => {
      Trace.start(Trace.CORE_METHOD_START_SETTINGS);
      this.mPageDesktopViewModel.intoSetting();
    }
    menuInfoList.push(setting);

    let addOrDeleteBlankPage = new MenuInfo();
    addOrDeleteBlankPage.menuType = CommonConstants.MENU_TYPE_FIXED
    addOrDeleteBlankPage.menuImgSrc = this.mPageDesktopViewModel.getBlankPageBtnIcon()
    addOrDeleteBlankPage.menuText = this.mPageDesktopViewModel.getBlankPageBtnStr()
    addOrDeleteBlankPage.onMenuClick = () => {
      this.mPageDesktopViewModel.addOrDeleteBlankPage();
    }
    menuInfoList.push(addOrDeleteBlankPage);
    return menuInfoList;
  }

  build() {
    Column() {
      if (this.buildLog()) {}
        if (this.desktopLoadFinished) {
          Swiper(this.swiperController) {
            ForEach(this.appListInfo.appGridInfo, (item) => {
              if (AppStorage.Get('deviceType') == CommonConstants.DEFAULT_DEVICE_TYPE) {
                Column() {
                  SwiperPage({
                    mAppListInfo: item,
                    gridConfig: this.gridConfig,
                    mPageDesktopViewModel: this.mPageDesktopViewModel
                  })
                }
                .gesture(
                LongPressGesture({ repeat: true })
                  .onAction((event: GestureEvent) => {
                    this.dialogController.open()
                  })
                )
                .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
              } else {
                SwiperPage({
                  mAppListInfo: item,
                  gridConfig: this.gridConfig,
                  mPageDesktopViewModel: this.mPageDesktopViewModel
                })
                  .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
                  .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
              }
            })
          }
          .padding({
            top: this.navigationBarStatusValue ?
              this.mPageDesktopViewModel.getPageDesktopStyleConfig().mDesktopMarginTop :
              this.mPageDesktopViewModel.getPageDesktopStyleConfig().mDesktopMarginTop + 0
          })
          .height(StyleConstants.PERCENTAGE_100)
          .width(StyleConstants.PERCENTAGE_100)
          .indicatorStyle({
            selectedColor: StyleConstants.DEFAULT_FONT_COLOR
          })
          .loop(false)
          .index(this.pageIndex)
          .onChange((index) => {
            this.pageIndex = index;
            Log.showInfo(TAG, `swiper change to page ${index}`);
          })
        }
    }
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .height(StyleConstants.PERCENTAGE_100)
    .width(StyleConstants.PERCENTAGE_100)
  }
}