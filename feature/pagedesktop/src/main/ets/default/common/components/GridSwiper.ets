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

import {
  AppMenu,
} from '@ohos/common/component'
import {
  Log,
  Trace,
  StyleConstants,
  CommonConstants,
  MenuInfo,
  localEventManager,
  EventConstants,
  LauncherDragItemInfo
} from '@ohos/common';
import SwiperPage from './SwiperPage';
import { PageDesktopViewModel } from '../../viewmodel/PageDesktopViewModel';

const TAG = 'GridSwiper';

interface AppListInfo {
  appGridInfo: LauncherDragItemInfo[][]
}

@Component
export default struct GridSwiper {
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  @StorageLink('isDesktopLoadFinished') desktopLoadFinished: boolean = false;
  @Prop gridConfig: string;
  @StorageLink('pageIndex') pageIndex: number = 0;
  private mPageDesktopViewModel?: PageDesktopViewModel;
  @StorageLink('appListInfo') @Watch('updatePageList') appListInfo: AppListInfo = { appGridInfo: [[]] };
  @State pageList: number[] = [0];
  private swiperController: SwiperController = new SwiperController();
  dialogController?: CustomDialogController | null;
  @StorageLink('desktopEventResponse') desktopEventResponse: boolean = true;
  @State desktopIndicator: DotIndicator | DigitIndicator =
  Indicator.dot().selectedColor(StyleConstants.DEFAULT_FONT_COLOR);

  updatePageList(): void {
    if (this.pageList.length !== this.appListInfo.appGridInfo.length) {
      if (this.pageList.length < this.appListInfo.appGridInfo.length) {
        for (let i = this.pageList.length; i < this.appListInfo.appGridInfo.length; i++) {
          if (this.pageList.indexOf(i) === -1) {
            this.pageList.push(i);
          }
        }
      } else {
        for (let i = this.pageList.length - 1; i >= this.appListInfo.appGridInfo.length; i--) {
          if (this.pageList.indexOf(i) !== -1) {
            this.pageList.splice(i, 1);
          }
        }
      }
    }
    const NINE = 9;
    if (this.pageList?.length > NINE) {
      this.desktopIndicator = Indicator.digit().fontColor(StyleConstants.DEFAULT_FORM_MGR_FONT_COLOR)
        .selectedFontColor(StyleConstants.DEFAULT_FONT_COLOR);
    } else {
      this.desktopIndicator = Indicator.dot().selectedColor(StyleConstants.DEFAULT_FONT_COLOR);
    }
  }

  aboutToAppear(): void {
    this.mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.mPageDesktopViewModel.setSwiperController(this.swiperController);
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, 'aboutToDisappear');
  }

  private buildLog(): boolean {
    let isDesktopLoadFinished = AppStorage.get('isDesktopLoadFinished') as boolean;
    Log.showDebug(TAG, `build start ${isDesktopLoadFinished} page ${this.pageIndex}`);
    return isDesktopLoadFinished == true;
  }

  @Builder MenuBuilder() {
    Flex({ direction: FlexDirection.Column, justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
      AppMenu({
        getMenuInfoList: () => this.getMenu()
      })
    }
    .width(StyleConstants.CONTEXT_MENU_WIDTH)
    .borderRadius(StyleConstants.DEFAULT_12)
  }

  private getMenu(): MenuInfo[] {
    let menuInfoList: MenuInfo[] = [];
    let setting = new MenuInfo();
    setting.menuType = CommonConstants.MENU_TYPE_FIXED
    setting.menuImgSrc = '/common/pics/ic_public_settings.svg'
    setting.menuText = $r('app.string.into_settings')
    setting.onMenuClick = () => {
      Trace.start(Trace.CORE_METHOD_START_SETTINGS);
      this.mPageDesktopViewModel?.intoSetting();
    }
    menuInfoList.push(setting);

    let addOrDeleteBlankPage = new MenuInfo();
    addOrDeleteBlankPage.menuType = CommonConstants.MENU_TYPE_FIXED
    addOrDeleteBlankPage.menuImgSrc = this.mPageDesktopViewModel?.getBlankPageBtnIcon()
    addOrDeleteBlankPage.menuText = this.mPageDesktopViewModel?.getBlankPageBtnStr()
    addOrDeleteBlankPage.onMenuClick = () => {
      this.mPageDesktopViewModel?.addOrDeleteBlankPage();
    }
    menuInfoList.push(addOrDeleteBlankPage);
    return menuInfoList;
  }

  build() {
    Column() {
      if (this.buildLog()) {}
        if (this.desktopLoadFinished) {
          Swiper(this.swiperController) {
            ForEach(this.pageList, (item: number, index: number) => {
              if (AppStorage.get('deviceType') == CommonConstants.DEFAULT_DEVICE_TYPE) {
                Column() {
                  SwiperPage({
                    appListInfo: $appListInfo,
                    swiperPage: index.valueOf(),
                    gridConfig: this.gridConfig,
                    mPageDesktopViewModel: this.mPageDesktopViewModel
                  }).id(`SwiperPage_${item}${index}`)
                }
                .gesture(
                LongPressGesture({ repeat: false })
                  .onAction((event: GestureEvent) => {
                    this.dialogController?.open();
                  })
                )
                .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
              } else {
                SwiperPage({
                  appListInfo: $appListInfo,
                  swiperPage: index.valueOf(),
                  gridConfig: this.gridConfig,
                  mPageDesktopViewModel: this.mPageDesktopViewModel
                }).id(`SwiperPage_${item}${index}`)
                  .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
                  .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
              }
            }, (item: number, index: number) => {
              return `${item}${index}`;
            })
          }
          .id(`${TAG}_Swiper`)
          .padding({
            top: this.navigationBarStatusValue ?
              this.mPageDesktopViewModel!.getPageDesktopStyleConfig().mDesktopMarginTop :
              this.mPageDesktopViewModel!.getPageDesktopStyleConfig().mDesktopMarginTop + 0
          })
          .height(StyleConstants.PERCENTAGE_100)
          .width(StyleConstants.PERCENTAGE_100)
          .indicator(this.desktopIndicator)
          .loop(false)
          .index(this.pageIndex)
          .onChange((index) => {
            if (typeof index !== 'undefined' && this.pageIndex !== index) {
              this.pageIndex = index;
              Log.showInfo(TAG, `swiper change to page ${index}`);
              localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_FORM_ITEM_VISIBLE, null);
            }
          })
          .onGestureSwipe((index: number, extraInfo: SwiperAnimationEvent) => {
            this.desktopEventResponse = false;
          })
          .onAnimationStart((index: number, targetIndex: number, extraInfo: SwiperAnimationEvent) => {
            this.desktopEventResponse = false;
          })
          .onAnimationEnd((index: number, extraInfo: SwiperAnimationEvent) => {
            this.desktopEventResponse = true;
            if (typeof index !== 'undefined') {
              this.pageIndex = index;
              Log.showInfo(TAG, `swiper animation end to page ${index}`);
              localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_FORM_ITEM_VISIBLE, null);
            }
          })
          .hitTestBehavior(this.desktopEventResponse ? HitTestMode.Default : HitTestMode.Block)
        }
    }
    .id(`${TAG}`)
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .height(StyleConstants.PERCENTAGE_100)
    .width(StyleConstants.PERCENTAGE_100)
  }
}