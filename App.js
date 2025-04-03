// App.js
import "expo-asset";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MainScreen from "./MainScreen";
import CCracker from "./CCrack";
import RFCracker from "./RCrack";
import VCracker from "./VCrack";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerTintColor: "#BB86FC",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: "Encryption Tool" }}
        />
        <Stack.Screen
          name="CCracker"
          component={CCracker}
          options={{ title: "Caesar Cracker" }}
        />
        <Stack.Screen
          name="RFCracker"
          component={RFCracker}
          options={{ title: "Rail Fence Cracker" }}
        />
        <Stack.Screen
          name="VCracker"
          component={VCracker}
          options={{ title: "Vigenère Cracker" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
