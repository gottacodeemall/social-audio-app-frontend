/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome, Octicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import AudioRecorder from '../components/audioRecorder/AudioRecorder';
import Dashboard from '../screens/Dashboard';
import Question from '../screens/Question';
import Login from '../screens/Login';
import Signup from '../screens/Signup';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
      <Stack.Screen name="Question" component={Question} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={Dashboard}
        options={({ navigation }: RootTabScreenProps<'Home'>) => ({
          title: 'Home',
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
        })}
      />
      <BottomTab.Screen
        name="QA"
        component={TabTwoScreen}
        options={{
          title: 'Q/A',
          tabBarIcon: ({ color }) => <AntDesign name="question" size={24} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Record"
        children={() => <AudioRecorder postSaveRedirection={'Question'} />}
        options={{
          title: 'Ask Question',
          tabBarIcon: ({ color }) => <FontAwesome name="microphone" size={24} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Discussion"
        component={Signup}
        options={{
          title: 'Discussions',
          tabBarIcon: ({ color }) => <Octicons name="comment-discussion" size={24} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={Login}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <AntDesign name="user" size={24} color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}
