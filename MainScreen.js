// MainScreen.js
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
  Image,
} from "react-native";
import logo from "./assets/logo1.png";

export default function MainScreen({ navigation }) {
  const [text, setText] = useState("");
  const [caesarKey, setCaesarKey] = useState("3");
  const [vigenereKey, setVigenereKey] = useState("KEY");
  const [railFenceKey, setRailFenceKey] = useState("3");
  const [results, setResults] = useState({
    caesar: "",
    vigenere: "",
    railFence: "",
  });

  // Caesar Cipher implementation
  const caesarCipher = (str, shift) => {
    shift = parseInt(shift) % 26;
    if (shift < 0) shift += 26;

    return str
      .split("")
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          let shiftedCode;

          // Uppercase letters
          if (code >= 65 && code <= 90) {
            shiftedCode = ((code - 65 + shift) % 26) + 65;
          }
          // Lowercase letters
          else if (code >= 97 && code <= 122) {
            shiftedCode = ((code - 97 + shift) % 26) + 97;
          }

          return String.fromCharCode(shiftedCode);
        }
        return char;
      })
      .join("");
  };

  // Vigenère Cipher implementation
  const vigenereCipher = (str, key) => {
    if (!key) return str;

    const upperKey = key.toUpperCase();
    let result = "";
    let keyIndex = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char.match(/[a-z]/i)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const keyChar = upperKey[keyIndex % upperKey.length];
        const keyCode = keyChar.charCodeAt(0) - 65;

        let encryptedCode = (charCode + keyCode) % 26;
        let encryptedChar = String.fromCharCode(encryptedCode + 65);

        if (!isUpperCase) {
          encryptedChar = encryptedChar.toLowerCase();
        }

        result += encryptedChar;
        keyIndex++;
      } else {
        result += char;
      }
    }

    return result;
  };

  // Rail Fence Cipher implementation
  const railFenceCipher = (str, key) => {
    const rails = parseInt(key);
    if (rails <= 1 || rails >= str.length) return str;

    // Create the rail fence pattern
    const fence = Array(rails)
      .fill()
      .map(() => Array(str.length).fill(""));

    let rail = 0;
    let direction = 1; // 1 for down, -1 for up

    // Fill the fence pattern
    for (let i = 0; i < str.length; i++) {
      fence[rail][i] = str[i];

      // Change direction at the top or bottom rails
      if (rail === 0) {
        direction = 1;
      } else if (rail === rails - 1) {
        direction = -1;
      }

      rail += direction;
    }

    // Read off the fence pattern
    let result = "";
    for (let i = 0; i < rails; i++) {
      for (let j = 0; j < str.length; j++) {
        if (fence[i][j] !== "") {
          result += fence[i][j];
        }
      }
    }

    return result;
  };

  const encryptText = () => {
    if (!text) return;

    setResults({
      caesar: caesarCipher(text, caesarKey),
      vigenere: vigenereCipher(text, vigenereKey),
      railFence: railFenceCipher(text, railFenceKey),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.subtitle}>Encryption Tool</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Enter Text</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Type your message here..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Encryption Keys</Text>

          <View style={styles.keyInputGroup}>
            <Text style={styles.keyLabel}>Caesar Shift</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.keyInput}
                keyboardType="numeric"
                value={caesarKey}
                onChangeText={setCaesarKey}
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.keyInputGroup}>
            <Text style={styles.keyLabel}>Vigenère Key</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.keyInput}
                autoCapitalize="characters"
                value={vigenereKey}
                onChangeText={setVigenereKey}
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.keyInputGroup}>
            <Text style={styles.keyLabel}>Rail Fence Rails</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.keyInput}
                keyboardType="numeric"
                value={railFenceKey}
                onChangeText={setRailFenceKey}
                placeholderTextColor="#666"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={encryptText}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>ENCRYPT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.helloButton]}
          onPress={() => navigation.navigate("CCracker")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Caesar Cracker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.helloButton]}
          onPress={() => navigation.navigate("VCracker")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Vigenère Cracker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.helloButton]}
          onPress={() => navigation.navigate("RFCracker")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Rial Fence Cracker</Text>
        </TouchableOpacity>
        {(results.caesar || results.vigenere || results.railFence) && (
          <View style={styles.resultsContainer}>
            <Text style={styles.cardTitle}>Encryption Results</Text>

            <View style={styles.resultBox}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>Caesar Cipher</Text>
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultText} selectable>
                  {results.caesar}
                </Text>
              </View>
            </View>

            <View style={styles.resultBox}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>Vigenère Cipher</Text>
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultText} selectable>
                  {results.vigenere}
                </Text>
              </View>
            </View>

            <View style={styles.resultBox}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>Rail Fence Cipher</Text>
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultText} selectable>
                  {results.railFence}
                </Text>
              </View>
            </View>
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
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#BB86FC",
    marginBottom: 30,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#E0E0E0",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#E0E0E0",
    fontWeight: "bold",
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
  keyInputGroup: {
    marginBottom: 15,
  },
  keyLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#B0B0B0",
  },
  inputWrapper: {
    backgroundColor: "#2C2C2C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  keyInput: {
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
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
  helloButton: {
    backgroundColor: "#2196F3", // Different color for the hello button
  },
  buttonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
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
  resultBox: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  resultHeader: {
    backgroundColor: "#2A2A2A",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#BB86FC",
  },
  resultContent: {
    backgroundColor: "#252525",
    padding: 12,
  },
  resultText: {
    fontSize: 14,
    color: "#E0E0E0",
    fontFamily: "monospace",
  },
});
