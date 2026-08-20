import TrackPlayer, { Event, Capability, RepeatMode, AppKilledPlaybackBehavior, State } from 'react-native-track-player';
import { usePlayerStore } from '../../store/playerStore';

export const setupPlayer = async () => {
  let isSetup = false;
  try {
    await TrackPlayer.getCurrentTrack();
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
    isSetup = true;
  }
  return isSetup;
};

export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
    if (event.track) {
      usePlayerStore.setState({ activeTrack: event.track });
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    if (event.state === State.Playing) {
      usePlayerStore.setState({ isPlaying: true });
    } else if (event.state === State.Paused || event.state === State.Stopped) {
      usePlayerStore.setState({ isPlaying: false });
    }
  });

  // Background Sleep Timer Monitor
  setInterval(() => {
    const endTime = usePlayerStore.getState().sleepTimerEndTime;
    if (endTime && Date.now() >= endTime) {
      TrackPlayer.pause();
      usePlayerStore.getState().cancelSleepTimer();
    }
  }, 10000); // Check every 10 seconds
}
