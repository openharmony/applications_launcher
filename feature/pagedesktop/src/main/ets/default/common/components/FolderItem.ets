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

import {
  FolderComponent,
} from '@ohos/common/component'
import {
  LauncherDragItemInfo,
  Log,
  Trace,
  StyleConstants,
  CommonConstants,
  PresetStyleConstants
} from '@ohos/common';
import {
  BigFolderViewModel,
  BigFolderStyleConfig,
  BigFolderConstants
} from '@ohos/bigfolder';
import { PageDesktopDragHandler } from '../PageDesktopDragHandler';
import { PageDesktopViewModel } from '../../viewmodel/PageDesktopViewModel'
import { PageDesktopStartAppHandler } from '../PageDesktopStartAppHandler';

const TAG = 'FolderItem';

/**
 * Folder item, which display on desktop workspace.
 */
@Component
export default struct FolderItem {
  @StorageLink('dragItemInfo') pageDesktopDragItemInfo: LauncherDragItemInfo = new LauncherDragItemInfo();
  @StorageLink('dragItemType') dragItemType: number = CommonConstants.DRAG_FROM_DESKTOP;
  @StorageLink('openFolderStatus') openFolderStatus: number = BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE;
  @StorageLink('selectDesktopAppItem') selectDesktopAppItem: string = '';
  private mAppNameHeight: number = StyleConstants.DEFAULT_APP_NAME_HEIGHT;
  private mAppNameSize: number = StyleConstants.DEFAULT_APP_NAME_SIZE;
  private folderItem: any;
  private isSwappingPage = false;
  private mAppItemWidth: number = 0;
  private mPageDesktopViewModel: PageDesktopViewModel;
  private mBigFolderViewModel: BigFolderViewModel;
  private mMargin: number = 0;
  private mGridSpaceWidth: number = 0;
  private mGridSpaceHeight: number = 0;
  private mIconMarginVertical: number = StyleConstants.DEFAULT_10;
  private mPageDesktopDragHandler: PageDesktopDragHandler;
  private mPageDesktopStartAppHandler: PageDesktopStartAppHandler;
  private mFolderStyleConfig: BigFolderStyleConfig;
  mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;

  aboutToAppear(): void  {
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    this.mPageDesktopStartAppHandler = PageDesktopStartAppHandler.getInstance();
    this.mBigFolderViewModel = BigFolderViewModel.getInstance();
    this.mFolderStyleConfig = this.mBigFolderViewModel.getFolderStyleConfig();
    this.mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    let mGridConfig = this.mPageDesktopViewModel.getGridConfig();
    let styleConfig = this.mPageDesktopViewModel.getPageDesktopStyleConfig();
    this.mAppItemWidth = styleConfig.mIconSize;
    this.mAppNameHeight = styleConfig.mNameHeight;
    this.mAppNameSize = styleConfig.mNameSize;
    this.mIconMarginVertical = styleConfig.mIconMarginVertical;
    this.mMargin = styleConfig.mMargin;
    this.mGridSpaceWidth = Number(this.mPageDesktopViewModel.getWorkSpaceWidth()) - this.mMargin;
    this.mGridSpaceHeight = Number(this.mPageDesktopViewModel.getWorkSpaceHeight());
    this.openFolderStatus = AppStorage.get('openFolderStatus') != 'undefined' ? AppStorage.get('openFolderStatus') : BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE;
    this.formatFolderInfo();
  }

  /**
   * format FolderInfo
   */
  private formatFolderInfo() {
    let column = this.mBigFolderViewModel.getFolderLayoutConfig().column;
    let row = this.mBigFolderViewModel.getFolderLayoutConfig().row;
    const allCount = column * row;
    if (this.folderItem.layoutInfo[0].length > allCount) {
      let folderLayoutInfoList = [];
      let integer = Math.floor(this.folderItem.layoutInfo[0].length / allCount);
      let remainder = this.folderItem.layoutInfo[0].length % allCount;
      for (let i = 0; i < integer; i++) {
        folderLayoutInfoList.push(this.folderItem.layoutInfo[0].slice(i * allCount, (i + 1) * allCount));
      }
      if (remainder != 0) {
        folderLayoutInfoList.push(this.folderItem.layoutInfo[0].slice(integer * allCount, integer * allCount + remainder));
      }
      this.folderItem.layoutInfo.splice(0, 1);
      this.folderItem.layoutInfo = folderLayoutInfoList;
    }
  }

  /**
   * When rename is clicked, call this function to change folder state.
   */
  private renameClick() {
    Log.showInfo(TAG, 'click menu folder rename');
    AppStorage.setOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    this.mBigFolderViewModel.openFolder(true, this.folderItem);
  }

  private getOpenFolder(): string {
    let openFolderData: {
      folderId: string,
      layoutInfo: any
    } = AppStorage.get('openFolderData');

    return openFolderData.folderId;
  }

  dragStart(event: DragEvent): CustomBuilder {
    ContextMenu.close();
    this.dragItemType = CommonConstants.DRAG_FROM_DESKTOP;
    this.pageDesktopDragItemInfo = Object.assign(new LauncherDragItemInfo(true), this.folderItem);
    const selectAppIndex = globalThis.PageDesktopDragHandler.getItemIndex(event.getWindowX(), event.getWindowY());
    const startPosition = globalThis.PageDesktopDragHandler.getTouchPosition(event.getWindowX(), event.getWindowY())
    globalThis.PageDesktopDragHandler.mStartPosition = startPosition;
    AppStorage.setOrCreate('selectAppIndex', selectAppIndex);
    Log.showInfo(TAG, `onDragStart event: [${event.getWindowX()}, ${event.getWindowY()}], selectAppIndex: ${selectAppIndex}`);
  }

  build() {
    Flex({
      direction: FlexDirection.Column,
      alignItems: ItemAlign.Center,
      justifyContent: FlexAlign.SpaceAround
    }) {
      Column() {
        FolderComponent({
          showFolderName: true,
          mFolderItem: this.folderItem,
          badgeNumber: this.folderItem.badgeNumber,
          isSelect: this.selectDesktopAppItem === this.folderItem.folderId,
          folderNameHeight: this.mAppNameHeight,
          folderNameLines: this.mNameLines,
          folderNameSize: this.mAppNameSize,
          folderGridSize:this.mFolderStyleConfig.mGridSize,
          appIconSize: this.mFolderStyleConfig.mFolderAppSize,
          gridMargin:this.mFolderStyleConfig.mGridMargin,
          mPaddingTop: this.mIconMarginVertical,
          gridGap:this.mFolderStyleConfig.mFolderGridGap,
          iconNameMargin: this.mFolderStyleConfig.mIconNameMargin,
          nameFontColor: this.mPageDesktopViewModel.getPageDesktopStyleConfig().mNameFontColor,
          onAppIconClick: (event, appItem) => {
            Log.showInfo(TAG, "onAppIconClick");
            Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
            this.setStartAppInfo(appItem);
            this.mPageDesktopViewModel.openApplication(appItem.abilityName, appItem.bundleName, appItem.moduleName);
          },
          onOpenFolderClick: (event, folderItem) => {
            Log.showInfo(TAG, "onOpenFolderClick");
            Trace.start(Trace.CORE_METHOD_OPEN_FOLDER);
            this.mBigFolderViewModel.openFolder(false, folderItem);
          },
          onFolderTouch: (event, folderItem) => {
            if (event.type === CommonConstants.TOUCH_TYPE_UP && this.pageDesktopDragItemInfo.isDragging) {
              let mIsDragEffectArea = globalThis.PageDesktopDragHandler.isDragEffectArea(event.touches[0].windowX, event.touches[0].windowY);
              Log.showInfo(TAG, `onTouch mIsDragEffectArea: ${mIsDragEffectArea}`);
              if (!mIsDragEffectArea) {
                globalThis.PageDesktopDragHandler.deleteBlankPageOutsideEffect();
                AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
                AppStorage.setOrCreate('selectAppIndex', null);
              }
            }
          },
          onGetPosition: (getPosition: Function) => {
            Log.showInfo(TAG, "onGetPosition");
            let styleConfig = this.mPageDesktopViewModel.getPageDesktopStyleConfig();
            let row = this.folderItem.row;
            let column = this.folderItem.column;
            Log.showInfo(TAG, `onGetPosition currentFolderPosition row: ${row}, column: ${column}`);
            let x = styleConfig.mAppItemSize * column
            + styleConfig.mColumnsGap * column + styleConfig.mMargin + styleConfig.mIconMarginHorizontal;
            let y = styleConfig.mAppItemSize * row
            + styleConfig.mRowsGap * row + styleConfig.mDesktopMarginTop + styleConfig.mIconMarginVertical;
            Log.showInfo(TAG, `onGetPosition currentFolderPosition x: ${x}, y: ${y}`);
            getPosition(x, y);
          },
          buildMenu: (folderItem) =>
          this.mPageDesktopViewModel.buildRenameMenuInfoList(folderItem, this.renameClick.bind(this)),
          dragStart: this.dragStart.bind(this)
        })
      }
      .visibility((this.pageDesktopDragItemInfo.folderId === this.folderItem.folderId || (this.openFolderStatus != 0 && this.getOpenFolder() == this.folderItem.folderId)) ? Visibility.Hidden : Visibility.Visible)
      .onMouse((event: MouseEvent) => {
        if (event.button == MouseButton.Right) {
          event.stopPropagation();
          Log.showInfo(TAG, 'onMouse mouse button right');
          AppStorage.setOrCreate('selectDesktopAppItem', this.folderItem.folderId);
        }
      })
      .gesture(
      GestureGroup(GestureMode.Exclusive,
      TapGesture({ count: 2 })
        .onAction((event: GestureEvent) => {
          Log.showInfo(TAG, 'TapGesture double click');
          this.mBigFolderViewModel.openFolder(false, this.folderItem);
        })
      )
      )
    }
    .parallelGesture(LongPressGesture({ repeat: false }))
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
  }

  /**
  * set start app info
  */
  private setStartAppInfo(appItem) {
    AppStorage.setOrCreate('startAppItemInfo', appItem);
    AppStorage.setOrCreate('startAppFromFolderItemInfo', this.folderItem);
    AppStorage.setOrCreate('startAppTypeFromPageDesktop', CommonConstants.OVERLAY_TYPE_FOLDER);
    this.mPageDesktopStartAppHandler.setAppIconSize(this.mFolderStyleConfig.mFolderAppSize);
    this.mPageDesktopStartAppHandler.setAppIconInfo();
  }
}