import type { Card, PlayerAction, PlayerState, TableState, OpponentState} from './types'
import { evaluateHand } from './evaluation'



export function generateAction(
  player: PlayerState,
  table: TableState,
  opponents: OpponentState[]
): PlayerAction {
  // 计算手牌强度 (0-1)
  const handStrength = calculateHandStrength(player.hand, table.communityCards)
  
  // 根据风格决定行动
  switch(player.style) {
    case 'tight':
      return tightStrategy(player, table, handStrength)
    case 'loose':
      return looseStrategy(player, table, handStrength)
    case 'aggressive':
      return aggressiveStrategy(player, table, handStrength)
    case 'conservative':
      return conservativeStrategy(player, table, handStrength)
  }
}

function calculateHandStrength(hand: Card[], communityCards: Card[]): number {
  if (communityCards.length === 0) {
    // 翻牌前手牌评估
    const highCard = Math.max(...hand.map(c => c.rankValue))
    return highCard / 14 // 标准化到0-1
  }
  
  const evaluation = evaluateHand(hand, communityCards)
  // 根据牌型评估强度 (简化版)
  return evaluation.handType / 10 // 0-0.9
}

function tightStrategy(player: PlayerState, table: TableState, handStrength: number): PlayerAction {
  if (handStrength < 0.3) {
    return { type: 'fold', amount: 0 }
  }
  
  if (handStrength < 0.6) {
    return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
  }
  
  const raiseAmount = Math.min(
    player.chips,
    Math.max(table.currentBet * 1.5, table.pot * 0.3)
  )
  return { type: 'raise', amount: raiseAmount }
}

function looseStrategy(player: PlayerState, table: TableState, handStrength: number): PlayerAction {
  if (handStrength < 0.2 && Math.random() < 0.3) {
    return { type: 'fold', amount: 0 }
  }
  
  if (handStrength < 0.5 || Math.random() < 0.4) {
    return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
  }
  
  const raiseAmount = Math.min(
    player.chips,
    Math.max(table.currentBet * 2, table.pot * 0.5)
  )
  return { type: 'raise', amount: raiseAmount }
}

function aggressiveStrategy(player: PlayerState, table: TableState, handStrength: number): PlayerAction {
  if (handStrength < 0.2 && Math.random() < 0.1) {
    return { type: 'fold', amount: 0 }
  }
  
  if (handStrength < 0.4 && Math.random() < 0.3) {
    return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
  }
  
  const raiseAmount = Math.min(
    player.chips,
    Math.max(table.currentBet * 3, table.pot * 0.7)
  )
  return { type: 'raise', amount: raiseAmount }
}

function conservativeStrategy(player: PlayerState, table: TableState, handStrength: number): PlayerAction {
  if (handStrength < 0.4) {
    return { type: 'fold', amount: 0 }
  }
  
  if (handStrength < 0.8 || table.currentBet > player.chips * 0.3) {
    return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
  }
  
  const raiseAmount = Math.min(
    player.chips,
    Math.max(table.currentBet * 1.2, table.pot * 0.2)
  )
  return { type: 'raise', amount: raiseAmount }
}