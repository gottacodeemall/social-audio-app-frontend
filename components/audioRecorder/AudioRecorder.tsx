import React, { MutableRefObject, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Icons from '../Icons/Icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRef } from 'react';
import { AntDesign, Feather, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { useDispatch } from 'react-redux';
import { audioUpdateRecordingURI, updateState } from '../../redux/actions';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#EEEEEE';
const greyColor = '#000000';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;

export default function AudioRecorder(props: any) {
  const navigation = useNavigation();
  console.log('props', props);
  let recording: MutableRefObject<Audio.Recording | null> = useRef(null);
  let sound: MutableRefObject<Audio.Sound | null> = useRef(null);
  let isSeeking: MutableRefObject<boolean> = useRef(false);
  let shouldPlayAtEndOfSeek: MutableRefObject<boolean> = useRef(false);
  const recordingSettings: MutableRefObject<Audio.RecordingOptions> = useRef(
    Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
  );

  const [hasRecordingPermissions, setHasRecordingPermissions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [soundPosition, setSoundPosition] = useState<number | null>(null);
  const [soundDuration, setSoundDuration] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number | null>(null);
  const [shouldPlay, setShouldPlay] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [fontLoaded, setFontLoaded] = useState<boolean>(false);
  const [shouldCorrectPitch, setShouldCorrectPitch] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [rate, setRate] = useState<number>(1.0);

  const dispatch = useDispatch();

  useEffect(() => {
    setFontLoaded(true);
    _askForPermission();
  }, []);

  const _askForPermission = async () => {
    const response = await Audio.requestPermissionsAsync();
    setHasRecordingPermissions(response.status === 'granted');
  };

  const _setStateFromAVIsLoaded = (json: any) => {
    setSoundDuration(json.soundDuration);
    setSoundPosition(json.soundPosition);
    setShouldPlay(json.shouldPlay);
    setIsPlaying(json.isPlaying);
    setRate(json.rate);
    setMuted(json.muted);
    setVolume(json.volume);
    setShouldCorrectPitch(json.shouldCorrectPitch);
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
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        shouldCorrectPitch: status.shouldCorrectPitch,
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

  const _updateScreenForRecordingStatus = (status: Audio.RecordingStatus) => {
    if (status.canRecord) {
      setIsRecording(status.isRecording);
      setRecordingDuration(status.durationMillis);
    } else if (status.isDoneRecording) {
      setIsRecording(false);
      setRecordingDuration(status.durationMillis);
      if (!isLoading) {
        _stopRecordingAndEnablePlayback();
      }
    }
  };

  const _stopPlaybackAndBeginRecording = async () => {
    setIsLoading(true);
    if (sound.current !== null) {
      await sound.current.unloadAsync();
      sound.current.setOnPlaybackStatusUpdate(null);
      sound.current = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    if (recording.current !== null) {
      recording.current.setOnRecordingStatusUpdate(null);
      recording.current = null;
    }

    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(recordingSettings.current);
    newRecording.setOnRecordingStatusUpdate(_updateScreenForRecordingStatus);

    recording.current = newRecording;
    await recording.current.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    setIsLoading(false);
  };

  const _stopRecordingAndEnablePlayback = async () => {
    setIsLoading(true);
    if (!recording.current) {
      return;
    }
    try {
      await recording.current.stopAndUnloadAsync();
    } catch (error) {
      // On Android, calling stop before any data has been collected results in
      // an E_AUDIO_NODATA error. This means no audio data has been written to
      // the output file is invalid.
      if (error.code === 'E_AUDIO_NODATA') {
        console.log(
          `Stop was called too quickly, no data has yet been received (${error.message})`
        );
      } else {
        console.log('STOP ERROR: ', error.code, error.name, error.message);
      }
      setIsLoading(false);
      return;
    }
    const info = await FileSystem.getInfoAsync(recording.current.getURI() || '');
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const response = await recording.current.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: muted,
        volume: volume,
        rate: rate,
        shouldCorrectPitch: shouldCorrectPitch,
      },
      _updateScreenForSoundStatus
    );
    sound.current = response.sound;
    setIsLoading(false);
  };

  // DOM Interactions

  const _onRecordPressed = () => {
    if (isRecording) {
      _stopRecordingAndEnablePlayback();
    } else {
      _stopPlaybackAndBeginRecording();
    }
  };

  const _onPlayPausePressed = () => {
    if (sound.current != null) {
      if (isPlaying) {
        sound.current.pauseAsync();
      } else {
        sound.current.playAsync();
      }
    }
  };

  const _onStopPressed = () => {
    if (sound.current != null) {
      sound.current.stopAsync();
    }
  };

  const _onMutePressed = () => {
    if (sound.current != null) {
      sound.current.setIsMutedAsync(!muted);
    }
  };

  const _onVolumeSliderValueChange = (value: number) => {
    if (sound.current != null) {
      sound.current.setVolumeAsync(value);
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

  const _getRecordingTimestamp = () => {
    if (recordingDuration != null) {
      return `${_getMMSSFromMillis(recordingDuration)}`;
    }
    return `${_getMMSSFromMillis(0)}`;
  };

  const updateRecordingUri = (uri: string | undefined) => {
    dispatch(updateState(audioUpdateRecordingURI, uri));
  };

  const saveAudio = () => {
    if (recording.current) {
      const uri = recording.current.getURI();
      updateRecordingUri(uri ?? undefined);
      if (props.route.params.postSaveRedirection) {
        const redirectionString = props.route.params.postSaveRedirection,
          redirectionParams = props.route.params.postSaveRedirectionParams;
        navigation.navigate(redirectionString, redirectionParams);
      } else {
        navigation.navigate('Question');
      }
    } else {
      updateRecordingUri(undefined);
    }
  };

  const navigateAway = () => {
    navigation.goBack();
  };

  return (
    <>
      {!fontLoaded ? (
        <View style={styles.emptyContainer} />
      ) : !hasRecordingPermissions ? (
        <View style={styles.container}>
          <View />
          <Text style={[styles.noPermissionsText]}>
            You must enable audio recording permissions in order to use this app.
          </Text>
          <View />
        </View>
      ) : (
        <>
          <View style={styles.container}>
            <View
              style={[
                styles.halfScreenContainer,
                {
                  opacity: isLoading ? DISABLED_OPACITY : 1.0,
                },
              ]}
            >
              <View />
              <View style={styles.recordingContainer}>
                <View />
                <TouchableHighlight
                  underlayColor={BACKGROUND_COLOR}
                  style={styles.wrapper}
                  onPress={_onRecordPressed}
                  disabled={isLoading}
                >
                  {!isRecording ? (
                    <Feather name="mic" size={100} color={greyColor} />
                  ) : (
                    <FontAwesome name="stop" size={50} color={greyColor} />
                  )}
                </TouchableHighlight>
                <View style={styles.recordingDataContainer}>
                  <View />
                  <Text style={[styles.liveText]}>{isRecording ? 'LIVE' : ''}</Text>
                  <View style={styles.recordingDataRowContainer}>
                    {isRecording ? (
                      <FontAwesome5 name="record-vinyl" size={24} color="red" />
                    ) : (
                      <></>
                    )}
                    <Text style={[styles.recordingTimestamp]}>{_getRecordingTimestamp()}</Text>
                  </View>
                  <View />
                </View>
                <View />
              </View>
              <View />
            </View>
            <View
              style={[
                styles.halfScreenContainer,
                {
                  opacity: !isPlaybackAllowed || isLoading ? DISABLED_OPACITY : 1.0,
                },
              ]}
            >
              <View style={styles.innerHalfScreenContainer}>
                <View style={styles.playbackContainer}>
                  <Slider
                    style={styles.playbackSlider}
                    trackImage={Icons.TRACK_1.module}
                    thumbImage={Icons.THUMB_1.module}
                    value={_getSeekSliderPosition()}
                    onValueChange={_onSeekSliderValueChange}
                    onSlidingComplete={_onSeekSliderSlidingComplete}
                    disabled={!isPlaybackAllowed || isLoading}
                  />
                  <Text style={[styles.playbackTimestamp]}>{_getPlaybackTimestamp()}</Text>
                </View>
                <View style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}>
                  <View style={styles.volumeContainer}>
                    <TouchableHighlight
                      underlayColor={BACKGROUND_COLOR}
                      style={styles.wrapper}
                      onPress={_onMutePressed}
                      disabled={!isPlaybackAllowed || isLoading}
                    >
                      {muted ? (
                        <Ionicons name="md-volume-mute-outline" size={35} color={greyColor} />
                      ) : (
                        <Ionicons name="volume-high-outline" size={35} color={greyColor} />
                      )}
                    </TouchableHighlight>
                    <Slider
                      style={styles.volumeSlider}
                      trackImage={Icons.TRACK_1.module}
                      thumbImage={Icons.THUMB_2.module}
                      value={1}
                      onValueChange={_onVolumeSliderValueChange}
                      disabled={!isPlaybackAllowed || isLoading}
                    />
                  </View>
                  <View style={styles.playStopContainer}>
                    <TouchableHighlight
                      underlayColor={BACKGROUND_COLOR}
                      style={styles.wrapper}
                      onPress={_onPlayPausePressed}
                      disabled={!isPlaybackAllowed || isLoading}
                    >
                      {!isPlaying ? (
                        <Feather name="play" size={24} color={greyColor} />
                      ) : (
                        <AntDesign name="pause" size={24} color={greyColor} />
                      )}
                    </TouchableHighlight>
                    <TouchableHighlight
                      underlayColor={BACKGROUND_COLOR}
                      style={styles.wrapper}
                      onPress={_onStopPressed}
                      disabled={!isPlaybackAllowed || isLoading}
                    >
                      <Ionicons name="stop-outline" size={24} color={greyColor} />
                    </TouchableHighlight>
                  </View>
                  <View />
                </View>
                <View />
                <View style={styles.saveandBackStyle}>
                  <Button mode="text" onPress={() => navigateAway()}>
                    Cancel
                  </Button>
                  <Button disabled={soundDuration == null} mode="text" onPress={() => saveAudio()}>
                    Save
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
    minHeight: DEVICE_HEIGHT,
    maxHeight: DEVICE_HEIGHT,
  },
  noPermissionsText: {
    textAlign: 'center',
  },
  wrapper: {},
  halfScreenContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: DEVICE_HEIGHT / 2.0,
    maxHeight: DEVICE_HEIGHT / 2.0,
  },
  innerHalfScreenContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  saveandBackStyle: {
    flexDirection: 'row',
    minHeight: DEVICE_HEIGHT / 4.0,
    minWidth: DEVICE_WIDTH / 4.0,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: Icons.RECORD_BUTTON.height,
    maxHeight: Icons.RECORD_BUTTON.height,
  },
  recordingDataContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: Icons.RECORD_BUTTON.height,
    maxHeight: Icons.RECORD_BUTTON.height,
    minWidth: Icons.RECORD_BUTTON.width * 3.0,
    maxWidth: Icons.RECORD_BUTTON.width * 3.0,
  },
  recordingDataRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: Icons.RECORDING.height,
    maxHeight: Icons.RECORDING.height * 2,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: Icons.THUMB_1.height * 2.0,
    maxHeight: Icons.THUMB_1.height * 2.0,
  },
  playbackSlider: {
    alignSelf: 'stretch',
  },
  liveText: {
    color: LIVE_COLOR,
  },
  recordingTimestamp: {
    paddingLeft: 20,
  },
  playbackTimestamp: {
    textAlign: 'right',
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  image: {
    backgroundColor: BACKGROUND_COLOR,
  },
  textButton: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 10,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonsContainerTopRow: {
    maxHeight: Icons.MUTED_BUTTON.height,
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  playStopContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: ((Icons.PLAY_BUTTON.width + Icons.STOP_BUTTON.width) * 3.0) / 2.0,
    maxWidth: ((Icons.PLAY_BUTTON.width + Icons.STOP_BUTTON.width) * 3.0) / 2.0,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
  volumeSlider: {
    width: DEVICE_WIDTH / 2.0 - Icons.MUTED_BUTTON.width,
  },
  buttonsContainerBottomRow: {
    maxHeight: Icons.THUMB_1.height,
    alignSelf: 'stretch',
    paddingRight: 20,
    paddingLeft: 20,
  },
  rateSlider: {
    width: DEVICE_WIDTH / 2.0,
  },
});
