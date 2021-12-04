import * as React from 'react';
import { Avatar, Button, Card, Title, Paragraph, Searchbar } from 'react-native-paper';
import { Text, View } from '../components/Themed';
import { ScrollView, StyleSheet } from 'react-native';
import { fetchQuestions } from '../http/api';
import { Item } from 'react-native-paper/lib/typescript/components/List/List';
import { white } from 'react-native-paper/lib/typescript/styles/colors';
import { HomePageCategoryQuestions, Question } from '../http/contracts';
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
    height: 100,
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

const MyComponent = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const onChangeSearch = (query: React.SetStateAction<string>) => setSearchQuery(query);
  const [response, setResponse] = React.useState<HomePageCategoryQuestions[]>([]);
  const [items_category, setItems] = React.useState([]);
  const [trending, setTrending] = React.useState<Question[]>([]);
  const [latest, setLatest] = React.useState<Question[]>([]);
  const [location, setLocation] = React.useState<Question[]>([]);

  React.useEffect(() => {
    async function apitesting() {
      setIsLoading(true);
      //console.log('here');
      // React.useEffect
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
  // const items: (
  //   | boolean
  //   | React.ReactChild
  //   | React.ReactFragment
  //   | React.ReactPortal
  //   | null
  //   | undefined
  // )[] = React.useState([]);

  //const elements = ['one', 'two', 'three'];
  //const items: any[] = [];
  // React.useEffect(() => {
  //   for (const val of response.entries()) {
  //     items_category.push(val[1]['homePageCategory']);
  //     // const questions: any[] = [];
  //     // questions.push(val[1]['questions']);
  //     // console.log('hihihih');
  //     // console.log(questions[0]);
  //     for (const q_val of val[1]['questions']) {
  //       // console.log('Testing');
  //       // console.log(q_val['caption']);
  //       items.push(q_val['caption']);
  //       items1.push(q_val['postedBy']);
  //       items2.push(q_val['thumbnailUrl']);
  //     }
  //   }
  //   //   for (const v of val.entries()) {
  //   //     items.push({ v });
  //   //   }
  //   // }
  //   setItems(items_category);
  //   setItems1(items);
  //   setItems2(items1);
  //   setItems3(items2);
  // }, []);

  return (
    <View style={{ backgroundColor: 'white', height: '100%' }}>
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        autoComplete={true}
      />
      {isLoading ? (
        <Text>'Is Loading'</Text>
      ) : (
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
            {/* <View
              style={{
                margin: 10,
                alignContent: 'center',
                flex: 1,
                flexDirection: 'row',
              }}
            > */}
            {trending.map((item) => (
              <Card key={item.caption} style={cardStyles.card}>
                <Card.Content>
                  <Title style={cardStyles.cardCaption}>{item.caption}</Title>
                  <Paragraph style={cardStyles.cardPosted}>{item.postedBy}</Paragraph>
                </Card.Content>
                <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
              </Card>
            ))}
            {/* </View> */}
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
            {/* <View style={{ margin: 10, alignContent: 'center', flex: 1, flexDirection: 'row' }}> */}
            {latest.map((item) => (
              <Card key={item.caption} style={cardStyles.card}>
                <Card.Content>
                  <Title style={cardStyles.cardCaption}>{item.caption}</Title>
                  <Paragraph style={cardStyles.cardPosted}>{item.postedBy}</Paragraph>
                </Card.Content>
                <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
              </Card>
            ))}
            {/* </View> */}
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
            {/* <View style={{ margin: 10, alignContent: 'center', flex: 1, flexDirection: 'row' }}> */}
            {location.map((item) => (
              <Card key={item.caption} style={cardStyles.card}>
                <Card.Content>
                  <Title style={cardStyles.cardCaption}>{item.caption}</Title>
                  <Paragraph style={cardStyles.cardPosted}>{item.postedBy}</Paragraph>
                </Card.Content>
                <Card.Cover style={cardStyles.cardCover} source={{ uri: item.thumbnailUrl }} />
              </Card>
            ))}
            {/* </View> */}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default MyComponent;
