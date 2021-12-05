import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Button,
  Platform,
  Image,
  StyleSheet,
  TextInput,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import * as reactNativePaper from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AudioPlayer from '../components/audioPlayer/audioPlayer';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { View, Text } from '../components/Themed';
import { getAnswer, getQuestion, saveAnswerApi } from '../http/api';
import { FontAwesome } from '@expo/vector-icons';
import { audioUpdateRecordingURI, updateState } from '../redux/actions';
import { Answer } from '../http/contracts';
import { useIsFocused } from '@react-navigation/native';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#EEEEEE';

export default function QuestionAnswer(props) {
  const isFocused = useIsFocused();

  const loggedInUser = useSelector((state) => state.generic.loggedInUser);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [hashtags, setHashtags] = useState<string>('');
  const [users, setUsers] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [audio, setAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [answers, setAnswers] = React.useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoading(true);
      getQuestion(props.route.params.questionId).then((response) => {
        setIsLoading(false);
        setImage(response.Thumbnail);
        setCaption(response.caption);
        setHashtags(response.hashtags);
        setUsers(response.taggedUsers);
        setAudio(response.audio);
      });
      getAnswer(props.route.params.questionId).then((response) => {
        setIsLoading(false);
        setAnswers(response);
      });
    };
    fetchQuestion();
  }, [isFocused]);

  const generateAnswer = (): Answer => {
    return {
      answerId: uuidv4(),
      question: props.route.params.questionId,
      audio: '',
      answeredBy: loggedInUser,
    };
  };

  function record() {
    dispatch(updateState(audioUpdateRecordingURI, ''));
    props.navigation.navigate('Record', {
      postSaveRedirection: 'QuestionAnswer',
      postSaveRedirectionParams: { questionId: props.route.params.questionId },
      postSaveExecutor: saveAnswerApi,
      postSaveExecutorParams: generateAnswer(),
    });
  }

  return (
    <View style={styles.mainContainer}>
      {isLoading && isFocused ? (
        <Text>'Is Loading'</Text>
      ) : (
        <>
          {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
          {audio && (
            <AudioPlayer recordedUri={audio ?? ''} isSliderEnabled={true} isTimerEnabled={true} />
          )}
          <Text>Caption: {caption}</Text>
          <Text>Hashtags: {hashtags}</Text>
          <Text>Users: {users}</Text>
          <Text>
            <Text>Answer this question: </Text>
            <Pressable
              onPress={() => record()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <FontAwesome name="microphone" size={24} color="#5D3EA8" />
            </Pressable>
          </Text>
          <Text>Answers:</Text>
          {answers.map((item) => (
            <AudioPlayer
              recordedUri={item.audio ?? ''}
              isSliderEnabled={true}
              isTimerEnabled={true}
            />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
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
