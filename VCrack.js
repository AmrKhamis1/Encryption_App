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
} from "react-native";

export default function VCracker({ navigation }) {
  const [ciphertext, setCiphertext] = useState("");
  const [key, setKey] = useState("");
  const [useKey, setUseKey] = useState(true);
  const [maxKeyLength, setMaxKeyLength] = useState("10");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // English letter frequency data (much more accurate than the simple list)
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

  // Calculate Index of Coincidence for a string
  const calculateIC = (text) => {
    const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
    const frequencies = {};
    const n = cleanText.length;

    // Count letter frequencies
    for (let i = 0; i < n; i++) {
      frequencies[cleanText[i]] = (frequencies[cleanText[i]] || 0) + 1;
    }

    // Calculate IC
    let sum = 0;
    for (const letter in frequencies) {
      const count = frequencies[letter];
      sum += count * (count - 1);
    }

    if (n <= 1) return 0;
    return sum / (n * (n - 1));
  };

  // Split ciphertext into sequences based on key length
  const getSequences = (text, keyLength) => {
    const sequences = Array(keyLength)
      .fill()
      .map(() => "");
    let j = 0;

    for (let i = 0; i < text.length; i++) {
      if (/[A-Z]/i.test(text[i])) {
        const position = j % keyLength;
        sequences[position] += text[i];
        j++;
      }
    }

    return sequences;
  };

  // Calculate letter frequencies in a string
  const getFrequencies = (text) => {
    const cleanText = text.toUpperCase();
    const frequencies = {};
    let total = 0;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (/[A-Z]/.test(char)) {
        frequencies[char] = (frequencies[char] || 0) + 1;
        total++;
      }
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

  // Find the most likely shift for a single sequence
  const findBestShift = (sequence) => {
    let bestShift = 0;
    let lowestChiSquared = Infinity;

    for (let shift = 0; shift < 26; shift++) {
      // Decrypt with this shift
      let decrypted = "";
      for (let i = 0; i < sequence.length; i++) {
        const charCode = sequence.charCodeAt(i);

        if (charCode >= 65 && charCode <= 90) {
          // Uppercase letter
          decrypted += String.fromCharCode(
            ((charCode - 65 - shift + 26) % 26) + 65
          );
        } else if (charCode >= 97 && charCode <= 122) {
          // Lowercase letter
          decrypted += String.fromCharCode(
            ((charCode - 97 - shift + 26) % 26) + 97
          );
        } else {
          decrypted += sequence[i];
        }
      }

      // Calculate chi-squared for this decryption
      const frequencies = getFrequencies(decrypted);
      const chiSquared = calculateChiSquared(frequencies);

      if (chiSquared < lowestChiSquared) {
        lowestChiSquared = chiSquared;
        bestShift = shift;
      }
    }

    return bestShift;
  };

  // Find multiple possible shifts for each position
  const findPossibleShifts = (sequence, numOptions = 3) => {
    const results = [];

    for (let shift = 0; shift < 26; shift++) {
      // Decrypt with this shift
      let decrypted = "";
      for (let i = 0; i < sequence.length; i++) {
        const charCode = sequence.charCodeAt(i);

        if (charCode >= 65 && charCode <= 90) {
          // Uppercase letter
          decrypted += String.fromCharCode(
            ((charCode - 65 - shift + 26) % 26) + 65
          );
        } else if (charCode >= 97 && charCode <= 122) {
          // Lowercase letter
          decrypted += String.fromCharCode(
            ((charCode - 97 - shift + 26) % 26) + 97
          );
        } else {
          decrypted += sequence[i];
        }
      }

      // Calculate chi-squared for this decryption
      const frequencies = getFrequencies(decrypted);
      const chiSquared = calculateChiSquared(frequencies);

      results.push({ shift, chiSquared });
    }

    // Sort by chi-squared (lower is better) and take the top options
    results.sort((a, b) => a.chiSquared - b.chiSquared);
    return results.slice(0, numOptions).map((r) => r.shift);
  };

  // Reconstruct the key based on shifts
  const reconstructKey = (shifts) => {
    return shifts.map((shift) => String.fromCharCode(shift + 65)).join("");
  };

  // Decrypt Vigenère cipher with a given key
  const decryptWithKey = (text, key) => {
    if (!key) return text;

    const upperKey = key.toUpperCase();
    let result = "";
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const keyChar = upperKey[keyIndex % upperKey.length];
        const keyCode = keyChar.charCodeAt(0) - 65;

        // Decrypt: (charCode - keyCode + 26) % 26
        let decryptedCode = (charCode - keyCode + 26) % 26;
        let decryptedChar = String.fromCharCode(decryptedCode + 65);

        if (!isUpperCase) {
          decryptedChar = decryptedChar.toLowerCase();
        }

        result += decryptedChar;
        keyIndex++;
      } else {
        result += char;
      }
    }

    return result;
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

    // Add index of coincidence as a factor
    score += calculateIC(text) * 1000;

    return score;
  };

  // Generate all combinations of possible keys
  const generateKeyCombinations = (options, position = 0, current = "") => {
    if (position === options.length) {
      return [current.toUpperCase()];
    }

    let results = [];
    for (let i = 0; i < options[position].length; i++) {
      results = results.concat(
        generateKeyCombinations(
          options,
          position + 1,
          current + String.fromCharCode(options[position][i] + 65)
        )
      );
    }

    return results;
  };

  // Brute force attack with multiple results
  const bruteForceAttack = () => {
    setIsLoading(true);

    // Processing will be done asynchronously
    setTimeout(() => {
      try {
        const filteredText = ciphertext.replace(/[^a-zA-Z]/g, "");
        if (filteredText.length === 0) {
          setResult("Please enter valid ciphertext with letters");
          setIsLoading(false);
          return;
        }

        const maxLength = Math.min(parseInt(maxKeyLength) || 10, 15);
        const results = [];

        // Test different key lengths
        for (let keyLength = 1; keyLength <= maxLength; keyLength++) {
          // Get sequences for this key length
          const sequences = getSequences(filteredText, keyLength);

          // Find possible shifts for each sequence position
          const shiftOptions = sequences.map((seq) =>
            findPossibleShifts(seq, 2)
          );

          // Generate combinations of keys from the top shifts
          const keyCombinations = generateKeyCombinations(shiftOptions);

          // Limit combinations to prevent performance issues
          const limitedCombinations = keyCombinations.slice(0, 30);

          // Evaluate each key
          for (const key of limitedCombinations) {
            const decrypted = decryptWithKey(ciphertext, key);
            const ic = calculateIC(decrypted);
            const score = scoreEnglishText(decrypted);

            results.push({
              key,
              keyLength,
              ic,
              score,
              preview:
                decrypted.substring(0, 100) +
                (decrypted.length > 100 ? "..." : ""),
            });
          }
        }

        // Sort by score (higher is better)
        results.sort((a, b) => b.score - a.score);

        // Take top 10 results
        const topResults = results.slice(0, 10);

        if (topResults.length === 0) {
          setResult(
            "Could not find any viable keys. Try different ciphertext or adjust max key length."
          );
          setIsLoading(false);
          return;
        }

        // Format results for display
        let resultText = "Top 10 Possible Keys:\n\n";

        topResults.forEach((result, index) => {
          resultText += `#${index + 1}: Key: ${result.key} (Length: ${
            result.keyLength
          }, IC: ${result.ic.toFixed(4)})\n`;
          resultText += `Preview: ${result.preview}\n\n`;
        });

        // Show the full decryption of the top result
        const bestKey = topResults[0].key;
        const fullDecryption = decryptWithKey(ciphertext, bestKey);
        resultText += `\nFull decryption of best match (Key: ${bestKey}):\n${fullDecryption}`;

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
      if (!key) {
        setResult("Please enter a key");
        return;
      }

      const decrypted = decryptWithKey(ciphertext, key);
      setResult(`Decrypted text:\n${decrypted}`);
    } else {
      bruteForceAttack();
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
              <Text style={styles.note}>
                Shows top 10 most likely keys ranked by statistical analysis and
                index of coincidence. Higher max length = more processing time.
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
