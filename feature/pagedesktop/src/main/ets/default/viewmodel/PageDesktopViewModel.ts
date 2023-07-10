/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Prompt from '@ohos.promptAction';
import { Log } from '@ohos/common';
import { Trace } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { StyleConstants } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { FormManager } from '@ohos/common';
import { BadgeManager } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { BaseViewModel } from '@ohos/common';
import { SettingsModelObserver } from '@ohos/common';
import { FormListInfoCacheManager } from '@ohos/common';
import { FormModel } from '@ohos/common';
import { SettingsModel } from '@ohos/common';
import { PageDesktopModel } from '@ohos/common';
import { MenuInfo } from '@ohos/common';
import { CardItemInfo } from '@ohos/common';
import { BigFolderModel } from '@ohos/bigfolder';
import { FormDetailLayoutConfig } from '@ohos/form';
import { localEventManager } from '@ohos/common';
import PageDesktopConstants from '../common/constants/PageDesktopConstants';
import { PageDesktopGridStyleConfig } from '../common/PageDesktopGridStyleConfig';
import formHost from '@ohos.app.form.formHost';

const TAG = 'PageDesktopViewModel';
const KEY_APP_LIST = 'appListInfo';
const KEY_FORM_LIST = 'formListInfo';

export default class PageDesktopViewModel extends BaseViewModel {
  private readonly pageDesktopStyleConfig: PageDesktopGridStyleConfig = null;
  private readonly formDetailLayoutConfig: FormDetailLayoutConfig = null;
  private readonly mSettingsModel: SettingsModel;
  private readonly mFolderModel: BigFolderModel;
  private readonly mFormModel: FormModel;
  private readonly mPageDesktopModel: PageDesktopModel;
  private readonly mBadgeManager: BadgeManager;
  private readonly mFormListInfoCacheManager: FormListInfoCacheManager;
  private mBundleInfoList;
  private mHideBundleInfoList = new Array<any>();
  private mGridConfig;
  private mGridAppsInfos;
  private readonly mPageCoordinateData = {
    gridXAxis: [],
    gridYAxis: []
  };
  private isPad = false;
  private isAddByDraggingFlag = false;
  private desktopSwiperController: SwiperController;

  async showFormManager(params) {
    globalThis.createWindowWithName(windowManager.FORM_MANAGER_WINDOW_NAME, windowManager.RECENT_RANK);
  }

  setSwiperController(swiperController: SwiperController): void {
    this.desktopSwiperController = swiperController;
  }

  showNext(): void {
    this.desktopSwiperController?.showNext();
  }

  showPrevious(): void {
    this.desktopSwiperController?.showPrevious();
  }

  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
      Log.showDebug(TAG, `localEventListener receive event: ${event}, params: ${params}`);
      switch (event) {
        case EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD:
          this.addToDesktop(params);
          break;
        case EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_DELETE:
          this.deleteAppItem(params);
          break;
        case EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE:
          this.getGridList();
          break;
        case EventConstants.EVENT_BADGE_UPDATE:
          this.updateBadgeNumber(params);
          break;
        case EventConstants.EVENT_REQUEST_PAGEDESK_FORM_ITEM_ADD:
          this.createCardToDeskTop(params);
          break;
        case EventConstants.EVENT_SMARTDOCK_INIT_FINISHED:
          this.getGridList();
          break;
        case EventConstants.EVENT_REQUEST_PAGEDESK_REFRESH:
          this.pagingFiltering();
          break;
        case EventConstants.EVENT_REQUEST_FORM_ITEM_VISIBLE:
          this.notifyVisibleForms();
          break;
        default:
          if (!this.isPad) {
            Log.showDebug(TAG, 'localEventListener hideBundleInfoList!')
            this.mHideBundleInfoList = params;
            this.getGridList();
          }
          break;
      }
    }
  };

  /**
   * Notify forms on current page become visible.
   */
  notifyVisibleForms(): void {
    let pageIndex = this.mPageDesktopModel.getPageIndex();
    let formList = [];
    let items = this.mGridAppsInfos[pageIndex];
    for (let i = 0; i < items.length; i++) {
      if (items[i].typeId == CommonConstants.TYPE_CARD) {
        formList.push(String(items[i].cardId));
      }
    }
    if (formList.length > 0) {
      try {
        formHost.notifyVisibleForms(formList).then(() => {
          Log.showInfo(TAG, 'formHost notifyVisibleForms success');
        }).catch((error) => {
          Log.showInfo(TAG, 'formHost notifyVisibleForms, error:' + JSON.stringify(error));
        });
      } catch(error) {
        Log.showInfo(TAG, `catch err->${JSON.stringify(error)}`);
      }
    }
  }

  private readonly mSettingsChangeObserver: SettingsModelObserver = (event: number)=> {
    this.mGridConfig = this.getGridConfig();
    this.pagingFiltering();
  };

  private constructor() {
    super();
    this.mPageDesktopModel = PageDesktopModel.getInstance();
    this.mFolderModel = BigFolderModel.getInstance();
    this.mFormModel = FormModel.getInstance();
    this.mSettingsModel = SettingsModel.getInstance();
    this.mBadgeManager = BadgeManager.getInstance();
    this.mFormListInfoCacheManager = FormListInfoCacheManager.getInstance();
    this.mSettingsModel.forceReloadConfig();
    this.mSettingsModel.addObserver(this.mSettingsChangeObserver);
    this.onPageDesktopCreate();
    this.mGridConfig = this.getGridConfig();
    this.pageDesktopStyleConfig = layoutConfigManager.getStyleConfig(PageDesktopGridStyleConfig.APP_GRID_STYLE_CONFIG, PageDesktopConstants.FEATURE_NAME);
    this.formDetailLayoutConfig = layoutConfigManager.getStyleConfig(FormDetailLayoutConfig.FORM_LAYOUT_INFO, PageDesktopConstants.FEATURE_NAME);
  }

  /**
   * Obtains the PageDesktopViewModel instance.
   *
   * @return PageDesktopViewModel
   */
  static getInstance(): PageDesktopViewModel {
    if (globalThis.PageDesktopViewModel == null) {
      globalThis.PageDesktopViewModel = new PageDesktopViewModel();
    }
    return globalThis.PageDesktopViewModel;
  }

  /**
   * Registering Listening Events.
   */
  private onPageDesktopCreate(): void {
    this.mAppModel.registerAppListEvent();
    this.mPageDesktopModel.registerPageDesktopItemAddEvent(this.mLocalEventListener);
    this.mPageDesktopModel.registerPageDesktopBadgeUpdateEvent(this.mLocalEventListener);
  }

  /**
   * Unregistering Listening Events.
   */
  private onPageDesktopDestroy(): void {
    this.mAppModel.unregisterAppListEvent();
    this.mPageDesktopModel.unregisterEventListener(this.mLocalEventListener);
  }

  /**
   * Obtains the application list displayed on the desktop.
   */
  async getGridList() {
    const appInfoList = await this.getAppList();
    const bundleInfoListTemp = [];
    this.appendAppData(appInfoList, bundleInfoListTemp);
    const folderInfoList = await this.mFolderModel.getFolderList();
    Log.showDebug(TAG, 'getAppList folderInfoList length: ' + folderInfoList.length);
    this.appendFolderData(folderInfoList, bundleInfoListTemp);
    let formInfoList: any = this.mFormListInfoCacheManager.getCache(KEY_FORM_LIST);
    if (formInfoList == CommonConstants.INVALID_VALUE) {
      formInfoList = await this.mFormModel.getAllFormsInfoFromRdb();
      if (formInfoList && formInfoList.length > 0) {
        this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, formInfoList);
      }
    }
    this.appendFormData(formInfoList, bundleInfoListTemp);
    this.mBundleInfoList = bundleInfoListTemp;
    this.pagingFiltering();
  }

  async updateDesktopInfo(): Promise<void> {
    await this.mAppModel.getAppListAsync();
    this.getGridList();
    AppStorage.SetOrCreate('formRefresh', String(new Date()));
  }

  private async getAppList() {
    Log.showInfo(TAG, 'getAppList start');

    // get total app from system
    const totalAppInfoList = await this.mAppModel.getAppList();

    // get pageDesktop app from config
    let pageDesktopInfo = this.mSettingsModel.getAppListInfo();

    // get from config empty then init pageDesktop app
    if (!this.mSettingsModel.isAppListInfoExist() && this.ifInfoIsNull(pageDesktopInfo)) {
      for (const appInfo of totalAppInfoList) {
        pageDesktopInfo.push(appInfo);
      }
    } else {
      // remove uninstalled app
      pageDesktopInfo = pageDesktopInfo.filter(item => {
        for (const appInfo of totalAppInfoList) {
          if (item.keyName == appInfo.keyName) {
            item.appName = appInfo.appName;
            return true;
          }
        }
        return false;
      });
    }

    // product phone logic
    if (!this.isPad) {
      this.addNewInstalledInfo(totalAppInfoList, pageDesktopInfo);
      this.removeBottomBarInfo(pageDesktopInfo);
    }
    this.removeFolderInfo(pageDesktopInfo);

    // update pageDesktop app config
    this.mSettingsModel.setAppListInfo(pageDesktopInfo);
    AppStorage.SetOrCreate('isDesktopLoadFinished', true);
    return pageDesktopInfo;
  }

  /**
   * delete app in pageDesktop
   *
   * @param abilityName
   * @param bundleName
   */
  deleteAppItem(appItem: {bundleName: string | undefined, keyName: string | undefined}) {
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();
    Log.showDebug(TAG, `deleteAppItem appItem: ${JSON.stringify(appItem)}`);
    if (appItem.bundleName) {
      this.mBundleInfoList = this.mBundleInfoList.filter(item => item.bundleName !== appItem.bundleName);
    } else if(appItem.keyName) {
      this.mBundleInfoList = this.mBundleInfoList.filter(item => item.keyName !== appItem.keyName);
    }
    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);

    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = gridLayoutInfo.layoutInfo;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].typeId == CommonConstants.TYPE_APP &&
      (layoutInfo[i].bundleName == appItem.bundleName || layoutInfo[i].keyName == appItem.keyName)) {
        const page = layoutInfo[i].page;
        gridLayoutInfo.layoutInfo.splice(i, 1);
        let ret: boolean = this.mPageDesktopModel.deleteBlankPageFromLayoutInfo(gridLayoutInfo, page);
        this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
        if(ret){
          const curPageIndex = this.mPageDesktopModel.getPageIndex();
          Log.showInfo(TAG, 'deleteAppItem' + curPageIndex);
          this.mPageDesktopModel.setPageIndex(curPageIndex - 1);
        }
        break;
      }
    }
    this.getGridList();
  }

  /**
   * add app to pageDesktop
   *
   * @param appInfo
   */
  addToDesktop(appInfo) {
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();
    Log.showDebug(TAG, `addToDesktop keyName: ${appInfo.keyName} mBundleInfoList length: ${this.mBundleInfoList.length}`);
    for (let i = 0; i < this.mBundleInfoList.length; i++) {
      if (this.mBundleInfoList[i].keyName === appInfo.keyName) {
        Prompt.showToast({
          message: $r('app.string.duplicate_add')
        });
        return;
      }
    }

    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();

    // Check if app is in folder
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].typeId === CommonConstants.TYPE_FOLDER) {
        const appIndex = gridLayoutInfo.layoutInfo[i].layoutInfo[0].findIndex(item => {
          return item.keyName === appInfo.keyName;
        })
        if (appIndex != CommonConstants.INVALID_VALUE) {
          Prompt.showToast({
            message: $r('app.string.duplicate_add')
          });
          return;
        }
      }
    }

    this.mBundleInfoList.push(appInfo);
    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
    this.getGridList();
  }

  /**
   * add form to pageDesktop
   *
   * @param appInfo
   */
  addFormToDesktop(formInfo) {
    Log.showInfo(TAG, 'addFormToDesktop');
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();
    switch(formInfo.dimension) {
      case FormDimension.Dimension_1_2:
        formInfo.row = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension1X2.row;
        formInfo.column = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension1X2.column;
        formInfo.area = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension1X2.area;
        break;
      case FormDimension.Dimension_2_2:
        formInfo.row = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X2.row;
        formInfo.column = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X2.column;
        formInfo.area = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X2.area;
        break;
      case FormDimension.Dimension_2_4:
        formInfo.row = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X4.row;
        formInfo.column = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X4.column;
        formInfo.area = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X4.area;
        break;
      case FormDimension.Dimension_4_4:
        formInfo.row = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension4X4.row;
        formInfo.column = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension4X4.column;
        formInfo.area = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension4X4.area;
        break;
      default:
        break;
    }
    this.mBundleInfoList.push(formInfo);
    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
    this.getGridList();
  }

  /**
   * update badge in desktop
   *
   * @param badgeInfo
   */
  updateBadgeNumber(badgeInfo) {
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();

    let appInfo = this.mBundleInfoList.find(item => {
      return item.bundleName == badgeInfo.bundleName;
    });
    if (!this.ifInfoIsNull(appInfo)) {
      Log.showDebug(TAG, `updateBadgeNumber bundleName: ${badgeInfo.bundleName}`);
      appInfo.badgeNumber = badgeInfo.badgeNumber;
      this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
      this.getGridList();
    } else {
      Log.showDebug(TAG, 'updateBadgeNumber appInfo is null ');
      const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
      const layoutInfo = gridLayoutInfo.layoutInfo;
      let hasFound = false;
      for (let i = 0; i < layoutInfo.length; i++) {
        if (hasFound) {
          break;
        }
        if (layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER && !hasFound) {
          for (let j = 0; j < layoutInfo[i].layoutInfo.length; j++) {
            appInfo = layoutInfo[i].layoutInfo[j].find(item => {
              return item.bundleName == badgeInfo.bundleName;
            });

            if (!this.ifInfoIsNull(appInfo)) {
              hasFound = true;
              appInfo.badgeNumber = badgeInfo.badgeNumber;
              break;
            }
          }
          layoutInfo[i].badgeNumber = this.getFolderBadgeNumber(layoutInfo[i]);
        }
      }
      if (hasFound) {
        this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
        this.getGridList();
      }
    }
  }

  private getFolderBadgeNumber(folderInfo) {
    let bidfolderBadgeNumber: number = 0;
    let layoutInfo: [[]] = folderInfo.layoutInfo;
    for (var i = 0; i < layoutInfo.length; i++) {
      layoutInfo[i].forEach((item: any) => {
        if (item.badgeNumber && item.badgeNumber > 0) {
          bidfolderBadgeNumber = bidfolderBadgeNumber + item.badgeNumber;
        }
      });
    }
    return bidfolderBadgeNumber;
  }

  /**
   * add app to pageDesktop by dragging
   *
   * @param appInfo
   */
  addToDesktopByDraging(appInfo) {
    Log.showDebug(TAG, `addToDesktopByDraging bundleName: ${appInfo.bundleName}`);
    this.mGridConfig = this.mSettingsModel.getGridConfig();
    for (let i = 0; i < this.mBundleInfoList.length; i++) {
      if (this.mBundleInfoList[i].bundleName === appInfo.bundleName) {
        Prompt.showToast({
          message: $r('app.string.duplicate_add')
        });
        return;
      }
    }
    this.mBundleInfoList.push(appInfo);
    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
    this.getGridList();
  }

  /**
   * add app to dock
   *
   * @param appInfo
   */
  addToDock(appInfo) {
    this.mPageDesktopModel.sendDockItemChangeEvent(appInfo);
  }

  private appendAppData(appInfoList, bundleInfoList) {
    for (let i = 0; i < appInfoList.length; i++) {
      if (this.isInHideAppList(appInfoList[i])) {
        continue;
      }
      appInfoList[i].typeId = CommonConstants.TYPE_APP;
      appInfoList[i].area = [1, 1];
      bundleInfoList.push(appInfoList[i]);
    }
  }

  private isInHideAppList(appInfo): boolean {
    for (const hideInfo of this.mHideBundleInfoList) {
      if (appInfo.keyName == hideInfo.keyName) {
        return true;
      }
    }
    return false;
  }

  private appendFolderData(folderInfoList, bundleInfoList) {
    for (let i = 0; i < folderInfoList.length; i++) {
      for (let j = 0; j < folderInfoList[i].layoutInfo.length; j++) {
        for (let k = 0; k < folderInfoList[i].layoutInfo[j].length; k++) {
          const appIndex = bundleInfoList.findIndex(item => {
            return item.keyName === folderInfoList[i].layoutInfo[j][k].keyName;
          });
          if (appIndex != CommonConstants.INVALID_VALUE) {
            bundleInfoList.splice(appIndex, 1);
          }
        }
      }
    }
  }

  private appendFormData(formInfoList, bundleInfoList) {
    for (let i = 0; i < formInfoList.length; i++) {
      formInfoList[i].typeId = CommonConstants.TYPE_CARD;
      bundleInfoList.push(formInfoList[i]);
    }
  }

  /**
   * Obtains Grid Configuration.
   */
  getGridConfig() {
    return this.mSettingsModel.getGridConfig();
  }

  /**
   * refresh page
   */
  pagingFiltering() {
    const appInfo = {
      appGridInfo: []
    };
    const appListInfo = [];
    const info = this.getAndSetLayoutInfo();
    const layoutInfo = info.layoutInfo;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].typeId == CommonConstants.TYPE_APP) {
        for (let j = 0; j < this.mBundleInfoList.length; j++) {
          if (layoutInfo[i].keyName == this.mBundleInfoList[j].keyName
          && layoutInfo[i].typeId == this.mBundleInfoList[j].typeId) {
            this.mBundleInfoList[j].area = layoutInfo[i].area;
            this.mBundleInfoList[j].page = layoutInfo[i].page;
            this.mBundleInfoList[j].row = layoutInfo[i].row;
            this.mBundleInfoList[j].column = layoutInfo[i].column;
            this.mBundleInfoList[j].x = 0;
            appListInfo.push(this.mBundleInfoList[j]);
          }
        }
      } else if (layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER) {
        appListInfo.push(layoutInfo[i]);
      } else if (layoutInfo[i].typeId == CommonConstants.TYPE_CARD) {
        for (let j = 0; j < this.mBundleInfoList.length; j++) {
          if (layoutInfo[i].cardId == this.mBundleInfoList[j].cardId
          && layoutInfo[i].typeId == this.mBundleInfoList[j].typeId) {
            this.mBundleInfoList[j].cardId = layoutInfo[i].cardId;
            this.mBundleInfoList[j].area = layoutInfo[i].area;
            this.mBundleInfoList[j].page = layoutInfo[i].page;
            this.mBundleInfoList[j].row = layoutInfo[i].row;
            this.mBundleInfoList[j].column = layoutInfo[i].column;
            this.mBundleInfoList[j].x = 0;
            appListInfo.push(this.mBundleInfoList[j]);
          }
        }
      }
    }
    appInfo.appGridInfo = this.integrateSwiper(appListInfo);
    Log.showInfo(TAG, 'pagingFiltering appListInfo length:' + appListInfo.length);
    AppStorage.SetOrCreate('selectDesktopAppItem', '');
    AppStorage.SetOrCreate(KEY_APP_LIST, appInfo);
  }

  private integrateSwiper(list) {
    let gridAppsInfos = [];
    const allPageCount = this.mSettingsModel.getLayoutInfo().layoutDescription.pageCount;
    let max = allPageCount;
    for (let i = 0;i < list.length; i++) {
      if (max <= list[i].page + 1) {
        max = list[i].page + 1;
      }
    }

    for (let i = 0;i < max; i++) {
      gridAppsInfos.push([]);
    }

    for (let i = 0;i < list.length; i++) {
      gridAppsInfos[list[i].page].push(list[i]);
    }

    //If the workspace has no applications,
    // it needs to be initialized to [].
    if (gridAppsInfos.length == 0) {
      gridAppsInfos.push([]);
    }

    this.mGridAppsInfos = gridAppsInfos;
    return gridAppsInfos;
  }

  private getAndSetLayoutInfo() {
    let info = this.mSettingsModel.getLayoutInfo();
    const isLegal = this.ifLayoutRationality(info);
    if (isLegal) {
      info = this.updateLayoutInfo(info);
    } else {
      info = this.updateLayoutInfo(this.createNewLayoutInfo());
    }
    this.mSettingsModel.setLayoutInfo(info);
    return info;
  }

  private ifLayoutRationality(info) {
    //verify whether the info is null.
    if (this.ifInfoIsNull(info)) {
      return false;
    }
    const layoutDescription = info.layoutDescription;

    //verify whether the layoutDescription is different.
    this.mGridConfig = this.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    if (this.ifDescriptionIsDifferent(layoutDescription, row, column)) {
      return false;
    }

    //verify whether the layoutInfo's row and column is more than standard.
    if (this.ifColumnOrRowAreBigger(info.layoutInfo, row, column)) {
      return false;
    }

    //verify whether the layoutInfo's position is duplicated.
    if (this.ifDuplicatePosition(info.layoutInfo)) {
      return false;
    }
    //verify whether the layoutInfo's keyName is duplicated.
    if (this.ifDuplicateKeyName(info.layoutInfo)) {
      return false;
    }
    return true;
  };

  private ifInfoIsNull(info) {
    if (info == undefined || info == '' || info == {} || info == null) {
      return true;
    }
    return false;
  }

  private ifDescriptionIsDifferent(layoutDescription, row, column) {
    if (row != layoutDescription.row || column != layoutDescription.column) {
      return true;
    }
    return false;
  }

  private ifColumnOrRowAreBigger(layoutInfo, row, column) {
    for (let i = 0; i < layoutInfo.length; i++) {
      //column or row are bigger than legal num
      if (layoutInfo[i].column >= column || layoutInfo[i].row >= row) {
        return true;
      }
    }
    return false;
  }

  private ifDuplicatePosition(layoutInfo) {
    const mPositionInfo = [];
    for (let i = 0; i < layoutInfo.length; i++) {
      for(let j = 0; j < layoutInfo[i].area[1]; j++){
        for(let k = 0; k < layoutInfo[i].area[0]; k++){
          const position = [];
          position[0] = layoutInfo[i].page;
          position[1] = layoutInfo[i].row + j;
          position[2] = layoutInfo[i].column + k;
          mPositionInfo.push(position);
        }
      }
    }
    for (let i = 0; i < mPositionInfo.length; i++) {
      for (let j = mPositionInfo.length - 1; j > 0 && j > i; j--) {
        if (mPositionInfo[i][0] == mPositionInfo[j][0] && mPositionInfo[i][1] == mPositionInfo[j][1] && mPositionInfo[i][2] == mPositionInfo[j][2]) {
          return true;
        }

      }
    }
    return false;
  }

  private ifDuplicateKeyName(layoutInfo) {
    const count = [];
    for (let i = 0; i < layoutInfo.length; i++) {
      if (CheckEmptyUtils.isEmpty(count[layoutInfo[i].keyName])) {
        count[layoutInfo[i].keyName] = 0;
      } else if (layoutInfo[i].typeId == CommonConstants.TYPE_APP) {
        return true;
      }
    }
    return false;
  }

  private updateLayoutInfo(info) {
    let layoutInfo = info.layoutInfo;
    this.mGridConfig = this.getGridConfig();
    Log.showDebug(TAG, 'updateLayoutInfo mGridConfig:' + JSON.stringify(this.mGridConfig));
    info.layoutDescription.row = this.mGridConfig.row;
    info.layoutDescription.column = this.mGridConfig.column;
    const newApp = [];
    //Detect newly installed apps
    for (const i in this.mBundleInfoList) {
      let sign = false;
      for (const j in layoutInfo) {
        if (this.mBundleInfoList[i].typeId == layoutInfo[j].typeId
        && this.mBundleInfoList[i].typeId == CommonConstants.TYPE_APP
        && this.mBundleInfoList[i].keyName == layoutInfo[j].keyName) {
          layoutInfo[j].badgeNumber = this.mBundleInfoList[i].badgeNumber;
          sign = true;
          break;
        }
      }
      if (!sign) {
        newApp.push(this.mBundleInfoList[i]);
      }
    }

    //Detect uninstalled apps, remove all apps which have same bundleName when one app is uninstalled
    layoutInfo = layoutInfo.filter(item => {
      if (item.typeId == CommonConstants.TYPE_FOLDER || item.typeId == CommonConstants.TYPE_CARD) {
        return true;
      }
      for (const bundleInfo of this.mBundleInfoList) {
        if (item.keyName == bundleInfo.keyName) {
          return true;
        }
      }
      return false;
    })
    info.layoutInfo = layoutInfo;

    // calculate the layout of new apps
    for (let i = 0; i < newApp.length; i++) {
      if (newApp[i].typeId == CommonConstants.TYPE_APP) {
        this.mPageDesktopModel.updateAppItemLayoutInfo(info, newApp[i]);
      }
    }
    let infoOld = this.mSettingsModel.getLayoutInfo();
    for (const item of infoOld.layoutInfo) {
      if (item.typeId == CommonConstants.TYPE_APP) {
        for (const infoNew of info.layoutInfo) {
          if (item.keyName == infoNew.keyName) {
            infoNew.page = item.page;
          }
        }
      }
    }
    return info;
  }

  private createNewInfo() {
    this.mGridConfig = this.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    const layoutNum = this.mBundleInfoList.length;
    const maxPerPage = column * row;
    const pageNum = Math.ceil(layoutNum / maxPerPage);
    const newLayoutInfo = {
      layoutDescription: {},
      layoutInfo: []
    };
    newLayoutInfo.layoutDescription = {
      'pageCount': pageNum,
      'row': row,
      'column': column,
    };
    newLayoutInfo.layoutInfo = [];
    return newLayoutInfo;
  }

  private createNewLayoutInfo() {
    const info = this.mSettingsModel.getLayoutInfo();
    this.mGridConfig = this.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    const layoutNum = info.layoutInfo.length;
    const maxPerPage = column * row;
    const pageNum = Math.ceil(layoutNum / maxPerPage);
    const newLayoutInfo = {
      layoutDescription: {},
      layoutInfo: []
    };
    newLayoutInfo.layoutDescription = {
      'pageCount': info.layoutDescription.pageCount,
      'row': row,
      'column': column
    };
    if (AppStorage.Has('isPortrait') && AppStorage.Get('isPortrait')) {
      let cardInfoHorizontal: any[] = [];
      for (let i = 0; i < info.layoutInfo.length; i++) {
        if (info.layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER) {
          let tt = info.layoutInfo[i].column
          info.layoutInfo[i].column = info.layoutInfo[i].row;
          info.layoutInfo[i].row = tt;
          newLayoutInfo.layoutInfo.push(info.layoutInfo[i]);
        }
      }

      for (let i = 0; i < info.layoutInfo.length; i++) {
        if (info.layoutInfo[i].typeId == CommonConstants.TYPE_CARD) {
          if (info.layoutInfo[i].area[0] == info.layoutInfo[i].area[1]) {
            let tt = info.layoutInfo[i].column
            info.layoutInfo[i].column = info.layoutInfo[i].row;
            info.layoutInfo[i].row = tt;
            newLayoutInfo.layoutInfo.push(info.layoutInfo[i]);
          } else {
            cardInfoHorizontal.push(JSON.stringify(info.layoutInfo[i]));
            this.mPageDesktopModel.updatePageDesktopLayoutInfo(newLayoutInfo, info.layoutInfo[i]);
            newLayoutInfo.layoutInfo.push(info.layoutInfo[i]);
          }
        }
      }
      AppStorage.SetOrCreate('isPortraitCard', cardInfoHorizontal);
    }

    if (AppStorage.Has('isPortrait') && !AppStorage.Get('isPortrait')) {
      for (let i = 0; i < info.layoutInfo.length; i++) {
        if (info.layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER) {
          let tt = info.layoutInfo[i].column
          info.layoutInfo[i].column = info.layoutInfo[i].row;
          info.layoutInfo[i].row = tt;
          newLayoutInfo.layoutInfo.push(info.layoutInfo[i]);
        }
      }

      for (let i = 0; i < info.layoutInfo.length; i++) {
        if (info.layoutInfo[i].typeId == CommonConstants.TYPE_CARD) {
          if (info.layoutInfo[i].area[0] == info.layoutInfo[i].area[1]) {
            let tt = info.layoutInfo[i].column
            info.layoutInfo[i].column = info.layoutInfo[i].row;
            info.layoutInfo[i].row = tt;
            newLayoutInfo.layoutInfo.push(info.layoutInfo[i]);
          } else {
            let cardInfoOld: [] = AppStorage.Get('isPortraitCard');
            Log.showInfo(TAG, 'cardInfoOld:' + JSON.stringify(cardInfoOld));
            if (!cardInfoOld.find(item => JSON.parse(item).cardId === info.layoutInfo[i].cardId)) {
              this.mPageDesktopModel.updatePageDesktopLayoutInfo(newLayoutInfo, info.layoutInfo[i]);
              newLayoutInfo.layoutInfo.push(info.layoutInfo[i]);
            }
            for (let index = 0; index < cardInfoOld.length; index++) {
              if (!newLayoutInfo.layoutInfo.find(item => item.cardId == JSON.parse(cardInfoOld[index]).cardId)) {
                newLayoutInfo.layoutInfo.push(JSON.parse(cardInfoOld[index]));
              }
            }
          }
        }
      }
    }

    if (!AppStorage.Has('isPortrait')) {
      newLayoutInfo.layoutDescription = {
        'pageCount': pageNum,
        'row': row,
        'column': column
      };
      newLayoutInfo.layoutInfo = [];
    }

    return newLayoutInfo;
  }

  regroupDataAppListChange(callbackList) {
    this.getGridList();
  }

  /**
   * Open the app.
   *
   * @param abilityName
   * @param bundleName
   */
  openApplication(abilityName: string, bundleName: string, moduleName: string): void {
    this.jumpTo(abilityName, bundleName, moduleName);
  }

  /**
   * Open Settings.
   */
  intoSetting(): void {
    Log.showInfo(TAG, 'intoSetting');
    this.jumpToSetting();
  }

  /**
   * Get strings for addBlankPageButton.
   *
   * @return {string} AddBlankPageButton Strings.
   */
  getBlankPageBtnStr() {
    return this.isBlankPage() ? $r('app.string.delete_blank_page') : $r('app.string.add_blank_page');
  }

  /**
   * Get strings for deleteBlankPageButton.
   *
   * @return {string} AddBlankPageButton Strings.
   */
  getBlankPageBtnIcon() {
    return this.isBlankPage() ? '/common/pics/ic_public_delete.svg' : '/common/pics/ic_public_add_black.svg';
  }

  isBlankPage(): boolean {
    const curPageIndex = this.mPageDesktopModel.getPageIndex();
    // 当且仅当只有一个页面时，菜单项只允许添加
    if (this.getGridPageCount() <= 1) {
      return false;
    }
    if (CheckEmptyUtils.isEmpty(this.mGridAppsInfos) || CheckEmptyUtils.isEmpty(this.mGridAppsInfos[curPageIndex])
    || CheckEmptyUtils.isEmpty(this.mGridAppsInfos[curPageIndex].length)) {
      return true;
    }
    if (this.mGridAppsInfos[curPageIndex].length === 0) {
      return true;
    }
    return false;
  }

  /**
   * Add or delete the chosen blank page.
   */
  addOrDeleteBlankPage(): void {
    if (this.isBlankPage()) {
      this.deleteBlankPage();
    } else {
      this.addBlankPage(false);
    }
  }

  /**
   * Add a blank page.
   *
   * @param {boolean} isAddByDrag
   */
  addBlankPage(isAddByDrag: boolean): void {
    this.mPageDesktopModel.setAddByDragging(isAddByDrag);
    const allPageCount = this.mSettingsModel.getLayoutInfo().layoutDescription.pageCount + 1;
    this.setGridPageCount(allPageCount);
    this.pagingFiltering();
    this.mPageDesktopModel.setPageIndex(allPageCount - 1);
  }

  /**
   * Get pageCount.
   *
   * @return {number} PageCount.
   */
  /**
   * Get pageCount.
   *
   * @return {number} PageCount.
   */
  getGridPageCount(): number {
    return this.mSettingsModel.getLayoutInfo().layoutDescription.pageCount;
  }

  /**
   * Set pageCount.
   *
   * @param {number} pageCount - PageCount.
   */
  private setGridPageCount(pageCount: number): void {
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    gridLayoutInfo.layoutDescription.pageCount = pageCount;
    this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
  }

  /**
   * Delete the chosen blank page.
   */
  private deleteBlankPage(): void {
    const curPageIndex = this.mPageDesktopModel.getPageIndex();
    this.deleteGridPage(curPageIndex);
    if (curPageIndex === 0) {
      this.mPageDesktopModel.setPageIndex(curPageIndex);
    } else {
      this.mPageDesktopModel.setPageIndex(curPageIndex - 1);
    }
    this.setGridPageCount(this.mSettingsModel.getLayoutInfo().layoutDescription.pageCount - 1);
    this.pagingFiltering();
  }

  /**
   * Delete blank page.
   *
   * @param {number} pageIndex - Index of the page which is to be deleted.
   */
  private deleteGridPage(pageIndex: number): void {
    const info = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = info.layoutInfo;
    for (const element of layoutInfo) {
      if (element.page > pageIndex) {
        element.page = element.page - 1;
      }
    }
    info.layoutInfo = layoutInfo;
    this.mSettingsModel.setLayoutInfo(info);
  }

  /**
   * Set device type.
   *
   * @param EType: Device type
   */
  setDevice(EType): void {
    this.mSettingsModel.setDevice(EType);
    this.isPad = EType === CommonConstants.PAD_DEVICE_TYPE;
  }

  /**
   * Get device type.
   */
  getDevice(): boolean {
    return this.isPad;
  }

  buildMenuInfoList(appInfo, dialog, formDialog?, folderCallback?, openClickCallback?): MenuInfo[] {
    let menuInfoList = new Array<MenuInfo>();
    const shortcutInfo: any = this.mAppModel.getShortcutInfo(appInfo.bundleName);
    if (shortcutInfo) {
      let menu = null;
      shortcutInfo.forEach((value) => {
        menu = new MenuInfo();
        menu.menuType = CommonConstants.MENU_TYPE_DYNAMIC;
        menu.menuImgSrc = value.icon;
        menu.menuText = value.label;
        menu.shortcutIconId = value.iconId;
        menu.shortcutLabelId =  value.labelId;
        menu.bundleName = value.bundleName;
        menu.moduleName = value.moduleName;
        menu.onMenuClick = () => {
          Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
          if (openClickCallback) {
            openClickCallback();
          }
          if (AppStorage.Get('openFolderStatus') != 0) {
            AppStorage.SetOrCreate('openFolderStatus', 0);
          }
          this.jumpTo(value.wants[0].targetClass, value.wants[0].targetBundle, value.wants[0].targetModule);
        };
        value.bundleName == appInfo.bundleName && value.moduleName == appInfo.moduleName && menuInfoList.push(menu);
      });
    }

    let open = new MenuInfo();
    open.menuType = CommonConstants.MENU_TYPE_FIXED;
    open.menuImgSrc = '/common/pics/ic_public_add_norm.svg';
    open.menuText = $r('app.string.app_menu_open');
    open.onMenuClick = () => {
      if (AppStorage.Get('openFolderStatus') != 0 && AppStorage.Get('deviceType') === CommonConstants.PAD_DEVICE_TYPE) {
        AppStorage.SetOrCreate('openFolderStatus', 0);
      }
      this.setStartAppInfo()
      this.jumpTo(appInfo.abilityName, appInfo.bundleName, appInfo.moduleName);
    };
    menuInfoList.push(open);

    const formInfoList = this.mFormModel.getAppItemFormInfo(appInfo.bundleName);
    if (!CheckEmptyUtils.isEmptyArr(formInfoList)) {
      let addFormToDeskTopMenu = new MenuInfo();
      addFormToDeskTopMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
      addFormToDeskTopMenu.menuImgSrc = '/common/pics/ic_public_app.svg';
      addFormToDeskTopMenu.menuText = $r('app.string.add_form_to_desktop');
      addFormToDeskTopMenu.onMenuClick = () => {
        Log.showDebug(TAG, 'Launcher click menu item into add form to desktop view');
        const appName = this.getAppName(appInfo.appLabelId + appInfo.bundleName + appInfo.moduleName);
        if (appName != null) {
          appInfo.appName = appName;
        }
        AppStorage.SetOrCreate('formAppInfo', appInfo);
        if (!this.isPad) {
          this.showFormManager(appInfo);
        } else {
          formDialog.open();
        }
      };
      menuInfoList.push(addFormToDeskTopMenu);
    }

    if (this.isPad) {
      const addToDockMenu = new MenuInfo();
      addToDockMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
      addToDockMenu.menuImgSrc = '/common/pics/ic_public_copy.svg';
      addToDockMenu.menuText = $r('app.string.app_center_menu_add_dock');
      addToDockMenu.onMenuClick = () => {
        Log.showDebug(TAG, 'Launcher click menu item add to dock');
        const appName = this.getAppName(appInfo.appLabelId + appInfo.bundleName + appInfo.moduleName);
        if (appName != null) {
          appInfo.appName = appName;
        }
        this.addToDock(appInfo);
      };
      menuInfoList.push(addToDockMenu);
    }

    if (folderCallback) {
      const moveOutMenu = new MenuInfo();
      moveOutMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
      moveOutMenu.menuImgSrc = '/common/pics/ic_public_remove.svg';
      moveOutMenu.menuText = $r('app.string.remove_app_from_folder');
      moveOutMenu.onMenuClick = () => {
        Log.showDebug(TAG, 'Launcher click menu item remove app from folder');
        // remove app from folder
        folderCallback(appInfo);
      };
      menuInfoList.push(moveOutMenu);
    }

    const uninstallMenu = new MenuInfo();
    uninstallMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
    uninstallMenu.menuImgSrc = this.isPad ? '/common/pics/ic_public_remove.svg' : '/common/pics/ic_public_delete.svg';
    uninstallMenu.menuText = this.isPad ?  $r('app.string.delete_app') : $r('app.string.uninstall');
    uninstallMenu.onMenuClick = () => {
      Log.showDebug(TAG, 'Launcher click menu item uninstall');
      const appName = this.getAppName(appInfo.appLabelId + appInfo.bundleName + appInfo.moduleName);
      if (appName != null) {
        appInfo.appName = appName;
      }
      AppStorage.SetOrCreate('uninstallAppInfo', appInfo);
      dialog.open();
    };
    uninstallMenu.menuEnabled = appInfo.isUninstallAble;
    menuInfoList.push(uninstallMenu);
    return menuInfoList;
  }

  buildCardMenuInfoList(formInfo, dialog, formDialog): MenuInfo[] {
    const menuInfoList = new Array<MenuInfo>();
    if (!this.ifStringIsNull(formInfo.formConfigAbility)
    && formInfo.formConfigAbility.startsWith(CommonConstants.FORM_CONFIG_ABILITY_PREFIX, 0)) {
      const editForm = new MenuInfo();
      editForm.menuType = CommonConstants.MENU_TYPE_FIXED;
      editForm.menuImgSrc = '/common/pics/ic_public_edit.svg';
      editForm.menuText = $r('app.string.form_edit');
      editForm.onMenuClick = () => {
        Log.showDebug(TAG, `Launcher click menu item into form edit view:${formInfo.formConfigAbility}`);
        const abilityName = formInfo.formConfigAbility.slice(CommonConstants.FORM_CONFIG_ABILITY_PREFIX.length);
        this.jumpToForm(abilityName, formInfo.bundleName, formInfo.moduleName, formInfo.cardId);
      };
      menuInfoList.push(editForm);
    }
    const addFormToDeskTopMenu = new MenuInfo();
    addFormToDeskTopMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
    addFormToDeskTopMenu.menuImgSrc = '/common/pics/ic_public_app.svg';
    addFormToDeskTopMenu.menuText = $r('app.string.add_form_to_desktop');
    addFormToDeskTopMenu.onMenuClick = () => {
      Log.showDebug(TAG, 'Launcher click menu item into add form to desktop view');
      const appName = this.getAppName(formInfo.appLabelId + formInfo.bundleName + formInfo.moduleName);
      if (appName != null) {
        formInfo.appName = appName;
      }
      AppStorage.SetOrCreate('formAppInfo', formInfo);
      if (!this.isPad) {
        this.showFormManager(formInfo);
      } else {
        formDialog.open();
      }
    };
    menuInfoList.push(addFormToDeskTopMenu);
    const deleteFormFromDeskTop = new MenuInfo();
    deleteFormFromDeskTop.menuType = CommonConstants.MENU_TYPE_FIXED;
    deleteFormFromDeskTop.menuImgSrc = '/common/pics/ic_public_remove.svg';
    deleteFormFromDeskTop.menuText = $r('app.string.delete_form');
    deleteFormFromDeskTop.onMenuClick = () => {
      Log.showDebug(TAG, 'Launcher click menu item remove form to desktop view');
      const formAnimateData: {
        cardId: number,
        isOpenRemoveFormDialog: boolean,
      } = { cardId: formInfo.cardId, isOpenRemoveFormDialog: true };
      AppStorage.SetOrCreate('formAnimateData', formAnimateData);
      dialog.open();
    };
    menuInfoList.push(deleteFormFromDeskTop);
    return menuInfoList;
  }

  buildRenameMenuInfoList(folderItemInfo, menuCallback): MenuInfo[] {
    const menuInfoList = new Array<MenuInfo>();
    const renameMenu = new MenuInfo();
    renameMenu.menuType = CommonConstants.MENU_TYPE_DYNAMIC;
    renameMenu.menuImgSrc = StyleConstants.DEFAULT_RENAME_IMAGE;
    renameMenu.menuText = $r('app.string.rename_folder');
    renameMenu.onMenuClick = () => {
      Log.showDebug(TAG, 'Launcher click menu to rename');
      menuCallback();
    };
    menuInfoList.push(renameMenu);
    return menuInfoList;
  }

  /**
   * Get PageDesktopStyleConfig.
   */
  getPageDesktopStyleConfig() {
    return this.pageDesktopStyleConfig;
  }

  /**
   * Get workSpaceWidth.
   */
  getWorkSpaceWidth() {
    return AppStorage.Get('workSpaceWidth');
  }

  /**
   * Get workSpaceHeight.
   */
  getWorkSpaceHeight() {
    return AppStorage.Get('workSpaceHeight');
  }

  /**
   * Get getAppPageStartConfig.
   */
  getAppPageStartConfig() {
    return this.mSettingsModel.getAppPageStartConfig();
  }

  /**
   * click event
   *
   * @param abilityName ability name
   * @param bundleName bundle name
   */
  onAppClick(abilityName: string, bundleName: string, moduleName: string) {
    if (!this.isPad) {
      this.jumpTo(abilityName, bundleName, moduleName);
      return;
    }
    Log.showDebug(TAG, `onAppClick keyName ${bundleName + abilityName + moduleName}`);
    AppStorage.SetOrCreate('selectDesktopAppItem', bundleName + abilityName + moduleName);
  }

  /**
   * double click event
   *
   * @param abilityName ability name
   * @param bundleName bundle name
   */
  onAppDoubleClick(abilityName: string, bundleName: string, moduleName: string): void {
    AppStorage.SetOrCreate('selectDesktopAppItem', '');
    this.jumpTo(abilityName, bundleName, moduleName);
  }

  /**
   * other app publish card to pageDesktop
   *
   * @param parameters
   */
  async publishCardToDesktop(parameters:any) {
    Log.showDebug(TAG, 'publishCardToDesktop');
    const formItem = await FormManager.getInstance().getFormCardItemByWant(parameters);
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_FORM_ITEM_ADD, formItem);
  }

  /**
   * add card to pageDesktop
   *
   * @param appInfo
   */
  async createCardToDeskTop(formCardItem) {
    Log.showDebug(TAG, `createCardToDeskTop formCardItem id: ${formCardItem.id}`);
    const cardItemInfo = this.createNewCardItemInfo(formCardItem);

    let formInfoList: any = this.mFormListInfoCacheManager.getCache(KEY_FORM_LIST);
    if (formInfoList == CommonConstants.INVALID_VALUE) {
      formInfoList = new Array<CardItemInfo>();
    }
    formInfoList.push(cardItemInfo);
    this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, formInfoList);

    const result = await this.mFormModel.updateFormInfoById(cardItemInfo);
    if (result) {
      const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
      const cardItemLayoutInfo = {
        cardId: cardItemInfo.cardId,
        typeId: CommonConstants.TYPE_CARD,
        area: FormManager.getInstance().getCardSize(cardItemInfo.cardDimension),
        page: 0,
        row: 0,
        column: 0
      };

      const needNewPage: boolean =this.mPageDesktopModel.updatePageDesktopLayoutInfo(gridLayoutInfo, cardItemLayoutInfo);
      const curPageIndex = this.mPageDesktopModel.getPageIndex();
      if (needNewPage) {
        gridLayoutInfo.layoutDescription.pageCount = gridLayoutInfo.layoutDescription.pageCount + 1;
        for (let index = 0; index < gridLayoutInfo.layoutInfo.length; index++) {
          if (gridLayoutInfo.layoutInfo[index].page > curPageIndex) {
            gridLayoutInfo.layoutInfo[index].page++;
          }
        }
      }

      // Push card into the layoutInfo
      gridLayoutInfo.layoutInfo.push(cardItemLayoutInfo);
      this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
      if (needNewPage) {
        this.mPageDesktopModel.setPageIndex(curPageIndex + 1);
      }
    }
    this.getGridList();
  }

  /**
   * create new cardItemInfo by formItemInfo
   *
   * @param formCardItem
   */
  private createNewCardItemInfo(formCardItem): CardItemInfo {
    const cardItemInfo = new CardItemInfo();
    cardItemInfo.cardId = formCardItem.id;
    cardItemInfo.cardName = formCardItem.name;
    cardItemInfo.bundleName = formCardItem.bundleName;
    cardItemInfo.abilityName = formCardItem.abilityName;
    cardItemInfo.moduleName = formCardItem.moduleName;
    cardItemInfo.formConfigAbility = formCardItem.formConfigAbility;
    cardItemInfo.appLabelId = formCardItem.appLabelId;
    cardItemInfo.cardDimension = formCardItem.dimension;
    return cardItemInfo;
  }

  private ifStringIsNull(str): boolean {
    if (str == undefined || str == '' || str == null) {
      return true;
    }
    return false;
  }

  private addNewInstalledInfo(totalAppInfoList, pageDesktopInfo): void {
    for (const i in totalAppInfoList) {
      let hasInstalled = false;
      for (const j in pageDesktopInfo) {
        if (totalAppInfoList[i].keyName == pageDesktopInfo[j].keyName) {
          hasInstalled = true;
          break;
        }
      }
      if (!hasInstalled) {
        pageDesktopInfo.push(totalAppInfoList[i]);
      }
    }
  }

  private removeBottomBarInfo(pageDesktopInfo) {
    let bottomAppList = [];
    bottomAppList = AppStorage.Get('residentList');
    Log.showDebug(TAG, `removeBottomBarInfo bottomAppList length: ${bottomAppList.length}`);
    if (!CheckEmptyUtils.isEmptyArr(bottomAppList)) {
      for (let i = 0; i < bottomAppList.length; i++) {
        Log.showDebug(TAG, `removeBottomBarInfo bottomAppList[${i}]: ${JSON.stringify(bottomAppList[i])}`);
        const appInfo = pageDesktopInfo.find(item => {
          if (item.keyName == bottomAppList[i].keyName) {
            return true;
          }
        });
        if (!this.ifInfoIsNull(appInfo)) {
          const index = pageDesktopInfo.indexOf(appInfo);
          pageDesktopInfo.splice(index, 1);
        }
      }
    }
  }

  private removeFolderInfo(pageDesktopInfo): void {
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = gridLayoutInfo.layoutInfo;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER) {
        for (let j = 0; j < layoutInfo[i].layoutInfo.length; j++) {
          for (let k = 0; k < layoutInfo[i].layoutInfo[j].length; k++) {
            const appInfo = pageDesktopInfo.find(item => {
              if (item.keyName == layoutInfo[i].layoutInfo[j][k].keyName) {
                return true;
              }
            });
            if (!this.ifInfoIsNull(appInfo)) {
              const index = pageDesktopInfo.indexOf(appInfo);
              pageDesktopInfo.splice(index, 1);
              Log.showDebug(TAG, `removeFolderInfo keyName: ${appInfo.keyName}`);
            }
          }
        }
      }
    }
  }

  /**
   * set start app info
   */
  private setStartAppInfo() {
    AppStorage.SetOrCreate('startAppIconInfo', {
      appIconSize: 0,
      appIconHeight: 0,
      appIconPositionX: 0,
      appIconPositionY: 0
    });
  }
}