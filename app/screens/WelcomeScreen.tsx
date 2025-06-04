import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';

const WelcomeScreen = () => {
  const [name, setName] = useState('');
  const navigation = useNavigation();

  const handleSetName = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error saving user name:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to RevSmart!</Text>
      <Text style={styles.subtitle}>Please enter your name to get started:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        autoCapitalize="words"
      />
      <Button mode="contained" onPress={handleSetName} disabled={!name.trim()}>
        Get Started
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '80%',
  },
});

export default WelcomeScreen;
