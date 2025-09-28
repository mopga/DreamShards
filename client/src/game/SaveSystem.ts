export interface SaveData {
  player: any;
  inventory: any;
  currentPalace: string;
  currentRoom: string;
  gameState: string;
  timestamp: number;
  version: string;
}

export class SaveSystem {
  private static SAVE_KEY = 'shards_of_dreams_save';
  private static VERSION = '1.0.0';

  static saveGame(data: Partial<SaveData>): boolean {
    try {
      const saveData: SaveData = {
        player: data.player,
        inventory: data.inventory,
        currentPalace: data.currentPalace || '',
        currentRoom: data.currentRoom || '',
        gameState: data.gameState || 'exploration',
        timestamp: Date.now(),
        version: this.VERSION
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log('Game saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  static loadGame(): SaveData | null {
    try {
      const saveDataStr = localStorage.getItem(this.SAVE_KEY);
      if (!saveDataStr) {
        return null;
      }

      const saveData: SaveData = JSON.parse(saveDataStr);
      
      // Version check
      if (saveData.version !== this.VERSION) {
        console.warn('Save file version mismatch, attempting migration...');
        // Here you would handle save file migration if needed
      }

      console.log('Game loaded successfully');
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  static hasSaveData(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  static deleteSave(): boolean {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      console.log('Save data deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete save data:', error);
      return false;
    }
  }

  static exportSave(): string | null {
    try {
      const saveData = localStorage.getItem(this.SAVE_KEY);
      if (saveData) {
        return btoa(saveData); // Base64 encode for easy sharing
      }
      return null;
    } catch (error) {
      console.error('Failed to export save:', error);
      return null;
    }
  }

  static importSave(encodedSave: string): boolean {
    try {
      const saveData = atob(encodedSave); // Base64 decode
      const parsedData = JSON.parse(saveData);
      
      // Validate save data structure
      if (parsedData && typeof parsedData === 'object' && parsedData.version) {
        localStorage.setItem(this.SAVE_KEY, saveData);
        console.log('Save imported successfully');
        return true;
      } else {
        throw new Error('Invalid save data format');
      }
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
}
