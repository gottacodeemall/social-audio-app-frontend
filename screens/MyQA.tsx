import * as React from 'react';
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import { Text, View } from '../components/Themed';
import { ScrollView, StyleSheet } from 'react-native';
import * as reactNativePaper from 'react-native-paper';
import { fetchQuestions, getMyQuestions } from '../http/api';
import { HomePageCategoryQuestions, Question } from '../http/contracts';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { spotifyDark, spotifyGreen, textColor } from '../constants/Colors';
// import { Searchbar } from 'react-native-paper';
// const LeftContent = props => <Avatar.Icon {...props} icon="folder" />

const draftScreen = 'draft',
  postedScreen = 'posted',
  answeredScreen = 'answered';

const cardStyles = StyleSheet.create({
  card: {
    width: 200,
    height: 225,
    margin: 10,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: '#333333',
    alignSelf: 'center',
  },
  cardCover: {
    padding: 0,
    margin: 0,
    width: 200,
    height: 150,
    borderWidth: 1,
    alignSelf: 'center',
  },
  cardContent: {
    height: 50,
  },
  cardCaption: {
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
    color: textColor,
  },
  cardPosted: {
    fontSize: 10,
    padding: 0,
    color: textColor,
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    height: 40,
    alignSelf: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: spotifyDark,
  },
});

const MyQA = ({ navigation }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const loggedInUser = useSelector((state) => state.generic.loggedInUser);
  const [currentScreen, setCurrentScreen] = useState<string>('draft');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function getquestions() {
      setIsLoading(true);
      const response = await getMyQuestions(loggedInUser, currentScreen);
      setQuestions(response);
      setIsLoading(false);
    }
    getquestions();
  }, [currentScreen]);

  const switchScreens = (screen: string) => {
    setCurrentScreen(screen);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ height: '100%' }} lightColor={spotifyDark}>
        {isLoading ? (
          <View style={[cardStyles.loaderContainer]}>
            <ActivityIndicator animating={true} color={spotifyGreen} />
          </View>
        ) : (
          <>
            <View style={cardStyles.buttonsContainer}>
              <reactNativePaper.Button
                disabled={currentScreen == draftScreen}
                onPress={() => switchScreens(draftScreen)}
              >
                Draft
              </reactNativePaper.Button>
              <reactNativePaper.Button
                disabled={currentScreen === postedScreen}
                onPress={() => switchScreens(postedScreen)}
              >
                Posted
              </reactNativePaper.Button>
              <reactNativePaper.Button
                disabled={currentScreen === answeredScreen}
                onPress={() => switchScreens(answeredScreen)}
              >
                Answered
              </reactNativePaper.Button>
            </View>
            {questions &&
              questions.map((item) => (
                <Card
                  key={item.questionId}
                  style={cardStyles.card}
                  onPress={() =>
                    navigation.navigate('QuestionAnswer', { questionId: item.questionId })
                  }
                >
                  <Card.Cover style={cardStyles.cardCover} source={{ uri: item.Thumbnail }} />
                  <Card.Content style={cardStyles.cardContent}>
                    <Title style={cardStyles.cardCaption} numberOfLines={1} ellipsizeMode="tail">
                      {item.caption}
                    </Title>
                    <Paragraph style={cardStyles.cardPosted} numberOfLines={1} ellipsizeMode="tail">
                      {item.postedBy}
                    </Paragraph>
                  </Card.Content>
                </Card>
              ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default MyQA;
