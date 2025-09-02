// chatScreenState.js
let isChatActive = false;

export const setChatScreenActive = (active) => {
  isChatActive = active;
};

export const isChatScreenActive = () => isChatActive;
