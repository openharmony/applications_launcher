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

import { ILayoutConfig } from './ILayoutConfig';
import { CommonConstants } from '../constants/CommonConstants';

/**
 * Layout configuration management
 * There are currently three types of layout management:
 * 1.Layout mode management, such as grid/list layout, such layout configuration can be easily converted into setting items.
 * 2.Layout style management, such as layout parameters such as margins, sizes, colors, etc., used to configure adjustable layout styles.
 * 3.Functional layout management, such as layout management of desktop layouts.
 * Main features provided:
 * 1.Save and manage all configuration objects.
 * 2.Ability to query configuration values at three tiers (Product > Features > Public).
 * 3.the ability to persist certain configuration values.
 */
class LayoutConfigManager {
  private readonly mCommonConfig: ILayoutConfig[][] = new Array<ILayoutConfig[]>();

  private readonly mFeatureConfig: ILayoutConfig[][] = new Array<ILayoutConfig[]>();

  private readonly mProductConfig: ILayoutConfig[][] = new Array<ILayoutConfig[]>();

  private constructor() {
    this.resetConfigArray();
  }

  private resetConfigArray(): void {
    this.initConfigArray(this.mCommonConfig);
    this.initConfigArray(this.mFeatureConfig);
    this.initConfigArray(this.mProductConfig);
  }

  private initConfigArray(configArr: ILayoutConfig[][]): void {
    configArr[CommonConstants.LAYOUT_CONFIG_TYPE_MODE] = new Array<ILayoutConfig>();
    configArr[CommonConstants.LAYOUT_CONFIG_TYPE_STYLE] = new Array<ILayoutConfig>();
    configArr[CommonConstants.LAYOUT_CONFIG_TYPE_FUNCTION] = new Array<ILayoutConfig>();
  }

  /**
   * Get the instance of the configuration management class
   */
  static getInstance(): LayoutConfigManager {
    if (globalThis.LayoutConfigManager == null) {
      globalThis.LayoutConfigManager = new LayoutConfigManager();
    }
    return globalThis.LayoutConfigManager;
  }

  /**
   * Add configuration objects to the configuration management class
   */
  addConfigToManager(config: ILayoutConfig): void {
    const configLevel = config.getConfigLevel();
    let targetConfigType = null;
    switch (configLevel) {
    case CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON:
      targetConfigType = this.mCommonConfig[config.getConfigType()];
      break;
    case CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE:
      targetConfigType = this.mFeatureConfig[config.getConfigType()];
      break;
    case CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT:
      targetConfigType = this.mProductConfig[config.getConfigType()];
      break;
    default:
      break;
    }
    if (targetConfigType == null || targetConfigType.indexOf(config) != CommonConstants.INVALID_VALUE) {
      return;
    }
    targetConfigType.push(config);
  }

  /**
   * Release the configuration object in the management class
   */
  removeConfigFromManager(): void {
    this.resetConfigArray();
  }

  /**
   * Get the layout mode configuration corresponding to the configuration name
   *
   * @params configName
   * @params featureName
   */
  getModeConfig<T extends ILayoutConfig>(configName: string, featureName?: string): T {
    const configArr = this.getTargetTypeConfigs(CommonConstants.LAYOUT_CONFIG_TYPE_MODE);
    return this.getConfigByName(configArr, configName, featureName);
  }

  /**
   * Get the layout style configuration corresponding to the configuration name
   *
   * @params configName
   * @params featureName
   */
  getStyleConfig(configName: string, featureName?: string): any {
    const configArr = this.getTargetTypeConfigs(CommonConstants.LAYOUT_CONFIG_TYPE_STYLE);
    return this.getConfigByName(configArr, configName, featureName);
  }

  /**
   * Get the function layout configuration corresponding to the configuration name
   *
   * @params configName
   * @params featureName
   */
  getFunctionConfig<T extends ILayoutConfig>(configName: string, featureName?: string): T {
    const configArr = this.getTargetTypeConfigs(CommonConstants.LAYOUT_CONFIG_TYPE_FUNCTION);
    return this.getConfigByName(configArr, configName, featureName);
  }

  private getConfigByName<T extends ILayoutConfig>(configArr: ILayoutConfig[], configName: string, featureName?: string): T {
    for (const config of configArr) {
      if (config.getConfigName() == configName) {
        if (!featureName || config.getFeatureName() == featureName) {
          return <T>config;
        }
      }
    }
    return null;
  }

  private getTargetTypeConfigs(configType: number) {
    let configArr = new Array<ILayoutConfig>();
    configArr = configArr.concat(this.mProductConfig[configType]);
    configArr = configArr.concat(this.mFeatureConfig[configType]);
    configArr = configArr.concat(this.mCommonConfig[configType]);
    return configArr;
  }
}

export const layoutConfigManager = LayoutConfigManager.getInstance();
