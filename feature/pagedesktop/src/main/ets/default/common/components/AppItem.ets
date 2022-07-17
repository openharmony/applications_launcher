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

import AppBubble from '../../../../../../../../common/src/main/ets/default/uicomponents/AppBubble';
import StyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import ResourceManager from '../../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import PresetStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import UninstallDialog from '../../../../../../../../common/src/main/ets/default/uicomponents/UninstallDialog';
import PageDesktopDragHandler from '../PageDesktopDragHandler';
import FormManagerDialog from '../../../../../../../form/src/main/ets/default/common/uicomponents/FormManagerDialog';
import FeatureConstants from '../constants/FeatureConstants';
import Trace from '../../../../../../../../common/src/main/ets/default/utils/Trace';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';

const APP_INFO_REFRESH_DELAY = 500;
const DOUBLE_CLICK_COUNT = 2

const TAG = "AppItem";

@Component
export default struct AppItem {
  @StorageLink('uninstallAppInfo') appInfo: any = {};
  @StorageLink('formAppInfo') formAppInfo: any = {};
  @StorageLink('selectDesktopAppItem') selectDesktopAppItem: string = '';
  @StorageLink('isOverlayComplete') isOverlayComplete: boolean = false;
  @State isDragging: boolean = false;
  @State mAppNameHeight: number = StyleConstants.DEFAULT_APP_NAME_HEIGHT;
  @State mAppItemWidth: number = StyleConstants.DEFAULT_APP_ITEM_WIDTH;
  @State mAppNameSize: number = StyleConstants.DEFAULT_APP_NAME_SIZE;
  @State mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  @State mIconSize: number = StyleConstants.DEFAULT_APP_ICON_SIZE_WIDTH;
  mIconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
  private mMargin: number = 0;
  private mMarginVertical: number = 0;
  private mGridSpaceWidth : number;
  private mGridSpaceHeight : number;
  private isSwappingPage = false;
  private item: any;
  private mPageDesktopViewModel;
  private isPad: boolean = false;
  private mPageDesktopDragHandler : PageDesktopDragHandler;
  private mouseClick: number = 0;
  private dialogName: string = "";
  private clearForm: Function = null;

  dialogController: CustomDialogController = new CustomDialogController({
    builder:  UninstallDialog({
      cancel: () => {},
      confirm: () => {
        if (this.isPad) {
          this.mPageDesktopViewModel.deleteAppItem({
            bundleName: undefined,
            keyName: this.appInfo.keyName
          });
        } else {
          this.mPageDesktopViewModel.uninstallApp(this.appInfo.bundleName, this.appInfo.isUninstallAble);
        }
      },
      dialogName: this.dialogName,
      dialogContent: this.appInfo.appName + ' ?',
    }),
    cancel: this.cancelDialog,
    autoCancel: true,
    customStyle: true
  });

  /**
   * Dialog for form manager view (pad adaptation).
   */
  formManagerDialogController: CustomDialogController = new CustomDialogController({
    builder: FormManagerDialog({
      cancel: (callback?) => {
        // delete all form
        if (callback != undefined) {
          this.clearForm = callback;
        }
      },
      confirm: (formCardItem) => {
        // add form to desktop
        Log.showInfo(TAG, `createCardToDeskTop formCardItem: ${JSON.stringify(formCardItem)}`);
        this.mPageDesktopViewModel.createCardToDeskTop(formCardItem);
        // delete other form
      },
      bundleName: this.formAppInfo.bundleName,
      appName: this.formAppInfo.appName,
      appLabelId: this.formAppInfo.appLabelId
    }),
    cancel: this.cancelFormDialog,
    autoCancel: true,
    customStyle: true
  });

  /**
   * When click cancel dialog, this function will be called.
   */
  cancelFormDialog() {
    Log.showInfo(TAG, 'cancel form dialog');
    this.clearForm();
  }

  aboutToAppear(): void  {
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    this.isPad = this.mPageDesktopViewModel.getDevice();
    let styleConfig = this.mPageDesktopViewModel.getPageDesktopStyleConfig();
    this.mAppNameHeight = styleConfig.mNameHeight;
    this.mAppItemWidth = styleConfig.mAppWidth;
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

  /**
   * The app item on desktop workspace: drag state listener.
   */
  private mDragStateListener = {
    onItemDragStart: (event: any, itemIndex: number) => {
      this.dialogController.close();
      this.formManagerDialogController.close();
      this.isDragging = true;
    },
    onItemDragMove: (event: any, insertIndex: number, itemIndex: number) => {
      if (this.isSwappingPage) {
        return;
      }
      let moveX = event.touches[0].screenX;
      let moveY = event.touches[0].screenY;
      let curPageIndex = this.mPageDesktopViewModel.getIndex();
      if ((moveX - this.mIconSize / 2) < this.mMargin && curPageIndex > 0 && moveY < this.mGridSpaceHeight) {
        this.mPageDesktopViewModel.showPrevious();
        this.movingIconSwapPageDelay();
      } else if ((moveX + this.mIconSize / 2) > this.mGridSpaceWidth && moveY < this.mGridSpaceHeight) {
        let cachePageIndex = this.mPageDesktopViewModel.getLayoutInfo().layoutDescription.pageCount;
        if (curPageIndex == cachePageIndex - 1 && !this.mPageDesktopViewModel.isBlankPage()) {
          this.mPageDesktopViewModel.addBlankPage(true);
        } else if(curPageIndex < cachePageIndex - 1) {
          this.mPageDesktopViewModel.showNext();
        }
        this.movingIconSwapPageDelay();
      }
    },
    onItemDragEnd: () => {
      this.isDragging = false;
      AppStorage.SetOrCreate('isOverlayComplete', false);
    }
  };

  /**
   * When click cancel dialog, this function will be called.
   */
  cancelDialog() {
    Log.showInfo(TAG, 'cancel app uninstall dialog');
  }

  /**
   * Increase delay when dragging app to other page.
   */
  movingIconSwapPageDelay() {
    this.isSwappingPage = true;
    setTimeout(() => {
      this.isSwappingPage = false;
    }, APP_INFO_REFRESH_DELAY);
  }

  build() {
    Flex({
      direction: FlexDirection.Column,
      alignItems: ItemAlign.Center,
      justifyContent: FlexAlign.SpaceAround
    }) {
      Column() {
        AppBubble({
          iconSize: this.mIconSize,
          nameSize: this.mAppNameSize,
          nameHeight: this.mAppNameHeight,
          nameFontColor: this.mPageDesktopViewModel.getPageDesktopStyleConfig().mNameFontColor,
          appName: this.item.appName,
          bundleName: this.item.bundleName,
          abilityName: this.item.abilityName,
          moduleName: this.item.moduleName,
          appIconId: this.item.appIconId,
          appLabelId: this.item.appLabelId,
          badgeNumber: this.item.badgeNumber,
          isSelect: this.selectDesktopAppItem == this.item.keyName,
          menuInfo:this.mPageDesktopViewModel.buildMenuInfoList(this.item,
            this.dialogController, this.formManagerDialogController),
          mPaddingTop: this.mMarginVertical,
          nameLines: this.mNameLines,
          mIconNameMargin: this.mIconNameMargin
        })
      }
      .visibility((this.isDragging && this.isOverlayComplete) ? Visibility.Hidden : Visibility.Visible)
      .onMouse((event: MouseEvent) => {
        if (event.button == MouseButton.Right) {
          event.stopPropagation();
          Log.showInfo(TAG, 'onMouse mouse button right');
          AppStorage.SetOrCreate('selectDesktopAppItem', this.item.keyName);
        }
      })
      .gesture(
      GestureGroup(GestureMode.Exclusive,
        TapGesture()
          .onAction((event: GestureEvent) => {
            Log.showInfo(TAG, `tap action ${JSON.stringify(event)}`);
            if (event.source == SourceType.Mouse) {
              this.mouseClick++;
              if (this.mouseClick == DOUBLE_CLICK_COUNT) {
                Log.showInfo(TAG, 'mouse double click');
                this.mouseClick = 0;
                this.launchApp();
              } else {
                this.mPageDesktopViewModel.onAppClick(this.item.abilityName, this.item.bundleName, this.item.moduleName);
                setTimeout(() => {
                  this.mouseClick = 0;
                }, 300)
              }
            } else {
              Log.showInfo(TAG, 'tap click');
              this.launchApp();
            }
          })
        )
      )
      .onTouch((event: TouchEvent) => {
        AppStorage.SetOrCreate('dragFocus', FeatureConstants.FEATURE_NAME);
        this.mPageDesktopDragHandler.setDragStateListener(this.mDragStateListener);
        Log.showInfo(TAG, `tap click notifyTouchEventUpdate x: ${event.touches[0].screenX}, y: ${event.touches[0].screenY}`);
        this.mPageDesktopDragHandler.notifyTouchEventUpdate(event);
      })
    }
    .width(this.mAppItemWidth)
    .height(this.mAppItemWidth)
  }

  /**
   * When app is double clicked, call this method.
   */
  private launchApp() {
    Trace.start(Trace.CORE_METHOD_LAUNCH_APP);
    this.mPageDesktopViewModel.onAppDoubleClick(this.item.abilityName, this.item.bundleName, this.item.moduleName);
  }
}