import { View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { ref, set, get, child, update } from "firebase/database";
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
				const roomsData = snapshot.val();
				setRooms(Object.keys(roomsData).map(key => ({
					id: key,
					name: roomsData[key].hostName,
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
	
	const createRoom = async () => {
		const roomId = Date.now();
		await AsyncStorage.setItem('myRoomId', roomId);
		const roomsRef = ref(database, '/rooms/' + roomId);
		await set(roomsRef, {
			hostName: myName,
			p1x: 160,
			p1y: 0,
			p2x: 160,
			p2y: 320,
			turn: true,
			p1HC: 10,
			p1VC: 10,
			p2HC: 10,
			p2VC: 10,
			walls: [{type: 'init', left: 0, top: 0}],
		});
	};
	
  return (
    <View style={styles.container}>
			<Link href="/multi" asChild>
				<TouchableWithoutFeedback onPress={createRoom}>
					<Text style={styles.createText}>Create Room</Text>
				</TouchableWithoutFeedback>
			</Link>
      <ScrollView>
				{rooms.map(room => (
					<Link href="/multi" key={room.id} asChild>
						<TouchableWithoutFeedback onPress={() => {
								AsyncStorage.setItem('myRoomId', room.id);
								const roomsRef = ref(database, '/rooms/' + room.id);
								update(roomsRef, {
									guestName: myName,
								});
							}}>
							<Text style={styles.roomText}>{room.name}</Text>
						</TouchableWithoutFeedback>
					</Link>
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
    marginHorizontal: 90,
    marginTop: 20,
  },
});