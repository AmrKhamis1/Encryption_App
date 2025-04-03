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
} from "react-native";

export default function CCracker({ navigation }) {
  const [ciphertext, setCiphertext] = useState("");
  const [key, setKey] = useState("3");
  const [useKey, setUseKey] = useState(true);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // English letter frequency data
  const ENGLISH_FREQUENCIES = {
    E: 0.1202,
    T: 0.091,
    A: 0.0812,
    O: 0.0768,
    I: 0.0731,
    N: 0.0695,
    S: 0.0628,
    R: 0.0602,
    H: 0.0592,
    D: 0.0432,
    L: 0.0398,
    U: 0.0288,
    C: 0.0271,
    M: 0.0261,
    F: 0.023,
    Y: 0.0211,
    W: 0.0209,
    G: 0.0203,
    P: 0.0182,
    B: 0.0149,
    V: 0.0111,
    K: 0.0069,
    X: 0.0017,
    Q: 0.0011,
    J: 0.001,
    Z: 0.0007,
  };

  // Decrypt Caesar cipher with a given shift
  const decryptWithShift = (text, shift) => {
    if (shift === null || shift === undefined) return text;

    // Ensure shift is a number between 0-25
    const numericShift = parseInt(shift) % 26;
    if (isNaN(numericShift)) return text;

    let result = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char.match(/[a-z]/i)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;

        // Decrypt: (charCode - shift + 26) % 26
        let decryptedCode = (charCode - numericShift + 26) % 26;
        let decryptedChar = String.fromCharCode(decryptedCode + 65);

        if (!isUpperCase) {
          decryptedChar = decryptedChar.toLowerCase();
        }

        result += decryptedChar;
      } else {
        result += char;
      }
    }

    return result;
  };

  // Calculate letter frequencies in a string
  const getFrequencies = (text) => {
    const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
    const frequencies = {};
    let total = cleanText.length;

    if (total === 0) return {};

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    // Convert to relative frequencies
    for (const letter in frequencies) {
      frequencies[letter] /= total;
    }

    return frequencies;
  };

  // Calculate chi-squared statistic between observed and expected frequencies
  const calculateChiSquared = (frequencies) => {
    let chiSquared = 0;

    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      const observed = frequencies[letter] || 0;
      const expected = ENGLISH_FREQUENCIES[letter] || 0;
      // Avoid division by zero
      if (expected > 0) {
        chiSquared += Math.pow(observed - expected, 2) / expected;
      }
    }

    return chiSquared;
  };

  // Calculate a score for how likely a text is to be English
  const scoreEnglishText = (text) => {
    // Common English word fragments to check for
    const commonPatterns = [
      "the",
      "and",
      "ing",
      "ent",
      "ion",
      "to",
      "ed",
      "is",
      "it",
      "in",
      "at",
      "es",
      "re",
      "on",
      "an",
      "er",
      "nd",
      "as",
      "or",
      "ar",
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    // Check for common patterns
    for (const pattern of commonPatterns) {
      const regex = new RegExp(pattern, "g");
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    // Check for space frequency (English has spaces roughly every 5 characters)
    const spaceCount = (text.match(/ /g) || []).length;
    if (text.length > 0) {
      const spaceRatio = spaceCount / text.length;
      // Ideal space ratio in English is around 0.15-0.20
      if (spaceRatio > 0.1 && spaceRatio < 0.25) {
        score += 10;
      }
    }

    return score;
  };

  // Brute force all possible shifts
  const bruteForceAttack = () => {
    setIsLoading(true);

    // Processing will be done asynchronously
    setTimeout(() => {
      try {
        if (!ciphertext.trim()) {
          setResult("Please enter valid ciphertext");
          setIsLoading(false);
          return;
        }

        const results = [];

        // Try all possible shifts (0-25)
        for (let shift = 0; shift < 26; shift++) {
          const decrypted = decryptWithShift(ciphertext, shift);
          const frequencies = getFrequencies(decrypted);
          const chiSquared = calculateChiSquared(frequencies);
          const score = scoreEnglishText(decrypted);

          results.push({
            shift,
            chiSquared,
            score,
            preview:
              decrypted.substring(0, 100) +
              (decrypted.length > 100 ? "..." : ""),
            fullText: decrypted,
          });
        }

        // Sort by score (higher is better)
        results.sort((a, b) => b.score - a.score);

        // Also sort by chi-squared for linguistic match (lower is better)
        const chiSquaredResults = [...results].sort(
          (a, b) => a.chiSquared - b.chiSquared
        );

        // Format results for display
        let resultText =
          "Top 5 Possible Shifts (Ranked by Common Patterns):\n\n";

        for (let i = 0; i < Math.min(5, results.length); i++) {
          const result = results[i];
          resultText += `#${i + 1}: Shift: ${
            result.shift
          } (Score: ${result.score.toFixed(
            2
          )}, Chi²: ${result.chiSquared.toFixed(2)})\n`;
          resultText += `Preview: ${result.preview}\n\n`;
        }

        resultText += "Top 3 Possible Shifts (Ranked by Letter Frequency):\n\n";

        for (let i = 0; i < Math.min(3, chiSquaredResults.length); i++) {
          const result = chiSquaredResults[i];
          resultText += `#${i + 1}: Shift: ${
            result.shift
          } (Chi²: ${result.chiSquared.toFixed(
            2
          )}, Score: ${result.score.toFixed(2)})\n`;
          resultText += `Preview: ${result.preview}\n\n`;
        }

        // Show the full decryption of the top result
        const bestShift = results[0].shift;
        resultText += `\nFull decryption of best match (Shift: ${bestShift}):\n${results[0].fullText}`;

        setResult(resultText);
      } catch (error) {
        setResult(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  // Crack with the provided key or brute force
  const crackCipher = () => {
    if (!ciphertext) {
      setResult("Please enter ciphertext to decrypt");
      return;
    }

    if (useKey) {
      if (!key || isNaN(parseInt(key))) {
        setResult("Please enter a valid numeric key");
        return;
      }

      const decrypted = decryptWithShift(ciphertext, key);
      setResult(`Decrypted text with shift ${key}:\n${decrypted}`);
    } else {
      bruteForceAttack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Caesar Cipher Cracker</Text>

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
            <Text style={styles.label}>Use Known Shift</Text>
            <Switch
              value={useKey}
              onValueChange={setUseKey}
              trackColor={{ false: "#555", true: "#BB86FC" }}
              thumbColor={useKey ? "#3700B3" : "#f4f3f4"}
            />
          </View>

          {useKey ? (
            <View>
              <Text style={styles.keyLabel}>Enter Shift Value (0-25)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.keyInput}
                  placeholder="Enter shift value"
                  placeholderTextColor="#666"
                  value={key}
                  onChangeText={setKey}
                  keyboardType="numeric"
                />
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.note}>
                The automatic cracker will try all 26 possible shifts and rank
                them based on statistical analysis and common English patterns.
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
            {useKey ? "DECRYPT WITH SHIFT" : "CRACK CIPHER"}
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
            <Text style={styles.loadingText}>Analyzing cipher text...</Text>
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
