import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Card, Button } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const DashboardScreen = () => {
  const { isDarkMode } = useTheme();
  const [concepts, setConcepts] = useState([]);
  const [userName, setUserName] = useState('');
  const [dueConcepts, setDueConcepts] = useState([]);
  const [upcomingConcepts, setUpcomingConcepts] = useState([]);
  const [reviewStats, setReviewStats] = useState({ completed: 0, total: 0 });

  const navigation = useNavigation();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedConcepts = await AsyncStorage.getItem('concepts');
        const storedUserName = await AsyncStorage.getItem('userName');
        
        if (storedUserName) setUserName(storedUserName);
        
        if (storedConcepts) {
          const parsedConcepts = JSON.parse(storedConcepts);
          setConcepts(parsedConcepts);
          
          // Calculate due and upcoming concepts
          const now = new Date();
          const due = parsedConcepts.filter((concept: any) => {
            const lastReview = new Date(concept.reviewDates[concept.reviewDates.length - 1]);
            return now >= lastReview;
          });
          
          const upcoming = parsedConcepts.filter((concept: any) => {
            const lastReview = new Date(concept.reviewDates[concept.reviewDates.length - 1]);
            return now < lastReview;
          });
          
          setDueConcepts(due);
          setUpcomingConcepts(upcoming);
          
          // Calculate review stats
          const completed = parsedConcepts.filter((concept: any) => {
            return concept.reviewDates.length > 1;
          }).length;
          
          setReviewStats({
            completed,
            total: parsedConcepts.length
          });
        }
      } catch (error) {
        console.error('Error loading concepts:', error);
      }
    };

    loadUserData();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const isDue = new Date(item.reviewDates[item.reviewDates.length - 1]) <= new Date();
    
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('ConceptDetails', { concept: item })}
      >
        <Card style={isDue ? styles.dueCard : {}}>
          <Card.Content>
            <Text style={styles.title}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.reviewDate}>
              Next Review: {new Date(item.reviewDates[item.reviewDates.length - 1]).toLocaleDateString()}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              onPress={() => navigation.navigate('ConceptDetails', { concept: item })}
              disabled={!isDue}
            >
              Review
            </Button>
          </Card.Actions>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={styles.welcomeText}>Welcome, {userName || 'User'}!</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Review Progress: {reviewStats.completed}/{reviewStats.total}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(reviewStats.completed / reviewStats.total) * 100 || 0}%` }
            ]} 
          />
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Concepts Due Today</Text>
      {dueConcepts.length > 0 ? (
        <FlatList
          data={dueConcepts}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
        />
      ) : (
        <Text style={styles.emptyText}>No concepts due today. Great job!</Text>
      )}
      
      <Text style={styles.sectionTitle}>Upcoming Concepts</Text>
      <FlatList
        data={upcomingConcepts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.name}-${index}`}
      />
      
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('AddConcept')}
        style={styles.addButton}
      >
        Add New Concept
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#121212',
    color: '#ffffff',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 15,
  },
  addButton: {
    marginTop: 20,
  },
  dueCard: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
});

export default DashboardScreen;
