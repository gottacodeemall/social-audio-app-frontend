import * as React from 'react';
import { Avatar, Button, Card, Title, Paragraph, Searchbar } from 'react-native-paper';
import { Text, View } from '../components/Themed';
import { ScrollView, StyleSheet } from 'react-native';
import { fetchQuestions } from '../http/api';
import * as reactNativePaper from 'react-native-paper';
import { Item } from 'react-native-paper/lib/typescript/components/List/List';
import { white } from 'react-native-paper/lib/typescript/styles/colors';
import { HomePageCategoryQuestions, Question } from '../http/contracts';
import { useSelector } from 'react-redux';
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
});

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    height: 40,
    alignSelf: 'center',
  },
});
const MyComponent = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const onChangeSearch = (query: React.SetStateAction<string>) => setSearchQuery(query);
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
            setforyou(category.questions);
          }
        });
      });
    }
    apitesting();
  }, []);
  const HomeScreen = 'Home',
    ForYouScreenn = 'ForYou';
  const switchScreens = () => {
    if (currentScreen == HomeScreen) {
      setCurrentScreen(ForYouScreenn);
    } else {
      setCurrentScreen(HomeScreen);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: 'white', height: '100%' }}>
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        autoComplete={true}
      />
      <>
        {loggedInUser ? (
          <View style={styles.buttonsContainer}>
            <reactNativePaper.Button disabled={currentScreen == HomeScreen} onPress={switchScreens}>
              Home
            </reactNativePaper.Button>
            <reactNativePaper.Button
              disabled={currentScreen === ForYouScreenn}
              onPress={switchScreens}
            >
              For You
            </reactNativePaper.Button>
          </View>
        ) : (
          <></>
        )}
      </>
      {isLoading ? (
        <Text>'Is Loading'</Text>
      ) : (
        <>
          {currentScreen == 'Home' ? (
            <>
              <Text
                style={{
                  marginTop: 10,
                  fontWeight: 'bold',
                  color: 'black',
                  textAlign: 'center',
                  fontSize: 20,
                }}
              >
                Trending
              </Text>
              <ScrollView horizontal={true}>
                {trending.map((item) => (
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
                    <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
                  </Card>
                ))}
              </ScrollView>

              <Text
                style={{
                  marginTop: 10,
                  fontWeight: 'bold',
                  color: 'black',
                  textAlign: 'center',
                  fontSize: 20,
                }}
              >
                Latest
              </Text>
              <ScrollView horizontal={true}>
                {latest.map((item) => (
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
                    <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
                  </Card>
                ))}
              </ScrollView>

              <Text
                style={{
                  marginTop: 10,
                  fontWeight: 'bold',
                  color: 'black',
                  textAlign: 'center',
                  fontSize: 20,
                }}
              >
                Location
              </Text>
              <ScrollView horizontal={true}>
                {location.map((item) => (
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
                    <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
                  </Card>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <ScrollView horizontal={true}>
                {foryou.map((item) => (
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
                    <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
                  </Card>
                ))}
              </ScrollView>

              <ScrollView horizontal={true}>
                {foryou.map((item) => (
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
                    <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
                  </Card>
                ))}
              </ScrollView>

              <ScrollView horizontal={true}>
                {foryou.map((item) => (
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
                    <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
                  </Card>
                ))}
              </ScrollView>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default MyComponent;
