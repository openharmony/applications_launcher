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
import CommonConstants from '../../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import ResourceManager from '../../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import CommonStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import StyleConstants from '../constants/StyleConstants';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';
import FormModel from '../../../../../../../../common/src/main/ets/default/model/FormModel';

const TAG = 'FormManagerDialog';

@CustomDialog
export default struct FormManagerDialog {
  @StorageLink('formMgrItem') mFormItem: any = [];
  @State allowUpdate: boolean = false;
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
  cancel: () => void;
  confirm: (formCardItem) => void;
  bundleName: string;
  appName: string;
  appLabelId: string;

  private aboutToAppear(): void  {
    this.mFormModel = FormModel.getInstance();
    this.getCurrentFormInfo();
  }

  private async getCurrentFormInfo() {
    this.mFormModel.getFormsInfoByBundleName(this.bundleName);
  }

  private getChooseCard() {
    let formCardItem: any = {};
    formCardItem.id = this.mFormIdList[this.mSwiperIndex];
    let count = 0;
    let isStop = false;
    for (let i = 0; i < this.mFormItem.length; i++) {
      if (isStop) break;
      for (let j = 0; j < this.mFormItem[i].supportDimensions.length; j++) {
        if (count == this.mSwiperIndex) {
          formCardItem.name = this.mFormItem[i].cardName;
          formCardItem.bundleName = this.mFormItem[i].bundleName;
          formCardItem.abilityName = this.mFormItem[i].abilityName;
          formCardItem.moduleName = this.mFormItem[i].moduleName;
          formCardItem.dimension = this.mFormItem[i].supportDimensions[j];
          formCardItem.formConfigAbility = this.mFormItem[i].formConfigAbility;
          formCardItem.appLabelId = this.appLabelId;
          isStop = true;
          break;
        }
        count++;
      }
    }
    for (let i = 0; i < this.mFormIdList.length; i++) {
      if (count != i) {
        this.mFormModel.deleteFormByFormID(this.mFormIdList[i]);
      }
    }
    return formCardItem;
  }

  private deleteAllFormById() {
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
          ForEach(this.mFormItem, (formItem) => {
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
                  FormComponent({
                    id: formItem.cardId,
                    name: formItem.cardName,
                    bundle: formItem.bundleName,
                    ability: formItem.abilityName,
                    module: formItem.moduleName,
                    dimension: dimensionItem,
                  })
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
                      console.info(`FormComponent card id is: ${form.id}`);
                      this.mFormIdList.push(form.id);
                    })
                    .onError((error) => {
                      console.info(`FormComponent error msg: ${error.msg}`);
                    })
                  }
                }
              .height('70%')
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
            .fontSize(CommonStyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(CommonStyleConstants.BUTTON_FONT_COLOR)
        }
        .backgroundColor(CommonStyleConstants.DEFAULT_BG_COLOR)
        .height(CommonStyleConstants.DEFAULT_BUTTON_HEIGHT)
        .onClick(() => {
          this.mFormDialogController.close();
          this.cancel();
        })

        Divider()
          .vertical(true)
          .color(CommonStyleConstants.DEFAULT_DIVIDER_COLOR)
          .height(CommonStyleConstants.DEFAULT_BUTTON_HEIGHT)

        Button() {
          Text($r('app.string.add_to_desktop'))
            .fontSize(CommonStyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(CommonStyleConstants.BUTTON_FONT_COLOR)
        }
        .backgroundColor(CommonStyleConstants.DEFAULT_BG_COLOR)
        .height(CommonStyleConstants.DEFAULT_BUTTON_HEIGHT)
        .onClick(() => {
          this.mFormDialogController.close();
          this.confirm(this.getChooseCard());
        })
      }
    }
    .backgroundColor(Color.White)
    .padding({
      bottom: CommonStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
    })
    .border({
      radius: CommonStyleConstants.DEFAULT_DIALOG_RADIUS
    })
    .width(StyleConstants.FORM_MANAGER_VIEW_WIDTH)
    .height(StyleConstants.FORM_MANAGER_VIEW_HEIGHT)
  }
}
