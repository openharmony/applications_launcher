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

import { ResourceManager } from '@ohos/common';
import { RecentsStyleConstants } from '../constants/RecentsStyleConstants';
import { RecentMissionsViewModel } from '../../viewmodel/RecentMissionsViewModel';

const TAG = 'Recent-RecentMissionAppIcon';

/**
 * App icon component for recent missions.
 */
@Component
export default struct RecentMissionAppIcon {
  @State iconSize: number = 0;
  @State @Watch("updateIcon") appIcon: string = '';
  @State bundleName: string = '';
  @State moduleName: string = '';
  @State labelId: string = '';
  @State icon: string = ' ';
  @State useCache: boolean = true;
  private mIsSingleLayout: boolean = true;
  private mResourceManager = ResourceManager.getInstance();
  private mDefaultAppIcon;
  private mRecentMissionsViewModel: RecentMissionsViewModel = RecentMissionsViewModel.getInstance();

  aboutToAppear(): void  {
    this.mDefaultAppIcon = RecentsStyleConstants.DEFAULT_APP_ICON_IMAGE;
    this.icon = this.mDefaultAppIcon;
    this.updateIcon();
    this.mIsSingleLayout = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ? true : false;
  }

  /**
   * The callback of recent missions app icon.
   *
   * @param {string} image - the value get from ResourceManager
   */
  iconLoadCallback(image): void {
    this.icon = image;
  }

  /**
   * Update the app icon of recent missions.
   */
  updateIcon(): void {
    this.mResourceManager.getAppIconWithCache(this.appIcon,
      this.bundleName, this.moduleName, this.iconLoadCallback.bind(this), this.mDefaultAppIcon);
  }

  build() {
    Column() {
      Image(this.icon)
    }
    .width(this.iconSize)
    .height(this.iconSize)
  }
}