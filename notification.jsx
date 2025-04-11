import React, { useEffect } from "react";
import { Button, View, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configure how notifications appear when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions and get push token
async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn("Must use a physical device for push notifications!");
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") {
      alert("You need to enable notifications for this app!");
      return;
    }
  }

  // Get the push token (for sending notifications later)
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Push Token:", token); // Save this for your server
  return token;
}

// Schedule a local notification (for testing)
async function scheduleTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification!",
      body: "This is a local notification from Expo.",
      data: { url: "https://expo.dev" }, // Optional deep link
    },
    trigger: { seconds: 2 }, // Show after 2 seconds
  });
}

export default function App() {
  useEffect(() => {
    registerForPushNotifications().then(() => {
      console.log("Push token:", token);
      // Send this token to your backend for future push notifications
    });

    // Listen for incoming notifications while the app is open
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        Alert.alert("New Notification!", notification.request.content.body);
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        title="Send Test Notification"
        onPress={scheduleTestNotification}
      />
    </View>
  );
}
