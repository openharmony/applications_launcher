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
    this.getResidentList().then(() => {}, () => {});
    this.mDevice = AppStorage.Get('device');
    Log.showInfo(TAG, 'dockDevice:' + this.mDevice);
    if (this.mDevice === CommonConstants.PAD_DEVICE_TYPE) {
      this.getRecentDataList().then(() => {}, () => {});
      this.registerMissionListener();
    }
    Log.showInfo(TAG, 'constructor!');
  }

  static getInstance(): SmartDockModel{
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
    const residentList = new Array<DockItemInfo>();
    const dockDataList = this.mSmartDockLayoutConfig.getDockLayoutInfo();
    Log.showInfo(TAG, 'getResidentList from config length:' + dockDataList.length);
    for (let i = 0; i < dockDataList.length; i++) {
      if (dockDataList[i].itemType == CommonConstants.TYPE_APP) {
        Log.showInfo(TAG, 'getResidentList dockDataList[i].bundleName:' + dockDataList[i].bundleName);
        const appData = await launcherAbilityManager.getAppInfoByBundleName(dockDataList[i].bundleName);
        if (appData == undefined) {
          continue;
        }
        const dockItemInfo = new DockItemInfo();
        dockItemInfo.itemType = dockDataList[i].itemType;
        dockItemInfo.editable = dockDataList[i].editable;
        dockItemInfo.appName = typeof (appData) === 'undefined' ? dockDataList[i].appName : appData.appName;
        dockItemInfo.bundleName = typeof (appData) === 'undefined' ? dockDataList[i].bundleName : appData.bundleName;
        dockItemInfo.abilityName = typeof (appData) === 'undefined' ? dockItemInfo.abilityName : appData.abilityName;
        dockItemInfo.appIconId = typeof (appData) === 'undefined' ? dockItemInfo.appIconId : appData.appIconId;
        dockItemInfo.appLabelId = typeof (appData) === 'undefined' ? dockItemInfo.appLabelId : appData.appLabelId;
        dockItemInfo.installTime = typeof (appData) === 'undefined' ? dockItemInfo.installTime : appData.installTime;
        residentList.push(dockItemInfo);
      } else if (dockDataList[i].itemType == CommonConstants.TYPE_CARD) {
      } else {
        const dockItemInfo = new DockItemInfo();
        dockItemInfo.itemType = dockDataList[i].itemType;
        dockItemInfo.editable = dockDataList[i].editable;
        dockItemInfo.bundleName = dockDataList[i].bundleName;
        dockItemInfo.abilityName = dockDataList[i].abilityName;
        dockItemInfo.appIconId = typeof (dockDataList[i].appIconId) != 'undefined' ? dockDataList[i].appIconId : dockDataList[i].iconId.id;
        dockItemInfo.appLabelId = typeof (dockDataList[i].appLabelId) != 'undefined' ? dockDataList[i].appLabelId : dockDataList[i].labelId.id;
        const loadAppName = await this.mResourceManager
          .getAppNameSync(dockItemInfo.appLabelId, dockItemInfo.bundleName, '');
        dockItemInfo.appName = loadAppName;
        residentList.push(dockItemInfo);
      }
    }
    // update persistent data
    this.mSmartDockLayoutConfig.updateDockLayoutInfo(residentList);
    // trigger component update
    AppStorage.SetOrCreate('residentList', residentList);
    Log.showInfo(TAG, 'getResidentList end residentList.length:' + residentList.length);
  }

  /**
   * get recent dock list
   */
  async getRecentDataList() {
    Log.showInfo(TAG, 'getRecentDataList start!');
    const recentList = await amsMissionManager.getRecentBundleMissionsList();
    if (CheckEmptyUtils.isEmptyArr(recentList)) {
      Log.showInfo(TAG, 'getRecentDataList empty');
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
    Log.showInfo(TAG, 'getRecentDataList end, recentList.length:' + recents.length);
  }

  /**
   * delete app from smartdock
   * @param appInfo
   * @param dockType
   */
  deleteDockItem(bundleName: string, dockType: number): boolean {
    if (CheckEmptyUtils.checkStrIsEmpty(bundleName)) {
      return false;
    }
    if (SmartDockConstants.RESIDENT_DOCK_TYPE === dockType) {
      return this.deleteResistDockItem(bundleName);

    }
    else if (SmartDockConstants.RECENT_DOCK_TYPE === dockType) {
      return this.deleteRecentDockItem(bundleName);
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
      dockItemInfo.appIconId = appInfo.appIconId;
      dockItemInfo.appLabelId = appInfo.appLabelId;
      if (dockItemCount == 0 || index == undefined || index >= dockItemCount || index < 0) {
        this.mResidentList.push(dockItemInfo);
      } else {
        this.mResidentList.splice(index, 0, dockItemInfo);
      }
      AppStorage.SetOrCreate('residentList', this.mResidentList);
      this.mSmartDockLayoutConfig.updateDockLayoutInfo(this.mResidentList);
      Log.showInfo(TAG, 'addToSmartdock appInfo:' + appInfo.bundleName);
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
  private checkDockNum(dockItemCount: number): boolean{
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
  private idDuplicate(list: AppItemInfo[], appInfo: AppItemInfo): boolean{
    for (let i = 0; i < list.length; i++) {
      if (list[i].bundleName === appInfo.bundleName) {
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
  addToPageDesk(appInfo: DockItemInfo) {
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
  inserItemToIndex(insertIndex: number, itemIndex: number) {
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
    this.mSmartDockLayoutConfig.updateDockLayoutInfo(this.mResidentList);
  }

  /**
   * register residentList dock ADD ITEM Listener
   * local listener for model to model send and receive msg
   */
  registerDockListener() {
    localEventManager.registerEventListener(this.mAddToDockListener, [
      EventConstants.EVENT_REQUEST_DOCK_ITEM_ADD,
      EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE,
      EventConstants.EVENT_REQUEST_RECENT_DOCK_ITEM_DELETE,
      EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_UPDATE
    ]);
    Log.showInfo(TAG, 'local listener on create');
  }

  /**
   * unregister residentList dock ADD ITEM Listener
   */
  unregisterDockListener() {
    localEventManager.unregisterEventListener(this.mAddToDockListener);
    Log.showInfo(TAG, 'local listener on destroy');
  }

  /**
   * resident local Listener
   */
  private readonly mAddToDockListener = {
    onReceiveEvent: (event: string, params: any) => {
      Log.showInfo(TAG, 'receive event: ' + event + ', params: ' + JSON.stringify(params));
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

  private registerMissionListener() {
    Log.showInfo(TAG, 'registerMissionListener');
    const listener = {
      onMissionCreated: this.onMissionCreatedCallback.bind(this),
      onMissionDestroyed: this.onMissionDestroyedCallback.bind(this),
      onMissionSnapshotChanged: this.onMissionSnapshotChangedCallback.bind(this),
      onMissionMovedToFront: this.onMissionMovedToFrontCallback.bind(this)
    };
    missionManager.registerMissionListener(listener);

  }

  onMissionCreatedCallback(missionId: number) {
    Log.showInfo(TAG, 'onMissionCreatedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => {});
  }

  onMissionDestroyedCallback(missionId: number) {
    Log.showInfo(TAG, 'onMissionDestroyedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, ( )=> {});
  }

  onMissionSnapshotChangedCallback(missionId: number) {
    Log.showInfo(TAG, 'onMissionSnapshotChangedCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => {});
  }

  onMissionMovedToFrontCallback(missionId: number) {
    Log.showInfo(TAG, 'onMissionMovedToFrontCallback, missionId=' + missionId);
    this.getRecentDataList().then(() => {}, () => { });
  }

  /**
   * 通过bundleName获取shortcutInfo
   * @param bundleName
   */
  getShortcutInfo(bundleName: string) {
    return this.mAppModel.getShortcutInfo(bundleName);
  }

  /**
   * @param cacheKey
   *
   * @return cache
   */
  getAppName(cacheKey: string) {
    return this.mResourceManager.getAppResourceCache(cacheKey, KEY_NAME);
  }

  async getSnapshot(missionIds: MissionInfo[], name: string) {
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
    Log.showInfo(TAG, 'getSnapshot update snapshotList');
    return snapshotList;
  }

  private deleteResistDockItem(bundleName: string) {
    let res = false;
    this.mResidentList = AppStorage.Get('residentList');
    if (!CheckEmptyUtils.isEmptyArr(this.mResidentList)) {
      for (let i = 0; i < this.mResidentList.length; i++) {
        if (bundleName === this.mResidentList[i].bundleName) {
          // checkt right to delete
          if (!this.mResidentList[i].editable) {
            Prompt.showToast({
              message: $r('app.string.disable_add_to_delete')
            });
          } else {
            this.mResidentList.splice(i, 1);
            AppStorage.SetOrCreate('residentList', this.mResidentList);
            this.mSmartDockLayoutConfig.updateDockLayoutInfo(this.mResidentList);
            Log.showInfo(TAG, `deleteRecentDockItem resist dockItem: ${bundleName}`);
            res = true;
            return res;
          }
        }
      }
    }
    return res;
  }

  private deleteRecentDockItem(bundleName: string) {
    let res = false;
    this.mRecentDataList = AppStorage.Get('recentList');
    if (!CheckEmptyUtils.isEmptyArr(this.mResidentList)) {
      for (let i = 0; i < this.mRecentDataList.length; i++) {
        if (bundleName === this.mRecentDataList[i].bundleName) {
          this.mRecentDataList.splice(i, 1);
          AppStorage.SetOrCreate('recentList', this.mRecentDataList);
          Log.showInfo(TAG, `deleteRecentDockItem recent dockItem: ${bundleName}`);
          res = true;
          return res;
        }
      }
    }
    return res;
  }

  updateResistDockItem(appInfo: AppItemInfo){
    Log.showInfo(TAG, `updateResistDockItem appInfo: ${JSON.stringify(appInfo)}`);
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
          dockItemInfo.appIconId = appInfo.appIconId;
          dockItemInfo.appLabelId = appInfo.appLabelId;
          dockItemInfo.installTime = appInfo.installTime;
          resistDockItem[i] = dockItemInfo;
          AppStorage.SetOrCreate('residentList', resistDockItem);
        }
      }
    }
  }
}