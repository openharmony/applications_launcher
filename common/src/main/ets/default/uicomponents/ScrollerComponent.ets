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
import amsMissionManager from '../manager/AmsMissionManager.ts'
import StyleConstants from '../constants/StyleConstants';

@Component
export default struct ScrollerComponent {
  @StorageLink("shapshotList") dataList: {
    name: any,
    image: any,
    missionId: number,
    boxSize: number,
    bundleName: string,
    left?: number,
    right?: number,
  }[] = [];
  @StorageLink("snapShotWidth") listWidth: number = 0;
  scroller: Scroller= new Scroller() ;
  private screenWidth = 1200 - StyleConstants.DEFAULT_40 - StyleConstants.DEFAULT_30;
  popupHide: Function= null;
  updateData: Function= null;

  build() {
    Column() {
      Stack({ alignContent: Alignment.Center }) {
        Scroll(this.scroller) {
          Row() {
            ForEach(this.dataList, (item) => {
              Column() {
                Column() {
                  Row() {
                    Text(item.name.toString())
                      .height(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
                      .textOverflow({ overflow: TextOverflow.Ellipsis })
                      .fontSize(StyleConstants.DEFAULT_10)
                      .textAlign(TextAlign.Start)
                      .margin({
                        top: StyleConstants.DEFAULT_ITEM_RADIUS,
                        bottom: StyleConstants.DEFAULT_SMART_DOCK_MISSION_MERGIN_BOTTOM
                      })
                      .maxLines(1)
                      .width(item.boxSize - StyleConstants.DEFAULT_30)
                      .hoverEffect(HoverEffect.None)
                    Text('×')
                      .height(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
                      .fontSize(StyleConstants.DEFAULT_15)
                      .width(StyleConstants.DEFAULT_20)
                      .textAlign(TextAlign.Center)
                      .margin({ top: StyleConstants.DEFAULT_ITEM_RADIUS,
                        bottom: StyleConstants.DEFAULT_SMART_DOCK_MISSION_MERGIN_BOTTOM,
                        right: StyleConstants.DEFAULT_SMART_DOCK_MISSION_MERGIN_RIGHT
                      })
                      .onClick((event: ClickEvent) => {
                        if (this.dataList.length <= 1) {
                          this.updateData(false, "", () => amsMissionManager.clearMission(item.missionId));
                          return
                        }
                        this.updateData(true, item.bundleName, () => amsMissionManager.clearMission(item.missionId));
                      })
                  }
                }
                .width(item.boxSize)

                Image(item.image)
                  .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_IMAGE_HEIGHT)
                  .objectFit(ImageFit.Contain)
                  .borderRadius(StyleConstants.DEFAULT_5)
                  .hoverEffect(HoverEffect.None)
              }
              .onClick((event: ClickEvent) => {
                this.popupHide()
                amsMissionManager.moveMissionToFront(item.missionId);
              })
              .width(item.boxSize)
              .margin({
                left: this.dataList.length <= 1 ? 0 : item.left,
                right: item.right || StyleConstants.DEFAULT_0
              })
              .borderRadius(StyleConstants.DEFAULT_5)
            }, item => JSON.stringify(item))
          }
        }
        .margin({
          left: this.listWidth > this.screenWidth ? StyleConstants.DEFAULT_40 : StyleConstants.DEFAULT_0,
          right: this.listWidth > this.screenWidth ? StyleConstants.DEFAULT_30 : StyleConstants.DEFAULT_0
        })
        .constraintSize({
          maxWidth: this.screenWidth,
          maxHeight: StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT
        })
        .scrollable(ScrollDirection.Horizontal)
        .scrollBar(BarState.Off)
      }
      .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT)

      Text("‹")
        .textAlign(TextAlign.Center)
        .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT)
        .width(StyleConstants.DEFAULT_30)
        .backgroundColor(StyleConstants.DEFAULT_TRANSPARENT_COLOR)
        .fontColor(StyleConstants.DEFAULT_0)
        .fontSize(StyleConstants.DEFAULT_20)
        .offset({
          x: StyleConstants.DEFAULT_0,
          y: StyleConstants.DEFAULT_0
        })
        .visibility(this.listWidth > this.screenWidth ? Visibility.Visible : Visibility.None)
        .onClick((event: ClickEvent) => {
          this.onClickLeft();
        })

      Text("›")
        .textAlign(TextAlign.Center)
        .height(StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT)
        .width(StyleConstants.DEFAULT_30)
        .backgroundColor(StyleConstants.DEFAULT_TRANSPARENT_COLOR)
        .fontColor(StyleConstants.DEFAULT_0)
        .fontSize(StyleConstants.DEFAULT_20)
        .offset({
          x: this.screenWidth + StyleConstants.PIXEL_50,
          y: StyleConstants.DEFAULT_0
        })
        .visibility(this.listWidth > this.screenWidth ? Visibility.Visible : Visibility.None)
        .onClick((event: ClickEvent) => {
          this.onClickRight();
        })

    }
    .constraintSize({
      maxWidth: this.screenWidth + StyleConstants.DEFAULT_40 + StyleConstants.DEFAULT_30,
      maxHeight: StyleConstants.DEFAULT_SMART_DOCK_MISSION_HEIGHT
    })
  }

  private onClickLeft() {
    let currentOffset = this.scroller.currentOffset().xOffset;
    let tmp = 0;
    for (let i = 0;i < this.dataList.length; i++) {
      if ((tmp = tmp + this.dataList[i].boxSize + this.dataList[i].left) >= currentOffset) {
        currentOffset = tmp - this.dataList[i].boxSize - this.dataList[i].left;
        break;
      }
    }

    this.scroller.scrollTo({
      yOffset: this.scroller.currentOffset()
      .yOffset,
      xOffset: currentOffset
    })
  }

  private onClickRight() {
    let currentOffset = this.scroller.currentOffset().xOffset;
    let tmp = 0;

    for (let i = 0;i < this.dataList.length; i++) {
      if ((tmp = tmp + this.dataList[i].boxSize + this.dataList[i].left) > currentOffset + this.screenWidth) {
        currentOffset = tmp - (this.screenWidth) + this.dataList[i].left;
        break
      }
    }

    this.scroller.scrollTo({
      yOffset: this.scroller.currentOffset()
      .yOffset,
      xOffset: currentOffset
    })
  }
}