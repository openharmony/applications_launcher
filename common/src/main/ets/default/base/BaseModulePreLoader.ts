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

/**
 * 模块初始内容加载器基类
 * 进行配置和数据的提前加载
 */
export default abstract class BaseModulePreLoader {

  /**
   * 执行初始化加载动作
   */
  load(): void {
    this.loadConfig();
    this.loadData();
  }

  /**
   * 初始化加载配置
   */
  protected abstract loadConfig(): void;

  /**
   * 初始化加载数据
   */
  protected abstract loadData(): void;

  /**
   * 模块释放
   */
  abstract releaseConfigAndData(): void;
}
