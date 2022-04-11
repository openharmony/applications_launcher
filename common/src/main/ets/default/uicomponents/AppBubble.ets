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

import StyleConstants from '../constants/StyleConstants';
import AppIcon from './AppIcon.ets';
import AppName from './AppName.ets';
import AppMenu from './AppMenu.ets';
import PresetStyleConstants from '../constants/PresetStyleConstants';
import ResourceManager from '../manager/ResourceManager';
import Log from '../utils/Log';

const TAG = 'AppBubble';

@Component
export default struct AppBubble {
  @Prop bundleName: string;
  @Prop appIconId: string;
  @Prop appLabelId: string;
  @Prop iconSize: number;
  @Prop nameHeight: number;
  @Prop nameSize: number;
  @Prop nameFontColor: string;
  @Prop badgeNumber: number;
  mPaddingTop: number = StyleConstants.DEFAULT_10;
  nameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  mIconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
  private menuInfo;
  isSelect?: boolean;
  appName: string = '';
  useCache: boolean = true;
  shortCutEnabled: boolean = false;

  @Builder MenuBuilder() {
    Flex({ direction: FlexDirection.Column, justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
      AppMenu({
        menuInfoList: this.menuInfo
      })
    }
    .width(StyleConstants.CONTEXT_MENU_WIDTH)
    .borderRadius(StyleConstants.DEFAULT_12)
  }

  build() {
    Column() {
      Column() {
        AppIcon({
          iconSize: this.iconSize,
          appIcon: this.appIconId,
          icon: ResourceManager.getInstance().getCachedAppIcon(this.appIconId, this.bundleName),
          bundleName: this.bundleName,
          badgeNumber: this.badgeNumber,
          useCache: this.useCache
        })
        AppName({
          nameHeight: this.nameHeight,
          nameSize: this.nameSize,
          nameFontColor: this.nameFontColor,
          bundleName: this.bundleName,
          appName: this.appName,
          labelId: this.appLabelId,
          useCache: this.useCache,
          nameLines: this.nameLines,
          marginTop: this.mIconNameMargin
        })
      }
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
          AppStorage.SetOrCreate('selectDesktopAppItem', this.bundleName);
        } else {
          AppStorage.SetOrCreate('selectDesktopAppItem', '');
        }
      })
    )
  }
}