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

import StyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import SwiperPage from './SwiperPage.ets';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';

const TAG = "GridSwiper";

@Component
export default struct GridSwiper {
  @Prop gridConfig: string;
  @StorageLink('pageIndex') PageIndex: number = 0;
  private mPageDesktopViewModel;
  @State mAppGridInfo: [[]] = [[]];
  private swiperController: SwiperController = new SwiperController();

  private aboutToAppear(): void  {
    this.mPageDesktopViewModel.setSwiperController(this.swiperController);
  }

  private aboutToDisappear(): void  {
    console.info("Launcher GridSwiper aboutToDisappear");
    this.mPageDesktopViewModel.setPageIndex();
  }

  private buildLog(): boolean {
    let isDesktopLoadFinished = AppStorage.Get('isDesktopLoadFinished');
    Log.showInfo(TAG, `build start ${isDesktopLoadFinished} page ${this.PageIndex}`);
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
        .height(StyleConstants.PERCENTAGE_100)
        .width(StyleConstants.PERCENTAGE_100)
        .indicatorStyle({
          selectedColor: StyleConstants.DEFAULT_FONT_COLOR
        })
        .loop(false)
        .index(this.PageIndex)
        .onChange((index) => {
          Log.showInfo(TAG, `swiper change to page ${index}`);
          this.mPageDesktopViewModel.changeIndexOnly(index);
        })
      }
    }
    .height(StyleConstants.PERCENTAGE_100)
    .width(StyleConstants.PERCENTAGE_100)
  }
}