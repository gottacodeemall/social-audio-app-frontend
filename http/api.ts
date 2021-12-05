/*eslint node/no-restricted-import: ["error", ["react-native-aws3-upload"]]*/
import { QueryParams } from 'expo-linking';
import { Discussion, Question, User } from './contracts';
import { http } from './http';
import { RNS3, File, Options } from 'react-native-aws3';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const baseURL = 'https://74pataqajg.execute-api.us-east-1.amazonaws.com/test';

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await http.get<User[]>('/users');
  return data;
};

export const login = async (email, password) => {
  const queryUrl = '/login?email=' + email + '&' + 'password=' + password;
  // console.log(baseURL + queryUrl);
  // const { data } = await http.get(queryUrl);
  const response = await fetch(baseURL + queryUrl);
  // console.log((await response.json()));
  const json = await response.json();
  // console.log(json)
  return json;
};

export const signup = async (
  email,
  password,
  firstName,
  lastName,
  age,
  gender,
  ethnicity,
  intro,
  phoneNumber
) => {
  const queryUrl = '/signup';
  // console.log(baseURL + queryUrl);
  // const { data } = await http.get(queryUrl);
  const response = await fetch(baseURL + queryUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
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
      phoneNumber: phoneNumber,
    }),
  });
  // console.log((await response.json()));
  const json = await response.json();
  // console.log(json)
  return json;
};

export const fetchQuestions = async () => {
  const queryUrl = '/dashboard/relevantquestionsforhomepage';
  // console.log(baseURL + queryUrl);
  // const { data } = await http.get(queryUrl);
  const response = await fetch(baseURL + queryUrl);

  // console.log((await response.json()));
  const json = await response.json();
  // console.log(json)
  return json;
};

export const saveQuestionApi = async (question: Question) => {
  if (question.Thumbnail && question.Thumbnail != '')
    question.Thumbnail = await uploadFileToS3(question.Thumbnail, typeOfFile.Image);
  if (question.audio && question.audio != '')
    question.audio = await uploadFileToS3(question.audio, typeOfFile.Audio);

  const queryUrl = '/question';
  const response = await fetch(baseURL + queryUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  });
};

export const getPendingDiscussions = async (loggedInUser: string): Promise<Discussion[]> => {
  return [];
};

export const getAcceptedDiscussions = async (loggedInUser: string): Promise<Discussion[]> => {
  return [];
};

export const discussionAccepted = async (answerId: string) => {};

export enum typeOfFile {
  Audio,
  Image,
}

const getPrefix = (objectType: typeOfFile) => {
  if (objectType == typeOfFile.Audio) return 'audio/';
  else if (objectType == typeOfFile.Image) return 'images/';
  else {
    console.log('error', objectType);
  }
};

const getFileType = (objectType: typeOfFile) => {
  if (objectType == typeOfFile.Audio) return 'audio/mp4';
  else if (objectType == typeOfFile.Image) return 'image/jpeg';
  else {
    console.log('error', objectType);
  }
};
// Upload to S3
const uploadFileToS3 = async (fileUri: string, objectType: typeOfFile): Promise<string> => {
  let fileType = fileUri.substring(fileUri.lastIndexOf('.') + 1);

  const file: File = {
    uri: fileUri,
    name: uuidv4() + '.' + fileType,
    type: getFileType(objectType) ?? '',
  };

  const options: Options = {
    keyPrefix: getPrefix(objectType),
    bucket: 'ccbd-social-audioapp',
    region: 'us-east-1',
    accessKey: 'AKIASA7M4MP6CINAQDGA',
    secretKey: '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',
    successActionStatus: 201,
  };
  console.log(file, options);
  try {
    const response = await RNS3.put(file, options);
    return response?.body?.postResponse?.location ?? '';
  } catch (rejectedValue) {
    alert('Unable to upload files.');
    console.log(rejectedValue);
  }
  return '';
};
