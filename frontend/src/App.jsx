import { useMemo, useState } from 'react';

const SUITS = ['♠', '♣', '♥', '♦'];
const RANKS = [
  { rank: 'A', value: 11 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 10 },
  { rank: 'Q', value: 10 },
  { rank: 'K', value: 10 },
];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rankInfo of RANKS) {
      deck.push({
        id: `${suit}-${rankInfo.rank}-${Math.random().toString(16).slice(2)}`,
        suit,
        rank: rankInfo.rank,
        value: rankInfo.value,
      });
    }
  }

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

function calculateHandValue(cards) {
  let total = 0;
  let aceCount = 0;

  for (const card of cards) {
    total += card.value;
    if (card.rank === 'A') {
      aceCount += 1;
    }
  }

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }

  return total;
}

function drawCard(deck) {
  const copy = [...deck];
  const card = copy.pop();
  return { card, deck: copy };
}

function createInitialState() {
  let deck = createDeck();

  const p1 = drawCard(deck);
  deck = p1.deck;
  const d1 = drawCard(deck);
  deck = d1.deck;
  const p2 = drawCard(deck);
  deck = p2.deck;
  const d2 = drawCard(deck);
  deck = d2.deck;

  return {
    deck,
    playerCards: [p1.card, p2.card],
    dealerCards: [d1.card, d2.card],
    phase: 'player',
    message: 'Choose Hit or Stand',
  };
}

function withNaturalBlackjackResult(state) {
  const playerValue = calculateHandValue(state.playerCards);
  const dealerValue = calculateHandValue(state.dealerCards);

  if (playerValue === 21 && dealerValue === 21) {
    return { ...state, phase: 'end', message: 'Both have blackjack! 🫥' };
  }
  if (playerValue === 21) {
    return { ...state, phase: 'end', message: 'Blackjack! You win! 😎' };
  }
  if (dealerValue === 21) {
    return { ...state, phase: 'end', message: 'Dealer has blackjack! 🤡' };
  }

  return state;
}

function dealerTurn(state) {
  let { deck, dealerCards } = state;
  while (calculateHandValue(dealerCards) < 17) {
    const result = drawCard(deck);
    deck = result.deck;
    dealerCards = [...dealerCards, result.card];
  }

  const playerValue = calculateHandValue(state.playerCards);
  const dealerValue = calculateHandValue(dealerCards);

  if (dealerValue > 21 || playerValue > dealerValue) {
    return { ...state, deck, dealerCards, phase: 'end', message: 'You win! 😎' };
  }
  if (playerValue === dealerValue) {
    return { ...state, deck, dealerCards, phase: 'end', message: 'Push (tie)! 🫥' };
  }
  return { ...state, deck, dealerCards, phase: 'end', message: 'Dealer wins! 🤡' };
}

function Card({ card, hidden = false }) {
  return (
    <div className={`card ${hidden ? 'hidden' : ''}`}>
      {hidden ? '?' : `${card.rank}${card.suit}`}
    </div>
  );
}

function App() {
  const [game, setGame] = useState(() => withNaturalBlackjackResult(createInitialState()));

  const playerValue = useMemo(() => calculateHandValue(game.playerCards), [game.playerCards]);
  const dealerValue = useMemo(() => calculateHandValue(game.dealerCards), [game.dealerCards]);

  const dealerHasBlackjack = game.dealerCards.length === 2 && dealerValue === 21;
  const playerHasBlackjack = game.playerCards.length === 2 && playerValue === 21;

  const revealDealer = game.phase === 'end' || dealerHasBlackjack || playerHasBlackjack;

  const startNewGame = () => {
    setGame(withNaturalBlackjackResult(createInitialState()));
  };

  const hit = () => {
    if (game.phase !== 'player') return;

    const result = drawCard(game.deck);
    const updatedPlayerCards = [...game.playerCards, result.card];
    const value = calculateHandValue(updatedPlayerCards);

    if (value > 21) {
      setGame({
        ...game,
        deck: result.deck,
        playerCards: updatedPlayerCards,
        phase: 'end',
        message: 'You busted. Dealer wins! 🤡',
      });
      return;
    }

    setGame({
      ...game,
      deck: result.deck,
      playerCards: updatedPlayerCards,
      message: 'Choose Hit or Stand',
    });
  };

  const stand = () => {
    if (game.phase !== 'player') return;
    setGame((current) => dealerTurn({ ...current, phase: 'dealer', message: 'Dealer turn...' }));
  };

  return (
    <main className="table">
      <h1>Blackjack</h1>
      <p className="status">{game.message}</p>

      <section className="hand">
        <h2>Dealer {revealDealer ? `(${dealerValue})` : ''}</h2>
        <div className="cards">
          {game.dealerCards.map((card, index) => (
            <Card key={card.id} card={card} hidden={!revealDealer && index === 0} />
          ))}
        </div>
      </section>

      <section className="hand">
        <h2>Player ({playerValue})</h2>
        <div className="cards">
          {game.playerCards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="actions">
        <button type="button" onClick={hit} disabled={game.phase !== 'player'}>
          Hit
        </button>
        <button type="button" onClick={stand} disabled={game.phase !== 'player'}>
          Stand
        </button>
        <button type="button" onClick={startNewGame}>
          New Round
        </button>
      </section>
    </main>
  );
}

export default App;
