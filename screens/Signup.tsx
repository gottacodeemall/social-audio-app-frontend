import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, Pressable, ScrollView } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { login, signup } from '../http/api';
import { http } from '../http/http';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function Signup({navigation}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [ethnicity, setEthnicity] = useState("");
    const [intro, setIntro] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [response, setResponse] = useState([]);
    const CallSignUp = async () => {
        signup(email,password,firstName,lastName,age,gender,ethnicity,intro,phoneNumber).then((response) => {
            setResponse(response);
            if (response.success) {
              navigation.navigate('Login');
            }
            console.log('Api Response');
            console.log(response);
            console.log(response.success);
          });
        // const responseFromApi = await signup(email,password,firstName,lastName,age,gender,ethnicity,intro,phoneNumber)
        // setResponse(responseFromApi)
        // console.log("Api Response")
        // console.log(response)
        // console.log(response.success)
        // {response.success? navigation.navigate('Login') : (true)}
    }
  return (
    <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
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
        <View style={styles.inputView}>
            <TextInput
                style={styles.TextInput}
                placeholder="First Name"
                onChangeText={(firstName) => setFirstName(firstName)}
            />
        </View>
        <View style={styles.inputView}>
            <TextInput
                style={styles.TextInput}
                placeholder="Last Name"
                onChangeText={(lastName) => setLastName(lastName)}
            />
        </View>
        <View style={styles.inputView}>
            <TextInput
                style={styles.TextInput}
                placeholder="Age"
                onChangeText={(age) => setAge(age)}
            />
        </View>
        <View style={styles.inputView}>
            <TextInput
                style={styles.TextInput}
                placeholder="Gender"
                onChangeText={(gender) => setGender(gender)}
            />
        </View>
        <View style={styles.inputView}>
            <TextInput
                style={styles.TextInput}
                placeholder="Ethnicity"
                onChangeText={(ethnicity) => setEthnicity(ethnicity)}
            />
        </View>
        <View style={styles.inputView}>
            <TextInput
                style={styles.TextInput}
                placeholder="Intro"
                onChangeText={(intro) => setIntro(intro)}
            />
        </View>
        <View style={styles.inputView}>
            <TextInput
                style={styles.TextInput}
                placeholder="Phone Number"
                onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
            />
        </View>
        <TouchableOpacity style={styles.loginBtn}> 
            <Pressable
              onPress={() => CallSignUp()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
            <Text style={{ color: 'white' }}>Sign Up</Text>
            </Pressable>
        </TouchableOpacity>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    width: "100%",
    marginLeft: "30%"
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
