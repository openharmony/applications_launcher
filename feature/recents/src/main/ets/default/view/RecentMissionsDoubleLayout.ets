/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Log } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import RecentMissionCard from '../common/uicomponents/RecentMissionCard';
import { RecentMissionsViewModel } from '../viewmodel/RecentMissionsViewModel';
import { RecentsStyleConstants } from '../common/constants/RecentsStyleConstants';
import { windowManager } from '@ohos/common';

const TAG = 'RecentMissionsDoubleLayout';

/**
 * Double-line display of recent task list (pad adaptation).
 */
@Component
export struct RecentMissionsDoubleLayout {
  @Link recentMissionsDoubleList: [];
  @Link isClickSubComponent: boolean;
  private mRecentMissionsViewModel: RecentMissionsViewModel;

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear start');
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, `aboutToDisappear start`);
  }

  itemChance(item: any): any {
    item.snapShotTime = '';
    return item;
  }

  build() {
    Column() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Start, justifyContent: FlexAlign.Center }) {
        Grid() {
          ForEach(this.recentMissionsDoubleList, (item) => {
              GridItem() {
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
              .align(Alignment.Center)
          },(item) => JSON.stringify(this.itemChance(item)))
        }
        .width(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
        .rowsTemplate('1fr 1fr')
        .direction(Direction.Rtl)
        .columnsGap(RecentsStyleConstants.DOUBLE_LIST_LAYOUT_COLUMNSGAP)
        .rowsGap(RecentsStyleConstants.DOUBLE_LIST_LAYOUT_ROWSGAP)
      }
      .margin({
        top: RecentsStyleConstants.DOUBLE_LIST_TOP_MARGIN,
      })
      .width(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
      .height(RecentsStyleConstants.DOUBLE_LIST_GRID_HEIGHT_PERCENTAGE)

      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center }){
        Stack(){
          Column(){
          }
          .width(RecentsStyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE)
          .height(RecentsStyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE)
          .opacity(RecentsStyleConstants.DEFAULT_DELETE_IMAGE_OPACITY)
          .backgroundColor(RecentsStyleConstants.DEFAULT_FONT_COLOR)
          .borderRadius(RecentsStyleConstants.RECENT_DELETE_IMAGE_RADIUS)
          .padding(8)

          Image(RecentsStyleConstants.DEFAULT_DELETE_IMAGE_FULL)
            .width(RecentsStyleConstants.RECENT_DELETE_IMAGE_SIZE)
            .height(RecentsStyleConstants.RECENT_DELETE_IMAGE_SIZE)
        }
        .onClick(() => {
          this.isClickSubComponent = true;
          Log.showDebug(TAG, 'onClick click delete button');
          localEventManager.sendLocalEventSticky(EventConstants.EVENT_ANIMATION_CLOSE_APPLICATION, null);
          this.mRecentMissionsViewModel.deleteRecentMission(true, CommonConstants.INVALID_VALUE);
          this.mRecentMissionsViewModel.backView();
          this.mRecentMissionsViewModel.getRecentMissionsList();
        })
      }
      .width(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    }
    .width(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .height(RecentsStyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
  }
}