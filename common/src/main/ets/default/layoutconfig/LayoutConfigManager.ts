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

import CommonConstants from '../constants/CommonConstants';
import ILayoutConfig from './ILayoutConfig';

/**
 * 布局配置管理
 * 当前分为三种类型的布局管理：
 * 1、布局模式管理，比如网格/列表布局，这类布局配置可以很方便的转换为设置项
 * 2、布局样式管理，比如边距、大小、颜色等布局参数，用于进行设定上可调节的布局样式配置
 * 3、功能布局管理，比如桌面布局的布局管理
 * 主要提供的功能：
 * 1、保存管理所有的配置对象
 * 2、分三层（产品 > 特性 > 公共）查询配置值的能力
 * 3、持久化某些配置值的能力
 */
class LayoutConfigManager {
  private readonly mPreferences = null;

  private readonly mCommonConfig: ILayoutConfig[][] = new Array<ILayoutConfig[]>();

  private readonly mFeatureConfig: ILayoutConfig[][] = new Array<ILayoutConfig[]>();

  private readonly mProductConfig: ILayoutConfig[][] = new Array<ILayoutConfig[]>();

  private constructor() {
    this.resetConfigArray();
  }

  private resetConfigArray() {
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
   * 获取配置管理类实例
   */
  static getInstance(): LayoutConfigManager {
    if (globalThis.LayoutConfigManager == null) {
      globalThis.LayoutConfigManager = new LayoutConfigManager();
    }
    console.info('Launcher LayoutConfigManager constructor!');
    return globalThis.LayoutConfigManager;
  }

  /**
   * 往配置管理类里添加配置对象
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
   * 释放管理类里添加配置对象
   */
  removeConfigFromManager(): void {
    this.resetConfigArray();
  }

  /**
   * 获取对应配置名的布局模式配置
   *
   * @params configName 配置名
   * @params featureName 特性名
   */
  getModeConfig<T extends ILayoutConfig>(configName: string, featureName?: string): T {
    const configArr = this.getTargetTypeConfigs(CommonConstants.LAYOUT_CONFIG_TYPE_MODE);
    return this.getConfigByName(configArr, configName, featureName);
  }

  /**
   * 获取对应配置名的布局样式配置
   *
   * @params configName 配置名
   * @params featureName 特性名
   */
  getStyleConfig(configName: string, featureName?: string): any {
    const configArr = this.getTargetTypeConfigs(CommonConstants.LAYOUT_CONFIG_TYPE_STYLE);
    return this.getConfigByName(configArr, configName, featureName);
  }

  /**
   * 获取对应配置名的功能布局配置
   *
   * @params configName 配置名
   * @params featureName 特性名
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

const layoutConfigManager = LayoutConfigManager.getInstance();
export default layoutConfigManager;
