import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import * as reactNativePaper from 'react-native-paper';
import { useSelector } from 'react-redux';
import { AcceptedDiscussionResponse, PendingDiscussionResponse } from '../http/contracts';
import 'react-native-get-random-values';

import { View } from '../components/Themed';
import {
  discussionAccepted,
  getAcceptedDiscussions,
  getPendingDiscussions,
  saveQuestionApi,
} from '../http/api';
import { Card, Paragraph, Title } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#EEEEEE';

const pendingScreen = 'pending',
  acceptedScreen = 'accepted';

export default function DiscussionScreen() {
  const [rerender, forcererender] = useState<number>(0);
  const loggedInUser = useSelector((state) => state.generic.loggedInUser);
  const [currentScreen, setCurrentScreen] = useState<string>('pending');
  const [pendingItems, setPendingItems] = useState<PendingDiscussionResponse[]>([]);
  const [acceptedItems, setAcceptedItems] = useState<AcceptedDiscussionResponse[]>([]);

  console.log('items', pendingItems, acceptedItems);

  useEffect(() => {
    const apiCalls = async () => {
      if (currentScreen == acceptedScreen) {
        setPendingItems([]);
        const discussions = await getAcceptedDiscussions(loggedInUser);
        setAcceptedItems(discussions);
      } else {
        const discussions = await getPendingDiscussions(loggedInUser);
        setPendingItems(discussions);
        setAcceptedItems([]);
      }
    };

    apiCalls();
  }, [currentScreen, rerender]);

  const switchScreens = () => {
    if (currentScreen == pendingScreen) {
      setCurrentScreen(acceptedScreen);
    } else {
      setCurrentScreen(pendingScreen);
    }
  };

  const onDiscussionAccepted = (questionId: string) => {
    discussionAccepted(questionId, loggedInUser).then(() => {
      forcererender(rerender + 1);
    });
  };

  const onDiscussionRejected = () => {
    alert('Not Implemented');
  };

  return (
    <ScrollView>
      <View style={styles.buttonsContainer}>
        <reactNativePaper.Button disabled={currentScreen == pendingScreen} onPress={switchScreens}>
          Pending
        </reactNativePaper.Button>
        <reactNativePaper.Button
          disabled={currentScreen === acceptedScreen}
          onPress={switchScreens}
        >
          Accepted
        </reactNativePaper.Button>
      </View>
      <View style={styles.cardContainer}>
        {currentScreen == 'pending'
          ? pendingItems &&
            pendingItems.map((item) => (
              <View key={item.posted_by} style={styles.cardStyle}>
                <View style={styles.cardLeft}>
                  <Title style={styles.title}>{item.caption}</Title>
                  <Paragraph style={styles.paragraph}>{item.posted_by}</Paragraph>
                </View>
                <View style={styles.cardRightButtons}>
                  <TouchableOpacity
                    onPress={() => onDiscussionAccepted(item.question_id)}
                    style={styles.roundButtonLeft}
                  >
                    <FontAwesome name="check" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDiscussionRejected()}
                    style={styles.roundButtonRight}
                  >
                    <FontAwesome name="times" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          : acceptedItems &&
            acceptedItems.map((item) => (
              <View key={item.posted_by} style={styles.cardStyle}>
                <View style={styles.cardLeft}>
                  <Title style={styles.title}>{item.caption}</Title>
                  <Paragraph style={styles.paragraph}>{item.posted_by}</Paragraph>
                </View>
                <View style={styles.cardRight}>
                  <Paragraph style={styles.paragraph}>{item.meeting_info}</Paragraph>
                  <Paragraph style={styles.paragraph}>{item.posted_by}</Paragraph>
                </View>
              </View>
            ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: DEVICE_WIDTH,
    minHeight: DEVICE_HEIGHT,
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    height: 40,
    alignSelf: 'center',
  },
  cardContainer: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: DEVICE_WIDTH,
  },
  cardStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_WIDTH - 30,
    height: 150,
    marginBottom: 20,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_WIDTH / 2.0 - 10,
    height: 100,
    marginRight: 10,
  },
  cardRight: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_WIDTH / 2.0 - 10,
    height: 100,
  },
  cardRightButtons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_WIDTH / 2.0 - 10,
    height: 100,
  },
  title: {},
  paragraph: {},
  roundButtonLeft: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#4A7E12',
    marginRight: 20,
  },
  roundButtonRight: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#BC2706',
  },
});
