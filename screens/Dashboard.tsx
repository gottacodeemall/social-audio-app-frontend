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
import { fetchQuestions } from '../http/api';
import { HomePageCategoryQuestions, Question } from '../http/contracts';
import { spotifyDark, spotifyGreen, textColor } from '../constants/Colors';
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [response, setResponse] = React.useState<HomePageCategoryQuestions[]>([]);
  const [items_category, setItems] = React.useState([]);
  const [trending, setTrending] = React.useState<Question[]>([]);
  const [latest, setLatest] = React.useState<Question[]>([]);
  const [location, setLocation] = React.useState<Question[]>([]);

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
    apitesting();
  }, []);

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
                  <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
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
                  <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
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
                  <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
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
            </ScrollView>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default MyComponent;
