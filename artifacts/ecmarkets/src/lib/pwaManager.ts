type DeferredPrompt = {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Listener = () => void;

class PWAManager {
  private deferredPrompt: DeferredPrompt | null = null;
  private listeners: Set<Listener> = new Set();
  private _isInstalled = false;

  constructor() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as unknown as DeferredPrompt;
      this.notify();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this._isInstalled = true;
      this.notify();
    });

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      this._isInstalled = true;
    }
  }

  get canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  get isInstalled(): boolean {
    return this._isInstalled;
  }

  get isIOS(): boolean {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  get isMobile(): boolean {
    return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
  }

  get isAndroid(): boolean {
    return /android/i.test(navigator.userAgent);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  async triggerInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferredPrompt) return 'unavailable';
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.deferredPrompt = null;
      this.notify();
    }
    return outcome;
  }
}

export const pwaManager = new PWAManager();
