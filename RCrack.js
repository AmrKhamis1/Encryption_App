import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
} from "react-native";

export default function RailFenceCracker({ navigation }) {
  const [ciphertext, setCiphertext] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const decryptRailFence = (text, key) => {
    const n = text.length;
    const rail = Array.from({ length: key }, () => Array(n).fill(""));
    let dirDown = false,
      row = 0,
      col = 0;

    for (let i = 0; i < n; i++) {
      if (row === 0 || row === key - 1) dirDown = !dirDown;
      rail[row][col++] = "*";
      row += dirDown ? 1 : -1;
    }

    let index = 0;
    for (let i = 0; i < key; i++) {
      for (let j = 0; j < n; j++) {
        if (rail[i][j] === "*" && index < n) {
          rail[i][j] = text[index++];
        }
      }
    }

    let result = "";
    row = 0;
    col = 0;
    dirDown = false;

    for (let i = 0; i < n; i++) {
      if (row === 0 || row === key - 1) dirDown = !dirDown;
      result += rail[row][col++];
      row += dirDown ? 1 : -1;
    }
    return result;
  };

  const bruteForceDecrypt = () => {
    setIsLoading(true);
    setTimeout(() => {
      let possibleResults = [];
      for (let key = 2; key <= Math.min(ciphertext.length / 2, 10); key++) {
        possibleResults.push({ key, text: decryptRailFence(ciphertext, key) });
      }
      setResults(possibleResults);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Rail Fence Cipher Cracker</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Enter Ciphertext</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Enter the encrypted text here..."
            placeholderTextColor="#666"
            value={ciphertext}
            onChangeText={setCiphertext}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={bruteForceDecrypt}
          activeOpacity={0.8}
          disabled={isLoading || !ciphertext.trim()}
        >
          <Text style={styles.buttonText}>CRACK CIPHER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>BACK TO ENCRYPTION</Text>
        </TouchableOpacity>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#BB86FC" />
            <Text style={styles.loadingText}>Analyzing cipher text...</Text>
          </View>
        )}

        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.cardTitle}>Possible Decryptions</Text>
            {results.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                Key {result.key}: {result.text}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#BB86FC",
    marginBottom: 20,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#E0E0E0",
    fontWeight: "bold",
  },
  keyLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#B0B0B0",
  },
  textInput: {
    backgroundColor: "#2C2C2C",
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    textAlignVertical: "top",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  inputWrapper: {
    backgroundColor: "#2C2C2C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    marginBottom: 15,
  },
  keyInput: {
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  note: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#BB86FC",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#BB86FC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#BB86FC",
    marginTop: 10,
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#E0E0E0",
  },
  resultContent: {
    backgroundColor: "#252525",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  resultText: {
    fontSize: 14,
    color: "#E0E0E0",
    fontFamily: "monospace",
    lineHeight: 20,
  },
});
