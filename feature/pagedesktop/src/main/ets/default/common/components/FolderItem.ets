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

import FolderComponent from '../../../../../../../../common/src/main/ets/default/uicomponents/FolderComponent'
import StyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import CommonConstants from '../../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PresetStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import FolderViewModel from '../../../../../../../bigfolder/src/main/ets/default/viewmodel/FolderViewModel';
import BigFolderStyleConfig from '../../../../../../../bigfolder/src/main/ets/default/common/BigFolderStyleConfig';
import PageDesktopViewModel from '../../../../../../../pagedesktop/src/main/ets/default/common/viewmodel/PageDesktopViewModel'
import PageDesktopDragHandler from '../PageDesktopDragHandler';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';
import Trace from '../../../../../../../../common/src/main/ets/default/utils/Trace';
import FeatureConstants from '../constants/FeatureConstants';

const FOLDER_INFO_REFRESH_DELAY = 500;
const TAG = 'FolderItem';

/**
 * Folder item, which display on desktop workspace.
 */
@Component
export default struct FolderItem {
  @StorageLink('selectDesktopAppItem') selectDesktopAppItem: string = '';
  @State isDragging: boolean = false;
  @State mAppNameHeight: number = StyleConstants.DEFAULT_APP_NAME_HEIGHT;
  @State mAppNameSize: number = StyleConstants.DEFAULT_APP_NAME_SIZE;
  private folderItem: any;
  private isSwappingPage = false;
  private mAppItemWidth: number = 0;
  private mPageDesktopViewModel: PageDesktopViewModel;
  private mFolderViewModel: FolderViewModel;
  private mMargin: number = 0;
  private mGridSpaceWidth: number = 0;
  private mGridSpaceHeight: number = 0;
  private mIconMarginVertical: number = StyleConstants.DEFAULT_10;
  private mPageDesktopDragHandler: PageDesktopDragHandler;
  private mFolderStyleConfig: BigFolderStyleConfig;
  mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;

  aboutToAppear(): void  {
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    this.mFolderViewModel = FolderViewModel.getInstance();
    this.mFolderStyleConfig = this.mFolderViewModel.getFolderStyleConfig();
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
    this.formatFolderInfo();
  }

  /**
   * format FolderInfo
   */
  private formatFolderInfo() {
    let column = this.mFolderViewModel.getFolderLayoutConfig().column;
    let row = this.mFolderViewModel.getFolderLayoutConfig().row;
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
   * The folder item on desktop workspace: drag state listener.
   */
  private mDragStateListener = {
    onItemDragStart: (event: any, itemIndex: number) => {
      this.isDragging = true;
    },
    onItemDragMove: (event: any, insertIndex: number, itemIndex: number) => {
      if (this.isSwappingPage) {
        return;
      }
      let moveX = event.touches[0].screenX;
      let moveY = event.touches[0].screenY;
      if ((moveX - this.mAppItemWidth / 2) < this.mMargin
      && this.mPageDesktopViewModel.getIndex() > 0 && moveY < this.mGridSpaceHeight) {
        this.mPageDesktopViewModel.showPrevious();
        this.movingFolderSwapPageDelay();
      } else if ((moveX + this.mAppItemWidth / 2) > this.mGridSpaceWidth && moveY < this.mGridSpaceHeight) {
        if (this.mPageDesktopViewModel.getIndex() == this.mPageDesktopViewModel.getGridPageCount() - 1
        && !this.mPageDesktopViewModel.isBlankPage()) {
          this.mPageDesktopViewModel.addBlankPage(true);
        } else if (this.mPageDesktopViewModel.getIndex() < this.mPageDesktopViewModel.getGridPageCount() - 1) {
          this.mPageDesktopViewModel.showNext();
        }
        this.movingFolderSwapPageDelay();
      }
    },
    onItemDragEnd: () => {
      this.isDragging = false;
    }
  };

  /**
   * When rename is clicked, call this function to change folder state.
   */
  private renameClick() {
    Log.showInfo(TAG, 'click menu folder rename');
    AppStorage.SetOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    this.mFolderViewModel.openFolder(true, this.folderItem);
  }

  /**
   * Increase delay when dragging folder to other page.
   */
  movingFolderSwapPageDelay() {
    this.isSwappingPage = true;
    setTimeout(() => {
      this.isSwappingPage = false;
    }, FOLDER_INFO_REFRESH_DELAY);
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
            this.mPageDesktopViewModel.openApplication(appItem.abilityName, appItem.bundleName, appItem.moduleName);
          },
          onOpenFolderClick: (event, folderItem) => {
            Log.showInfo(TAG, "onOpenFolderClick");
            Trace.start(Trace.CORE_METHOD_OPEN_FOLDER);
            this.mFolderViewModel.openFolder(false, folderItem);
          },
          onFolderTouch: (event, folderItem) => {
            Log.showInfo(TAG, "onFolderTouch");
            AppStorage.SetOrCreate('dragFocus', FeatureConstants.FEATURE_NAME);
            this.mPageDesktopDragHandler.setDragStateListener(this.mDragStateListener);
            this.mPageDesktopDragHandler.notifyTouchEventUpdate(event);
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
          this.mPageDesktopViewModel.buildRenameMenuInfoList(folderItem, this.renameClick.bind(this))
        })
      }
      .visibility(this.isDragging ? Visibility.Hidden : Visibility.Visible)
      .onMouse((event: MouseEvent) => {
        if (event.button == MouseButton.Right) {
          event.stopPropagation();
          Log.showInfo(TAG, 'onMouse mouse button right');
          AppStorage.SetOrCreate('selectDesktopAppItem', this.folderItem.folderId);
        }
      })
      .gesture(
      GestureGroup(GestureMode.Exclusive,
      TapGesture({ count: 2 })
        .onAction((event: GestureEvent) => {
          Log.showInfo(TAG, 'TapGesture double click');
          this.mFolderViewModel.openFolder(false, this.folderItem);
        })
      )
      )
    }
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
  }
}