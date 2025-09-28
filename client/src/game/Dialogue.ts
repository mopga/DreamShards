export interface DialogueChoice {
  text: string;
  condition?: () => boolean;
  action?: () => void;
  nextDialogue?: DialogueNode;
}

export interface DialogueNode {
  id: string;
  speaker?: string;
  text: string;
  choices?: DialogueChoice[];
  nextDialogue?: DialogueNode;
  onComplete?: () => void;
}

export class DialogueManager {
  private currentDialogue: DialogueNode | null = null;
  private dialogueHistory: string[] = [];

  startDialogue(dialogue: DialogueNode) {
    this.currentDialogue = dialogue;
    this.dialogueHistory.push(dialogue.id);
  }

  getCurrentDialogue(): DialogueNode | null {
    return this.currentDialogue;
  }

  selectChoice(choiceIndex: number) {
    if (!this.currentDialogue || !this.currentDialogue.choices) {
      return false;
    }

    const choice = this.currentDialogue.choices[choiceIndex];
    if (!choice) return false;

    // Check condition if present
    if (choice.condition && !choice.condition()) {
      return false;
    }

    // Execute action if present
    if (choice.action) {
      choice.action();
    }

    // Move to next dialogue
    if (choice.nextDialogue) {
      this.currentDialogue = choice.nextDialogue;
      this.dialogueHistory.push(choice.nextDialogue.id);
    } else {
      this.endDialogue();
    }

    return true;
  }

  endDialogue() {
    if (this.currentDialogue && this.currentDialogue.onComplete) {
      this.currentDialogue.onComplete();
    }
    this.currentDialogue = null;
  }

  hasSeenDialogue(dialogueId: string): boolean {
    return this.dialogueHistory.includes(dialogueId);
  }
}
