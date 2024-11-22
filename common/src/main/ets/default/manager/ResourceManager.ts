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

import resourceManager from '@ohos.resourceManager';
import { Log } from '../utils/Log';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import AppResourceCacheManager from '../cache/AppResourceCacheManager';
import { DrawableDescriptor, LayeredDrawableDescriptor } from '@ohos.arkui.drawableDescriptor';
import image from '@ohos.multimedia.image';

const KEY_ICON = 'icon';
const KEY_NAME = 'name';
const TAG = 'ResourceManager';

/**
 * Wrapper class for resourceManager interfaces.
 */
export class ResourceManager {
  private fontWeightRegular: string;
  private fontWeightMedium: string;

  private constructor() {
    this.getStringByIdSync($r('sys.string.ohos_id_text_font_family_regular').id).then(value => {
      this.fontWeightRegular = value;
    });
    this.getStringByIdSync($r('sys.string.ohos_id_text_font_family_medium').id).then(value => {
      this.fontWeightMedium = value;
    });
  }

  static getInstance(): ResourceManager {
    if (globalThis.ResourceManager == null) {
      globalThis.ResourceManager = new ResourceManager();
    }
    return globalThis.ResourceManager;
  }

  private getAppResourceCacheManager(): AppResourceCacheManager {
    if (globalThis.AppResourceCacheManager == null) {
      globalThis.AppResourceCacheManager = new AppResourceCacheManager();
    }
    return globalThis.AppResourceCacheManager;
  }

  getCachedAppIcon(iconId, bundleName: string, moduleName: string) {
    const cacheKey = `${iconId}${bundleName}${moduleName}`;
    return this.getAppResourceCacheManager().getCache(cacheKey, KEY_ICON);
  }

  setAppResourceCache(cacheKey: string, cacheType: string, value: object | string): void {
    this.getAppResourceCacheManager().setCache(cacheKey, cacheType, value);
  }

  deleteAppResourceCache(cacheKey: string, cacheType: string): void {
    this.getAppResourceCacheManager().deleteCache(cacheKey, cacheType);
  }

  async updateIconCache(iconId, bundleName: string, moduleName: string): Promise<void> {
    let cacheKey = `${iconId}${bundleName}${moduleName}`;
    const iconBase64 = this.getAppResourceCache(cacheKey, KEY_ICON);
    if (!CheckEmptyUtils.isEmpty(iconBase64)) {
      return;
    }
    Log.showDebug(TAG, `updateIconCache bundleName:${bundleName}, moduleName:${moduleName}, iconId: ${iconId}`);
    try {
      // 先拿分层图标，拿不到再取普通图标
      let resMgr: resourceManager.ResourceManager = globalThis.desktopContext.createModuleResourceManager(bundleName, moduleName);
      let imageDescriptor: DrawableDescriptor = (resMgr.getDrawableDescriptor(Number(iconId), undefined));
      let value: image.PixelMap = imageDescriptor.getPixelMap();
      if (imageDescriptor instanceof LayeredDrawableDescriptor) {
        Log.showDebug(TAG, `updateIconCache layered iconValue:${JSON.stringify(value)}`);
        this.setAppResourceCache(cacheKey, KEY_ICON, value);
      } else {
        let moduleContext = globalThis.desktopContext.createModuleContext(bundleName, moduleName);
        if (moduleContext == null) {
          return;
        }
        await moduleContext.resourceManager
          .getMediaBase64(iconId)
          .then((value) => {
            Log.showDebug(TAG, `updateIconCache iconValue:${value}`);
            if (value != null) {
              this.setAppResourceCache(cacheKey, KEY_ICON, value);
            }
          }).finally(() => {
            moduleContext = null;
          });
      }
    } catch (error) {
      Log.showError(TAG, `updateIconCache error ${error}`);
    }
  }

  getAppIconWithCache(iconId, bundleName: string, moduleName: string, callback, defaultAppIcon) {
    if (CheckEmptyUtils.isEmpty(iconId) || iconId <= 0) {
      Log.showDebug(TAG, 'getAppIconWithCache defaultAppIcon');
      callback(defaultAppIcon);
    } else {
      const cacheKey = `${iconId}${bundleName}${moduleName}`;
      const iconBase64 = this.getAppResourceCache(cacheKey, KEY_ICON);
      if (CheckEmptyUtils.isEmpty(iconBase64)) {
        if (this.isResourceManagerEmpty()) {
          Log.showError(TAG, 'getAppIconWithCache resourceManager is empty');
          callback(defaultAppIcon);
          return;
        }
        try {
          Log.showDebug(TAG, `getAppIconWithCache bundleName:${bundleName}, moduleName:${moduleName}, iconId:${iconId}`);
          let moduleContext = globalThis.desktopContext.createModuleContext(bundleName, moduleName);
          moduleContext.resourceManager
            .getMediaBase64(iconId)
            .then((value: string)=> {
              if (value != null) {
                this.setAppResourceCache(cacheKey, KEY_ICON, value);
                callback(value);
              }
              else {
                callback(defaultAppIcon);
              }
            })
            .finally(() => {
              moduleContext = null;
            });
        } catch (error) {
          Log.showError(TAG, `getAppIconWithCache error ${error}`);
          callback(defaultAppIcon);
        }
      } else {
        callback(iconBase64);
      }
    }
  }

  async getAppNameSync(labelId, bundleName: string, moduleName:string, appName: string): Promise<string> {
    if (CheckEmptyUtils.isEmpty(labelId) || labelId <= 0 ||
    CheckEmptyUtils.checkStrIsEmpty(bundleName) || this.isResourceManagerEmpty()) {
      Log.showDebug(TAG, `getAppNameSync param empty! appName: ${appName}`);
      return appName;
    }
    const cacheKey = `${labelId}${bundleName}${moduleName}`;
    let resMgrName = null;
    let moduleContext = null;
    Log.showDebug(TAG, `getAppNameSync bundleName:${bundleName}, moduleName:${moduleName}, iconId:${labelId}`);
    try {
      moduleContext = globalThis.desktopContext.createModuleContext(bundleName, moduleName);
      resMgrName = await moduleContext.resourceManager.getString(labelId);
    } catch (error) {
      resMgrName = null;
      Log.showError(TAG, `getAppNameSync getString error: ${JSON.stringify(error)}`);
    } finally {
      moduleContext = null;
    };
    if (resMgrName != null) {
      this.setAppResourceCache(cacheKey, KEY_NAME, resMgrName);
      return resMgrName;
    } else {
      return appName;
    }
  }

  getAppNameWithCache(labelId: number, bundleName: string, moduleName: string, appName: string, callback) {
    if (CheckEmptyUtils.isEmpty(labelId) || labelId <= 0) {
      Log.showDebug(TAG, `getAppNameWithCache ResourceManager getAppName callback: ${appName}`);
      callback(appName);
    } else {
      const cacheKey = `${labelId}${bundleName}${moduleName}`;
      const name = this.getAppResourceCache(cacheKey, KEY_NAME);
      if (CheckEmptyUtils.isEmpty(name)) {
        if (this.isResourceManagerEmpty()) {
          return appName;
        }
        try {
          Log.showDebug(TAG, `getAppNameWithCache bundleName:${bundleName}, moduleName:${moduleName}, iconId:${labelId}`);
          let moduleContext = globalThis.desktopContext.createModuleContext(bundleName, moduleName);
          moduleContext.resourceManager
            .getString(labelId)
            .then((value) => {
              if (CheckEmptyUtils.checkStrIsEmpty(value)) {
                Log.showDebug(TAG, `getAppNameWithCache getAppName getString ERROR! value is empty id ${labelId}`);
                callback(appName);
              } else {
                this.setAppResourceCache(cacheKey, KEY_NAME, value);
                callback(value);
              }
            })
            .finally(() => {
              moduleContext = null;
            });
        } catch (err) {
          Log.showError(TAG, `getAppNameWithCache error: ${JSON.stringify(err)}`);
          callback(appName);
        }
      } else {
        callback(name);
      }
    }
  }

  /**
     * Get app resource cache.
     *
     * @param {string} cacheKey
     * @param {string} cacheType
     */
  getAppResourceCache(cacheKey, cacheType) {
    return this.getAppResourceCacheManager().getCache(cacheKey, cacheType);
  }

  /**
   * get string by resource.id.
   *
   * @param {number} resource.id
   * @param {function} callback(value)
   */
  getStringById(resId: number, callback: (value: string) => void): void {
    if (this.isResourceManagerEmpty()) {
      Log.showDebug(TAG, 'resourceManager is empty');
      callback('');
      return;
    }
    try {
      globalThis.desktopContext.resourceManager.getString(resId).then((value) => {
        callback(value);
      });
    } catch (err) {
      Log.showError(TAG, `getStringById error: ${JSON.stringify(err)}`);
      callback('');
    }
  }

  private isResourceManagerEmpty(): boolean {
    return CheckEmptyUtils.isEmpty(globalThis.desktopContext)
    || CheckEmptyUtils.isEmpty(globalThis.desktopContext.resourceManager);
  }

  async getStringByResource(res: resourceManager.Resource): Promise<string>{
    const json = JSON.parse(JSON.stringify(res));
    const id = json.id;
    return await this.getStringByIdSync(id);
  }

  /**
   * get string by resource.id.
   *
   * @param {number} resource.id
   * @return {string} resource name
   */
  async getStringByIdSync(resId: number): Promise<string> {
    let resMgrName = '';
    if (resId <= 0) {
      return resMgrName;
    } else {
      if (this.isResourceManagerEmpty()) {
        return resMgrName;
      }
      try {
        resMgrName = await globalThis.desktopContext.resourceManager.getString(resId);
      } catch (err) {
        Log.showError(TAG, `getStringByIdSync error: ${JSON.stringify(err)}`);
      }
      return resMgrName;
    }
  }

  clearAppResourceCache(): void {
    this.getAppResourceCacheManager().clearCache();
  }

  /**
   * get number by resource
   *
   * @param {Resource} resource
   * @return {number} resource name
   */
  getNumberByResource(res: Resource): number {
    const json = JSON.parse(JSON.stringify(res));
    const id: number = json.id;
    return this.getNumberById(id);
  }

  /**
   * get number by resource.id.
   *
   * @param {number} resource.id
   * @return {number} resource name
   */
  getNumberById(resId: number): number {
    let resMgrName = 0;
    if (resId <= 0) {
      Log.showInfo(TAG, `getNumberById resId: ${resId}`);
      return resMgrName;
    } else {
      if (this.isResourceManagerEmpty()) {
        Log.showInfo(TAG, 'getNumberById resourceManager is empty');
        return resMgrName;
      }
      try {
        resMgrName = globalThis.desktopContext.resourceManager.getNumber(resId);
      } catch (err) {
        Log.showError(TAG, `getNumberById error: ${JSON.stringify(err)}`);
      }
      Log.showInfo(TAG, `getNumberById resMgrName: ${resMgrName}`);
      return resMgrName;
    }
  }

  getFontWeightRegular(): string {
    return this.fontWeightRegular;
  }

  getFontWeightMedium(): string {
    return this.fontWeightMedium;
  }
}