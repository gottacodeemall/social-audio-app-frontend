import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native';

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

const Stack = createNativeStackNavigator();

function Login({ navigation }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState([]);
  const [success, setSucess] = useState<boolean>(true);
  const CallLogin = async () => {
    login(email, password).then((response) => {
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
      <View>{success ? <Text></Text> : <Text>Invalid Email/Password</Text>}</View>
      <TouchableOpacity style={styles.loginBtn}>
        <Pressable
          onPress={(response) => CallLogin()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Text style={{ color: 'white' }}>Login</Text>
        </Pressable>
      </TouchableOpacity>
      <View style={styles.signup}>
        <Text>
          <Text>Don't have an account? </Text>
          <Pressable
            onPress={() => navigation.navigate('Signup')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Text style={{ color: '#5D3EA8' }}>Sign Up</Text>
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
    marginTop: 40,
    backgroundColor: '#5D3EA8',
  },
  signup: {
    marginTop: 50,
  },
});

export default Login;
