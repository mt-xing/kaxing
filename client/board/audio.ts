let audioState:
  | false
  | {
      theme: HTMLAudioElement;
      end: HTMLAudioElement;
      gg: HTMLAudioElement;
      questions: Record<number, HTMLAudioElement[]>;
      currentlyPlaying?: HTMLAudioElement;
    } = false;

const lastPlayedSongForTime = new Map<number, number>();

function spawnAudioElement(src: string) {
  const el = document.createElement("AUDIO") as HTMLAudioElement;
  el.src = src;
  document.body.appendChild(el);
  return el;
}

export async function startupAudio() {
  const path = window.location.search.substring(1);
  if (path.length > 0) {
    console.log("Attempting to find audio");
    const data = await fetch(path);
    if (data.status === 200) {
      const contents = await data.json();
      const themeLocation = contents.theme as string;
      const endLocation = contents.end as string;
      const ggLocation = contents.gg as string;
      const questionLocations = contents.q as Record<string, string[]>;
      if (themeLocation && endLocation && ggLocation && questionLocations) {
        console.log("Audio found");
        audioState = {
          theme: spawnAudioElement(themeLocation),
          end: spawnAudioElement(endLocation),
          gg: spawnAudioElement(ggLocation),
          questions: Array.from(Object.keys(questionLocations)).reduce(
            (a, x) => ({
              ...a,
              [parseInt(x, 10)]: questionLocations[x].map(spawnAudioElement),
            }),
            {},
          ),
        };
        audioState.theme.loop = true;
      }
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

function playSong(song: HTMLAudioElement) {
  if (audioState) {
    stopAudio();
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
