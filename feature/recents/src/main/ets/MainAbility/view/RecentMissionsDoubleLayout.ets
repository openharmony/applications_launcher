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
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import StyleConstants from '../common/constants/StyleConstants';
import RecentMissionCard from '../common/uicomponents/RecentMissionCard.ets';
import RecentMissionsViewModel from '../viewmodel/RecentMissionsViewModel';

const TAG = 'RecentMissionsDoubleLayout';

@Component
export default struct RecentMissionsDoubleLayout {
  @Link mRecentMissionsDoubleList: [];
  @Link mIsClickSubComponent: boolean;
  private mRecentMissionsViewModel: RecentMissionsViewModel;
  private mScroll: Scroller = new Scroller();

  private aboutToAppear(): void  {
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
  }

  build() {
    Column() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Start, justifyContent: FlexAlign.Center }) {
        Grid() {
          ForEach(this.mRecentMissionsDoubleList, (item) => {
              GridItem() {
                RecentMissionCard({
                  missionId: item.missionId,
                  appIconId: item.appIconId,
                  appLabelId: item.appLabelId,
                  appName: item.appName,
                  bundleName: item.bundleName,
                  abilityName: item.abilityName,
                  lockedState: item.lockedState,
                  mIsClickSubComponent: $mIsClickSubComponent
                })
              }
              .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
              .align(Alignment.Center)
          },(item) => JSON.stringify(item))
        }
        .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
        .rowsTemplate('1fr 1fr')
        .columnsGap(StyleConstants.DOUBLE_LIST_LAYOUT_MARGIN)
        .rowsGap(StyleConstants.DOUBLE_LIST_LAYOUT_MARGIN)
      }
      .margin({top: StyleConstants.DOUBLE_LIST_TOP_MARGIN})
      .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
      .height(StyleConstants.DOUBLE_LIST_GRID_HEIGHT_PERCENTAGE)
      Column() {
        Image(StyleConstants.DEFAULT_DELETE_IMAGE)
        .width(StyleConstants.RECENT_DELETE_IMAGE_SIZE)
        .height(StyleConstants.RECENT_DELETE_IMAGE_SIZE)
      }
      .width(StyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE)
      .height(StyleConstants.RECENT_DELETE_IMAGE_COLUMN_SIZE)
      .opacity(StyleConstants.DEFAULT_DELETE_IMAGE_OPACITY)
      .backgroundColor(StyleConstants.DEFAULT_FONT_COLOR)
      .borderRadius(StyleConstants.RECENT_DELETE_IMAGE_RADIUS)
      .padding(8)
      .margin({top: StyleConstants.DOUBLE_LIST_BOTTOM_MARGIN})
      .onClick(() => {
        this.mIsClickSubComponent = true;
        Log.showInfo(TAG, `click delete button`);
        this.mRecentMissionsViewModel.deleteRecentMission(true, CommonConstants.INVALID_VALUE);
        this.mRecentMissionsViewModel.backView();
      })
    }
    .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
  }
}