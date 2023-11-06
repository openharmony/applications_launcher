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
import { AppItemInfo } from './AppItemInfo';

/**
 * drag item info
 */
export class LauncherDragItemInfo {
  isDragging: boolean = false;

  constructor(isDragging?: boolean) {
    this.isDragging = isDragging ? isDragging : false;
  }

  cardId: number | undefined;
  folderId: string | undefined;
  folderName: string | undefined;
  appList: string[] | undefined;
  keyName: string | undefined;
  bundleName: string | undefined;
  abilityName: string | undefined;
  moduleName: string | undefined;
  cardName: string | undefined;
  cardDimension: number | undefined;
  area: number[] | undefined;
  description = '';
  formConfigAbility: string | undefined;
  appLabelId: number | undefined;
  appName: string | undefined;
  supportDimensions: number[] | undefined;
  appId: string | undefined;
  appIconId: number | undefined;
  isSystemApp: boolean | undefined;
  isUninstallAble: boolean | undefined;
  badgeNumber: number | undefined;
  checked: boolean | undefined;
  installTime: string | undefined;
  typeId: number | undefined;
  page: number | undefined;
  column: number | undefined;
  row: number | undefined;
  bundleType: number | undefined;
  totalDimensionCount: number | undefined;
  layoutInfo?: AppItemInfo[][]
}