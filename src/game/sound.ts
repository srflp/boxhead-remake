const audioCtx = new AudioContext();

export async function loadSound(filepath: string) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const track = await audioCtx.decodeAudioData(arrayBuffer);
  return track;
}

export function playSound(audioBuffer: AudioBuffer) {
  const trackSource = audioCtx.createBufferSource();
  trackSource.buffer = audioBuffer;
  trackSource.connect(audioCtx.destination);
  trackSource.start();
  return trackSource;
}
