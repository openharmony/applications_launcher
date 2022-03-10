/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import AppBubble from '../../../../../../../../common/src/main/ets/default/uicomponents/AppBubble.ets';
import StyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import PresetStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import UninstallDialog from '../../../../../../../../common/src/main/ets/default/uicomponents/UninstallDialog.ets';
import PageDesktopDragHandler from '../PageDesktopDragHandler';
import FormManagerDialog from '../../../../../../../form/src/main/ets/default/common/uicomponents/FormManagerDialog.ets';
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
  @State isDraging: boolean = false;
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

  dialogController: CustomDialogController = new CustomDialogController({
    builder:  UninstallDialog({
      cancel: () => {},
      confirm: () => {
        if (this.isPad) {
          this.mPageDesktopViewModel.deleteAppItem(this.appInfo.bundleName);
        } else {
          this.mPageDesktopViewModel.uninstallApp(this.appInfo.bundleName, this.appInfo.isUninstallAble);
        }
      },
      dialogName: this.isPad ? $r('app.string.delete_app') : $r('app.string.uninstall'),
      dialogContent: this.appInfo.appName + ' ?',
    }),
    cancel: this.cancelDialog,
    autoCancel: true,
    customStyle: true
  });

  formManagerDialogController: CustomDialogController = new CustomDialogController({
    builder: FormManagerDialog({
      cancel: () => {
        // delete all form
      },
      confirm: (formCardItem) => {
        // add form to desktop
        Log.showInfo(TAG, "createCardToDeskTop formCardItem: " + JSON.stringify(formCardItem));
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

  cancelFormDialog() {
    console.info('Launcher form manager cancel dialog');
  }

  private aboutToAppear(): void  {
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
  }

  private mDragStateListener = {
    onItemDragStart: (event: any, itemIndex: number) => {
      this.dialogController.close();
      this.formManagerDialogController.close();
      this.isDraging = true;
    },
    onItemDragMove: (event: any, insertIndex: number, itemIndex: number) => {
      if (this.isSwappingPage) {
        return;
      }
      let moveX = event.touches[0].screenX;
      let moveY = event.touches[0].screenY;
      let curPageIndex = this.mPageDesktopViewModel.getIndex();
      if ((moveX - this.mIconSize / 2) < this.mMargin && curPageIndex > 0 && moveY < this.mGridSpaceHeight) {
        this.mPageDesktopViewModel.changeIndex(curPageIndex - 1);
        this.movingIconSwapPageDelay();
      } else if ((moveX + this.mIconSize / 2) > this.mGridSpaceWidth && moveY < this.mGridSpaceHeight) {
        let cachePageIndex = this.mPageDesktopViewModel.getLayoutInfo().layoutDescription.pageCount;
        if (curPageIndex == cachePageIndex - 1 && !this.mPageDesktopViewModel.isBlankPage()) {
          this.mPageDesktopViewModel.addBlankPage();
        } else if(curPageIndex < cachePageIndex - 1){
          this.mPageDesktopViewModel.changeIndex(curPageIndex + 1);
        }
        this.movingIconSwapPageDelay();
      }
    },
    onItemDragEnd: () => {
      this.isDraging = false;
    }
  };

  cancelDialog() {
    console.info('Launcher Grid Cancel Dialog');
  }

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
          appIconId: this.item.appIconId,
          appLabelId: this.item.appLabelId,
          badgeNumber: this.item.badgeNumber,
          isSelect: this.selectDesktopAppItem === this.item.bundleName,
          menuInfo:this.mPageDesktopViewModel.buildMenuInfoList(this.item, this.dialogController, this.formManagerDialogController),
          mPaddingTop: this.mMarginVertical,
          nameLines: this.mNameLines,
          mIconNameMargin: this.mIconNameMargin
        })
      }
      .visibility(this.isDraging ? Visibility.Hidden : Visibility.Visible)
      .onMouse((event: MouseEvent) => {
        if (event.button == MouseButton.Right) {
          event.stopPropagation();
          console.info('Launcher AppItem onMouse MouseButton Right');
          AppStorage.SetOrCreate('selectDesktopAppItem', this.item.bundleName);
        }
      })
      .gesture(
      GestureGroup(GestureMode.Exclusive,
        TapGesture()
          .onAction((event: GestureEvent) => {
            Log.showInfo(TAG, `tap action ${JSON.stringify(event)}`)
            if (event.source == SourceType.Mouse) {
              this.mouseClick++;
              if (this.mouseClick == DOUBLE_CLICK_COUNT) {
                Log.showInfo(TAG, 'mouse double click')
                this.mouseClick = 0;
                this.launchApp();
              } else {
                this.mPageDesktopViewModel.onAppClick(this.item.abilityName, this.item.bundleName);
                setTimeout(() => {
                  this.mouseClick = 0;
                }, 300)
              }
            } else {
              Log.showInfo(TAG, 'tap click')
              this.launchApp();
            }
          })
        )
      )
      .onTouch((event: TouchEvent) => {
        AppStorage.SetOrCreate('dragFocus', FeatureConstants.FEATURE_NAME);
        this.mPageDesktopDragHandler.setDragStateListener(this.mDragStateListener);
        this.mPageDesktopDragHandler.notifyTouchEventUpdate(event);
      })
    }
    .width(this.mAppItemWidth)
    .height(this.mAppItemWidth)
  }

  private launchApp() {
    Trace.start(Trace.CORE_METHOD_LAUNCH_APP);
    this.mPageDesktopViewModel.onAppDoubleClick(this.item.abilityName, this.item.bundleName);
  }
}