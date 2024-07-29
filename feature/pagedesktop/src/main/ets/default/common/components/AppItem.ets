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
  AppBubble,
  UninstallDialog,
  FormManagerDialog
} from '@ohos/common/component'
import {
  AppItemInfo,
  CardItemInfo,
  LauncherDragItemInfo,
  Log,
  Trace,
  StyleConstants,
  PresetStyleConstants,
  ResourceManager,
  CommonConstants,
  MenuInfo
} from '@ohos/common';
import { PageDesktopDragHandler } from '../PageDesktopDragHandler';
import { PageDesktopViewModel } from '../../viewmodel/PageDesktopViewModel';
import { PageDesktopStartAppHandler } from '../PageDesktopStartAppHandler';

const DOUBLE_CLICK_COUNT = 2

const TAG = 'AppItem';

interface StartAppItemInfo {
  bundleName?: string;
  abilityName?: string;
  moduleName?: string;
  appIconSize: number;
  appIconId?: number;
  icon: ResourceStr;
  row?: number;
  column?: number;
}

@Component
export default struct AppItem {
  @StorageLink('dragItemInfo') pageDesktopDragItemInfo: LauncherDragItemInfo = new LauncherDragItemInfo();
  @StorageLink('dragItemType') dragItemType: number = CommonConstants.DRAG_FROM_DESKTOP;
  @StorageLink('uninstallAppInfo') appInfo: AppItemInfo = new AppItemInfo();
  @StorageLink('formAppInfo') formAppInfo: CardItemInfo = new CardItemInfo();
  @StorageLink('selectDesktopAppItem') selectDesktopAppItem: string = '';
  @State mAppNameHeight: number = StyleConstants.DEFAULT_APP_NAME_HEIGHT;
  @State mAppItemWidth: number = StyleConstants.DEFAULT_APP_ITEM_WIDTH;
  @State mAppNameSize: number = StyleConstants.DEFAULT_APP_NAME_SIZE;
  mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  @State mIconSize: number = StyleConstants.DEFAULT_APP_ICON_SIZE_WIDTH;
  mIconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
  private mMargin: number = 0;
  private mMarginVertical: number = 0;
  private mGridSpaceWidth : number = 0;
  private mGridSpaceHeight : number = 0;
  private isSwappingPage = false;
  private item: LauncherDragItemInfo = new LauncherDragItemInfo();
  private mPageDesktopViewModel?: PageDesktopViewModel;
  private isPad: boolean = false;
  private mPageDesktopDragHandler: PageDesktopDragHandler = PageDesktopDragHandler.getInstance();
  private mPageDesktopStartAppHandler: PageDesktopStartAppHandler = PageDesktopStartAppHandler.getInstance();
  private mouseClick: number = 0;
  private dialogName: string = '';
  private clearForm = () => {};

  dialogController: CustomDialogController | null = new CustomDialogController({
    builder:  UninstallDialog({
      cancel: () => {},
      confirm: () => {
        if (this.isPad) {
          this.mPageDesktopViewModel?.deleteAppItem({
            bundleName: undefined,
            keyName: this.appInfo.keyName
          });
        } else {
          this.mPageDesktopViewModel?.uninstallApp(this.appInfo.bundleName, this.appInfo.isUninstallAble);
        }
      },
      dialogName: this.dialogName,
      dialogContent: this.appInfo.appName + ' ?',
    }),
    cancel: this.cancelDialog,
    autoCancel: false,
    customStyle: true
  });

  /**
   * Dialog for form manager view (pad adaptation).
   */
  formManagerDialogController: CustomDialogController | null = new CustomDialogController({
    builder: FormManagerDialog({
      cancel: (callback?: () => void) => {
        // delete all form
        if (callback != undefined) {
          this.clearForm = callback;
        }
      },
      confirm: (formCardItem: CardItemInfo) => {
        // add form to desktop
        Log.showInfo(TAG, `createCardToDeskTop formCardItem: ${JSON.stringify(formCardItem)}`);
        this.mPageDesktopViewModel?.createCardToDeskTop(formCardItem);
        // delete other form
      },
      bundleName: this.formAppInfo.bundleName,
      appName: this.formAppInfo.appName,
      appLabelId: this.formAppInfo.appLabelId
    }),
    cancel: this.cancelFormDialog,
    autoCancel: false,
    customStyle: true
  });

  /**
   * When click cancel dialog, this function will be called.
   */
  cancelFormDialog() {
    Log.showInfo(TAG, 'cancel form dialog');
    this.clearForm();
  }

  aboutToAppear(): void {
    this.mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    this.mPageDesktopStartAppHandler = PageDesktopStartAppHandler.getInstance();
    this.isPad = this.mPageDesktopViewModel.getDevice();
    let styleConfig = this.mPageDesktopViewModel.getPageDesktopStyleConfig();
    this.mAppNameHeight = styleConfig.mNameHeight;
    this.mAppItemWidth = styleConfig.mAppItemSize;
    this.mAppNameSize = styleConfig.mNameSize;
    this.mMargin = styleConfig.mMargin;
    this.mIconSize = styleConfig.mIconSize;
    this.mMarginVertical = styleConfig.mIconMarginVertical;
    this.mIconNameMargin = styleConfig.mIconNameMargin;
    this.mGridSpaceWidth = Number(this.mPageDesktopViewModel.getWorkSpaceWidth()) - this.mMargin;
    this.mGridSpaceHeight = Number(this.mPageDesktopViewModel.getWorkSpaceHeight());
    ResourceManager.getInstance().getStringByResource(this.isPad
      ? $r('app.string.is_delete_form') : $r('app.string.isUninstall')).then((resName) => {
      this.dialogName = resName;
    });
  }

  aboutToDisappear(): void {
    this.dialogController = null;
    this.formManagerDialogController = null;
  }

  getMenuInfoList = (): MenuInfo[] => {
    const menuInfo = this.mPageDesktopViewModel?.buildMenuInfoList(this.item,
      this.dialogController, this.formManagerDialogController) as MenuInfo[];
    return menuInfo;
  }

  /**
   * When click cancel dialog, this function will be called.
   */
  cancelDialog() {
    Log.showInfo(TAG, 'cancel app uninstall dialog');
  }

  build() {
    Column() {
      AppBubble({
        iconSize: this.mIconSize,
        nameSize: this.mAppNameSize,
        nameHeight: this.mAppNameHeight,
        nameFontColor: this.mPageDesktopViewModel?.getPageDesktopStyleConfig().mNameFontColor as string,
        appName: this.item.appName,
        bundleName: this.item.bundleName,
        abilityName: this.item.abilityName,
        moduleName: this.item.moduleName,
        appIconId: this.item.appIconId,
        appLabelId: this.item.appLabelId,
        badgeNumber: this.item.badgeNumber,
        isSelect: this.selectDesktopAppItem == this.item.keyName,
        getMenuInfoList: this.getMenuInfoList,
        mPaddingTop: this.mMarginVertical,
        nameLines: this.mNameLines,
        mIconNameMargin: this.mIconNameMargin,
        dragStart: this.dragStart
      })
    }
    .visibility(this.dragItemType ===
      CommonConstants.DRAG_FROM_DESKTOP && this.pageDesktopDragItemInfo.keyName === this.item.keyName ?
      Visibility.None : Visibility.Visible)
    .onMouse((event: MouseEvent) => {
      if (event.button == MouseButton.Right) {
        event.stopPropagation();
        Log.showInfo(TAG, 'onMouse mouse button right');
        AppStorage.setOrCreate('selectDesktopAppItem', this.item.keyName);
      }
    })
    .onClick((event) => {
      Log.showInfo(TAG, `tap action ${JSON.stringify(event)}`);
      if (event.source == SourceType.Mouse) {
        this.mouseClick++;
        if (this.mouseClick == DOUBLE_CLICK_COUNT) {
          Log.showInfo(TAG, 'mouse double click');
          this.mouseClick = 0;
          this.launchApp();
        } else {
          this.mPageDesktopViewModel?.onAppClick(this.item.abilityName, this.item.bundleName, this.item.moduleName);
          setTimeout(() => {
            this.mouseClick = 0;
          }, 300)
        }
      } else {
        Log.showInfo(TAG, 'tap click');
        this.launchApp();
      }
    })
    .onTouch((event: TouchEvent) => {
      Log.showDebug(TAG, `onTouch event type: ${event.type}, x: ${event.touches[0].windowX}, y: ${event.touches[0].windowY}`);
      if (event.type === CommonConstants.TOUCH_TYPE_UP && this.pageDesktopDragItemInfo.isDragging) {
        let mIsDragEffectArea =
        PageDesktopDragHandler.getInstance().isDragEffectArea(event.touches[0].windowX, event.touches[0].windowY);
        Log.showInfo(TAG, `onTouch mIsDragEffectArea: ${mIsDragEffectArea}`);
        if (!mIsDragEffectArea) {
          this.pageDesktopDragItemInfo = new LauncherDragItemInfo();
          AppStorage.setOrCreate('selectAppIndex', null);
        }
      }
    })
    .width(this.mAppItemWidth)
    .height(this.mAppItemWidth)
  }

  /**
   * When app is double clicked, call this method.
   */
  private launchApp() {
    Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
    this.setStartAppInfo();
    this.mPageDesktopViewModel?.onAppDoubleClick(this.item.abilityName, this.item.bundleName, this.item.moduleName);
  }

  dragStart = (event: DragEvent): CustomBuilder => {
    ContextMenu.close();
    this.dragItemType = CommonConstants.DRAG_FROM_DESKTOP;
    this.item.isDragging = true;
    this.pageDesktopDragItemInfo = this.item;
    Log.showInfo(TAG, `pageDesktopDragItemInfo: ${JSON.stringify(this.pageDesktopDragItemInfo)}`);
    PageDesktopDragHandler.getInstance().onDragStart(event.getWindowX(), event.getWindowY());
  }

  /**
   * set start app info
   */
  private setStartAppInfo() {
    Log.showInfo(TAG, `app setStartAppInfo ${this.mIconSize}`);
    Trace.start('setStartAppInfo');
    const appInfo: StartAppItemInfo = {
      bundleName: this.item.bundleName,
      abilityName: this.item.abilityName,
      moduleName: this.item.moduleName,
      appIconSize: this.mIconSize,
      appIconId: this.item.appIconId,
      icon: ResourceManager.getInstance()
        .getCachedAppIcon(this.item.appIconId, this.item.bundleName, this.item.moduleName),
      row: this.item.row,
      column: this.item.column
    }
    AppStorage.setOrCreate('startAppItemInfo', appInfo);
    AppStorage.setOrCreate('startAppTypeFromPageDesktop', CommonConstants.OVERLAY_TYPE_APP_ICON);
    this.mPageDesktopStartAppHandler.setAppIconSize(this.mIconSize);
    this.mPageDesktopStartAppHandler.setAppIconInfo();
    Trace.end('setStartAppInfo');
  }
}