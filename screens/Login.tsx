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

const Stack = createNativeStackNavigator();

function MyStack() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={Login}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };

function Login({navigation}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [response, setResponse] = useState([]);
    const [success, setSucess] = useState<boolean>(true);
    const CallLogin = async () => {
        const responseFromApi = await login(email,password)
        setResponse(responseFromApi)
        setSucess(response.success)
        {success? navigation.navigate('Home') : (true)}
        console.log("Api Response")
        console.log(response)
        console.log(response.success)
    }
    
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
            {success? (<Text></Text>) : (<Text>Invalid Email/Password</Text>)}
        </View>
        <TouchableOpacity style={styles.loginBtn}> 
            <Pressable
              onPress={response => CallLogin()}
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
                    onPress={() => navigation.navigate("Signup")}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                    })}
                    >
                    <Text style={{ color: '#5D3EA8'}}>Sign Up</Text>
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
    borderColor: "#AEACAB",
    borderWidth: 1,
    width: "70%",
    height: 45,
    marginBottom: 20,
    alignItems: "center",
  },
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 20,
    alignItems: "center"
  },
  loginBtn: {
    width: "70%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: "#5D3EA8",
  },
  signup: {
    marginTop: 50
  }
});

export default Login;