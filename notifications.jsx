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
export async function registerForPushNotifications() {
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
export async function scheduleTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification!",
      body: "This is a local notification from Expo.",
      data: { url: "https://expo.dev" }, // Optional deep link
    },
    trigger: { seconds: 2 }, // Show after 2 seconds
  });
}
