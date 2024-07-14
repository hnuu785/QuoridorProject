import { View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { ref, set, get, child } from "firebase/database";
import { database } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LobbyScreen() {
  const [rooms, setRooms] = useState([]);
	const [myName, setMyName] = useState('');
  
  useEffect(() => {
		const fetchRooms = async () => {
			const value = await AsyncStorage.getItem('myName');
			setMyName(value);
		};
		
		fetchRooms();
		
		const roomsRef = ref(database, '/rooms');
		
		get(roomsRef).then((snapshot) => {
			if (snapshot.exists()) {
				//setRooms(snapshot.val());
				const roomsData = snapshot.val();
				setRooms(Object.keys(roomsData).map(key => ({
					id: key,
					name: roomsData[key].name,
				})));
			}
			else {
				console.log('not exists');
			}
		});
  }, []);
	
	useEffect(() => {
    console.log(rooms);
  }, [rooms]);
	
	const createRoom = () => {
		const roomsRef = ref(database, '/rooms/' + Date.now());
		set(roomsRef, {
			name: myName,
		});
	};
	
	const ViewRooms = () => {
		return (
			<>
				{rooms.map(room => {
							<Link href="/multi" key={room.id} style={styles.roomText}>{room.name}</Link>
				})}
			</>
		);
	}
	
  return (
    <View style={styles.container}>
			<Link href="/multi" asChild>
				<TouchableWithoutFeedback onPress={createRoom}>
					<Text style={styles.createText}>Create Room</Text>
				</TouchableWithoutFeedback>
			</Link>
      <ScrollView>
				{rooms.map(room => (
					<Link href="/multi" key={room.name} style={styles.roomText}>{room.name}</Link>
        ))}
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