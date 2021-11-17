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

import bundleMgr from '@ohos.bundle';
import featureAbility from '@ohos.ability.featureAbility';
import abilityManager from '@ohos.app.abilityManager';
import AppItemInfo from '../bean/AppItemInfo.ets';
import RecentTaskInfo from '../bean/RecentTaskInfo.ets';
import CheckEmptyUtils from '../utils/CheckEmptyUtils.ets';

/**
 * 桌面应用管理类
 */
class LauncherAbilityManager {
  /**
   * 获取所有Ability flag
   */
  public static IF_GET_ABILITY: number = 1;
  private static MAX_NUM: number = 20;
  private static PERMISSION_NUM: number = 8;
  private static NON: number = 0;
  private static sInstance = null;

  /**
   * 获取桌面应用信息管理对象
   *
   * @return 桌面应用信息管理对象单一实例
   */
  public static getInstance(): LauncherAbilityManager {
    if (LauncherAbilityManager.sInstance == null) {
      LauncherAbilityManager.sInstance = new LauncherAbilityManager();
    }
    return LauncherAbilityManager.sInstance;
  }

  /**
   * 获取所有桌面应用Ability信息
   *
   * @return 返回在桌面显示的Ability列表
   */
  public async getLauncherAbilityList() {
    let abilityList = await bundleMgr.getAllBundleInfo(LauncherAbilityManager.IF_GET_ABILITY);
    let appItemInfoList = new Array<AppItemInfo>();
    if (CheckEmptyUtils.isEmpty(abilityList)) {
      console.error("Launcher LauncherAbilityManager getLauncherAbilityList Empty");
      return appItemInfoList;
    }
    for (let i = 0; i < abilityList.length; i++) {
      if (abilityList[i].abilityInfos.length == 0) {
        continue;
      }
      let appItemInfo = new AppItemInfo();
      appItemInfo.appId = abilityList[i].appId;
      appItemInfo.appName = abilityList[i].appInfo.label;
      appItemInfo.appIconId = abilityList[i].appInfo.iconId;
      appItemInfo.appLabelId = abilityList[i].appInfo.labelId;
      appItemInfo.bundleName = abilityList[i].name;
      appItemInfo.abilityName = abilityList[i].abilityInfos[0].name;
      appItemInfo.isSystemApp = abilityList[i].appInfo.systemApp;
      appItemInfoList.push(appItemInfo);
    }
    return appItemInfoList;
  }

  /**
   * 获取指定桌面应用Ability信息
   *
   * @params bundleName 应用包名
   * @return 目标应用的入口Ability信息
   */
  public async getLauncherAbilityInfo(bundleName) {
    let abilityInfo = await bundleMgr.getBundleInfo(bundleName, LauncherAbilityManager.IF_GET_ABILITY);
    let appItemInfo = new AppItemInfo();
    appItemInfo.appId = abilityInfo.appId;
    appItemInfo.appName = abilityInfo.appInfo.label;
    appItemInfo.appIconId = abilityInfo.appInfo.iconId;
    appItemInfo.appLabelId = abilityInfo.appInfo.labelId;
    appItemInfo.bundleName = abilityInfo.name;
    appItemInfo.abilityName = abilityInfo.abilityInfos[0].name;
    appItemInfo.isSystemApp = abilityInfo.appInfo.systemApp;
    return appItemInfo;
  }

  /**
   * 获取指定桌面应用Ability信息
   *
   * @params bundleName 应用包名
   * @return 目标应用的基础应用信息
   */
  public async getApplicationInfo(bundleName) {
    let appInfo = await bundleMgr.getApplicationInfo(bundleName, LauncherAbilityManager.PERMISSION_NUM, LauncherAbilityManager.NON);
    let appItemInfo = new AppItemInfo();
    appItemInfo.appIconId = appInfo.iconId;
    appItemInfo.appLabelId = appInfo.labelId;
    return appItemInfo;
  }

  /**
   * 获取最近使用的Ability信息
   *
   * @return 返回在最近使用的Ability列表
   */
  public async getRecentTaskListFromMission() {
    let recentTaskList = new Array<RecentTaskInfo>();
    let listData = await abilityManager.queryRunningAbilityMissionInfos(LauncherAbilityManager.MAX_NUM);
    if (CheckEmptyUtils.isEmpty(listData)) {
      console.error("Launcher LauncherAbilityManager getLauncherAbilityList Empty");
      return listData;
    }
    for (let i = 0; i < listData.length; i++) {
      let recentTaskInfo = new RecentTaskInfo();
      recentTaskInfo.missionId = listData[i].id;
      recentTaskInfo.appName = listData[i].missionDescription.label;
      recentTaskInfo.bundleName = listData[i].topAbility.bundleName;
      recentTaskInfo.abilityName = listData[i].topAbility.abilityName;

      let appInfo = await this.getApplicationInfo(recentTaskInfo.bundleName)
      recentTaskInfo.appIconId = appInfo.appIconId;
      recentTaskInfo.appLabelId = appInfo.appLabelId;
      recentTaskList.push(recentTaskInfo);
    }
    return recentTaskList;
  }

  /**
   * 清空最近任务
   *
   * @return 目标应用的基础应用信息
   */
  public async clearRecentTask() {
    await abilityManager.clearMissions((data) => {
      console.info('clearRecentTask data [' + data + ']');
    });
  }

  /**
   * 移除指定任务
   *
   * @params missionId 最近任务id
   * @return 目标应用的基础应用信息
   */
  public async removeRecentTask(missionId) {
    await abilityManager.removeRecentTask(missionId, (err, data) => {
      console.info('removeMission data [' + data + ']');
    });
  }

  /**
   * 卸载应用
   *
   * @params bundleName 应用包名
   * @params callback 卸载回调
   */
  public async uninstallLauncherAbility(bundleName, callback) {
    console.info('Launcher ==> LauncherAbilityManager uninstallLauncherAbility bundleName => ' + bundleName);
    let bundlerInstaller = await bundleMgr.getBundleInstaller();
    bundlerInstaller.uninstall(bundleName, {
      param: {
        userId: 0,
        installFlag: 0,
        isKeepData: false
      }
    }, (result) => {
      callback(result);
    });
  }

  /**
   * 启动应用
   *
   * @params paramAbilityName Ability名
   * @params paramBundleName 应用包名
   */
  public startLauncherAbility(paramAbilityName, paramBundleName) {
    console.info('Launcher ==> LauncherAbilityManager startApplication abilityName => ' + paramBundleName + "bundleName");
    let result = featureAbility.startAbility({
      want: {
        bundleName: paramBundleName,
        abilityName: paramAbilityName
      }
    }).then((data) => {
      console.info("Launcher ==> LauncherAbilityManager startApplication promise::then : "  + JSON.stringify(data));
    }).catch((error) => {
      console.info("Launcher ==> LauncherAbilityManager startApplication promise::catch : "  + JSON.stringify(error));
    });
    console.info("Launcher ==> LauncherAbilityManager startApplication AceApplication : startAbility : "  + result);
  }
}

let launcherAbilityManager = LauncherAbilityManager.getInstance();
export default launcherAbilityManager;