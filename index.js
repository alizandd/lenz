/**
 * @format
 */

import { AppRegistry, I18nManager } from 'react-native';
import App from './src/App';

// Enforce RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);





