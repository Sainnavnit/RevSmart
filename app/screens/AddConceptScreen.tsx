import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const AddConceptScreen = () => {
  const { isDarkMode } from useTheme();
  const [conceptName, setConceptName] = useState('');
  const [conceptDescription, setConceptDescription] = useState('');
  const navigation = useNavigation();

  const handleAddConcept = async () => {
    try {
      const concepts = await AsyncStorage.getItem('concepts');
      const parsedConcepts = concepts ? JSON.parse(concepts) : [];
      
      const newConcept = {
        name: conceptName,
        description: conceptDescription,
        reviewDates: calculateReviewDates(),
      };
      
      parsedConcepts.push(newConcept);
      await AsyncStorage.setItem('concepts', JSON.stringify(parsedConcepts));
      
      // Schedule notification for first review
      scheduleReviewNotification(newConcept);
      
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error adding concept:', error);
    }
  };

  const calculateReviewDates = () => {
    const today = new Date();
    return [
      new Date(today.getTime() + 24 * 60 * 60 * 1000), // Day 1
      new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // Day 3
      new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // Day 7
      new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // Day 30
    ];
  };

  const scheduleReviewNotification = async (concept: any) => {
    try {
      const now = new Date();
      const firstReview = new Date(concept.reviewDates[0]);
      
      const timeUntilFirstReview = firstReview.getTime() - now.getTime();
      
      if (timeUntilFirstReview > 0) {
        await scheduleNotification(concept, firstReview, 0);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const scheduleNotification = async (concept: any, date: Date, index: number) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Review!",
          body: `It's time to review "${concept.name}"`,
          data: { conceptName: concept.name },
        },
        trigger: {
          date: date,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={isDarkMode ? styles.darkText : styles.lightText}>Concept Name:</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        value={conceptName}
        onChangeText={setConceptName}
        placeholder="Enter concept name"
        placeholderTextColor={isDarkMode ? '#cccccc' : '#888888'}
      />
      <Text style={isDarkMode ? styles.darkText : styles.lightText}>Description:</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        value={conceptDescription}
        onChangeText={setConceptDescription}
        multiline
        numberOfLines={4}
        placeholder="Enter concept description"
        placeholderTextColor={isDarkMode ? '#cccccc' : '#888888'}
      />
      <Button mode="contained" onPress={handleAddConcept} disabled={!conceptName.trim() || !conceptDescription.trim()}>
        Add Concept
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  darkInput: {
    borderColor: '#555555',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
});

export default AddConceptScreen;
