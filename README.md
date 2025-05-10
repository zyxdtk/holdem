# 德州扑克小游戏

最近vibe-coding很火，于是想写一个德州扑克小游戏，秉持褥羊毛原则，用的都是免费的模型。


## 版本记录

- v0.0.0 用gemini2.5模型实现的德州扑克游戏，代码如下：[gemini-holdem](doc/gemini/holdem.html)
- v0.0.1 用trae+deepseekv3改写，把一个html拆分成html+js+css，代码如下：[trae-holdem](doc/gemini_rewrite/index.html) 但是进一步实现复杂逻辑有点麻烦，放弃。
- v0.1.0  用trae+deepseekv3生成，采样vue3+vite框架。初步实现了游戏流程。bot的策略是默认checkCall，游戏胜负是随机选择胜者。代码如下：[trae-holdem-vue](src/index.html)

## 未来计划

- [ ] 实现bot的策略
- [x] 实现游戏胜负判定
- [x] 默认不显示对手的手牌
- [ ] 为用户提供gto胜率建议
- [ ] 把界面做的漂亮一些
- [ ] 托管出去，让其他人能玩

## 参考资料

- [EnzeD/vibe-coding](https://github.com/EnzeD/vibe-coding)
- [filipecalegario/awesome-vibe-coding](https://github.com/filipecalegario/awesome-vibe-coding)
- [gavinwalters/Vue.js-Texas-Holdem](https://github.com/gavinwalters/Vue.js-Texas-Holdem)
