import type { Card, PlayerAction, Player, TableState} from './types'
import { evaluateHand } from './evaluation'



export function generateAction(
  player: Player,
  table: TableState
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
    default:
      return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
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

function calculateRaiseAmount(player: Player, table: TableState, multiplier: number): number {
  const baseAmount = Math.max(table.currentBet * multiplier, table.pot * 0.3)
  let raiseAmount = Math.min(player.chips, baseAmount)
  
  // 如果不是全押，则确保加注金额是currentBet和小盲注的整数倍
  if (raiseAmount < player.chips) {
    if (table.currentBet > 0) {
      raiseAmount = Math.floor(raiseAmount / table.currentBet) * table.currentBet
    }
    raiseAmount = Math.max(raiseAmount, table.currentBet * multiplier)
    // 确保是小盲注的整数倍
    raiseAmount = Math.floor(raiseAmount / table.smallBlind) * table.smallBlind
  }
  
  return Math.min(raiseAmount, player.chips)
}

function tightStrategy(player: Player, table: TableState, handStrength: number): PlayerAction {
  if (handStrength < 0.3) {
    return { type: 'fold', amount: 0 }
  }
  
  if (handStrength < 0.6 || table.raiseCount > 2) {
    return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
  }
  
  const raiseAmount = calculateRaiseAmount(player, table, 1.5)
  return { type: 'raise', amount: raiseAmount }
}

function looseStrategy(player: Player, table: TableState, handStrength: number): PlayerAction {
  if (handStrength < 0.2 && Math.random() < 0.3) {
    return { type: 'fold', amount: 0 }
  }
  
  if (handStrength < 0.5 || Math.random() < 0.4 || table.raiseCount > 3 ) {
    return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
  }
  
  const raiseAmount = calculateRaiseAmount(player, table, 2)
  return { type: 'raise', amount: raiseAmount }
}

function aggressiveStrategy(player: Player, table: TableState, handStrength: number): PlayerAction {
  if (handStrength < 0.2 && Math.random() < 0.1) {
    return { type: 'fold', amount: 0 }
  }
  
  if (handStrength < 0.4 && Math.random() < 0.3 || table.raiseCount > 4) {
    return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
  }
  
  const raiseAmount = calculateRaiseAmount(player, table, 3)
  return { type: 'raise', amount: raiseAmount }
}

function conservativeStrategy(player: Player, table: TableState, handStrength: number): PlayerAction {
  if (handStrength < 0.4) {
    return { type: 'fold', amount: 0 }
  }
  
  if (handStrength < 0.8 || table.currentBet > player.chips * 0.3 || table.raiseCount > 1) {
    return { type: 'checkCall', amount: Math.min(table.currentBet, player.chips) }
  }
  
  const raiseAmount = calculateRaiseAmount(player, table, 1.2)
  return { type: 'raise', amount: raiseAmount }
}