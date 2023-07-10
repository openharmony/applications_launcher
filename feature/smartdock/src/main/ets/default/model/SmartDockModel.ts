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

import Prompt from '@ohos.promptAction';
import missionManager from '@ohos.app.ability.missionManager';
import { CloseAppManager, windowManager } from '@ohos/common';
import { Log } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { StyleConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { AppModel } from '@ohos/common';
import { AppItemInfo } from '@ohos/common';
import { DockItemInfo } from '@ohos/common';
import { MissionInfo } from '@ohos/common';
import { RecentBundleMissionInfo } from '@ohos/common';
import { ResourceManager } from '@ohos/common';
import { amsMissionManager } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { launcherAbilityManager } from '@ohos/common';
import SmartDockCloseAppHandler from '../common/SmartDockCloseAppHandler';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';
import { SmartDockLayoutConfig } from '../config/SmartDockLayoutConfig';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import { RecentMissionInfo } from '@ohos/common';

const TAG = 'SmartDockModel';
const KEY_NAME = 'name';

/**
 * SmartDock Model
 */
export default class SmartDockModel {
  private readonly mSmartDockLayoutConfig: SmartDockLayoutConfig;
  private readonly mSmartDockCloseAppHandler: SmartDockCloseAppHandler;
  private readonly mSmartDockStyleConfig: SmartDockStyleConfig;
  private mResidentList: DockItemInfo[] = new Array<DockItemInfo>();
  private mRecentDataList: RecentBundleMissionInfo[] = new Array<RecentBundleMissionInfo>();
  private readonly mCloseAppManager: CloseAppManager;
  private readonly mDevice = CommonConstants.DEFAULT_DEVICE_TYPE;
  private readonly mResourceManager: ResourceManager;
  protected mAppModel: AppModel;

  private constructor() {
    this.mSmartDockLayoutConfig = layoutConfigManager.getFunctionConfig(SmartDockLayoutConfig.SMART_DOCK_LAYOUT_INFO);
    this.mSmartDockStyleConfig = layoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG, SmartDockConstants.FEATURE_NAME);
    this.mCloseAppManager = CloseAppManager.getInstance();
    this.mSmartDockCloseAppHandler = new SmartDockCloseAppHandler();
    this.mCloseAppManager.registerCloseAppHandler(this.mSmartDockCloseAppHandler);
    this.mAppModel = AppModel.getInstance();
    this.mResourceManager = ResourceManager.getInstance();
    this.registerDockListener();
    this.mDevice = AppStorage.Get('deviceType');
    Log.showDebug(TAG, `dockDevice: ${this.mDevice}`);
    this.getResidentList().then(() => {}, () => {});
    if (this.mDevice === CommonConstants.PAD_DEVICE_TYPE) {
      this.getRecentDataList().then(() => {}, () => {});
    }
    this.registerMissionListener();
    Log.showInfo(TAG, 'constructor!');
  }

  static getInstance(): SmartDockModel {
    if (globalThis.SmartDockModel == null) {
      globalThis.SmartDockModel = new SmartDockModel();
      Log.showInfo(TAG, 'getInstance!');
    }
    return globalThis.SmartDockModel;
  }

  /**
   * get resident dock list
   */
  async getResidentList(): Promise<void> {
    let residentList = new Array<DockItemInfo>();

    // query rdb data
    let rdbResidentList: DockItemInfo[] = [];
    rdbResidentList = await globalThis.RdbStoreManagerInstance.querySmartDock();

    if (CheckEmptyUtils.isEmptyArr(rdbResidentList)) {
      // init preset dock data
      const dockDataList = this.mSmartDockLayoutConfig.getDockLayoutInfo();
      Log.showDebug(TAG, `getResidentList from config length: ${dockDataList.length}`);
      for (let i = 0; i < dockDataList.length; i++) {
        if (dockDataList[i].itemType == CommonConstants.TYPE_APP) {
          Log.showDebug(TAG, `getResidentList dockDataList[i].bundleName: ${dockDataList[i].bundleName}`);
          const appData = await launcherAbilityManager.getAppInfoByBundleName(dockDataList[i].bundleName);
          if (appData == undefined) {
            continue;
          }
          const dockItemInfo = new DockItemInfo();
          dockItemInfo.itemType = dockDataList[i].itemType;
          dockItemInfo.editable = dockDataList[i].editable;
          dockItemInfo.appName = typeof (appData) === 'undefined' ? dockDataList[i].appName : appData.appName;
          dockItemInfo.bundleName = typeof (appData) === 'undefined' ? dockDataList[i].bundleName : appData.bundleName;
          dockItemInfo.moduleName = typeof (appData) === 'undefined' ? dockDataList[i].bundleName : appData.moduleName;
          dockItemInfo.abilityName = typeof (appData) === 'undefined' ? dockItemInfo.abilityName : appData.abilityName;
          dockItemInfo.keyName = `${dockItemInfo.bundleName}${dockItemInfo.abilityName}${dockItemInfo.moduleName}`;
          dockItemInfo.appIconId = typeof (appData) === 'undefined' ? dockItemInfo.appIconId : appData.appIconId;
          dockItemInfo.appLabelId = typeof (appData) === 'undefined' ? dockItemInfo.appLabelId : appData.appLabelId;
          dockItemInfo.isSystemApp = typeof (appData) === 'undefined' ? dockItemInfo.isSystemApp : appData.isSystemApp;
          dockItemInfo.isUninstallAble = typeof (appData) === 'undefined' ? dockItemInfo.isUninstallAble : appData.isUninstallAble;
          dockItemInfo.installTime = typeof (appData) === 'undefined' ? dockItemInfo.installTime : appData.installTime;
          residentList.push(dockItemInfo);
        } else if (dockDataList[i].itemType == CommonConstants.TYPE_CARD) {
        } else {
          const dockItemInfo = new DockItemInfo();
          dockItemInfo.itemType = dockDataList[i].itemType;
          dockItemInfo.editable = dockDataList[i].editable;
          dockItemInfo.bundleName = dockDataList[i].bundleName;
          dockItemInfo.abilityName = dockDataList[i].abilityName;
          dockItemInfo.moduleName = dockDataList[i].moduleName;
          dockItemInfo.keyName = `${dockItemInfo.bundleName}${dockItemInfo.abilityName}${dockItemInfo.moduleName}`;
          dockItemInfo.appIconId = typeof (dockDataList[i].appIconId) != 'undefined' ? dockDataList[i].appIconId : dockDataList[i].iconId.id;
          dockItemInfo.appLabelId = typeof (dockDataList[i].appLabelId) != 'undefined' ? dockDataList[i].appLabelId : dockDataList[i].labelId.id;
          dockItemInfo.isSystemApp = typeof (dockDataList[i].isSystemApp) === 'undefined' ? true : dockDataList[i].isSystemApp;
          dockItemInfo.isUninstallAble = typeof (dockDataList[i].isUninstallAble) === 'undefined' ? true : dockDataList[i].isUninstallAble;
          const loadAppName = await this.mResourceManager
            .getAppNameSync(dockItemInfo.appLabelId, dockItemInfo.bundleName, dockItemInfo.moduleName, '');
          dockItemInfo.appName = loadAppName;
          residentList.push(dockItemInfo);
        }
      }

      // update persistent data
      globalThis.RdbStoreManagerInstance.insertIntoSmartdock(residentList);
      this.mSmartDockLayoutConfig.updateDockLayoutInfo(residentList);
    } else {
      residentList = rdbResidentList;
      Log.showDebug(TAG, 'getResidentList from rdb!');
    }

    // trigger component update
    AppStorage.SetOrCreate('residentList', residentList);
    if (this.mDevice) {
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_SMARTDOCK_INIT_FINISHED, residentList);
    }
    Log.showDebug(TAG, `getResidentList end residentList.length: ${residentList.length}`);
  }

  /**
   * get recent dock list
   */
  async getRecentDataList(): Promise<void> {
    Log.showDebug(TAG, 'getRecentDataList start!');
    if (this.mDevice === CommonConstants.DEFAULT_DEVICE_TYPE) {
      return;
    }
    const recentList = await amsMissionManager.getRecentBundleMissionsList();
    if (CheckEmptyUtils.isEmptyArr(recentList)) {
      Log.showDebug(TAG, 'getRecentDataList empty');
      AppStorage.SetOrCreate('recentList', recentList);
      return;
    }
    let recents: RecentBundleMissionInfo[] = [];
    let missionInfos: {
      appName: string,
      bundleName: string,
      missionInfoList: MissionInfo[]
    }[] = [];
    recentList.forEach(item => {
      missionInfos.push({
        appName: item.appName,
        bundleName: item.bundleName,
        missionInfoList: item.missionInfoList
      });
      item.missionInfoList = [];
      recents.push(item);
    });
    if (recents.length > this.mSmartDockStyleConfig.mMaxRecentNum) {
      recents = recents.slice(0, this.mSmartDockStyleConfig.mMaxRecentNum);
    }
    AppStorage.SetOrCreate('recentList', recents);

    missionInfos = missionInfos.slice(0,20);

    AppStorage.SetOrCreate('missionInfoList', missionInfos);
    Log.showDebug(TAG, `getRecentDataList end, recentList.length: ${recents.length}`);
  }

  /**
   * delete app from smartdock
   * @param dockItem
   * @param dockType
   */
  deleteDockItem(dockItem: {bundleName: string | undefined, keyName: string | undefined}, dockType: number): boolean {
    if (SmartDockConstants.RESIDENT_DOCK_TYPE === dockType) {
      return this.deleteResistDockItem(dockItem);
    }
    else if (SmartDockConstants.RECENT_DOCK_TYPE === dockType) {
      return this.deleteRecentDockItem(dockItem);
    }
  }

  /**
   * add appItem to smartdock
   *
   * @param appInfo
   * @param index
   */
  addToSmartdock(appInfo: AppItemInfo, index?: number): boolean {
    if (appInfo.typeId != CommonConstants.TYPE_APP) {
      return false;
    }
    this.mResidentList = AppStorage.Get('residentList');
    const dockItemCount = this.mResidentList.length;
    if (this.checkDockNum(dockItemCount)) {
      return false;
    }
    const flag = this.idDuplicate(this.mResidentList, appInfo);
    if (flag) {
      const dockItemInfo = new DockItemInfo();
      dockItemInfo.itemType = CommonConstants.TYPE_APP;
      dockItemInfo.editable = true;
      dockItemInfo.appId = appInfo.appId;
      dockItemInfo.appName = appInfo.appName;
      dockItemInfo.bundleName = appInfo.bundleName;
      dockItemInfo.abilityName = appInfo.abilityName;
      dockItemInfo.moduleName = appInfo.moduleName;
      dockItemInfo.keyName = appInfo.keyName;
      dockItemInfo.appIconId = appInfo.appIconId;
      dockItemInfo.appLabelId = appInfo.appLabelId;
      dockItemInfo.isSystemApp = appInfo.isSystemApp;
      dockItemInfo.isUninstallAble = appInfo.isUninstallAble;
      if (dockItemCount == 0 || index == undefined || index >= dockItemCount || index < 0) {
        this.mResidentList.push(dockItemInfo);
      } else {
        this.mResidentList.splice(index, 0, dockItemInfo);
      }
      AppStorage.SetOrCreate('residentList', this.mResidentList);
      globalThis.RdbStoreManagerInstance.insertIntoSmartdock(this.mResidentList);
      Log.showDebug(TAG, `addToSmartdock appInfo: ${appInfo.keyName}`);
      return true;
    }
    return false;
  }

  /**
   * check docklist over max num or not
   * @param dockItemCount
   * @return true: over max
   * @return false: editable
   */
  private checkDockNum(dockItemCount: number): boolean {
    if (dockItemCount >= this.mSmartDockStyleConfig.mMaxDockNum) {
      Prompt.showToast({
        message: $r('app.string.no_space_for_add')
      });
      return true;
    }
    return false;
  }

  /**
   * check app exist in list
   * @param list
   * @param appInfo
   * @return true: not exit, editable
   * @return false: exited
   */
  private idDuplicate(list: AppItemInfo[], appInfo: AppItemInfo): boolean {
    for (let i = 0; i < list.length; i++) {
      if (list[i].keyName === appInfo.keyName) {
        Prompt.showToast({
          message: $r('app.string.duplicate_add')
        });
        return false;
      }
    }
    return true;
  }

  /**
   * send requset to add appItem to pageDesktop
   * @param appInfo
   */
  addToPageDesk(appInfo: DockItemInfo): void {
    if (appInfo.itemType == CommonConstants.TYPE_APP) {
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD, appInfo).then(()=>{}, ()=>{});
    } else {
      Prompt.showToast({
        message: $r('app.string.disable_add_to_dock')
      });
    }
  }

  /**
   * move appItem from itemIndex to insertIndex
   * @param insertIndex
   * @param itemIndex
   */
  insertItemToIndex(insertIndex: number, itemIndex: number): void {
    Log.showInfo(TAG, `insertItemToIndex insertIndex: ${insertIndex}, itemIndex: ${itemIndex}`);
    if ((insertIndex == 0 || insertIndex == 1 || itemIndex == 0 || itemIndex == 1) && this.mDevice === CommonConstants.PAD_DEVICE_TYPE) {
      Prompt.showToast({
        message: $r('app.string.disable_to_move')
      });
      return;
    }
    this.mResidentList = AppStorage.Get('residentList');
    if (itemIndex < insertIndex) {
      const selectItem = this.mResidentList[itemIndex];
      this.mResidentList.splice(insertIndex, 0, selectItem);
      this.mResidentList.splice(itemIndex, 1);
    }
    if (itemIndex > insertIndex) {
      const selectItem = this.mResidentList[itemIndex];
      this.mResidentList.splice(itemIndex, 1);
      this.mResidentList.splice(insertIndex, 0, selectItem);
    }
    AppStorage.SetOrCreate('residentList', this.mResidentList);
    globalThis.RdbStoreManagerInstance.insertIntoSmartdock(this.mResidentList);
  }

  /**
   * register residentList dock ADD ITEM Listener
   * local listener for model to model send and receive msg
   */
  registerDockListener(): void {
    localEventManager.registerEventListener(this.mAddToDockListener, [
      EventConstants.EVENT_REQUEST_DOCK_ITEM_ADD,
      EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE,
      EventConstants.EVENT_REQUEST_RECENT_DOCK_ITEM_DELETE,
      EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_UPDATE,
      EventConstants.EVENT_BADGE_UPDATE
    ]);
    Log.showDebug(TAG, 'local listener on create');
  }

  /**
   * unregister residentList dock ADD ITEM Listener
   */
  unregisterDockListener(): void {
    localEventManager.unregisterEventListener(this.mAddToDockListener);
    Log.showDebug(TAG, 'local listener on destroy');
  }

  /**
   * resident local Listener
   */
  private readonly mAddToDockListener = {
    onReceiveEvent: (event: string, params: any) => {
      Log.showDebug(TAG, `receive event: ${event}, params: ${JSON.stringify(params)}`);
      if (event === EventConstants.EVENT_REQUEST_DOCK_ITEM_ADD) {
        this.addToSmartdock(params);
      } else if (event === EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE) {
        this.deleteDockItem(params, SmartDockConstants.RESIDENT_DOCK_TYPE);
      } else if (event === EventConstants.EVENT_REQUEST_RECENT_DOCK_ITEM_DELETE) {
        this.deleteDockItem(params, SmartDockConstants.RECENT_DOCK_TYPE);
      } else if (event === EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_UPDATE) {
        this.updateResistDockItem(params);
      } else if (event === EventConstants.EVENT_BADGE_UPDATE) {
        this.updateBadgeNum(params);
      }
    }
  };

  private updateBadgeNum(badgeInfo) {
    Log.showInfo(TAG, `updateBadgeNum badgeInfo is ${JSON.stringify(badgeInfo)}`);
    let residentListTemp: DockItemInfo[] = AppStorage.Get('residentList');
    if (!CheckEmptyUtils.isEmptyArr(residentListTemp)) {
      for (var i = 0; i < residentListTemp.length; i++) {
        if (badgeInfo.bundleName === residentListTemp[i].bundleName) {
          let dockItemInfo = new DockItemInfo();
          dockItemInfo.itemType = CommonConstants.TYPE_APP;
          dockItemInfo.editable = true;
          dockItemInfo.appId = residentListTemp[i].appId;
          dockItemInfo.appName = residentListTemp[i].appName;
          dockItemInfo.bundleName = residentListTemp[i].bundleName;
          dockItemInfo.abilityName = residentListTemp[i].abilityName;
          dockItemInfo.moduleName = residentListTemp[i].moduleName;
          dockItemInfo.keyName = residentListTemp[i].keyName;
          dockItemInfo.appIconId = residentListTemp[i].appIconId;
          dockItemInfo.appLabelId = residentListTemp[i].appLabelId;
          dockItemInfo.installTime = residentListTemp[i].installTime;
          dockItemInfo.isSystemApp = residentListTemp[i].isSystemApp;
          dockItemInfo.isUninstallAble = residentListTemp[i].isUninstallAble;
          dockItemInfo.badgeNumber = badgeInfo.badgeNumber;
          residentListTemp[i] = dockItemInfo;
          Log.showDebug(TAG, `updateBadgeNum dockItemInfo is ${JSON.stringify(dockItemInfo)}`);
          AppStorage.SetOrCreate('residentList', residentListTemp);
        }
      }
    }

    if (this.mDevice === CommonConstants.PAD_DEVICE_TYPE) {
      this.mRecentDataList = AppStorage.Get('recentList');
      Log.showDebug(TAG, `updateBadgeNum recent `);
      if (!CheckEmptyUtils.isEmptyArr(this.mRecentDataList)) {
        for (var i = 0; i < this.mRecentDataList.length; i++) {
          let curRecentData: RecentBundleMissionInfo = this.mRecentDataList[i];
          Log.showDebug(TAG, `updateBadgeNum curRecentData is ${JSON.stringify(curRecentData)}`);
          if (curRecentData.bundleName === badgeInfo.bundleName) {
            let recentBundleMission: RecentBundleMissionInfo = new RecentBundleMissionInfo();
            recentBundleMission.appId = curRecentData.appId;
            recentBundleMission.appName = curRecentData.appName;
            recentBundleMission.bundleName = curRecentData.bundleName;
            recentBundleMission.abilityName = curRecentData.abilityName;
            recentBundleMission.moduleName = curRecentData.moduleName;
            recentBundleMission.keyName = curRecentData.keyName;
            recentBundleMission.appIconId = curRecentData.appIconId;
            recentBundleMission.appLabelId = curRecentData.appLabelId;
            recentBundleMission.installTime = curRecentData.installTime;
            recentBundleMission.isSystemApp = curRecentData.isSystemApp;
            recentBundleMission.isUninstallAble = curRecentData.isUninstallAble;
            recentBundleMission.badgeNumber = badgeInfo.badgeNumber;
            this.mRecentDataList[i] = recentBundleMission;
            Log.showDebug(TAG, `updateBadgeNum dockItemInfo is ${JSON.stringify(recentBundleMission)}`);
            AppStorage.SetOrCreate('recentList', this.mRecentDataList);
          }
        }
      }
    }
  }

  private registerMissionListener(): void {
    Log.showDebug(TAG, 'registerMissionListener');
    const listener: missionManager.MissionListener = {
      onMissionCreated: this.onMissionCreatedCallback.bind(this),
      onMissionDestroyed: this.onMissionDestroyedCallback.bind(this),
      onMissionSnapshotChanged: this.onMissionSnapshotChangedCallback.bind(this),
      onMissionMovedToFront: this.onMissionMovedToFrontCallback.bind(this),
      onMissionIconUpdated: this.onMissionIconUpdatedCallback.bind(this),
      onMissionClosed: this.onMissionClosedCallback.bind(this),
      onMissionLabelUpdated: this.onMissionLabelUpdatedCallback.bind(this)
    };
    missionManager.on('mission', listener);
  }

  /**
   * get recent view list
   */
  async getRecentViewDataList(missionId: number): Promise<void> {
    let mRecentMissionsList = await amsMissionManager.getRecentMissionsList();
    Log.showDebug(TAG, `getRecentMissionsList length: ${mRecentMissionsList.length}`);
    const snapShotTime = new Date().toString();

    let recentMissionInfoIndex = mRecentMissionsList.findIndex(item => {
      return item.missionId === missionId;
    })
    if (recentMissionInfoIndex != -1) {
      let recentMissionInfo: RecentMissionInfo = {
        missionId: mRecentMissionsList[recentMissionInfoIndex].missionId,
        appIconId: mRecentMissionsList[recentMissionInfoIndex].appIconId,
        appLabelId: mRecentMissionsList[recentMissionInfoIndex].appLabelId,
        appName: mRecentMissionsList[recentMissionInfoIndex].appName,
        bundleName: mRecentMissionsList[recentMissionInfoIndex].bundleName,
        moduleName: mRecentMissionsList[recentMissionInfoIndex].moduleName,
        abilityName: mRecentMissionsList[recentMissionInfoIndex].abilityName,
        lockedState: mRecentMissionsList[recentMissionInfoIndex].lockedState,
        snapShotTime: snapShotTime
      }
      mRecentMissionsList[recentMissionInfoIndex] = recentMissionInfo;
    }
    if (globalThis.recentMode && windowManager.isSplitWindowMode(globalThis.recentMode)) {
      mRecentMissionsList.forEach((item, index) => {
        if (item.missionId == globalThis.splitMissionId) {
          mRecentMissionsList.splice(index, 1);
          return;
        }
      });
    }
    AppStorage.SetOrCreate('recentMissionsList', mRecentMissionsList);
  }

  onMissionCreatedCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionCreatedCallback, missionId=' + missionId);
  }

  onMissionDestroyedCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionDestroyedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, ( )=> {});
    this.getRecentViewDataList(missionId).then(() => {}, () => {});
  }

  onMissionSnapshotChangedCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionSnapshotChangedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => {});
    this.getRecentViewDataList(missionId).then(() => {}, () => {});
  }

  onMissionMovedToFrontCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionMovedToFrontCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => { });
    this.getRecentViewDataList(missionId).then(() => {}, () => {});
  }

  onMissionIconUpdatedCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionIconUpdatedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => {});
    this.getRecentViewDataList(missionId).then(() => {}, () => {});
  }

  onMissionClosedCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionClosedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => { });
    this.getRecentViewDataList(missionId).then(() => {}, () => {});
  }

  onMissionLabelUpdatedCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionLabelUpdatedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => {});
    this.getRecentViewDataList(missionId).then(() => {}, () => {});
  }

  /**
   * get ShortcutInfo by bundleName
   * @param bundleName
   */
  getShortcutInfo(bundleName: string): any {
    return this.mAppModel.getShortcutInfo(bundleName);
  }

  /**
   * @param cacheKey
   *
   * @return cache
   */
  getAppName(cacheKey: string): string {
    return this.mResourceManager.getAppResourceCache(cacheKey, KEY_NAME);
  }

  async getSnapshot(missionIds: MissionInfo[], name: string): Promise<any> {
    const snapshotList: {
      name: string,
      image: any,
      missionId: number,
      boxSize: number,
      bundleName: string,
      left?: number,
      right?: number,
    }[] = [];
    if(this.mDevice === CommonConstants.PAD_DEVICE_TYPE){
      let snapShotWidth = 0;
      for (const item of missionIds) {
        let pixelMap: {
          name: string,
          image: any,
          missionId: number,
          boxSize: number,
          bundleName: string,
          left?: number,
          right?: number,
        } = {
          name: '',
          left: StyleConstants.DEFAULT_12,
          missionId: -1,
          image: $r('app.media.icon'),
          boxSize: StyleConstants.DEFAULT_SMART_DOCK_MISSION_IMAGE_HEIGHT,
          bundleName: ''
        };
        const snapshotMap = await missionManager.getMissionSnapShot('', item.missionId);
        pixelMap.image = snapshotMap.snapshot;
        pixelMap.missionId = item.missionId;
        pixelMap.bundleName = snapshotMap.ability.bundleName;
        const imageInfo = await snapshotMap.snapshot.getImageInfo();
        pixelMap.boxSize = Math.ceil(StyleConstants.DEFAULT_SMART_DOCK_MISSION_IMAGE_HEIGHT / imageInfo.size.height * imageInfo.size.width);
        pixelMap.name = name;
        pixelMap.left = StyleConstants.DEFAULT_12;
        snapshotList.push(pixelMap);
        snapShotWidth += pixelMap.boxSize + pixelMap.left;
      }
      AppStorage.SetOrCreate('snapshotList', snapshotList);
      AppStorage.SetOrCreate('snapShotWidth', snapShotWidth);
    }
    Log.showDebug(TAG, 'getSnapshot update snapshotList');
    return snapshotList;
  }

  private deleteResistDockItem(dockItem: {bundleName: string | undefined, keyName: string | undefined}): boolean {
    this.mResidentList = AppStorage.Get('residentList');
    Log.showError(TAG, `deleteResistDockItem residentList length ${this.mResidentList.length}`);
    if (!CheckEmptyUtils.isEmptyArr(this.mResidentList)) {
      const findResidentList = this.mResidentList.find(item => {
        return dockItem.bundleName == item.bundleName || dockItem.keyName == item.keyName;
      })
      // check right to delete
      if (!findResidentList.editable) {
        Prompt.showToast({
          message: $r('app.string.disable_add_to_delete')
        });
        return false;
      }
      this.mResidentList = this.mResidentList.filter(item => {
        if (dockItem.bundleName) {
          return dockItem.bundleName != item.bundleName;
        } else if (dockItem.keyName) {
          return dockItem.keyName != item.keyName;
        }
      })
      AppStorage.SetOrCreate('residentList', this.mResidentList);
      globalThis.RdbStoreManagerInstance.insertIntoSmartdock(this.mResidentList);
      Log.showDebug(TAG, `deleteResistDockItem resist dockItem: ${JSON.stringify(dockItem)}`);
    }
    return true;
  }

  private deleteRecentDockItem(dockItem: {bundleName: string | undefined, keyName: string | undefined}): boolean {
    let res = false;
    this.mRecentDataList = AppStorage.Get('recentList');
    Log.showDebug(TAG, `deleteRecentDockItem recent dockItem: ${JSON.stringify(dockItem)}`);
    if (!CheckEmptyUtils.isEmptyArr(this.mRecentDataList)) {
      this.mRecentDataList = this.mRecentDataList.filter(item => {
        if (dockItem.bundleName) {
          return dockItem.bundleName != item.bundleName;
        } else if (dockItem.keyName) {
          return dockItem.keyName != item.keyName;
        }
      })
      AppStorage.SetOrCreate('recentList', this.mRecentDataList);
      res = true;
    }
    return res;
  }

  updateResistDockItem(appInfo: AppItemInfo): void{
    Log.showDebug(TAG, `updateResistDockItem appInfo: ${JSON.stringify(appInfo)}`);
    let resistDockItem: DockItemInfo[] = AppStorage.Get('residentList');
    if (!CheckEmptyUtils.isEmptyArr(resistDockItem)) {
      for (let i = 0; i < resistDockItem.length; i++) {
        if (appInfo.bundleName === resistDockItem[i].bundleName) {
          let dockItemInfo = new DockItemInfo();
          dockItemInfo.itemType = CommonConstants.TYPE_APP;
          dockItemInfo.editable = true;
          dockItemInfo.appId = appInfo.appId;
          dockItemInfo.appName = appInfo.appName;
          dockItemInfo.bundleName = appInfo.bundleName;
          dockItemInfo.abilityName = appInfo.abilityName;
          dockItemInfo.moduleName = appInfo.moduleName;
          dockItemInfo.keyName = appInfo.keyName;
          dockItemInfo.appIconId = appInfo.appIconId;
          dockItemInfo.appLabelId = appInfo.appLabelId;
          dockItemInfo.installTime = appInfo.installTime;
          dockItemInfo.isSystemApp = appInfo.isSystemApp;
          dockItemInfo.isUninstallAble = appInfo.isUninstallAble;
          resistDockItem[i] = dockItemInfo;
          AppStorage.SetOrCreate('residentList', resistDockItem);
        }
      }
    }
  }
}