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
import { StyleConstants } from '@ohos/common';
import { PresetStyleConstants } from '@ohos/common';
import { ResourceManager } from '@ohos/common';
import { RemoveFormDialog } from '@ohos/common';
import { FormManagerDialog } from '@ohos/common';
import { FormItemComponent } from '@ohos/common';
import { FormViewModel } from '@ohos/form';
import { FormStyleConfig } from '@ohos/form';
import { PageDesktopDragHandler } from '../PageDesktopDragHandler';
import { CommonConstants } from '@ohos/common';
import PageDesktopViewModel from '../../viewmodel/PageDesktopViewModel';
import { PageDesktopStartAppHandler } from '../PageDesktopStartAppHandler';

const TAG = 'FormItem';

/**
 * Form item, which display on desktop workspace.
 */
@Component
export default struct FormItem {
  @StorageLink('dragItemInfo') pageDesktopDragItemInfo: any = {};
  @StorageLink('isRemoveForm') @Watch('removeFormAnimate') isRemoveForm: boolean = false;
  @StorageLink('dragItemType') dragItemType: number = CommonConstants.DRAG_FROM_DESKTOP;
  @StorageLink('formAnimateData') formAnimateData: {
    cardId: number,
    isOpenRemoveFormDialog: boolean,
  } = { cardId: 0, isOpenRemoveFormDialog: false };
  @State animateScale: number = 1.0;
  @State animateOpacity: number = 1.0;
  @State allowUpdate: boolean = true;
  @State isShow: boolean = true;
  private formItem: any = {};
  private mPageDesktopViewModel: PageDesktopViewModel = PageDesktopViewModel.getInstance();
  private mFormViewModel: FormViewModel;
  private mFormStyleConfig: FormStyleConfig;
  private mPageDesktopDragHandler: PageDesktopDragHandler;
  @State mFormNameHeight: number = StyleConstants.DEFAULT_APP_NAME_HEIGHT;
  @State mAppItemWidth: number = StyleConstants.DEFAULT_APP_ITEM_WIDTH;
  @State mFormNameSize: number = StyleConstants.DEFAULT_APP_NAME_SIZE;
  private mPageDesktopStartAppHandler: PageDesktopStartAppHandler;
  private mIconMarginVertical: number = StyleConstants.DEFAULT_10;
  private isSwappingPage = false;
  private mMargin: number = 0;
  private mGridSpaceWidth: number = 0;
  private mGridSpaceHeight: number = 0;
  private mFormItemWidth: number = 0;
  private mFormItemHeight: number = 0;
  private mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  private mIsDeleteForm: string = '';
  private mForm: string = '';
  private clearForm: Function = null;

  @Builder dragLayerBuilder() {
    Column() {
      FormItemComponent({
        formItem: this.formItem,
        formItemWidth: this.mFormItemWidth * 1.05,
        formItemHeight: this.mFormItemHeight * 1.05,
        formNameHeight: 0,
        formNameSize: 0
      })
    }
    .height(this.mFormItemWidth * 1.05 + StyleConstants.DEFAULT_10  )
    .width(this.mFormItemWidth * 1.05)
  }

  aboutToAppear(): void  {
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    this.mFormViewModel = FormViewModel.getInstance();
    this.mPageDesktopStartAppHandler = PageDesktopStartAppHandler.getInstance();
    this.mFormStyleConfig = this.mFormViewModel.getFormStyleConfig();
    let styleConfig = this.mPageDesktopViewModel.getPageDesktopStyleConfig();
    this.mFormNameHeight = styleConfig.mNameHeight;
    this.mAppItemWidth = styleConfig.mIconSize;
    this.mIconMarginVertical = styleConfig.mIconMarginVertical;
    this.mMargin = styleConfig.mMargin;
    this.mNameLines = styleConfig.mNameLines;
    this.mFormNameSize = styleConfig.mNameSize;
    this.mGridSpaceWidth = Number(this.mPageDesktopViewModel.getWorkSpaceWidth()) - this.mMargin;
    this.mGridSpaceHeight = Number(this.mPageDesktopViewModel.getWorkSpaceHeight());
    this.mFormItemWidth = this.mFormStyleConfig.mFormWidth.get(this.formItem.cardDimension.toString());
    this.mFormItemHeight = this.mFormStyleConfig.mFormHeight.get(this.formItem.cardDimension.toString());
    const resourceManager = ResourceManager.getInstance();
    resourceManager.getStringById($r('app.string.is_delete_form').id, this.getDialogNamePre.bind(this));
    resourceManager.getStringById($r('app.string.form').id, this.getDialogNameAft.bind(this));
    Log.showDebug(TAG, `aboutToAppear end formItem: ${JSON.stringify(this.formItem)}`);
  }

  aboutToDisappear(): void {
    delete this.dialogController;
    this.dialogController = null;
    delete this.formManagerDialogController;
    this.formManagerDialogController = null;
    this.clearForm = null;
  }

  /**
   * Animation effect when card is removed.
   */
  private removeFormAnimate() {
    Log.showInfo(TAG, `removeFormAnimate start`);
    if (this.isRemoveForm &&
            this.formAnimateData.isOpenRemoveFormDialog &&
            this.formAnimateData.cardId === this.formItem.cardId) {
        animateTo({
          duration: 250,
          tempo: 0.5,
          curve: '(0.3,0,0.9,1)',
          delay: 0,
          iterations: 1,
          playMode: PlayMode.Normal,
          onFinish: () => {
            Log.showInfo(TAG, `showAnimate onFinish`);
            AppStorage.SetOrCreate('isRemoveForm', false);
            this.formAnimateData.cardId = 0;
            this.formAnimateData.isOpenRemoveFormDialog = false;
            this.mFormViewModel.deleteForm(this.formItem.cardId);
            this.mPageDesktopViewModel.getGridList();
          }
        }, () => {
          this.animateScale = 0;
          this.animateOpacity = 0;
        })
    }
  }

  private getDialogNamePre(value): void {
    this.mIsDeleteForm = value;
  }

  private getDialogNameAft(value): void {
    this.mForm = value;
  }

  /**
   * get dialogName
   */
  private getDialogName(): string {
    const appName = this.mPageDesktopViewModel.getAppName(this.formItem.appLabelId + this.formItem.bundleName + this.formItem.moduleName);
    const dialogName = `${this.mIsDeleteForm}"${appName}"${this.mForm}`;
    return dialogName;
  }

  /**
   * Dialog for form remove.
   */
  dialogController: CustomDialogController = new CustomDialogController({
    builder:  RemoveFormDialog({
      cancel: () => {},
      confirm: () => {
        // delete form
        AppStorage.SetOrCreate('isRemoveForm', true);
      },
      dialogName: this.getDialogName(),
    }),
    cancel: this.cancelDialog,
    autoCancel: false,
    customStyle: true
  });

  /**
   * When click cancel dialog, this function will be called.
   */
  cancelDialog() {
    Log.showInfo(TAG, 'cancel form dialog');
  }

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
      bundleName: this.formItem.bundleName,
      appName: this.mPageDesktopViewModel.getAppName(this.formItem.appLabelId + this.formItem.bundleName + this.formItem.moduleName),
      appLabelId: this.formItem.appLabelId
    }),
    cancel: this.cancelFormDialog,
    autoCancel: false,
    customStyle: true
  });

  /**
   * When click cancel dialog, this function will be called.
   */
  cancelFormDialog() {
    Log.showInfo(TAG, 'cancel dialog');
    this.clearForm();
  }

  dragStart(event: DragEvent): CustomBuilder {
    AppStorage.SetOrCreate('isDrag', true);
    ContextMenu.close();
    this.dragItemType = CommonConstants.DRAG_FROM_DESKTOP;
    this.pageDesktopDragItemInfo = this.formItem;
    const selectAppIndex = globalThis.PageDesktopDragHandler.getItemIndex(event.getX(), event.getY());
    const startPosition = globalThis.PageDesktopDragHandler.getTouchPosition(event.getX(), event.getY())
    globalThis.PageDesktopDragHandler.mStartPosition = startPosition;
    AppStorage.SetOrCreate('selectAppIndex', selectAppIndex);
    Log.showInfo(TAG, `onDragStart event: [${event.getX()}, ${event.getY()}], selectAppIndex: ${selectAppIndex}`);
    const rowOffset = startPosition.row - this.pageDesktopDragItemInfo.row;
    const columnOffset = startPosition.column - this.pageDesktopDragItemInfo.column;
    const positionOffset = [columnOffset, rowOffset];
    AppStorage.SetOrCreate('positionOffset', positionOffset);
    return this.dragLayerBuilder();
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceAround }) {
      Column() {
        FormItemComponent({
          formItemWidth: this.mFormItemWidth,
          formItemHeight: this.mFormItemHeight,
          formNameHeight: this.mFormNameHeight,
          formNameSize: this.mFormNameSize,
          nameFontColor: this.mPageDesktopViewModel.getPageDesktopStyleConfig().mNameFontColor,
          formItem: this.formItem,
          nameLines: this.mNameLines,
          mPaddingTop: this.mIconMarginVertical,
          iconNameMargin: this.mPageDesktopViewModel.getPageDesktopStyleConfig().mIconNameMargin,
          menuInfo: this.mPageDesktopViewModel.buildCardMenuInfoList(this.formItem,
            this.dialogController, this.formManagerDialogController),
          dragStart: this.dragStart.bind(this),
          clickForm: (event, formItem) => {
            Log.showInfo(TAG, 'click form');
            this.setStartAppInfo();
          },
        })
      }
      .visibility(this.pageDesktopDragItemInfo.cardId === this.formItem.cardId ? Visibility.None : Visibility.Visible)
      .scale({ x: this.animateScale, y: this.animateScale })
      .opacity(this.animateOpacity)
      .onMouse((event: MouseEvent) => {
        if (event.button === MouseButton.Right) {
          event.stopPropagation();
          Log.showInfo(TAG, 'onMouse mouse button right');
        }
      })
      .gesture(
      GestureGroup(GestureMode.Exclusive,
      TapGesture({ count: 2 })
        .onAction((event: GestureEvent) => {
          Log.showInfo(TAG, 'mouse double click');
          this.setStartAppInfo();
          this.mPageDesktopViewModel.onAppDoubleClick(this.formItem.abilityName, this.formItem.bundleName, this.formItem.moduleName);
        })
      )
      )
      .onTouch((event: TouchEvent) => {
        if (event.type === CommonConstants.TOUCH_TYPE_UP && AppStorage.Get('isDrag')) {
          let mIsDragEffectArea = globalThis.PageDesktopDragHandler.isDragEffectArea(event.touches[0].screenX, event.touches[0].screenY);
          Log.showInfo(TAG, `onTouch mIsDragEffectArea: ${mIsDragEffectArea}`);
          if (!mIsDragEffectArea) {
            globalThis.PageDesktopDragHandler.deleteBlankPageOutsideEffect();
            this.pageDesktopDragItemInfo = {};
            AppStorage.SetOrCreate('selectAppIndex', null);
            AppStorage.SetOrCreate('isDrag', false);
          }
        }
      })
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
    }
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
  }

  /**
   * set start app info
   */
  private setStartAppInfo() {
    Log.showInfo(TAG, `app setStartAppInfo`);
    AppStorage.SetOrCreate('startAppItemInfo', this.formItem);
    AppStorage.SetOrCreate('startAppTypeFromPageDesktop', CommonConstants.OVERLAY_TYPE_CARD);
    this.mPageDesktopStartAppHandler.setAppIconSize(this.mFormItemWidth, this.mFormItemHeight);
    this.mPageDesktopStartAppHandler.setAppIconInfo();
  }
}