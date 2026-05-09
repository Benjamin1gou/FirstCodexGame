import type { NarrativeDefinition } from '../../core/narrative/narrativeTypes';

export const STORIES: NarrativeDefinition[] = [
{ stageId:'stage-001', openingNarration:'最初の勇者が城門を破った。名はアデル。正義を信じ、最短の道を疑わぬ若き剣士である。', demonLordLines:['まずは単純な勇者だ。道があれば進む。ならば、道に意味を仕込め','罠は隠すだけでは足りぬ。踏みたくなる位置に置け'], heroLines:['この道が最短なら、迷う理由はない！'], clearText:'アデルは膝をついた。彼は最後まで、自分が道を選んだと信じていた。', defeatText:'アデルは王座の間へ到達した。正面突破を許した以上、迷宮はまだ未完成だ。'},
{ stageId:'stage-002', openingNarration:'二人目の勇者ミオは、剣よりも地図を、勝利よりも未知を好む探索者だった。', demonLordLines:['宝箱を置け。中身など重要ではない。重要なのは、そこへ向かわせることだ'], heroLines:['光ってる箱を無視する勇者なんている？'], clearText:'ミオは宝箱へ伸ばした手を止められなかった。彼女の敗因は弱さではない。好奇心だった。', defeatText:'ミオは誘惑を振り切り、王座へ到達した。次はもっと魅力的な脇道が必要だ。'},
{ stageId:'stage-003', openingNarration:'三人目の勇者セレナは、踏み出す前に床を見た。', demonLordLines:['慎重な者ほど、危険を避ける。ならば、安全に見える道を用意すればよい'], heroLines:['一度傷を受けた道を、再び選ぶ理由はない'], clearText:'セレナは最後まで冷静だった。だからこそ、用意された安全に従ってしまった。', defeatText:'セレナは罠の意図を読み切り、王座へ到達した。慎重さを破るには、さらに深い誘導が必要だ。'}
];
