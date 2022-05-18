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

import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import AppCenterListStyleConfig from '../common/AppCenterListStyleConfig';
import AppListPresenter from '../common/presenter/AppListPresenter';
import FeatureConstants from '../common/constants/FeatureConstants';
import AppList from '../../../../../../../common/src/main/ets/default/uicomponents/AppList.ets';
import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import ResourceManager from '../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import UninstallDialog from '../../../../../../../common/src/main/ets/default/uicomponents/UninstallDialog.ets';

let mAppListPresenter: AppListPresenter;

@Component
export default struct ListLayout {
  @StorageLink('listInfo') appListInfo: [] = [];
  @StorageLink('uninstallAppInfo') appInfo: any = {};
  dialogName: string = "";

  mAppCenterListStyleConfig: AppCenterListStyleConfig = null;

  private aboutToAppear(): void  {
    mAppListPresenter = AppListPresenter.getInstance();
    mAppListPresenter.getAppList();
    mAppListPresenter.registerAppListChangeCallback();
    this.mAppCenterListStyleConfig = LayoutConfigManager.getStyleConfig(AppCenterListStyleConfig.APP_LIST_STYLE_CONFIG, FeatureConstants.FEATURE_NAME);
    ResourceManager.getInstance().getStringByResource($r('app.string.uninstall')).then((resName) => {
      this.dialogName = resName;
    });
  }

  dialogController: CustomDialogController = new CustomDialogController({
    builder: ShowDialog({ action: this.openUninstallDialog }),
    cancel: this.cancelDialog,
    autoCancel: true,
    customStyle: true
  });
  uninstallDialogController: CustomDialogController = new CustomDialogController({
    builder: UninstallDialog({
      cancel: () => {},
      confirm: () => {
        mAppListPresenter.uninstallApp(this.appInfo.bundleName, this.appInfo.isUninstallAble);
      },
      dialogName: this.dialogName,
      dialogContent: this.appInfo.appName + ' ?',
    }),
    cancel: this.cancelDialog,
    autoCancel: true,
    customStyle: true
  });

  openUninstallDialog() {
    this.dialogController.close();
    this.uninstallDialogController.open();
  }

  cancelDialog() {
    console.info('Launcher Grid Cancel Dialog');
  }

  build() {
    Column() {
      AppList({
        appList: $appListInfo,
        appListStyleConfig: this.mAppCenterListStyleConfig,
        onItemClick: (event, item) => {
          mAppListPresenter.openApplication(item.abilityName, item.bundleName);
        },
        onItemLongPress: (event, item) => {
          AppStorage.SetOrCreate('uninstallAppInfo', item);
          this.dialogController.open();
        }
      })
    }
  }
}

@CustomDialog
struct ShowDialog {
  @StorageLink('uninstallAppInfo') appInfo: any = {};
  controller: CustomDialogController;
  cancel: () => void;
  action: () => void;

  build() {
    Column() {
      Text($r('app.string.launcher_edit'))
        .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
        .fontColor(StyleConstants.TEXT_COLOR_PRIMARY)
        .margin({top : StyleConstants.DEFAULT_DIALOG_RADIUS, bottom: StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN})

      Flex({justifyContent: FlexAlign.SpaceEvenly}) {
        Button() {
          Text($r('app.string.into_settings'))
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.BUTTON_FONT_COLOR)
        }
        .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
        .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        .width(StyleConstants.DEFAULT_BUTTON_WIDTH)
        .onClick(() => {
          mAppListPresenter.intoSetting();
          this.controller.close();
        })

        Divider()
          .vertical(true)
          .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
          .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)

        Button() {
          Text($r('app.string.uninstall'))
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.DEFAULT_COLOR_ERROR)
        }
        .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
        .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        .width(StyleConstants.DEFAULT_BUTTON_WIDTH)
        .onClick(() => {
          mAppListPresenter.uninstallApp(this.appInfo.bundleName, this.appInfo.isUninstallAble);
          this.controller.close();
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
    .width(StyleConstants.DEFAULT_DIALOG_WIDTH)
  }
}