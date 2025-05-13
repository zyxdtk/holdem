import { Card, GameLog, GameState, Player, TableState } from "./types";
import { RANKS, SUITS } from './types';

const PLAYER_ORDER = [1, 7, 3, 9, 5, 11, 4, 10, 2, 8, 6, 12]

// 添加日志
export function addLog(gameState: GameState, message: string): void {
    gameState.gameLogs.push({ message, timestamp: new Date().toISOString() });
    console.log(message);
}

// 创建GameState
export function createGameState(): GameState {
    const gameState: GameState = {
        players: Array(12).fill(null).map((_, i) => (
            createPlayer(i + 1, `玩家 ${i + 1}`, 1000)
        )) as Player[],
        table: createTableState(),
        gameLogs: [] as GameLog[],
    };
    setPlayerCount(gameState, 6);
    gameState.players[0].isUser = true;
    
    gameState.players[PLAYER_ORDER[1]-1].style = 'tight';
    gameState.players[PLAYER_ORDER[2]-1].style = 'loose';
    gameState.players[PLAYER_ORDER[3]-1].style = 'aggressive';
    gameState.players[PLAYER_ORDER[4]-1].style = 'conservative';
    gameState.players[PLAYER_ORDER[5]-1].style = 'checkCall';
    return gameState;
}

// 设置Player上桌人数
export function setPlayerCount(state: GameState, count: number): void {
    PLAYER_ORDER.forEach((playerId, index) => {
        const player = state.players.find(p => p.id === playerId)
        if (!player) {
            console.error(`Player with id ${playerId} not found`)
            throw new Error(`Player with id ${playerId} not found`)
            return
        }
        if (index < count) {
            player.isActive = true
            player.chips = 1000
            player.buyin = 1000
        } else {
            player.isActive = false
            player.chips = 0
            player.buyin = 0
        }
    })
}

// 创建Player 
export function createPlayer(id: number, name: string, chips: number): Player {
    return {
        id,
        name,
        chips,
        buyin: chips,
        hand: [],
        isDealer: false,
        isUser: false,
        isActive: true,
        currentBet: 0,
        isAllIn: false,
        lastAction: '',
        isWinner: false,
        winAmount: 0,
        style: 'checkCall'
    } as Player;
}

// 创建TableState
export function createTableState(): TableState {
    return {
        minBuyin: 1000,
        pot: 0,
        sidePots: [], // 新增 sidePots 属性，初始化为空数组
        deck: [] as Card[], // 新增 deck 属性，初始化为空的 Card 数组
        currentBet: 0,
        raiseCount: 0,
        communityCards: [],
        smallBlind: 10,
        bigBlind: 20,
        gameStage: 'waiting',
        dealerPosition: 0,
        currentPlayer: 0,
        delayTimes: {
            playerAction: 1000,
            betweenStages: 3000,
            betweenGames: 5000,
        }
    } as TableState;
}

export function createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ suit, rank, rankValue: RANKS.indexOf(rank) + 2 });
        }
    }
    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function getCommunityCards(deck: Card[], stage: 'flop' | 'turn' | 'river'): Card[] {
    const cards: Card[] = [];
    switch (stage) {
        case 'flop':
            cards.push(...deck.splice(0, 3));
            break;
        case 'turn':
            cards.push(deck.splice(0, 1)[0]);
            break;
        case 'river':
            cards.push(deck.splice(0, 1)[0]);
            break;
    }
    return cards;
}