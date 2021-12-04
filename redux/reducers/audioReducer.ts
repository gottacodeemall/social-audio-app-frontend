import { combineReducers } from 'redux';

const INITIAL_STATE = {
  recordingUri: '',
};

export const audioReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case 'UPDATE_RECORDING_URI':
      return { ...state, recordingUri: action.payload };
    default:
      return state;
  }
};
