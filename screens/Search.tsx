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
import { fetchQuestions, getQuestionsForSearchQueryApi } from '../http/api';
import { HomePageCategoryQuestions, Question } from '../http/contracts';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { spotifyDark, spotifyGreen, textColor } from '../constants/Colors';

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

const Search = ({ navigation }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const loggedInUser = useSelector((state) => state.generic.loggedInUser);
  const [questions, setQuestions] = useState([]);
  const onChangeSearch = (query: React.SetStateAction<string>) => getQuestionsForSearchQuery(query);
  const [searchQuery, setSearchQuery] = React.useState('');

  const getQuestionsForSearchQuery = async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    if (query == undefined || query == '') {
      setQuestions([]);
    } else {
      const response = await getQuestionsForSearchQueryApi(query);
      setQuestions(response);
    }

    setIsLoading(false);
  };

  return (
    <>
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        autoComplete={true}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ height: '100%' }} lightColor={spotifyDark}>
          {isLoading ? (
            <View style={[cardStyles.loaderContainer]}>
              <ActivityIndicator animating={true} color={spotifyGreen} />
            </View>
          ) : (
            <>
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
        </View>
      </ScrollView>
    </>
  );
};

export default Search;
