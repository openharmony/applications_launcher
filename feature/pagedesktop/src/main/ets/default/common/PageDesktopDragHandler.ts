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

import { Log } from '@ohos/common';
import { DragArea } from '@ohos/common';
import { BaseDragHandler } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { SettingsModel } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { PageDesktopModel } from '@ohos/common';
import { DragItemPosition } from '@ohos/common';
import { FormViewModel } from '@ohos/form';
import { BigFolderViewModel } from '@ohos/bigfolder';
import { PageDesktopGridStyleConfig } from './PageDesktopGridStyleConfig';
import PageDesktopConstants from './constants/PageDesktopConstants'

const TAG = 'PageDesktopDragHandler';

/**
 * Desktop workspace drag and drop processing class
 */
export class PageDesktopDragHandler extends BaseDragHandler {
  private readonly mPageDesktopStyleConfig: PageDesktopGridStyleConfig;
  private readonly mBigFolderViewModel: BigFolderViewModel;
  private readonly mFormViewModel: FormViewModel;
  private readonly mSettingsModel: SettingsModel;
  private readonly mPageDesktopModel: PageDesktopModel;
  private mGridConfig;
  private mPageCoordinateData = {
    gridXAxis: [],
    gridYAxis: []
  };
  private mStartPosition: DragItemPosition;
  private mEndPosition: DragItemPosition;
  private readonly styleConfig;
  private mGridItemHeight: number;
  private mGridItemWidth: number;

  private constructor() {
    super();
    this.mBigFolderViewModel = BigFolderViewModel.getInstance();
    this.mSettingsModel = SettingsModel.getInstance();
    this.mFormViewModel = FormViewModel.getInstance();
    this.mPageDesktopModel = PageDesktopModel.getInstance();
    this.mPageDesktopStyleConfig = layoutConfigManager.getStyleConfig(PageDesktopGridStyleConfig.APP_GRID_STYLE_CONFIG,
      PageDesktopConstants.FEATURE_NAME);
  }

  static getInstance(): PageDesktopDragHandler {
    if (globalThis.PageDesktopDragHandler == null) {
      globalThis.PageDesktopDragHandler = new PageDesktopDragHandler();
    }
    return globalThis.PageDesktopDragHandler;
  }

  setDragEffectArea(effectArea): void {
    Log.showDebug(TAG, `setDragEffectArea:${JSON.stringify(effectArea)}`)
    AppStorage.SetOrCreate('pageDesktopDragEffectArea', effectArea);
    super.setDragEffectArea(effectArea);
    this.updateGridParam(effectArea);
  }

  isDragEffectArea(x: number, y: number): boolean {
    const isInEffectArea = super.isDragEffectArea(x, y);
    Log.showDebug(TAG, `isDragEffectArea x: ${x}, y: ${y}, isInEffectArea: ${isInEffectArea}`);
    const deviceType: string = AppStorage.Get('deviceType');
    const smartDockDragEffectArea: DragArea = AppStorage.Get('smartDockDragEffectArea');
    Log.showDebug(TAG, `isDragEffectArea smartDockDragEffectArea: ${JSON.stringify(smartDockDragEffectArea)}`);
    if (smartDockDragEffectArea) {
      if (deviceType == CommonConstants.DEFAULT_DEVICE_TYPE) {
        if (isInEffectArea || (y <= smartDockDragEffectArea.bottom && y >= smartDockDragEffectArea.top)
        && x <= smartDockDragEffectArea.right && x >= smartDockDragEffectArea.left) {
          return true;
        }
        return false;
      }
      return isInEffectArea;
    }
    return false;
  }

  getRow(index: number): number {
    return ~~(index / this.mSettingsModel.getGridConfig().column);
  }

  getColumn(index: number): number {
    return index % this.mSettingsModel.getGridConfig().column;
  }

  private updateGridParam(effectArea: DragArea): void {
    const gridWidth = this.mPageDesktopStyleConfig.mGridWidth;
    const gridHeight = this.mPageDesktopStyleConfig.mGridHeight;
    Log.showDebug(TAG, `updateGridParam gridWidth: ${gridWidth}, gridHeight: ${gridHeight}`);
    this.mGridConfig = this.mSettingsModel.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    const columnsGap =  this.mPageDesktopStyleConfig.mColumnsGap;
    const rowGap =  this.mPageDesktopStyleConfig.mRowsGap;
    this.mGridItemHeight = row > 0 ? (gridHeight + columnsGap) / row : 0;
    this.mGridItemWidth = column > 0 ? (gridWidth + rowGap) / column : 0;
    Log.showDebug(TAG, `updateGridParam column: ${column}, row: ${row}`);
    this.mPageCoordinateData.gridYAxis = [];
    for (let i = 1; i <= row; i++) {
      const touchPositioningY = (gridHeight / row) * i + effectArea.top;
      this.mPageCoordinateData.gridYAxis.push(touchPositioningY);
    }

    this.mPageCoordinateData.gridXAxis = [];
    for (let i = 1; i <= column; i++) {
      const touchPositioningX = (gridWidth / column) * i + effectArea.left;
      this.mPageCoordinateData.gridXAxis.push(touchPositioningX);
    }
  }

  protected getDragRelativeData(): any {
    const desktopDataInfo: {
      appGridInfo: [[]]
    } = AppStorage.Get('appListInfo');
    return desktopDataInfo.appGridInfo;
  }

  protected getItemIndex(x: number, y: number): number {
    Log.showInfo(TAG, `getItemIndex x: ${x}, y: ${y}`);
    let rowVal = CommonConstants.INVALID_VALUE;
    for (let index = 0; index < this.mPageCoordinateData.gridYAxis.length; index++) {
      if (this.mPageCoordinateData.gridYAxis[index] > y) {
        rowVal = index;
        break;
      }
    }
    let columnVal = CommonConstants.INVALID_VALUE;
    for (let index = 0; index < this.mPageCoordinateData.gridXAxis.length; index++) {
      if (this.mPageCoordinateData.gridXAxis[index] > x) {
        columnVal = index;
        break;
      }
    }
    const column = this.mGridConfig.column;
    if (rowVal != CommonConstants.INVALID_VALUE && columnVal != CommonConstants.INVALID_VALUE) {
      return rowVal * column + columnVal;
    }
    return CommonConstants.INVALID_VALUE;
  }

  protected getItemByIndex(index: number): any {
    const column = index % this.mGridConfig.column;
    const row = Math.floor(index / this.mGridConfig.column);
    const pageIndex: number = AppStorage.Get('pageIndex');
    const appGridInfo = this.getDragRelativeData();
    Log.showInfo(TAG, `getItemByIndex pageIndex: ${pageIndex}, appGridInfo length: ${appGridInfo.length},
    column: ${column}, row: ${row}`);
    const itemInfo = appGridInfo[pageIndex].find(item => {
      if (item.typeId == CommonConstants.TYPE_APP) {
        return item.column == column && item.row == row;
      } else if (item.typeId == CommonConstants.TYPE_FOLDER || item.typeId == CommonConstants.TYPE_CARD) {
        return this.isItemInRowColumn(row, column, item);
      }
    });
    return itemInfo;
  }

  /**
   * judge the item is at target row and column
   * @param row
   * @param column
   * @param item
   */
  private isItemInRowColumn(row: number, column: number, item: any): boolean {
    return item.column <= column && column < item.column + item.area[0] && item.row <= row && row < item.row + item.area[1];
  }

  private getTouchPosition(x: number, y: number): DragItemPosition {
    const pageIndex: number = AppStorage.Get('pageIndex');
    Log.showDebug(TAG, `getTouchPosition pageIndex: ${pageIndex}`);
    const position: DragItemPosition = {
      page: pageIndex,
      row: 0,
      column: 0,
      X: x,
      Y: y,
    };
    for (let i = 0; i < this.mPageCoordinateData.gridXAxis.length; i++) {
      if (x < this.mPageCoordinateData.gridXAxis[i]) {
        position.column = i;
        break;
      } else {
        position.column = this.mPageCoordinateData.gridXAxis.length - 1;
      }
    }
    for (let i = 0; i < this.mPageCoordinateData.gridYAxis.length; i++) {
      if (y < this.mPageCoordinateData.gridYAxis[i]) {
        position.row = i;
        break;
      } else {
        position.row = this.mPageCoordinateData.gridYAxis.length - 1;
      }
    }
    return position;
  }

  onDragStart(x: number, y: number): void {
    this.mStartPosition = null;
    Log.showInfo(TAG, `onDragStart start`);
    const selectAppIndex = this.getItemIndex(x, y);
    AppStorage.SetOrCreate('selectAppIndex', selectAppIndex);
    this.mStartPosition = this.getTouchPosition(x, y);
  }

  onDragDrop(x: number, y: number): boolean {
    const dragItemInfo: any = AppStorage.Get('dragItemInfo');
    if (JSON.stringify(dragItemInfo) == '{}') {
      return false;
    }
    const dragItemType: number = AppStorage.Get('dragItemType');
    const deviceType: string = AppStorage.Get('deviceType')
    // dock appInfo has no location information.
    if (dragItemType === CommonConstants.DRAG_FROM_DOCK && deviceType == CommonConstants.DEFAULT_DEVICE_TYPE) {
      dragItemInfo.typeId = CommonConstants.TYPE_APP;
      dragItemInfo.area = [1, 1];
      dragItemInfo.page = AppStorage.Get('pageIndex');
    }
    Log.showDebug(TAG, `onDragEnd dragItemInfo: ${JSON.stringify(dragItemInfo)}`);
    const endIndex = this.getItemIndex(x, y);
    const startPosition: DragItemPosition = this.copyPosition(this.mStartPosition);
    let endPosition: DragItemPosition = null;
    this.mEndPosition = this.getTouchPosition(x, y);
    Log.showDebug(TAG, `onDragEnd mEndPosition: ${JSON.stringify(this.mEndPosition)}`);
    endPosition = this.copyPosition(this.mEndPosition);
    const info = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = info.layoutInfo;
    if (dragItemInfo.typeId == CommonConstants.TYPE_FOLDER || dragItemInfo.typeId == CommonConstants.TYPE_CARD ) {
      this.updateEndPosition(dragItemInfo);
      AppStorage.SetOrCreate('positionOffset', []);
    } else {
      if (this.isMoveToSamePosition(dragItemInfo)) {
        this.deleteBlankPageAfterDragging(startPosition, endPosition);
        return false;
      }
      const endLayoutInfo = this.getEndLayoutInfo(layoutInfo);
      if (endLayoutInfo != undefined) {
        // add app to folder
        if (endLayoutInfo.typeId === CommonConstants.TYPE_FOLDER) {
          this.mBigFolderViewModel.addOneAppToFolder(dragItemInfo, endLayoutInfo.folderId);
          if (dragItemType === CommonConstants.DRAG_FROM_DOCK && deviceType == CommonConstants.DEFAULT_DEVICE_TYPE) {
            localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE, dragItemInfo);
          }
          this.deleteBlankPageAfterDragging(startPosition, endPosition);
          return true;
        } else if (endLayoutInfo.typeId === CommonConstants.TYPE_APP) {
          // create a new folder
          const layoutInfoList = [endLayoutInfo];
          let startLayoutInfo = null;
          if (dragItemType === CommonConstants.DRAG_FROM_DOCK && deviceType == CommonConstants.DEFAULT_DEVICE_TYPE) {
            let appInfoList = this.mSettingsModel.getAppListInfo();
            const appIndex = appInfoList.findIndex(item => {
              return item.keyName === dragItemInfo.keyName;
            })
            if (appIndex == CommonConstants.INVALID_VALUE) {
              appInfoList.push({
                "appName": dragItemInfo.appName,
                "isSystemApp": dragItemInfo.isSystemApp,
                "isUninstallAble": dragItemInfo.isUninstallAble,
                "appIconId": dragItemInfo.appIconId,
                "appLabelId": dragItemInfo.appLabelId,
                "bundleName": dragItemInfo.bundleName,
                "abilityName": dragItemInfo.abilityName,
                "moduleName": dragItemInfo.moduleName,
                "keyName": dragItemInfo.keyName,
                "typeId": dragItemInfo.typeId,
                "area": dragItemInfo.area,
                "page": dragItemInfo.page,
                "column": this.getColumn(endIndex),
                "row": this.getRow(endIndex),
                "x": 0,
                "installTime": dragItemInfo.installTime
              })
              this.mSettingsModel.setAppListInfo(appInfoList);
            }
            startLayoutInfo = dragItemInfo;
            localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE, dragItemInfo);
          } else {
            startLayoutInfo = this.getStartLayoutInfo(layoutInfo, dragItemInfo);
          }
          layoutInfoList.push(startLayoutInfo);
          this.mBigFolderViewModel.addNewFolder(layoutInfoList).then(()=> {
            this.deleteBlankPageAfterDragging(startPosition, endPosition);
          });
          return true;
        }
      }
    }

    if (dragItemType === CommonConstants.DRAG_FROM_DOCK && deviceType == CommonConstants.DEFAULT_DEVICE_TYPE) {
      let appInfoTemp = {
        "bundleName": dragItemInfo.bundleName,
        "typeId": dragItemInfo.typeId,
        "abilityName": dragItemInfo.abilityName,
        "moduleName": dragItemInfo.moduleName,
        "keyName": dragItemInfo.keyName,
        "area": dragItemInfo.area,
        "page": dragItemInfo.page,
        "column": this.getColumn(endIndex),
        "row": this.getRow(endIndex)
      };
      layoutInfo.push(appInfoTemp);
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE, dragItemInfo);
    } else {
      this.checkAndMove(this.mStartPosition, this.mEndPosition, layoutInfo, dragItemInfo);
    }

    info.layoutInfo = layoutInfo;
    this.mSettingsModel.setLayoutInfo(info);
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_SMARTDOCK_INIT_FINISHED, null);
    this.deleteBlankPageAfterDragging(startPosition, endPosition);
    return true;
  }

  deleteBlankPageOutsideEffect() {
    // delete Blank Page because of drag outside effect area
    Log.showInfo(TAG, "deleteBlankPageOutsideEffect" );
    const startPosition: DragItemPosition = this.copyPosition(this.mStartPosition);
    this.deleteBlankPageAfterDragging(startPosition, startPosition);
  }

  /**
   * copy a new position object by original position
   *
   * @param position - original position
   */
  private copyPosition(position: DragItemPosition): DragItemPosition {
    if (CheckEmptyUtils.isEmpty(position)) {
      return null;
    }
    const directionPosition: DragItemPosition = {
      page: position.page,
      row: position.row,
      column: position.column,
      X: position.X,
      Y: position.Y
    };
    return directionPosition;
  }

  /**
   * delete blank page after dragging
   *
   * @param startPosition - drag start position
   * @param endPosition - drag end position
   */
  deleteBlankPageAfterDragging(startPosition: DragItemPosition, endPosition: DragItemPosition): void {
    const layoutInfo = this.mSettingsModel.getLayoutInfo();
    const pageCount = layoutInfo.layoutDescription.pageCount;
    const isAddByDraggingFlag = this.mPageDesktopModel.isAddByDragging();
    let deleteLastFlag = false;
    if (isAddByDraggingFlag && (CheckEmptyUtils.isEmpty(endPosition) ||
    !CheckEmptyUtils.isEmpty(endPosition) && endPosition.page != pageCount - 1 )) {
      layoutInfo.layoutDescription.pageCount = pageCount - 1;
      deleteLastFlag = true;
    }
    let deleteStartFlag = false;
    if (!CheckEmptyUtils.isEmpty(startPosition)) {
      deleteStartFlag = this.mPageDesktopModel.deleteBlankPageFromLayoutInfo(layoutInfo, startPosition.page);
    }
    if (CheckEmptyUtils.isEmpty(endPosition) || JSON.stringify(startPosition) === JSON.stringify(endPosition)) {
      Log.showDebug(TAG, `pageIndex: ${JSON.stringify(startPosition) === JSON.stringify(endPosition)}`);
      AppStorage.SetOrCreate('pageIndex', startPosition.page);
    } else if (deleteStartFlag) {
      if (startPosition.page > endPosition.page) {
        AppStorage.SetOrCreate('pageIndex', endPosition.page);
      } else if (endPosition.page > startPosition.page &&
      endPosition.page < layoutInfo.layoutDescription.pageCount) {
        AppStorage.SetOrCreate('pageIndex', endPosition.page - 1);
      }
    }
    this.mPageDesktopModel.setAddByDragging(false);
    if (deleteLastFlag || deleteStartFlag) {
      this.mSettingsModel.setLayoutInfo(layoutInfo);
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_REFRESH, null);
    }
  }

  private isMoveToSamePosition(dragItemInfo): boolean {
    if (this.mEndPosition.page == dragItemInfo.page &&
    this.mEndPosition.row == dragItemInfo.row && this.mEndPosition.column == dragItemInfo.column) {
      return true;
    }
    return false;
  }

  private updateEndPosition(dragItemInfo): void {
    const positionOffset = AppStorage.Get('positionOffset');

    this.mEndPosition.row = this.mEndPosition.row - positionOffset[1];
    this.mEndPosition.column = this.mEndPosition.column - positionOffset[0];
    this.mGridConfig = this.mSettingsModel.getGridConfig();
    if (this.mEndPosition.row < 0) {
      this.mEndPosition.row = 0;
    } else if (this.mEndPosition.row + dragItemInfo.area[1] > this.mGridConfig.row) {
      this.mEndPosition.row = this.mGridConfig.row - dragItemInfo.area[1];
    }
    if (this.mEndPosition.column < 0) {
      this.mEndPosition.column = 0;
    } else if (this.mEndPosition.column + dragItemInfo.area[0] > this.mGridConfig.column ) {
      this.mEndPosition.column = this.mGridConfig.column - dragItemInfo.area[0];
    }
  }

  private getEndLayoutInfo(layoutInfo) {
    const endLayoutInfo = layoutInfo.find(item => {
      if (item.typeId == CommonConstants.TYPE_FOLDER || item.typeId == CommonConstants.TYPE_CARD) {
        return item.page === this.mEndPosition.page && this.isItemInRowColumn(this.mEndPosition.row, this.mEndPosition.column, item);
      } else if (item.typeId == CommonConstants.TYPE_APP) {
        return item.page === this.mEndPosition.page && item.row === this.mEndPosition.row && item.column === this.mEndPosition.column;
      }
    });
    return endLayoutInfo;
  }

  private getStartLayoutInfo(layoutInfo, dragItemInfo) {
    const startLayoutInfo = layoutInfo.find(item => {
      return item.page === dragItemInfo.page && item.row === dragItemInfo.row && item.column === dragItemInfo.column;
    });
    return startLayoutInfo;
  }

  /**
   * folder squeeze handle
   * @param source
   * @param destination
   * @param layoutInfo
   * @param dragItemInfo
   */
  private checkAndMove(source, destination, layoutInfo, dragItemInfo): boolean {
    Log.showDebug(TAG, 'checkAndMove start');

    const allPositions = this.getAllPositions(destination, layoutInfo);
    const objectPositionCount = this.getObjectPositionCount(destination, layoutInfo);
    const pressedPositions = this.getPressedObjects(destination, allPositions, dragItemInfo);

    // source and destination is in the same page
    if (source.page == destination.page && !this.checkCanMoveInSamePage(pressedPositions, objectPositionCount, dragItemInfo)) {
      return false;
    }
    // source and destination is in diff page
    if (source.page != destination.page && !this.checkCanMoveInDiffPage(allPositions, dragItemInfo)) {
      return false;
    }

    if (source.page == destination.page) {
      this.setSourcePositionToNull(dragItemInfo, allPositions);
    }
    this.setDestinationPosition(destination, allPositions, dragItemInfo);

    Log.showDebug(TAG, `checkAndMove pressedPositions.foldersAndForms: ${pressedPositions.foldersAndForms.length}`);
    if (pressedPositions.foldersAndForms.length != 0) {
      if (!this.moveFoldersAndForms(pressedPositions.foldersAndForms, destination, allPositions, dragItemInfo)) {
        return false;
      }
    }
    Log.showDebug(TAG, `checkAndMove pressedPositions.apps.length: ${pressedPositions.apps.length}`);
    if (pressedPositions.apps.length != 0) {
      this.moveApps(pressedPositions.apps, allPositions);
    }
    Log.showDebug(TAG, 'checkAndMove update destination ');
    this.updateDestinationByDragItem(dragItemInfo, destination, allPositions);
    Log.showDebug(TAG, 'checkAndMove update layoutInfo ');
    for (let index = 0; index < layoutInfo.length; index++) {
      for (let row = allPositions.length - 1; row >= 0 ; row--) {
        for (let column = allPositions[row].length - 1; column >= 0 ; column--) {
          if (layoutInfo[index].typeId == CommonConstants.TYPE_APP && layoutInfo[index].keyName == allPositions[row][column].keyName ||
          layoutInfo[index].typeId == CommonConstants.TYPE_FOLDER && layoutInfo[index].folderId == allPositions[row][column].keyName ||
          layoutInfo[index].typeId == CommonConstants.TYPE_CARD && layoutInfo[index].cardId == allPositions[row][column].keyName) {
            layoutInfo[index].row = row;
            layoutInfo[index].column = column;
            layoutInfo[index].page = destination.page;
          }
        }
      }
    }
    Log.showDebug(TAG, 'checkAndMove end');
    return true;
  }

  /**
   * get desktop's position info
   * @param destination
   * @param layoutInfo
   */
  private getAllPositions(destination, layoutInfo): any[] {
    Log.showDebug(TAG, 'getAllPositions start');
    const allPositions = [];
    this.setAllpositionsToNull(allPositions);

    // set position in layoutInfo to all positions
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].page == destination.page) {
        if (layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER || layoutInfo[i].typeId == CommonConstants.TYPE_CARD) {
          let keyName = '';
          if (layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER) {
            keyName = layoutInfo[i].folderId;
          } else if (layoutInfo[i].typeId == CommonConstants.TYPE_CARD) {
            keyName = layoutInfo[i].cardId;
          }

          const positionInLayoutInfo = {
            typeId: layoutInfo[i].typeId,
            keyName: keyName,
            area: layoutInfo[i].area
          };
          for (let k = 0; k < layoutInfo[i].area[1]; k++) {
            for (let j = 0; j < layoutInfo[i].area[0]; j++) {
              allPositions[layoutInfo[i].row + k][layoutInfo[i].column + j] = positionInLayoutInfo;
            }
          }
        } else if (layoutInfo[i].typeId == CommonConstants.TYPE_APP) {
          const positionInLayoutInfo = {
            typeId: layoutInfo[i].typeId,
            keyName: layoutInfo[i].keyName,
            area: layoutInfo[i].area
          };
          allPositions[layoutInfo[i].row][layoutInfo[i].column] = positionInLayoutInfo;
        }
      }
    }
    return allPositions;
  }

  private setAllpositionsToNull(allPositions): void {
    const mGridConfig = this.mSettingsModel.getGridConfig();
    const pageRow = mGridConfig.row;
    const pageColumn = mGridConfig.column;

    // set null to all positions in current page
    for (let row = 0; row < pageRow; row++) {
      const rowPositions = [];
      for (let column = 0; column < pageColumn; column++) {
        const position = {
          typeId: -1,
          keyName: 'null',
          area: []
        };
        rowPositions.push(position);
      }
      allPositions.push(rowPositions);
    }
  }

  /**
   * get desktop's position count by Object
   * @param destination
   * @param layoutInfo
   */
  private getObjectPositionCount(destination, layoutInfo): Map<string, number> {
    Log.showDebug(TAG, 'getObjectPositionCount start');

    const objectPositionCount = new Map<string, number>();
    // set position in layoutInfo to all positions
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].page == destination.page) {
        const count = layoutInfo[i].area[0] * layoutInfo[i].area[1];
        let keyName = '';
        if (layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER) {
          keyName = layoutInfo[i].folderId;
        } else if (layoutInfo[i].typeId == CommonConstants.TYPE_CARD) {
          keyName = layoutInfo[i].cardId;
        } else if (layoutInfo[i].typeId == CommonConstants.TYPE_APP) {
          keyName = layoutInfo[i].keyName;
        }
        objectPositionCount.set(keyName, count);
      }
    }
    return objectPositionCount;
  }

  /**
   * get Object under pressed big folder or form
   * @param destination
   * @param allPositions
   * @param dragItemInfo
   */
  private getPressedObjects(destination, allPositions, dragItemInfo) {
    Log.showDebug(TAG, 'getPressedObjects start');
    const row = destination.row;
    const column = destination.column;
    const apps = [];
    const foldersAndForms = [];

    Log.showDebug(TAG, `getPressedObjects destination.row: ${row},destination.column:${column}`);

    for (let j = 0; j < dragItemInfo.area[1]; j++) {
      for (let i = 0; i < dragItemInfo.area[0]; i++) {
        if (allPositions[row + j][column + i].typeId == CommonConstants.TYPE_APP) {
          apps.push(allPositions[row + j][column + i]);
        } else if (allPositions[row + j][column + i].typeId == CommonConstants.TYPE_FOLDER &&
        allPositions[row + j][column + i].keyName != dragItemInfo.folderId) {
          foldersAndForms.push(allPositions[row + j][column + i]);
        } else if (allPositions[row + j][column + i].typeId == CommonConstants.TYPE_CARD &&
        allPositions[row + j][column + i].keyName != dragItemInfo.cardId) {
          foldersAndForms.push(allPositions[row + j][column + i]);
        }
      }
    }

    Log.showDebug(TAG, `getPressedObjects foldersAndForms.length: ${foldersAndForms.length}`);
    Log.showDebug(TAG, `getPressedObjects apps.length: ${apps.length}`);
    const pressedObjects = {
      apps,
      foldersAndForms
    };
    return pressedObjects;
  }

  /**
   * check of canMove in same page
   * @param pressedPositions
   * @param objectPositionCount
   * @param dragItemInfo
   */
  private checkCanMoveInSamePage(pressedPositions, objectPositionCount, dragItemInfo): boolean {
    Log.showDebug(TAG, 'checkCanMoveInSamePage start');
    const foldersAndForms = pressedPositions.foldersAndForms;
    if (foldersAndForms.length == 0) {
      return true;
    }

    if (foldersAndForms.length == 1) {
      if (dragItemInfo.typeId == CommonConstants.TYPE_APP && foldersAndForms[0].typeId == CommonConstants.TYPE_CARD) {
        return true;
      }
    }

    const coverPositionCount = new Map<string, number>();
    Log.showDebug(TAG, `checkCanMoveInSamePage foldersAndForms.length: ${foldersAndForms.length}`);
    for (let i = 0; i < foldersAndForms.length; i++) {
      const keyName = foldersAndForms[i].keyName;
      if (coverPositionCount.has(keyName)) {
        coverPositionCount.set(keyName, coverPositionCount.get(keyName) + 1);
      } else {
        coverPositionCount.set(keyName, 1);
      }
    }

    for (const keyName of coverPositionCount.keys()) {
      if (coverPositionCount.get(keyName) < objectPositionCount.get(keyName) / 2) {
        Log.showDebug(TAG, 'checkCanMoveInSamePage end false');
        return false;
      }
    }
    return true;
  }

  /**
   * check of canMove in diff page
   * @param allPositions
   */
  private checkCanMoveInDiffPage(allPositions, dragItemInfo): boolean {
    Log.showDebug(TAG, 'checkCanMoveInDiffPage start');
    let count = 0;
    for (let i = 0; i < allPositions.length; i++) {
      for (let j = 0; j < allPositions[i].length; j++) {
        if (allPositions[i][j].typeId == -1) {
          count++;
        }
      }
    }
    const minCount = dragItemInfo.area[0] * dragItemInfo.area[1];
    // target page empty position min is dragItemInfo's need position
    if (count < minCount) {
      Log.showDebug(TAG, 'checkCanMoveInDiffPage end false');
      return false;
    }
    return true;
  }

  /**
   * set source‘s position to null
   * @param source
   * @param allPositions
   */
  private setSourcePositionToNull(dragItemInfo, allPositions): void {
    Log.showDebug(TAG, 'setSourcePositionToNull start');
    for (let j = 0; j < dragItemInfo.area[1]; j++) {
      for (let i = 0; i < dragItemInfo.area[0]; i++) {
        const nullPosition = {
          typeId: -1,
          keyName: 'null',
          area: []
        };
        allPositions[dragItemInfo.row + j][dragItemInfo.column + i] = nullPosition;
      }
    }
  }

  /**
   * set direction‘s position to null
   * @param destination
   * @param allPositions
   * @param dragItemInfo
   */
  private setDestinationPosition(destination, allPositions, dragItemInfo): void {
    Log.showDebug(TAG, 'setDestinationPosition start');
    let keyName = '';
    if (dragItemInfo.typeId == CommonConstants.TYPE_FOLDER) {
      keyName = dragItemInfo.folderId;
    } else if (dragItemInfo.typeId == CommonConstants.TYPE_CARD) {
      keyName = dragItemInfo.cardId;
    } else if (dragItemInfo.typeId == CommonConstants.TYPE_APP) {
      keyName = dragItemInfo.keyName;
    }

    for (let j = 0; j < dragItemInfo.area[1]; j++) {
      for (let i = 0; i < dragItemInfo.area[0]; i++) {
        if (allPositions[destination.row + j][destination.column+ i].typeId == -1) {
          const destinationPosition = {
            typeId: dragItemInfo.typeId,
            keyName: keyName,
            area: dragItemInfo.area
          };
          allPositions[destination.row + j][destination.column+ i] = destinationPosition;
        }
      }
    }
  }

  /**
   * move folders and forms to target position
   * @param foldersAndForms
   * @param destination
   * @param allPositions
   * @param dragItemInfo
   */
  private moveFoldersAndForms(foldersAndForms, destination, allPositions, dragItemInfo): boolean {
    Log.showDebug(TAG, 'moveFoldersAndForms start');
    const movedFoldersAndForms = [];
    for (let i = 0; i < foldersAndForms.length; i++) {
      const moveFolderOrForm = foldersAndForms[i];
      if (movedFoldersAndForms.indexOf(moveFolderOrForm.keyName) != -1) {
        continue;
      }

      for (let row = 0; row < allPositions.length; row++) {
        for (let column = 0; column < allPositions[row].length; column++) {
          if (moveFolderOrForm.keyName == allPositions[row][column].keyName) {
            this.updateDestinationToNull(dragItemInfo, destination, allPositions, row, column);
          }
        }
      }

      let isUsablePosition = false;
      for (let row = 0; row < allPositions.length; row++) {
        if (isUsablePosition) {
          break;
        }
        for (let column = 0; column < allPositions[row].length; column++) {
          const usablePositionCount =this.getUsablePositionCount(moveFolderOrForm, allPositions, row , column);
          if (usablePositionCount == moveFolderOrForm.area[1] * moveFolderOrForm.area[0]) {
            isUsablePosition = true;
            this.updatePositionByMoveItem(moveFolderOrForm, allPositions, row, column);
            movedFoldersAndForms.push(moveFolderOrForm.keyName);
            break;
          }
        }
      }
      if (!isUsablePosition) {
        Log.showDebug(TAG, 'moveFoldersAndForms return false');
        return false;
      }
    }
    this.updateDestinationByDragItem(dragItemInfo, destination, allPositions);
    return true;
  }

  /**
   * get the count of usable position
   * @param moveFolderOrForm
   * @param allPositions
   * @param row
   * @param column
   */
  private getUsablePositionCount(moveFolderOrForm, allPositions, row , column): number {
    let getUsablePositionCount = 0;
    for (let j = 0; j < moveFolderOrForm.area[1]; j++) {
      for (let i = 0; i < moveFolderOrForm.area[0]; i++) {
        if (row + j < allPositions.length && column + i < allPositions[row].length && allPositions[row + j][column + i].typeId == -1) {
          getUsablePositionCount++;
        }
      }
    }
    return getUsablePositionCount;
  }

  /**
   * update destination to nullPosition
   *
   * @param dragItemInfo
   * @param destination
   * @param allPositions
   * @param row
   * @param column
   */
  private updateDestinationToNull(dragItemInfo, destination, allPositions, row, column): void {
    let destinationFlag = false;
    for (let j = 0; j < dragItemInfo.area[1]; j++) {
      if (destinationFlag) {
        break;
      }
      for (let i = 0; i < dragItemInfo.area[0]; i++) {
        if (destination.row + j == row && destination.column + i == column) {
          destinationFlag = true;
          break;
        }
      }
    }
    if (!destinationFlag) {
      const nullPosition = {
        typeId: -1,
        keyName: 'null',
        area: []
      };
      allPositions[row][column] = nullPosition;
    }
  }

  /**
   * update destination position by dragItemInfo
   *
   * @param dragItemInfo
   * @param destination
   * @param allPositions
   */
  private updateDestinationByDragItem(dragItemInfo, destination, allPositions): void {
    let keyName = '';
    if (dragItemInfo.typeId == CommonConstants.TYPE_FOLDER) {
      keyName = dragItemInfo.folderId;
    } else if (dragItemInfo.typeId == CommonConstants.TYPE_CARD) {
      keyName = dragItemInfo.cardId;
    } else if (dragItemInfo.typeId == CommonConstants.TYPE_APP) {
      keyName = dragItemInfo.keyName;
    }

    for (let j = 0; j < dragItemInfo.area[1]; j++) {
      for (let i = 0; i < dragItemInfo.area[0]; i++) {
        const dragItemPosition = {
          typeId: dragItemInfo.typeId,
          keyName: keyName,
          area: dragItemInfo.area
        };
        allPositions[destination.row + j][destination.column + i] = dragItemPosition;
      }
    }
  }

  /**
   * update positions by moveItemInfo
   *
   * @param moveFolderOrForm
   * @param allPositions
   * @param row
   * @param column
   */
  private updatePositionByMoveItem(moveFolderOrForm, allPositions, row, column): void {
    for (let j = 0; j < moveFolderOrForm.area[1]; j++) {
      for (let i = 0; i < moveFolderOrForm.area[0]; i++) {
        const movePosition = {
          typeId: moveFolderOrForm.typeId,
          keyName: moveFolderOrForm.keyName,
          area: moveFolderOrForm.area
        };
        allPositions[row + j][column + i] = movePosition;
      }
    }
  }

  /**
   * move apps to target position
   * @param apps
   * @param allPositions
   */
  private moveApps(apps, allPositions): void {
    Log.showDebug(TAG, 'moveApps start');
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      let isUsable = false;
      for (let row = 0; row < allPositions.length; row++) {
        if (isUsable) {
          break;
        }
        for (let column = 0; column < allPositions[row].length; column++) {
          if (allPositions[row][column].typeId == -1) {
            const appPosition = {
              typeId: app.typeId,
              keyName: app.keyName,
              area: app.area
            };
            allPositions[row][column] = appPosition;
            isUsable = true;
            break;
          }
        }
      }
    }
  }
}
