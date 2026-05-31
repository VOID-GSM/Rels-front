import { create } from "zustand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_install_dismissed_until";
const DISMISS_DAYS = 7;

// 비직렬화 객체는 모듈 레벨 변수로 분리
let _deferredPrompt: BeforeInstallPromptEvent | null = null;

interface PWAStore {
  isInstallable: boolean;
  bannerDismissed: boolean;
  capture: (event: Event) => void;
  install: () => Promise<void>;
  dismissBanner: () => void;
}

export const usePWAStore = create<PWAStore>((set) => ({
  isInstallable: false,
  bannerDismissed: false,

  capture: (event) => {
    event.preventDefault();
    _deferredPrompt = event as BeforeInstallPromptEvent;
    const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
    const bannerDismissed = !!(
      dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)
    );
    set({ isInstallable: true, bannerDismissed });
  },

  install: async () => {
    if (!_deferredPrompt) return;
    await _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    if (outcome === "accepted") {
      _deferredPrompt = null;
      set({ isInstallable: false });
    }
  },

  dismissBanner: () => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, String(until));
    set({ bannerDismissed: true });
  },
}));
