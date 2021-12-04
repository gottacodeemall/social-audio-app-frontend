import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button, Platform, Image, StyleSheet, TextInput, Dimensions } from 'react-native';
import * as reactNativePaper from 'react-native-paper';
import { useSelector } from 'react-redux';
import AudioPlayer from '../components/audioPlayer/audioPlayer';

import { View } from '../components/Themed';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#EEEEEE';

export default function Question() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, onCaptionChange] = useState<string>('');
  const [hashtags, onHashtagsChange] = useState<string>('');
  const [users, onUsersChange] = useState<string>('');
  const [location, onLocationChange] = useState<string>('');

  const recordingUri = useSelector((state: any) => state.audio.recordingUri);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const _setDisabledForSave = () => {
    return caption == '' || recordingUri == '' ? true : false;
  };

  const generateJSON = () => {
    const gen = {
      caption: caption,
      hashtags: hashtags,
      users: users,
      location: location,
      thumbnailUri: image,
      audioUri: recordingUri,
    };
    console.log(gen);
    return gen;
  };

  const saveAsDraft = (): void => {
    generateJSON();
    // hit saveAsDraft
  };

  const saveAudio = (): void => {
    generateJSON();
    // hit saveAudio
  };
  const saveAudioAsAnonymous = (): void => {
    generateJSON();
    // hit saveAudioAsAnonymous
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      {recordingUri && (
        <AudioPlayer
          recordedUri={recordingUri ?? ''}
          isSliderEnabled={true}
          isTimerEnabled={true}
        />
      )}
      <TextInput
        style={styles.input}
        onChangeText={(text: string) => {
          onCaptionChange(text);
        }}
        value={caption}
        placeholder="Caption"
      />
      <TextInput
        style={styles.input}
        onChangeText={(text: string) => {
          onHashtagsChange(text);
        }}
        value={hashtags}
        placeholder="Hashtags"
      />
      <TextInput
        style={styles.input}
        onChangeText={(text: string) => {
          onUsersChange(text);
        }}
        value={users}
        placeholder="Users"
      />
      <TextInput
        style={styles.input}
        onChangeText={(text: string) => {
          onLocationChange(text);
        }}
        value={location}
        placeholder="Location"
      />
      <View style={styles.saveandBackStyle}>
        <View>
          <reactNativePaper.Button mode="text" onPress={() => saveAsDraft()}>
            Save As Draft
          </reactNativePaper.Button>
        </View>
        <View style={styles.publishStyles}>
          <reactNativePaper.Button
            disabled={_setDisabledForSave()}
            mode="text"
            onPress={() => saveAudioAsAnonymous()}
          >
            Publish
          </reactNativePaper.Button>
          <reactNativePaper.Button
            disabled={_setDisabledForSave()}
            mode="text"
            onPress={() => saveAudio()}
          >
            Publish As Anonymous
          </reactNativePaper.Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: DEVICE_WIDTH,
    minHeight: DEVICE_HEIGHT,
    marginTop: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: DEVICE_WIDTH - 30,
  },
  saveandBackStyle: {
    backgroundColor: BACKGROUND_COLOR,
    flexDirection: 'column',
    minHeight: DEVICE_HEIGHT / 4.0,
    minWidth: DEVICE_WIDTH / 4.0,
  },
  publishStyles: {
    marginTop: 20,
    flexDirection: 'row',
  },
});
