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

import { Log, Trace, StyleConstants, CommonConstants, AppMenu, MenuInfo, localEventManager, EventConstants } from '@ohos/common';
import SwiperPage from './SwiperPage';

const TAG = "GridSwiper";
const APP_INFO_REFRESH_DELAY = 1000;

@Component
export default struct GridSwiper {
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  @StorageLink('isDesktopLoadFinished') desktopLoadFinished: boolean = false;
  @Prop gridConfig: string;
  @StorageLink('pageIndex') pageIndex: number = 0;
  private mPageDesktopViewModel;
  @StorageLink('appListInfo') @Watch('updatePageList') appListInfo: {
    appGridInfo: [[]]
  } = { appGridInfo: [[]] };
  @State pageList: number[] = [0];
  private swiperController: SwiperController = new SwiperController();
  private dialogController: CustomDialogController;

  aboutToAppear(): void {
    this.mPageDesktopViewModel.setSwiperController(this.swiperController);
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, 'aboutToDisappear');
    delete this.dialogController;
    this.dialogController = null;
    this.swiperController = null;
  }

  private updatePageList(): void {
    if (this.pageList.length !== this.appListInfo.appGridInfo?.length) {
      if (this.pageList.length < this.appListInfo.appGridInfo.length) {
        for (let i = this.pageList.length - 1; i < this.appListInfo.appGridInfo.length; i++) {
          if (this.pageList.indexOf(i) === -1) {
            this.pageList.push(i);
          }
        }
      }
      if (this.pageList.length > this.appListInfo.appGridInfo.length) {
        for (let i = this.pageList.length - 1; i >= this.appListInfo.appGridInfo.length; i--) {
          if (this.pageList.indexOf(i) !== -1) {
            this.pageList.splice(i, 1);
          }
        }
      }
    }
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

  itemMove(moveX: number, moveY: number){
    const hotArea: number = 12;
    let screenWidth: number = AppStorage.Get('screenWidth') ?? 0;
    let screenHeight: number = AppStorage.Get('screenHeight') ?? 0;
    const isSwappingPage: boolean = AppStorage.Get('isSwappingPage');
    if (isSwappingPage || !screenWidth || !screenHeight) {
      return;
    }
    let curPageIndex: number = AppStorage.Get('pageIndex');
    if (moveX < hotArea && curPageIndex > 0 && moveY < screenHeight) {
      this.mPageDesktopViewModel.showPrevious();
      this.movingIconSwapPageDelay();
    }
    if (moveX > (screenWidth - hotArea) && moveY < screenHeight) {
      let cachePageIndex = this.mPageDesktopViewModel.getGridPageCount();
      if (curPageIndex == cachePageIndex - 1 && !this.mPageDesktopViewModel.isBlankPage()) {
        this.mPageDesktopViewModel.addBlankPage(true);
      } else if(curPageIndex < cachePageIndex - 1) {
        this.mPageDesktopViewModel.showNext();
      }
      this.movingIconSwapPageDelay();
    }
  }

  /**
   * Increase delay when dragging app to other page.
   */
  movingIconSwapPageDelay() {
    AppStorage.SetOrCreate('isSwappingPage', true);
    setTimeout(() => {
      AppStorage.SetOrCreate('isSwappingPage', false);
    }, APP_INFO_REFRESH_DELAY);
  }

  build() {
    Column() {
      if (this.buildLog()) {}
      if (this.desktopLoadFinished) {
        Swiper(this.swiperController) {
          ForEach(this.pageList, (item, index: number) => {
            if (AppStorage.Get('deviceType') == CommonConstants.DEFAULT_DEVICE_TYPE) {
              Column() {
                SwiperPage({
                  swiperPage: index.valueOf(),
                  gridConfig: this.gridConfig,
                  mPageDesktopViewModel: this.mPageDesktopViewModel
                })
              }
              .gesture(
                LongPressGesture({ repeat: false })
                  .onAction((event: GestureEvent) => {
                    this.dialogController.open()
                  })
              )
              .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
            } else {
              SwiperPage({
                swiperPage: index.valueOf(),
                gridConfig: this.gridConfig,
                mPageDesktopViewModel: this.mPageDesktopViewModel
              })
                .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
                .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
            }
          }, item => item)
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
          localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_FORM_ITEM_VISIBLE, null);
        })
      }
    }
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .height(StyleConstants.PERCENTAGE_100)
    .width(StyleConstants.PERCENTAGE_100)
    .onDragMove((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `onDragMove event: [${event.getX()}, ${event.getY()}]`);
      if (!AppStorage.Get('isDrag')) return;
      if (AppStorage.Get('deviceType') === CommonConstants.DEFAULT_DEVICE_TYPE
      || (AppStorage.Get('deviceType') !== CommonConstants.DEFAULT_DEVICE_TYPE
      && AppStorage.Get('dragItemType') === CommonConstants.DRAG_FROM_DESKTOP)) {
        this.itemMove(event.getX(), event.getY());
      }
    })
  }
}