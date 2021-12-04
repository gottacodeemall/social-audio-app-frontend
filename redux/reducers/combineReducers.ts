import { combineReducers } from 'redux';
import { audioReducer } from './audioReducer';
import { genericReducer } from './genericReducer';

export const rootReducer = combineReducers({
  audio: audioReducer,
  generic: genericReducer,
});
