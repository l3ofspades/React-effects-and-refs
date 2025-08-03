import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [deckId, setDeckId] = useState(null);
  const [cards, setCards] = useState([]);
  const [remaining, setRemaining] = useState(52);
  const [loading, setLoading] = useState(false);
  const drawBtnRef = useRef(null);

  // get a new shuffled deck of cards of first load
  useEffect(() => {
    async function fetchDeck() {
      try {
        const res = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        setDeckId(res.data.deck_id);
        setRemaining(res.data.remaining);
      } catch (error) {
        console.error('Error fetching deck:', error);
      }
    }
    fetchDeck();
  }, []);

  //Autofocus the draw button once deck is ready
  useEffect(() => {
    if (deckId && drawBtnRef.current) {
      drawBtnRef.current.focus();
    }
  }, [deckId]);

  // Draw a card from the deck
  async function drawCard() {
    if (!deckId || remaining === 0) return;
    try {
      const res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
      if (res.data.success) {
        const card = res.data.cards[0];
        setCards(prev => [...prev, card]);
        setRemaining(res.data.remaining);
        if (res.data.remaining === 0) {
          alert('no more cards left in the deck');
        }
      }
    } catch (err) {
      console.error('failed to draw card:', err);
    }
  }

  // reshuffle current deck
  async function reshuffleDeck() {
    if (!deckId) return;
    try {
      await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
      setCards([]);
      setRemaining(52);
    } catch (error) {
      console.error('Error reshuffling deck:', err);
    } finally {
      setLoading(false);  
    }
  }

  return (
    <div className="container">
      <h1>Deck of Cards</h1>
      <div className="controls">
        <button button 
          ref={drawBtnRef}
          onClick={drawCard}
          disabled={!deckId || remaining === 0}
          >
            Draw Card
            </button>
          <button 
            onClick={reshuffleDeck}
            disabled={!deckId || loading}
            >
              {loading ? 'Reshuffling...' : 'Reshuffle Deck'}
              </button>
              <p>Cards Remaining</p>
      </div>
      <div className="cards">
        {cards.map(card => (
          <img key={card.code} src={card.image} alt={`${card.value} of ${card.suit}`} />

        ))} 
      </div>
      </div>
  );
}

// Export the App component

export default App;
