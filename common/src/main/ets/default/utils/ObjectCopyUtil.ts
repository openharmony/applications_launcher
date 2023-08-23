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

/**
 * 对象拷贝工具类
 * */

export class ObjectCopyUtil {
  /**
   * 判断对象是否为数组
   *
   * @param obj
   * @returns
   */
  private static IsArray(obj: any) {
    return obj && typeof obj == "object" && obj instanceof Array;
  }

  /**
   * 对象深拷贝
   *
   * @param tSource
   * @returns
   */
  public static DeepClone<T>(tSource: T, tTarget?: Record<string, any> | T): T {
    if (this.IsArray(tSource)) {
      tTarget = tTarget || [];
    } else {
      tTarget = tTarget || {};
    }
    for (const key in tSource) {
      if (Object.prototype.hasOwnProperty.call(tSource, key)) {
        if (typeof tSource[key] === "object" && typeof tSource[key] !== null) {
          tTarget[key] = this.IsArray(tSource[key]) ? [] : {};
          this.DeepClone(tSource[key], tTarget[key]);
        } else {
          tTarget[key] = tSource[key];
        }
      }
    }
    return tTarget as T;
  }

  /**
   * 对象浅拷贝
   *
   * @param tSource
   * @returns
   */
  public static SimpleClone<T>(tSource: T, tTarget?: Record<string, any> | T): T {
    if (this.IsArray(tSource)) {
      tTarget = tTarget || [];
    } else {
      tTarget = tTarget || {};
    }
    for (const key in tSource) {
      if (Object.prototype.hasOwnProperty.call(tSource, key)) {
        tTarget[key] = tSource[key];
      }
    }
    return tTarget as T;
  }
}