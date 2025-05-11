import { Card, EvaluatedHand, Rank } from './types';

const RANK_VALUES: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const BASE_VALUES: number[] = Array.from({ length: 10 }, (_, i) => Math.pow(16, i));

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
    const rank = calculateHandRank(rankCounts);

    // 皇家同花顺
    if (flush && straight && sorted[0].rankValue === 14) {
        return { handType: 10, handRank: 14, value: BASE_VALUES[9] + 14, cards: sorted };
    }

    // 同花顺
    if (flush && straight) {
        return { handType: 9, handRank: sorted[0].rankValue, value: BASE_VALUES[8] + sorted[0].rankValue, cards: sorted };
    }

    // 四条
    if (rankCounts[0].count === 4) {
        return { handType: 8, handRank: rank, value: BASE_VALUES[7] + rank, cards: sorted };
    }

    // 葫芦
    if (rankCounts[0].count === 3 && rankCounts[1].count === 2) {
        return { handType: 7, handRank: rank, value: BASE_VALUES[6] + rank, cards: sorted };
    }

    // 同花
    if (flush) {
        const value = 500 + sorted[0].rankValue * 0.01 + sorted[1].rankValue * 0.0001;
        return { handType: 6, handRank: rank, value: BASE_VALUES[5] + rank, cards: sorted };
    }

    // 顺子
    if (straight) {
        // 处理A-5-4-3-2的特殊情况
        const highCard = (sorted[0].rankValue === 14 && sorted[1].rankValue === 5) ? 5 : sorted[0].rankValue;
        return { handType: 5, handRank: highCard, value: BASE_VALUES[4] + highCard, cards: sorted };
    }

    // 三条
    if (rankCounts[0].count === 3) {
        return { handType: 4, handRank: rank, value: BASE_VALUES[3] + rank, cards: sorted };
    }

    // 两对
    if (rankCounts[0].count === 2 && rankCounts[1].count === 2) {
        return { handType: 3, handRank: rank, value: BASE_VALUES[2] + rank, cards: sorted };
    }

    // 一对
    if (rankCounts[0].count === 2) {
        return { handType: 2, handRank: rank, value: BASE_VALUES[1] + rank, cards: sorted };
    }

    // 高牌
    return { handType: 1, handRank: rank, value: BASE_VALUES[0] + rank, cards: sorted };
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
        if (cards[i].rankValue !== cards[i - 1].rankValue - 1) {
            return false;
        }
    }
    return true;
}

// 统计牌值出现次数
function getRankCounts(cards: Card[]): Array<{ rank: number, count: number }> {
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

// 计算牌值的加权和
function calculateHandRank(rankCounts): number {
    return rankCounts.reduce((sum, c) => sum * 16 + c.rank, 0);
}