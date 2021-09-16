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
import GridName from '../../../../../../../common/src/main/ets/default/uicomponents/GridName.ets'
import AppIcon from '../../../../../../../common/src/main/ets/default/uicomponents/AppIcon.ets'
import DefaultConstants from '../../../../../../../common/src/main/ets/default/common/constants/DefaultConstants.ets'
import RecentsPresenter from '../common/presenter/RecentsPresenter.ets';

let mRecentsPresenter: RecentsPresenter;
@Entry
@Component
struct Recent {
  @StorageLink('recentProcessList') mRecentProcessList: [] = []
  @State size: string = '100%'

  aboutToAppear() {
    console.log("Launcher recents  aboutToAppear start");
    mRecentsPresenter = RecentsPresenter.getInstance()
    console.log("Launcher recents  aboutToAppear end");
  }

  onPageShow() {
    console.log("Launcher recents  onPageShow start");
    mRecentsPresenter.getRecentProcessList();
    console.log("Launcher recents  onPageShow end");
  }

  onPageHide() {
    console.info("Launcher recents  onPageHide start");
    this.mRecentProcessList = []
    console.info("Launcher recents  onPageHide end");
  }

  build() {
    Column() {
      if (this.mRecentProcessList.length === 0) {
        emptyMsgDisplay()
      }
      recentProcessListDisplay({ recentProcessList: $mRecentProcessList })
    }
    .width(this.size)
    .height(this.size)
    .backgroundImage(DefaultConstants.DEFAULT_BACKGROUND_IMAGE_RECENT)
  }
}

@Component
struct recentProcessListDisplay {
  @Link recentProcessList: []
  scroller: Scroller = new Scroller()
  @State AppIconSize: number = 55
  @State AppItemHeight: number = DefaultConstants.DEFAULT_APP_ITEM_HEIGHT;
  @State AppItemWidth: number = DefaultConstants.DEFAULT_APP_ITEM_WIDTH;
  @State appHeightSize: string = '85%'
  @State deleteHeightSize: string = '15%'
  @State AppborderRadius: number  = 10
  @State DeleteImageSize: number = 50
  @State DeleteOpacity: number = 0.5
  @State margin: number = 10

  build() {
    Column() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Start, justifyContent: FlexAlign.Center }) {
        Scroll(this.scroller) {
          Row() {
            ForEach(this.recentProcessList, (item) => {
              Column() {
                Column() {
                  AppIcon({
                    iconSize: this.AppIconSize,
                    appIcon: item.iconId,
                    bundleName: item.bundleName,
                    labelId: item.labelId
                  })
                  GridName({
                    appName: item.AppName,
                    nameHeight: this.AppItemHeight - this.AppItemWidth,
                    nameWidth: this.AppItemWidth,
                    bundleName: item.bundleName,
                    labelId: item.labelId
                  })
                }
                .margin({ bottom: this.margin })

                Image(DefaultConstants.DEFAULT_APP_IMAGE)
                  .borderRadius(this.AppborderRadius)
                  .width('100%')
                  .height(DefaultConstants.APP_IMAGE_HEIGHT)
              }
              .width(DefaultConstants.APP_IMAGE_WIDTH)
              .height(DefaultConstants.PERCENTAGE_100)
              .margin({ right: this.margin })
              .onClick(() => {
                mRecentsPresenter.startUpApp(item)
              })
              .gesture(
                PanGesture({ fingers: 1, direction: PanDirection.Vertical, distance: 5 }) //
                .onActionEnd((e) => {
                  let mOffectWidth = (DefaultConstants.APP_IMAGE_WIDTH) / 2;
                  console.log('e.offsetX, Y' + e.offsetX + e.offsetY)
                  if (e.offsetY < -50 && e.offsetX <= mOffectWidth && -mOffectWidth <= e.offsetX) {
                    mRecentsPresenter.removeRecentProcess(item.missionId);
                  }
                }))
            })
          }
        }.height(this.appHeightSize)
        .scrollable(ScrollDirection.Horizontal)
      }
      .width(DefaultConstants.PERCENTAGE_100)
      .height(this.appHeightSize)

      Column() {
        Image(DefaultConstants.DEFAULT_DELETE_IMAGE)
          .width(this.DeleteImageSize)
          .height(this.DeleteImageSize)
          .opacity(this.DeleteOpacity)
          .align(Alignment.Bottom)
          .onClick(() => {
          mRecentsPresenter.clearRecentProcess();
        }))
      }.alignItems(HorizontalAlign.Center)
      .width(DefaultConstants.PERCENTAGE_100)
      .height(this.deleteHeightSize)
    }
  }
}

@Component
struct emptyMsgDisplay {
  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      Text($r('app.string.No_running_apps_recently'))
        .fontColor(DefaultConstants.DEFAULT_FONT_COLOR)
        .fontSize(DefaultConstants.DEFAULT_NUMBER)
    }
    .width(DefaultConstants.PERCENTAGE_100)
    .height(DefaultConstants.PERCENTAGE_100)
  }
}