import React from 'react';
import {StyleSheet, View, ActivityIndicator, Text} from 'react-native';

/**
 * LoadingScreen Component
 * Displays a loading indicator with Persian text
 */
const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFD700" />
      <Text style={styles.text}>در حال بارگذاری...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
});

export default LoadingScreen;





