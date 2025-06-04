import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const ConceptDetailsScreen = () => {
  const { isDarkMode } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { concept } = route.params as { concept: any };
  const [currentConcept, setCurrentConcept] = useState(concept);

  const handleMarkReviewed = async (success: boolean) => {
    try {
      const concepts = await AsyncStorage.getItem('concepts');
      const parsedConcepts = concepts ? JSON.parse(concepts) : [];
      
      // Update review dates based on performance
      const updatedConcepts = parsedConcepts.map((c: any) => {
        if (c.name === currentConcept.name) {
          const newReviewDates = [...c.reviewDates];
          const nextDate = new Date();
          
          // Adjust next review date based on performance
          if (success) {
            // If successful, increase interval
            const lastInterval = c.reviewDates.length > 1 
              ? c.reviewDates[c.reviewDates.length - 1].getTime() - c.reviewDates[c.reviewDates.length - 2].getTime()
              : 24 * 60 * 60 * 1000;
            
            nextDate.setTime(nextDate.getTime() + lastInterval * 1.5);
          } else {
            // If not successful, reset to day 1
            nextDate.setTime(nextDate.getTime() + 24 * 60 * 60 * 1000);
          }
          
          newReviewDates.push(nextDate);
          return { ...c, reviewDates: newReviewDates };
        }
        return c;
      });

      await AsyncStorage.setItem('concepts', JSON.stringify(updatedConcepts));
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error updating concept:', error);
    }
  };

  const getLastReviewStatus = () => {
    if (currentConcept.reviewDates.length < 2) return 'New';
    
    const lastReview = new Date(currentConcept.reviewDates[currentConcept.reviewDates.length - 2]);
    const nextReview = new Date(currentConcept.reviewDates[currentConcept.reviewDates.length - 1]);
    
    const now = new Date();
    const isDue = now >= nextReview;
    
    return isDue ? 'Overdue' : 'Completed';
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.card}>
        <Text style={styles.conceptName}>{currentConcept.name}</Text>
        <Text style={styles.description}>{currentConcept.description}</Text>
        
        <View style={styles.reviewInfo}>
          <Text style={styles.sectionTitle}>Review Schedule:</Text>
          <Text>Next Review: {new Date(currentConcept.reviewDates[currentConcept.reviewDates.length - 1]).toLocaleDateString()}</Text>
          <Text>Last Review: {new Date(currentConcept.reviewDates[currentConcept.reviewDates.length - 2]).toLocaleDateString()}</Text>
          <Text>Status: {getLastReviewStatus()}</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Review Performance:</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.successButton}
            onPress={() => handleMarkReviewed(true)}
          >
            <Text style={styles.buttonText}>I Remembered It!</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.failButton}
            onPress={() => handleMarkReviewed(false)}
          >
            <Text style={styles.buttonText}>I Forgot It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  conceptName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  reviewInfo: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  successButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  failButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ConceptDetailsScreen;
