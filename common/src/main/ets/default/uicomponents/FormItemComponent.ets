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

import { Log } from '../utils/Log';
import { AppName } from './AppName';
import { AppMenu } from './AppMenu';
import { FormModel } from '../model/FormModel';
import { StyleConstants } from '../constants/StyleConstants';
import { PresetStyleConstants } from '../constants/PresetStyleConstants';
import { CommonConstants } from '../constants/CommonConstants';
import { localEventManager } from '../manager/LocalEventManager';
import { EventConstants } from '../constants/EventConstants';

const TAG = 'FormItemComponent';

@Component
export struct FormItemComponent {
  @State showFormName: boolean = true;
  @State isAllowUpdate: boolean = true;
  @State isShow: boolean = true;
  @State isHover: boolean = false;
  formNameHeight: number;
  formNameSize: number;
  nameFontColor: string;
  iconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
  private formItemWidth;
  private formItemHeight;
  private menuInfo;
  private formItem;
  private formId;
  private mFormModel: FormModel;
  private nameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  mPaddingTop: number = StyleConstants.DEFAULT_10;
  getFormId: (id: number) => void;
  clickForm?: Function = null;
  dragStart: Function;

  aboutToAppear(): void  {
    this.mFormModel = FormModel.getInstance();
  }

  @Builder MenuBuilder() {
    Column() {
      AppMenu({
        menuInfoList: this.menuInfo,
      })
    }
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .width(StyleConstants.CONTEXT_MENU_WIDTH)
  }

  build() {
    Column() {
      FormComponent({
        id: this.formItem.cardId,
        name: this.formItem.cardName,
        bundle: this.formItem.bundleName,
        ability: this.formItem.abilityName,
        module: this.formItem.moduleName,
        dimension: this.formItem.cardDimension
      })
        .clip(new Rect({ width: this.formItemWidth, height: this.formItemHeight, radius: 24}))
        .size({ width: this.formItemWidth, height: this.formItemHeight })
        .allowUpdate(this.isAllowUpdate)
        .visibility(this.isShow ? Visibility.Visible : Visibility.None)
        .onAcquired((form) => {
          Log.showInfo(TAG, `FormComponent card id is: ${form.id}`);
          this.formId = form.id;
          if (this.getFormId) {
            this.getFormId(form.id);
          }
        })
        .onClick((event: ClickEvent) => {
          Log.showInfo(TAG, `FormComponent onClick`);
        })
        .onError((error) => {
          Log.showInfo(TAG, `FormComponent error msg: ${error.msg}`);
          this.mFormModel.deleteForm(this.formItem.cardId);
          localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
        })
        .onTouch(event => {
          if (event.type === CommonConstants.TOUCH_TYPE_UP) {
            this.clickForm(event, this.formItem);
          }
        })

      Column() {
        AppName({
          bundleName: this.formItem.bundleName,
          moduleName: this.formItem.moduleName,
          labelId: this.formItem.appLabelId,
          nameHeight: this.formNameHeight,
          nameSize: this.formNameSize,
          nameFontColor: this.nameFontColor,
          appName: this.formItem.appName,
          nameLines: this.nameLines,
          marginTop: this.iconNameMargin
        })
      }
      .visibility(this.showFormName ? Visibility.Visible : Visibility.Hidden)
    }
    .onHover((isHover: boolean) => {
      Log.showInfo(TAG, `Form onHover isHover: ${isHover}`);
      this.isHover = isHover;
    })
    .onDisAppear(() => {
      Log.showInfo(TAG, `formItemComponent onDisAppear: ${this.formId}`);
    })
    .padding({top : this.mPaddingTop})
    .height(StyleConstants.PERCENTAGE_100)
    .width(StyleConstants.PERCENTAGE_100)
    .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
    .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
    .onDragStart((event: DragEvent, extraParams: string) => {
      return this.dragStart(event);
    })
  }
}