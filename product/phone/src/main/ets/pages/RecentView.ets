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

import { Log } from '@ohos/common';
import { Trace } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { RecentMissionInfo } from '@ohos/common';
import { RecentsStyleConstants } from '@ohos/recents';
import { RecentMissionsStage } from '@ohos/recents';
import { RecentMissionsViewModel } from '@ohos/recents';
import { RecentMissionsSingleLayout } from '@ohos/recents';
import { RecentMissionsDoubleLayout } from '@ohos/recents';

const TAG = "RecentView";

@Entry
@Component
struct RecentView {
  @StorageLink('recentMissionsList') recentMissionsList: RecentMissionInfo[] = [];
  @State isClickSubComponent: boolean = false;
  private mRecentMissionsStage: RecentMissionsStage = new RecentMissionsStage();
  @State mRecentMissionsViewModel: RecentMissionsViewModel = undefined;

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
    this.isClickSubComponent = false;
    this.mRecentMissionsStage.onCreate();
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
    this.mRecentMissionsViewModel.getRecentMissionsList();
    AppStorage.SetOrCreate('recentIdx', 0);
  }

  onPageHide(): void {
    Log.showInfo(TAG, `onPageHide`);
    this.isClickSubComponent = false;
    this.mRecentMissionsStage.onDestroy();
  }

  onBackPress(): boolean {
    Log.showInfo(TAG, 'RecentMission EntryView onBackPress');
    windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
    return true;
  }

  build() {
    Column() {
      if (!Array.isArray(this.recentMissionsList) || this.recentMissionsList.length == 0 || !this.mRecentMissionsViewModel) {
        Text($r('app.string.No_running_apps_recently'))
          .fontColor(RecentsStyleConstants.DEFAULT_FONT_COLOR)
          .fontSize(RecentsStyleConstants.DEFAULT_FONT_SIZE);
      } else {
        if (this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single') {
          RecentMissionsSingleLayout({ recentMissionsSingleList: $recentMissionsList,
            isClickSubComponent: $isClickSubComponent});
        } else {
          RecentMissionsDoubleLayout({ recentMissionsDoubleList: $recentMissionsList,
            isClickSubComponent: $isClickSubComponent});
        }
      }
      if (this.traceBuildEnd()) { }
    }
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .width(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .height(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .backgroundImage(RecentsStyleConstants.DEFAULT_RECENT_BACKGROUND_IMAGE)
    .onClick(() => {
      if (!this.isClickSubComponent) {
        Log.showInfo(TAG, 'click recent missions area');
        this.mRecentMissionsViewModel.backView();
      }
    })
  }

  private traceBuildEnd(): boolean {
    Trace.end(Trace.CORE_METHOD_START_RECENTS);
    return true;
  }
}