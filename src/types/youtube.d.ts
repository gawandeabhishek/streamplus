declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: number;
  }

  class Player {
    constructor(elementId: string, options: any);
  }
}

interface Window {
  YT: typeof YT;
  onYouTubeIframeAPIReady: () => void;
} 