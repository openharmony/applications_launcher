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
import { AppIcon } from './AppIcon';
import { AppName } from './AppName';
import { AppMenu } from './AppMenu';
import { StyleConstants } from '../constants/StyleConstants';
import { ResourceManager } from '../manager/ResourceManager';
import { PresetStyleConstants } from '../constants/PresetStyleConstants';

const TAG = 'AppBubble';

@Component
export struct AppBubble {
  @State bundleName: string = '';
  @State abilityName: string = '';
  @State moduleName: string = '';
  @State appIconId: string = '';
  @State appLabelId: string = '';
  iconSize: number = 0;
  nameHeight: number = 0;
  nameSize: number = 0;
  nameFontColor: string = '';
  badgeNumber: number = 0;
  mPaddingTop: number = StyleConstants.DEFAULT_10;
  nameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  mIconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
  private menuInfo;
  private getMenuInfoList: Function;
  isSelect?: boolean;
  appName: string = '';
  useCache: boolean = true;
  shortCutEnabled: boolean = false;
  dragStart: Function;

  aboutToDisappear(): void {
    this.getMenuInfoList = null;
    this.dragStart = null;
  }

  @Builder MenuBuilder() {
    Column() {
      AppMenu({
        menuInfoList: this.menuInfo,
        getMenuInfoList: this.getMenuInfoList,
        closeMenu: () => {
          AppStorage.SetOrCreate('contextMenuState', false);
        }
      })
    }
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .width(StyleConstants.CONTEXT_MENU_WIDTH)
    .borderRadius(StyleConstants.DEFAULT_12)
  }

  build() {
    Column() {
      Column() {
        AppIcon({
          iconSize: this.iconSize,
          iconId: this.appIconId,
          bundleName: this.bundleName,
          moduleName: this.moduleName,
          icon: ResourceManager.getInstance().getCachedAppIcon(this.appIconId, this.bundleName, this.moduleName),
          badgeNumber: this.badgeNumber,
          useCache: this.useCache
        })
        AppName({
          nameHeight: this.nameHeight,
          nameSize: this.nameSize,
          nameFontColor: this.nameFontColor,
          bundleName: this.bundleName,
          moduleName: this.moduleName,
          appName: this.appName,
          labelId: this.appLabelId,
          useCache: this.useCache,
          nameLines: this.nameLines,
          marginTop: this.mIconNameMargin
        })
      }
      .onDragStart((event: DragEvent, extraParams: string) => {
        return this.dragStart(event);
      })
      .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
      .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
      .width(this.isSelect ? this.iconSize + StyleConstants.DEFAULT_40 : StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
      .backgroundColor(this.isSelect ? StyleConstants.DEFAULT_BROAD_COLOR : StyleConstants.DEFAULT_TRANSPARENT_COLOR)
      .borderRadius(this.isSelect ? StyleConstants.DEFAULT_15 : StyleConstants.DEFAULT_0)
      .padding(this.isSelect ? { left: StyleConstants.DEFAULT_20,
                                 right: StyleConstants.DEFAULT_20, top: this.mPaddingTop } : { top: this.mPaddingTop })
    }
    .parallelGesture(
      LongPressGesture({ repeat: false })
      .onAction((event: GestureEvent) => {
        Log.showInfo(TAG, `long press source ${event.source}`);
        if (event.source == SourceType.Mouse) {
          Log.showDebug(TAG, `Mouse keyName ${this.bundleName + this.abilityName + this.moduleName}`);
          AppStorage.SetOrCreate('selectDesktopAppItem', this.bundleName + this.abilityName + this.moduleName);
        } else {
          AppStorage.SetOrCreate('selectDesktopAppItem', '');
        }
      })
    )
  }
}