/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import windowManager from '../../../../../../../common/src/main/ets/default/manager/WindowManager';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';
import RecentMissionInfo from '../../../../../../../common/src/main/ets/default/bean/RecentMissionInfo';
import StyleConstants from '../../../../../../../feature/recents/src/main/ets/MainAbility/common/constants/StyleConstants';
import RecentMissionsStage from '../../../../../../../feature/recents/src/main/ets/MainAbility/common/RecentMissionsStage';
import RecentMissionsViewModel from '../../../../../../../feature/recents/src/main/ets/MainAbility/viewmodel/RecentMissionsViewModel';
import EmptyMsgDisplay from '../../../../../../../feature/recents/src/main/ets/MainAbility/view/EmptyMsgDisplay.ets';
import RecentMissionsDoubleLayout from '../../../../../../../feature/recents/src/main/ets/MainAbility/view/RecentMissionsDoubleLayout.ets';
import RecentMissionsSingleLayout from '../../../../../../../feature/recents/src/main/ets/MainAbility/view/RecentMissionsSingleLayout.ets';

const TAG = "RecentView";

@Entry
@Component
struct RecentView {
  @StorageLink('recentMissionsList') mRecentMissionsList: RecentMissionInfo[] = [];
  @State mIsClickSubComponent: boolean = false;
  private mRecentMissionsStage: RecentMissionsStage = new RecentMissionsStage();
  private mRecentMissionsViewModel: RecentMissionsViewModel;

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow' + this.mRecentMissionsList.length);
    this.mIsClickSubComponent = false;
    this.mRecentMissionsStage.onCreate();
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
    this.mRecentMissionsViewModel.getRecentMissionsList();
  }

  onPageHide(): void {
    Log.showInfo(TAG, `onPageHide`);
    this.mIsClickSubComponent = false;
    this.mRecentMissionsStage.onDestroy();
  }

  onBackPress(): boolean {
    Log.showInfo(TAG, 'RecentMission EntryView onBackPress');
    windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
    return true;
  }

  build() {
    Column() {
      if (this.mRecentMissionsList.length === 0) {
        EmptyMsgDisplay();
      } else {
        if (this.traceLoadData() && this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single') {
          RecentMissionsSingleLayout({ mRecentMissionsSingleList: $mRecentMissionsList,
            mIsClickSubComponent: $mIsClickSubComponent});
        } else {
          RecentMissionsDoubleLayout({ mRecentMissionsDoubleList: $mRecentMissionsList,
            mIsClickSubComponent: $mIsClickSubComponent});
        }
      }
    }
    .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .backgroundImage(StyleConstants.DEFAULT_RECENT_BACKGROUND_IMAGE)
    .onClick(() => {
      if (!this.mIsClickSubComponent) {
        Log.showInfo(TAG, 'click recent missions area');
        this.mRecentMissionsViewModel.backView();
      }
    })
  }

  private traceLoadData(): boolean {
    Trace.end(Trace.CORE_METHOD_START_RECENTS);
    return true;
  }
}