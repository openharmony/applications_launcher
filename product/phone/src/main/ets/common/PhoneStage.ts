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

import BaseStage from '../../../../../../common/src/main/ets/default/base/BaseStage';
import LayoutConfigManager from '../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import appCenterPreLoader from '../../../../../../feature/appcenter/src/main/ets/default/common/AppCenterPreLoader';
import bigFolderPreLoader from '../../../../../../feature/bigfolder/src/main/ets/default/common/BigFolderPreLoader';
import smartDockPreLoader from '../../../../../../feature/smartdock/src/main/ets/default/common/SmartDockPreLoader';
import pageDesktopPreLoader from '../../../../../../feature/pagedesktop/src/main/ets/default/common/PageDesktopPreLoader';
import formPreLoader from '../../../../../../feature/form/src/main/ets/default/common/FormPreLoader';
import PhoneSmartDockLayoutConfig from './PhoneSmartDockLayoutConfig';
import PhonePageDesktopGridStyleConfig from './PhonePageDesktopGridStyleConfig';
import PhoneFolderLayoutConfig from './PhoneFolderLayoutConfig';
import launcherLayoutPreLoader from './LauncherLayoutPreLoader';
import PhoneFormLayoutConfig from './PhoneFormLayoutConfig';

/**
 * phone product stage
 */
export default class PhoneStage extends BaseStage {
  /**
   * Stage onCreate callback
   */
  onCreate(): void {
    super.onCreate();
    this.initPhoneConfig();
    launcherLayoutPreLoader.load();
    smartDockPreLoader.load();
    pageDesktopPreLoader.load();
    LayoutConfigManager.addConfigToManager(PhonePageDesktopGridStyleConfig.getInstance());
    appCenterPreLoader.load();
    bigFolderPreLoader.load();
    formPreLoader.load();
  }

  /**
   * init phone layout config
   */
  private initPhoneConfig(): void {
    LayoutConfigManager.addConfigToManager(PhoneSmartDockLayoutConfig.getInstance());
    LayoutConfigManager.addConfigToManager(PhoneFolderLayoutConfig.getInstance());
    LayoutConfigManager.addConfigToManager(PhoneFormLayoutConfig.getInstance());
  }

  /**
   * Stage onDestroy callback
   */
  onDestroy(): void {
    super.onDestroy();
    smartDockPreLoader.releaseConfigAndData();
    appCenterPreLoader.releaseConfigAndData();
    pageDesktopPreLoader.releaseConfigAndData();
    bigFolderPreLoader.releaseConfigAndData();
    formPreLoader.releaseConfigAndData();
    launcherLayoutPreLoader.releaseConfigAndData();
  }
}