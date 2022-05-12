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

import StyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import PresetStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import ResourceManager from '../../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import PageDesktopViewModel from '../../../../../../../pagedesktop/src/main/ets/default/common/viewmodel/PageDesktopViewModel';
import FormViewModel from '../../../../../../../form/src/main/ets/default/viewmodel/FormViewModel';
import FormStyleConfig from '../../../../../../../form/src/main/ets/default/common/FormStyleConfig';
import PageDesktopDragHandler from '../PageDesktopDragHandler';
import RemoveFormDialog from '../../../../../../../../common/src/main/ets/default/uicomponents/RemoveFormDialog.ets';
import FormManagerDialog from '../../../../../../../form/src/main/ets/default/common/uicomponents/FormManagerDialog.ets';
import FormItemComponent from '../../../../../../../../common/src/main/ets/default/uicomponents/FormItemComponent.ets';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';
import FeatureConstants from '../constants/FeatureConstants';

const FORM_INFO_REFRESH_DELAY = 500;
const TAG = 'FormItem';

/**
 * Form item, which display on desktop workspace.
 */
@Component
export default struct FormItem {
  @StorageLink('isRemoveForm') @Watch('removeFormAnimate') isRemoveForm: boolean = false;
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
  @State isDragging: boolean = false;
  @State mFormNameHeight: number = StyleConstants.DEFAULT_APP_NAME_HEIGHT;
  @State mAppItemWidth: number = StyleConstants.DEFAULT_APP_ITEM_WIDTH;
  @State mFormNameSize: number = StyleConstants.DEFAULT_APP_NAME_SIZE;
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

  private aboutToAppear(): void  {
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    this.mFormViewModel = FormViewModel.getInstance();
    this.mFormStyleConfig = this.mFormViewModel.getFormStyleConfig();
    let mGridConfig = this.mPageDesktopViewModel.getGridConfig();
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
    const appName = this.mPageDesktopViewModel.getAppName(this.formItem.appLabelId + this.formItem.bundleName);
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
    autoCancel: true,
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
      cancel: () => {
        // delete all form
      },
      confirm: (formCardItem) => {
        // add form to desktop
        Log.showInfo(TAG, `createCardToDeskTop formCardItem: ${JSON.stringify(formCardItem)}`);
        this.mPageDesktopViewModel.createCardToDeskTop(formCardItem);
        // delete other form
      },
      bundleName: this.formItem.bundleName,
      appName: this.mPageDesktopViewModel.getAppName(this.formItem.appLabelId + this.formItem.bundleName),
      appLabelId: this.formItem.appLabelId
    }),
    cancel: this.cancelFormDialog,
    autoCancel: true,
    customStyle: true
  });

  /**
   * When click cancel dialog, this function will be called.
   */
  cancelFormDialog() {
    Log.showInfo(TAG, 'cancel dialog');
  }

  /**
   * The form item on desktop workspace: drag state listener.
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
        this.movingFormSwapPageDelay();
      } else if ((moveX + this.mAppItemWidth / 2) > this.mGridSpaceWidth && moveY < this.mGridSpaceHeight) {
        if (this.mPageDesktopViewModel.getIndex() === this.mPageDesktopViewModel.getGridPageCount() - 1
        && !this.mPageDesktopViewModel.isBlankPage()) {
          this.mPageDesktopViewModel.addBlankPage();
        } else if (this.mPageDesktopViewModel.getIndex() < this.mPageDesktopViewModel.getGridPageCount() - 1) {
          this.mPageDesktopViewModel.showNext();
        }
        this.movingFormSwapPageDelay();
      }
    },
    onItemDragEnd: (event: any, insertIndex: number, itemIndex: number) => {
      this.isDragging = false;
    }
  };

  /**
   * Increase delay when dragging card to other page.
   */
  movingFormSwapPageDelay() {
    this.isSwappingPage = true;
    setTimeout(() => {
      this.isSwappingPage = false;
    }, FORM_INFO_REFRESH_DELAY);
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceAround }) {
      if (!this.isDragging) {
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
            clickForm: (event, formItem) => {
              this.mPageDesktopViewModel.openApplication(this.formItem.abilityName, this.formItem.bundleName);
            }
          })
        }
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
              this.mPageDesktopViewModel.onAppDoubleClick(this.formItem.abilityName, this.formItem.bundleName);
            })
          )
        )
        .onTouch((event: TouchEvent) => {
          AppStorage.SetOrCreate('dragFocus', FeatureConstants.FEATURE_NAME);
          this.mPageDesktopDragHandler.setDragStateListener(this.mDragStateListener);
          this.mPageDesktopDragHandler.notifyTouchEventUpdate(event);
        })
        .width(StyleConstants.PERCENTAGE_100)
        .height(StyleConstants.PERCENTAGE_100)
      }
    }
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
  }
}