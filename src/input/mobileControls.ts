export type MobileAction = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';

type ActionButton = HTMLButtonElement & { dataset: DOMStringMap & { action: MobileAction } };

class MobileControls {
  private readonly downState: Record<MobileAction, boolean> = {
    up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false
  };
  private readonly pressedState: Record<MobileAction, boolean> = {
    up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false
  };
  private pointerMap = new Map<number, MobileAction>();
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;
    const buttons = document.querySelectorAll<HTMLButtonElement>('[data-action]');
    buttons.forEach((element) => {
      const button = element as ActionButton;
      const action = button.dataset.action;
      if (!action) return;
      button.addEventListener('pointerdown', (event) => this.onDown(event, button, action));
      button.addEventListener('pointerup', (event) => this.onUp(event, button));
      button.addEventListener('pointercancel', (event) => this.onUp(event, button));
      button.addEventListener('pointerleave', (event) => this.onUp(event, button));
    });
    this.initialized = true;
  }

  isDown(action: MobileAction): boolean {
    return this.downState[action];
  }

  consumePress(action: MobileAction): boolean {
    const pressed = this.pressedState[action];
    this.pressedState[action] = false;
    return pressed;
  }

  private onDown(event: PointerEvent, button: ActionButton, action: MobileAction): void {
    event.preventDefault();
    this.pointerMap.set(event.pointerId, action);
    this.downState[action] = true;
    this.pressedState[action] = true;
    button.classList.add('is-pressed');
    button.setPointerCapture(event.pointerId);
  }

  private onUp(event: PointerEvent, button: ActionButton): void {
    event.preventDefault();
    const action = this.pointerMap.get(event.pointerId);
    if (!action) return;
    this.pointerMap.delete(event.pointerId);
    this.downState[action] = Array.from(this.pointerMap.values()).some((value) => value === action);
    button.classList.remove('is-pressed');
    if (button.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
  }
}

export const mobileControls = new MobileControls();
