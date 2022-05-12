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
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import RecentMissionCard from '../common/uicomponents/RecentMissionCard.ets';
import RecentMissionsViewModel from '../viewmodel/RecentMissionsViewModel.ets';
import StyleConstants from '../common/constants/StyleConstants';

const TAG = 'RecentMissionsSingleLayout';

/**
 * Single-line display of recent task list (phone adaptation).
 */
@Component
export default struct RecentMissionsSingleLayout {
  @Link recentMissionsSingleList: [];
  @Link isClickSubComponent: boolean;
  private mRecentMissionsViewModel: RecentMissionsViewModel;
  private mScroll: Scroller = new Scroller();

  private aboutToAppear(): void {
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
  }

  build() {
    Column() {
      // top blank area
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center })
      .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
      .height(StyleConstants.SINGLE_LIST_TOP_AERA_HEIGHT * StyleConstants.DPI_RATIO)

      // middle area, mission list
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Start, justifyContent: FlexAlign.Center }) {
        Scroll(this.mScroll) {
          Row() {
            ForEach(this.recentMissionsSingleList, (item) => {
              RecentMissionCard({
                missionId: item.missionId,
                appIconId: item.appIconId,
                appLabelId: item.appLabelId,
                appName: item.appName,
                bundleName: item.bundleName,
                abilityName: item.abilityName,
                lockedState: item.lockedState,
                isClickSubComponent: $isClickSubComponent,
                recentImage: item.snapShotInfo.snapShotImage
              })
            }, (item) => JSON.stringify(item))
          }
        }.height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
        .scrollable(ScrollDirection.Horizontal)
      }
      .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
      .height(StyleConstants.SINGLE_LIST_MIDDLE_AERA_HEIGHT * StyleConstants.DPI_RATIO)

      // bottom area, button for cleaning up running applications
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center })
      {
        Column() {
          Image(StyleConstants.DEFAULT_DELETE_IMAGE)
            .width(StyleConstants.RECENT_DELETE_IMAGE_SIZE * StyleConstants.DPI_RATIO)
            .height(StyleConstants.RECENT_DELETE_IMAGE_SIZE * StyleConstants.DPI_RATIO)
        }
        .width(StyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE * StyleConstants.DPI_RATIO)
        .height(StyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE * StyleConstants.DPI_RATIO)
        .opacity(StyleConstants.DEFAULT_DELETE_IMAGE_OPACITY)
        .backgroundColor(StyleConstants.DEFAULT_FONT_COLOR)
        .borderRadius(StyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE * StyleConstants.DPI_RATIO / 2)
        .padding(8 * StyleConstants.DPI_RATIO)
        .onClick(() => {
          this.isClickSubComponent = true;
          Log.showInfo(TAG, 'onClick click delete button');
          this.mRecentMissionsViewModel.deleteRecentMission(true, -1);
          this.mRecentMissionsViewModel.backView();
        })
      }
      .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
      .height(StyleConstants.SINGLE_LIST_BOTTOM_AERA_HEIGHT * StyleConstants.DPI_RATIO)
    }
    .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
  }
}