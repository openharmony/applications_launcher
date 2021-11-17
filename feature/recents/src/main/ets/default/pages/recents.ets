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

import GridName from '../../../../../../../common/src/main/ets/default/uicomponents/GridName.ets';
import AppIcon from '../../../../../../../common/src/main/ets/default/uicomponents/AppIcon.ets';
import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants.ets';
import RecentsPresenter from '../common/presenter/RecentsPresenter.ets';
import RecentsStage from '../common/RecentsStage.ets';

let mRecentsPresenter: RecentsPresenter;

@Entry
@Component
struct Recent {
  @StorageLink('recentProcessList') mRecentProcessList: [] = [];
  @State size: string = StyleConstants.PERCENTAGE_100;
  private mRecentsStage = new RecentsStage();

  onPageShow() {
    console.log("Launcher recents  onPageShow");
    this.mRecentsStage.onCreate();
    mRecentsPresenter = RecentsPresenter.getInstance();
    mRecentsPresenter.getRecentProcessList();
  }

  onPageHide() {
    console.info("Launcher recents  onPageHide");
    this.mRecentProcessList = [];
    this.mRecentsStage.onDestroy();
  }

  build() {
    Column() {
      if (this.mRecentProcessList.length === 0) {
        emptyMsgDisplay();
      }
      recentProcessListDisplay({ recentProcessList: $mRecentProcessList });
    }
    .width(this.size)
    .height(this.size)
    .backgroundImage(StyleConstants.DEFAULT_BACKGROUND_IMAGE_RECENT)
  }
}

@Component
struct recentProcessListDisplay {
  @Link recentProcessList: [];
  scroller: Scroller = new Scroller();
  @State AppIconSize: number = 55;
  @State AppItemHeight: number = StyleConstants.DEFAULT_APP_ITEM_HEIGHT;
  @State AppItemWidth: number = StyleConstants.DEFAULT_APP_ITEM_WIDTH;
  @State heightSize: string = StyleConstants.PERCENTAGE_100;
  @State appHeightSize: string = StyleConstants.PERCENTAGE_85;
  @State deleteHeightSize: string = StyleConstants.PERCENTAGE_15;
  @State AppborderRadius: number  = 10;
  @State DeleteImageSize: number = 50;
  @State DeleteOpacity: number = 0.5;
  @State margin: number = 10;

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
                    appIcon: item.appIconId,
                    bundleName: item.bundleName,
                    labelId: item.appLabelId,
                    useCache: false
                  })
                  GridName({
                    appName: item.appName,
                    nameHeight: this.AppItemHeight - this.AppItemWidth,
                    nameWidth: this.AppItemWidth,
                    bundleName: item.bundleName,
                    labelId: item.appLabelId,
                    useCache: false
                  })
                }
                .margin({ bottom: this.margin })

                Image(StyleConstants.DEFAULT_APP_IMAGE)
                  .borderRadius(this.AppborderRadius)
                  .width(StyleConstants.PERCENTAGE_100)
                  .height(StyleConstants.PERCENTAGE_70)
              }
              .width(StyleConstants.APP_IMAGE_WIDTH)
              .height(this.heightSize)
              .margin({ right: this.margin })
              .onClick(() => {
                mRecentsPresenter.startUpApp(item.abilityName, item.bundleName);
              })
              .gesture(
                PanGesture({ fingers: 1, direction: PanDirection.Vertical, distance: 5 })
                  .onActionEnd((e) => {
                  let mOffectWidth = (StyleConstants.APP_IMAGE_WIDTH) / 2;
                  if (e.offsetY < -50 && e.offsetX <= mOffectWidth && -mOffectWidth <= e.offsetX) {
                    mRecentsPresenter.removeRecentProcess(item.missionId);
                  }
                }))
            },(item) => JSON.stringify(item))
          }
        }.height(this.appHeightSize)
        .scrollable(ScrollDirection.Horizontal)
      }
      .width(this.heightSize)
      .height(this.appHeightSize)

      Column() {
        Image(StyleConstants.DEFAULT_DELETE_IMAGE)
          .width(this.DeleteImageSize)
          .height(this.DeleteImageSize)
          .opacity(this.DeleteOpacity)
          .align(Alignment.Bottom)
          .onClick(() => {
            mRecentsPresenter.clearRecentProcess();
            setTimeout(() => {
              console.info("Launcher recents  clearAll this.mRecentsPresenter.back()");
              mRecentsPresenter.back();
            }, 1500);
          })
      }.alignItems(HorizontalAlign.Center)
      .width(this.heightSize)
      .height(this.deleteHeightSize)
    }
  }
}

@Component
struct emptyMsgDisplay {
  @State size: string = StyleConstants.PERCENTAGE_100;

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      Text($r('app.string.No_running_apps_recently'))
        .fontColor(StyleConstants.DEFAULT_FONT_COLOR)
        .fontSize(StyleConstants.DEFAULT_NUMBER)
    }
    .width(this.size)
    .height(this.size)
  }
}