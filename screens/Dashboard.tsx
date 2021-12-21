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
import { fetchQuestions, fetchQuestionsForYou } from '../http/api';
import { spotifyDark, spotifyGreen, textColor } from '../constants/Colors';
import * as reactNativePaper from 'react-native-paper';
import { Item } from 'react-native-paper/lib/typescript/components/List/List';
import { white } from 'react-native-paper/lib/typescript/styles/colors';
import { HomePageCategoryQuestions, Question } from '../http/contracts';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
// import { Searchbar } from 'react-native-paper';
// const LeftContent = props => <Avatar.Icon {...props} icon="folder" />
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
});

const MyComponent = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentScreen, setCurrentScreen] = React.useState<string>('Home');
  const [response, setResponse] = React.useState<HomePageCategoryQuestions[]>([]);
  const [items_category, setItems] = React.useState([]);
  const [trending, setTrending] = React.useState<Question[]>([]);
  const [latest, setLatest] = React.useState<Question[]>([]);
  const [location, setLocation] = React.useState<Question[]>([]);
  const [foryou, setforyou] = React.useState<Question[]>([]);
  const loggedInUser = useSelector((state) => state.generic.loggedInUser);

  React.useEffect(() => {
    async function apitesting() {
      setIsLoading(true);
      fetchQuestions().then((response: HomePageCategoryQuestions[]) => {
        setIsLoading(false);
        setResponse(response);

        response.forEach((category) => {
          if (category.homePageCategory == 'Trending') {
            setTrending(category.questions);
          } else if (category.homePageCategory == 'Latest') {
            setLatest(category.questions);
          } else if (category.homePageCategory == 'Location') {
            setLocation(category.questions);
          }
        });
      });
    }
    if (isFocused) {
      apitesting();
    }
  }, [isFocused]);

  if (loggedInUser) {
    //console.log('hello');
    React.useEffect(() => {
      async function apitesting1() {
        setIsLoading(true);
        //console.log('intest');
        fetchQuestionsForYou(loggedInUser).then((response: HomePageCategoryQuestions[]) => {
          setIsLoading(false);
          setResponse(response);
          //console.log('hello');
          console.log(response);
          response.forEach((category) => {
            if (category.homePageCategory == 'ForYou') {
              setforyou(category.questions);
            }
          });
        });
      }
      if (isFocused) {
        apitesting1();
      }
    }, [isFocused]);
  }

  const HomeScreen = 'Home',
    ForYouScreenn = 'ForYou';
  const switchScreens = () => {
    if (currentScreen == HomeScreen) {
      setCurrentScreen(ForYouScreenn);
    } else {
      setCurrentScreen(HomeScreen);
    }
  };

  const styles = StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: spotifyDark,
    },
    textHeading: {
      marginTop: 10,
      marginLeft: 15,
      fontWeight: 'bold',
      color: textColor,
      textAlign: 'left',
      fontSize: 20,
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ height: '100%' }} lightColor={spotifyDark}>
        {isLoading ? (
          <View style={[styles.loaderContainer]}>
            <ActivityIndicator animating={true} color={spotifyGreen} />
          </View>
        ) : (
          <>
            {loggedInUser ? (
              <View style={styles.buttonsContainer}>
                <Button disabled={currentScreen == HomeScreen} onPress={switchScreens}>
                  Home
                </Button>
                <Button disabled={currentScreen === ForYouScreenn} onPress={switchScreens}>
                  For You
                </Button>
              </View>
            ) : (
              <></>
            )}
            {currentScreen == 'Home' ? (
              <>
                <Text style={styles.textHeading}>Trending</Text>
                <ScrollView horizontal={true}>
                  {trending.map((item) => (
                    <Card
                      key={item.questionId}
                      style={cardStyles.card}
                      onPress={() =>
                        navigation.navigate('QuestionAnswer', { questionId: item.questionId })
                      }
                    >
                      <Card.Cover style={cardStyles.cardCover} source={{ uri: item.Thumbnail }} />
                      <Card.Content style={cardStyles.cardContent}>
                        <Title
                          style={cardStyles.cardCaption}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.caption}
                        </Title>
                        <Paragraph
                          style={cardStyles.cardPosted}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.postedBy}
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  ))}
                </ScrollView>

                <Text style={styles.textHeading}>Latest</Text>
                <ScrollView horizontal={true}>
                  {latest.map((item) => (
                    <Card
                      key={item.questionId}
                      style={cardStyles.card}
                      onPress={() =>
                        navigation.navigate('QuestionAnswer', { questionId: item.questionId })
                      }
                    >
                      <Card.Cover style={cardStyles.cardCover} source={{ uri: item.Thumbnail }} />
                      <Card.Content style={cardStyles.cardContent}>
                        <Title
                          style={cardStyles.cardCaption}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.caption}
                        </Title>
                        <Paragraph
                          style={cardStyles.cardPosted}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.postedBy}
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  ))}
                </ScrollView>

                <Text style={styles.textHeading}>Location</Text>
                <ScrollView horizontal={true}>
                  {location.map((item) => (
                    <Card
                      key={item.questionId}
                      style={cardStyles.card}
                      onPress={() =>
                        navigation.navigate('QuestionAnswer', { questionId: item.questionId })
                      }
                    >
                      <Card.Cover style={cardStyles.cardCover} source={{ uri: item.Thumbnail }} />
                      <Card.Content style={cardStyles.cardContent}>
                        <Title
                          style={cardStyles.cardCaption}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.caption}
                        </Title>
                        <Paragraph
                          style={cardStyles.cardPosted}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.postedBy}
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                {foryou &&
                  foryou.map((item) => (
                    <Card
                      key={item.questionId}
                      style={cardStyles.card}
                      onPress={() =>
                        navigation.navigate('QuestionAnswer', { questionId: item.questionId })
                      }
                    >
                      <Card.Cover style={cardStyles.cardCover} source={{ uri: item.Thumbnail }} />
                      <Card.Content style={cardStyles.cardContent}>
                        <Title
                          style={cardStyles.cardCaption}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.caption}
                        </Title>
                        <Paragraph
                          style={cardStyles.cardPosted}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.postedBy}
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  ))}
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default MyComponent;
