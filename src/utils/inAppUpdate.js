import SpInAppUpdates, {
  IAUUpdateKind,
  IAUInstallStatus,
} from 'sp-react-native-in-app-updates';
import { Platform } from 'react-native';

export const checkForUpdate = async () => {
  const inAppUpdates = new SpInAppUpdates(
    false, // isDebug
  );
  // curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info
  try {
    await inAppUpdates.checkNeedsUpdate().then((result) => {
      try {
        if (result.shouldUpdate) {
          let updateOptions = {};
          if (Platform.OS === 'android') {
            // android only, on iOS the user will be promped to go to your app store page
            updateOptions = {
              updateType: IAUUpdateKind.FLEXIBLE,
            };
          }
          if (Platform.OS === 'ios') {
            updateOptions = {
              title: 'Update available',
              message:
                'There is a new version of the app available on the App Store, do you want to update it?',
              buttonUpgradeText: 'Update',
              buttonCancelText: 'Cancel',
            };
          }
          inAppUpdates.addStatusUpdateListener((downloadStatus) => {
            console.log('download status', downloadStatus);
            if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
              console.log('downloaded');
              inAppUpdates.installUpdate();
              inAppUpdates.removeStatusUpdateListener((finalStatus) => {
                console.log('final status', finalStatus);
              });
            }
          });
          inAppUpdates.startUpdate(updateOptions);
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
