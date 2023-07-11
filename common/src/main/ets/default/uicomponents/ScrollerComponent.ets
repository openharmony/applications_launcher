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

import { StyleConstants } from '../constants/StyleConstants';
import { amsMissionManager }from '../manager/AmsMissionManager'

@Component
export struct ScrollerComponent {
  @StorageLink('snapshotList') dataList: {
    name: any,
    image: any,
    missionId: number,
    boxSize: number,
    bundleName: string,
    left?: number,
    right?: number,
  }[] = [];
  @StorageLink('snapShotWidth') listWidth: number = 0;
  scroller: Scroller= new Scroller() ;
  private screenWidth = 800;
  popupHide: Function = null;
  updateData: Function = null;

  aboutToDisappear(): void {
    this.popupHide = null;
    this.updateData = null;
  }

  build() {
    Row() {
      Column() {
        Button({ type: ButtonType.Circle, stateEffect: true }) {
          Image($r('app.media.ic_public_arrow_left'))
            .width(20)
            .height(20)
            .objectFit(ImageFit.Contain)
        }
        .width(24)
        .height(24)
        .backgroundColor('#00000005')
        .onClick((event: ClickEvent) => {
          this.scroller.scrollPage({ next: false })
        })
      }
      .alignItems(HorizontalAlign.Center)
      .justifyContent(FlexAlign.Center)
      .width(StyleConstants.DEFAULT_56)
      .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT)
      .visibility(this.listWidth > this.screenWidth ? Visibility.Visible : Visibility.None)

      Scroll(this.scroller) {
        Row({ space: StyleConstants.DEFAULT_14 }) {
          ForEach(this.dataList, (item) => {
            Column() {
              Row() {
                Text(item.name.toString())
                  .height(StyleConstants.DEFAULT_24)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .fontSize(StyleConstants.DEFAULT_14)
                  .textAlign(TextAlign.Start)
                  .maxLines(StyleConstants.DEFAULT_1)
                  .width(item.boxSize - StyleConstants.DEFAULT_30)
                  .hoverEffect(HoverEffect.None)
                  .fontWeight(FontWeight.Medium)

                Image($r('app.media.ic_public_cancel'))
                  .width(StyleConstants.DEFAULT_16)
                  .height(StyleConstants.DEFAULT_16)
                  .objectFit(ImageFit.Contain)
                  .margin({ right: StyleConstants.DEFAULT_4 })
                  .onClick((event: ClickEvent) => {
                    if (this.dataList.length <= 1) {
                      this.updateData(false, "", () => amsMissionManager.clearMission(item.missionId));
                      return
                    }
                    this.updateData(true, item.bundleName, () => amsMissionManager.clearMission(item.missionId));
                  })
              }
              .alignItems(VerticalAlign.Center)
              .justifyContent(FlexAlign.SpaceBetween)
              .width(item.boxSize)

              Image(item.image)
                .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_IMAGE_HEIGHT)
                .objectFit(ImageFit.Contain)
                .borderRadius(StyleConstants.DEFAULT_8)
                .hoverEffect(HoverEffect.None)
            }
            .onClick((event: ClickEvent) => {
              this.popupHide();
              amsMissionManager.moveMissionToFront(item.missionId);
            })
            .width(item.boxSize)
            .borderRadius(StyleConstants.DEFAULT_5)
            .justifyContent(FlexAlign.Center)
          }, item => JSON.stringify(item))
        }
        .alignItems(VerticalAlign.Center)
        .margin({
          left: this.listWidth > this.screenWidth ? StyleConstants.DEFAULT_0 : StyleConstants.DEFAULT_14,
          right: this.listWidth > this.screenWidth ? StyleConstants.DEFAULT_0 : StyleConstants.DEFAULT_14
        })
      }
      .constraintSize({
        maxWidth: this.screenWidth,
        maxHeight: StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT
      })
      .scrollable(ScrollDirection.Horizontal)
      .scrollBar(BarState.Off)
      .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT)

      Column() {
        Button({ type: ButtonType.Circle, stateEffect: true }) {
          Image($r('app.media.ic_public_arrow_right'))
            .width(20)
            .height(20)
            .objectFit(ImageFit.Contain)
        }
        .width(24)
        .height(24)
        .backgroundColor('#00000005')
        .onClick((event: ClickEvent) => {
          this.scroller.scrollPage({ next: true })
        })
      }
      .alignItems(HorizontalAlign.Center)
      .justifyContent(FlexAlign.Center)
      .width(StyleConstants.DEFAULT_56)
      .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT)
      .visibility(this.listWidth > this.screenWidth ? Visibility.Visible : Visibility.None)
    }
    .alignItems(VerticalAlign.Center)
    .justifyContent(FlexAlign.SpaceBetween)
    .constraintSize({
      maxWidth: this.screenWidth + 2 * StyleConstants.DEFAULT_56,
      maxHeight: StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT
    })
    .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT)
    .visibility(this.dataList.length < 1 ? Visibility.None : Visibility.Visible)
  }
}