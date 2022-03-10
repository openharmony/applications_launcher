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

import SmartDockContent from '../../../../../../../common/src/main/ets/default/uicomponents/SmartDockContent.ets';
import UninstallDialog from '../../../../../../../common/src/main/ets/default/uicomponents/UninstallDialog.ets';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import SmartDockViewModel from '../viewmodel/SmartDockViewModel';

@Component
export default struct SmartDock {
  @State device: string = 'phone';
  @State popup: {
    show: boolean,
    showItem: string,
    popup: PopupOption | CustomPopupOption
  } = { show: false, showItem: '', popup: null };
  showAppCenter: () => void
  @StorageLink('showDock') showDock: boolean = false;
  @StorageLink('residentList') residentList: any = [];
  @StorageLink('recentList') recentList: any = [];
  @StorageLink('missionInfoList') missionInfoList: any = [];
  private mSmartDockViewModel: SmartDockViewModel;
  private mSelectedItem = null;
  private mSelectedDockType = 0;

  private aboutToAppear(): void  {
    console.info("Launcher SmartDock aboutToAppear start!");
    AppStorage.SetOrCreate('dockDevice', this.device);
    this.mSmartDockViewModel = SmartDockViewModel.getInstance();
    this.mSmartDockViewModel.setShowAppCenter(this.showAppCenter);
    console.info("Launcher SmartDock aboutToAppear end!");
  }

  private aboutToDisappear() {
    console.info("Launcher SmartDock aboutToDisappear!");
  }

  private mDialogController: CustomDialogController = new CustomDialogController({
    builder: UninstallDialog({
      cancel: () => {
        this.mDialogController.close()
      },
      confirm: () => {
        this.onConfirm()
      },
      dialogName: this.device === CommonConstants.PAD_DEVICE_TYPE ? $r('app.string.delete_app') : $r('app.string.uninstall'),
      dialogContent: this.mSelectedItem.appName + ' ?',
    }),
    cancel: () => {
    },
    autoCancel: true,
    customStyle: true
  });

  onConfirm() {
    if (this.mSelectedItem == null || this.mSelectedDockType == null) {
      console.info("Launcher click menu item null");
      return;
    }
    if (this.device === CommonConstants.PAD_DEVICE_TYPE) {
      this.mSmartDockViewModel.deleteDockItem(this.mSelectedItem, this.mSelectedDockType);
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
      AppStorage.SetOrCreate("shapshotList", []);
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

  build() {
    List({ space: this.mSmartDockViewModel.getStyleConfig().mDockGap }) {
      ListItem() {
        SmartDockContent({
          dockItemList: $residentList,
          mMaxNum: this.mSmartDockViewModel.getStyleConfig().mMaxDockNum,
          mSmartDockStyleConfig: this.mSmartDockViewModel.getStyleConfig(),
          onItemClick: (event, item) => this.mSmartDockViewModel.residentOnClick(event, item, this.showAppCenter),
          buildMenu: ((item) => this.mSmartDockViewModel.buildMenuInfoList(item, SmartDockConstants.RESIDENT_DOCK_TYPE, this.showDialog.bind(this))).bind(this.mSmartDockViewModel),
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
          buildMenu: ((item) => this.mSmartDockViewModel.buildMenuInfoList(item, SmartDockConstants.RECENT_DOCK_TYPE, this.showDialog.bind(this))).bind(this.mSmartDockViewModel),
          onItemTouch: (event) => {},
          onDockListChangeFunc: () => this.mSmartDockViewModel.onDockListChange(),
          onTouchEventUpdateFunc: () => {},
          popup: this.popup,
          onHoverEvent: (onHover, bundleName) => this.onHoverEvent(onHover, bundleName)
        })
      }
    }
    .height(SmartDockConstants.PERCENTAGE_100)
    .listDirection(SmartDockConstants.LIST_DIRECTION)
  }

  recentOnClickWithPopup(item){
    this.onHoverEvent(true, item.bundleName);
    AppStorage.SetOrCreate('recentShowPopup', true);
  }

}