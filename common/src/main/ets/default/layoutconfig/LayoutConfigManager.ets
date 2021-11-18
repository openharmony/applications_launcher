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

import CommonConstants from '../constants/CommonConstants.ets'
import ILayoutConfig from './ILayoutConfig.ets'

/**
 * 布局配置管理
 * 当前分为三种类型的布局
 * 1、布局模式管理，比如网格/列表布局，这类布局配置可以很方便的转换为设置项
 * 2、布局样式管理，比如边距、大小、颜色等布局参数，用于进行设定上可调节的布局样式配置
 * 3、功能布局管理，比如桌面布局的布局管理
 * 主要提供的功能：
 * 1、保存管理所有的配置对象
 * 2、分三层（产品 > 特性 > 公共）查询配置值得能力
 * 3、持久化某些配置值得能力
 */
class LayoutConfigManager {
  private static sInstance: LayoutConfigManager = null;

  private mPreferences = null;

  private mCommonConfig: Array<Array<ILayoutConfig>> = new Array<Array<ILayoutConfig>>();

  private mFeatureConfig: Array<Array<ILayoutConfig>> = new Array<Array<ILayoutConfig>>();

  private mProductConfig: Array<Array<ILayoutConfig>> = new Array<Array<ILayoutConfig>>();

  private constructor() {
    this.resetConfigArray();
  }

  private resetConfigArray() {
    this.initConfigArray(this.mCommonConfig);
    this.initConfigArray(this.mFeatureConfig);
    this.initConfigArray(this.mProductConfig);
  }

  private initConfigArray(configArr: Array<Array<ILayoutConfig>>): void {
    configArr[CommonConstants.LAYOUT_CONFIG_TYPE_MODE] = new Array<ILayoutConfig>();
    configArr[CommonConstants.LAYOUT_CONFIG_TYPE_STYLE] = new Array<ILayoutConfig>();
    configArr[CommonConstants.LAYOUT_CONFIG_TYPE_FUNCTION] = new Array<ILayoutConfig>();
  }

  /**
   * 获取配置管理类实例
   */
  public static getInstance(): LayoutConfigManager {
    if (LayoutConfigManager.sInstance == null) {
      LayoutConfigManager.sInstance = new LayoutConfigManager();
    }
    return LayoutConfigManager.sInstance;
  }

  /**
   * 往配置管理类里添加配置对象
   */
  public addConfigToManager(config: ILayoutConfig): void {
    let configLevel = config.getConfigLevel();
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
  public removeConfigFromManager(): void {
    this.resetConfigArray();
  }

  /**
   * 获取对应配置名的布局模式配置
   *
   * @params configName 配置名
   */
  public getModeConfig(configName: string): any {
    let configArr = this.getTargetTypeConfigs(CommonConstants.LAYOUT_CONFIG_TYPE_MODE);
    return this.getConfigByName(configArr, configName);
  }

  /**
   * 获取对应配置名的布局样式配置
   *
   * @params configName 配置名
   */
  public getStyleConfig(configName: string): any {
    let configArr = this.getTargetTypeConfigs(CommonConstants.LAYOUT_CONFIG_TYPE_STYLE);
    return this.getConfigByName(configArr, configName);
  }

  /**
   * 获取对应配置名的功能布局配置
   *
   * @params configName 配置名
   */
  public getFunctionConfig(configName: string): any {
    let configArr = this.getTargetTypeConfigs(CommonConstants.LAYOUT_CONFIG_TYPE_FUNCTION);
    return this.getConfigByName(configArr, configName);
  }

  private getConfigByName(configArr: Array<ILayoutConfig>, configName: string) {
    for(let config of configArr) {
      if (config.getConfigName() ==  configName) {
        return config;
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

let layoutConfigManager = LayoutConfigManager.getInstance();
export default layoutConfigManager;
