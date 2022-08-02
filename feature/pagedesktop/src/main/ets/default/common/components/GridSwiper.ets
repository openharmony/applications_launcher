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
import { StyleConstants } from '@ohos/common';
import SwiperPage from './SwiperPage';

const TAG = "GridSwiper";

@Component
export default struct GridSwiper {
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  @Prop gridConfig: string;
  @StorageLink('pageIndex') pageIndex: number = 0;
  private mPageDesktopViewModel;
  @State mAppGridInfo: [[]] = [[]];
  private swiperController: SwiperController = new SwiperController();

  aboutToAppear(): void  {
    this.mPageDesktopViewModel.setSwiperController(this.swiperController);
  }

  aboutToDisappear(): void  {
    Log.showInfo(TAG, 'aboutToDisappear');
  }

  private buildLog(): boolean {
    let isDesktopLoadFinished = AppStorage.Get('isDesktopLoadFinished');
    Log.showInfo(TAG, `build start ${isDesktopLoadFinished} page ${this.pageIndex}`);
    return isDesktopLoadFinished == true;
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      if (this.buildLog()) {
        Swiper(this.swiperController) {
          ForEach(this.mAppGridInfo, (item) => {
            SwiperPage({
              mAppListInfo: item,
              gridConfig: this.gridConfig,
              mPageDesktopViewModel: this.mPageDesktopViewModel
            })
          })
        }
        .padding({
          top: this.navigationBarStatusValue ? this.mPageDesktopViewModel.getPageDesktopStyleConfig().mDesktopMarginTop : this.mPageDesktopViewModel.getPageDesktopStyleConfig().mDesktopMarginTop + 0
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
    .height(StyleConstants.PERCENTAGE_100)
    .width(StyleConstants.PERCENTAGE_100)
  }
}