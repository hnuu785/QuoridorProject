import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image, Text, Dimensions } from 'react-native';
import { database } from '../../firebaseConfig';
import { ref, set, get, child, update, onValue } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const length = windowWidth / 9;

export default function MultiScreen() {
	const [game, setGame] = useState({});
	const [walls, setWalls] = useState({});
	
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
			const roomRef = ref(database, '/rooms/' + await AsyncStorage.getItem('myRoomId'));
			await update(roomRef, game);
		}
		updateGame();
	}, [game]);
		
	const renderHor = () => {
		const hor = [];
		for (let i = 1; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
				hor.push(
					<TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
						if (game.turn == true && game.p1HC > 0) {
							setGame(prevGame => ({
								...prevGame,
								p1HC: prevGame.p1HC - 1,
								turn: false,
								walls: [...prevGame.walls, {type: 'hor', left: j * length, top: i * length}],
							}));
						}
						else if (game.turn == false && game.p2HC > 0) {
							setGame(prevGame => ({
								...prevGame,
								p2HC: prevGame.p2HC - 1,
								turn: true,
								walls: [...prevGame.walls, {type: 'hor', left: j * length, top: i * length}],
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
								walls: [...prevGame.walls, {type: 'ver', left: i * length, top: j * length}],
							}));
            }
            else if (game.turn == false && game.p2VC > 0) {
							setGame(prevGame => ({
								...prevGame,
								p2VC: prevGame.p2VC - 1,
								turn: true,
								walls: [...prevGame.walls, {type: 'ver', left: i * length, top: j * length}],
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
  const playerMoveDown = () => {
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
	
	const renderPlayer = () => {
    return (
      <>
        <Image style={{...styles.pawn, left: game.p1x * length, top: game.p1y * length }} source={{uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/b01ef9b4f2c29b730c5dd509f0dc36d2'}}/>
        <Image style={{...styles.pawn, left: game.p2x * length, top: game.p2y * length }} source={{uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/90b77e5979766ced2ece86cb02713f1d'}}/>
        {game.turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: game.p1x * length + length, top: game.p1y * length }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: game.p2x * length + length, top: game.p2y * length}}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: game.p1x * length - length, top: game.p1y * length}}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: game.p2x * length - length, top: game.p2y * length}}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: game.p1x * length, top: game.p1y * length + length }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: game.p2x * length, top: game.p2y * length + length }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: game.p1x * length, top: game.p1y * length - length}}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: game.p2x * length, top: game.p2y * length - length}}></View>
          </TouchableWithoutFeedback>
        ): null}
      </>
    );
  };
	
	const renderWalls = () => {
		return Object.keys(walls).map((key, index) => {
			const wall = walls[key];
			if (wall.type == 'hor') {
				return (<View key={`wall-${index}`} style={{...styles.horWall, left: wall.left, top: wall.top}}></View>);
			} else if (wall.type == 'ver') {
				return (<View key={`wall-${index}`} style={{...styles.verWall, left: wall.left, top: wall.top}}></View>);
			}
		})
	};

  return (
    <View style={styles.container}>
			<Text>{game.hostName}</Text>
			<Text>{game.guestName}</Text>
			<View style={styles.gameContainer}>
				{renderHor()}
				{renderVer()}
				{renderPlayer()}
				{renderWalls()}
			</View>
    </View>
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
    width: length * 2,
    height: 10,
    backgroundColor: 'white',
    position: 'absolute',
  },
  verWall: {
    width: 10,
    height: length * 2,
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
});