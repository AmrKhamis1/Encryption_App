// CrackerScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Switch,
  Alert,
  Platform,
} from "react-native";

export default function VCracker({ navigation }) {
  const [ciphertext, setCiphertext] = useState("");
  const [key, setKey] = useState("");
  const [useKey, setUseKey] = useState(true);
  const [maxKeyLength, setMaxKeyLength] = useState("10");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [targetRecognition, setTargetRecognition] = useState("90");
  const [maxIterations, setMaxIterations] = useState("35");
  const [useBruteForce, setUseBruteForce] = useState(false);

  // API endpoint - change this to your actual backend URL
  const getApiUrl = () => {
    if (__DEV__) {
      // For Android emulator
      if (Platform.OS === "android" || Platform.OS === "ios") {
        return "http://192.168.1.6:3000/api/vigenere";
      }
      // For iOS simulator
      return "http://localhost:3000/api/vigenere";
    }
    // Production URL (when you deploy your backend)
    return "http://192.168.1.6:3000/api/vigenere";
  };

  const API_URL = getApiUrl();
  // Function to handle API errors
  const handleApiError = (error) => {
    console.error("API Error:", error);
    setResult(`Error: ${error.message || "Failed to connect to the server"}`);
    setIsLoading(false);
  };

  // Function to decrypt with key using API
  const decryptWithKey = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/decrypt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ciphertext,
          key,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(
        `Decrypted text:\n${
          data.decryptedText
        }\n\nRecognition rate: ${data.wordStats?.percentage.toFixed(
          2
        )}%\nWords recognized: ${data.wordStats?.count}/${
          data.wordStats?.total
        }`
      );
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to crack cipher using API
  const crackCipher = async () => {
    if (!ciphertext) {
      setResult("Please enter ciphertext to decrypt");
      return;
    }

    if (useKey) {
      if (!key) {
        setResult("Please enter a key");
        return;
      }
      decryptWithKey();
    } else {
      try {
        setIsLoading(true);
        setResult(
          "Analyzing cipher text... This may take a while depending on parameters."
        );

        const response = await fetch(`${API_URL}/crack`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ciphertext,
            maxKeyLength: parseInt(maxKeyLength),
            targetRecognition: parseInt(targetRecognition),
            maxIterations: parseInt(maxIterations),
            useBruteForce: useBruteForce,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Process and display results
        if (data.topResults && data.topResults.length > 0) {
          const bestKey = data.topResults[0].key;
          setKey(bestKey);

          let resultText = "Top Possible Keys:\n\n";
          data.topResults.forEach((result, index) => {
            resultText += `#${index + 1}: Key: ${result.key} (Length: ${
              result.keyLength
            }, Recognition: ${result.wordStats?.percentage.toFixed(2)}%)\n`;
            resultText += `Preview: ${result.preview}\n\n`;
          });

          resultText += `\nFull decryption of best match (Key: ${bestKey}):\n${data.fullDecryption}`;
          setResult(resultText);
        } else {
          setResult(
            "Could not find any viable keys. Try different ciphertext or adjust parameters."
          );
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Vigenère Cipher Cracker</Text>

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

        <View style={styles.card}>
          <View style={styles.optionRow}>
            <Text style={styles.label}>Use Known Key</Text>
            <Switch
              value={useKey}
              onValueChange={setUseKey}
              trackColor={{ false: "#555", true: "#BB86FC" }}
              thumbColor={useKey ? "#3700B3" : "#f4f3f4"}
            />
          </View>

          {useKey ? (
            <View>
              <Text style={styles.keyLabel}>Enter Key</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.keyInput}
                  placeholder="Enter decryption key"
                  placeholderTextColor="#666"
                  value={key}
                  onChangeText={setKey}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.keyLabel}>Max Key Length</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.keyInput}
                  placeholder="Max key length to try"
                  placeholderTextColor="#666"
                  value={maxKeyLength}
                  onChangeText={setMaxKeyLength}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.keyLabel}>Target Word Recognition (%)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.keyInput}
                  placeholder="Target recognition percentage"
                  placeholderTextColor="#666"
                  value={targetRecognition}
                  onChangeText={setTargetRecognition}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.keyLabel}>Maximum Iterations</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.keyInput}
                  placeholder="Maximum iterations for key refinement"
                  placeholderTextColor="#666"
                  value={maxIterations}
                  onChangeText={setMaxIterations}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.note}>
                Brute force attempts all possible keys. May significantly
                increase processing time.
              </Text>

              <View style={styles.optionRow}>
                <Text style={styles.label}>Enable Brute Force</Text>
                <Switch
                  value={useBruteForce}
                  onValueChange={setUseBruteForce}
                  trackColor={{ false: "#555", true: "#BB86FC" }}
                  thumbColor={useBruteForce ? "#3700B3" : "#f4f3f4"}
                />
              </View>

              <Text style={styles.note}>
                Sends data to a server for processing. Higher parameters may
                take longer to process.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={crackCipher}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {useKey ? "DECRYPT WITH KEY" : "CRACK CIPHER"}
          </Text>
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
            <ActivityIndicator size={20} color="#BB86FC" />
            <Text style={styles.loadingText}>Processing on server...</Text>
          </View>
        )}

        {result ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.cardTitle}>Results</Text>
            <View style={styles.resultContent}>
              <Text style={styles.resultText} selectable>
                {result}
              </Text>
            </View>
          </View>
        ) : null}
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
