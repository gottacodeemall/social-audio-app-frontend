import React, { MutableRefObject, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Icons from '../Icons/Icons';
import { useRef } from 'react';
import { AntDesign, Feather } from '@expo/vector-icons';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#EEEEEE';
const greyColor = '#000000';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

interface AudioPlayerProps {
  recordedUri: string;
  isSliderEnabled: boolean;
  isTimerEnabled: boolean;
}

export default function AudioPlayer(props: AudioPlayerProps) {
  const sound: MutableRefObject<Audio.Sound> = useRef(new Audio.Sound());
  let isSeeking: MutableRefObject<boolean> = useRef(false);
  let shouldPlayAtEndOfSeek: MutableRefObject<boolean> = useRef(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [soundPosition, setSoundPosition] = useState<number | null>(null);
  const [soundDuration, setSoundDuration] = useState<number | null>(null);
  const [shouldPlay, setShouldPlay] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState<boolean>(false);

  useEffect(() => {
    const getAudio = async () => {
      if (props.recordedUri && props.recordedUri != '') {
        const loadedAudio: AVPlaybackStatus = await sound.current.loadAsync(
          { uri: props.recordedUri },
          {},
          true
        );
        sound.current.setOnPlaybackStatusUpdate((info) => _updateScreenForSoundStatus(info));
        _updateScreenForSoundStatus(loadedAudio);
        return () => {
          UnloadAudio();
        };
      }
    };

    getAudio();
  }, [props.recordedUri]);

  const _setStateFromAVIsLoaded = (json: any) => {
    setSoundDuration(json.soundDuration);
    setSoundPosition(json.soundPosition);
    setShouldPlay(json.shouldPlay);
    setIsPlaying(json.isPlaying);
    setIsPlaybackAllowed(json.isPlaybackAllowed);
  };

  const _setStateFromAVIsNotLoaded = (json: any) => {
    setSoundDuration(json.soundDuration);
    setSoundPosition(json.soundPosition);
    setIsPlaybackAllowed(json.isPlaybackAllowed);
  };

  const _updateScreenForSoundStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      _setStateFromAVIsLoaded({
        soundDuration: status.durationMillis ?? null,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        isPlaybackAllowed: true,
      });
    } else {
      _setStateFromAVIsNotLoaded({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false,
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  const PlayRecordedAudio = async () => {
    try {
      // Get Player Status
      const playerStatus = await sound.current.getStatusAsync();

      // Play if song is loaded successfully
      if (playerStatus.isLoaded) {
        if (playerStatus.isPlaying === false) {
          sound.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {}
  };

  const StopPlaying = async () => {
    try {
      sound.current.stopAsync();
      setIsPlaying(false);
    } catch (error) {}
  };

  const UnloadAudio = async () => {
    const playerStatus = await sound.current.getStatusAsync();
    if (playerStatus.isLoaded === true) await sound.current.unloadAsync();
  };

  // DOM Interactions

  const _onPlayPausePressed = () => {
    if (sound.current != null) {
      if (isPlaying) {
        StopPlaying();
      } else {
        PlayRecordedAudio();
      }
    }
  };

  const _onSeekSliderValueChange = (value: number) => {
    if (sound.current != null && !isSeeking.current) {
      isSeeking.current = true;
      shouldPlayAtEndOfSeek.current = shouldPlay;
      sound.current.pauseAsync();
    }
  };

  const _onSeekSliderSlidingComplete = async (value: number) => {
    if (sound.current != null) {
      isSeeking.current = false;
      const seekPosition = value * (soundDuration || 0);
      if (shouldPlayAtEndOfSeek.current) {
        sound.current.playFromPositionAsync(seekPosition);
      } else {
        sound.current.setPositionAsync(seekPosition);
      }
    }
  };

  const _getSeekSliderPosition = () => {
    console.log('sound', soundPosition, soundDuration);
    if (sound.current != null && soundPosition != null && soundDuration != null) {
      return soundPosition / soundDuration;
    }
    return 0;
  };

  const _getMMSSFromMillis = (millis: number) => {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = (number: number) => {
      const string = number.toString();
      if (number < 10) {
        return '0' + string;
      }
      return string;
    };
    return padWithZero(minutes) + ':' + padWithZero(seconds);
  };

  const _getPlaybackTimestamp = () => {
    if (sound.current != null && soundPosition != null && soundDuration != null) {
      return `${_getMMSSFromMillis(soundPosition)} / ${_getMMSSFromMillis(soundDuration)}`;
    }
    return '';
  };

  return (
    <>
      {
        <>
          <View
            style={[
              styles.mainContainer,
              {
                opacity: !isPlaybackAllowed || isLoading ? DISABLED_OPACITY : 1.0,
              },
            ]}
          >
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              onPress={_onPlayPausePressed}
              disabled={!isPlaybackAllowed || isLoading}
            >
              {!isPlaying ? (
                <Feather name="play" size={24} color={greyColor} />
              ) : (
                <AntDesign name="pause" size={24} color={greyColor} />
              )}
            </TouchableHighlight>
            <View>
              {props.isSliderEnabled ? (
                <Slider
                  style={styles.playbackSlider}
                  trackImage={Icons.TRACK_1.module}
                  thumbImage={Icons.THUMB_1.module}
                  value={_getSeekSliderPosition()}
                  onValueChange={_onSeekSliderValueChange}
                  onSlidingComplete={_onSeekSliderSlidingComplete}
                  disabled={!isPlaybackAllowed || isLoading}
                />
              ) : (
                <></>
              )}
              {props.isTimerEnabled ? (
                <Text style={[styles.playbackTimestamp]}>{_getPlaybackTimestamp()}</Text>
              ) : (
                <></>
              )}
              <View />
            </View>
          </View>
        </>
      }
    </>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
    minWidth: DEVICE_WIDTH,
  },
  playbackSlider: {
    alignSelf: 'stretch',
    width: DEVICE_WIDTH / 1.3,
  },
  playbackTimestamp: {
    textAlign: 'right',
    alignSelf: 'stretch',
    paddingRight: 20,
  },
});
