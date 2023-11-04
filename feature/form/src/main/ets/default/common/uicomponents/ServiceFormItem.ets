/**
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
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
  ResourceManager,
  Log,
  StyleConstants,
  CheckEmptyUtils,
  CardItemInfo
} from '@ohos/common';
import ThisStyleConstants from '../constants/StyleConstants';
import Curves from '@ohos.curves'

const TAG = 'ServiceFormItem';

@Component
export default struct ServiceFormItem {
  @StorageProp('cornerRadiusDefaultL') mRadius: number = px2vp(ResourceManager.getInstance()
    .getNumberByResource($r('sys.float.ohos_id_corner_radius_default_l')));
  @State showFormName: boolean = true;
  @State isAllowUpdate: boolean = true;
  @State isShow: boolean = true;
  @State isHover: boolean = false;
  @State mFormItemWidth: number = 0;
  @State mFormItemHeight: number = 0;
  @State iconScale: number = 1;
  @State iconOpacity: number = 1;
  @State animateParam: AnimateParam = {
    duration: 200,
    tempo: 1,
    curve: Curves.springCurve(0.5, 1, 350, 35)
  };
  private idIndex: number = 0;
  private formItem: CardItemInfo;
  private formId: number;
  getFormId: (id: number) => void;
  @State opacityValue: number = 1;
  @State blurValue: number = 50;

  public aboutToAppear(): void {
    Log.showInfo(TAG, `enter aboutToAppear , bundlename is ${this.formItem.bundleName}`);
  }

  public aboutToDisappear(): void {
    Log.showInfo(TAG, `enter aboutToDisappear , bundlename is ${this.formItem.bundleName}`);
  }

  build() {
    Column() {
      Stack() {
        FormComponent({
          id: this.formItem.cardId as number,
          name: this.formItem.cardName as string,
          bundle: this.formItem.bundleName as string,
          ability: this.formItem.abilityName as string,
          module: this.formItem.moduleName as string,
          dimension: this.formItem.cardDimension
        })
          .hoverEffect(HoverEffect.None)
          .clip(new Rect({ width: this.mFormItemWidth, height: this.mFormItemHeight, radius: this.mRadius }))
          .size({ width: this.mFormItemWidth, height: this.mFormItemHeight })
          .allowUpdate(this.isAllowUpdate)
          .visibility(this.isShow ? Visibility.Visible : Visibility.None)
          .onAcquired((form) => {
            Log.showInfo(TAG, `FormComponent card id is: ${form.id} , bundleName:${this.formItem.bundleName}`);
            this.formItem.cardId = form.id;
            this.formId = form.id;
            if (this.getFormId) {
              this.getFormId(form.id);
            }
          })
          .onError((error) => {
            Log.showInfo(TAG, `FormComponent error msg: ${error.msg}`);
          })
          .onUninstall((info) => {
            Log.showInfo(TAG, `FormComponent uninstall formid: ${info.id}, bundleName:${this.formItem.bundleName}`);
          })
          .onLoad(() => {
            Log.showInfo(TAG, `FormComponent load success: bundleName:${this.formItem.bundleName}`);
            animateTo({
              delay: 150,
              curve: Curve.Friction,
              duration: 250
            }, () => {
              this.opacityValue = 0;
              this.blurValue = 0;
            })
          })
          .blur(this.blurValue)

        Column()
          .backgroundColor(Color.White)
          .opacity(this.opacityValue)
          .clip(new Rect({ width: this.mFormItemWidth, height: this.mFormItemHeight, radius: this.mRadius }))
          .size({ width: this.mFormItemWidth, height: this.mFormItemHeight })
      }
      .onTouch((event: TouchEvent) => {
        if (event.type === TouchType.Down) {
          this.iconScale = 0.9;
        } else if (event.type === TouchType.Up) {
          this.iconScale = 1;
        }
      })
      .scale({ x: this.iconScale, y: this.iconScale})
      .opacity(this.iconOpacity)
      .animation(this.animateParam)

      Column() {
        ServiceFormName({
          bundleName: this.formItem.bundleName,
          moduleName: this.formItem.moduleName,
          labelId: this.formItem.appLabelId,
          appName: this.formItem.appName,
          formNum: this.formItem.totalDimensionCount,
          idIndex: this.idIndex
        })
      }
      .visibility(this.showFormName ? Visibility.Visible : Visibility.Hidden)
    }
    .onHover((isHover: boolean) => {
      Log.showInfo(TAG, `Form onHover isHover: ${isHover}`);
      this.isHover = isHover;
    })
    .onDisAppear(() => {
      Log.showInfo(TAG, `formItemComponent onDisAppear: ${this.formId}, bundleName: ${this.formItem.bundleName}`);
    })
  }
}

@Component
struct ServiceFormName {
  private nameLines: number = globalThis.PageDesktopViewModel?.getPageDesktopStyleConfig().mNameLines;
  bundleName: string;
  moduleName: string;
  labelId: number;
  @State @Watch("updateName") appName: string = '';
  formNum: number;
  useCache: boolean = true;
  private mResourceManager;
  private idIndex: number = 0;

  public aboutToAppear(): void  {
    this.mResourceManager = ResourceManager.getInstance();
    this.updateName();
  }

  public appNameLoadCallback(name: string) {
    this.appName = name;
  }

  public updateName() {
    if (CheckEmptyUtils.isEmpty(this.appName)) {
      this.mResourceManager.getAppNameWithCache(this.labelId, this.bundleName, this.moduleName,
      this.appName, this.appNameLoadCallback.bind(this));
    }
  }

  build() {
    Row() {
      Text(this.appName)
        .id(`${TAG}_ServiceFormName_${this.idIndex}_Text_${this.appName}`)
        .fontSize($r('sys.float.ohos_id_text_size_body2'))
        .fontColor($r('sys.color.ohos_id_color_text_primary_contrary'))
        .fontWeight(this.mResourceManager.getFontWeightRegular())
        .lineHeight(ThisStyleConstants.FORM_SERVICE_FORM_NAME_LINE_HEIGHT)
        .textAlign(TextAlign.Center)
        .textOverflow({overflow: TextOverflow.Ellipsis})
        .maxLines(this.nameLines)
        .constraintSize({maxWidth: StyleConstants.PERCENTAGE_80})

      Text(String(this.formNum))
        .id(`${TAG}_ServiceFormName_${this.idIndex}_Text_${this.formNum}`)
        .fontSize($r('sys.float.ohos_id_text_size_body3'))
        .fontColor($r('sys.color.ohos_id_color_text_secondary_contrary'))
        .fontWeight(this.mResourceManager.getFontWeightMedium())
        .lineHeight(ThisStyleConstants.FORM_SERVICE_FORM_NAME_NUM_LINE_HEIGHT)
        .margin({left: ThisStyleConstants.FORM_SERVICE_FROM_NAME_NUMBER_MARGIN})
        .textAlign(TextAlign.Center)
        .maxLines(this.nameLines)
    }
    .alignItems(VerticalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .width(StyleConstants.PERCENTAGE_100)
    .margin({top: ThisStyleConstants.FORM_SERVICE_FORM_ICON_NAME_MARGIN_TOP})
  }
}