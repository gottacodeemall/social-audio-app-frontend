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
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  ColorSchemeName,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Text, View } from '../components/Themed';
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
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import QuestionAnswer from '../screens/QuestionAnswer';
const val = 0;
import QuestionScreen from '../screens/QuestionScreen';
import DiscussionScreen from '../screens/DiscussionScreen';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputView: {
    borderColor: '#AEACAB',
    borderWidth: 1,
    width: '70%',
    height: 45,
    marginBottom: 20,
    alignItems: 'center',
  },
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 20,
    alignItems: 'center',
  },
  loginBtn: {
    width: '70%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    margin: 50,
    backgroundColor: '#5D3EA8',
  },
});

export default function Navigation(
  { colorScheme }: { colorScheme: ColorSchemeName },
  { navigation }
) {
  const loggedInUser = useSelector((state) => state.generic.loggedInUser);
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      {/* const loggedInUser = useSelector(state => ) */}
      {loggedInUser != '' ? (
        <RootNavigator />
      ) : (
        <>
          <RootNavigator1 />
          {/* <TouchableOpacity style={styles.loginBtn}>
            <Pressable
              onPress={() => navigation.navigate('Home')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Text style={{ color: 'white' }}>Login</Text>
            </Pressable>
          </TouchableOpacity> */}
        </>
      )}
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
      <Stack.Screen name="Question" component={QuestionScreen} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="QuestionAnswer" component={QuestionAnswer} />
      <Stack.Screen name="Record" component={AudioRecorder} />
    </Stack.Navigator>
  );
}

const Stack1 = createNativeStackNavigator();

function RootNavigator1() {
  return (
    <Stack1.Navigator>
      <Stack1.Screen name="Root" component={BottomTabNavigator1} options={{ headerShown: false }} />
      <Stack1.Screen name="Home" component={Dashboard} />
      <Stack1.Screen name="Login" component={Login} />
      <Stack.Screen name="QuestionAnswer" component={QuestionAnswer} />
    </Stack1.Navigator>
  );
}

const BottomTab1 = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator1() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab1.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
    >
      <BottomTab1.Screen
        name="Home"
        component={Dashboard}
        options={({ navigation }: RootTabScreenProps<'Home'>) => ({
          title: 'Home',
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
        })}
      />

      <BottomTab1.Screen
        name="Login"
        component={Login}
        options={({ navigation }: RootTabScreenProps<'Login'>) => ({
          title: 'Login',
          tabBarIcon: ({ color }) => <AntDesign name="login" size={24} color={color} />,
        })}
      />
    </BottomTab1.Navigator>
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
        children={() => <AudioRecorder />}
        options={{
          title: 'Ask Question',
          tabBarIcon: ({ color }) => <FontAwesome name="microphone" size={24} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Discussion"
        component={DiscussionScreen}
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
