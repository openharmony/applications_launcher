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

import { ShortcutInfo } from 'bundle/shortcutInfo';
import AppListPresenter from './AppListPresenter';

/**
 * AppGridPresenter
 */
export default class AppGridPresenter extends AppListPresenter {
  private static sAppGridPresenter: AppGridPresenter = null;

  private constructor() {
    super();
  }

  /**
   * 获取实例
   */
  static getInstance(): AppGridPresenter {
    if (AppGridPresenter.sAppGridPresenter == null) {
      AppGridPresenter.sAppGridPresenter = new AppGridPresenter();
    }
    return AppGridPresenter.sAppGridPresenter;
  }

  /**
   * 注册监听事件
   */
  registerAppListChange() {
    this.registerAppListChangeCallback();
    this.mAppModel.registerAppListEvent();
  }

  /**
   * 反注册监听事件
   */
  unregisterAppListChange() {
    this.unregisterAppListChangeCallback();
    this.mAppModel.unregisterAppListEvent();
  }

  /**
   * 通过bundleName获取shortcut信息
   */
  getShortcutInfo(bundleName: string): ShortcutInfo[] | undefined {
    return this.mAppModel.getShortcutInfo(bundleName);
  }
}