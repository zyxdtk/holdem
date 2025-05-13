export const SUITS = ['♥', '♦', '♠', '♣'] as const;
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
export const STAGES = ['waiting', 'preflop', 'flop', 'turn', 'river', 'showdown'] as const; 

export type Suit = typeof SUITS[number];
export type Rank = typeof RANKS[number];

export interface Card {
    suit: Suit;
    rank: Rank;
    rankValue: number;
}

export interface GameState  {
    table: TableState
    players: Player[]
    gameLogs: GameLog[]
}

export interface TableState {
    // 筹码相关字段
    smallBlind: number
    bigBlind: number
    minBuyin: number // 单次买入最低额度, 每次买入必须是这个额度的整数倍
    pot: number
    sidePots: SidePot[]
    currentBet: number
    raiseCount: number // 记录玩家第几次加注
    // 牌相关字段
    deck: Card[]
    communityCards: Card[]
    // 游戏进程字段
    gameStage: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
    dealerPosition: number
    currentPlayer: number
    delayTimes: {
        playerAction: number
        betweenStages: number
        betweenGames: number
    }
}

export interface Player {
    id: number
    name: string
    chips: number
    hand: Card[]
    buyin: number // 购买筹码数量
    isDealer: boolean // 是否为dealer字段
    isUser: boolean    // 是否为用户
    isActive: boolean
    currentBet: number
    isAllIn: boolean
    lastAction: string
    // 新增字段
    isWinner: boolean // 本局是否赢了
    winAmount: number // 赢了多少筹码
    handValue?: EvaluatedHand, // 手牌的评估值
    style: 'checkCall' | 'tight' | 'loose' | 'aggressive' | 'conservative' // 玩家风格
}

export interface GameLog {
    timestamp?: string
    message: string
}

export interface SidePot {
    amount: number
    eligiblePlayers: number[] // 有资格赢得该边池的玩家ID
}

export interface PlayerAction  {
    type: 'fold' | 'checkCall' | 'raise' | 'allin' | 'check' | 'call' | 'bet'
    amount: number
}

export interface OpponentState  {
    style: 'tight' | 'loose' | 'aggressive' | 'conservative'
    chips: number
    actions: string[]
}


export interface EvaluatedHand {
    handType: number;
    handRank: number;
    value: number;
    handName: string;
    cards: Card[];
}