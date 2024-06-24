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
import { LauncherDragItemInfo } from '../bean/LauncherDragItemInfo';
import { CardItemInfo, MenuInfo } from '../bean';

const TAG = 'FormItemComponent';

@Component
export struct FormItemComponent {
  @State showFormName: boolean = true;
  @State isAllowUpdate: boolean = true;
  @State isShow: boolean = true;
  @State isHover: boolean = false;
  formNameHeight: number = 0;
  formNameSize: number = 0;
  nameFontColor: string = '#ffffff';
  iconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
  private formItemWidth: number = 0;
  private formItemHeight: number = 0;
  private menuInfo: MenuInfo[] = [];
  private formItem: CardItemInfo = new CardItemInfo();
  private formId = 0;
  private mFormModel: FormModel = FormModel.getInstance();
  private nameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  mPaddingTop: number = StyleConstants.DEFAULT_10;
  getFormId: (id: number) => void = (id: number) => {};
  clickForm: Function = () => {};
  dragStart: Function = () => {};

  aboutToAppear(): void {
    this.mFormModel = FormModel.getInstance();
    Log.showInfo(TAG, `aboutToAppear begin height: ${this.formItemHeight}, width: ${this.formItemWidth}`);
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, 'aboutToDisappear begin');
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
        id: this.formItem.cardId as number,
        name: this.formItem.cardName as string,
        bundle: this.formItem.bundleName as string,
        ability: this.formItem.abilityName as string,
        module: this.formItem.moduleName as string,
        dimension: this.formItem.cardDimension as number
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
          Log.showInfo(TAG, 'FormComponent onClick');
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
        .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
        .onDragStart((event: DragEvent, extraParams: string) => {
          return this.dragStart(event);
        })
        .onDragEnd((event: DragEvent, extraParams: string) => {
          Log.showInfo(TAG, `onDragEnd event: [${event.getWindowX()}, ${event.getWindowY()}]` + event.getResult());
          AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
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
    .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
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
  }
}