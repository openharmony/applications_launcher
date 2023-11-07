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
  UninstallDialog,
} from '@ohos/common/component'
import {
  Log,
  CommonConstants,
  ResourceManager,
  RecentBundleMissionInfo, DockItemInfo,
  MenuInfo } from '@ohos/common';
import RecentLayout from './RecentLayout';
import ResidentLayout from './ResidentLayout';
import SmartDockViewModel from '../viewmodel/SmartDockViewModel';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';

const TAG = 'SmartDock';

interface DockRecentPopup {
  show: boolean;
  showItem: string;
  popup: CustomPopupOptions | null;
}

@Component
export struct SmartDock {
  popup: DockRecentPopup = { show: false, showItem: '', popup: null };
  showAppCenter: Function = () => {};
  @StorageLink('showDock') showDock: boolean = false;
  @StorageLink('recentList') recentList: Array<RecentBundleMissionInfo> = [];
  @StorageLink('missionInfoList') missionInfoList: Array<RecentBundleMissionInfo> = [];
  @StorageLink('desktopEventResponse') desktopEventResponse: boolean = true;
  private deviceType: string = CommonConstants.DEFAULT_DEVICE_TYPE;
  private mSmartDockViewModel?: SmartDockViewModel;
  private mSelectedItem: DockItemInfo | null = null;
  private mSelectedDockType = 0;
  private dialogName = "";

  aboutToAppear(): void  {
    Log.showInfo(TAG, 'aboutToAppear start!');
    this.deviceType = AppStorage.get('deviceType') as string;
    try {
      this.mSmartDockViewModel = SmartDockViewModel.getInstance();
    } catch (error) {
      Log.showError(TAG, `catch error ${JSON.stringify(error)}`);
    }
    ResourceManager.getInstance().getStringByResource(this.deviceType === CommonConstants.PAD_DEVICE_TYPE
      ? $r('app.string.is_delete_form') : $r('app.string.isUninstall')).then((resName) => {
      this.dialogName = resName;
    });
  }

  aboutToDisappear(): void  {
    Log.showInfo(TAG, 'aboutToDisappear!');
    this.mDialogController = null;
  }

  private mDialogController: CustomDialogController | null = new CustomDialogController({
    builder: UninstallDialog({
      cancel: () => {
        this.mDialogController?.close()
      },
      confirm: () => {
        this.onConfirm()
      },
      dialogName: this.dialogName,
      dialogContent: this.mSelectedItem?.appName + ' ?',
    }),
    cancel: () => {
    },
    autoCancel: false,
    customStyle: true
  });

  onConfirm() {
    if (this.mSelectedItem == null || this.mSelectedDockType == null) {
      Log.showDebug(TAG, 'onConfirm click menu item null!');
      return;
    }
    if (this.deviceType === CommonConstants.PAD_DEVICE_TYPE) {
      this.mSmartDockViewModel?.deleteDockItem({
        bundleName: undefined,
        keyName: this.mSelectedItem?.keyName
      }, this.mSelectedDockType);
    } else {
      this.mSmartDockViewModel?.uninstallApp(this.mSelectedItem?.bundleName, this.mSelectedItem?.isUninstallAble);
    }
    this.mDialogController?.close();
  }

  showDialog = () => {
    this.mSelectedItem = this.mSmartDockViewModel?.getSelectedItem();
    this.mSelectedDockType = this.mSmartDockViewModel?.getSelectedDockType();
    this.mDialogController?.open();
  }

  async onHoverEvent(onHover: boolean, bundleName?: string) {
    if (!onHover || !bundleName) {
      this.popup = { show: false, showItem: '', popup: null };
      return;
    }

    let list = this.missionInfoList.filter(it => it.bundleName == bundleName);
    if (list.length <= 0) {
      AppStorage.setOrCreate('snapshotList', []);
      AppStorage.setOrCreate('snapShotWidth', 0);
      this.popup = { show: false, showItem: '', popup: null };
      return;
    }
    this.popup = {
      show: true,
      showItem: bundleName,
      popup: {
        builder: () => {},
        placement: Placement.Top,
        enableArrow: true
      }
    }
    await this.mSmartDockViewModel?.getSnapshot(list[0].missionInfoList, list[0].appName);
  }

  private buildLog(): boolean {
    Log.showDebug(TAG, 'SmartDock buildLog');
    return true;
  }

  build() {
    List({
      space: this.deviceType == CommonConstants.DEFAULT_DEVICE_TYPE || this.recentList.length == 0 ? CommonConstants.DOCK_SPACE :
        (this.mSmartDockViewModel?.getStyleConfig().mDockGap as number)
    }) {
      if (this.buildLog()) {
      }
      ListItem() {
        ResidentLayout({
          mSmartDockStyleConfig: this.mSmartDockViewModel?.getStyleConfig() as SmartDockStyleConfig,
          onItemClick: (event: ClickEvent, item: DockItemInfo) => {
            this.mSmartDockViewModel?.residentOnClick(event, item, this.showAppCenter)
          },
          buildMenu: (item: DockItemInfo): MenuInfo[] => {
            return this.mSmartDockViewModel?.buildMenuInfoList(item, SmartDockConstants.RESIDENT_DOCK_TYPE,
              this.showAppCenter, this.showDialog) as MenuInfo[];
          },
          onDockListChangeFunc: () => {
            this.mSmartDockViewModel?.onDockListChange();
          },
        })
      }

      ListItem() {
        RecentLayout({
          appList: $recentList,
          mSmartDockStyleConfig: this.mSmartDockViewModel?.getStyleConfig() as SmartDockStyleConfig,
          onItemClick: (event: ClickEvent, item: DockItemInfo) => {
            this.mSmartDockViewModel?.recentOnClick(event, item, () => {
              this.recentOnClickWithPopup(item);
            })
          },
          buildMenu: (item: DockItemInfo): MenuInfo[] => {
            return this.mSmartDockViewModel?.buildMenuInfoList(item, SmartDockConstants.RECENT_DOCK_TYPE,
              this.showAppCenter, this.showDialog) as MenuInfo[];
          },
          onDockListChangeFunc: () => {
            this.mSmartDockViewModel?.onDockListChange();
          },
          popup: this.popup,
          onHoverEvent: (onHover: boolean, bundleName: string) => {
            this.onHoverEvent(onHover, bundleName);
          }
        })
      }
    }
    .hitTestBehavior(this.desktopEventResponse ? HitTestMode.Default : HitTestMode.Block)
    .alignListItem(ListItemAlign.Center)
    .height(SmartDockConstants.PERCENTAGE_100)
    .listDirection(Axis[SmartDockConstants.LIST_DIRECTION])
  }

  recentOnClickWithPopup(item: DockItemInfo) {
    this.onHoverEvent(true, item.bundleName);
    AppStorage.setOrCreate('recentShowPopup', true);
  }
}