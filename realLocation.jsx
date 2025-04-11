//expo install expo-location expo-task-manager react-native-maps react-native-gesture-handler react-native-reanimated react-native-screens

// app.json     ---->      "android": {
//   "config": {
//     "googleMaps": {
//       "apiKey": "YOUR_API_KEY"
//     }
//   }
// }

// app.json     ---->   "ios": {
//   "config": {
//     "googleMapsApiKey": "YOUR_API_KEY"
//   }
// }

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Button,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const LOCATION_TASK_NAME = "background-location-task";

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error("Location tasks error:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    const latestLocation = locations[0];
    Location.EventEmitter.emit("updateLocation", {
      coords: latestLocation.coords,
      timestamp: new Date().toLocaleTimeString(),
    });
  }
});

export default function App() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationUpdates, setLocationUpdates] = useState([
    {
      lat: "0.000000",
      lng: "0.000000",
      time: "--:--:--",
    },
  ]);

  useEffect(() => {
    checkPermissions();

    // Set up listener for location updates
    const subscription = Location.EventEmitter.addListener(
      "updateLocation",
      ({ coords, timestamp }) => {
        setLocation(coords);
        fetchAddress(coords.latitude, coords.longitude);
        setLocationUpdates((prev) => [
          {
            lat: coords.latitude.toFixed(6),
            lng: coords.longitude.toFixed(6),
            time: timestamp,
          },
          ...prev.slice(0, 9), // Keep last 10 updates
        ]);
      }
    );

    return () => subscription.remove();
  }, []);

  const checkPermissions = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Foreground location permission denied");
        return;
      }

      if (Platform.OS === "android") {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== "granted") {
          setErrorMsg("Background location permission denied");
        }
      }

      await getCurrentLocation();
    } catch (error) {
      console.error("Permission error:", error);
      setErrorMsg("Error requesting permissions");
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(location.coords);
      await fetchAddress(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error("Location error:", error);
      setErrorMsg("Error getting location");
    }
  };

  const startLocationTracking = async () => {
    try {
      if (!location) {
        setErrorMsg("No current location available");
        return;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 5000,
        foregroundService: {
          notificationTitle: "Location Tracking",
          notificationBody: `Latitude: ${location.latitude.toFixed(6)}`,
          notificationColor: "#ff0000",
        },
        showsBackgroundLocationIndicator: true,
      });
      setIsTracking(true);
    } catch (error) {
      console.error("Tracking error:", error);
      setErrorMsg("Failed to start tracking: " + error.message);
    }
  };

  const stopLocationTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
    } catch (error) {
      console.error("Stop tracking error:", error);
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`
      );
      const data = await response.json();
      if (data.status === "OK") {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("Address not available");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress("Error fetching address");
    }
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : location ? (
        <>
          <Text style={styles.address}>{address}</Text>
          <Text style={styles.coordinates}>
            Current: Lat: {location.latitude.toFixed(6)}, Lng:{" "}
            {location.longitude.toFixed(6)}
          </Text>

          <View style={styles.buttonContainer}>
            {!isTracking ? (
              <Button
                title="Start 5-sec Tracking"
                onPress={startLocationTracking}
              />
            ) : (
              <Button
                title="Stop Tracking"
                onPress={stopLocationTracking}
                color="red"
              />
            )}
          </View>

          {isTracking && (
            <View style={styles.updatesContainer}>
              <Text style={styles.updatesTitle}>
                Live Location Updates (every 5 sec):
              </Text>
              <ScrollView style={styles.updatesScroll}>
                {locationUpdates.map((update, index) => (
                  <View key={index}>
                    <Text style={styles.updateText}>Time: {update.time}</Text>
                    <Text style={styles.updateText}>
                      Lat: {update.lat}, Lng: {update.lng}
                    </Text>
                    {index < locationUpdates.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              description={address}
            />
          </MapView>
        </>
      ) : (
        <Text>Getting location...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  map: {
    width: "100%",
    height: "40%",
    marginTop: 10,
  },
  address: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  coordinates: {
    fontSize: 14,
    marginBottom: 10,
    color: "#444",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  buttonContainer: {
    marginBottom: 15,
  },
  updatesContainer: {
    flex: 1,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    maxHeight: 150,
  },
  updatesTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  updatesScroll: {
    flex: 1,
  },
  updateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 5,
  },
});
