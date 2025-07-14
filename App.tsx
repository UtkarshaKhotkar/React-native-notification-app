import React, { useEffect } from 'react';
import { View, Button, Platform, StyleSheet, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';
import messaging, {
  FirebaseMessagingTypes,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

// 📲 FCM Setup Hook
const useFCM = () => {
  useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ FCM Permission granted:', authStatus);
      }
    };

    const getToken = async () => {
      try {
        const token = await messaging().getToken();
        console.log('🔑 FCM Token:', token);
        Alert.alert('FCM Token', token); // Show on screen
      } catch (error) {
        console.error('❌ Error getting FCM token:', error);
      }
    };

    const unsubscribe = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('📩 Foreground message:', remoteMessage);
        PushNotification.localNotification({
          channelId: 'fcm-channel',
          title: remoteMessage.notification?.title || 'New Message',
          message: remoteMessage.notification?.body || 'You have a new notification',
          playSound: true,
          soundName: 'default',
          importance: 'high',
          priority: 'high',
        });
      }
    );

    // Run on mount
    requestPermission();
    getToken();

    return () => unsubscribe(); // Clean up
  }, []);
};

export default function App() {
  useFCM(); // Setup FCM

  useEffect(() => {
    PushNotification.configure({
      onNotification: function (notification: any) {
        console.log('📨 Local Notification:', notification);
      },
      requestPermissions: Platform.OS === 'ios',
    });

    PushNotification.createChannel(
      {
        channelId: 'fcm-channel',
        channelName: 'FCM Channel',
      },
      (created: boolean) =>
        console.log(`📻 Channel '${created ? 'created' : 'already exists'}'`)
    );
  }, []);

  const triggerNotification = () => {
    PushNotification.localNotification({
      channelId: 'fcm-channel',
      title: 'Manual Test Notification',
      message: 'This simulates a WhatsApp-style push',
      playSound: true,
      soundName: 'default',
      importance: 'max',
      priority: 'high',
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Simulate WhatsApp Push" onPress={triggerNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
