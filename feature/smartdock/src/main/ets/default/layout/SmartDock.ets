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

import { Log } from '@ohos/common';
import { Trace } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { ResourceManager } from '@ohos/common';
import { UninstallDialog } from '@ohos/common';
import { SmartDockContent } from '../layout/SmartDockContent';
import SmartDockViewModel from '../viewmodel/SmartDockViewModel';
import SmartDockConstants from '../common/constants/SmartDockConstants';

const TAG = 'SmartDock';

@Component
export struct SmartDock {
  @State device: string = 'phone';
  @State popup: {
    show: boolean,
    showItem: string,
    popup
  } = { show: false, showItem: '', popup: null };
  showAppCenter = () => {
    Trace.start(Trace.CORE_METHOD_START_APP_CENTER);
    globalThis.createWindowWithName(windowManager.APP_CENTER_WINDOW_NAME, windowManager.DESKTOP_RANK);
  }
  @StorageLink('showDock') showDock: boolean = false;
  @StorageLink('residentList') residentList: any = [];
  @StorageLink('recentList') recentList: any = [];
  @StorageLink('missionInfoList') missionInfoList: any = [];
  private mSmartDockViewModel: SmartDockViewModel;
  private mSelectedItem = null;
  private mSelectedDockType = 0;
  private dialogName = "";

  aboutToAppear(): void  {
    Log.showInfo(TAG, 'aboutToAppear start!');
    AppStorage.SetOrCreate('device', this.device);
    try {
      this.mSmartDockViewModel = SmartDockViewModel.getInstance();
    } catch (error) {
      Log.showError(TAG, `catch error ${JSON.stringify(error)}`);
    }

    Log.showInfo(TAG, 'aboutToAppear end!');
    ResourceManager.getInstance().getStringByResource(this.device === CommonConstants.PAD_DEVICE_TYPE
      ? $r('app.string.is_delete_form') : $r('app.string.isUninstall')).then((resName) => {
      this.dialogName = resName;
    });
  }

  aboutToDisappear(): void  {
    Log.showInfo(TAG, 'aboutToDisappear!');
  }

  private mDialogController: CustomDialogController = new CustomDialogController({
    builder: UninstallDialog({
      cancel: () => {
        this.mDialogController.close()
      },
      confirm: () => {
        this.onConfirm()
      },
      dialogName: this.dialogName,
      dialogContent: this.mSelectedItem.appName + ' ?',
    }),
    cancel: () => {
    },
    autoCancel: true,
    customStyle: true
  });

  onConfirm() {
    if (this.mSelectedItem == null || this.mSelectedDockType == null) {
      Log.showDebug(TAG, 'onConfirm click menu item null!');
      return;
    }
    if (this.device === CommonConstants.PAD_DEVICE_TYPE) {
      this.mSmartDockViewModel.deleteDockItem({
        bundleName: undefined,
        keyName: this.mSelectedItem.keyName
      }, this.mSelectedDockType);
    } else {
      this.mSmartDockViewModel.uninstallApp(this.mSelectedItem.bundleName, this.mSelectedItem.bundleName.isUninstallAble);
    }
    this.mDialogController.close();
  }

  showDialog() {
    this.mSelectedItem = this.mSmartDockViewModel.getSelectedItem();
    this.mSelectedDockType = this.mSmartDockViewModel.getSelectedDockType();
    this.mDialogController.open();
  }

  async onHoverEvent(onHover, bundleName) {
    if (!onHover) {
      this.popup = { show: false, showItem: '', popup: null };
      return;
    }

    let list = this.missionInfoList.filter(it => it.bundleName == bundleName);
    if (list.length <= 0) {
      AppStorage.SetOrCreate('snapshotList', []);
      AppStorage.SetOrCreate('snapShotWidth', 0);
      this.popup = { show: false, showItem: '', popup: null };
      return;
    }
    this.popup = {
      show: true,
      showItem: bundleName,
      popup: {
        builder: null,
        placement: Placement.Top,
        enableArrow: true
      }
    }
    let dataList = await this.mSmartDockViewModel.getSnapshot(list[0].missionInfoList, list[0].appName);
  }

  private buildLog(): boolean {
    Log.showInfo(TAG, 'SmartDock buildLog');
    return true;
  }

  build() {
    List({
      space: this.device == CommonConstants.DEFAULT_DEVICE_TYPE ? CommonConstants.DOCK_SPACE :
        this.mSmartDockViewModel.getStyleConfig().mDockGap
    }) {
      if (this.buildLog()) {
      }
      ListItem() {
        SmartDockContent({
          dockItemList: $residentList,
          mMaxNum: this.mSmartDockViewModel.getStyleConfig().mMaxDockNum,
          mSmartDockStyleConfig: this.mSmartDockViewModel.getStyleConfig(),
          onItemClick: (event, item) => this.mSmartDockViewModel.residentOnClick(event, item, this.showAppCenter),
          buildMenu: ((item) => this.mSmartDockViewModel.buildMenuInfoList(item, SmartDockConstants.RESIDENT_DOCK_TYPE, this.showAppCenter, this.showDialog.bind(this))).bind(this.mSmartDockViewModel),
          onItemTouch: (event) => this.mSmartDockViewModel.residentOnTouch(event),
          onDockListChangeFunc: () => this.mSmartDockViewModel.onDockListChange(),
          onTouchEventUpdateFunc: () => this.mSmartDockViewModel.onTouchEventUpdate()
        })
      }

      ListItem() {
        SmartDockContent({
          dockItemList: $recentList,
          mMaxNum: this.mSmartDockViewModel.getStyleConfig().mMaxRecentNum,
          mSmartDockStyleConfig: this.mSmartDockViewModel.getStyleConfig(),
          onItemClick: (event, item) => this.mSmartDockViewModel.recentOnClick(event, item, () => this.recentOnClickWithPopup(item)),
          buildMenu: ((item) => this.mSmartDockViewModel.buildMenuInfoList(item, SmartDockConstants.RECENT_DOCK_TYPE, this.showAppCenter, this.showDialog.bind(this))).bind(this.mSmartDockViewModel),
          onItemTouch: (event) => {
          },
          onDockListChangeFunc: () => this.mSmartDockViewModel.onDockListChange(),
          onTouchEventUpdateFunc: () => {
          },
          popup: this.popup,
          onHoverEvent: (onHover, bundleName) => this.onHoverEvent(onHover, bundleName)
        })
      }
    }
    .height(SmartDockConstants.PERCENTAGE_100)
    .listDirection(SmartDockConstants.LIST_DIRECTION)
  }

  recentOnClickWithPopup(item) {
    this.onHoverEvent(true, item.bundleName);
    AppStorage.SetOrCreate('recentShowPopup', true);
  }
}