export interface Room {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  entrancePosition: { x: number; y: number };
  exits: { direction: string; targetRoom: string; position: { x: number; y: number } }[];
  obstacles: { x: number; y: number; width: number; height: number; type: string }[];
  interactables: { x: number; y: number; type: string; data: any }[];
  enemies?: any[];
  backgroundElements: { x: number; y: number; type: string; data?: any }[];
}

export interface PalaceData {
  id: string;
  name: string;
  theme: string;
  description: string;
  rooms: { [roomId: string]: Room };
}

export class Palace {
  private data: PalaceData;
  private currentRoom: string = '';

  constructor(data: PalaceData) {
    this.data = data;
  }

  setCurrentRoom(roomId: string) {
    if (this.data.rooms[roomId]) {
      this.currentRoom = roomId;
    }
  }

  getCurrentRoom(): Room | null {
    return this.data.rooms[this.currentRoom] || null;
  }

  getPalaceData(): PalaceData {
    return this.data;
  }

  canMoveTo(x: number, y: number): boolean {
    const room = this.getCurrentRoom();
    if (!room) return false;

    // Check room boundaries
    if (x < 0 || y < 0 || x > room.width || y > room.height) {
      return false;
    }

    // Check obstacles
    for (const obstacle of room.obstacles) {
      if (x >= obstacle.x && x <= obstacle.x + obstacle.width &&
          y >= obstacle.y && y <= obstacle.y + obstacle.height) {
        return false;
      }
    }

    return true;
  }

  getInteractionAt(x: number, y: number): any {
    const room = this.getCurrentRoom();
    if (!room) return null;

    const interactionRadius = 30;

    for (const interactable of room.interactables) {
      const distance = Math.sqrt(
        Math.pow(x - interactable.x, 2) + Math.pow(y - interactable.y, 2)
      );
      
      if (distance <= interactionRadius) {
        return interactable;
      }
    }

    // Check exits
    for (const exit of room.exits) {
      const distance = Math.sqrt(
        Math.pow(x - exit.position.x, 2) + Math.pow(y - exit.position.y, 2)
      );
      
      if (distance <= interactionRadius) {
        return {
          type: 'exit',
          data: exit
        };
      }
    }

    return null;
  }

  update(deltaTime: number) {
    // Update any animated elements in the palace
  }

  render(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    const room = this.getCurrentRoom();
    if (!room) return;

    // Calculate camera offset to center on player
    const centerX = ctx.canvas.width / 2 - playerX;
    const centerY = ctx.canvas.height / 2 - playerY;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Render room background
    this.renderRoomBackground(ctx, room);

    // Render background elements
    this.renderBackgroundElements(ctx, room);

    // Render obstacles
    this.renderObstacles(ctx, room);

    // Render interactables
    this.renderInteractables(ctx, room);

    // Render exits
    this.renderExits(ctx, room);

    ctx.restore();
  }

  private renderRoomBackground(ctx: CanvasRenderingContext2D, room: Room) {
    // Create a mystical gradient background
    const gradient = ctx.createRadialGradient(
      room.width / 2, room.height / 2, 0,
      room.width / 2, room.height / 2, Math.max(room.width, room.height)
    );
    
    // Palace-specific colors based on theme
    switch (this.data.theme) {
      case 'pride':
        gradient.addColorStop(0, '#2a1810');
        gradient.addColorStop(1, '#0f0a06');
        break;
      default:
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f23');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, room.width, room.height);

    // Add mystical pattern overlay
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 1;
    
    // Draw symbolic patterns
    for (let x = 0; x < room.width; x += 50) {
      for (let y = 0; y < room.height; y += 50) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }

  private renderBackgroundElements(ctx: CanvasRenderingContext2D, room: Room) {
    room.backgroundElements.forEach(element => {
      ctx.save();
      ctx.translate(element.x, element.y);
      
      switch (element.type) {
        case 'floating_stairs':
          this.renderFloatingStairs(ctx);
          break;
        case 'broken_statue':
          this.renderBrokenStatue(ctx);
          break;
        case 'mirror_fragment':
          this.renderMirrorFragment(ctx);
          break;
        case 'dream_crystal':
          this.renderDreamCrystal(ctx);
          break;
      }
      
      ctx.restore();
    });
  }

  private renderFloatingStairs(ctx: CanvasRenderingContext2D) {
    // Draw surreal floating stairs
    ctx.fillStyle = '#3a3a5c';
    ctx.strokeStyle = '#6a6a8c';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 5; i++) {
      const y = i * -15;
      const width = 40 - i * 3;
      
      ctx.fillRect(-width/2, y, width, 10);
      ctx.strokeRect(-width/2, y, width, 10);
    }
  }

  private renderBrokenStatue(ctx: CanvasRenderingContext2D) {
    // Draw a broken, mysterious statue
    ctx.fillStyle = '#4a4a6a';
    ctx.strokeStyle = '#7a7a9a';
    ctx.lineWidth = 2;
    
    // Base
    ctx.fillRect(-15, 30, 30, 20);
    
    // Body (broken)
    ctx.fillRect(-12, 0, 24, 30);
    ctx.strokeRect(-12, 0, 24, 30);
    
    // Add cracks
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 10);
    ctx.lineTo(8, 25);
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, 15);
    ctx.stroke();
  }

  private renderMirrorFragment(ctx: CanvasRenderingContext2D) {
    // Draw a reflective mirror fragment
    ctx.save();
    
    // Mirror surface
    const gradient = ctx.createLinearGradient(-10, -10, 10, 10);
    gradient.addColorStop(0, '#8aa8cc');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#4a6a8a');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(10, -5);
    ctx.lineTo(5, 10);
    ctx.lineTo(-8, 5);
    ctx.closePath();
    ctx.fill();
    
    // Frame
    ctx.strokeStyle = '#3a3a5a';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }

  private renderDreamCrystal(ctx: CanvasRenderingContext2D) {
    // Draw a glowing dream crystal
    ctx.save();
    
    // Glow effect
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    glowGradient.addColorStop(0, 'rgba(100, 150, 255, 0.5)');
    glowGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Crystal
    ctx.fillStyle = '#6aa5ff';
    ctx.strokeStyle = '#4a85df';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 15);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  private renderObstacles(ctx: CanvasRenderingContext2D, room: Room) {
    ctx.fillStyle = '#2a2a4a';
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 2;

    room.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
  }

  private renderInteractables(ctx: CanvasRenderingContext2D, room: Room) {
    room.interactables.forEach(interactable => {
      ctx.save();
      ctx.translate(interactable.x, interactable.y);
      
      // Add glow effect for interactables
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      glowGradient.addColorStop(0, 'rgba(255, 255, 100, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw interactable icon based on type
      ctx.fillStyle = '#ffff64';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      
      switch (interactable.type) {
        case 'npc':
          ctx.fillText('👤', 0, 5);
          break;
        case 'chest':
          ctx.fillText('📦', 0, 5);
          break;
        case 'shrine':
          ctx.fillText('⛩️', 0, 5);
          break;
        case 'dream_shard':
          ctx.fillText('💎', 0, 5);
          break;
        default:
          ctx.fillText('❓', 0, 5);
      }
      
      ctx.restore();
    });
  }

  private renderExits(ctx: CanvasRenderingContext2D, room: Room) {
    room.exits.forEach(exit => {
      ctx.save();
      ctx.translate(exit.position.x, exit.position.y);
      
      // Draw portal effect
      const portalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      portalGradient.addColorStop(0, 'rgba(150, 100, 255, 0.6)');
      portalGradient.addColorStop(1, 'rgba(150, 100, 255, 0)');
      ctx.fillStyle = portalGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Portal ring
      ctx.strokeStyle = '#9664ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.stroke();
      
      // Direction indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('→', 0, 5);
      
      ctx.restore();
    });
  }
}
