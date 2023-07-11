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

import dataRdb from '@ohos.data.rdb';
import hiSysEvent from '@ohos.hiSysEvent';
import { Log } from '../utils/Log';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import { CommonConstants } from '../constants/CommonConstants';
import RdbStoreConfig from '../configs/RdbStoreConfig';
import BadgeItemInfo from '../bean/BadgeItemInfo';
import { AppItemInfo } from '../bean/AppItemInfo';
import { DockItemInfo } from '../bean/DockItemInfo';
import { CardItemInfo } from '../bean/CardItemInfo';
import GridLayoutItemInfo from '../bean/GridLayoutItemInfo';
import GridLayoutItemBuilder from '../bean/GridLayoutItemBuilder';
import GridLayoutInfoColumns from '../bean/GridLayoutInfoColumns';
import DesktopApplicationColumns from '../bean/DesktopApplicationColumns';

const TAG = 'RdbStoreManager';

/**
 * Wrapper class for rdb interfaces.
 */
export class RdbStoreManager {
  private mRdbStore;

  private constructor() {
  }
  /**
   * db manager instance
   *
   * @return rdbStoreManager instance
   */
  static getInstance(): RdbStoreManager {
    if (globalThis.RdbStoreManagerInstance == null) {
      globalThis.RdbStoreManagerInstance = new RdbStoreManager();
    }
    return globalThis.RdbStoreManagerInstance;
  }

  async initRdbConfig(): Promise<void> {
    Log.showInfo(TAG, 'initRdbConfig start');
    await dataRdb.getRdbStore(globalThis.desktopContext, {
      name: RdbStoreConfig.DB_NAME
    }, RdbStoreConfig.DB_VERSION)
      .then((rdbStore) => {
        this.mRdbStore = rdbStore;
      })
      .catch((error) => {
        Log.showError(TAG, `initRdbConfig Failed to obtain the rdbStore. Cause: ${error.message}`);
      });
  }

  async createTable(): Promise<void> {
    Log.showDebug(TAG, 'create table start');
    try {
      await this.mRdbStore.executeSql(RdbStoreConfig.Badge.CREATE_TABLE);
      await this.mRdbStore.executeSql(RdbStoreConfig.Form.CREATE_TABLE);
      await this.mRdbStore.executeSql(RdbStoreConfig.Settings.CREATE_TABLE);
      await this.mRdbStore.executeSql(RdbStoreConfig.SmartDock.CREATE_TABLE);
      await this.mRdbStore.executeSql(RdbStoreConfig.DesktopApplicationInfo.CREATE_TABLE);
      await this.mRdbStore.executeSql(RdbStoreConfig.GridLayoutInfo.CREATE_TABLE);

      // set default settings data
      await this.updateSettings();
    } catch (error) {
      Log.showError(TAG, `create table error: ${error}`);
    }
    Log.showDebug(TAG, 'create table end');
  }

  async getAllBadge(): Promise<BadgeItemInfo[]> {
    Log.showDebug(TAG, 'getAllBadge start');
    const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.Badge.TABLE_NAME);
    const resultList: BadgeItemInfo[] = [];
    try {
      let resultSet = await this.mRdbStore.query(predicates, []);
      let isLast = resultSet.goToFirstRow();
      while (isLast) {
        const itemInfo: BadgeItemInfo = new BadgeItemInfo();
        itemInfo.id = resultSet.getLong(resultSet.getColumnIndex('id'));
        itemInfo.bundleName = resultSet.getString(resultSet.getColumnIndex('bundle_name'));
        itemInfo.badgeNumber = resultSet.getLong(resultSet.getColumnIndex('badge_number'));
        itemInfo.display = resultSet.getLong(resultSet.getColumnIndex('display'));
        itemInfo.userId = resultSet.getLong(resultSet.getColumnIndex('user_id'));
        resultList.push(itemInfo);
        isLast = resultSet.goToNextRow();
      }
      resultSet.close()
      resultSet = null;
    } catch (e) {
      Log.showError(TAG, 'getAllBadge error:' + e);
    }
    return resultList;
  }

  async getBadgeByBundle(bundleName: string): Promise<BadgeItemInfo[]> {
    Log.showDebug(TAG, 'getBadgeByBundle start');
    const resultList: BadgeItemInfo[] = [];
    if (this.ifStringIsNull(bundleName)) {
      return resultList;
    }
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.Badge.TABLE_NAME);
      predicates.equalTo('bundle_name', bundleName);
      let resultSet = await this.mRdbStore.query(predicates, []);
      let isLast = resultSet.goToFirstRow();
      while (isLast) {
        const itemInfo: BadgeItemInfo = new BadgeItemInfo();
        itemInfo.id = resultSet.getLong(resultSet.getColumnIndex('id'));
        itemInfo.bundleName = resultSet.getString(resultSet.getColumnIndex('bundle_name'));
        itemInfo.badgeNumber = resultSet.getLong(resultSet.getColumnIndex('badge_number'));
        itemInfo.display = resultSet.getLong(resultSet.getColumnIndex('display'));
        itemInfo.userId = resultSet.getLong(resultSet.getColumnIndex('user_id'));
        resultList.push(itemInfo);
        isLast = resultSet.goToNextRow();
      }
      resultSet.close()
      resultSet = null;
    } catch (e) {
      Log.showError(TAG, 'getBadgeByBundle error:' + e);
    }
    return resultList;
  }

  async updateBadgeByBundle(bundleName: string, badgeNum: number): Promise<boolean> {
    Log.showDebug(TAG, 'updateBadgeByBundle start');
    let result = false;
    if (badgeNum < 0 || this.ifStringIsNull(bundleName)) {
      return result;
    }
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.Badge.TABLE_NAME);
      predicates.equalTo('bundle_name', bundleName);
      const updateBucket = {
        'badge_number': badgeNum
      };
      let changeRows = await this.mRdbStore.update(updateBucket, predicates);
      if (changeRows == 1) {
        result = true;
      } else {
        const insertBucket = {
          'bundle_name': bundleName,
          'badge_number': badgeNum,
          'display': CommonConstants.BADGE_DISPLAY_SHOW,
          'user_id': CommonConstants.DEFAULT_USER_ID
        };
        changeRows = await this.mRdbStore.insert(RdbStoreConfig.Badge.TABLE_NAME, insertBucket);
        result = (changeRows != CommonConstants.INVALID_VALUE);
      }
    } catch (e) {
      Log.showError(TAG, 'updateBadgeByBundle error:' + e);
    }
    return result;
  }

  async deleteBadgeByBundle(bundleName: string): Promise<boolean> {
    Log.showDebug(TAG, 'deleteBadgeByBundle start');
    let result = false;
    if (this.ifStringIsNull(bundleName)) {
      return result;
    }
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.Badge.TABLE_NAME);
      predicates.equalTo('bundle_name', bundleName);
      const changeRows = await this.mRdbStore.delete(predicates);
      if (changeRows == 1) {
        result = true;
      }
    } catch (e) {
      Log.showError(TAG, 'deleteBadgeByBundle error:' + e);
    }
    return result;
  }

  /**
   * get all forms info form rdb
   *
   * @param cardId = CommonConstants.INVALID_VALUE
   * @return Array<CardItemInfo> resultList
   */
  async getAllFormInfos(cardId = CommonConstants.INVALID_VALUE): Promise<CardItemInfo[]> {
    Log.showDebug(TAG, 'getAllFormInfos start');
    const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.Form.TABLE_NAME);
    if (cardId != CommonConstants.INVALID_VALUE) {
      predicates.equalTo('card_id', cardId);
    }
    const resultList: CardItemInfo[] = [];
    try {
      let resultSet = await this.mRdbStore.query(predicates, []);
      let isLast = resultSet.goToFirstRow();
      while (isLast) {
        const itemInfo: CardItemInfo = new CardItemInfo();
        itemInfo.cardId = resultSet.getLong(resultSet.getColumnIndex('card_id'));
        itemInfo.cardName = resultSet.getString(resultSet.getColumnIndex('card_name'));
        itemInfo.bundleName = resultSet.getString(resultSet.getColumnIndex('bundle_name'));
        itemInfo.abilityName = resultSet.getString(resultSet.getColumnIndex('ability_name'));
        itemInfo.moduleName = resultSet.getString(resultSet.getColumnIndex('module_name'));
        itemInfo.formConfigAbility = resultSet.getString(resultSet.getColumnIndex('config_ability'));
        itemInfo.appLabelId = resultSet.getLong(resultSet.getColumnIndex('app_label_id'));
        itemInfo.cardDimension = resultSet.getLong(resultSet.getColumnIndex('dimension'));
        resultList.push(itemInfo);
        isLast = resultSet.goToNextRow();
      }
      resultSet.close()
      resultSet = null;
    } catch (e) {
      Log.showError(TAG, 'getAllFormInfos error:' + e);
    }
    return resultList;
  }

  /**
   * get forms info form rdb by cardId
   *
   * @param cardId = CommonConstants.INVALID_VALUE
   * @return Array<CardItemInfo> resultList
   */
  async getFormInfoById(cardId: number): Promise<CardItemInfo[]> {
    Log.showDebug(TAG, 'getFormInfoById start');
    const resultList: CardItemInfo[] = await this.getAllFormInfos(cardId);
    return resultList;
  }

  async updateFormInfoById(cardItemInfo: CardItemInfo): Promise<boolean> {
    Log.showDebug(TAG, 'updateFormInfoById start');
    let result = false;
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.Form.TABLE_NAME);
      predicates.equalTo('card_id', cardItemInfo.cardId);
      const updateBucket = {
        'card_name': cardItemInfo.cardName,
        'bundle_name': cardItemInfo.bundleName,
        'ability_name': cardItemInfo.abilityName,
        'module_name': cardItemInfo.moduleName,
        'config_ability': cardItemInfo.formConfigAbility,
        'app_label_id': cardItemInfo.appLabelId,
        'dimension': cardItemInfo.cardDimension,
      };
      let changeRows = await this.mRdbStore.update(updateBucket, predicates);
      if (changeRows == 1) {
        result = true;
      } else {
        const insertBucket = {
          'card_id': cardItemInfo.cardId,
          'card_name': cardItemInfo.cardName,
          'bundle_name': cardItemInfo.bundleName,
          'ability_name': cardItemInfo.abilityName,
          'module_name': cardItemInfo.moduleName,
          'config_ability': cardItemInfo.formConfigAbility,
          'app_label_id': cardItemInfo.appLabelId,
          'dimension': cardItemInfo.cardDimension,
        };
        changeRows = await this.mRdbStore.insert(RdbStoreConfig.Form.TABLE_NAME, insertBucket);
        result = (changeRows != CommonConstants.INVALID_VALUE);
      }
    } catch (e) {
      Log.showError(TAG, 'updateFormInfoById error:' + e);
    }
    return result;
  }

  async deleteFormInfoById(cardId: number): Promise<boolean> {
    Log.showDebug(TAG, 'deleteFormInfoById start');
    let result = false;
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.Form.TABLE_NAME);
      predicates.equalTo('card_id', cardId);
      const changeRows = await this.mRdbStore.delete(predicates);
      if (changeRows == 1) {
        result = true;
      }
    } catch (e) {
      Log.showError(TAG, 'deleteFormInfoById error:' + e);
    }
    return result;
  }

  async deleteFormInfoByBundle(bundleName: string): Promise<boolean> {
    Log.showDebug(TAG, 'deleteFormInfoByBundle start');
    let result = false;
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.Form.TABLE_NAME);
      predicates.equalTo('bundle_name', bundleName);
      const changeRows = await this.mRdbStore.delete(predicates);
      if (changeRows == 1) {
        result = true;
      }
    } catch (e) {
      Log.showError(TAG, 'deleteFormInfoByBundle error:' + e);
    }
    return result;
  }

  private ifStringIsNull(str: string | null | undefined): boolean {
    if (str == undefined || str == '' || str == null) {
      return true;
    }
    return false;
  }

  async updateSettings(key?: string, value?: any): Promise<boolean> {
    Log.showDebug(TAG, 'updateSettings start');
    let result = false;
    try {
      // get deviceType
      let deviceType = AppStorage.Get('deviceType');

      // init default settings config
      if (CheckEmptyUtils.isEmpty(key) || CheckEmptyUtils.isEmpty(value)) {
        const firstDbData = {
          'app_start_page_type': 'Grid',
          'grid_config': 0,
          'device_type': deviceType,
          'page_count': 1,
          'row': 5,
          'column': 11
        };
        // insert sql
        let ret = await this.mRdbStore.insert(RdbStoreConfig.Settings.TABLE_NAME, firstDbData);
      } else {
        // update settings by key and value
        let sql = `UPDATE ${RdbStoreConfig.Settings.TABLE_NAME} SET ${key} = '${value}' WHERE id = 1`;
        await this.mRdbStore.executeSql(sql)
      }
    } catch (e) {
      Log.showError(TAG, 'updateSettings error:' + e);
    }
    return result;
  }

  async insertIntoSmartdock(dockInfoList: DockItemInfo[]): Promise<boolean> {
    Log.showDebug(TAG, 'insertIntoSmartdock start');
    let result = false;
    try {
      // delete smartdock table
      await this.deleteTable(RdbStoreConfig.SmartDock.TABLE_NAME);

      // insert into smartdock
      for (let i in dockInfoList) {
        let smartdockDbItem = {
          'item_type': dockInfoList[i].itemType,
          'editable': this.booleanToNumber(dockInfoList[i].editable),
          'bundle_name': dockInfoList[i].bundleName,
          'ability_name': dockInfoList[i].abilityName,
          'module_name': dockInfoList[i].moduleName,
          'app_icon_id': dockInfoList[i].appIconId,
          'app_label_id': dockInfoList[i].appLabelId,
          'app_name': dockInfoList[i].appName,
          'is_system_app': this.booleanToNumber(dockInfoList[i].isSystemApp),
          'is_uninstallAble': this.booleanToNumber(dockInfoList[i].isUninstallAble),
          'key_name': dockInfoList[i].keyName,
          'install_time': dockInfoList[i].installTime
        }
        let ret = await this.mRdbStore.insert(RdbStoreConfig.SmartDock.TABLE_NAME, smartdockDbItem);
      }
    } catch (e) {
      Log.showError(TAG, 'insertIntoSmartdock error:' + e);
      this.sendFaultEvent();
    }
    return result;
  }

  /**
   * 1.clear table content
   * 2.updata table
   *
   * @param tableName
   */
  async deleteTable(tableName: string): Promise<void> {
    Log.showDebug(TAG, 'deleteTable start');
    try {
      let detelSql = `DELETE FROM ${tableName};`
      let detelSequenceSql = `UPDATE sqlite_sequence SET seq=0 WHERE name = '${tableName}';`
      await this.mRdbStore.executeSql(detelSql, function () {})
      await this.mRdbStore.executeSql(detelSequenceSql, function () {})
    } catch (e) {
      Log.showError(TAG, `deleteTable err: ${e}`);
    }
  }

  /**
   * 1.deleta table
   * 2.create table
   *
   * @param tableName
   */
  async dropTable(tableName: string): Promise<void> {
    Log.showDebug(TAG, 'dropTable start');
    try {
      let dropSql = `DROP TABLE IF EXISTS ${tableName}`;
      await this.mRdbStore.executeSql(dropSql);
      await this.mRdbStore.executeSql(RdbStoreConfig.GridLayoutInfo.CREATE_TABLE);
    } catch (e) {
      Log.showError(TAG, `dropTable err: ${e}`);
    }
  }

  async querySmartDock(): Promise<DockItemInfo[]> {
    const resultList: DockItemInfo[] = [];
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.SmartDock.TABLE_NAME);
      let resultSet = await this.mRdbStore.query(predicates, []);
      let isLast = resultSet.goToFirstRow();
      while (isLast) {
        const itemInfo: DockItemInfo = new DockItemInfo();
        itemInfo.itemType = resultSet.getLong(resultSet.getColumnIndex('item_type'));
        itemInfo.editable = this.numberToBoolean(resultSet.getLong(resultSet.getColumnIndex('editable')));
        itemInfo.bundleName = resultSet.getString(resultSet.getColumnIndex('bundle_name'));
        itemInfo.abilityName = resultSet.getString(resultSet.getColumnIndex('ability_name'));
        itemInfo.moduleName = resultSet.getString(resultSet.getColumnIndex('module_name'));
        itemInfo.appIconId = resultSet.getLong(resultSet.getColumnIndex('app_icon_id'));
        itemInfo.appLabelId = resultSet.getLong(resultSet.getColumnIndex('app_label_id'));
        itemInfo.appName = resultSet.getString(resultSet.getColumnIndex('app_name'));
        itemInfo.installTime = resultSet.getString(resultSet.getColumnIndex('install_time'));
        itemInfo.isSystemApp = this.numberToBoolean(resultSet.getLong(resultSet.getColumnIndex('is_system_app')));
        itemInfo.isUninstallAble = this.numberToBoolean(resultSet.getLong(resultSet.getColumnIndex('is_uninstallAble')));
        itemInfo.keyName = resultSet.getString(resultSet.getColumnIndex('key_name'));
        resultList.push(itemInfo);
        isLast = resultSet.goToNextRow();
      }
      resultSet.close()
      resultSet = null;
    } catch (e) {
      Log.showError(TAG, 'querySmartDock error:' + e);
    }
    return resultList;
  }

  async insertDesktopApplication(desktopApplicationInfo: any): Promise<boolean> {
    Log.showDebug(TAG, 'insertDesktopApplication start');
    let result: boolean = true;
    if (CheckEmptyUtils.isEmptyArr(desktopApplicationInfo)) {
      Log.showError(TAG, 'insertDesktopApplication desktopApplicationInfo is empty');
      result = false;
      return result;
    }
    try {
      this.mRdbStore.beginTransaction();
      // delete desktopApplicationInfo table
      await this.deleteTable(RdbStoreConfig.DesktopApplicationInfo.TABLE_NAME);
      // insert into desktopApplicationInfo
      for (let i in desktopApplicationInfo) {
        let element = desktopApplicationInfo[i];
        let item = {
          'app_name': element.appName,
          'is_system_app': element.isSystemApp ? 1 : 0,
          'is_uninstallAble': element.isUninstallAble ? 1 : 0,
          'badge_number':element.badgeNumber,
          'appIcon_id': element.appIconId,
          'appLabel_id': element.appLabelId,
          'bundle_name': element.bundleName,
          'module_name': element.moduleName,
          'ability_name': element.abilityName,
          'key_name': element.bundleName + element.abilityName + element.moduleName,
          'install_time': element.installTime
        }
        this.mRdbStore.insert(RdbStoreConfig.DesktopApplicationInfo.TABLE_NAME, item)
          .then((ret) => {
            if (ret === -1) {
              result = false;
            }
          });
      }
      this.mRdbStore.commit();
    } catch (e) {
      Log.showError(TAG, 'insertDesktopApplication error:' + e);
      this.mRdbStore.rollBack();
      this.sendFaultEvent();
    }
    return result;
  }

  sendFaultEvent(){
    const sysEventInfo = {
      domain: 'LAUNCHER_APP',
      name: 'LAUNCHER_FAULT',
      eventType: hiSysEvent.EventType.FAULT,
      params: {
        'FAULT_ID': 'ICON_LOST',
        'MSG': 'read or write rdb fault',
      }
    };
    hiSysEvent.write(sysEventInfo,
      (err, value) => {
        if (err) {
          Log.showError(TAG, `launcher fault hiSysEvent write error: ${err.code}`);
        }
      })
  }

  async queryDesktopApplication(): Promise<AppItemInfo[]> {
    const resultList: AppItemInfo[] = [];
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.DesktopApplicationInfo.TABLE_NAME);
      let resultSet = await this.mRdbStore.query(predicates, []);
      let isLast = resultSet.goToFirstRow();
      while (isLast) {
        let appItemInfo: AppItemInfo = new AppItemInfo();
        appItemInfo.appName = resultSet.getString(resultSet.getColumnIndex(DesktopApplicationColumns.APP_NAME));
        appItemInfo.isSystemApp = resultSet.getLong(resultSet.getColumnIndex(DesktopApplicationColumns.IS_SYSTEM_APP)) > 0 ? true : false;
        appItemInfo.isUninstallAble = resultSet.getLong(resultSet.getColumnIndex(DesktopApplicationColumns.IS_UNINSTALLABLE)) > 0 ? true : false;
        appItemInfo.appIconId = resultSet.getLong(resultSet.getColumnIndex(DesktopApplicationColumns.APPICON_ID));
        appItemInfo.appLabelId = resultSet.getLong(resultSet.getColumnIndex(DesktopApplicationColumns.APPLABEL_ID));
        appItemInfo.badgeNumber = resultSet.getLong(resultSet.getColumnIndex(DesktopApplicationColumns.BADGE_NUMBER));
        appItemInfo.bundleName = resultSet.getString(resultSet.getColumnIndex(DesktopApplicationColumns.BUNDLE_NAME));
        appItemInfo.abilityName = resultSet.getString(resultSet.getColumnIndex(DesktopApplicationColumns.ABILITY_NAME));
        appItemInfo.moduleName = resultSet.getString(resultSet.getColumnIndex(DesktopApplicationColumns.MODULE_NAME));
        appItemInfo.keyName = resultSet.getString(resultSet.getColumnIndex(DesktopApplicationColumns.KEY_NAME));
        appItemInfo.installTime = resultSet.getString(resultSet.getColumnIndex(DesktopApplicationColumns.INSTALL_TIME));
        resultList.push(appItemInfo);
        isLast = resultSet.goToNextRow();
      }
      resultSet.close()
      resultSet = null;
    } catch (e) {
      Log.showError(TAG, 'queryDesktopApplication error:' + e);
    }
    return resultList;
  }

  async insertGridLayoutInfo(gridlayoutinfo: any): Promise<void> {
    Log.showDebug(TAG, 'insertGridLayoutInfo start');
    if (CheckEmptyUtils.isEmpty(gridlayoutinfo) || CheckEmptyUtils.isEmptyArr(gridlayoutinfo.layoutInfo)) {
      Log.showError(TAG, 'insertGridLayoutInfo gridlayoutinfo is empty');
      return;
    }

    try {
      // delete gridlayoutinfo table
      await this.dropTable(RdbStoreConfig.GridLayoutInfo.TABLE_NAME);
      // insert into gridlayoutinfo
      let layoutinfo: any[] = gridlayoutinfo.layoutInfo;
      for (let i in layoutinfo) {
        let element = layoutinfo[i];
        let item = {};
        if (element.typeId === CommonConstants.TYPE_APP) {
          item = {
            'bundle_name': element.bundleName,
            'ability_name': element.abilityName,
            'module_name': element.moduleName,
            'key_name': element.bundleName + element.abilityName + element.moduleName,
            'type_id': element.typeId,
            'area': element.area[0] + ',' + element.area[1],
            'page': element.page,
            'column': element.column,
            'row': element.row,
            'container': -100,
            'badge_number': element.badgeNumber
          }

          let ret = await this.mRdbStore.insert(RdbStoreConfig.GridLayoutInfo.TABLE_NAME, item);

        } else if (element.typeId === CommonConstants.TYPE_CARD) {
          item = {
            'bundle_name':element.bundleName,
            'ability_name': element.abilityName,
            'module_name': element.moduleName,
            'key_name': "" + element.cardId,
            'card_id': element.cardId,
            'type_id': element.typeId,
            'area': element.area[0] + ',' + element.area[1],
            'page': element.page,
            'column': element.column,
            'row': element.row,
            'container': -100,
            'badge_number': element.badgeNumber
          }
          await this.mRdbStore.insert(RdbStoreConfig.GridLayoutInfo.TABLE_NAME, item);
        } else {
          item = {
            'bundle_name':element.bundleName,
            'ability_name': element.abilityName,
            'module_name': element.moduleName,
            'folder_id': element.folderId,
            'folder_name': element.folderName,
            'type_id': element.typeId,
            'area': element.area[0] + ',' + element.area[1],
            'page': element.page,
            'column': element.column,
            'row': element.row,
            'container': -100,
            'badge_number': element.badgeNumber
          }
          Log.showDebug(TAG, `element prev: ${JSON.stringify(element)}`);
          let ret: number = await this.mRdbStore.insert(RdbStoreConfig.GridLayoutInfo.TABLE_NAME, item);
          if (ret > 0) {
            await this.insertLayoutInfo(element.layoutInfo, ret);
          }
        }
      }
    } catch (e) {
      Log.showError(TAG, 'insertGridLayoutInfo error:' + e);
      this.sendFaultEvent();
    }
  }

  private async insertLayoutInfo(layoutInfo: [[]], container: number): Promise<boolean> {
    Log.showDebug(TAG, 'insertLayoutInfo start');
    let result: boolean = true;
    if (CheckEmptyUtils.isEmptyArr(layoutInfo)) {
      Log.showError(TAG, 'insertLayoutInfo layoutInfo is empty');
      result = false;
      return result;
    }
    for (var i in layoutInfo) {
      let curItem = layoutInfo[i];
      for (let j in curItem) {
        let bigFolderApp: any = curItem[j];
        let item = {
          'container': container,
          'app_name': bigFolderApp.appName,
          'is_system_app': bigFolderApp.isSystemApp ? 1 : 0,
          'is_uninstallAble': bigFolderApp.isUninstallAble ? 1 : 0,
          'appIcon_id': bigFolderApp.appIconId,
          'appLabel_id': bigFolderApp.appLabelId,
          'bundle_name': bigFolderApp.bundleName,
          'module_name': bigFolderApp.moduleName,
          'ability_name': bigFolderApp.abilityName,
          'key_name': bigFolderApp.bundleName + bigFolderApp.abilityName + bigFolderApp.moduleName,
          'install_time': bigFolderApp.installTime,
          'type_id': bigFolderApp.typeId,
          'area': bigFolderApp.area[0] + ',' + bigFolderApp.area[1],
          'page': bigFolderApp.page,
          'column': bigFolderApp.column,
          'row': bigFolderApp.row,
          'badge_number': bigFolderApp.badgeNumber
        }
        let ret: number = await this.mRdbStore.insert(RdbStoreConfig.GridLayoutInfo.TABLE_NAME, item);
        if (ret === -1) {
          result = false;
        }
      }
    }
    return result;
  }

  async queryGridLayoutInfo(): Promise<GridLayoutItemInfo[]> {
    const resultList: GridLayoutItemInfo[] = [];
    try {
      const predicates = new dataRdb.RdbPredicates(RdbStoreConfig.GridLayoutInfo.TABLE_NAME);
      predicates.equalTo(GridLayoutInfoColumns.CONTAINER, -100);
      let resultSet = await this.mRdbStore.query(predicates, []);
      let isLast = resultSet.goToFirstRow();
      while (isLast) {
        let typeId: number = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.TYPE_ID));
        const builder: GridLayoutItemBuilder = GridLayoutItemBuilder.fromResultSet(resultSet);
        if (typeId === CommonConstants.TYPE_FOLDER) {
          let id = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.ID));
          let layoutInfo:AppItemInfo[] = await this.queryLayoutInfo(id);
          builder.setLayoutInfo(layoutInfo);
        }
        resultList.push(builder.buildGridLayoutItem());
        isLast = resultSet.goToNextRow();
      }
      resultSet.close()
      resultSet = null;
    } catch (e) {
      Log.showError(TAG, 'queryGridLayoutInfo error:' + e);
    }
    return resultList;
  }

  private async queryLayoutInfo(container: number): Promise<AppItemInfo[]> {
    const resultList: AppItemInfo[] = [];
    try {
      let layoutPredicates = new dataRdb.RdbPredicates(RdbStoreConfig.GridLayoutInfo.TABLE_NAME);
      layoutPredicates.equalTo("container", container);
      let columns = [GridLayoutInfoColumns.APP_NAME,
      GridLayoutInfoColumns.IS_SYSTEM_APP,
      GridLayoutInfoColumns.IS_UNINSTALLABLE,
      GridLayoutInfoColumns.APPICON_ID,
      GridLayoutInfoColumns.APPLABEL_ID,
      GridLayoutInfoColumns.BUNDLE_NAME,
      GridLayoutInfoColumns.ABILITY_NAME,
      GridLayoutInfoColumns.MODULE_NAME,
      GridLayoutInfoColumns.KEY_NAME,
      GridLayoutInfoColumns.CONTAINER,
      GridLayoutInfoColumns.TYPE_ID,
      GridLayoutInfoColumns.AREA,
      GridLayoutInfoColumns.PAGE,
      GridLayoutInfoColumns.COLUMN,
      GridLayoutInfoColumns.ROW];
      let resultSet = await this.mRdbStore.query(layoutPredicates, columns);
      let isLast = resultSet.goToFirstRow();
      while (isLast) {
        const itemInfo: AppItemInfo = GridLayoutItemBuilder.buildLayout(resultSet);
        resultList.push(itemInfo);
        isLast = resultSet.goToNextRow();
      }
      resultSet.close()
      resultSet = null;
    } catch (e) {
      Log.showError(TAG, 'queryLayoutInfo error:' + e);
    }
    return resultList;
  }

  booleanToNumber(data: boolean): number {
    return data ? 1 : 0;
  }

  numberToBoolean(data: number): boolean {
    return data === 1;
  }

}