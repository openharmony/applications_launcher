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

import {
  FormModel,
  CardItemInfo,
  Log,
  windowManager,
  localEventManager,
  StyleConstants,
  EventConstants
} from '@ohos/common';

const TAG = 'FormManagerComponent';

/**
 * Form manager view  Component (phone adaptation).
 */
@Component
export struct FormManagerComponent {
  @StorageLink('formAppInfo') formAppInfo: CardItemInfo = new CardItemInfo();
  @StorageLink('formMgrItem') formItem: Array<CardItemInfo> = [];
  @State allowUpdate: boolean = false;
  private mSwiperController: SwiperController = new SwiperController();
  private mFormModel: FormModel = FormModel.getInstance();
  private mSwiperIndex: number = 0;
  @State enabledDomEventResponse: boolean = true;
  @State chooseCardId: number | undefined = -1;
  private mFormIdMap: Map<number, number> = new Map<number, number>();
  private mFormComponentWidth: number[] = [
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 2,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 2,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 4,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 4,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 1,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 1,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 4,
  ];
  private mFormComponentHeight: number[] = [
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 1,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 2,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 2,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 4,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 2,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 1,
    StyleConstants.FORM_MGR_FORM_SIZE * StyleConstants.DPI_RATIO * 6,
  ];

  aboutToAppear(): void {
    this.chooseCardId = -1;
    this.mFormModel = FormModel.getInstance();
    Log.showInfo(TAG, `aboutToAppear formAppInfo: ${JSON.stringify(this.formAppInfo)}`);
    this.getCurrentFormInfo();
  }

  aboutToDisappear(): void {
    if (this.chooseCardId !== -1) {
      this.clearNoUseFormById();
    } else {
      this.clearAllFormById();
    }
  }

  /**
   * Get current form information by bundle name.
   */
  private async getCurrentFormInfo() {
    this.mFormModel.getFormsInfoByBundleName(this.formAppInfo.bundleName);
  }

  /**
   * Get choose card info from current form information.
   *
   * @return {any} formCardItem
   */
  private getChooseCard() {
    this.chooseCardId = this.mFormIdMap.get(this.mSwiperIndex);
    let formCardItem: CardItemInfo = new CardItemInfo();
    formCardItem.cardId = this.mFormIdMap.get(this.mSwiperIndex);
    let count = 0;
    let isStop = false;
    for (let i = 0; i < this.formItem.length; i++) {
      if (isStop) {
        break;
      }
      for (let j = 0; j < this.formItem[i].supportDimensions.length; j++) {
        if (count === this.mSwiperIndex) {
          formCardItem.cardName = this.formItem[i].cardName;
          formCardItem.bundleName = this.formItem[i].bundleName;
          formCardItem.abilityName = this.formItem[i].abilityName;
          formCardItem.moduleName = this.formItem[i].moduleName;
          formCardItem.cardDimension = this.formItem[i].supportDimensions[j];
          formCardItem.formConfigAbility = this.formItem[i].formConfigAbility;
          formCardItem.appLabelId = this.formAppInfo.appLabelId;
          isStop = true;
          break;
        }
        count++;
      }
    }
    return formCardItem;
  }

  /**
   * Keep the form which be added to the desktop, and delete the remaining forms.
   */
  private clearNoUseFormById(): void {
    for (let i = 0; i < this.mFormIdMap.size; i++) {
      if (i != this.mSwiperIndex) {
        this.mFormModel.deleteFormByFormID(this.mFormIdMap.get(i));
      }
    }
  }

  /**
   * Delete all form by id.
   */
  private clearAllFormById(): void {
    for (let i = 0; i < this.mFormIdMap.size; i++) {
      this.mFormModel.deleteFormByFormID(this.mFormIdMap.get(i));
    }
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      Row() {
        Image(StyleConstants.DEFAULT_FORM_MGR_BACK_IMAGE)
          .width(StyleConstants.FORM_MGR_BACK_ICON_WIDTH * StyleConstants.DPI_RATIO)
          .height(StyleConstants.FORM_MGR_BACK_ICON_HEIGHT * StyleConstants.DPI_RATIO)
          .objectFit(ImageFit.Fill)
          .margin({left: StyleConstants.FORM_MGR_BACK_ICON_LEFT_MARGIN * StyleConstants.DPI_RATIO})
          .onClick(() => {
            Log.showDebug(TAG, 'hide form manager window');
            this.clearAllFormById();
            windowManager.destroyWindow(windowManager.FORM_MANAGER_WINDOW_NAME);
          })
        Blank()
      }
      .margin({top: StyleConstants.FORM_MGR_STATUS_BAR_HEIGHT * StyleConstants.DPI_RATIO})
      .width('100%')
      .height(StyleConstants.FORM_MGR_APP_BAR_HEIGHT * StyleConstants.DPI_RATIO)
      Text(this.formAppInfo.appName)
        .fontColor(StyleConstants.DEFAULT_FORM_MGR_FONT_COLOR)
        .fontSize(StyleConstants.FORM_MGR_APP_LABEL_TEXT_SIZE * StyleConstants.DPI_RATIO)
        .margin({top: 10 * StyleConstants.DPI_RATIO, bottom: 8 * StyleConstants.DPI_RATIO })
      Column({ space: 5 }) {
        Swiper(this.mSwiperController) {
          ForEach(this.formItem, (formItem: CardItemInfo) => {
            ForEach(formItem.supportDimensions, (dimensionItem: number) => {
              Column() {
                Text(formItem.description)
                  .width('70%')
                  .fontColor(0xe5ffffff)
                  .fontSize(StyleConstants.FORM_MGR_DESCRIPTION_TEXT_SIZE * StyleConstants.DPI_RATIO)
                  .textAlign(TextAlign.Center)
                Column() {
                  Flex({
                    direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
                    if (this.formAppInfo.bundleName == formItem.bundleName) {
                      FormComponent({
                        id: formItem.cardId as number,
                        name: formItem.cardName as string,
                        bundle: formItem.bundleName as string,
                        ability: formItem.abilityName as string,
                        module: formItem.moduleName as string,
                        dimension: dimensionItem,
                      })
                        .enabled(false)
                        .focusable(false)
                        .clip(new Rect({
                          width: this.mFormComponentWidth[dimensionItem - 1],
                          height: this.mFormComponentHeight[dimensionItem - 1],
                          radius: 24
                        }))
                        .size({
                          width: this.mFormComponentWidth[dimensionItem - 1],
                          height: this.mFormComponentHeight[dimensionItem - 1]
                        })
                        .allowUpdate(this.allowUpdate)
                        .visibility(Visibility.Visible)
                        .onAcquired((form) => {
                          let currentIndex = this.calculateIndex(formItem, dimensionItem);
                          Log.showInfo(TAG, `FormComponent card id is: ${form.id}, currentIndex: ${currentIndex}`);
                          if (currentIndex >= 0) {
                            this.mFormIdMap.set(currentIndex, form.id);
                          }
                        })
                        .onError((error) => {
                          Log.showDebug(TAG, `FormComponent error msg: ${error.msg}`);
                        })
                    }
                  }
                }
                .height('80%')
              }.width('100%')
            }, (dimensionItem: number) => JSON.stringify(dimensionItem))
          }, (formItem: CardItemInfo) => JSON.stringify(formItem))
        }.width('100%')
        .height('100%')
        .loop(false)
        .duration(80)
        .cachedCount(1)
        .index(0)
        .indicator(Indicator.dot().selectedColor(StyleConstants.DEFAULT_FORM_MGR_FONT_COLOR))
        .onChange((index: number) => {
          if (this.mSwiperIndex !== index) {
            this.mSwiperIndex = index;
          }
        })
        .onAnimationStart(() => {
          this.enabledDomEventResponse = false;
        })
        .onAnimationEnd(() => {
          this.enabledDomEventResponse = true;
        })
      }.alignItems(HorizontalAlign.Center)
      .height('60%')
      Blank()
      Button({type: ButtonType.Capsule}) {
        Row() {
          Text($r('app.string.add_to_desktop'))
            .fontColor(StyleConstants.DEFAULT_FORM_MGR_FONT_COLOR)
            .fontSize(StyleConstants.FORM_MGR_ADD_TO_DESKTOP_TEXT_SIZE * StyleConstants.DPI_RATIO)
        }
      }
      .enabled(this.enabledDomEventResponse)
      .backgroundColor(0x66ffffff)
      .width(StyleConstants.FORM_MGR_ADD_TO_DESKTOP_BUTTON_WIDTH * StyleConstants.DPI_RATIO)
      .height(StyleConstants.FORM_MGR_ADD_TO_DESKTOP_BUTTON_HEIGHT * StyleConstants.DPI_RATIO)
      .margin({bottom: StyleConstants.FORM_MGR_ADD_TO_DESKTOP_BUTTON_BOTTOM_MARGIN * StyleConstants.DPI_RATIO,
        left: StyleConstants.FORM_MGR_ADD_TO_DESKTOP_BUTTON_LEFT_MARGIN * StyleConstants.DPI_RATIO,
        right: StyleConstants.FORM_MGR_ADD_TO_DESKTOP_BUTTON_RIGHT_MARGIN * StyleConstants.DPI_RATIO})
      .onClick(() => {
        Log.showDebug(TAG, 'form add to desktop');
        localEventManager.sendLocalEventSticky(
          EventConstants.EVENT_REQUEST_PAGEDESK_FORM_ITEM_ADD, this.getChooseCard()
        );
        this.clearNoUseFormById();
        windowManager.destroyWindow(windowManager.FORM_MANAGER_WINDOW_NAME);
        windowManager.destroyWindow(windowManager.FORM_SERVICE_WINDOW_NAME);
        localEventManager.sendLocalEventSticky(EventConstants.EVENT_OPEN_FOLDER_TO_CLOSE, null);
      })
    }
    .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .backgroundImage(StyleConstants.DEFAULT_FORM_MGR_BACKGROUND_IMAGE)
  }

  private calculateIndex(formInfo: CardItemInfo, dimension: number): number {
    let count = 0;
    for (let i = 0; i < this.formItem.length; i++) {
      let tempItem = this.formItem[i];
      if (formInfo.cardName !== tempItem.cardName ||
        formInfo.bundleName !== tempItem.bundleName ||
        formInfo.abilityName !== tempItem.abilityName ||
        formInfo.moduleName !== tempItem.moduleName) {
        count += tempItem.supportDimensions.length;
        continue;
      }
      for (let j = 0; j < formInfo.supportDimensions.length; j++) {
        if (dimension === formInfo.supportDimensions[j]) {
          return count;
        }
        count++;
      }
    }
    return -1;
  }
}
