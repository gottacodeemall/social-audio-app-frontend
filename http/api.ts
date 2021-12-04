import { QueryParams } from 'expo-linking';
import { User, ApiResponse } from './contracts';
import { http } from './http';

const baseURL = 'https://74pataqajg.execute-api.us-east-1.amazonaws.com/test';

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await http.get<User[]>('/users');
  return data;
};

export const login = async (email,password) => {
  const queryUrl = '/login?email='+email+'&'+'password='+password
  // console.log(baseURL + queryUrl);
  // const { data } = await http.get(queryUrl);
  const response = await fetch(baseURL + queryUrl);
  // console.log((await response.json()));
  const json = await response.json();
  // console.log(json)
  return json;
};

export const signup = async (email,password,firstName,lastName,age,gender,ethnicity,intro,phoneNumber) => {
  const queryUrl = '/signup'
  // console.log(baseURL + queryUrl);
  // const { data } = await http.get(queryUrl);
  const response = await fetch(baseURL + queryUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      age: age,
      sex: gender,
      ethnicity: ethnicity,
      intro: intro,
      phoneNumber: phoneNumber
    })
  });
  // console.log((await response.json()));
  const json = await response.json();
  // console.log(json)
  return json;
};
