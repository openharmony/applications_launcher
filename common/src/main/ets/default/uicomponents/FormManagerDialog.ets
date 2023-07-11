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
import { Log } from '../utils/Log';
import { FormModel } from '../model/FormModel';
import { StyleConstants } from '../constants/StyleConstants';

const TAG = 'FormManagerDialog';

/**
 * Form manager view  Component (pad adaptation).
 */
@CustomDialog
export struct FormManagerDialog {
  @StorageLink('formMgrItem') formItem: any = [];
  @State mAllowUpdate: boolean = true;
  private mSwiperController: SwiperController = new SwiperController()
  private mFormModel: FormModel;
  private mSwiperIndex: number = 0;
  private mFormIdList: number[] = [];
  private mFormComponentWidth: number[] =
    [StyleConstants.FORM_MANAGER_VIEW_CARD_WIDTH / 2,
    StyleConstants.FORM_MANAGER_VIEW_CARD_WIDTH / 2,
    StyleConstants.FORM_MANAGER_VIEW_CARD_WIDTH,
    StyleConstants.FORM_MANAGER_VIEW_CARD_WIDTH];
  private mFormComponentHeight: number[] =
    [StyleConstants.FORM_MANAGER_VIEW_CARD_HEIGHT / 4,
    StyleConstants.FORM_MANAGER_VIEW_CARD_HEIGHT / 2,
    StyleConstants.FORM_MANAGER_VIEW_CARD_HEIGHT / 2,
    StyleConstants.FORM_MANAGER_VIEW_CARD_HEIGHT];

  mFormDialogController: CustomDialogController;
  cancel: (callback?) => void;
  confirm: (formCardItem) => void;
  bundleName: string;
  appName: string;
  appLabelId: string;

  aboutToAppear(): void {
    this.mFormModel = FormModel.getInstance();
    this.cancel(this.clearAllFormById.bind(this));
    this.getCurrentFormInfo();
  }

  aboutToDisappear(): void {
    delete this.mSwiperController;
    this.mSwiperController = null;
    this.mFormDialogController = null;
    this.cancel = null;
    this.confirm = null;
  }

  /**
   * Get current form information by bundle name.
   */
  private async getCurrentFormInfo() {
    this.mFormModel.getFormsInfoByBundleName(this.bundleName);
  }

  /**
   * Get choose card info from current form information.
   *
   * @return <any> formCardItem
   */
  private getChooseCard() {
    let formCardItem: any = {};
    formCardItem.id = this.mFormIdList[this.mSwiperIndex];
    let count = 0;
    let isStop = false;
    for (let i = 0; i < this.formItem.length; i++) {
      if (isStop) break;
      for (let j = 0; j < this.formItem[i].supportDimensions.length; j++) {
        if (count === this.mSwiperIndex) {
          formCardItem.name = this.formItem[i].cardName;
          formCardItem.bundleName = this.formItem[i].bundleName;
          formCardItem.abilityName = this.formItem[i].abilityName;
          formCardItem.moduleName = this.formItem[i].moduleName;
          formCardItem.dimension = this.formItem[i].supportDimensions[j];
          formCardItem.formConfigAbility = this.formItem[i].formConfigAbility;
          formCardItem.appLabelId = this.appLabelId;
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
    let id = this.mFormIdList[this.mSwiperIndex];
    for (let i = 0; i < this.mFormIdList.length; i++) {
      if (i != this.mSwiperIndex) {
        this.mFormModel.deleteFormByFormID(this.mFormIdList[i]);
      }
    }
  }

  /**
   * Delete all form by id.
   */
  private clearAllFormById(): void {
    for (let i = 0; i < this.mFormIdList.length; i++) {
        this.mFormModel.deleteFormByFormID(this.mFormIdList[i]);
    }
  }

  build() {
    Column() {
      Text(this.appName)
        .width('70%')
        .fontSize(StyleConstants.DEFAULT_FORM_MGR_TEXT_FONT_SIZE)
        .margin({ top: StyleConstants.DEFAULT_FORM_MARGIN, bottom: StyleConstants.DEFAULT_FORM_MARGIN })
        .textAlign(TextAlign.Center)
      Column({ space: 5 }) {
        Swiper(this.mSwiperController) {
          ForEach(this.formItem, (formItem) => {
            ForEach(formItem.supportDimensions, (dimensionItem) => {
              Column() {
                Text(formItem.description)
                  .width('70%')
                  .fontSize(StyleConstants.DEFAULT_FORM_MGR_TEXT_FONT_SIZE)
                  .margin({ top: StyleConstants.DEFAULT_FORM_MARGIN, bottom: StyleConstants.DEFAULT_FORM_MARGIN })
                  .textAlign(TextAlign.Center)
              Column() {
                Flex({
                  direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
                  if (this.bundleName == formItem.bundleName) {
                    FormComponent({
                      id: formItem.cardId,
                      name: formItem.cardName,
                      bundle: formItem.bundleName,
                      ability: formItem.abilityName,
                      module: formItem.moduleName,
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
                    .allowUpdate(this.mAllowUpdate)
                    .visibility(Visibility.Visible)
                    .onAcquired((form) => {
                      Log.showDebug(TAG, `FormComponent card id is: ${form.id}`);
                      this.mFormIdList.push(form.id);
                    })
                    .onError((error) => {
                      Log.showDebug(TAG, `FormComponent error msg: ${error.msg}`);
                    })
                  }
                }
              }
              .height('70%')
              .hitTestBehavior(HitTestMode.Block)
              }
            }, (dimensionItem) => JSON.stringify(dimensionItem))
          }, (formItem) => JSON.stringify(formItem))
        }
        .height('100%')
        .loop(false)
        .index(0)
        .onChange((index: number) => {
          this.mSwiperIndex = index;
        })
      }
      .height('85%')
      Flex({ justifyContent: FlexAlign.SpaceAround }) {
        Button() {
          Text($r('app.string.cancel'))
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.BUTTON_FONT_COLOR)
        }
        .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
        .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        .width(StyleConstants.DEFAULT_BUTTON_WIDTH)
        .onClick(() => {
          this.mFormDialogController.close();
          this.clearAllFormById();
        })
        Divider()
          .vertical(true)
          .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
          .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        Button() {
          Text($r('app.string.add_to_desktop'))
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.BUTTON_FONT_COLOR)
        }
        .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
        .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        .width(StyleConstants.DEFAULT_BUTTON_WIDTH)
        .onClick(() => {
          this.mFormDialogController.close();
          this.confirm(this.getChooseCard());
          this.clearNoUseFormById();
        })
      }
    }
    .backgroundColor(Color.White)
    .padding({
      bottom: StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
    })
    .border({
      radius: StyleConstants.DEFAULT_DIALOG_RADIUS
    })
    .width(StyleConstants.FORM_MANAGER_VIEW_WIDTH)
    .height(StyleConstants.FORM_MANAGER_VIEW_HEIGHT)
  }
}
