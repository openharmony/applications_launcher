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

interface DeviceScreenInfo {
  width: number
  height: number
  screenSize: number
}

export default class PadSmartCanvas {
  private readonly BASELINE: number = 8;// mm
  private readonly DISTANCE_BASE: number = 300;// mm
  private readonly SCREEN_SIZE_WEIGHT: number = 0.3;
  private readonly MM_TO_INCHES: number = 25.4;// mm --> inches
  private readonly SINGLE_ARM_DISTANCE: number = 450;// mm
  private readonly ARM_DISTANCE: number = 560;
  private readonly SINGLE_ARM_DISTANCE_COEFFICIENT: number = 0.8;
  private readonly ARM_DISTANCE_COEFFICIENT: number = 0.6;

  private width: number = 0;
  private height: number = 0;
  private screenSize: number = 0;
  private ppi: number = 0;
  normalIconSize: number = 0;
  accessIconSize: number = 0;
  normalRadioAccess: number = 0;

  protected constructor(info: DeviceScreenInfo) {
    this.width = info.width;
    this.height = info.height;
    this.screenSize = info.screenSize;
    this.initIconSizeConfig();
  }

  static getInstance(info: DeviceScreenInfo): PadSmartCanvas {
    if (globalThis.PadSmartCanvas == null) {
      globalThis.PadSmartCanvas = new PadSmartCanvas(info);
    }
    return globalThis.PadSmartCanvas;
  }

  private calculatePPI(): void {
    this.ppi = Math.sqrt((this.width * this.width + this.height * this.height)) / this.screenSize;
  }

  private calculateIconSize(useDistance: number, distanceCoefficient: number): number {
    let sizeRes: number = (this.BASELINE * (useDistance / this.DISTANCE_BASE) + this.screenSize * this.SCREEN_SIZE_WEIGHT) * distanceCoefficient * this.ppi / this.MM_TO_INCHES;
    return sizeRes;
  }

  private initIconSizeConfig(): void {
    this.calculatePPI();
    this.normalIconSize = this.calculateIconSize(this.SINGLE_ARM_DISTANCE, this.SINGLE_ARM_DISTANCE_COEFFICIENT);
    this.accessIconSize = this.calculateIconSize(this.ARM_DISTANCE, this.ARM_DISTANCE_COEFFICIENT);
    this.normalRadioAccess = this.normalIconSize / this.accessIconSize;
  }
}