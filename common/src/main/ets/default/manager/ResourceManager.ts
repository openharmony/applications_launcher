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

import { Log } from '../utils/Log';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import AppResourceCacheManager from '../cache/AppResourceCacheManager';

const KEY_ICON = 'icon';
const KEY_NAME = 'name';
const TAG = 'ResourceManager';

/**
 * Wrapper class for resourceManager interfaces.
 */
export class ResourceManager {
  private constructor() {
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
    try {
      let cacheKey = `${iconId}${bundleName}${moduleName}`;
      const iconBase64 = this.getAppResourceCache(cacheKey, KEY_ICON);
      if (!CheckEmptyUtils.isEmpty(iconBase64)) {
        return;
      }
      Log.showDebug(TAG, `updateIconCache bundleName:${bundleName}, moduleName:${moduleName}, iconId: ${iconId}`);
      let moduleContext = globalThis.desktopContext.createModuleContext(bundleName, moduleName);
      if (moduleContext == null) {
        return;
      }
      await moduleContext.resourceManager
        .getMediaBase64(iconId)
        .then((value)=> {
          if (value != null) {
            this.setAppResourceCache(cacheKey, KEY_ICON, value);
          }
        })
        .finally(() => {
          moduleContext = null;
        });
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

  async getAppNameSync(labelId, bundleName: string, moduleName:string, appName: string) {
    if (CheckEmptyUtils.isEmpty(labelId) || labelId <= 0 || CheckEmptyUtils.checkStrIsEmpty(bundleName)) {
      Log.showDebug(TAG, `getAppNameSync param empty! appName: ${appName}`);
      return appName;
    } else {
      const cacheKey = `${labelId}${bundleName}${moduleName}`;
      let resMgrName = null;
      if (this.isResourceManagerEmpty()) {
        return appName;
      }
      Log.showDebug(TAG, `getAppNameSync bundleName:${bundleName}, moduleName:${moduleName}, iconId:${labelId}`);
      let moduleContext = globalThis.desktopContext.createModuleContext(bundleName, moduleName);
      await moduleContext.resourceManager
        .getString(labelId)
        .then((res) => {
          resMgrName = res;
        })
        .catch((err) => {
          Log.showError(TAG, `getAppNameSync getString error: ${JSON.stringify(err)}`);
        })
        .finally(() => {
          moduleContext = null;
        });
      if (resMgrName != null) {
        return resMgrName;
      } else {
        return appName;
      }
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

  async getStringByResource(res: Resource): Promise<string>{
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
}