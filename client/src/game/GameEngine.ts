import { Palace } from './Palace';
import { Player } from './Player';
import { Combat } from './Combat';
import { palaces } from '../data/palaces';

interface GameEngineCallbacks {
  onInteraction?: (interaction: any) => void;
  onCombatStart?: (enemies: any[]) => void;
  onDialogueStart?: (dialogueId: string) => void;
  onItemCollected?: (item: any) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private currentPalace: Palace | null = null;
  private keys: Set<string> = new Set();
  private lastTime: number = 0;
  private callbacks: GameEngineCallbacks = {};

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player();
    this.callbacks = callbacks;
    
    this.setupEventListeners();
  }

  async initialize() {
    // Load initial palace
    await this.loadRoom('pride', 'entrance');
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleClick(x, y);
    });
  }

  async loadRoom(palaceName: string, roomName: string) {
    const palaceData = palaces[palaceName];
    if (palaceData) {
      this.currentPalace = new Palace(palaceData);
      this.currentPalace.setCurrentRoom(roomName);
      
      // Set player position to room entrance
      const room = this.currentPalace.getCurrentRoom();
      if (room && room.entrancePosition) {
        this.player.x = room.entrancePosition.x;
        this.player.y = room.entrancePosition.y;
      }
    }
  }

  update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update player movement
    this.updatePlayer(deltaTime);

    // Update current palace
    if (this.currentPalace) {
      this.currentPalace.update(deltaTime);
    }
  }

  updatePlayer(deltaTime: number) {
    const speed = 200; // pixels per second
    const moveDistance = (speed * deltaTime) / 1000;

    let newX = this.player.x;
    let newY = this.player.y;

    if (this.keys.has('w') || this.keys.has('arrowup')) {
      newY -= moveDistance;
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      newY += moveDistance;
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      newX -= moveDistance;
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      newX += moveDistance;
    }

    // Check collision with palace walls and objects
    if (this.currentPalace && this.currentPalace.canMoveTo(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
    }

    // Check interactions
    if (this.keys.has('e')) {
      this.checkInteractions();
      this.keys.delete('e'); // Prevent multiple triggers
    }
  }

  checkInteractions() {
    if (this.currentPalace) {
      const interaction = this.currentPalace.getInteractionAt(this.player.x, this.player.y);
      if (interaction) {
        this.handleInteraction(interaction);
      }
    }
  }

  handleInteraction(interaction: any) {
    console.log('Interaction:', interaction);
    
    if (this.callbacks.onInteraction) {
      this.callbacks.onInteraction(interaction);
    }
    
    // Handle specific interaction types
    switch (interaction.type) {
      case 'npc':
        if (interaction.data.dialogue && this.callbacks.onDialogueStart) {
          this.callbacks.onDialogueStart(interaction.data.dialogue);
        }
        break;
        
      case 'dream_shard':
        if (this.callbacks.onItemCollected) {
          this.callbacks.onItemCollected(interaction.data);
        }
        break;
        
      case 'chest':
        if (interaction.data.items && this.callbacks.onItemCollected) {
          interaction.data.items.forEach((item: any) => {
            this.callbacks.onItemCollected!(item);
          });
        }
        break;
        
      case 'exit':
        // Handle room transitions
        if (interaction.data.targetRoom) {
          this.loadRoom(this.currentPalace?.getPalaceData().id || '', interaction.data.targetRoom);
        }
        break;
        
      default:
        break;
    }
    
    // Check for enemy encounters
    if (this.currentPalace) {
      const room = this.currentPalace.getCurrentRoom();
      if (room?.enemies) {
        const nearbyEnemies = room.enemies.filter((enemy: any) => {
          const distance = Math.sqrt(
            Math.pow(this.player.x - enemy.x, 2) + Math.pow(this.player.y - enemy.y, 2)
          );
          return distance < 50; // Combat trigger radius
        });
        
        if (nearbyEnemies.length > 0 && this.callbacks.onCombatStart) {
          this.callbacks.onCombatStart(nearbyEnemies);
        }
      }
    }
  }

  handleClick(x: number, y: number) {
    // Handle click events
    console.log('Click at:', x, y);
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render current palace
    if (this.currentPalace) {
      this.currentPalace.render(this.ctx, this.player.x, this.player.y);
    }

    // Render player
    this.renderPlayer();
  }

  renderPlayer() {
    const camera_x = this.canvas.width / 2;
    const camera_y = this.canvas.height / 2;

    // Render player as a glowing figure
    this.ctx.save();
    this.ctx.translate(camera_x, camera_y);
    
    // Player shadow
    this.ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(0, 20, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Player body
    this.ctx.fillStyle = '#4a90e2';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Player glow effect
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    gradient.addColorStop(0, 'rgba(100, 150, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
}
