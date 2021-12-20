import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { login, signup } from '../http/api';
import { http } from '../http/http';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from './Signup';
import { ApiResponse } from '../http/contracts';
import { useDispatch, useSelector } from 'react-redux';
import { updateIsUserLoggedIn, updateState } from '../redux/actions';
import { spotifyDark, spotifyGreen, textColor } from '../constants/Colors';

const Stack = createNativeStackNavigator();

function Login({ navigation }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState([]);
  const [success, setSucess] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const CallLogin = async () => {
    setIsLoading(true);
    login(email, password).then((response) => {
      setIsLoading(false);
      setResponse(response);
      setSucess(response.success);
      if (response.success) {
        dispatch(updateState(updateIsUserLoggedIn, email));
        navigation.navigate('Home');
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Email"
          onChangeText={(email) => setEmail(email)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
      </View>
      <View>
        {success ? <Text></Text> : <Text style={styles.textColor}>Invalid Email/Password</Text>}
      </View>
      {isLoading ? (
        <ActivityIndicator animating={true} color={spotifyGreen} />
      ) : (
        <TouchableOpacity style={styles.loginBtn}>
          <Pressable
            onPress={(response) => CallLogin()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Text style={styles.loginTextInput}>Login</Text>
          </Pressable>
        </TouchableOpacity>
      )}

      <View style={styles.signup}>
        <Text>
          <Text style={styles.textColor}>Don't have an account? </Text>
          <Pressable
            onPress={() => navigation.navigate('Signup')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Text style={{ color: spotifyGreen }}>Sign Up</Text>
          </Pressable>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: spotifyDark,
  },
  inputView: {
    borderColor: '#AEACAB',
    borderWidth: 1,
    width: '70%',
    height: 45,
    marginBottom: 20,
    alignItems: 'center',
    borderRadius: 10,
  },
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 5,
    alignItems: 'center',
    borderRadius: 10,
    width: '100%',
    color: spotifyDark,
  },
  loginBtn: {
    width: '70%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: spotifyGreen,
    borderRadius: 10,
  },
  signup: {
    marginTop: 50,
    backgroundColor: spotifyDark,
    color: textColor,
  },
  textColor: {
    color: textColor,
    backgroundColor: spotifyDark,
  },
  loginTextInput: {
    color: textColor,
    width: '100%',
  },
});

export default Login;
