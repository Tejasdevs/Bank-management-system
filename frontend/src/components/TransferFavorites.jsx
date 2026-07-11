import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaHistory } from 'react-icons/fa';
import '../styles/transferFavorites.css';

export default function TransferFavorites({ onSelectFavorite, recentTransactions = [] }) {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('transferFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('transferFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (transaction) => {
    // Check if already in favorites
    const exists = favorites.some(
      fav => fav.accountNumber === transaction.accountNumber
    );
    
    if (!exists) {
      setFavorites([...favorites, {
        id: Date.now(),
        name: transaction.beneficiaryName || 'Unknown',
        accountNumber: transaction.accountNumber,
        bank: transaction.bank || 'This Bank',
        date: new Date().toISOString()
      }]);
    }
  };

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const handleFavoriteClick = (favorite) => {
    onSelectFavorite(favorite);
  };

  // Get unique recent transactions (by account number)
  const uniqueRecent = recentTransactions
    .filter((txn, index, self) => 
      index === self.findIndex(t => t.accountNumber === txn.accountNumber)
    )
    .slice(0, 5); // Show only 5 most recent unique transactions

  return (
    <div className="transfer-favorites">
      <h3>Quick Transfer</h3>
      
      <div className="favorites-section">
        <h4><FaStar className="icon" /> Favorites</h4>
        {favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map(fav => (
              <div key={fav.id} className="favorite-item">
                <div className="favorite-info" onClick={() => handleFavoriteClick(fav)}>
                  <div className="favorite-name">{fav.name}</div>
                  <div className="favorite-details">
                    {fav.bank} ••••{fav.accountNumber.slice(-4)}
                  </div>
                </div>
                <button 
                  className="remove-favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(fav.id);
                  }}
                  title="Remove from favorites"
                >
                  <FaRegStar />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-favorites">No favorites saved yet. Add a favorite from recent transfers.</p>
        )}
      </div>

      {recentTransactions.length > 0 && (
        <div className="recent-section">
          <h4><FaHistory className="icon" /> Recent Transfers</h4>
          <div className="recent-list">
            {uniqueRecent.map((txn, index) => {
              const isFavorited = favorites.some(
                fav => fav.accountNumber === txn.accountNumber
              );
              
              return (
                <div key={index} className="recent-item">
                  <div className="recent-info">
                    <div className="recent-name">
                      {txn.beneficiaryName || 'Unknown'}
                    </div>
                    <div className="recent-details">
                      ••••{txn.accountNumber?.slice(-4) || '0000'}
                    </div>
                  </div>
                  {!isFavorited ? (
                    <button 
                      className="add-favorite"
                      onClick={() => addToFavorites(txn)}
                      title="Add to favorites"
                    >
                      <FaRegStar />
                    </button>
                  ) : (
                    <span className="favorited" title="In favorites">
                      <FaStar />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
