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
import BaseAppPresenter from '../../../../../../../common/src/main/ets/default/base/BaseAppPresenter';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import EventConstants from '../../../../../../../common/src/main/ets/default/constants/EventConstants';
import ResourceManager from '../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import SettingsModel from '../../../../../../../common/src/main/ets/default/model/SettingsModel';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import PinyinSort from '../../../../../../../common/src/main/ets/default/utils/PinyinSort';
import BigFolderModel from '../common/BigFolderModel.ts';
import FolderStyleConstants from '../common/constants/FolderStyleConstants';
import PageDesktopViewModel from '../../../../../../pagedesktop/src/main/ets/default/common/viewmodel/PageDesktopViewModel';
import FeatureConstants from '../common/constants/FeatureConstants.ts';
import BigFolderStyleConfig from '../common/BigFolderStyleConfig';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';

const TAG = 'FolderViewModel';
const HEXADECIMAL_VALUE = 36;

export default class FolderViewModel extends BaseAppPresenter {
  private readonly mPageDesktopViewModel: PageDesktopViewModel;
  private readonly mSettingsModel: SettingsModel;
  private readonly mFolderModel: BigFolderModel;
  private readonly mPinyinSort: PinyinSort;
  private readonly mGridConfig;
  private mPageIndex = 0;
  private readonly mFolderStyleConfig: BigFolderStyleConfig;

  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
      Log.showInfo(TAG, `FolderViewModel receive event: ${event}, params: ${JSON.stringify(params)}`);
      const openStatus = AppStorage.Get('openFolderStatus');
      if (event === EventConstants.EVENT_BADGE_UPDATE && openStatus == FeatureConstants.OPEN_FOLDER_STATUS_OPEN) {
        const openFolderData: {
          layoutInfo: [[]]
        } = AppStorage.Get('openFolderData');
        this.updateBadge(openFolderData, params);
      } else if (event === EventConstants.EVENT_FOLDER_PACKAGE_REMOVED) {
        this.deleteAppFromFolderByUninstall(params);
      }
    }
  };

  private updateBadge(openFolderData, params) {
    for (let i = 0; i < openFolderData.layoutInfo.length; i++) {
      const appInfo: any = openFolderData.layoutInfo[i].find(item => {
        if (item.bundleName == params.bundleName) {
          return true;
        }
      });
      if (appInfo != undefined && appInfo.bundleName.length > 0) {
        const index = openFolderData.layoutInfo[i].indexOf(appInfo);
        appInfo.badgeNumber = params.badgeNumber;
        openFolderData.layoutInfo[i][index] = appInfo;
        break;
      }
    }
    Log.showInfo(TAG, `mLocalEventListener openFolderData: ${JSON.stringify(openFolderData)}`);
    this.refreshFolder(openFolderData);
  }

  private constructor() {
    super();
    this.mFolderModel = BigFolderModel.getInstance();
    this.mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.mSettingsModel = SettingsModel.getInstance();
    this.mGridConfig = this.mPageDesktopViewModel.getGridConfig();
    this.mPinyinSort = new PinyinSort();
    this.mFolderModel.registerFolderUpdateEvent(this.mLocalEventListener);
    this.mFolderStyleConfig = LayoutConfigManager.getStyleConfig(BigFolderStyleConfig.APP_LIST_STYLE_CONFIG,
      FeatureConstants.FEATURE_NAME);
  }

  static getInstance() {
    if (globalThis.FolderViewModelInstance == null) {
      globalThis.FolderViewModelInstance = new FolderViewModel();
    }
    return globalThis.FolderViewModelInstance;
  }

  /**
   * return BigFolderStyleConfig
   */
  getFolderStyleConfig(): BigFolderStyleConfig {
    return this.mFolderStyleConfig;
  }

  /**
   * Add new folder
   *
   * @param {any} appListInfo (two app for create new folder).
   */
  async addNewFolder(appListInfo) {
    const gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    const settingAppInfoList = this.mSettingsModel.getAppListInfo();
    const folderAppInfo = [];
    for (let j = 0; j < appListInfo.length; j++) {
      for (let i = 0; i < settingAppInfoList.length; i++) {
        if (settingAppInfoList[i].bundleName === appListInfo[j].bundleName) {
          folderAppInfo.push(settingAppInfoList[i]);
          break;
        }
      }
    }
    let badgeNumber = 0;
    for (let i = 0; i < folderAppInfo.length; i++) {
      const index = settingAppInfoList.indexOf(folderAppInfo[i]);
      if (folderAppInfo[i].badgeNumber && folderAppInfo[i].badgeNumber > 0) {
        badgeNumber = badgeNumber + folderAppInfo[i].badgeNumber;
      }
      settingAppInfoList.splice(index, 1);
    }

    // Delete {the app list} from desktop app list
    for (let i = 0; i < appListInfo.length; i++) {
      const index = gridLayoutInfo.layoutInfo.indexOf(appListInfo[i]);
      Log.showInfo(TAG, `desktop app list index: ${index}`);
      gridLayoutInfo.layoutInfo.splice(index, 1);
    }

    const folderInfo = await this.createNewFolderInfo();
    folderInfo.layoutInfo.push(folderAppInfo);
    folderInfo.badgeNumber = badgeNumber;

    const needNewPage: boolean = this.mPageDesktopViewModel.updateFolderItemLayoutInfo(gridLayoutInfo, folderInfo);
    if (needNewPage) {
      gridLayoutInfo.layoutDescription.pageCount = gridLayoutInfo.layoutDescription.pageCount + 1;
      for (let index = 0; index < gridLayoutInfo.layoutInfo.length; index++) {
        if (gridLayoutInfo.layoutInfo[index].page > this.mPageDesktopViewModel.getIndex()) {
          gridLayoutInfo.layoutInfo[index].page ++;
        }
      }
    }

    // Push folder into the layoutInfo,include {the app list}
    gridLayoutInfo.layoutInfo.push(folderInfo);

    this.mSettingsModel.setAppListInfo(settingAppInfoList);
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    this.mPageDesktopViewModel.deleteAppItems(appListInfo);
    if (needNewPage) {
      this.mPageDesktopViewModel.changeIndex(this.mPageDesktopViewModel.getIndex() + 1);
    }
  }

  /**
   * Add App To Folder
   *
   * @param appInfo AppInfo
   * @param folderId folderId
   */
  addOneAppToFolder(appInfo, folderId) {
    Log.showInfo(TAG, 'addOneAppToFolder start');
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    const appListInfo = this.mSettingsModel.getAppListInfo();

    for (let i = 0; i < appListInfo.length; i++) {
      if (appInfo.bundleName === appListInfo[i].bundleName) {
        appInfo.appId = appListInfo[i].appId;
        appInfo.appName = appListInfo[i].appName;
        appInfo.isSystemApp = appListInfo[i].isSystemApp;
        appInfo.isUninstallAble = appListInfo[i].isUninstallAble;
        appInfo.appIconId = appListInfo[i].appIconId;
        appInfo.appLabelId = appListInfo[i].appLabelId;
        appInfo.abilityName = appListInfo[i].abilityName;
        appInfo.x = appListInfo[i].x;
        appInfo.badgeNumber = appListInfo[i].badgeNumber;
        appListInfo.splice(i, 1);
        break;
      }
    }

    // add App
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER
        && gridLayoutInfo.layoutInfo[i].folderId === folderId) {
        const info = gridLayoutInfo.layoutInfo[i].layoutInfo;
        if (info.length == 0) {
          Log.showInfo(TAG, `folder data is wrong: ${folderId}`);
          return;
        }
        if (gridLayoutInfo.layoutInfo[i].badgeNumber && gridLayoutInfo.layoutInfo[i].badgeNumber > 0) {
          if (appInfo.badgeNumber && appInfo.badgeNumber > 0) {
            gridLayoutInfo.layoutInfo[i].badgeNumber = gridLayoutInfo.layoutInfo[i].badgeNumber + appInfo.badgeNumber;
          }
        } else {
          gridLayoutInfo.layoutInfo[i].badgeNumber = appInfo.badgeNumber;
        }
        const lastPageItems = info[info.length - 1];
        if (lastPageItems[lastPageItems.length - 1].type == CommonConstants.TYPE_ADD) {
          lastPageItems[lastPageItems.length - 1] = appInfo;
        } else {
          const openFolderConfig = this.mFolderModel.getFolderOpenLayout();
          if (lastPageItems.length == openFolderConfig.column * openFolderConfig.row) {
            info.push([appInfo]);
          } else {
            lastPageItems.push(appInfo);
          }
        }
        break;
      }
    }

    // delete app from desktop
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_APP) {
        if (appInfo.bundleName === gridLayoutInfo.layoutInfo[i].bundleName) {
          gridLayoutInfo.layoutInfo.splice(i, 1);
          break;
        }
      }
    }

    // delete App from desktop
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    if (!this.getIsPad()) {
      this.mSettingsModel.setAppListInfo(appListInfo);
    }
    this.mPageDesktopViewModel.getGridList();
  }

  /**
   * Delete app from folder by draging
   *
   * @param {any} folderAppList.
   * @param {number} index.
   * @param {number} folderPageIndex.
   */
  deleteAppByDraging(folderAppList, index, folderPageIndex): boolean {
    Log.showInfo(TAG, 'deleteAppByDraging start');
    const gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    if (folderAppList.length == 0 || folderAppList.length <= index) {
      return false;
    }
    const desktopPageIndex = AppStorage.Get('pageIndex');
    const dragAppInfo = folderAppList[index];
    if (folderAppList.length > 2) {
      const needNewPage: boolean = this.mPageDesktopViewModel.updateAppItemFromFolder(gridLayoutInfo, dragAppInfo);
      Log.showInfo(TAG, `deleteAppByDraging needNewPage: ${needNewPage}`);
      if (needNewPage) {
        return false;
      }
    }

    folderAppList.splice(index, 1);
    if (folderAppList.length > 0 && folderAppList[folderAppList.length - 1].type == CommonConstants.TYPE_ADD) {
      folderAppList.pop();
    }
    const folderLayoutInfo = this.filterFolderPage(folderAppList);

    const openFolderData: {
      folderId: string,
      layoutInfo: any
    } = AppStorage.Get('openFolderData');
    const removeAppInfos = [dragAppInfo];
    // Delete app from the folder
    const folderIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.type === CommonConstants.TYPE_FOLDER && item.folderId === openFolderData.folderId;
    });

    if (folderLayoutInfo.length == 1 && folderLayoutInfo[0].length == 1) {
      // delete folder and add app to desktop
      removeAppInfos.push(folderLayoutInfo[0][0]);
      gridLayoutInfo.layoutInfo.splice(folderIndex, 1);
    } else {
      let folderBadgeNumber = 0;
      if (gridLayoutInfo.layoutInfo[folderIndex].badgeNumber && gridLayoutInfo.layoutInfo[folderIndex].badgeNumber > 0) {
        folderBadgeNumber = gridLayoutInfo.layoutInfo[folderIndex].badgeNumber;
        if (dragAppInfo.badgeNumber && dragAppInfo.badgeNumber > 0) {
          folderBadgeNumber = folderBadgeNumber - dragAppInfo.badgeNumber;
        }
      }
      gridLayoutInfo.layoutInfo[folderIndex].badgeNumber = folderBadgeNumber;
      openFolderData.layoutInfo = folderLayoutInfo;
    }

    const appListInfo = this.mSettingsModel.getAppListInfo();

    // Add app to desktop app list
    for (let i = 0; i < removeAppInfos.length; i++) {
      this.mPageDesktopViewModel.updateAppItemFromFolder(gridLayoutInfo, removeAppInfos[i]);
      const gridLayout = {
        bundleName: removeAppInfos[i].bundleName,
        type: removeAppInfos[i].type,
        area: removeAppInfos[i].area,
        page: removeAppInfos[i].page,
        column: removeAppInfos[i].column,
        row: removeAppInfos[i].row,
      };
      gridLayoutInfo.layoutInfo.push(gridLayout);
      appListInfo.push(removeAppInfos[i]);
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    if (!this.getIsPad()) {
      this.mSettingsModel.setAppListInfo(appListInfo);
    }
    return true;
  }

  /**
   * Delete app from open folder
   *
   * @param {any} appInfo.
   */
  deleteAppFromOpenFolder(appInfo): any {
    Log.showInfo(TAG, 'deleteAppByUninstall start');

    let folderAppList = [];
    let openFolderData: {
      folderId: string,
      layoutInfo: any
    } = AppStorage.Get('openFolderData');

    for (let i = 0; i < openFolderData.layoutInfo.length; i++) {
      folderAppList = folderAppList.concat(openFolderData.layoutInfo[i]);
    }

    const index = folderAppList.findIndex(item => {
      return item.bundleName === appInfo.bundleName;
    });
    folderAppList.splice(index, 1);
    if (folderAppList.length > 0 && folderAppList[folderAppList.length - 1].type == CommonConstants.TYPE_ADD) {
      folderAppList.pop();
    }
    const folderLayoutInfo = this.filterFolderPage(folderAppList);

    // Delete app from the folder
    const gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    const folderIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.type === CommonConstants.TYPE_FOLDER && item.folderId === openFolderData.folderId;
    });

    const appListInfo = this.mSettingsModel.getAppListInfo();
    if (folderLayoutInfo.length == 1 && folderLayoutInfo[0].length == 1) {
      // delete folder and add app to desktop
      const appLayout = {
        bundleName: folderLayoutInfo[0][0].bundleName,
        type: folderLayoutInfo[0][0].type,
        area: folderLayoutInfo[0][0].area,
        page: gridLayoutInfo.layoutInfo[folderIndex].page,
        column: gridLayoutInfo.layoutInfo[folderIndex].column,
        row: gridLayoutInfo.layoutInfo[folderIndex].row
      };
      gridLayoutInfo.layoutInfo.push(appLayout);
      appListInfo.push(folderLayoutInfo[0][0]);
      gridLayoutInfo.layoutInfo.splice(folderIndex, 1);
      openFolderData = { folderId: '', layoutInfo: [] };
    } else {
      let folderBadgeNumber = 0;
      if (gridLayoutInfo.layoutInfo[folderIndex].badgeNumber && gridLayoutInfo.layoutInfo[folderIndex].badgeNumber > 0) {
        folderBadgeNumber = gridLayoutInfo.layoutInfo[folderIndex].badgeNumber;
        if (appInfo.badgeNumber && appInfo.badgeNumber > 0) {
          folderBadgeNumber = folderBadgeNumber - appInfo.badgeNumber;
        }
      }
      gridLayoutInfo.layoutInfo[folderIndex].badgeNumber = folderBadgeNumber;
      openFolderData.layoutInfo = folderLayoutInfo;
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    if (!this.getIsPad()) {
      this.mSettingsModel.setAppListInfo(appListInfo);
    }

    Log.showInfo(TAG, 'deleteAppByUninstall end');
    return openFolderData;
  }

  /**
   * Delete folder
   *
   * @param {number} folderId.
   */
  async deleteFolder(folderId) {
    Log.showInfo(TAG, 'deleteFolder start');
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    const tempGridLayoutInfo = gridLayoutInfo;
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
        if (gridLayoutInfo.layoutInfo[i].folderId === folderId) {

          // Push the folder app list into desktop
          tempGridLayoutInfo.layoutInfo.push(gridLayoutInfo.layoutInfo[i].layoutInfo);

          // Delete the folder
          tempGridLayoutInfo.layoutInfo.splice(i, 1);
        }
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(tempGridLayoutInfo);
  }

  /**
   * Add app to folder
   *
   * @param {any} appInfos.
   * @param {number} folderId.
   */
  async addAppToFolder(appInfos, folderId) {
    Log.showInfo(TAG, 'addAppToFolder start');
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Add app to the folder
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
        if (gridLayoutInfo.layoutInfo[i].folderId === folderId) {
          gridLayoutInfo.layoutInfo[i].layoutInfo.push(appInfos);
        }
      }
    }

    // Check whether the app exists in other data
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      for (let j = 0; j < appInfos.length; j++) {
        if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
          if (gridLayoutInfo.layoutInfo[i].folderId !== folderId) {
            const indexA = gridLayoutInfo.layoutInfo[i].layoutInfo.indexOf(appInfos[j]);
            if (indexA != CommonConstants.INVALID_VALUE) {
              gridLayoutInfo.layoutInfo[i].layoutInfo.splice(indexA, 1);
            }
          }
        } else {
          const indexB = gridLayoutInfo.layoutInfo[i].indexOf(appInfos[j]);
          if (indexB != CommonConstants.INVALID_VALUE) {
            gridLayoutInfo.layoutInfo[i].splice(indexB, 1);
          }
        }
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
  }

  /**
   * Delete app from folder
   *
   * @param {any} appInfo.
   * @param {number} folderId.
   */
  async deleteAppFromFolder(appInfo, folderId) {
    Log.showInfo(TAG, 'deleteAppFromFolder start');
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Add app to desktop app list
    gridLayoutInfo.layoutInfo.push(appInfo);

    // Delete app from the folder
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
        if (gridLayoutInfo.layoutInfo[i].folderId === folderId) {
          const index = gridLayoutInfo.layoutInfo[i].layoutInfo.indexOf(appInfo);
          Log.showInfo(TAG, `deleteAppFromFolder app index: ${index}`);
          gridLayoutInfo.layoutInfo[i].layoutInfo.splice(index, 1);
        }
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
  }

  /**
   * Update folder app list info
   *
   * @param {any} appInfos.
   * @param {any} folderItem.
   */
  async updateFolderAppList(appInfos, folderItem) {
    Log.showInfo(TAG, 'updateFolderAppList start');
    let removeFolderApp = [];
    let gridLayoutInfoTemp: any;
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    gridLayoutInfoTemp = this.mPageDesktopViewModel.getLayoutInfo();
    removeFolderApp = this.layoutInfoToList(folderItem);
    // checked app's count <= 1
    if (appInfos.length <= CommonConstants.FOLDER_APP_VALUE) {
      if (appInfos.length === CommonConstants.FOLDER_APP_VALUE) {
        const appToDesktop = [];
        for (let i = 0; i < appInfos.length; i++) {
          let addFlag = true;
          for (let j = 0; j < removeFolderApp.length; j++) {
            if (appInfos[i].bundleName == removeFolderApp[j].bundleName) {
              addFlag = false;
              break;
            }
          }
          if (addFlag) {
            appToDesktop.push(appInfos[i]);
          }
        }

        if (appToDesktop.length != 0) {
          removeFolderApp = removeFolderApp.concat(appToDesktop);
        }
      }
      let folderItemIndex = CommonConstants.INVALID_VALUE;
      for (let i = 0; i < gridLayoutInfoTemp.layoutInfo.length; i++) {
        if (gridLayoutInfoTemp.layoutInfo[i].folderId === folderItem.folderId) {
          folderItemIndex = i;
          break;
        }
      }
      gridLayoutInfoTemp.layoutInfo.splice(folderItemIndex, 1);
      folderItem.layoutInfo = [[]];
      this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
      for (let i = 0; i < removeFolderApp.length; i++) {
        this.mPageDesktopViewModel.addToDesktop(removeFolderApp[i]);
      }
    } else {
      // checked app's count >= 2
      for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
        if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER
          && gridLayoutInfo.layoutInfo[i].folderId === folderItem.folderId) {
          let badgeNumber = 0;
          appInfos.forEach((item) => {
            if (item.badgeNumber && item.badgeNumber > 0) {
              badgeNumber = badgeNumber + item.badgeNumber;
            }
          });
          const folderLayoutInfo = this.filterFolderPage(appInfos);
          folderItem.layoutInfo = folderLayoutInfo;
          folderItem.badgeNumber = badgeNumber;
          gridLayoutInfoTemp.layoutInfo[i].layoutInfo = JSON.parse(JSON.stringify(folderLayoutInfo));
          this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
          this.mPageDesktopViewModel.getGridList();
          break;
        }
      }
      for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
        if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER
          && gridLayoutInfo.layoutInfo[i].folderId !== folderItem.folderId) {
          const folderAppList = this.layoutInfoToList(gridLayoutInfo.layoutInfo[i]);
          const appInfosRemaining = [];
          for (let m = 0; m < folderAppList.length; m++) {
            let otherFolderFlag = false;
            for (let n = 0; n < appInfos.length; n++) {
              if (appInfos[n].bundleName == folderAppList[m].bundleName) {
                otherFolderFlag = true;
                break;
              }
            }
            if (!otherFolderFlag) {
              appInfosRemaining.push(folderAppList[m]);
            }
          }

          let thisFolderItemIndex = CommonConstants.INVALID_VALUE;
          for (let j = 0; j < gridLayoutInfoTemp.layoutInfo.length; j++) {
            if (gridLayoutInfoTemp.layoutInfo[j].folderId === gridLayoutInfo.layoutInfo[i].folderId) {
              thisFolderItemIndex = j;
              break;
            }
          }
          if (appInfosRemaining.length <= CommonConstants.FOLDER_APP_VALUE) {
            gridLayoutInfoTemp.layoutInfo.splice(thisFolderItemIndex, 1);
            this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
            if (appInfosRemaining.length === CommonConstants.FOLDER_APP_VALUE) {
              this.mPageDesktopViewModel.addToDesktop(appInfosRemaining[0]);
            } else {
              this.mPageDesktopViewModel.getGridList();
            }
          } else {
            let badgeNumber = 0;
            appInfosRemaining.forEach((item) => {
              if (item.badgeNumber && item.badgeNumber > 0) {
                badgeNumber = badgeNumber + item.badgeNumber;
              }
            });
            gridLayoutInfoTemp.layoutInfo[thisFolderItemIndex].badgeNumber = badgeNumber;
            gridLayoutInfoTemp.layoutInfo[thisFolderItemIndex].layoutInfo = this.filterFolderPage(appInfosRemaining);
            this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
            this.mPageDesktopViewModel.getGridList();
          }
        }
      }

      // move apps from desktop to folder
      const appDesktopToFolder = [];
      for (let i = 0; i < appInfos.length; i++) {
        for (let j = 0; j < gridLayoutInfo.layoutInfo.length; j++) {
          if (gridLayoutInfo.layoutInfo[j].type == CommonConstants.TYPE_APP &&
          appInfos[i].bundleName == gridLayoutInfo.layoutInfo[j].bundleName) {
            appDesktopToFolder.push(gridLayoutInfo.layoutInfo[j]);
            break;
          }
        }
      }

      if (appDesktopToFolder.length > 0) {
        for (let i = 0; i < appDesktopToFolder.length; i++) {
          const desktopItemIndex = gridLayoutInfoTemp.layoutInfo.indexOf(appDesktopToFolder[i]);
          gridLayoutInfoTemp.layoutInfo.splice(desktopItemIndex, 1);
        }
        this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
        this.mPageDesktopViewModel.deleteAppItems(appDesktopToFolder);
      }

      // move apps from folder to desktop
      const appFolderToDesktop = [];
      for (let i = 0; i < removeFolderApp.length; i++) {
        let remainFlag = false;
        for (let j = 0; j < appInfos.length; j++) {
          if (appInfos[j].bundleName == removeFolderApp[i].bundleName) {
            remainFlag = true;
            break;
          }
        }
        if (!remainFlag) {
          appFolderToDesktop.push(removeFolderApp[i]);
        }
      }

      if (appFolderToDesktop.length > 0) {
        for (let i = 0; i < appFolderToDesktop.length; i++) {
          this.mPageDesktopViewModel.addToDesktop(appFolderToDesktop[i]);
        }
      }
    }
    Log.showInfo(TAG, 'updateFolderAppList end');
  }

  /**
   * Get folder list
   *
   * @param {array} folderIds.
   * @return {array} folderList.
   */
  async getFolderList(folderIds) {
    Log.showInfo(TAG, 'getFolderList start');
    const folderList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Get folder list form the layout info
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      for (let j = 0; j < folderIds.length; j++) {
        if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
          if (gridLayoutInfo.layoutInfo[i].folderId === folderIds[j]) {
            folderList.push(gridLayoutInfo.layoutInfo[i]);
          }
        }
      }
    }
    AppStorage.SetOrCreate('folderList', folderList);
    return folderList;
  }

  /**
   * Get folder app list
   *
   * @param {array} folderId.
   * @return {array} folderAppList.
   */
  async getFolderAppList(folderId) {
    Log.showInfo(TAG, 'getFolderAppList start');
    const folderAppList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Get folder app list form the layout info
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
        if (gridLayoutInfo.layoutInfo[i].folderId === folderId) {
          for (let j = 0; j < gridLayoutInfo.layoutInfo[i].layoutInfo.length; j++) {
            for (let k = 0; k < gridLayoutInfo.layoutInfo[i].layoutInfo[j].length; k++) {
              if (gridLayoutInfo.layoutInfo[i].layoutInfo[j][k].type != CommonConstants.TYPE_ADD) {
                folderAppList.push(gridLayoutInfo.layoutInfo[i].layoutInfo[j][k]);
              }
            }
          }
        }
      }
    }
    AppStorage.SetOrCreate('folderAppList', folderAppList);
    return folderAppList;
  }

  /**
   * Get all folder list
   *
   * @return {array} folderList.
   */
  async getAllFolderList() {
    Log.showInfo(TAG, 'getAllFolderList start');
    const folderList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Get folder list form the layout info
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
        folderList.push(gridLayoutInfo.layoutInfo[i]);
      }
    }
    AppStorage.SetOrCreate('allFolderList', folderList);
    return folderList;
  }

  /**
   * Get the all app list for folder
   *
   * @param {number} folderId
   *
   */
  async getFolderAddAppList(folderId) {
    Log.showInfo(TAG, 'getFolderAddAppList start');
    const allAppList = [];
    let appInfo: any;
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    const appListInfo = await this.mAppModel.getAppList();

    // first push this current app
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER
        && gridLayoutInfo.layoutInfo[i].folderId === folderId) {
        for (let j = 0; j < gridLayoutInfo.layoutInfo[i].layoutInfo.length; j++) {
          appInfo = gridLayoutInfo.layoutInfo[i].layoutInfo[j];
          for (let k = 0; k < appInfo.length; k++) {
            if (appInfo[k].type != CommonConstants.TYPE_ADD) {
              appInfo[k].checked = true;
              allAppList.push(appInfo[k]);
            }
          }
        }
        break;
      }
    }

    for (let i = 0; i < appListInfo.length; i++) {
      let isExist = false;
      for (let j = 0; j < allAppList.length; j++) {
        if (appListInfo[i].bundleName === allAppList[j].bundleName) {
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        appListInfo[i].checked = false;
        allAppList.push(appListInfo[i]);
      }
    }
    AppStorage.SetOrCreate('allAppListForFolder', allAppList);
    return allAppList;
  }

  /**
   * open folder
   *
   * @param {any} folderInfo.
   */
  addAddIcon(folderItem: any): any {
    Log.showInfo(TAG, 'addAddIcon start');

    if (folderItem.layoutInfo.length == 0) {
      return folderItem;
    }
    const lastPageItem = folderItem.layoutInfo[folderItem.layoutInfo.length - 1];
    if (lastPageItem[lastPageItem.length - 1].type === CommonConstants.TYPE_ADD) {
      return folderItem;
    }

    const openFolderConfig = this.mFolderModel.getFolderOpenLayout();
    const column = openFolderConfig.column;
    const row = openFolderConfig.row;
    const addInfo = {
      type: CommonConstants.TYPE_ADD,
      appName: $r('app.string.add'),
      bundleName: '',
      appIconId: FolderStyleConstants.DEFAULT_ADD_FOLDER_APP_IMAGE,
      appLabelId: 0
    };
    if (folderItem.layoutInfo[folderItem.layoutInfo.length - 1].length === column * row) {
      folderItem.layoutInfo.push([addInfo]);
    } else {
      folderItem.layoutInfo[folderItem.layoutInfo.length - 1].push(addInfo);
    }

    Log.showInfo(TAG, 'addAddIcon end');
    return folderItem;
  }

  /**
   * open folder
   *
   * @param {any} folderInfo.
   */
  delAddIcon(folderItem: any): any {
    Log.showInfo(TAG, 'delAddIcon start');

    if (folderItem.layoutInfo.length == 0) {
      return folderItem;
    }
    const lastPageItem = folderItem.layoutInfo[folderItem.layoutInfo.length - 1];
    if (lastPageItem[lastPageItem.length - 1].type !== CommonConstants.TYPE_ADD) {
      return folderItem;
    }
    lastPageItem.splice(lastPageItem.length - 1, 1);
    if (lastPageItem.length == 0) {
      folderItem.layoutInfo.splice(folderItem.layoutInfo.length - 1, 1);
    } else {
      folderItem.layoutInfo[folderItem.layoutInfo.length - 1] = lastPageItem;
    }

    Log.showInfo(TAG, 'delAddIcon end');
    return folderItem;
  }

  /**
   * open folder
   *
   * @param {any} folderInfo.
   */
  async openFolder(isRename: boolean, folderItem: any) {
    Log.showInfo(TAG, 'openFolder start');
    folderItem.enterEditing = isRename;

    AppStorage.SetOrCreate('openFolderData', folderItem);
    this.mPageIndex = 0;
    AppStorage.SetOrCreate('openFolderPageIndex', this.mPageIndex);
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_OPEN);
    Log.showInfo(TAG, 'openFolder end');
  }

  /**
   * close folder
   *
   */
  async closeFolder() {
    Log.showInfo(TAG, 'closeFolder start');

    this.mPageIndex = 0;
    AppStorage.SetOrCreate('openFolderPageIndex', this.mPageIndex);
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
  }

  /**
   * refresh folder data
   *
   */
  async refreshFolder(folderItem: any) {
    Log.showInfo(TAG, 'refreshFolder start');
    folderItem.enterEditing = false;
    AppStorage.SetOrCreate('openFolderData', folderItem);
    if (folderItem.folderId == '') {
      AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
    } else {
      AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_REFRESH);
    }
    Log.showInfo(TAG, 'refreshFolder end');
  }

  /**
   * Get device type
   *
   * @return {boolean} isPad.
   */
  getIsPad(): boolean {
    return this.mPageDesktopViewModel.getDevice();
  }

  /**
   * Modify folder name
   *
   * @param {any} folderModel.
   */
  modifyFolderName(folderModel) {
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER &&
        gridLayoutInfo.layoutInfo[i].folderId === folderModel.folderId) {
        gridLayoutInfo.layoutInfo[i].folderName = folderModel.folderName;
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
  }

  filterFolderPage(appInfos): any[] {
    const folderLayoutInfo = [];
    const appListInfo = JSON.parse(JSON.stringify(appInfos));
    const openFolderConfig = this.mFolderModel.getFolderOpenLayout();

    const itemCountByPage = openFolderConfig.column * openFolderConfig.row;
    let pageCount = Math.floor(appListInfo.length / itemCountByPage);
    if (appListInfo.length % itemCountByPage != 0) {
      pageCount = pageCount + 1;
    }
    Log.showInfo(TAG, `filterFolderPage pageCount: ${pageCount}`);
    for (let i = 0; i < pageCount; i++) {
      let pageInfo = [];
      if (itemCountByPage > appListInfo.length) {
        pageInfo = appListInfo.splice(0, appListInfo.length);
      } else {
        pageInfo = appListInfo.splice(0, itemCountByPage);
      }
      folderLayoutInfo.push(pageInfo);
    }
    return folderLayoutInfo;
  }

  private layoutInfoToList(folderInfo): any[] {
    let appInfo = [];
    for (let i = 0; i < folderInfo.layoutInfo.length; i++) {
      for (let j = 0; j < folderInfo.layoutInfo[i].length; j++) {
        if (folderInfo.layoutInfo[i][j].type != CommonConstants.TYPE_ADD) {
          appInfo = appInfo.concat(folderInfo.layoutInfo[i][j]);
        }
      }
    }
    return appInfo;
  }

  /**
   * Create folder info
   *
   * @return {any} folderInfo.
   */
  private async createNewFolderInfo() {
    const folderConfig = this.mFolderModel.getFolderLayout();
    const folderName = await this.generateFolderName();
    // Create new folder info
    const folderInfo = {
      folderId: this.getUUID(),
      folderName: folderName,
      layoutInfo: [],
      type: CommonConstants.TYPE_FOLDER,
      area: folderConfig.area,
      badgeNumber: 0
    };
    return folderInfo;
  }

  /**
   * Generate folder name
   *
   * @return {string} folderName.
   */
  private async generateFolderName() {
    Log.showInfo(TAG, 'generateFolderName start');
    const folderList = await this.getAllFolderList();
    let folderName: string = await ResourceManager.getInstance().getStringByIdSync($r('app.string.new_folder_name').id);
    const autoNameFolderList = folderList.filter((element, index, self) => {
      return element.folderName.startsWith(folderName) && (element.folderName.length > folderName.length);
    });

    autoNameFolderList.sort(this.mPinyinSort.sortByFolderName.bind(this.mPinyinSort));

    let nameNumber = 1;
    let tempFolderName = folderName + nameNumber;
    for (let i = 0; i < autoNameFolderList.length; i++) {
      if (autoNameFolderList[i].folderName == tempFolderName) {
        nameNumber = nameNumber + 1;
        tempFolderName = folderName + nameNumber;
      } else {
        break;
      }
    }
    folderName = folderName + nameNumber;
    return folderName;
  }

  /**
   * Generate a non duplicate ID
   * @param {string} idLength
   */
  private getUUID(): string {
    Log.showInfo(TAG, 'getUUID start');
    let id = Date.now().toString(HEXADECIMAL_VALUE);
    id += Math.random().toString(HEXADECIMAL_VALUE).substr(2);
    return id;
  }

  /**
   * Changing the Open Folder Page Number.
   *
   * @param idx: Page number
   */
  changeIndexOnly(idx) {
    this.mPageIndex = idx;
  }

  /**
   * Changing the Open Folder Page Number.
   *
   * @param idx: Page number
   */
  changeIndex(idx) {
    this.mPageIndex = idx;
    AppStorage.SetOrCreate('openFolderPageIndex', this.mPageIndex);
  }

  /**
   * Get the Open Folder Page Number.
   */
  getIndex() {
    return this.mPageIndex;
  }

  getAddListColumn(): number {
    return this.mFolderModel.getFolderAddAppLayout().column;
  }

  getDialogHeight(appList: []): number {
    let height = 0;
    const styleConfig = this.mFolderStyleConfig;
    const column = this.mFolderModel.getFolderAddAppLayout().column;
    const row  = this.mFolderModel.getFolderAddAppLayout().row;
    const num = Math.ceil(appList.length / column);
    if (num <= row) {
      height = styleConfig.mAddFolderDialogHeight;
    } else {
      const gridHeight = num * styleConfig.mAddFolderItemSize + (num - 1) * styleConfig.mAddFolderGridGap;
      height = gridHeight + FolderStyleConstants.DEFAULT_APP_ADD_TITLE_SIZE + FolderStyleConstants.DEFAULT_BUTTON_HEIGHT +
            FolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN;
      if (height > styleConfig.mAddFolderMaxHeight) {
        height = styleConfig.mAddFolderMaxHeight;
      }
    }
    return height;
  }

  /**
   * delete App from folder
   * @param bundleName
   */
  deleteAppFromFolderByUninstall(bundleName) {
    console.info('Launcher FolderViewModel deleteAppFromFolderByUninstall start');
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = gridLayoutInfo.layoutInfo;
    let changeFlag = false;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (changeFlag) {
        break;
      }
      if (layoutInfo[i].type == CommonConstants.TYPE_FOLDER) {
        const folderAppList = this.layoutInfoToList(layoutInfo[i]);
        for (let m = 0; m < folderAppList.length; m++) {
          if (folderAppList[m].bundleName == bundleName) {
            folderAppList.splice(m, 1);
            if (folderAppList.length == 1) {
              const appLayoutInfo = {
                'bundleName': folderAppList[0].bundleName,
                'type': CommonConstants.TYPE_APP,
                'area': [1, 1],
                'page': gridLayoutInfo.layoutInfo[i].page,
                'column': gridLayoutInfo.layoutInfo[i].column,
                'row': gridLayoutInfo.layoutInfo[i].row
              };
              gridLayoutInfo.layoutInfo.splice(i, 1);
              gridLayoutInfo.layoutInfo.push(appLayoutInfo);
              this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
              this.mPageDesktopViewModel.addToDesktop(folderAppList[0]);
            } else {
              gridLayoutInfo.layoutInfo[i].layoutInfo = this.filterFolderPage(folderAppList);
              this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
              this.mPageDesktopViewModel.getGridList();
            }
            changeFlag = true;
            break;
          }
        }
      }
    }
    console.info('Launcher FolderViewModel deleteAppFromFolderByUninstall end');
  }
}