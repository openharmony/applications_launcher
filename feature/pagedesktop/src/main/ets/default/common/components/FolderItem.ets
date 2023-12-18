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
  PresetStyleConstants,
  AppItemInfo,
  FolderItemInfo,
  MenuInfo,
  FolderData
} from '@ohos/common';
import {
  BigFolderViewModel,
  BigFolderStyleConfig,
  BigFolderConstants
} from '@ohos/bigfolder';
import { PageDesktopDragHandler } from '../PageDesktopDragHandler';
import { PageDesktopViewModel } from '../../viewmodel/PageDesktopViewModel'
import { PageDesktopStartAppHandler } from '../PageDesktopStartAppHandler';
import { PageDesktopGridStyleConfig } from '../PageDesktopGridStyleConfig';

const TAG = 'FolderItem';

interface FolderItemType {
  folderId: string;
  folderName: string;
  enterEditing?: boolean;
  layoutInfo: AppItemInfo[][]
}

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
  private folderItem: LauncherDragItemInfo = new LauncherDragItemInfo();
  private isSwappingPage = false;
  private mAppItemWidth: number = 0;
  private mPageDesktopViewModel?: PageDesktopViewModel;
  private mBigFolderViewModel?: BigFolderViewModel;
  private mMargin: number = 0;
  private mGridSpaceWidth: number = 0;
  private mGridSpaceHeight: number = 0;
  private mIconMarginVertical: number = StyleConstants.DEFAULT_10;
  private mPageDesktopDragHandler: PageDesktopDragHandler = PageDesktopDragHandler.getInstance();
  private mPageDesktopStartAppHandler: PageDesktopStartAppHandler = PageDesktopStartAppHandler.getInstance();
  private mFolderStyleConfig: BigFolderStyleConfig = BigFolderViewModel.getInstance().getFolderStyleConfig();
  mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;

  aboutToAppear(): void  {
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    this.mPageDesktopStartAppHandler = PageDesktopStartAppHandler.getInstance();
    this.mBigFolderViewModel = BigFolderViewModel.getInstance();
    this.mFolderStyleConfig = this.mBigFolderViewModel.getFolderStyleConfig();
    this.mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    let styleConfig = this.mPageDesktopViewModel.getPageDesktopStyleConfig();
    this.mAppItemWidth = styleConfig.mIconSize;
    this.mAppNameHeight = styleConfig.mNameHeight;
    this.mAppNameSize = styleConfig.mNameSize;
    this.mIconMarginVertical = styleConfig.mIconMarginVertical;
    this.mMargin = styleConfig.mMargin;
    this.mGridSpaceWidth = Number(this.mPageDesktopViewModel.getWorkSpaceWidth()) - this.mMargin;
    this.mGridSpaceHeight = Number(this.mPageDesktopViewModel.getWorkSpaceHeight());
    this.openFolderStatus = AppStorage.get('openFolderStatus') != 'undefined' ? (AppStorage.get('openFolderStatus') as number) : BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE;
    this.formatFolderInfo();
  }

  /**
   * format FolderInfo
   */
  private formatFolderInfo() {
    if (typeof this.folderItem.layoutInfo === 'undefined') return;
    let column = this.mBigFolderViewModel?.getFolderLayoutConfig().column as number;
    let row = this.mBigFolderViewModel?.getFolderLayoutConfig().row as number;
    const allCount = column * row;
    if (this.folderItem.layoutInfo[0].length > allCount) {
      let folderLayoutInfoList: AppItemInfo[][] = [];
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
  private renameClick = () => {
    Log.showInfo(TAG, 'click menu folder rename');
    AppStorage.setOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    this.mBigFolderViewModel?.openFolder(true, this.folderItem as FolderData);
  }

  private getOpenFolder(): string {
    let openFolderData: FolderData = AppStorage.get('openFolderData') as FolderData;

    return openFolderData.folderId;
  }

  dragStart = (event: DragEvent): CustomBuilder => {
    ContextMenu.close();
    this.dragItemType = CommonConstants.DRAG_FROM_DESKTOP;
    this.folderItem.isDragging = true;
    this.pageDesktopDragItemInfo = this.folderItem;
    const selectAppIndex = PageDesktopDragHandler.getInstance().getItemIndex(event.getWindowX(), event.getWindowY());
    const startPosition = PageDesktopDragHandler.getInstance().getTouchPosition(event.getWindowX(), event.getWindowY())
    PageDesktopDragHandler.getInstance().mStartPosition = startPosition;
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
          nameFontColor: PageDesktopViewModel.getInstance().getPageDesktopStyleConfig().mNameFontColor as string,
          onAppIconClick: (event: ClickEvent, appItem: AppItemInfo) => {
            Log.showInfo(TAG, "onAppIconClick");
            Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
            this.setStartAppInfo(appItem);
            PageDesktopViewModel.getInstance().openApplication(appItem.abilityName, appItem.bundleName, appItem.moduleName);
          },
          onOpenFolderClick: (event: ClickEvent, folderItem: FolderData) => {
            Log.showInfo(TAG, "onOpenFolderClick");
            Trace.start(Trace.CORE_METHOD_OPEN_FOLDER);
            this.mBigFolderViewModel?.openFolder(false, folderItem);
          },
          onFolderTouch: (event: TouchEvent, folderItem: FolderData) => {
            if (event.type === CommonConstants.TOUCH_TYPE_UP && this.pageDesktopDragItemInfo.isDragging) {
              let mIsDragEffectArea = PageDesktopDragHandler.getInstance().isDragEffectArea(event.touches[0].windowX, event.touches[0].windowY);
              Log.showInfo(TAG, `onTouch mIsDragEffectArea: ${mIsDragEffectArea}`);
              if (!mIsDragEffectArea) {
                PageDesktopDragHandler.getInstance().deleteBlankPageOutsideEffect();
                AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
                AppStorage.setOrCreate('selectAppIndex', null);
              }
            }
          },
          onGetPosition: (getPosition: Function) => {
            Log.showInfo(TAG, "onGetPosition");
            let styleConfig = PageDesktopViewModel.getInstance().getPageDesktopStyleConfig() as PageDesktopGridStyleConfig;
            let row = this.folderItem.row as number;
            let column = this.folderItem.column as number;
            Log.showInfo(TAG, `onGetPosition currentFolderPosition row: ${row}, column: ${column}`);
            let x = styleConfig.mAppItemSize * column
            + styleConfig.mColumnsGap * column + styleConfig.mMargin + styleConfig.mIconMarginHorizontal;
            let y = styleConfig.mAppItemSize * row
            + styleConfig.mRowsGap * row + styleConfig.mDesktopMarginTop + styleConfig.mIconMarginVertical;
            Log.showInfo(TAG, `onGetPosition currentFolderPosition x: ${x}, y: ${y}`);
            getPosition(x, y);
          },
          buildMenu: (folderItem: LauncherDragItemInfo) => {
            return PageDesktopViewModel.getInstance().buildRenameMenuInfoList(folderItem, this.renameClick) as MenuInfo[];
          },
          dragStart: this.dragStart
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
          this.mBigFolderViewModel?.openFolder(false, this.folderItem as FolderData);
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
  private setStartAppInfo(appItem: AppItemInfo) {
    AppStorage.setOrCreate('startAppItemInfo', appItem);
    AppStorage.setOrCreate('startAppFromFolderItemInfo', this.folderItem);
    AppStorage.setOrCreate('startAppTypeFromPageDesktop', CommonConstants.OVERLAY_TYPE_FOLDER);
    this.mPageDesktopStartAppHandler.setAppIconSize(this.mFolderStyleConfig.mFolderAppSize);
    this.mPageDesktopStartAppHandler.setAppIconInfo();
  }
}