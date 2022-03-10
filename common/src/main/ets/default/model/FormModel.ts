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

import FormManager from '../manager/FormManager';
import LocalEventManager from '../manager/LocalEventManager';
import RdbStoreManager from '../manager/RdbStoreManager';
import EventConstants from '../constants/EventConstants';
import CardItemInfo from '../bean/CardItemInfo';
import FormListInfoCacheManager from '../cache/FormListInfoCacheManager';
import CommonConstants from '../constants/CommonConstants';
import SettingsModel from './SettingsModel';

const KEY_FORM_LIST = 'formListInfo';

/**
 * form model
 */
export default class FormModel {
  private readonly mRdbStoreManager: RdbStoreManager;
  private readonly mFormManager: FormManager;
  private readonly mFormListInfoCacheManager: FormListInfoCacheManager;
  private readonly appItemFormInfoMap = new Map<string, CardItemInfo[]>();

  private constructor() {
    this.mRdbStoreManager = RdbStoreManager.getInstance();
    this.mFormManager = FormManager.getInstance();
    this.mFormListInfoCacheManager = FormListInfoCacheManager.getInstance();
  }

  static getInstance() {
    if (globalThis.FormModelInstance == null) {
      globalThis.FormModelInstance = new FormModel();
    }
    return globalThis.FormModelInstance;
  }

  /**
  * Register the form card change event
  *
  * @param listener object
   */
  registerJumpToFormViewEvent(listener) {
    LocalEventManager.registerEventListener(listener, [
      EventConstants.EVENT_REQUEST_JUMP_TO_FORM_VIEW
    ]);
  }

  /**
  * Unregister event listener
  *
  * @param listener object
   */
  unregisterEventListener(listener) {
    LocalEventManager.unregisterEventListener(listener);
  }

  sendJumpFormViewEvent(formViewInfo) {
    LocalEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_JUMP_TO_FORM_VIEW, formViewInfo);
  }

  /**
   * Obtains the FormInfo objects provided by all ohos applications on the device.
   */
  async getAllFormsInfo() {
    console.info('Launcher FormModel getAllFormsInfo');
    const allFormList = await this.mFormManager.getAllFormsInfo();
    return allFormList;
  }

  /**
   * Obtains the FormInfo objects provided by a specified application module on the device.
   */
  async getFormsInfoByBundleName(bundleName: string, callback?) {
    console.info('Launcher FormModel getFormsInfoByBundleName bundleName:'+ bundleName);
    let currentBundleFormsInfo: any;
    await this.mFormManager.getFormsInfoByApp(bundleName)
      .then(bundleFormsInfo => {
        console.info('Launcher FormModel getFormsInfoByBundleName currentBundleFormsInfo: ' + bundleFormsInfo);
        currentBundleFormsInfo = bundleFormsInfo;
        if (callback != undefined) {
          callback(bundleName, bundleFormsInfo);
        }

      })
      .catch(err => {
        console.error('Launcher FormModel getFormsInfoByBundleName err:' + err);
      });
    AppStorage.SetOrCreate('formMgrItem', currentBundleFormsInfo);
    return currentBundleFormsInfo;
  }

  /**
   * Obtains the FormInfo objects provided by a specified application module on the device.
   */
  async getFormsInfoByModuleName(bundleName: string, moduleName: string) {
    console.info('Launcher FormModel getFormsInfoByModuleName bundleName:' + bundleName + ', moduleName:' + moduleName);
    const currentModuleFormsInfo = await this.mFormManager.getFormsInfoByModule(bundleName, moduleName);
    return currentModuleFormsInfo;
  }

  /**
   * Obtains the FormInfo objects from launcher
   */
  async getAllFormsInfoFromRdb() {
    console.info('Launcher FormModel getAllFormsInfoFromRdb');
    const allFormList = await this.mRdbStoreManager.getAllFormInfos();
    return allFormList;
  }

  /**
   * update the FormInfo objects to launcher
   * @param cardItemInfo
   */
  async updateFormInfoById(cardItemInfo) {
    return await this.mRdbStoreManager.updateFormInfoById(cardItemInfo);
  }

  /**
   * delete form by id
   * @param cardId
   */
  deleteFormById(cardId: number) {
    this.mRdbStoreManager.deleteFormInfoById(cardId);
    this.mFormManager.deleteCard(cardId.toString());
  }

  /**
   * delete form by formId
   * @param formId
   */
  deleteFormByFormID(formId: number) {
    this.mFormManager.deleteCard(formId.toString());
  }

  /**
   * set app item formInfo
   * @param bundleName
   */
  setAppItemFormInfo(bundleName: string, appItemFormInfo: CardItemInfo[]) {
    this.appItemFormInfoMap.set(bundleName, appItemFormInfo);
  }

  /**
   * get app item formInfo
   * @param bundleName
   */
  getAppItemFormInfo(bundleName: string): CardItemInfo[] | undefined {
    console.info('Launcher AppModel getShortcutInfo bundleName: ' + bundleName + ',shortcutInfo: ' +
    JSON.stringify(this.appItemFormInfoMap.get(bundleName)));
    return this.appItemFormInfoMap.get(bundleName);
  }

  /**
   * update app item formInfo
   * @param bundleName
   */
  updateAppItemFormInfo(bundleName, eventType?) {
    if (eventType && eventType == EventConstants.EVENT_PACKAGE_REMOVED) {
      this.appItemFormInfoMap.delete(bundleName);
      return;
    }
    const formsInfoList = this.getFormsInfoByBundleName(bundleName, this.setAppItemFormInfo.bind(this));
  }

  /**
   * delete form by bundleName
   * @param bundleName
   */
  deleteFormByBundleName(bundleName) {
    const settingsModel = SettingsModel.getInstance();

    this.mRdbStoreManager.deleteFormInfoByBundle(bundleName);

    const formInfoList: any = this.mFormListInfoCacheManager.getCache(KEY_FORM_LIST);
    if (formInfoList == CommonConstants.INVALID_VALUE) {
      return;
    }

    const layoutInfo = settingsModel.getLayoutInfo();
    const tempFormInfoList = JSON.parse(JSON.stringify(formInfoList));
    for(let i = 0; i < formInfoList.length; i++) {
      const formInfo = formInfoList[i];
      if (formInfo.bundleName == bundleName){
        tempFormInfoList.splice(i, 1);
      }

      for(let j = layoutInfo.layoutInfo.length - 1; j >= 0; j--) {
        if (layoutInfo.layoutInfo[j].type === CommonConstants.TYPE_CARD && formInfo.cardId == layoutInfo.layoutInfo[j].cardId) {
          layoutInfo.layoutInfo.splice(j, 1);
          break;
        }
      }
    }
    settingsModel.setLayoutInfo(layoutInfo);
    if (tempFormInfoList.length == 0) {
      this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, null);
    } else {
      this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, tempFormInfoList);
    }
  }
}