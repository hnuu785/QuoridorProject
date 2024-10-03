import { useState, useEffect } from 'react';
import React from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Text, Image, Dimensions, Alert } from 'react-native';
import { database } from '../firebaseConfig';
import { ref, set, get, child, update, onValue } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const length = (windowWidth - 55) / 9;

export default function MultiScreen() {
	const [game, setGame] = useState({});
	const [walls, setWalls] = useState({});
	const [myName, setMyName] = useState('');
	const [roomID, setRoomID] = useState('');
	
	useEffect(() => {
		const fetchStorage = async () => {
			const valueID = await AsyncStorage.getItem('myRoomId');
			setRoomID(valueID);
			const valueName = await AsyncStorage.getItem('myName');
			setMyName(valueName);
		};
		fetchStorage();
		
	}, []);
	
	useEffect(() => {
		const fetchGame = async () => {
			const roomRef = ref(database, '/rooms/' + await AsyncStorage.getItem('myRoomId'));
			await onValue(roomRef, (snapshot) => {
				if (snapshot.exists()) {
					setGame(snapshot.val());
				}
			});
			const wallRef = ref(database, '/rooms/' + await AsyncStorage.getItem('myRoomId') + '/walls');
			await onValue(wallRef, (snapshot) => {
				if (snapshot.exists()) {
					setWalls(snapshot.val());
				}
			});
		};
		fetchGame();
	}, []);
	
	useEffect(() => {
		const updateGame = async () => {
			const roomRef = ref(database, '/rooms/' + roomID);
			await update(roomRef, game);
		}
		updateGame();
		
	}, [game]);
		
	const renderHor = () => {
		const hor = [];
		for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < 9; j++) {
				hor.push(
					<TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
						if (game.turn == true && game.p1C > 0 && myName == game.hostName) {
							setGame(prevGame => ({
								...prevGame,
								p1C: prevGame.p1C - 1,
								turn: false,
								walls: [...prevGame.walls, {type: 'hor', left: j, top: i}, {type: 'hor', left: (j + 1), top: i}],
							}));
						}
						else if (game.turn == false && game.p2C > 0 && myName == game.guestName) {
							setGame(prevGame => ({
								...prevGame,
								p2C: prevGame.p2C - 1,
								turn: true,
								walls: [...prevGame.walls, {type: 'hor', left: j, top: i}, {type: 'hor', left: (j + 1), top: i}],
							}));
						}
					}}>
						<View style={{...styles.fieldHor, left: j * (5 + length) + 5, top: i * (5 + length)}}></View>
					</TouchableWithoutFeedback>
				);
			}
		}
		
		return hor;
	};
	
	const renderVer = () => {
    const ver = [];
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < 9; j++) {
        ver.push(
          <TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
            if (game.turn == true && game.p1C > 0) {
							setGame(prevGame => ({
								...prevGame,
								p1C: prevGame.p1C - 1,
								turn: false,
								walls: [...prevGame.walls, {type: 'ver', left: i, top: j}, {type: 'ver', left: i, top: (j + 1)}],
							}));
            }
            else if (game.turn == false && game.p2C > 0) {
							setGame(prevGame => ({
								...prevGame,
								p2C: prevGame.p2C - 1,
								turn: true,
								walls: [...prevGame.walls, {type: 'ver', left: i, top: j}, {type: 'ver', left: i, top: (j + 1)}],
							}));
            }
      		}}>
          	<View style={{...styles.fieldVer, left: i * (5 + length), top: j * (length + 5) + 5}}></View>
          </TouchableWithoutFeedback>
				);
      }
    }
		return ver;
  };
	
	const playerMoveRight = () => {
    if (game.turn == true) {
			setGame(prevGame => ({
				...prevGame,
				p1x: prevGame.p1x + 1,
				turn: false,
			}));
    }
    else {
			setGame(prevGame => ({
				...prevGame,
				p2x: prevGame.p2x + 1,
				turn: true,
			}));
    }
  };
  const playerMoveLeft = () => {
    if (game.turn == true) {
			setGame(prevGame => ({
				...prevGame,
				p1x: prevGame.p1x - 1,
				turn: false,
			}));
    }
    else {
			setGame(prevGame => ({
				...prevGame,
				p2x: prevGame.p2x - 1,
				turn: true,
			}));
    }
  };
  const playerMoveUp = () => {
    if (game.turn == true) {
			setGame(prevGame => ({
				...prevGame,
				p1y: prevGame.p1y - 1,
				turn: false,
			}));
    }
    else {
			setGame(prevGame => ({
				...prevGame,
				p2y: prevGame.p2y - 1,
				turn: true,
			}));
    }
  };
  const playerMoveDown = () => {
    if (game.turn == true) {
			setGame(prevGame => ({
				...prevGame,
				p1y: prevGame.p1y + 1,
				turn: false,
			}));
    }
    else {
			setGame(prevGame => ({
				...prevGame,
				p2y: prevGame.p2y + 1,
				turn: true,
			}));
    }
  };
	
	const renderPlayer = () => {
		if (!game || Object.keys(game).length === 0) {
    	return null;
  	}
    return (
      <>
        <Image style={{...styles.pawn, left: game.p1x * (5 + length) + 5, top: game.p1y * (5 + length) + 5 }} source={{uri: "https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/64f5a7a595ec652823c94f4fcf2abe09"}} />
        <Image style={{...styles.pawn, left: game.p2x * (5 + length) + 5, top: game.p2y * (5 + length) + 5 }} source={{uri: "https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/cacb3335a59b92eedefc10dfaf3e9dea"}} />
        {game.turn == true && isMoveValid(game.p1x, game.p1y, 'right') && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: (game.p1x + 1) * (5 + length) + 5, top: game.p1y * (5 + length) + 5 }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false && isMoveValid(game.p2x, game.p2y, 'right') && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: (game.p2x + 1) * (5 + length) + 5, top: game.p2y * (5 + length) + 5 }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true && isMoveValid(game.p1x, game.p1y, 'left') && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: (game.p1x - 1) * (5 + length) + 5, top: game.p1y * (5 + length) + 5 }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false && isMoveValid(game.p2x, game.p2y, 'left') && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: (game.p2x - 1) * (5 + length) + 5, top: game.p2y * (5 + length) + 5 }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true && isMoveValid(game.p1x, game.p1y, 'up') && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: game.p1x * (5 + length) + 5, top: (game.p1y - 1) * (5 + length) + 5 }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false && isMoveValid(game.p2x, game.p2y, 'up') && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: game.p2x * (5 + length) + 5, top: (game.p2y - 1) * (5 + length) + 5 }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true && isMoveValid(game.p1x, game.p1y, 'down') && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: game.p1x * (5 + length) + 5, top: (game.p1y + 1) * (5 + length) + 5 }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false && isMoveValid(game.p2x, game.p2y, 'down') && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: game.p2x * (5 + length) + 5, top: (game.p2y + 1) * (5 + length) + 5 }}></View>
          </TouchableWithoutFeedback>
        ): null}
      </>
    );
  };
	
	const renderWalls = () => {
		if (!walls || Object.keys(walls).length === 0) {
    	return null;
  	}
		return Object.keys(walls).map((key, index) => {
			const wall = walls[key];
			if (wall.type == 'hor') {
				return (<View key={`wall-${index}`} style={{...styles.horWall, left: wall.left * (5 + length) + 5, top: wall.top * (5 + length)}}></View>);
			} else if (wall.type == 'ver') {
				return (<View key={`wall-${index}`} style={{...styles.verWall, left: wall.left * (5 + length), top: wall.left * (length + 5) + 5}}></View>);
			}
		})
	};

	const isMoveValid = (x, y, direction) => {
		
    for (let i of Object.keys(walls)) {
			const wallLeft = walls[i].left;
			const wallTop = walls[i].top;
      if (direction == 'right' && wallLeft <= (x + 1) * length + 0.01 && wallLeft >= (x + 1) * length - 0.01 && wallTop == y * length) {
        return false;
      }
      if (direction == 'left' && wallLeft == x * length && wallTop == y * length) {
        return false;
      }
      if (direction == 'up' && wallLeft <= x * length + 0.01 && wallLeft >= x * length - 0.01 && wallTop <= y * length + 0.01 && wallTop >= y * length - 0.01) {
        return false;
      }
      if (direction == 'down' && wallLeft <= x * length + 0.01 && wallLeft >= x * length - 0.01 && wallTop <= (y + 1) * length + 0.01 && wallTop >= (y + 1) * length - 0.01) {
        return false;
      }
    }
    return true;
  };

  return (
    <>
			<Text>{game.hostName}</Text>
			<Text>{game.guestName}</Text>
			<View style={styles.gameContainer}>
				{renderHor()}
				{renderVer()}
				{renderPlayer()}
				{renderWalls()}
			</View>
			<Link href='/' asChild>
				<TouchableWithoutFeedback>
					<Text style={styles.exitBtn}>EXIT</Text>
				</TouchableWithoutFeedback>
			</Link>
    </>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    backgroundColor: 'tomato',
    width: windowWidth,
    height: windowWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pawn: {
    width: length,
    height: length,
    position: 'absolute',
  },
  moveTile: {
    width: length,
    height: length,
    position: 'absolute',
    backgroundColor: 'teal',
		opacity: 0.5,
  },
  horWall: {
    width: length,
    height: 5,
    backgroundColor: 'white',
    position: 'absolute',
  },
  verWall: {
    width: 5,
    height: length,
    backgroundColor: 'white',
    position: 'absolute',
  },
  fieldHor: {
    width: length,
    height: 5,
    backgroundColor: 'black',
    position: 'absolute',
  },
  fieldVer: {
    width: 5,
    height: length,
    backgroundColor: 'black',
    position: 'absolute',
  },
	exitBtn: {
		width: 50,
		height: 20,
		backgroundColor: 'skyblue',
	},
});