import { View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LobbyScreen() {
  const [rooms, setRooms] = useState([]);
  
  useEffect(() => {
    try {
			const myName = AsyncStorage.getItem('myName');
			const roomsData = database().ref('/rooms').once('value').val();
			setRooms(Object.keys(roomsData).map(key => ({
					id: key,
					name: roomsData[key].name
			})));
		} catch(e) {
			console.log(e);
		}
  }, []);

  return (
    <View style={styles.container}>
			<Link href="/multi" asChild>
				<TouchableWithoutFeedback onPress={() => {
					try {
						const newRef = database().ref('/rooms').push();
						newRef
							.set({name: myName});
					} catch (e) {
						console.log(e);
					}
				}}>
					<Text style={styles.createText}>Create Room</Text>
				</TouchableWithoutFeedback>
			</Link>
      <ScrollView>
        {rooms.map(room => {
					<Link href="/multi" style={styles.roomText}>{room.name}</Link>
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'teal',
  },
  createText: {
    fontSize: 30,
    borderRadius: 10,
    backgroundColor: 'tomato',
    textAlign: 'center',
    marginHorizontal: 60,
    marginTop: 70,
  },
  roomText: {
    backgroundColor: 'tomato',
    fontSize: 27,
    textAlign: 'center',
    borderRadius: 10,
    marginHorizontal: 30,
    marginTop: 20,
  },
});