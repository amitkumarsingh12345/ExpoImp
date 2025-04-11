import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

export default function PropertyCard({ item }) {
  return (
    <View style={styles.postContainer}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <Image
            source={{ uri: "https://via.placeholder.com/400" }}
            style={styles.image}
          />
        )}
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.title}>RS. {item.price}</Text>
      <Text style={styles.title}>Category: {item.category}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 200, // Fixed height
    overflow: "hidden",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#ddd", // Placeholder background color
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Maintain aspect ratio
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
});
