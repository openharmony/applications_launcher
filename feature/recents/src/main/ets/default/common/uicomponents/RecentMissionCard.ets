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
import { Log } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { windowManager } from  '@ohos/common';
import { SnapShotInfo } from '@ohos/common';
import RecentMissionAppIcon from './RecentMissionAppIcon';
import RecentMissionAppName from './RecentMissionAppName';
import { RecentMissionsViewModel } from '../../viewmodel/RecentMissionsViewModel';
import { RecentsStyleConstants } from '../../common/constants/RecentsStyleConstants';

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
  @Prop moduleName: string;
  @Prop abilityName: string;
  @Prop lockedState: boolean;
  @State cardMargin: number = RecentsStyleConstants.SINGLE_LIST_LAYOUT_MARGIN;
  @State cardLayoutWeight: number = RecentsStyleConstants.SINGLE_LIST_APP_INFO_LAYOUT_WEIGHT;
  // recentImage default is Resource type, to avoid toolchain typeCheck
  @State recentImage: any = RecentsStyleConstants.DEFAULT_APP_IMAGE;
  private mIsSingleLayout: boolean = true;
  private snapShotTime: string = '';

  private mRecentMissionsViewModel: RecentMissionsViewModel;

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear start');
    // remove this if toolchain fix requireNApi bug
    image.toString();
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
    this.mIsSingleLayout = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ? true : false;
    this.cardMargin = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ?
      RecentsStyleConstants.SINGLE_LIST_LAYOUT_MARGIN * RecentsStyleConstants.DPI_RATIO : RecentsStyleConstants.DOUBLE_LIST_LAYOUT_MARGIN;
    this.cardLayoutWeight = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ?
      RecentsStyleConstants.SINGLE_LIST_APP_INFO_LAYOUT_WEIGHT : RecentsStyleConstants.DOUBLE_LIST_APP_INFO_LAYOUT_WEIGHT;
    this.mRecentMissionsViewModel.getMissionSnapShot(this.missionId, this.recentMissionsSnapshotCallback.bind(this));
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, `aboutToDisappear start ${this.missionId}`);
    Log.showDebug(TAG, `typeof this.recentImage ${typeof this.recentImage}`);
    // typeof Resource or pixelMap is Object
    if (!CheckEmptyUtils.isEmpty(this.recentImage)
      && JSON.stringify(this.recentImage) != JSON.stringify(RecentsStyleConstants.DEFAULT_APP_IMAGE)) {
      this.recentImage.release().catch((err) => {
        Log.showError(TAG, `image.PixelMap release err: ${err}`);
      })
      Log.showInfo(TAG, `aboutToDisappear end ${this.missionId}`);
    }
  }

  /**
 * The callback of Recent missions snapshot.
 *
 * @param {number} missionId
 * @param {any} snapShotInfo
 */
  recentMissionsSnapshotCallback(missionId: number, snapShotInfo: SnapShotInfo): void {
    Log.showDebug(TAG, `recentMissionsSnapshotCallback missionId: ${this.missionId}`);
    if (missionId === this.missionId) {
      this.recentImage = snapShotInfo.snapShotImage;
      let width = snapShotInfo.snapShotImageWidth;
      let height = snapShotInfo.snapShotImageHeight;
      Log.showDebug(TAG, `recentMissionsSnapshotCallback recentImage: ${JSON.stringify(this.recentImage)},
        width: ${JSON.stringify(width)}, height: ${JSON.stringify(height)}`);
    }
  }

  build() {
    Column() {
      Row() {
        Row() {
          RecentMissionAppIcon({
            iconSize: this.mIsSingleLayout ?
              RecentsStyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE * RecentsStyleConstants.DPI_RATIO :
              RecentsStyleConstants.DOUBLE_LIST_DEFAULT_APP_ICON_SIZE,
            appIcon: this.appIconId,
            bundleName: this.bundleName,
            moduleName: this.moduleName,
            labelId: this.appLabelId,
            useCache: false
          })
          RecentMissionAppName({
            appName: this.appName,
            nameSize: this.mIsSingleLayout ?
              RecentsStyleConstants.DEFAULT_APP_NAME_SIZE * RecentsStyleConstants.DPI_RATIO :
              RecentsStyleConstants.DEFAULT_APP_NAME_SIZE,
            bundleName: this.bundleName,
            moduleName: this.moduleName,
            labelId: this.appLabelId,
            nameMargin: this.cardMargin / 2
          })
        }
        .layoutWeight(this.cardLayoutWeight)
        .margin({ left: RecentsStyleConstants.SINGLE_LIST_APP_INFO_LEFT_MARGIN })
        Column() {
          Image(RecentsStyleConstants.DEFAULT_LOCKED_IMAGE)
            .visibility(this.lockedState? Visibility.Visible: Visibility.Hidden)
            .width(this.mIsSingleLayout ?
              RecentsStyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE_NEW :
              RecentsStyleConstants.DOUBLE_LIST_DEFAULT_APP_ICON_SIZE - 10)
            .height(this.mIsSingleLayout ?
              RecentsStyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE_NEW :
              RecentsStyleConstants.DOUBLE_LIST_DEFAULT_APP_ICON_SIZE - 10)
            .margin({
              right: this.mIsSingleLayout ? (RecentsStyleConstants.SINGLE_LIST_LOCKED_IMAGE_RIGHT_MARGIN):(RecentsStyleConstants.DOUBLE_LIST_LOCKED_IMAGE_RIGHT_MARGIN)
            })
            .onClick(() => {
              this.isClickSubComponent = true;
              this.lockedState = !this.lockedState;
              Log.showDebug(TAG, `onClick set recent mission Locked status: ${this.lockedState}`);
              this.mRecentMissionsViewModel.setRecentMissionLock(this.missionId, this.lockedState);
              this.isClickSubComponent = false;
            })
        }
      }
      .margin({
        top: this.mIsSingleLayout ? RecentsStyleConstants.SINGLE_LIST_APP_INFO_TOP_MARGIN :  RecentsStyleConstants.DOUBLE_LIST_APP_INFO_BOTTOM_MARGIN,
        bottom: this.mIsSingleLayout ? RecentsStyleConstants.SINGLE_LIST_APP_INFO_BOTTOM_MARGIN :  RecentsStyleConstants.DOUBLE_LIST_APP_INFO_BOTTOM_MARGIN
      })
      Image(this.recentImage)
        .alt(RecentsStyleConstants.DEFAULT_APP_IMAGE)
        .objectFit(ImageFit.Contain)
        .borderRadius(RecentsStyleConstants.RECENT_IMAGE_RADIUS)
        .width(this.mIsSingleLayout ?
          RecentsStyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH  :
          RecentsStyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH)
        .height(this.mIsSingleLayout ?
          RecentsStyleConstants.SINGLE_LIST_APP_IMAGE_HEIGHT :
          RecentsStyleConstants.DOUBLE_LIST_APP_IMAGE_HEIGHT)
        .onClick(() => {
          this.isClickSubComponent = true;
          Log.showDebug(TAG, 'onClick start launcher ability');
          if (!globalThis.recentMode || !windowManager.isSplitWindowMode(globalThis.recentMode)) {
            windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
          }
          this.mRecentMissionsViewModel.moveMissionToFront(this.missionId);
        })
    }
    .width(this.mIsSingleLayout ?
      RecentsStyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH :
      RecentsStyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH)
    .height(this.mIsSingleLayout ?
      RecentsStyleConstants.SINGLE_LIST_MISSION_HEIGHT :
      RecentsStyleConstants.DOUBLE_LIST_MISSION_HEIGHT)
    .margin({ right: this.mIsSingleLayout ? 0 : this.cardMargin })
    .backgroundColor(RecentsStyleConstants.DEFAULT_BG_COLOR)
    .gesture(
    PanGesture({ fingers: 1, direction: PanDirection.Vertical, distance: 5 })
      .onActionEnd((e) => {
        let offsetWidth = (this.mIsSingleLayout ?
          RecentsStyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH * RecentsStyleConstants.DPI_RATIO :
          RecentsStyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH) / 2;
        if (e.offsetY < -50 && e.offsetX <= offsetWidth && -offsetWidth <= e.offsetX) {
          this.mRecentMissionsViewModel.deleteRecentMission(false, this.missionId);
        } else if (e.offsetY > 50 && e.offsetX <= offsetWidth && -offsetWidth <= e.offsetX) {
          this.lockedState = !this.lockedState;
          Log.showDebug(TAG, `gesture set recent mission Locked status: ${this.lockedState}`);
          this.mRecentMissionsViewModel.setRecentMissionLock(this.missionId, this.lockedState);
        }
      }))
  }
}