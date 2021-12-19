import * as React from 'react';
import { Avatar, Button, Card, Title, Paragraph, Searchbar } from 'react-native-paper';
import { Text, View } from '../components/Themed';
import { ScrollView, StyleSheet } from 'react-native';
import * as reactNativePaper from 'react-native-paper';
import { fetchQuestions, getMyQuestions } from '../http/api';
import { Item } from 'react-native-paper/lib/typescript/components/List/List';
import { white } from 'react-native-paper/lib/typescript/styles/colors';
import { HomePageCategoryQuestions, Question } from '../http/contracts';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// import { Searchbar } from 'react-native-paper';
// const LeftContent = props => <Avatar.Icon {...props} icon="folder" />

const draftScreen = 'draft', postedScreen = 'posted' , answeredScreen = 'answered';

const cardStyles = StyleSheet.create({
  container: {
    display: 'flex',
    height: 100,
    width: 20,
    alignItems: 'flex-start',
    padding: 30,
    borderRadius: 20,
  },
  card: {
    width: 200,
    height: 200,
    margin: 10,
    padding: 0,
    overflow: 'scroll',
    borderWidth: 2,
  },
  cardCover: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    borderWidth: 1,
  },
  cardCaption: {
    fontSize: 10,
    fontWeight: '500',
    padding: 0,
  },
  cardPosted: {
    fontSize: 10,
    padding: 0,
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    height: 40,
    alignSelf: 'center',
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
      const response = await getMyQuestions(loggedInUser,currentScreen);
      setQuestions(response)
      setIsLoading(false);
    }
    getquestions();
  }, [currentScreen]);

  const switchScreens = (screen: string) => {
    setCurrentScreen(screen);
  };

  return (
    <View style={{ backgroundColor: 'white', height: '100%' }}>
      {isLoading ? (
        <Text>'Is Loading'</Text>
      ) : (
        <>
          <View style={cardStyles.buttonsContainer}>
            <reactNativePaper.Button disabled={currentScreen == draftScreen} onPress={() => switchScreens(draftScreen)}>
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
          <ScrollView horizontal={false}>
          {questions &&
            questions.map((item) => ( 
              <Card
                key={item.questionId}
                style={cardStyles.card}
                onPress={() =>
                  navigation.navigate('QuestionAnswer', { questionId: item.questionId })
                }
              >
                <Card.Content>
                  <Title style={cardStyles.cardCaption}>{item.caption}</Title>
                  <Paragraph style={cardStyles.cardPosted}>{item.postedBy}</Paragraph>
                </Card.Content>
                <Card.Cover style={cardStyles.cardCover} source={{ uri: item.Thumbnail }} />
              </Card>
            ))}
          </ScrollView>          
        </>
      )}
    </View>
  );
};

export default MyQA;
