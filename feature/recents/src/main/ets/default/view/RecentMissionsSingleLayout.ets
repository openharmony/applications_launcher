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
import RecentMissionCard from '../common/uicomponents/RecentMissionCard';
import { RecentsStyleConstants } from '../common/constants/RecentsStyleConstants';
import { RecentMissionsViewModel } from '../viewmodel/RecentMissionsViewModel';

const TAG = 'RecentMissionsSingleLayout';

/**
 * Single-line display of recent task list (phone adaptation).
 */
@Component
export struct RecentMissionsSingleLayout {
  @Link recentMissionsSingleList: [];
  @Link isClickSubComponent: boolean;
  @StorageLink('recentIdx') recentIdx: number = 0;
  private mRecentMissionsViewModel: RecentMissionsViewModel;

  aboutToAppear(): void {
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween }) {
      // middle area, mission list
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
        List({ space: RecentsStyleConstants.SINGLE_LIST_MIDDLE_AREA_SPACE, initialIndex: this.recentIdx}) {
          ForEach(this.recentMissionsSingleList, (item) => {
            ListItem() {
              RecentMissionCard({
                missionId: item.missionId,
                appIconId: item.appIconId,
                appLabelId: item.appLabelId,
                appName: item.appName,
                bundleName: item.bundleName,
                moduleName: item.moduleName,
                abilityName: item.abilityName,
                lockedState: item.lockedState,
                isClickSubComponent: $isClickSubComponent,
                snapShotTime: item.snapShotTime
              })
            }
          }, (item) => JSON.stringify(item))
        }
        .listDirection(Axis.Horizontal)
        .height(RecentsStyleConstants.SINGLE_LIST_MISSION_HEIGHT)
      }
      .padding({ top: RecentsStyleConstants.SINGLE_LIST_MIDDLE_AREA_TOP_MARGIN })
      .width(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
      .height(RecentsStyleConstants.SINGLE_LIST_MIDDLE_AERA_HEIGHT)

      // bottom area, button for cleaning up running applications
      Column() {
        Stack() {
          Column() {
          }
          .width(RecentsStyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE)
          .height(RecentsStyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE)
          .opacity(RecentsStyleConstants.DEFAULT_DELETE_IMAGE_OPACITY)
          .backgroundColor(RecentsStyleConstants.DEFAULT_FONT_COLOR)
          .borderRadius(RecentsStyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE / 2)

          Image(RecentsStyleConstants.DEFAULT_DELETE_IMAGE_FULL)
            .width(RecentsStyleConstants.RECENT_DELETE_IMAGE_SIZE)
            .height(RecentsStyleConstants.RECENT_DELETE_IMAGE_SIZE)
        }
        .onClick(() => {
          this.isClickSubComponent = true;
          Log.showDebug(TAG, 'onClick click delete button');
          this.mRecentMissionsViewModel.deleteRecentMission(true, -1);
          this.mRecentMissionsViewModel.backView();
          this.mRecentMissionsViewModel.getRecentMissionsList();
        })
      }
      .margin({ bottom: RecentsStyleConstants.SINGLE_LIST_DELETE_IMAGE_FULL_BOTTOM_MARGIN })
      .width(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    }
    .height(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)

  }
}