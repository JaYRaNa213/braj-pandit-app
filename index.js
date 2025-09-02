/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import IncomingCall from './src/screens/IncomingCall';

AppRegistry.registerComponent('incoming-call', () => IncomingCall);
AppRegistry.registerComponent(appName, () => App);
