import { KaXingSaveFile } from "../fileFormat";

let audioState:
  | false
  | {
      theme?: HTMLAudioElement;
      end?: HTMLAudioElement;
      gg?: HTMLAudioElement;
      questions: Record<number, HTMLAudioElement[]>;
      currentlyPlaying?: HTMLAudioElement;
    } = false;

const lastPlayedSongForTime = new Map<number, number>();

function spawnAudioElement(src?: string) {
  if (!src) {
    return undefined;
  }
  const el = document.createElement("AUDIO") as HTMLAudioElement;
  el.src = src;
  document.body.appendChild(el);
  return el;
}

export async function startupAudio(musicData: KaXingSaveFile["music"]) {
  if (musicData) {
    console.log("Audio found");
    const themeLocation = musicData.theme;
    const endLocation = musicData.end;
    const ggLocation = musicData.gg;
    const questionLocations = musicData.q;
    audioState = {
      theme: spawnAudioElement(themeLocation),
      end: spawnAudioElement(endLocation),
      gg: spawnAudioElement(ggLocation),
      questions: Array.from(Object.keys(questionLocations)).reduce(
        (a, x) => ({
          ...a,
          [parseInt(x, 10)]: questionLocations[x]
            .map(spawnAudioElement)
            .filter((e) => e !== undefined),
        }),
        {},
      ),
    };
    if (audioState.theme) {
      audioState.theme.loop = true;
    }
  }
}

export function stopAudio() {
  if (audioState && audioState.currentlyPlaying) {
    audioState.currentlyPlaying.pause();
    audioState.currentlyPlaying.currentTime = 0;
    audioState.currentlyPlaying = undefined;
  }
}

function playSong(song?: HTMLAudioElement) {
  if (audioState) {
    stopAudio();
    if (!song) {
      return;
    }
    // eslint-disable-next-line no-param-reassign
    song.currentTime = 0;
    song.play();
    audioState.currentlyPlaying = song;
  }
}

export function playTheme() {
  if (audioState) {
    playSong(audioState.theme);
  }
}

export function playEnd() {
  if (audioState) {
    playSong(audioState.end);
  }
}

export function playQuestion(time: number) {
  if (audioState) {
    stopAudio();
    if (time in audioState.questions) {
      const choices = audioState.questions[time];
      let num = Math.floor(Math.random() * choices.length);
      while (choices.length > 1 && num === lastPlayedSongForTime.get(time)) {
        num = Math.floor(Math.random() * choices.length);
      }
      const choice = choices[num];
      playSong(choice);
      lastPlayedSongForTime.set(time, num);
    }
  }
}

export function playGG() {
  if (audioState) {
    playSong(audioState.gg);
  }
}
