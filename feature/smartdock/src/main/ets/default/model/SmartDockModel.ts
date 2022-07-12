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

import Prompt from '@ohos.prompt';
import missionManager from '@ohos.application.missionManager';
import { MissionListener } from 'application/MissionListener';
import launcherAbilityManager from '../../../../../../../common/src/main/ets/default/manager/LauncherAbilityManager';
import MissionInfo from '../../../../../../../common/src/main/ets/default/bean/MissionInfo';
import amsMissionManager from '../../../../../../../common/src/main/ets/default/manager/AmsMissionManager';
import SmartDockLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/SmartDockLayoutConfig';
import layoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import localEventManager from '../../../../../../../common/src/main/ets/default/manager/LocalEventManager';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import ResourceManager from '../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import EventConstants from '../../../../../../../common/src/main/ets/default/constants/EventConstants';
import CheckEmptyUtils from '../../../../../../../common/src/main/ets/default/utils/CheckEmptyUtils';
import RecentBundleMissionInfo from '../../../../../../../common/src/main/ets/default/bean/RecentBundleMissionInfo';
import DockItemInfo from '../../../../../../../common/src/main/ets/default/bean/DockItemInfo';
import AppItemInfo from '../../../../../../../common/src/main/ets/default/bean/AppItemInfo';
import AppModel from '../../../../../../../common/src/main/ets/default/model/AppModel';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import FeatureConstants from '../common/constants/FeatureConstants';
import SmartDockStyleConfig from '../common/SmartDockStyleConfig';
import RecentMissionInfo from '../../../../../../../common/src/main/ets/default/bean/RecentMissionInfo';

const TAG = 'SmartDockModel';
const KEY_NAME = 'name';

/**
 * SmartDock Model
 */
export default class SmartDockModel {
  private readonly mSmartDockLayoutConfig: SmartDockLayoutConfig;
  private readonly mSmartDockStyleConfig: SmartDockStyleConfig;
  private mResidentList: DockItemInfo[] = new Array<DockItemInfo>();
  private mRecentDataList: RecentBundleMissionInfo[] = new Array<RecentBundleMissionInfo>();
  private readonly mDevice = CommonConstants.DEFAULT_DEVICE_TYPE;
  private readonly mResourceManager: ResourceManager;
  protected mAppModel: AppModel;

  private constructor() {
    this.mSmartDockLayoutConfig = layoutConfigManager.getFunctionConfig(SmartDockLayoutConfig.SMART_DOCK_LAYOUT_INFO);
    this.mSmartDockStyleConfig = layoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG, FeatureConstants.FEATURE_NAME);
    this.mAppModel = AppModel.getInstance();
    this.mResourceManager = ResourceManager.getInstance();
    this.registerDockListener();
    this.mDevice = AppStorage.Get('device');
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

    if (CheckEmptyUtils.isEmptyArr(rdbResidentList) && !this.mSmartDockLayoutConfig.isConfigExist()) {
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
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_INIT, residentList);
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
    const missionInfos: {
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
  inserItemToIndex(insertIndex: number, itemIndex: number): void {
    if ((insertIndex == 0 || insertIndex == 1 || itemIndex == 0 || itemIndex == 1) && this.mDevice === CommonConstants.PAD_DEVICE_TYPE) {
      Prompt.showToast({
        message: $r('app.string.disable_to_move')
      });
      return;
    }
    this.mResidentList = AppStorage.Get('residentList');

    if (itemIndex < insertIndex) {
      const selectItem = this.mResidentList[itemIndex];
      for (let i = itemIndex; i < insertIndex; i++) {
        this.mResidentList[i] = this.mResidentList[i+1];
      }
      this.mResidentList[insertIndex] = selectItem;
    }
    if (itemIndex > insertIndex) {
      const selectItem = this.mResidentList[itemIndex];
      for (let i = itemIndex; i > insertIndex; i--) {
        this.mResidentList[i] = this.mResidentList[i-1];
      }
      this.mResidentList[insertIndex] = selectItem;
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
      EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_UPDATE
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
      }
    }
  };

  private registerMissionListener(): void {
    Log.showDebug(TAG, 'registerMissionListener');
    const listener: MissionListener = {
      onMissionCreated: this.onMissionCreatedCallback.bind(this),
      onMissionDestroyed: this.onMissionDestroyedCallback.bind(this),
      onMissionSnapshotChanged: this.onMissionSnapshotChangedCallback.bind(this),
      onMissionMovedToFront: this.onMissionMovedToFrontCallback.bind(this),
      onMissionIconUpdated: () => {}
    };
    missionManager.registerMissionListener(listener);
  }

  onMissionCreatedCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionCreatedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => {});
    this.getRecentViewDataList(missionId).then(() => {}, () => {});
  }

  /**
   * get recent view list
   */
  async getRecentViewDataList(missionId: number): Promise<void> {
    let mRecentMissionsList = await amsMissionManager.getRecentMissionsList();
    Log.showDebug(TAG, `getRecentMissionsList length: ${mRecentMissionsList.length}`);
    const snapShotTime = new Date().toString();
    mRecentMissionsList.find(item => {
      return item.missionId === missionId;
    }).snapShotTime = snapShotTime;
    AppStorage.SetOrCreate('recentMissionsList', mRecentMissionsList);
  }

  onMissionDestroyedCallback(missionId: number): void {
    Log.showInfo(TAG, 'onMissionDestroyedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, ( )=> {});
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
    let snapShotWidth = 0;
    for (const item of missionIds) {
      let pixelMap = {
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
    if (!CheckEmptyUtils.isEmptyArr(this.mResidentList)) {
      for (let i = 0; i < this.mRecentDataList.length; i++) {
        if (dockItem.bundleName === this.mResidentList[i].bundleName
        || dockItem.keyName === this.mResidentList[i].keyName) {
          this.mRecentDataList.splice(i, 1);
        }
      }
      AppStorage.SetOrCreate('recentList', this.mRecentDataList);
      Log.showDebug(TAG, `deleteRecentDockItem recent dockItem: ${JSON.stringify(dockItem)}`);
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