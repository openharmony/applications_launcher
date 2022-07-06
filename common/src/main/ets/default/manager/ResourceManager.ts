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

import AppResourceCacheManager from '../cache/AppResourceCacheManager';
import CheckEmptyUtils from '../utils/CheckEmptyUtils';
import Log from '../utils/Log';

const KEY_ICON = 'icon';
const KEY_NAME = 'name';
const TAG = 'ResourceManager';

/**
 * Wrapper class for resourceManager interfaces.
 */
export default class ResourceManager {
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

  getCachedAppIcon(iconId, bundleName: string) {
    const cacheKey = `${iconId}${bundleName}`;
    return this.getAppResourceCacheManager().getCache(cacheKey, KEY_ICON);
  }

  setAppResourceCache(cacheKey: string, cacheType: string, value: object | string) {
    this.getAppResourceCacheManager().setCache(cacheKey, cacheType, value);
  }

  deleteAppResourceCache(cacheKey: string, cacheType: string): void {
    this.getAppResourceCacheManager().deleteCache(cacheKey, cacheType);
  }

  async updateIconCache(iconId, bundleName: string): Promise<void> {
    try {
      let cacheKey = `${iconId}${bundleName}`;
      const iconBase64 = this.getAppResourceCache(cacheKey, KEY_ICON);
      if (!CheckEmptyUtils.isEmpty(iconBase64)) {
        return;
      }
      const bundleContext = globalThis.desktopContext.createBundleContext(bundleName);
      if (bundleContext == null) {
        return;
      }
      await bundleContext.resourceManager.getMediaBase64(iconId).then((value)=> {
        if (value != null) {
          this.setAppResourceCache(cacheKey, KEY_ICON, value);
        }
      });
    } catch (error) {
      Log.showError(TAG, `updateIconCache error ${error}`);
    }
  }

  getAppIconWithCache(iconId, bundleName: string, callback, defaultAppIcon) {
    if (CheckEmptyUtils.isEmpty(iconId) || iconId <= 0) {
      Log.showInfo(TAG, 'getAppIconWithCache iconId > ' + defaultAppIcon);
      callback(defaultAppIcon);
    } else {
      const cacheKey = iconId + bundleName;
      const iconBase64 = this.getAppResourceCache(cacheKey, KEY_ICON);
      if (CheckEmptyUtils.isEmpty(iconBase64)) {
        if (this.isResourceManagerEmpty()) {
          Log.showError(TAG, 'getAppIconWithCache resourceManager is empty');
          callback(defaultAppIcon);
          return;
        }
        try {
          const bundleContext = globalThis.desktopContext.createBundleContext(bundleName);
          bundleContext.resourceManager.getMediaBase64(iconId).then((value: string)=> {
            Log.showInfo(TAG, `getAppIconWithCache getMediaBase64 value> ${value}`);
            if (value != null) {
              this.setAppResourceCache(cacheKey, KEY_ICON, value);
              callback(value);
            }
            else {
              callback(defaultAppIcon);
            }
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

  async getAppNameSync(labelId, bundleName: string, appName: string) {
    if (CheckEmptyUtils.isEmpty(labelId) || labelId <= 0 || CheckEmptyUtils.checkStrIsEmpty(bundleName)) {
      Log.showInfo(TAG, `getAppNameSync param empty! appName: ${appName}`);
      return appName;
    } else {
      const cacheKey = labelId + bundleName;
      Log.showInfo(TAG, `getAppNameSync getResourceManager cacheKey: ${cacheKey}`);
      let resMgrName = null;
      if (this.isResourceManagerEmpty()) {
        Log.showError(TAG, 'getAppNameSync resourceManager is empty');
        return appName;
      }
      const bundleContext = globalThis.desktopContext.createBundleContext(bundleName);
      await bundleContext.resourceManager.getString(labelId)
        .then((res) => {
          Log.showInfo(TAG, `getAppNameSync getString res: ${JSON.stringify(res)}`);
          resMgrName = res;
        })
        .catch((err) => {
          Log.showInfo(TAG, `getAppNameSync getString error: ${JSON.stringify(err)}`);
        });
      Log.showInfo(TAG, `getAppNameSync resMgrName: ${JSON.stringify(resMgrName)}`);
      if (resMgrName != null) {
        return resMgrName;
      } else {
        return appName;
      }
    }
  }

  getAppNameWithCache(labelId: number, bundleName: string, appName: string, callback) {
    if (CheckEmptyUtils.isEmpty(labelId) || labelId <= 0) {
      Log.showInfo(TAG, `getAppNameWithCache ResourceManager getAppName callback：${appName}`);
      callback(appName);
    } else {
      const cacheKey = labelId + bundleName;
      const name = this.getAppResourceCache(cacheKey, KEY_NAME);
      if (CheckEmptyUtils.isEmpty(name)) {
        if (this.isResourceManagerEmpty()) {
          Log.showError(TAG, 'getAppNameWithCache resourceManager is empty');
          return appName;
        }
        try {
          const bundleContext = globalThis.desktopContext.createBundleContext(bundleName);
          bundleContext.resourceManager.getString(labelId).then( (value) => {
            if (CheckEmptyUtils.checkStrIsEmpty(value)) {
              Log.showError(TAG, '`getAppNameWithCache getAppName getString ERROR! value is empty id ${labelId}`');
              callback(appName);
            } else {
              this.setAppResourceCache(cacheKey, KEY_NAME, value);
              callback(value);
            }
          });
        } catch (err) {
          Log.showError(TAG, 'getAppNameWithCache error');
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
      Log.showInfo(TAG, 'resourceManager is empty');
      callback('');
      return;
    }
    try {
      globalThis.desktopContext.resourceManager.getString(resId).then((value) => {
        if (CheckEmptyUtils.checkStrIsEmpty(value)) {
          Log.showInfo(TAG, 'getStringById ERROR! value is empty:' + resId);
        }
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
      Log.showInfo(TAG, `getStringByIdSync: ${resId}`);
      return resMgrName;
    } else {
      if (this.isResourceManagerEmpty()) {
        Log.showError(TAG, 'getStringByIdSync resourceManager is empty');
        return resMgrName;
      }
      try {
        resMgrName = await globalThis.desktopContext.resourceManager.getString(resId);
      } catch (err) {
        Log.showError(TAG, `getStringByIdSync error: ${JSON.stringify(err)}`);
      }
      Log.showInfo(TAG, `getStringByIdSync resMgrName: ${resMgrName}`);
      return resMgrName;
    }
  }
}