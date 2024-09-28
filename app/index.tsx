import { Text, View, StyleSheet, Dimensions, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  return (
		<View style={styles.container}>
    <View style={styles.titleContainer}>
      <Text style={styles.title}>QUORIDOR</Text>
    </View>
    <View style={styles.menuContainer}>
			<Link href="/single" style={styles.playMenuText}>OFFLINE</Link>
			<Link href="/createName" style={styles.playMenuText}>ONLINE</Link>
    </View>
  </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'teal',
  },
  menuContainer: {
    flex: 4,
    backgroundColor: 'tomato',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 50,
  },
  playMenuText: {
    textAlign: 'center',
    marginVertical: 40,
    fontSize: 30,
    borderRadius: 20,
    borderWidth: 10,
    borderColor: 'black',
    marginHorizontal: 30,
		paddingTop: 10,
  },
});