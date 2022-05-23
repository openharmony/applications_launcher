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
import image from '@ohos.multimedia.image';
import CheckEmptyUtils from '../../../../../../../../common/src/main/ets/default/utils/CheckEmptyUtils';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';
import CommonStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import StyleConstants from '../../common/constants/StyleConstants';
import RecentMissionAppIcon from './RecentMissionAppIcon.ets';
import RecentMissionAppName from './RecentMissionAppName.ets';
import RecentMissionsViewModel from '../../viewmodel/RecentMissionsViewModel.ets';
import windowManager from  '../../../../../../../../common/src/main/ets/default/manager/WindowManager';
import SnapShotInfo from '../../../../../../../../common/src/main/ets/default/bean/SnapShotInfo';

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
  @State recentImage: string | image.PixelMap = '';
  private mDefaultSnapShot: string = StyleConstants.DEFAULT_APP_IMAGE;
  private mIsSingleLayout: boolean = true;
  private snapShotTime: string = '';
  private mRecentMissionsViewModel: RecentMissionsViewModel;

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear start');
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
    this.mIsSingleLayout = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ? true : false;
    this.margin = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ?
      StyleConstants.SINGLE_LIST_LAYOUT_MARGIN * StyleConstants.DPI_RATIO : StyleConstants.DOUBLE_LIST_LAYOUT_MARGIN;
    this.layoutWeight = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ?
      StyleConstants.SINGLE_LIST_APP_INFO_LAYOUT_WEIGHT : StyleConstants.DOUBLE_LIST_APP_INFO_LAYOUT_WEIGHT;
    this.mRecentMissionsViewModel.getMissionSnapShot(this.missionId, this.recentMissionsSnapshotCallback.bind(this));
    if (CheckEmptyUtils.isEmpty(this.recentImage)) {
      this.recentImage = this.mDefaultSnapShot;
    }
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, `aboutToDisappear start ${this.missionId}`);
    Log.showInfo(TAG, `typeof this.recentImage ${typeof this.recentImage}`);
    if (this.recentImage != this.mDefaultSnapShot) {
      this.recentImage.release().catch((err) => {
        Log.showError(TAG, `image.PixelMap release err: ${err}`);
      })
    }
  }

  private onPageShow(): void {
    Log.showInfo(TAG, `onPageShow start`);
  }

  private onPageHide(): void {
    Log.showInfo(TAG, `onPageHide start`);
  }

  /**
 * The callback of Recent missions snapshot.
 *
 * @param {number} missionId
 * @param {any} snapShotInfo
 */
  recentMissionsSnapshotCallback(missionId: number, snapShotInfo: SnapShotInfo): void {
    Log.showInfo(TAG, `recentMissionsSnapshotCallback missionId: ${this.missionId}`);
    if (missionId === this.missionId) {
      this.recentImage = snapShotInfo.snapShotImage;
      let width = snapShotInfo.snapShotImageWidth;
      let height = snapShotInfo.snapShotImageHeight;
      Log.showInfo(TAG, `recentMissionsSnapshotCallback recentImage: ${JSON.stringify(this.recentImage)},
        width: ${JSON.stringify(width)}, height: ${JSON.stringify(height)}`);
    }
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
              this.lockedState = !this.lockedState;
              Log.showInfo(TAG, `onClick set recent mission Locked status: ${this.lockedState}`);
              this.mRecentMissionsViewModel.setRecentMissionLock(this.missionId, this.lockedState);
              this.isClickSubComponent = false;
            })
        }
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
          this.lockedState = !this.lockedState;
          Log.showInfo(TAG, `gesture set recent mission Locked status: ${this.lockedState}`);
          this.mRecentMissionsViewModel.setRecentMissionLock(this.missionId, this.lockedState);
        }
      }))
  }
}