import { Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  const version = Number(Platform.Version);
  
  let permission: Permission;
  if (version >= 33) {
    permission = PERMISSIONS.ANDROID.READ_MEDIA_AUDIO;
  } else {
    permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  }

  const result = await check(permission);

  if (result === RESULTS.GRANTED) {
    return true;
  }

  if (result === RESULTS.DENIED) {
    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  }

  if (result === RESULTS.BLOCKED) {
    Alert.alert(
      'Permission Required',
      'REVERB needs storage access to read your local music files. Please enable it in the app settings.',
      [{ text: 'OK' }]
    );
    return false;
  }

  return false;
};
