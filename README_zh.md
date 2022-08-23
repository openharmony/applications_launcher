# 应用子系统/Launcher

- [应用子系统/Launcher](#应用子系统launcher)
  - [简介](#简介)
  - [目录](#目录)
    - [目录结构](#目录结构)
  - [约束](#约束)
  - [说明](#说明)
    - [使用说明](#使用说明)
  - [相关仓](#相关仓)

## 简介
Launcher 作为系统人机交互的首要入口，提供应用图标的显示、点击启动、卸载应用，并提供桌面布局设置以及最近任务管理等功能。  
Launcher 采用 扩展的TS语言（eTS）开发，主要的结构如下：
![](./figures/launcherl2-zh.png)
- **product**
  业务形态层：区分不同产品、不同屏幕的各形态桌面，含有桌面窗口、个性化业务，组件的配置，以及个性化资源包。

- **feature**
  公共特性层：抽象的公共特性组件集合，可以被各桌面形态引用。

- **common**
  公共能力层：基础能力集，每个桌面形态都必须依赖的模块。

## 目录
### 目录结构
```
/applications/standard/launcher/
├── common                    # 公共能力层目录
├── docs                      # 开发指南
├── feature                   # 公共特性层目录
│   └── appcenter             # 应用中心
│   └── bigfolder             # 智能文件夹
│   ├── form                  # 桌面卡片管理功能
│   ├── gesturenavigation     # 手势导航
│   ├── pagedesktop           # 工作区
│   ├── recents               # 最近任务
│   ├── settings              # 桌面设置
│   ├── smartdock             # dock工具栏
├── product                   # 业务形态层目录
├── signature                 # 签名证书
```
## 约束
- 开发环境
    - **DevEco Studio for OpenHarmony**: 版本号大于3.0.0.900，下载安装OpenHarmony SDK API Version 9。（初始的IDE配置可以参考IDE的使用文档）
- 语言版本
    - [eTS](https://gitee.com/openharmony/docs/blob/master/zh-cn/application-dev/quick-start/start-with-ets.md)
- 建议
  -  推荐使用本工程下的launcher.p7b文件，路径：signature/launcher.p7b

## 说明
### 使用说明
[使用桌面卡片管理功能调试服务卡片](https://gitee.com/openharmony/applications_launcher/blob/master/docs/%E4%BD%BF%E7%94%A8Launcher%E5%8D%A1%E7%89%87%E7%AE%A1%E7%90%86%E5%8A%9F%E8%83%BD%E8%B0%83%E8%AF%95%E6%9C%8D%E5%8A%A1%E5%8D%A1%E7%89%87.md)

## 相关仓
- [applications_hap](https://gitee.com/openharmony/applications_hap)
- [applications_systemui](https://gitee.com/openharmony/applications_systemui)
- [aafwk_standard](https://gitee.com/openharmony/aafwk_standard)
- [interface_sdk-js](https://gitee.com/openharmony/interface_sdk-js)