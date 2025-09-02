// import React, { useEffect } from 'react';
// import IncallManager from 'react-native-incall-manager';
// import {
//     StreamVideo,
//     StreamVideoClient,
//     LivestreamPlayer,
// } from '@stream-io/video-react-native-sdk';

// const apiKey = 'm4bd9r5c2y5e';
// const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJAc3RyZWFtLWlvL2Rhc2hib2FyZCIsImlhdCI6MTczNzA5MDI4NywiZXhwIjoxNzM3MTc2Njg3LCJ1c2VyX2lkIjoiIWFub24iLCJyb2xlIjoidmlld2VyIiwiY2FsbF9jaWRzIjpbImxpdmVzdHJlYW06bGl2ZXN0cmVhbV8zOTVlOWZkZi0yZmYxLTRhNGYtOWMzYy02ZDU5MjQ1MTAwY2UiXX0.B-gUfTGjo7qNnjLCrZBmqWhTHCig4Nw5ECfQYwM1fhc';
// const user = { type: 'anonymous' };
// const callId = 'livestream_395e9fdf-2ff1-4a4f-9c3c-6d59245100ce';

// const client = new StreamVideoClient({ apiKey, user, token });

// const LiveStreaming = () => {

//     useEffect(() => {
//         IncallManager.start({ media: 'video' });
//         return () => IncallManager.stop();
//     }, []);
//     return (
//         <StreamVideo client={client}>
//             <LivestreamPlayer callType="livestream" callId={callId} />
//         </StreamVideo>
//     );
// };

// export default LiveStreaming;
