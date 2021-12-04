export const updateState = (action: string, item: any) => ({
  type: action,
  payload: item,
});

export const audioUpdateRecordingURI = 'UPDATE_RECORDING_URI';
