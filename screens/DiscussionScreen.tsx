import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import * as reactNativePaper from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Discussion, Question } from '../http/contracts';
import 'react-native-get-random-values';
import { Text } from 'react-native';

import { View } from '../components/Themed';
import { getAcceptedDiscussions, getPendingDiscussions, saveQuestionApi } from '../http/api';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#EEEEEE';

const pendingScreen = 'pending',
  acceptedScreen = 'accepted';

export default function DiscussionScreen() {
  const loggedInUser = useSelector((state) => state.generic.loggedInUser);
  const [currentScreen, setCurrentScreen] = useState<string>('pending');
  const [pendingItems, setPendingItems] = useState<Discussion[]>([]);
  const [acceptedItems, setAcceptedItems] = useState<Discussion[]>([]);

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
  }, [currentScreen]);

  const switchScreens = () => {
    if (currentScreen == pendingScreen) {
      setCurrentScreen(acceptedScreen);
    } else {
      setCurrentScreen(pendingScreen);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.buttonsContainer}>
        <reactNativePaper.Button
          disabled={currentScreen === pendingScreen}
          onPress={() => switchScreens()}
        >
          Pending
        </reactNativePaper.Button>
        <reactNativePaper.Button
          disabled={currentScreen === acceptedScreen}
          onPress={() => switchScreens()}
        >
          Accepted
        </reactNativePaper.Button>
      </View>
      {currentScreen == 'pending' ? <PendingDiscussion /> : <AcceptedDiscussion />}
    </View>
  );
}

const PendingDiscussion = () => {
  return (
    <>
      <Text>Pending</Text>
    </>
  );
};

const AcceptedDiscussion = () => {
  return (
    <>
      <Text>Bye</Text>
    </>
  );
};

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
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 40,
  },
});
