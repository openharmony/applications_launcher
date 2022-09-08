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

import LruCache from './LruCache';
import { Log } from '../utils/Log';
import { CommonConstants } from '../constants/CommonConstants';

const TAG = 'AppListInfoCacheManager';

/**
 * A Manager class that provides get/set/clear cache methods for app list data.
 */
export default class AppListInfoCacheManager {
  private readonly lruCache;

  constructor() {
    this.lruCache = new LruCache();
  }

  /**
   * Get cache from disk or memory.
   *
   * @param {string} key - key of the cache map
   * @return {object} - cache get from the memory or disk
   */
  getCache(key: string): any {
    Log.showDebug(TAG, `getCache key: ${key}`);
    const cache = this.lruCache.getCache(key);
    if (cache == undefined || cache == null || cache == '' || cache == -1) {
      return CommonConstants.INVALID_VALUE;
    } else {
      return cache;
    }
  }

  /**
   * Set cache to disk or memory.
   *
   * @param {string} key - key of the cache map
   * @param {object} value - value of the cache map
   */
  setCache(key, value): void {
    Log.showDebug(TAG, `setCache key: ${key}, value: ${value}`);
    this.lruCache.putCache(key, value);
  }

  /**
   * Clear cache of both disk and memory.
   */
  clearCache(): void {
    Log.showDebug(TAG, 'clearCache');
    this.lruCache.clear();
  }
}