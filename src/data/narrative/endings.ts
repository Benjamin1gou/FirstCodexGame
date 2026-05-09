import type { EndingDefinition } from '../../core/narrative/narrativeTypes';
export const ENDINGS: EndingDefinition[] = [
{ id:'strategic', name:'知略勝利エンド', conditionType:'strategic', text:'勇者たちは敗れた。だが、彼らを倒したのは牙でも炎でもない。彼ら自身の選択だった。魔王ヴァルムは静かに笑う。『迷宮とは壁ではない。判断の形だ』' },
{ id:'forceful', name:'力押し勝利エンド', conditionType:'forceful', text:'勇者は倒れた。勝利は勝利だ。だが、崩れた床、砕けた壁、使い潰した罠の山を見て、ヴァルムは呟く。『勝った。だが、美しくはないな』' },
{ id:'defeat', name:'敗北エンド', conditionType:'defeat', text:'勇者は王座へ辿り着いた。誘導は破られた。だが、魔王ヴァルムは倒れながらも笑っていた。『よい。次は、その判断すら迷宮に組み込もう』' }
];
