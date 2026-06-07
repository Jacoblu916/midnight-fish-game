const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const catNames = ["橘", "狸", "黑", "白", "花", "暹"];
const initialFish = 9;
const dealerFish = [5, 6, 7, 8, 9, 10, 11, 12, 13];
const dealers = [
  { breed: "橘猫", name: "胖橘", title: "第一位庄家", avatar: "dealer-1", image: "./assets/avatars/pangju.png", quip: "胖橘把筹码拨成一座小山。" },
  { breed: "布偶猫", name: "奶油", title: "软爪牌手", avatar: "dealer-2", image: "./assets/avatars/naiyou.png", quip: "奶油慢慢眨眼，像是在等你犯错。" },
  { breed: "英短", name: "公爵", title: "冷静贵族", avatar: "dealer-3", image: "./assets/avatars/gongjue.png", quip: "公爵端坐不动，只有尾巴轻轻敲桌。" },
  { breed: "阿比西尼亚猫", name: "闪电", title: "快手庄家", avatar: "dealer-4", image: "./assets/avatars/shandian.png", quip: "闪电洗牌快得只剩残影。" },
  { breed: "暹罗猫", name: "咖啡", title: "低语赌客", avatar: "dealer-5", image: "./assets/avatars/kafei.png", quip: "咖啡贴近牌桌，小声数着你的鱼干。" },
  { breed: "俄罗斯蓝猫", name: "布鲁", title: "银蓝守门人", avatar: "dealer-6", image: "./assets/avatars/bulu.png", quip: "布鲁的表情像一块冷静的月光。" },
  { breed: "黑猫", name: "大黑", title: "午夜牌手", avatar: "dealer-7", image: "./assets/avatars/dahei.png", quip: "大黑把暗牌压得很稳。" },
  { breed: "缅因猫", name: "大胡子", title: "长毛强敌", avatar: "dealer-8", image: "./assets/avatars/dahuzi.png", quip: "大胡子占了半张桌子，气势很足。" },
  { breed: "狸花猫", name: "万万", title: "大 boss，至今没有猫赢过它", avatar: "dealer-9", image: "./assets/avatars/wanwan.png", quip: "万万不说话，只把最后一摞鱼干推到灯下。" },
];

const state = {
  deck: [],
  dealer: [],
  player: [],
  bank: initialFish,
  dealerBank: initialFish,
  dealerIndex: 0,
  bet: 1,
  roundBet: 0,
  streak: 0,
  bestBank: initialFish,
  inRound: false,
  dealerHidden: true,
  campaignWon: false,
  hasActed: false,
  surrenderUsed: false,
  message: "选择下注，然后开始一局。",
};

const els = {
  bank: document.querySelector("#bank"),
  dealerBank: document.querySelector("#dealerBank"),
  progress: document.querySelector("#progress"),
  currentBet: document.querySelector("#currentBet"),
  streak: document.querySelector("#streak"),
  bestBank: document.querySelector("#bestBank"),
  dealerTrack: document.querySelector("#dealerTrack"),
  dealerAvatar: document.querySelector("#dealerAvatar"),
  dealerBreed: document.querySelector("#dealerBreed"),
  dealerName: document.querySelector("#dealerName"),
  dealerTag: document.querySelector("#dealerTag"),
  dealerHandTitle: document.querySelector("#dealerHandTitle"),
  dealerScore: document.querySelector("#dealerScore"),
  playerScore: document.querySelector("#playerScore"),
  dealerHand: document.querySelector("#dealerHand"),
  playerHand: document.querySelector("#playerHand"),
  message: document.querySelector("#message"),
  dealButton: document.querySelector("#dealButton"),
  hitButton: document.querySelector("#hitButton"),
  standButton: document.querySelector("#standButton"),
  doubleButton: document.querySelector("#doubleButton"),
  surrenderButton: document.querySelector("#surrenderButton"),
  restartButton: document.querySelector("#restartButton"),
  splashScreen: document.querySelector("#splashScreen"),
  startGameButton: document.querySelector("#startGameButton"),
  chips: [...document.querySelectorAll(".chip")],
};

function buildDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, cat: catNames[Math.floor(Math.random() * catNames.length)] });
    }
  }
  return shuffle(deck);
}

function shuffle(cards) {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(rank) {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
}

function scoreHand(hand) {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    total += cardValue(card.rank);
    if (card.rank === "A") aces += 1;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function isBlackjack(hand) {
  return hand.length === 2 && scoreHand(hand) === 21;
}

function drawCard() {
  if (state.deck.length < 12) state.deck = buildDeck();
  return state.deck.pop();
}

function setMessage(text) {
  state.message = text;
  els.message.textContent = text;
}

function currentDealer() {
  return dealers[state.dealerIndex];
}

function dealerLabel(dealer = currentDealer()) {
  return `${dealer.breed} ${dealer.name}`;
}

function currentDealerFish() {
  return dealerFish[state.dealerIndex] ?? initialFish;
}

function canDouble() {
  const doubledBet = state.roundBet * 2;
  return state.inRound && !state.hasActed && state.player.length === 2 && state.bank >= doubledBet && state.dealerBank >= doubledBet;
}

function canSurrender() {
  return state.inRound && !state.hasActed && !state.surrenderUsed && state.player.length === 2;
}

function renderDealerAvatar(dealer) {
  els.dealerAvatar.className = `cat-avatar ${dealer.avatar}${dealer.image ? " has-image" : ""}`;
  els.dealerAvatar.innerHTML = dealer.image ? `<img src="${dealer.image}" alt="${dealerLabel(dealer)}头像" />` : "<span></span>";
}

function maxAllowedBet() {
  return Math.min(3, state.bank, state.dealerBank);
}

function normalizeBet() {
  const maxBet = maxAllowedBet();
  if (maxBet <= 0) return;
  if (state.bet > maxBet) state.bet = maxBet;
  if (state.bet < 1) state.bet = 1;
}

function renderCard(card, hidden = false) {
  const div = document.createElement("div");
  div.className = hidden ? "card back" : `card ${card.suit === "♥" || card.suit === "♦" ? "red" : "black"}`;
  if (hidden) {
    div.setAttribute("aria-label", "暗牌");
    return div;
  }

  div.innerHTML = `
    <div class="card-corner">${card.rank}${card.suit}</div>
    <div class="card-suit">${card.suit}</div>
    <div class="card-cat">${card.cat}猫牌</div>
  `;
  div.setAttribute("aria-label", `${card.rank}${card.suit}`);
  return div;
}

function render() {
  normalizeBet();
  const dealer = currentDealer();
  els.bank.textContent = state.bank;
  els.dealerBank.textContent = state.dealerBank;
  els.progress.textContent = `${state.dealerIndex + 1}/${dealers.length}`;
  els.currentBet.textContent = state.inRound ? state.roundBet : state.bet;
  els.streak.textContent = state.streak;
  els.bestBank.textContent = state.bestBank;
  els.dealerBreed.textContent = dealer.breed;
  els.dealerName.textContent = dealer.name;
  els.dealerTag.textContent = dealer.title;
  els.dealerHandTitle.textContent = dealerLabel(dealer);
  renderDealerAvatar(dealer);
  els.playerScore.textContent = scoreHand(state.player);

  if (state.dealer.length === 0) {
    els.dealerScore.textContent = "?";
  } else if (state.dealerHidden) {
    els.dealerScore.textContent = scoreHand([state.dealer[0]]);
  } else {
    els.dealerScore.textContent = scoreHand(state.dealer);
  }

  els.playerHand.innerHTML = "";
  els.dealerHand.innerHTML = "";
  state.player.forEach((card) => els.playerHand.appendChild(renderCard(card)));
  state.dealer.forEach((card, index) => els.dealerHand.appendChild(renderCard(card, state.dealerHidden && index === 1)));

  els.dealerTrack.innerHTML = "";
  dealers.forEach((trackDealer, index) => {
    const item = document.createElement("li");
    item.className = index < state.dealerIndex ? "cleared" : index === state.dealerIndex ? "current" : "locked";
    item.title = `${trackDealer.breed} ${trackDealer.name} - ${trackDealer.title}`;
    item.innerHTML = `
      <span class="track-avatar cat-avatar ${trackDealer.avatar}${trackDealer.image ? " has-image" : ""}">
        ${trackDealer.image ? `<img src="${trackDealer.image}" alt="${dealerLabel(trackDealer)}头像" />` : "<span></span>"}
      </span>
      <span class="track-name">${trackDealer.name}</span>
    `;
    els.dealerTrack.appendChild(item);
  });

  els.dealButton.disabled = state.inRound || state.campaignWon || state.bank < state.bet || state.dealerBank < state.bet;
  els.hitButton.disabled = !state.inRound;
  els.standButton.disabled = !state.inRound;
  els.doubleButton.disabled = !canDouble();
  els.surrenderButton.disabled = !canSurrender();
  els.chips.forEach((chip) => {
    const bet = Number(chip.dataset.bet);
    chip.classList.toggle("selected", bet === state.bet);
    chip.disabled = state.inRound || state.campaignWon || bet > state.bank || bet > state.dealerBank;
  });
}

function startRound() {
  normalizeBet();
  if (state.inRound || state.campaignWon || state.bank < state.bet || state.dealerBank < state.bet) return;

  state.deck = state.deck.length ? state.deck : buildDeck();
  state.dealer = [drawCard(), drawCard()];
  state.player = [drawCard(), drawCard()];
  state.inRound = true;
  state.dealerHidden = true;
  state.hasActed = false;
  state.roundBet = state.bet;
  setMessage(`向 ${dealerLabel()} 下注 ${state.roundBet} 块鱼干。${currentDealer().quip}`);
  render();

  window.setTimeout(() => {
    const playerBlackjack = isBlackjack(state.player);
    const dealerBlackjack = isBlackjack(state.dealer);
    if (playerBlackjack || dealerBlackjack) {
      state.dealerHidden = false;
      if (playerBlackjack && dealerBlackjack) settle("push", "双方都是 21 点，猫猫眯眼表示平局。");
      else if (playerBlackjack) settle("blackjack", "黑杰克！你的小猫叼走一大把鱼干。");
      else settle("lose", "庄家猫开局 21 点，这把被它优雅拿下。");
    } else {
      setMessage("轮到你。要牌接近 21 点，或停牌交给庄家猫表演。");
    }
    render();
  }, 350);
}

function hit() {
  if (!state.inRound) return;
  state.hasActed = true;
  state.player.push(drawCard());
  const score = scoreHand(state.player);
  if (score > 21) {
    state.dealerHidden = false;
    settle("lose", `你的小猫爆牌了：${score} 点。鱼干滑走。`);
  } else if (score === 21) {
    setMessage("正好 21 点。现在让庄家猫补牌。");
    render();
    window.setTimeout(stand, 450);
    return;
  } else {
    setMessage(`现在是 ${score} 点。还要再摸一张吗？`);
  }
  render();
}

function stand() {
  if (!state.inRound) return;
  state.hasActed = true;
  state.dealerHidden = false;
  setMessage("庄家猫翻开暗牌。它会补到至少 17 点。");
  render();
  dealerPlay();
}

function doubleDown() {
  if (!canDouble()) return;
  state.roundBet *= 2;
  state.hasActed = true;
  state.player.push(drawCard());
  const score = scoreHand(state.player);
  if (score > 21) {
    state.dealerHidden = false;
    settle("lose", `双倍后摸到 ${score} 点，爆牌了。`);
    render();
    return;
  }
  setMessage(`双倍下注到 ${state.roundBet} 块鱼干，摸到 ${score} 点后自动停牌。`);
  render();
  window.setTimeout(stand, 600);
}

function surrender() {
  if (!canSurrender()) return;
  state.hasActed = true;
  state.surrenderUsed = true;
  state.dealerHidden = false;
  settle("surrender", `你保守收爪，向 ${dealerLabel()} 投降。本轮 boss 战不会损失鱼干。`);
  render();
}

function dealerPlay() {
  const dealerScore = scoreHand(state.dealer);
  if (dealerScore < 17) {
    window.setTimeout(() => {
      state.dealer.push(drawCard());
      setMessage("庄家猫又拍来一张牌。");
      render();
      dealerPlay();
    }, 650);
    return;
  }

  window.setTimeout(() => finishDealerRound(), 450);
}

function finishDealerRound() {
  const playerScore = scoreHand(state.player);
  const dealerScore = scoreHand(state.dealer);

  if (dealerScore > 21) {
    settle("win", `庄家猫 ${dealerScore} 点爆牌。你赢了！`);
  } else if (playerScore > dealerScore) {
    settle("win", `${playerScore} 点压过 ${dealerScore} 点。猫爪击掌！`);
  } else if (playerScore < dealerScore) {
    settle("lose", `${dealerScore} 点压过 ${playerScore} 点。庄家猫收走鱼干。`);
  } else {
    settle("push", `${playerScore} 点平局。鱼干退回。`);
  }
  render();
}

function settle(result, text) {
  state.inRound = false;
  state.dealerHidden = false;
  const wager = state.roundBet || state.bet;
  let transfer = 0;

  if (result === "blackjack") transfer = Math.min(state.dealerBank, Math.ceil(wager * 1.5));
  if (result === "win") transfer = Math.min(state.dealerBank, wager);
  if (result === "lose") transfer = Math.min(state.bank, wager);

  if (result === "blackjack" || result === "win") {
    state.bank += transfer;
    state.dealerBank -= transfer;
    state.streak += 1;
  }

  if (result === "lose") {
    state.bank -= transfer;
    state.dealerBank += transfer;
    state.streak = 0;
  }

  if (result === "surrender") state.streak = 0;
  if (result === "push") state.streak = 0;

  state.bestBank = Math.max(state.bestBank, state.bank);
  state.hasActed = false;
  state.roundBet = 0;

  if (state.dealerBank <= 0) {
    advanceDealer(text);
  } else if (state.bank <= 0) {
    setMessage(`${text} 你的鱼干用完了，按重置重新挑战。`);
  } else {
    setMessage(`${text} ${dealerLabel()} 还剩 ${state.dealerBank} 块鱼干。`);
  }
}

function advanceDealer(text) {
  const defeated = dealerLabel();
  state.dealer = [];
  state.player = [];
  state.dealerHidden = true;
  state.hasActed = false;
  state.surrenderUsed = false;

  if (state.dealerIndex >= dealers.length - 1) {
    state.campaignWon = true;
    setMessage(`${text} 你战胜了 ${defeated}，${dealers.length} 位庄家全部落败！连万万也低头了。`);
    return;
  }

  state.dealerIndex += 1;
  state.dealerBank = currentDealerFish();
  normalizeBet();
  setMessage(`${text} ${defeated} 的鱼干清零。下一位：${dealerLabel()}。`);
}

function resetGame() {
  state.deck = buildDeck();
  state.dealer = [];
  state.player = [];
  state.bank = initialFish;
  state.dealerIndex = 0;
  state.dealerBank = currentDealerFish();
  state.bet = 1;
  state.roundBet = 0;
  state.streak = 0;
  state.bestBank = initialFish;
  state.inRound = false;
  state.dealerHidden = true;
  state.campaignWon = false;
  state.hasActed = false;
  state.surrenderUsed = false;
  setMessage(`选择下注，挑战第 1 位庄家：${dealerLabel()}。`);
  render();
}

els.dealButton.addEventListener("click", startRound);
els.hitButton.addEventListener("click", hit);
els.standButton.addEventListener("click", stand);
els.doubleButton.addEventListener("click", doubleDown);
els.surrenderButton.addEventListener("click", surrender);
els.restartButton.addEventListener("click", resetGame);
els.startGameButton.addEventListener("click", () => {
  els.splashScreen.classList.add("hidden");
});
els.chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const bet = Number(chip.dataset.bet);
    if (state.inRound || state.campaignWon || bet > state.bank || bet > state.dealerBank) return;
    state.bet = bet;
    setMessage(`本局下注改为 ${bet} 块鱼干。`);
    render();
  });
});

resetGame();
