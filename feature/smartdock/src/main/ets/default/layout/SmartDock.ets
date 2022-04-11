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

import SmartDockContent from '../../../../../../../common/src/main/ets/default/uicomponents/SmartDockContent.ets';
import UninstallDialog from '../../../../../../../common/src/main/ets/default/uicomponents/UninstallDialog.ets';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import ResourceManager from '../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import SmartDockViewModel from '../viewmodel/SmartDockViewModel';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';
import windowManager from '../../../../../../../common/src/main/ets/default/manager/WindowManager';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';

const TAG = 'SmartDock';

@Component
export default struct SmartDock {
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

  private aboutToAppear(): void  {
    Log.showInfo(TAG, 'aboutToAppear start!');
    AppStorage.SetOrCreate('dockDevice', this.device);
    try {
      this.mSmartDockViewModel = SmartDockViewModel.getInstance();
    } catch (error) {
      Log.showError(TAG, `catch error ${JSON.stringify(error)}`);
    }

    Log.showInfo(TAG, 'aboutToAppear end!');
    ResourceManager.getInstance().getStringByResource(this.device === CommonConstants.PAD_DEVICE_TYPE
      ? $r('app.string.delete_app') : $r('app.string.uninstall')).then((resName) => {
      this.dialogName = resName;
    });
  }

  private aboutToDisappear() {
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
      Log.showInfo(TAG, 'onConfirm click menu item null!');
      return;
    }
    if (this.device === CommonConstants.PAD_DEVICE_TYPE) {
      this.mSmartDockViewModel.deleteDockItem(this.mSelectedItem.bundleName, this.mSelectedDockType);
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
    List({ space: this.mSmartDockViewModel.getStyleConfig().mDockGap }) {
      if (this.buildLog()) {
      }
      ListItem() {
        SmartDockContent({
          dockItemList: $residentList,
          mMaxNum: this.mSmartDockViewModel.getStyleConfig()
          .mMaxDockNum,
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