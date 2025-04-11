import { Text, View, StyleSheet } from "react-native";

export default function PropertyListHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.headingText}>Properties List</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headingText: {
    fontSize: 30,
    fontWeight: "bold",
    padding: 10,
    paddingBottom: 20,
  },
});
