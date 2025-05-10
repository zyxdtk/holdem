import { Card, EvaluatedHand, Rank } from './types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export function getHandName(handType: number): string {
  const handNames = [
    '高牌', '一对', '两对', '三条', '顺子', 
    '同花', '葫芦', '四条', '同花顺', '皇家同花顺'
  ];
  return handNames[handType - 1] || '未知牌型';
}

// 获取所有指定张牌的组合
function getCombinations(cards: Card[], k: number): Card[][] {
  const result: Card[][] = [];

  cards.sort((a, b) => b.rankValue - a.rankValue);

  function backtrack(start: number, current: Card[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    
    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}

export function evaluateHand(handCards: Card[], communityCards: Card[]): EvaluatedHand {
  const combinations = getCombinations([...handCards, ...communityCards], 5);
  let bestHand: Omit<EvaluatedHand, 'handName'> = { 
    handType: 0, 
    handRank: 0, 
    value: 0, 
    cards: [] 
  };
  
  combinations.forEach(combo => {
    const current = evaluateFiveCards(combo);
    if (current.handType > bestHand.handType || 
        (current.handType === bestHand.handType && current.value > bestHand.value)) {
      bestHand = current;
    }
  });
  
  return {
    ...bestHand,
    handName: getHandName(bestHand.handType)
  };
}

function evaluateFiveCards(cards: Card[]): Omit<EvaluatedHand, 'handName'> {
  const sorted = [...cards].sort((a, b) => b.rankValue - a.rankValue);
  const flush = isFlush(sorted);
  const straight = isStraight(sorted);
  const rankCounts = getRankCounts(sorted);
  
  // 皇家同花顺
  if (flush && straight && sorted[0].rankValue === 14) {
    return { handType: 10, handRank: 14, value: 914, cards: sorted };
  }
  
  // 同花顺
  if (flush && straight) {
    return { handType: 9, handRank: sorted[0].rankValue, value: 800 + sorted[0].rankValue, cards: sorted };
  }
  
  // 四条
  if (rankCounts[0].count === 4) {
    const value = 700 + rankCounts[0].rank * 10 + (rankCounts[1]?.rank || 0);
    return { handType: 8, handRank: rankCounts[0].rank, value, cards: sorted };
  }
  
  // 葫芦
  if (rankCounts[0].count === 3 && rankCounts[1].count === 2) {
    const value = 600 + rankCounts[0].rank * 10 + rankCounts[1].rank;
    return { handType: 7, handRank: rankCounts[0].rank, value, cards: sorted };
  }
  
  // 同花
  if (flush) {
    const value = 500 + sorted[0].rankValue * 0.01 + sorted[1].rankValue * 0.0001;
    return { handType: 6, handRank: sorted[0].rankValue, value, cards: sorted };
  }
  
  // 顺子
  if (straight) {
    // 处理A-5-4-3-2的特殊情况
    const highCard = (sorted[0].rankValue === 14 && sorted[1].rankValue === 5) ? 5 : sorted[0].rankValue;
    return { handType: 5, handRank: highCard, value: 400 + highCard, cards: sorted };
  }
  
  // 三条
  if (rankCounts[0].count === 3) {
    const value = 300 + rankCounts[0].rank * 10 + (rankCounts[1]?.rank || 0);
    return { handType: 4, handRank: rankCounts[0].rank, value, cards: sorted };
  }
  
  // 两对
  if (rankCounts[0].count === 2 && rankCounts[1].count === 2) {
    const value = 200 + rankCounts[0].rank * 10 + rankCounts[1].rank;
    return { handType: 3, handRank: rankCounts[0].rank, value, cards: sorted };
  }
  
  // 一对
  if (rankCounts[0].count === 2) {
    const value = 100 + rankCounts[0].rank * 10 + (rankCounts[1]?.rank || 0);
    return { handType: 2, handRank: rankCounts[0].rank, value, cards: sorted };
  }
  
  // 高牌
  return { handType: 1, handRank: sorted[0].rankValue, value: sorted[0].rankValue, cards: sorted };
}

// 检查是否为同花
function isFlush(cards: Card[]): boolean {
  if (cards.length < 5) return false;
  const firstSuit = cards[0].suit;
  return cards.every(card => card.suit === firstSuit);
}

// 检查是否为顺子
function isStraight(cards: Card[]): boolean {
  if (cards.length < 5) return false;
  
  // 特殊情况：A-5-4-3-2
  if (cards[0].rankValue === 14 && cards[1].rankValue === 5) {
    return cards[1].rankValue === 5 &&
           cards[2].rankValue === 4 &&
           cards[3].rankValue === 3 &&
           cards[4].rankValue === 2;
  }

  // 常规顺子检查
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].rankValue !== cards[i-1].rankValue - 1) {
      return false;
    }
  }
  return true;
}

// 统计牌值出现次数
function getRankCounts(cards: Card[]): Array<{rank: number, count: number}> {
  const counts: Record<number, number> = {};
  
  cards.forEach(card => {
    counts[card.rankValue] = (counts[card.rankValue] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([rank, count]) => ({
      rank: parseInt(rank),
      count
    }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);
}