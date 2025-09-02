// Agora configuration settings for user application
export const AGORA_CONFIG = {
  // IMPORTANT: You must use an RTC App ID (NOT a Chat AppKey)
  // Create one at https://console.agora.io/projects > Create > App ID
  APP_ID: '9b8eb3c1d1eb4e35abdb4c9268bd2d16',
  
  // App Certificate (needed for token generation)
  // From Agora Console > Your RTC Project > Project Management > Features > Primary Certificate
  APP_CERTIFICATE: 'c014fc32bfa6428c9043795c1173ed60',
  
  // Viewer settings
  VIEWER_CONFIG: {
    // Default video settings
    video: {
      width: 640,
      height: 360,
      frameRate: 15,
    },
    // Cellular-optimized video
    cellularVideo: {
      width: 480,
      height: 270,
      frameRate: 15,
    }
  }
};

export default AGORA_CONFIG; 