import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import Constants from "expo-constants";

export default function App() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cameraRef = useRef(null);

  const GOOGLE_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        // Request permissions using new API
        const [locationStatus, cameraStatus] = await Promise.all([
          Location.requestForegroundPermissionsAsync(),
          Camera.requestCameraPermissionsAsync(), // Updated method name
        ]);

        if (locationStatus.status !== "granted") {
          setErrorMsg("Location permission denied");
          return;
        }

        setHasCameraPermission(cameraStatus.status === "granted");

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);

        if (GOOGLE_API_KEY) {
          await fetchAddress(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
        } else {
          setAddress("AIzaSyCejdiS11ruW2Cyn25mQ0b7HBELYCfaigY");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setErrorMsg(error.message || "Initialization failed");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      setAddress(
        data.status === "OK"
          ? data.results[0]?.formatted_address
          : "Address not available"
      );
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress("Error fetching address");
    }
  };

  const takeSelfie = async () => {
    if (!cameraRef.current || !hasCameraPermission) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      setPhoto(photo.uri);
    } catch (error) {
      console.error("Camera error:", error);
      setErrorMsg("Failed to capture photo");
    }
  };

  const handleRetry = () => {
    setErrorMsg(null);
    setLocation(null);
    setAddress("");
    setPhoto(null);
    setIsLoading(true);
    useEffect(); // Re-run the effect
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text>Initializing app...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <View style={styles.center}>
          <Text style={styles.error}>{errorMsg}</Text>
          <Button title="Retry" onPress={handleRetry} />
        </View>
      ) : (
        <>
          <Text style={styles.address}>{address || "Fetching address..."}</Text>

          {location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              showsUserLocation={true}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Your Location"
              />
            </MapView>
          )}

          {hasCameraPermission ? (
            <View style={styles.cameraContainer}>
              <Camera
                style={styles.camera}
                ref={cameraRef}
                type={Camera.Constants.Type.front}
                ratio="16:9"
              >
                <View style={styles.buttonContainer}>
                  <Button
                    title="📸 Take Selfie"
                    onPress={takeSelfie}
                    color="white"
                  />
                </View>
              </Camera>
            </View>
          ) : (
            <Text style={styles.error}>Camera permission required</Text>
          )}

          {photo && (
            <Image
              source={{ uri: photo }}
              style={styles.photo}
              resizeMode="contain"
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "40%",
    marginVertical: 10,
    borderRadius: 10,
  },
  address: {
    fontSize: 16,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 10,
    textAlign: "center",
  },
  error: {
    color: "red",
    padding: 10,
    textAlign: "center",
  },
  cameraContainer: {
    height: 250,
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  buttonContainer: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 15,
    alignItems: "center",
  },
  photo: {
    width: "100%",
    height: 300,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
});
