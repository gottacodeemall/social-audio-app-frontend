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
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import * as reactNativePaper from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AudioPlayer from '../components/audioPlayer/audioPlayer';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { View, Text } from '../components/Themed';
import { getAnswer, getQuestion, requestChat, saveAnswerApi } from '../http/api';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { audioUpdateRecordingURI, updateState } from '../redux/actions';
import { Answer } from '../http/contracts';
import { useIsFocused } from '@react-navigation/native';
import { spotifyDark, spotifyGreen, textColor } from '../constants/Colors';
import { ActivityIndicator } from 'react-native-paper';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#EEEEEE';

export default function QuestionAnswer(props) {
  const isFocused = useIsFocused();

  const loggedInUser = useSelector((state) => state.generic.loggedInUser);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [hashtags, setHashtags] = useState<string>('');
  const [postedBy, setPostedBy] = useState<string>('');
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
        setPostedBy(response.postedBy);
        setAudio(response.audio);
      });
      getAnswer(props.route.params.questionId).then((response) => {
        setIsLoading(false);
        setAnswers(response);
      });
    };
    if (isFocused) fetchQuestion();
  }, [isFocused]);

  const generateAnswer = (): Answer => {
    return {
      answerId: uuidv4(),
      question: props.route.params.questionId,
      audio: '',
      answeredBy: loggedInUser,
    };
  };

  const RequestChat = async (answerId) => {
    requestChat(answerId).then((response) => {});
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
    <ScrollView>
      {isLoading && isFocused ? (
        <View style={styles.mainContainerWrapper} lightColor={spotifyDark}>
          <View style={[styles.loaderContainer]}>
            <ActivityIndicator animating={true} color={spotifyGreen} />
          </View>
        </View>
      ) : (
        <View style={styles.mainContainerWrapper} lightColor={spotifyDark}>
          <View style={styles.questionContainer}>
            <View style={styles.questionImageContainer}>
              {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
            </View>
            {audio && (
              <View style={styles.questionAudioContainer}>
                <AudioPlayer
                  recordedUri={audio ?? ''}
                  isSliderEnabled={true}
                  isTimerEnabled={true}
                />
              </View>
            )}
            <View style={styles.captionContainer}>
              <Text style={styles.textHeading}>{caption}</Text>
              <Text style={styles.textSubHeading}>{hashtags}</Text>
              <Text style={styles.textSubHeading}>{postedBy}</Text>
            </View>
          </View>
          {loggedInUser ? (
            <View style={styles.answerThisQuestionContainer}>
              <Text style={styles.textHeading}>Answer this question: </Text>
              <Pressable
                onPress={() => record()}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <FontAwesome name="microphone" size={24} color="#5D3EA8" />
              </Pressable>
            </View>
          ) : (
            <></>
          )}
          <View style={styles.answersContainer}>
            <Text style={styles.textHeading}>Answers:</Text>
            {answers &&
              answers.map((item) => (
                <View style={styles.answerContainer}>
                  <AudioPlayer
                    recordedUri={item.audio ?? ''}
                    isSliderEnabled={true}
                    isTimerEnabled={true}
                  />
                  <View style={styles.answerBottomContainer}>
                    <Text>Answered By: {item.answeredBy ? item.answeredBy : 'Error'}</Text>
                    {loggedInUser ? (
                      <TouchableHighlight
                        underlayColor={BACKGROUND_COLOR}
                        onPress={(response) => RequestChat(item.answerId)}
                        disabled={isLoading}
                      >
                        <View style={styles.circularIcon}>
                          <AntDesign name="message1" size={24} color="black" />
                        </View>
                      </TouchableHighlight>
                    ) : (
                      <></>
                    )}
                  </View>
                </View>
              ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainerWrapper: {
    backgroundColor: spotifyDark,
    flex: 1,
  },
  answerThisQuestionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    backgroundColor: BACKGROUND_COLOR,
    alignSelf: 'center',
    borderRadius: 5,
    height: 10,
    maxHeight: 100,
    minHeight: 100,
    marginBottom: 10,
  },
  answersContainer: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
  answerContainer: {
    minHeight: 120,
    marginBottom: 10,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    minHeight: 450,
    maxHeight: 450,
    backgroundColor: BACKGROUND_COLOR,
    alignSelf: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  questionImageContainer: {
    marginBottom: 10,
    backgroundColor: BACKGROUND_COLOR,
  },
  questionAudioContainer: {
    backgroundColor: BACKGROUND_COLOR,
  },
  captionContainer: {
    height: 30,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: DEVICE_WIDTH - 30,
  },
  answerBottomContainer: {
    backgroundColor: BACKGROUND_COLOR,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  loginBtn: {
    width: '70%',
    height: 50,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: spotifyDark,
  },
  textHeading: {
    fontWeight: 'bold',
    color: spotifyDark,
    fontSize: 20,
    marginBottom: 5,
  },
  textSubHeading: {
    fontWeight: 'bold',
    color: spotifyDark,
    fontSize: 12,
  },
  circularIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: spotifyGreen,
  },
});
