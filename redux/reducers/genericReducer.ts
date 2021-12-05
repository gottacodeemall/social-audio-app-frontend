import { combineReducers } from 'redux';

const INITIAL_STATE = {
  loggedInUser: '',
};

export const genericReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case 'UPDATE_USER_ISLOGGEDIN':
      return { ...state, loggedInUser: action.payload };
    default:
      return state;
  }
};
