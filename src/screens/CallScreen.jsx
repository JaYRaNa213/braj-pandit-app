import { AppRegistry, Text, View } from 'react-native';

function CallScreen() {
    return (
        <View>
            <Text>A custom component</Text>
        </View>
    );
}

AppRegistry.registerComponent('call-screen', () => CallScreen);
