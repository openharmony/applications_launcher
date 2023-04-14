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
import { Trace } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { SnapShotInfo } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import RecentMissionAppIcon from './RecentMissionAppIcon';
import RecentMissionAppName from './RecentMissionAppName';
import { RecentMissionsViewModel } from '../../viewmodel/RecentMissionsViewModel';
import { RecentsStyleConstants } from '../../common/constants/RecentsStyleConstants';
import { RecentMissionStartAppHandler } from './../RecentMissionStartAppHandler';

const TAG = 'Recent-RecentMissionCard';

/**
 * Common card component for recent missions.
 */
@Component
export default struct RecentMissionCard {
  @Link isClickSubComponent: boolean;
  @State missionId: number = 0;
  @State appIconId: string = '';
  @State appLabelId: string = '';
  @State appName: string = '';
  @State bundleName: string = '';
  @State moduleName: string = '';
  @State abilityName: string = '';
  @State lockedState: boolean = false;
  @State cardMargin: number = RecentsStyleConstants.SINGLE_LIST_LAYOUT_MARGIN;
  @State cardLayoutWeight: number = RecentsStyleConstants.SINGLE_LIST_APP_INFO_LAYOUT_WEIGHT;
  // recentImage default is Resource type, to avoid toolchain typeCheck
  @State recentImage: any = '';
  private mIsSingleLayout: boolean = true;
  private snapShotTime: string = '';
  private mRecentMissionsViewModel: RecentMissionsViewModel;
  private mRecentMissionStartAppHandler: RecentMissionStartAppHandler;
  private mReleaseFlag = true;

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear start');
    // remove this if toolchain fix requireNApi bug
    this.mReleaseFlag = false;
    this.mRecentMissionsViewModel = RecentMissionsViewModel.getInstance();
    this.mIsSingleLayout = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ? true : false;
    this.cardMargin = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ?
      RecentsStyleConstants.SINGLE_LIST_LAYOUT_MARGIN * RecentsStyleConstants.DPI_RATIO : RecentsStyleConstants.DOUBLE_LIST_LAYOUT_MARGIN;
    this.cardLayoutWeight = this.mRecentMissionsViewModel.getRecentMissionsRowType() === 'single' ?
      RecentsStyleConstants.SINGLE_LIST_APP_INFO_LAYOUT_WEIGHT : RecentsStyleConstants.DOUBLE_LIST_APP_INFO_LAYOUT_WEIGHT;
    this.mRecentMissionsViewModel.getMissionSnapShot(this.missionId, this.recentMissionsSnapshotCallback.bind(this));
    this.mRecentMissionStartAppHandler = RecentMissionStartAppHandler.getInstance();
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, `aboutToDisappear start ${this.missionId}`);
    Log.showDebug(TAG, `typeof this.recentImage ${typeof this.recentImage}`);
    this.mReleaseFlag = true;
    // typeof Resource or pixelMap is Object
    if (!CheckEmptyUtils.isEmpty(this.recentImage)) {
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
    if (!this.mReleaseFlag && missionId === this.missionId) {
      this.recentImage = snapShotInfo.snapShotImage;
      let width = snapShotInfo.snapShotImageWidth;
      let height = snapShotInfo.snapShotImageHeight;
      Log.showDebug(TAG, `recentMissionsSnapshotCallback recentImage: ${JSON.stringify(this.recentImage)},
        width: ${JSON.stringify(width)}, height: ${JSON.stringify(height)}`);
    } else {
      snapShotInfo.snapShotImage.release().catch((err) => {
        Log.showError(TAG, `image.PixelMap release err :${err}`)
      })
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

        .onClick((event) => {
          this.setStartAppInfo(event?.target?.area?.globalPosition);
        })
        Column() {
          Image(RecentsStyleConstants.DEFAULT_LOCKED_IMAGE)
            .visibility(this.lockedState ? Visibility.Visible : Visibility.Hidden)
            .width(this.mIsSingleLayout ?
              RecentsStyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE_NEW :
              RecentsStyleConstants.DOUBLE_LIST_DEFAULT_APP_ICON_SIZE - 10)
            .height(this.mIsSingleLayout ?
              RecentsStyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE_NEW :
              RecentsStyleConstants.DOUBLE_LIST_DEFAULT_APP_ICON_SIZE - 10)
            .margin({
              right: this.mIsSingleLayout ? (RecentsStyleConstants.SINGLE_LIST_LOCKED_IMAGE_RIGHT_MARGIN) : (RecentsStyleConstants.DOUBLE_LIST_LOCKED_IMAGE_RIGHT_MARGIN)
            })
            .onClick((event) => {
              this.isClickSubComponent = true;
              Log.showDebug(TAG, `click set recent mission: ${this.missionId} Locked status: ${!this.lockedState}`);
              this.mRecentMissionsViewModel.setRecentMissionLock(this.missionId,!this.lockedState);
              this.setStartAppInfo(event?.target?.area?.globalPosition);
              this.isClickSubComponent = false;
            })
        }
      }
      .margin({
        top: this.mIsSingleLayout ? RecentsStyleConstants.SINGLE_LIST_APP_INFO_TOP_MARGIN : RecentsStyleConstants.DOUBLE_LIST_APP_INFO_BOTTOM_MARGIN,
        bottom: this.mIsSingleLayout ? RecentsStyleConstants.SINGLE_LIST_APP_INFO_BOTTOM_MARGIN : RecentsStyleConstants.DOUBLE_LIST_APP_INFO_BOTTOM_MARGIN
      })

      Image(this.recentImage)
        .objectFit(ImageFit.Fill)
        .borderRadius(RecentsStyleConstants.RECENT_IMAGE_RADIUS)
        .width(this.mIsSingleLayout ?
          RecentsStyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH :
          RecentsStyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH)
        .height(this.mIsSingleLayout ?
          RecentsStyleConstants.SINGLE_LIST_APP_IMAGE_HEIGHT :
          RecentsStyleConstants.DOUBLE_LIST_APP_IMAGE_HEIGHT)
        .onClick((event) => {
          this.isClickSubComponent = true;
          Log.showDebug(TAG, 'onClick start launcher ability');
          if (!globalThis.recentMode || !windowManager.isSplitWindowMode(globalThis.recentMode)) {
            windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
          }
          Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
          this.setStartAppInfo(event?.target?.area?.globalPosition);
          this.mRecentMissionsViewModel.moveMissionToFront(this.missionId);
        })
    }
    .width(this.mIsSingleLayout ?
      RecentsStyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH :
      RecentsStyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH)
    .height(this.mIsSingleLayout ?
      RecentsStyleConstants.SINGLE_LIST_MISSION_HEIGHT :
      RecentsStyleConstants.DOUBLE_LIST_MISSION_HEIGHT)
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
          Log.showDebug(TAG, `gesture set recent mission: ${this.missionId} Locked status: ${!this.lockedState}`);
          this.mRecentMissionsViewModel.setRecentMissionLock(this.missionId,!this.lockedState);
        }
      }))
  }

  /**
   * set start app info
   */
  private setStartAppInfo(position) {
    AppStorage.SetOrCreate('startAppTypeFromPageDesktop', CommonConstants.OVERLAY_TYPE_APP_ICON);
    let appParams = {
      bundleName: this.bundleName,
      moduleName: this.moduleName,
      appIconId: this.appIconId,
      borderRadius: RecentsStyleConstants.RECENT_IMAGE_RADIUS,
      isSingleLayout: this.mIsSingleLayout,
      appIconSize:this.mIsSingleLayout ? RecentsStyleConstants.SINGLE_LIST_APP_IMAGE_WIDTH : RecentsStyleConstants.DOUBLE_LIST_APP_IMAGE_WIDTH,
      appIconHeight: this.mIsSingleLayout ? RecentsStyleConstants.SINGLE_LIST_MISSION_HEIGHT : RecentsStyleConstants.DOUBLE_LIST_MISSION_HEIGHT,
      position:position
    }
    AppStorage.SetOrCreate('startAppItemInfo', appParams);
    this.mRecentMissionStartAppHandler.setAppIconSize(appParams.appIconSize, appParams.appIconHeight);
    this.mRecentMissionStartAppHandler.setAppIconInfo();
  }
}