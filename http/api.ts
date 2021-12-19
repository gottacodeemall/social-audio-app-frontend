/*eslint node/no-restricted-import: ["error", ["react-native-aws3-upload"]]*/
import { QueryParams } from 'expo-linking';
import {
  AcceptedDiscussionResponse,
  Discussion,
  DiscussionRequest,
  PendingDiscussionResponse,
  Question,
  User,
  Answer,
} from './contracts';
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
  const response = await fetch(baseURL + queryUrl);
  const json = await response.json();
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
  const json = await response.json();
  return json;
};

export const fetchQuestions = async () => {
  const queryUrl = '/dashboard/relevantquestionsforhomepage';
  const response = await fetch(baseURL + queryUrl);
  const json = await response.json();
  return json;
};

export const getQuestion = async (questionId) => {
  const queryUrl = '/question?questionId=' + questionId;
  const response = await fetch(baseURL + queryUrl);
  const json = await response.json();
  return json;
};

export const getAnswer = async (questionId) => {
  const queryUrl = '/answer?questionId=' + questionId;
  const response = await fetch(baseURL + queryUrl);
  const json = await response.json();
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

export const getPendingDiscussions = async (
  loggedInUser: string
): Promise<PendingDiscussionResponse[]> => {
  const parameters: DiscussionRequest = {
    user_id: loggedInUser,
    question_id: '',
  };
  const queryUrl = '/discussion/pending';

  try {
    const response = await fetch(baseURL + queryUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });
    const json = await response.json();
    return json?.data;
  } catch (ex) {
    console.log(ex);
  }

  return [];
};

export const getAcceptedDiscussions = async (
  loggedInUser: string
): Promise<AcceptedDiscussionResponse[]> => {
  const parameters: DiscussionRequest = {
    user_id: loggedInUser,
    question_id: '',
  };
  const queryUrl = '/discussion/accepted';
  try {
    const response = await fetch(baseURL + queryUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });
    const json = await response.json();
    return json?.data;
  } catch (ex) {
    console.log(ex);
  }

  return [];
};

export const discussionAccepted = async (questionId: string, loggedInUser: string) => {
  const parameters: DiscussionRequest = {
    user_id: loggedInUser,
    question_id: questionId,
  };
  const queryUrl = '/discussion/acceptRequest';
  const response = await fetch(baseURL + queryUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  });

  const json = await response.json();
  return json?.success === true;
};

export const saveAnswerApi = async (answer: Answer) => {
  if (answer.audio && answer.audio != '')
    answer.audio = await uploadFileToS3(answer.audio, typeOfFile.Audio);
  const queryUrl = '/answer';
  try {
    return fetch(baseURL + queryUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answer),
    });
  } catch (e) {
    console.log('error at answer api', e);
  }
};

export const requestChat = async (answerId) => {
  const queryUrl = '/discussion/requestchat';
  console.log('reached requestChatApi')
  try {
    return fetch(baseURL + queryUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({answerId: answerId}),
    });
  } catch (e) {
    console.log('error at requestChat api', e);
  }
};

export const getMyQuestions = async (email,status) => {
  const queryUrl = '/question?email=' + email + '&status=' + status;
  const response = await fetch(baseURL + queryUrl);
  const json = await response.json();
  return json;
};

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
  try {
    const response = await RNS3.put(file, options);
    return response?.body?.postResponse?.location ?? '';
  } catch (rejectedValue) {
    alert('Unable to upload files.');
    console.log(rejectedValue);
  }
  return '';
};
