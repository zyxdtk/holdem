// --- 常量定义 ---
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const RANK_VALUES = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "T": 10, "J": 11, "Q": 12, "K": 13, "A": 14 };
const HAND_RANKS = {
    HIGH_CARD: 0, ONE_PAIR: 1, TWO_PAIR: 2, THREE_OF_A_KIND: 3, STRAIGHT: 4,
    FLUSH: 5, FULL_HOUSE: 6, FOUR_OF_A_KIND: 7, STRAIGHT_FLUSH: 8, ROYAL_FLUSH: 9,
};
const HAND_RANK_NAMES = {
    [HAND_RANKS.HIGH_CARD]: "高牌", [HAND_RANKS.ONE_PAIR]: "一对", [HAND_RANKS.TWO_PAIR]: "两对",
    [HAND_RANKS.THREE_OF_A_KIND]: "三条", [HAND_RANKS.STRAIGHT]: "顺子", [HAND_RANKS.FLUSH]: "同花",
    [HAND_RANKS.FULL_HOUSE]: "葫芦", [HAND_RANKS.FOUR_OF_A_KIND]: "四条",
    [HAND_RANKS.STRAIGHT_FLUSH]: "同花顺", [HAND_RANKS.ROYAL_FLUSH]: "皇家同花顺",
};

// 游戏核心逻辑函数
// 创建一副牌
function createDeck() {
    let deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ suit, rank, value: RANK_VALUES[rank] });
        }
    }
    return deck;
}

// 洗牌
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// 发牌
function dealCard(deck) {
    return deck.pop();
}

// 计算胜率, 模拟多次游戏并计算胜率
function calculateWinProbability(playerCards, communityCards, iterations = 1000) {
    return 0;
    let wins = 0;

    const knownCards = [...playerCards, ...communityCards];
    for (let i = 0; i < iterations; i++) {
        // 创建临时牌堆并移除已知牌
        let tempDeck = [...SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })))];
        tempDeck = tempDeck.filter(card =>
            !knownCards.some(c => c.rank === card.rank && c.suit === card.suit)
        );

        // 随机发牌给AI并补全公共牌
        const aiCards = [tempDeck.pop(), tempDeck.pop()];
        const remainingCommunity = 5 - communityCards.length;
        const fullCommunity = [...communityCards, ...Array(remainingCommunity).fill(0).map(() => tempDeck.pop())];

        // 评估双方牌型
        const playerHand = evaluateHand([...playerCards, ...fullCommunity]);
        const aiHand = evaluateHand([...aiCards, ...fullCommunity]);

        if (playerHand.strength > aiHand.strength) {
            wins++;
        } else if (playerHand.strength === aiHand.strength) {
            // 牌型相同时比较具体牌值
            for (let j = 0; j < playerHand.kickers.length; j++) {
                if (playerHand.kickers[j] > aiHand.kickers[j]) {
                    wins++;
                    break;
                }
            }
        }
    }
    return (wins / iterations * 100).toFixed(1);
}

// 评估手牌
function evaluateHand(sevenCards) {
    let bestHand = {
        rank: HAND_RANKS.HIGH_CARD,
        values: [],
        actualCards: [],
        kickers: [], // 添加kickers属性
        strength: 0  // 添加strength属性
    };
    const combinations = getCombinations(sevenCards, 5);

    for (const fiveCards of combinations) {
        const currentHand = evaluateFiveCards(fiveCards);
        currentHand.strength = currentHand.rank; // 设置strength
        currentHand.kickers = currentHand.values; // 设置kickers

        if (currentHand.rank > bestHand.rank) {
            bestHand = currentHand;
        } else if (currentHand.rank === bestHand.rank) {
            for (let i = 0; i < currentHand.values.length; i++) {
                if (currentHand.values[i] > bestHand.values[i]) {
                    bestHand = currentHand;
                    break;
                }
                if (currentHand.values[i] < bestHand.values[i]) break;
            }
        }
    }
    return bestHand;
}

// 生成所有可能的5张牌组合
function getCombinations(arr, k) {
    if (k < 0 || k > arr.length) return [];
    if (k === 0) return [[]];
    if (k === arr.length) return [arr];
    const withoutFirst = getCombinations(arr.slice(1), k);
    const withFirst = getCombinations(arr.slice(1), k - 1).map(comb => [arr[0]].concat(comb));
    return withoutFirst.concat(withFirst);
}

// 评估5张牌的牌型
function evaluateFiveCards(cards) {
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    const values = sortedCards.map(c => c.value);
    const suits = sortedCards.map(c => c.suit);
    const isFlush = new Set(suits).size === 1;
    const rankCounts = values.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    let uniqueSortedValues = [...new Set(values)].sort((a, b) => b - a);
    let isStraight = false;
    let straightValues = [];

    if (uniqueSortedValues.length >= 5) {
        for (let i = 0; i <= uniqueSortedValues.length - 5; i++) {
            if (uniqueSortedValues[i] - uniqueSortedValues[i + 4] === 4) {
                isStraight = true;
                straightValues = uniqueSortedValues.slice(i, i + 5);
                break;
            }
        }
    }
    // Check for A-5 straight (wheel)
    if (!isStraight && uniqueSortedValues.includes(14) && uniqueSortedValues.includes(2) && uniqueSortedValues.includes(3) && uniqueSortedValues.includes(4) && uniqueSortedValues.includes(5)) {
        isStraight = true;
        straightValues = [5, 4, 3, 2, 14]; // Ace plays low for value comparison, but card itself is A

        // For value comparison, treat Ace as 1 in A-5 straight
        const tempValuesForA5 = values.map(v => v === 14 ? 1 : v).sort((a, b) => b - a);
        if (tempValuesForA5[0] === 5 && tempValuesForA5[1] === 4 && tempValuesForA5[2] === 3 && tempValuesForA5[3] === 2 && tempValuesForA5[4] === 1) {
            // This is the A-5 straight. For comparison, highest card is 5.
            // The actual cards are A,2,3,4,5.
        }
    }

    const getCardsByValues = (valsToGet, originalFive) => valsToGet.map(v => originalFive.find(c => c.value === v) || originalFive.find(c => v === 1 && c.value === 14));


    if (isStraight && isFlush) {
        const straightFlushCards = sortedCards.filter(c => straightValues.includes(c.value) || (straightValues.includes(14) && c.value === 14 && straightValues.includes(2))); // needs better A-5 logic for cards

        // For A-5 straight flush, the highest card is 5 for ranking purposes of the straight itself.
        const rankValueForStraight = (straightValues[0] === 14 && straightValues[4] === 2 && straightValues.includes(5)) ? 5 : straightValues[0];
        const rank = (rankValueForStraight === 14 && straightValues.includes(13)) ? HAND_RANKS.ROYAL_FLUSH : HAND_RANKS.STRAIGHT_FLUSH;
        return { rank, values: [rankValueForStraight], actualCards: sortedCards }; // Use all 5 sorted cards for display
    }
    if (counts[0] === 4) {
        const fourValue = parseInt(Object.keys(rankCounts).find(key => rankCounts[key] === 4));
        const kickerValue = parseInt(Object.keys(rankCounts).find(key => rankCounts[key] === 1));
        const fourCards = sortedCards.filter(c => c.value === fourValue);
        const kickerCard = sortedCards.find(c => c.value === kickerValue);
        return { rank: HAND_RANKS.FOUR_OF_A_KIND, values: [fourValue, kickerValue], actualCards: fourCards.concat(kickerCard) };
    }
    if (counts[0] === 3 && counts[1] === 2) {
        const threeValue = parseInt(Object.keys(rankCounts).find(key => rankCounts[key] === 3));
        const pairValue = parseInt(Object.keys(rankCounts).find(key => rankCounts[key] === 2));
        const threeActualCards = sortedCards.filter(c => c.value === threeValue);
        const pairActualCards = sortedCards.filter(c => c.value === pairValue);
        return { rank: HAND_RANKS.FULL_HOUSE, values: [threeValue, pairValue], actualCards: threeActualCards.concat(pairActualCards) };
    }
    if (isFlush) {
        return { rank: HAND_RANKS.FLUSH, values: values, actualCards: sortedCards };
    }
    if (isStraight) {
        const rankValueForStraight = (straightValues[0] === 14 && straightValues[4] === 2 && straightValues.includes(5)) ? 5 : straightValues[0];
        // Reconstruct the 5 straight cards from sortedCards based on straightValues
        let actualStraightCards = [];
        let tempStraightValues = [...straightValues];
        for (const card of sortedCards) {
            const indexInStraight = tempStraightValues.indexOf(card.value);
            if (indexInStraight !== -1) {
                actualStraightCards.push(card);
                tempStraightValues.splice(indexInStraight, 1);
            }
            if (actualStraightCards.length === 5) break;
        }
        // Special handling for A-5 straight cards (A,5,4,3,2)
        if (rankValueForStraight === 5 && straightValues.includes(14)) {
            actualStraightCards = [
                sortedCards.find(c => c.value === 14), // Ace
                ...sortedCards.filter(c => [2, 3, 4, 5].includes(c.value)).sort((a, b) => b.value - a.value)
            ].filter(Boolean).slice(0, 5);
            actualStraightCards.sort((a, b) => {
                let valA = a.value === 14 ? 1 : a.value;
                let valB = b.value === 14 ? 1 : b.value;
                if (rankValueForStraight === 5) { // A-5 straight, Ace is low
                    valA = a.value === 14 ? 1 : a.value; // Ace is 1
                    valB = b.value === 14 ? 1 : b.value; // Ace is 1
                    return valB - valA; // Sort 5,4,3,2,A(1)
                }
                return b.value - a.value;
            });
        }


        return { rank: HAND_RANKS.STRAIGHT, values: [rankValueForStraight], actualCards: actualStraightCards.slice(0, 5) };
    }
    if (counts[0] === 3) {
        const threeValue = parseInt(Object.keys(rankCounts).find(key => rankCounts[key] === 3));
        const kickers = values.filter(v => v !== threeValue).sort((a, b) => b - a);
        const threeActualCards = sortedCards.filter(c => c.value === threeValue);
        const kickerActualCards = sortedCards.filter(c => kickers.slice(0, 2).includes(c.value)).sort((a, b) => b.value - a.value);
        return { rank: HAND_RANKS.THREE_OF_A_KIND, values: [threeValue, kickers[0], kickers[1]], actualCards: threeActualCards.concat(kickerActualCards.slice(0, 2)) };
    }
    if (counts[0] === 2 && counts[1] === 2) {
        const pairValues = Object.keys(rankCounts).filter(key => rankCounts[key] === 2).map(Number).sort((a, b) => b - a);
        const kickerValue = values.find(v => v !== pairValues[0] && v !== pairValues[1]);
        const highPairCards = sortedCards.filter(c => c.value === pairValues[0]);
        const lowPairCards = sortedCards.filter(c => c.value === pairValues[1]);
        const kickerCard = sortedCards.find(c => c.value === kickerValue);
        return { rank: HAND_RANKS.TWO_PAIR, values: [pairValues[0], pairValues[1], kickerValue], actualCards: highPairCards.concat(lowPairCards).concat(kickerCard) };
    }
    if (counts[0] === 2) {
        const pairValue = parseInt(Object.keys(rankCounts).find(key => rankCounts[key] === 2));
        const kickers = values.filter(v => v !== pairValue).sort((a, b) => b - a);
        const pairActualCards = sortedCards.filter(c => c.value === pairValue);
        const kickerActualCards = sortedCards.filter(c => kickers.slice(0, 3).includes(c.value)).sort((a, b) => b.value - a.value);
        return { rank: HAND_RANKS.ONE_PAIR, values: [pairValue, kickers[0], kickers[1], kickers[2]], actualCards: pairActualCards.concat(kickerActualCards.slice(0, 3)) };
    }
    return { rank: HAND_RANKS.HIGH_CARD, values: values, actualCards: sortedCards };
}

// 原有的 module.exports 替换为 export
export {
    createDeck,
    shuffleDeck,
    dealCard,
    calculateWinProbability,
    evaluateHand,
    SUITS,
    RANKS,
    RANK_VALUES,
    HAND_RANKS,
    HAND_RANK_NAMES
};