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

import FormManager from '../manager/FormManager';
import LocalEventManager from '../manager/LocalEventManager';
import RdbStoreManager from '../manager/RdbStoreManager';
import EventConstants from '../constants/EventConstants';
import CardItemInfo from '../bean/CardItemInfo';
import FormListInfoCacheManager from '../cache/FormListInfoCacheManager';
import CommonConstants from '../constants/CommonConstants';
import SettingsModel from './SettingsModel';
import Log from '../utils/Log';

const TAG = 'FormModel';
const KEY_FORM_LIST = 'formListInfo';

/**
 * form model.
 */
export default class FormModel {
  private readonly mRdbStoreManager: RdbStoreManager;
  private readonly mFormManager: FormManager;
  private readonly mFormListInfoCacheManager: FormListInfoCacheManager;
  private readonly mAppItemFormInfoMap = new Map<string, CardItemInfo[]>();

  private constructor() {
    Log.showInfo(TAG, 'constructor start');
    this.mRdbStoreManager = RdbStoreManager.getInstance();
    this.mFormManager = FormManager.getInstance();
    this.mFormListInfoCacheManager = FormListInfoCacheManager.getInstance();
  }

  /**
   * Get the form model object.
   *
   * @return {object} form model singleton
   */
  static getInstance(): FormModel {
    if (globalThis.FormModelInstance == null) {
      globalThis.FormModelInstance = new FormModel();
    }
    return globalThis.FormModelInstance;
  }

  /**
   * Register the form card change event listener.
   *
   * @param listener
   */
  registerJumpToFormViewEvent(listener): void {
    LocalEventManager.registerEventListener(listener, [
      EventConstants.EVENT_REQUEST_JUMP_TO_FORM_VIEW
    ]);
  }

  /**
   * Unregister event listener.
   *
   * @param listener
   */
  unregisterEventListener(listener): void {
    LocalEventManager.unregisterEventListener(listener);
  }

  /**
   * Send the event of jump to form manager view.
   *
   * @param {array} formViewInfo
   */
  sendJumpFormViewEvent(formViewInfo): void {
    LocalEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_JUMP_TO_FORM_VIEW, formViewInfo);
  }

  /**
   * Get the form info list of all ohos applications on the device.
   *
   * @return {array} allFormList
   */
  async getAllFormsInfo() {
    Log.showInfo(TAG, 'getAllFormsInfo start');
    const allFormList = await this.mFormManager.getAllFormsInfo();
    return allFormList;
  }

  /**
   * Get the form info list of all ohos applications on the device by bundle name.
   *
   * @param {array} bundleName
   * @param {function | undefined} callback
   *
   * @return {array} currentBundleFormsInfo
   */
  async getFormsInfoByBundleName(bundleName: string, callback?) {
    Log.showInfo(TAG, `getFormsInfoByBundleName bundleName: ${bundleName}`);
    let currentBundleFormsInfo: any;
    await this.mFormManager.getFormsInfoByApp(bundleName)
      .then(bundleFormsInfo => {
        Log.showInfo(TAG, `getFormsInfoByBundleName bundleFormsInfo: ${JSON.stringify(bundleFormsInfo)}`);
        currentBundleFormsInfo = bundleFormsInfo;
        if (callback != undefined) {
          callback(bundleName, bundleFormsInfo);
        }
      })
      .catch(err => {
        Log.showError(TAG, `getFormsInfoByBundleName err: ${JSON.stringify(err)}`);
      });
    AppStorage.SetOrCreate('formMgrItem', currentBundleFormsInfo);
    return currentBundleFormsInfo;
  }

  /**
   * Get the form info list of all ohos applications on the device by module name.
   *
   * @param {string} bundleName
   * @param {string} moduleName
   *
   * @return {array} currentModuleFormsInfo
   */
  async getFormsInfoByModuleName(bundleName: string, moduleName: string) {
    Log.showInfo(TAG, `getFormsInfoByModuleName bundleName: ${bundleName}, moduleName: ${moduleName}`);
    const currentModuleFormsInfo = await this.mFormManager.getFormsInfoByModule(bundleName, moduleName);
    return currentModuleFormsInfo;
  }

  /**
   * Get the form info list from rdb.
   *
   * @return {array} allFormList
   */
  async getAllFormsInfoFromRdb() {
    Log.showInfo(TAG, 'getAllFormsInfoFromRdb start');
    const allFormList = await this.mRdbStoreManager.getAllFormInfos();
    return allFormList;
  }

  /**
   * Update the form info in rdb by id.
   *
   * @param {object} cardItemInfo
   *
   * @return {boolean} result
   */
  async updateFormInfoById(cardItemInfo) {
    return await this.mRdbStoreManager.updateFormInfoById(cardItemInfo);
  }

  /**
   * Delete form in rdb and fms by id.
   *
   * @param {number} cardId
   */
  deleteFormById(cardId: number) {
    this.mRdbStoreManager.deleteFormInfoById(cardId);
    this.mFormManager.deleteCard(cardId.toString());
  }

  /**
   * Delete form in fms by formId.
   *
   * @param {number} formId
   */
  deleteFormByFormID(formId: number) {
    this.mFormManager.deleteCard(formId.toString());
  }

  /**
   * Set app item form info into map.
   *
   * @param {string} bundleName
   * @param {array} appItemFormInfo
   */
  setAppItemFormInfo(bundleName: string, appItemFormInfo: CardItemInfo[]): void {
    this.mAppItemFormInfoMap.set(bundleName, appItemFormInfo);
  }

  /**
   * Get app item form info from map.
   *
   * @param {string} bundleName
   *
   * @return {array | undefined} mAppItemFormInfoMap
   */
  getAppItemFormInfo(bundleName: string): CardItemInfo[] | undefined {
    Log.showInfo(TAG, `getAppItemFormInfo bundleName: ${bundleName},
      appItemFormInfo: ${JSON.stringify(this.mAppItemFormInfoMap.get(bundleName))}`);
    return this.mAppItemFormInfoMap.get(bundleName);
  }

  /**
   * Update app item form info into map.
   *
   * @param {string} bundleName
   * @param {string | undefined} eventType
   */
  updateAppItemFormInfo(bundleName: string, eventType?: string): void {
    if (eventType && eventType === EventConstants.EVENT_PACKAGE_REMOVED) {
      this.mAppItemFormInfoMap.delete(bundleName);
      return;
    }
    const formsInfoList = this.getFormsInfoByBundleName(bundleName, this.setAppItemFormInfo.bind(this));
  }

  /**
   * Delete form by bundleName and update layout info.
   *
   * @param {string} bundleName
   */
  deleteFormByBundleName(bundleName: string): void {
    const settingsModel = SettingsModel.getInstance();
    this.mRdbStoreManager.deleteFormInfoByBundle(bundleName);
    const formInfoList: any = this.mFormListInfoCacheManager.getCache(KEY_FORM_LIST);
    if (formInfoList === CommonConstants.INVALID_VALUE) {
      return;
    }
    const layoutInfo = settingsModel.getLayoutInfo();
    const tempFormInfoList = JSON.parse(JSON.stringify(formInfoList));
    const pageItemMap = new Map<string, number>();
    for (let i = 0; i < layoutInfo.layoutInfo.length; i++) {
      const tmpPage = layoutInfo.layoutInfo[i].page.toString();
      if (pageItemMap.has(tmpPage)) {
        pageItemMap.set(tmpPage, pageItemMap.get(tmpPage) + 1);
      } else {
        pageItemMap.set(tmpPage, 1);
      }
    }
    for(let i = formInfoList.length - 1; i >= 0; i--) {
      const formInfo = formInfoList[i];
      if (formInfo.bundleName === bundleName) {
        tempFormInfoList.splice(i, 1);
        for(let j = layoutInfo.layoutInfo.length - 1; j >= 0; j--) {
          if (layoutInfo.layoutInfo[j].typeId === CommonConstants.TYPE_CARD && formInfo.cardId == layoutInfo.layoutInfo[j].cardId) {
            const tmpPage = layoutInfo.layoutInfo[j].page.toString();
            pageItemMap.set(tmpPage, pageItemMap.get(tmpPage) - 1);
            layoutInfo.layoutInfo.splice(j, 1);
            break;
          }
        }
      }
    }
    if (tempFormInfoList.length === 0) {
      this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, null);
    } else {
      this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, tempFormInfoList);
    }

    this.updateBlankPage(pageItemMap, layoutInfo);
    settingsModel.setLayoutInfo(layoutInfo);
  }

  /**
   * update page number if blank page is exist
   *
   * @param pageItemMap
   * @param layoutInfo
   */
  private updateBlankPage(pageItemMap, layoutInfo): void {
    const blankPages = [];
    for (let [page, count] of pageItemMap) {
      if (count === 0) {
        layoutInfo.layoutDescription.pageCount--;
        blankPages.push(page);
      }
    }
    for (let m = 0; m < layoutInfo.layoutInfo.length; m++) {
      let pageMinus = 0;
      for (let n = 0; n < blankPages.length; n++) {
        if (layoutInfo.layoutInfo[m].page > blankPages[n]) {
          pageMinus++;
        }
      }
      if (pageMinus != 0) {
        layoutInfo.layoutInfo[m].page = layoutInfo.layoutInfo[m].page - pageMinus;
      }
    }
  }

}