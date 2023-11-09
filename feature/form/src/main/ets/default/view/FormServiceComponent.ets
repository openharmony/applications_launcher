/**
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
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
  AppMenu,
  FormManagerDialog,
} from '@ohos/common/component'
import {
  CommonConstants,
  StyleConstants,
  LayoutViewModel,
  CardItemInfo,
  FormModel,
  Log,
  SettingsModel,
  windowManager,
  AppItemInfo,
  ResourceManager,
  MenuInfo,
  AppModel,
  localEventManager,
  EventConstants
} from '@ohos/common';
import ServiceFormAppItem from '../common/uicomponents/ServiceFormAppItem';
import ServiceFormItem from '../common/uicomponents/ServiceFormItem';
import ThisStyleConstants from '../common/constants/StyleConstants';
import GridRowUtils from '../manager/GridRowManager';
import ServiceFormManager from '../manager/ServiceFormManager';
import { PageDesktopViewModel } from '../../../../../../pagedesktop/src/main/ets/default/viewmodel/PageDesktopViewModel';

const TAG = 'FormServiceComponent';

/**
 * Form service view Component (phone adaptation).
 */
@Component
export struct FormServiceComponent {
  @StorageLink('screenWidth') @Watch('initPage') screenWidth: number = 0;
  @StorageLink('screenHeight') screenHeight: number = 0;
  @State formAppInfos: AppItemInfo[] = [];
  @State showFormInfos: CardItemInfo[] = new Array();
  private readonly mServiceFormManager: ServiceFormManager = ServiceFormManager.getInstance();
  private mFormModel: FormModel = FormModel.getInstance();
  private mAppModel: AppModel = AppModel.getInstance();
  private clickedformApp: AppItemInfo = new AppItemInfo();
  private clearForm: Function = () => {};
  private gridRowUtils: GridRowUtils = new GridRowUtils(0, 0, 0);
  private formServiceWidth: number = 0;
  private titleBarWidth: number = 0;
  private sysUITopHeight: number = 0;
  private sysUIBottomHeight: number = 0;
  private scrollerWrapHeight: number = 0;
  private scroller: Scroller = new Scroller();
  @StorageProp('cornerRadiusDefaultL') cornerRadiusDefaultL: number = px2vp(ResourceManager.getInstance()
    .getNumberByResource($r('sys.float.ohos_id_corner_radius_default_l')));

  private async initServiceFormInfo(): Promise<void> {
    // 从包管理获取app
    this.formAppInfos = await this.mServiceFormManager.getServiceFormAppList();
    Log.showInfo(TAG, `has ${this.formAppInfos.length} apps with form`);

    // 获取推荐卡片
    let recommendForms: CardItemInfo[] = await this.mServiceFormManager.getServiceForm();
    Log.showInfo(TAG, `recommendCardsDataPool has ${recommendForms.length} cards`);
    // 卡片信息补全
    this.mServiceFormManager.formInfoComplete(recommendForms, this.formAppInfos);
    // 获取展示卡片
    this.showFormInfos = this.mServiceFormManager.getShowFormInfos(recommendForms);
    Log.showInfo(TAG, `this.showFormInfos has ${this.showFormInfos.length} cards`);
  }

  private onAppStateChanged = () => {
    // 推荐卡片更新后需要重新获取推荐列表
    this.initServiceFormInfo();
  }
  private readonly listener = this.onAppStateChanged;

  /**
   * 返回箭头
   */
  private backToDeskTop(): void {
    windowManager.destroyWindow(windowManager.FORM_SERVICE_WINDOW_NAME);
  }

  aboutToAppear(): void {
    this.sysUITopHeight = LayoutViewModel.getInstance().getSysUITopHeight();
    this.sysUIBottomHeight = LayoutViewModel.getInstance().getSysUIBottomHeight();
    Log.showDebug(TAG, `sysUITopHeight:${this.sysUITopHeight},sysUIBottomHeight:${this.sysUIBottomHeight}`);
    this.scrollerWrapHeight = this.screenHeight - ThisStyleConstants.FORM_SERVICE_BAR_HEIGHT - this.sysUITopHeight
      - this.sysUIBottomHeight;
    this.initPage();
    this.mAppModel.registerStateChangeListener(this.listener);
    this.onAppStateChanged();
  }

  aboutToDisappear(): void {
    this.formManagerDialogController = null;
    this.mAppModel.unregisterAppStateChangeListener(this.listener);
  }

  initPage(): void {
    this.titleBarWidth = this.screenWidth - 2 * ThisStyleConstants.FORM_SERVICE_MARGIN_HORIZONTAL;
    if (this.screenWidth < 520) {
      this.formServiceWidth = this.titleBarWidth;
      this.gridRowUtils = new GridRowUtils(ThisStyleConstants.FORM_SERVICE_GRID_ROW_COLUMNS,
        ThisStyleConstants.FORM_SERVICE_GRID_ROW_GUTTER_X, this.formServiceWidth);
    } else if (this.screenWidth < 840) {
      let gridRowUtilsTemp: GridRowUtils = new GridRowUtils(ThisStyleConstants.FORM_SERVICE_GRID_ROW_COLUMNS * 2,
        ThisStyleConstants.FORM_SERVICE_GRID_ROW_GUTTER_X, this.titleBarWidth);
      this.formServiceWidth = this.titleBarWidth - (gridRowUtilsTemp.getSingleColumnWidth() +
      gridRowUtilsTemp.getGutterX()) * 2;
      this.gridRowUtils = new GridRowUtils(gridRowUtilsTemp.getColumns() - 2, gridRowUtilsTemp.getGutterX(),
        this.formServiceWidth);
    } else {
      let gridRowUtilsTemp: GridRowUtils = new GridRowUtils(ThisStyleConstants.FORM_SERVICE_GRID_ROW_COLUMNS * 3,
        ThisStyleConstants.FORM_SERVICE_GRID_ROW_GUTTER_X, this.titleBarWidth);
      this.formServiceWidth = this.titleBarWidth - (gridRowUtilsTemp.getSingleColumnWidth() +
      gridRowUtilsTemp.getGutterX()) * 2;
      this.gridRowUtils = new GridRowUtils(gridRowUtilsTemp.getColumns() - 2, gridRowUtilsTemp.getGutterX(),
        this.formServiceWidth);
    }
  }

  formClick(event: ClickEvent, formItem: CardItemInfo): void {
    let clickedFormAppInfos: AppItemInfo[] = this.formAppInfos.filter(info => info.bundleName == formItem.bundleName);
    if (clickedFormAppInfos.length == 0) {
      Log.showError(TAG, `The clicked card has no app information.`);
      return;
    }
    let formAppInfo: AppItemInfo = clickedFormAppInfos[0];
    if (SettingsModel.getInstance().getDevice() == CommonConstants.DEFAULT_DEVICE_TYPE) {
      this.mFormModel.doBeforeJumpToFormManager(formAppInfo.bundleName).then(() => {
        AppStorage.setOrCreate('formAppInfo', formAppInfo);
        windowManager.createWindowWithName(windowManager.FORM_MANAGER_WINDOW_NAME, windowManager.RECENT_RANK);
      })
    } else {
      this.clickedformApp = JSON.parse(JSON.stringify(formAppInfo));
      this.formManagerDialogController?.open();
    }
  }

  formManagerDialogController: CustomDialogController | null = new CustomDialogController({
    builder: FormManagerDialog({
      cancel: (callback?: () => void) => {
        // delete all form
        if (callback !== undefined) {
          this.clearForm = callback;
        } else {
          Log.showError(TAG, `FormManagerDialog callback error`); // 维测日志
        }
      },
      confirm: (formCardItem: CardItemInfo) => {
        PageDesktopViewModel.getInstance().createCardToDeskTop(formCardItem);
      },
      bundleName: this.clickedformApp.bundleName as string,
      appName: this.clickedformApp.appName as string,
      appLabelId: this.clickedformApp.appLabelId as number
    }),
    cancel: this.cancelFormDialog,
    autoCancel: true,
    customStyle: true
  });

  /**
   * When click cancel dialog, this function will be called.
   */
  cancelFormDialog(): void {
    this.clearForm();
  }

  formAppClick = (event: ClickEvent, appItem: AppItemInfo): void => {
    if (SettingsModel.getInstance().getDevice() == CommonConstants.DEFAULT_DEVICE_TYPE) {
      this.mFormModel.doBeforeJumpToFormManager(appItem.bundleName).then(() => {
        AppStorage.setOrCreate('formAppInfo', appItem);
        windowManager.createWindowWithName(windowManager.FORM_MANAGER_WINDOW_NAME, windowManager.RECENT_RANK);
      })
    } else {
      this.clickedformApp = appItem;
      this.formManagerDialogController?.open();
    }
  }

  private getFormWidth(dimension?: number): number {
    if (dimension == CommonConstants.CARD_DIMENSION_2x4) {
      return this.gridRowUtils.getSpanWidth(4);
    }
    if (dimension == CommonConstants.CARD_DIMENSION_2x2) {
      return this.gridRowUtils.getSpanWidth(2);
    }
    return 0;
  }

  private getFormHeight(dimension?: number): number {
    if (dimension == CommonConstants.CARD_DIMENSION_2x4
      || dimension == CommonConstants.CARD_DIMENSION_2x2) {
      return this.gridRowUtils.getSpanWidth(2);
    }
    return 0;
  }

  @Builder FormMenuBuilder(formItem: CardItemInfo) {
    Flex({ direction: FlexDirection.Column, justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
      AppMenu({
        menuInfoList: this.createAddFormToDesktopMenuInfo(formItem)
      })
    }
  }

  /**
   * 添加卡片至桌面
   *
   * @param formInfo 卡片信息
   */
  private createAddFormToDesktopMenuInfo(formItem: CardItemInfo): MenuInfo[] {
    let menuInfoList: MenuInfo[] = new Array<MenuInfo>();
    let addFormToDesktopMenuInfo: MenuInfo = new MenuInfo();
    addFormToDesktopMenuInfo.menuType = CommonConstants.MENU_TYPE_FIXED;
    addFormToDesktopMenuInfo.menuImgSrc = '/common/pics/ic_form_addToDesktop.svg';
    addFormToDesktopMenuInfo.menuText = $r('app.string.add_to_desktop');
    addFormToDesktopMenuInfo.onMenuClick = (): void => {
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_OPEN_FOLDER_TO_CLOSE, null);
      let formInfo: CardItemInfo = this.getChoosedCard(formItem);
      PageDesktopViewModel.getInstance().createCardToDeskTop(formInfo);
      this.backToDeskTop();
    };
    menuInfoList.push(addFormToDesktopMenuInfo);
    return menuInfoList;
  }

  private getChoosedCard(choosedItem: CardItemInfo): CardItemInfo {
    let formItem = choosedItem;
    formItem.cardId = choosedItem.cardId;
    formItem.cardName = choosedItem.cardName;
    formItem.cardDimension = choosedItem.cardDimension;
    formItem.dragLayerWidth = this.getFormWidth(formItem.cardDimension) * 1.05;
    formItem.dragLayerHeight = this.getFormHeight(formItem.cardDimension) * 1.05;
    return formItem;
  }

  build() {
    Stack() {
      Column() {
        Row() {
          Image(ThisStyleConstants.FORM_SERVICE_BACK_IMAGE)
            .width(ThisStyleConstants.FORM_SERVICE_BACK_ICON_WIDTH)
            .height(ThisStyleConstants.FORM_SERVICE_BACK_ICON_HEIGHT)
            .onClick(() => {
              this.backToDeskTop();
            })

          Text($r('app.string.add_form_to_desktop'))
            .textAlign(TextAlign.Start)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .maxLines(1)
            .fontSize($r('sys.float.ohos_id_text_size_dialog_tittle'))
            .fontColor($r('sys.color.ohos_id_color_text_primary_contrary'))
            .fontWeight(ResourceManager.getInstance().getFontWeightMedium())
            .margin({
              left: ThisStyleConstants.FORM_SERVICE_BAR_TEXT_MARGIN_LEFT
            })
        }
        .width(this.titleBarWidth)
        .height(ThisStyleConstants.FORM_SERVICE_BAR_HEIGHT)
        .margin({
          top: this.sysUITopHeight
        })

        Scroll(this.scroller) {
          Column() {
            Column() {
              GridRow({
                columns: this.gridRowUtils.getColumns(),
                gutter: {
                  x: this.gridRowUtils.getGutterX(),
                  y: $r('sys.float.ohos_id_card_margin_middle')
                }
              }) {
                ForEach(this.showFormInfos, (item: CardItemInfo, index: number) => {
                  GridCol({
                    span: item.cardDimension == CommonConstants.CARD_DIMENSION_2x4 ? 4 : 2
                  }) {
                    ServiceFormItem({
                      formItem: item,
                      mFormItemWidth: this.getFormWidth(item.cardDimension),
                      mFormItemHeight: this.getFormHeight(item.cardDimension),
                      idIndex: index
                    })
                      .bindContextMenu(this.FormMenuBuilder(item), ResponseType.LongPress)
                      .bindContextMenu(this.FormMenuBuilder(item), ResponseType.RightClick)
                      .onClick((event: ClickEvent) => {
                        this.formClick(event, item);
                      })
                  }
                }, (item: CardItemInfo) => JSON.stringify(item))
              }
            }
            .width(this.formServiceWidth)
            .margin({
              top: $r('sys.float.ohos_id_card_margin_middle')
            })

            List() {
              ForEach(this.formAppInfos, (item: AppItemInfo, index: number) => {
                ListItem() {
                  ServiceFormAppItem({
                    appName: item.appName,
                    bundleName: item.bundleName,
                    abilityName: item.abilityName,
                    moduleName: item.moduleName,
                    appLabelId: Number(item.appLabelId).valueOf(),
                    iconId: item.appIconId,
                    item: item,
                    clickApp: this.formAppClick,
                    idIndex: index
                  })
                }
              }, (item: AppItemInfo) => JSON.stringify(item))
            }
            .divider({
              strokeWidth: ThisStyleConstants.SERVICE_FORM_APP_ITEM_GROUP_DIVIDER_WIDTH,
              color: ThisStyleConstants.FORM_SERVICE_APP_LIST_DIVIDER_COLOR,
              startMargin: ThisStyleConstants.SERVICE_FORM_APP_ITEM_GROUP_DIVIDER_MARGIN_LEFT,
              endMargin: 0
            })
            .borderRadius(this.cornerRadiusDefaultL)
            .width(this.formServiceWidth)
            .backgroundColor(ThisStyleConstants.FORM_SERVICE_APP_LIST_BACKGROUND_COLOR)
            .padding({
              top: ThisStyleConstants.FORM_SERVICE_APP_LIST_PADDING_VERTICAL,
              bottom: ThisStyleConstants.FORM_SERVICE_APP_LIST_PADDING_VERTICAL,
              left: ThisStyleConstants.FORM_SERVICE_APP_LIST_PADDING_HORIZONTAL,
              right: ThisStyleConstants.FORM_SERVICE_APP_LIST_PADDING_HORIZONTAL
            })
            .margin({
              top: $r('sys.float.ohos_id_card_margin_middle'),
              bottom: ThisStyleConstants.FORM_SERVICE_APP_LIST_MARGIN_BOTTOM
            })
          }
          .width(StyleConstants.PERCENTAGE_100)
          .alignItems(HorizontalAlign.Center)
        }
        .align(Alignment.TopStart)
        .scrollBar(BarState.Off)
        .width(StyleConstants.PERCENTAGE_100)
        .height(this.scrollerWrapHeight)
      }
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
    }
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
    .backgroundImage(StyleConstants.DEFAULT_FORM_MGR_BACKGROUND_IMAGE)
    .backgroundBlurStyle(BlurStyle.BACKGROUND_THICK)
  }
}
