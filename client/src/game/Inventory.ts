export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'consumable' | 'key' | 'equipment';
  quantity: number;
  effect?: {
    hp?: number;
    mp?: number;
    buff?: string;
  };
}

export interface KeyItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export class Inventory {
  public dreamShards: number = 0;
  public items: Item[] = [];
  public keyItems: KeyItem[] = [];

  addDreamShards(amount: number) {
    this.dreamShards += amount;
  }

  addItem(itemData: Partial<Item>) {
    const existingItem = this.items.find(item => item.id === itemData.id);
    
    if (existingItem) {
      existingItem.quantity += itemData.quantity || 1;
    } else {
      this.items.push({
        id: itemData.id || '',
        name: itemData.name || '',
        description: itemData.description || '',
        icon: itemData.icon || '📦',
        type: itemData.type || 'consumable',
        quantity: itemData.quantity || 1,
        effect: itemData.effect
      });
    }
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.find(item => item.id === itemId);
    if (!item || item.quantity < quantity) {
      return false;
    }

    item.quantity -= quantity;
    if (item.quantity <= 0) {
      this.items = this.items.filter(item => item.id !== itemId);
    }

    return true;
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.find(item => item.id === itemId);
    return item ? item.quantity >= quantity : false;
  }

  addKeyItem(keyItem: KeyItem) {
    if (!this.keyItems.find(item => item.id === keyItem.id)) {
      this.keyItems.push(keyItem);
    }
  }

  hasKeyItem(keyItemId: string): boolean {
    return this.keyItems.some(item => item.id === keyItemId);
  }

  useItem(itemId: string, target?: any): boolean {
    const item = this.items.find(item => item.id === itemId);
    if (!item || item.type !== 'consumable') {
      return false;
    }

    // Apply item effect
    if (item.effect && target) {
      if (item.effect.hp) {
        target.heal(item.effect.hp);
      }
      if (item.effect.mp) {
        target.restoreMp(item.effect.mp);
      }
    }

    // Remove one instance of the item
    this.removeItem(itemId, 1);
    return true;
  }

  getItemCount(itemId: string): number {
    const item = this.items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  }
}
