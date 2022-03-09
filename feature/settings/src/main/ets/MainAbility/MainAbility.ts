import Ability from '@ohos.application.Ability';

export default class MainAbility extends Ability {
  onCreate(want, launchParam) {
    console.log('settings MainAbility onCreate is called');
  }

  onDestroy() {
    console.log('settings MainAbility onDestroy is called');
  }

  onWindowStageCreate(windowStage) {
    console.log('settings MainAbility onWindowStageCreate is called');
    globalThis.settingsContext = this.context;
    windowStage.setUIContent(this.context, 'pages/Settings', null);
  }

  onWindowStageDestroy() {
    console.log('settings MainAbility onWindowStageDestroy is called');
  }

  onForeground() {
    console.log('settings MainAbility onForeground is called');
  }

  onBackground() {
    console.log('settings MainAbility onBackground is called');
    globalThis.settingsContext.terminateSelf();
  }
}