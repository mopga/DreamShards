import React from 'react';
import { useGame } from '../../contexts/GameContext';

export default function InventoryUI() {
  const { inventory, setGameState } = useGame();

  const handleClose = () => {
    setGameState('exploration');
  };

  const useItem = (itemId: string) => {
    console.log(`Using item: ${itemId}`);
    // Implement item usage logic
  };

  return (
    <div className="inventory-overlay">
      <div className="inventory-panel">
        <div className="inventory-header">
          <h2>Dream Inventory</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="inventory-content">
          {/* Dream Shards Section */}
          <div className="inventory-section">
            <h3>Dream Shards</h3>
            <div className="dream-shards-display">
              <div className="shard-item">
                <span className="shard-icon">💎</span>
                <span className="shard-count">{inventory.dreamShards}</span>
                <span className="shard-label">Fragments of consciousness</span>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="inventory-section">
            <h3>Items</h3>
            <div className="items-grid">
              {inventory.items.length === 0 ? (
                <div className="empty-inventory">
                  <p>No items collected yet...</p>
                  <p>Explore the dream palaces to find mysterious artifacts</p>
                </div>
              ) : (
                inventory.items.map((item, index) => (
                  <div key={index} className="inventory-item">
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-description">{item.description}</div>
                      <div className="item-quantity">×{item.quantity}</div>
                    </div>
                    <button 
                      className="use-item-button"
                      onClick={() => useItem(item.id)}
                    >
                      Use
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Key Items Section */}
          <div className="inventory-section">
            <h3>Symbolic Keys</h3>
            <div className="key-items-list">
              {inventory.keyItems.length === 0 ? (
                <div className="empty-section">
                  <p>No symbolic keys found yet...</p>
                </div>
              ) : (
                inventory.keyItems.map((item, index) => (
                  <div key={index} className="key-item">
                    <div className="key-item-icon">{item.icon}</div>
                    <div className="key-item-info">
                      <div className="key-item-name">{item.name}</div>
                      <div className="key-item-description">{item.description}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
