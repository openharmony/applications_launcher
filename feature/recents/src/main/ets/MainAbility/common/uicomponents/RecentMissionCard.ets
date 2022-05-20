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
import CheckEmptyUtils from '../../../../../../../../common/src/main/ets/default/utils/CheckEmptyUtils';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';
import CommonStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import StyleConstants from '../../common/constants/StyleConstants';
import RecentMissionAppIcon from './RecentMissionAppIcon.ets';
import RecentMissionAppName from './RecentMissionAppName.ets';
import RecentMissionsViewModel from '../../viewmodel/RecentMissionsViewModel.ets';
import windowManager from  '../../../../../../../../common/src/main/ets/default/manager/WindowManager';

const TAG = 'Recent-RecentMissionCard';

/**
 * Common card component for recent missions.
 */
@Component
export default struct RecentMissionCard {
  @Link isClickSubComponent: boolean;
  @Prop missionId: number;
  @Prop appIconId: string;
  @Prop appLabelId: string;
  @Prop appName: string;
  @Prop bundleName: string;
  @Prop abilityName: string;
  @Prop lockedState: boolean;
  @State margin: number = StyleConstants.SINGLE_LIST_LAYOUT_MARGIN;
  @State layoutWeight: number = StyleConstants.SINGLE_LIST_APP_INFO_LAYOUT_WEIGHT;
  @State recentImage: any = '';
  private mDefaultSnapShot: string = StyleConstants.DEFAULT_APP_IMAGE;
  private mIsSingleLayout: boolean = true;
  private mSnapshotList: any = [];
  private mRecentMissionsViewModel: RecentMissionsViewModel;

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear start');
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
    this.mIsSingleLayout = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ? true : false;
    this.margin = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ?
      StyleConstants.SINGLE_LIST_LAYOUT_MARGIN * StyleConstants.DPI_RATIO : StyleConstants.DOUBLE_LIST_LAYOUT_MARGIN;
    this.layoutWeight = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ?
      StyleConstants.SINGLE_LIST_APP_INFO_LAYOUT_WEIGHT : StyleConstants.DOUBLE_LIST_APP_INFO_LAYOUT_WEIGHT;
    if (CheckEmptyUtils.isEmpty(this.recentImage)) {
      this.recentImage = this.mDefaultSnapShot;
    }
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, `aboutToDisappear start ${this.missionId}`);
    if (this.recentImage != this.mDefaultSnapShot) {
      void this.recentImage.release();
    }
  }

  private onPageShow(): void {
    Log.showInfo(TAG, `onPageShow start`);
  }

  private onPageHide(): void {
    Log.showInfo(TAG, `onPageHide start`);
  }

  build() {
    Column() {
      Row() {
        Row() {
          RecentMissionAppIcon({
            iconSize: this.mIsSingleLayout ?
              StyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE * StyleConstants.DPI_RATIO :
              StyleConstants.DOUBLE_LIST_DEFAULT_APP_ICON_SIZE,
            appIcon: this.appIconId,
            bundleName: this.bundleName,
            labelId: this.appLabelId,
            useCache: false
          })
          RecentMissionAppName({
            appName: this.appName,
            nameSize: this.mIsSingleLayout ?
              StyleConstants.DEFAULT_APP_NAME_SIZE * StyleConstants.DPI_RATIO :
              StyleConstants.DEFAULT_APP_NAME_SIZE,
            bundleName: this.bundleName,
            labelId: this.appLabelId,
            margin: this.margin / 2
          })
        }
        .layoutWeight(this.layoutWeight)
        .margin({ left: this.margin / 2, bottom: this.mIsSingleLayout ?  this.margin:0 })
        Column() {
          Image(StyleConstants.DEFAULT_LOCKED_IMAGE)
            .visibility(this.lockedState? Visibility.Visible: Visibility.Hidden)
            .width(this.mIsSingleLayout ?
              StyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE_NEW :
              StyleConstants.DOUBLE_LIST_DEFAULT_APP_ICON_SIZE - 10)
            .height(this.mIsSingleLayout ?
              StyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE_NEW :
              StyleConstants.DOUBLE_LIST_DEFAULT_APP_ICON_SIZE - 10)
            .margin({
              right: this.mIsSingleLayout ? (StyleConstants.SINGLE_LIST_LOCKED_IMAGE_RIGHT_MARGIN):(StyleConstants.DOUBLE_LIST_LOCKED_IMAGE_RIGHT_MARGIN),
              bottom: this.mIsSingleLayout ? this.margin : 0
            })
            .onClick(() => {
              this.isClickSubComponent = true;
              Log.showInfo(TAG, 'onClick set recent mission Locked status');
              this.mRecentMissionsViewModel.setRecentMissionLock(this.missionId, !this.lockedState);
              this.isClickSubComponent = false;
            })
        }
//        .layoutWeight(1)
      }
      .margin({ bottom: this.mIsSingleLayout ? this.margin / 2 :  StyleConstants.DOUBLE_LIST_APP_INFO_BOTTOM_MARGIN })
      Image(this.recentImage)
        .objectFit(ImageFit.Contain)
        .borderRadius(StyleConstants.RECENT_IMAGE_RADIUS)
        .width(this.mIsSingleLayout ?
          StyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH * StyleConstants.DPI_RATIO :
          StyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH)
        .height(this.mIsSingleLayout ?
          StyleConstants.SINGLE_LIST_APP_IMAGE_HEIGHT * StyleConstants.DPI_RATIO :
          StyleConstants.DOUBLE_LIST_APP_IMAGE_HEIGHT)
        .onClick(() => {
          this.isClickSubComponent = true;
          Log.showInfo(TAG, 'onClick start launcher ability');
          windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
          this.mRecentMissionsViewModel.moveMissionToFront(this.missionId);
        })
    }
    .width(this.mIsSingleLayout ?
      StyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH * StyleConstants.DPI_RATIO :
      StyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH)
    .height(this.mIsSingleLayout ?
      StyleConstants.SINGLE_LIST_MISSION_HEIGHT * StyleConstants.DPI_RATIO :
      StyleConstants.DOUBLE_LIST_MISSION_HEIGHT)
    .margin({ right: this.mIsSingleLayout ? 0 : this.margin })
    .backgroundColor(CommonStyleConstants.DEFAULT_BG_COLOR)
    .gesture(
    PanGesture({ fingers: 1, direction: PanDirection.Vertical, distance: 5 })
      .onActionEnd((e) => {
        let offsetWidth = (this.mIsSingleLayout ?
          StyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH * StyleConstants.DPI_RATIO :
          StyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH) / 2;
        if (e.offsetY < -50 && e.offsetX <= offsetWidth && -offsetWidth <= e.offsetX) {
          this.mRecentMissionsViewModel.deleteRecentMission(false, this.missionId);
        } else if (e.offsetY > 50 && e.offsetX <= offsetWidth && -offsetWidth <= e.offsetX) {
          this.lockedState = this.lockedState ? false : true;
          this.mRecentMissionsViewModel.setRecentMissionLock(this.missionId, this.lockedState);
        }
      }))
  }
}