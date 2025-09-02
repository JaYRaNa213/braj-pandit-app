import React from 'react';
import { AppRegistry, Text, View } from 'react-native';

function IncomingCall() {
    return (
        <View>
            <Text>IncomingCall</Text>
        </View>
    );
};

// export default IncomingCall;
AppRegistry.registerComponent('IncomingCall', () => IncomingCall);
