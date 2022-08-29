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

import { ShortcutInfo } from 'bundle/shortcutInfo';
import { AppListViewModel } from './AppListViewModel';

const TAG = 'AppGridViewModel';

/**
 * AppGridViewModel
 */
export class AppGridViewModel extends AppListViewModel {
  private constructor() {
    super();
  }

  /**
   * get instance
   */
  static getInstance(): AppGridViewModel {
    if (globalThis.AppGridViewModel == null) {
      globalThis.AppGridViewModel = new AppGridViewModel();
    }
    return globalThis.AppGridViewModel;
  }

  /**
   * Register to listen to events
   */
  registerAppListChange() {
    this.registerAppListChangeCallback();
  }

  /**
   * Unregister listener events
   */
  unregisterAppListChange() {
    this.unregisterAppListChangeCallback();
  }

  registerEventListener() {
    this.onAppListViewCreate();
  }

  unregisterEventListener() {
    this.onAppListViewDestroy();
  }

  /**
   * Get shortcut information by bundleName
   */
  getShortcutInfo(bundleName: string): ShortcutInfo[] | undefined {
    return this.mAppModel.getShortcutInfo(bundleName);
  }
}