import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image, Text, Dimensions } from 'react-native';
import { database } from '../firebaseConfig';
import { ref, set, get, child, update, onValue } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const length = windowWidth / 9;

export default function MultiScreen() {
	const [game, setGame] = useState({});
	const [walls, setWalls] = useState({});
	const [myName, setMyName] = useState('');
	
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
			setMyName(await AsyncStorage.getItem('myName'));
		};
		fetchGame();
	}, []);
	
	useEffect(() => {
		const win = async () => {
			if (game.p1y == 8) {
				Alert.alert('End of game', 'Player1 win!');
			}
			if (game.p2y == 0) {
				Alert.alert('End of game', 'Player2 win!');
			}
		}
		const updateGame = async () => {
			const roomRef = ref(database, '/rooms/' + await AsyncStorage.getItem('myRoomId'));
			await update(roomRef, game);
		}
		win();
		updateGame();
	}, [game]);
		
	const renderHor = () => {
		const hor = [];
		for (let i = 1; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
				hor.push(
					<TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
						if (game.turn == true && game.p1HC > 0 && myName == game.hostName) {
							setGame(prevGame => ({
								...prevGame,
								p1HC: prevGame.p1HC - 1,
								turn: false,
								walls: [...prevGame.walls, {type: 'hor', left: j, top: i}, {type: 'hor', left: (j + 1), top: i}],
							}));
						}
						else if (game.turn == false && game.p2HC > 0 && myName == game.guestName) {
							setGame(prevGame => ({
								...prevGame,
								p2HC: prevGame.p2HC - 1,
								turn: true,
								walls: [...prevGame.walls, {type: 'hor', left: j, top: i}, {type: 'hor', left: (j + 1), top: i}],
							}));
						}
					}}>
						<View style={{...styles.fieldHor, left: j * length, top: i * length}}></View>
					</TouchableWithoutFeedback>
				);
			}
		}
		
		return hor;
	};
	
	const renderVer = () => {
    const ver = [];
    for (let i = 1; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        ver.push(
          <TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
            if (game.turn == true && game.p1VC > 0) {
							setGame(prevGame => ({
								...prevGame,
								p1VC: prevGame.p1VC - 1,
								turn: false,
								walls: [...prevGame.walls, {type: 'ver', left: i, top: j}, {type: 'ver', left: i, top: (j + 1)}],
							}));
            }
            else if (game.turn == false && game.p2VC > 0) {
							setGame(prevGame => ({
								...prevGame,
								p2VC: prevGame.p2VC - 1,
								turn: true,
								walls: [...prevGame.walls, {type: 'ver', left: i, top: j}, {type: 'ver', left: i, top: (j + 1)}],
							}));
            }
      		}}>
          	<View style={{...styles.fieldVer, left: i * length, top: j * length}}></View>
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
    return (
      <>
        <Image style={{...styles.pawn, left: game.p1x * length, top: game.p1y * length }} source={require('../assets/images/p1Pawn.png')} />
        <Image style={{...styles.pawn, left: game.p2x * length, top: game.p2y * length }} source={require('../assets/images/p2Pawn.png')} />
        {game.turn == true && isMoveValid(game.p1x, game.p1y, 'right') && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: game.p1x * length + length, top: game.p1y * length }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false && isMoveValid(game.p2x, game.p2y, 'right') && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: game.p2x * length + length, top: game.p2y * length }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true && isMoveValid(game.p1x, game.p1y, 'left') && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: game.p1x * length - length, top: game.p1y * length }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false && isMoveValid(game.p2x, game.p2y, 'left') && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: game.p2x * length - length, top: game.p2y * length }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true && isMoveValid(game.p1x, game.p1y, 'up') && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: game.p1x * length, top: (game.p1y - 1) * length }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false && isMoveValid(game.p2x, game.p2y, 'up') && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: game.p2x * length, top: (game.p2y - 1) * length }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true && isMoveValid(game.p1x, game.p1y, 'down') && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: game.p1x * length, top: (game.p1y + 1) * length }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false && isMoveValid(game.p2x, game.p2y, 'down') && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: game.p2x * length, top: (game.p2y + 1) * length }}></View>
          </TouchableWithoutFeedback>
        ): null}
      </>
    );
  };
	
	const renderWalls = () => {
		return Object.keys(walls).map((key, index) => {
			const wall = walls[key];
			if (wall.type == 'hor') {
				return (<View key={`wall-${index}`} style={{...styles.horWall, left: wall.left * length, top: wall.top * length}}></View>);
			} else if (wall.type == 'ver') {
				return (<View key={`wall-${index}`} style={{...styles.verWall, left: wall.left * length, top: wall.top * length}}></View>);
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
  },
  horWall: {
    width: length,
    height: 10,
    backgroundColor: 'white',
    position: 'absolute',
  },
  verWall: {
    width: 10,
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