import { combineReducers } from 'redux';
import { audioReducer } from './audioReducer';

export const rootReducer = combineReducers({
  audio: audioReducer,
});
