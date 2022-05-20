import AbilityStage from '@ohos.application.AbilityStage';

export default class MyAbilityStage extends AbilityStage {
  onCreate(): void {
    console.log('settings MyAbilityStage onCreate is called');
  }
}