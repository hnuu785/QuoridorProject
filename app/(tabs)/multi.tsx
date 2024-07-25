import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image, Text } from 'react-native';
import { database } from '../../firebaseConfig';
import { ref, set, get, child, update, onValue } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
								walls: [...prevGame.walls, {type: 'hor', left: j * 40, top: i * 40}],
							}));
						}
						else if (game.turn == false && game.p2HC > 0) {
							setGame(prevGame => ({
								...prevGame,
								p2HC: prevGame.p2HC - 1,
								turn: true,
								walls: [...prevGame.walls, {type: 'hor', left: j * 40, top: i * 40}],
							}));
						}
					}}>
						<View style={{...styles.fieldHor, left: j * 40, top: i * 40}}></View>
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
								walls: [...prevGame.walls, {type: 'ver', left: i * 40, top: j * 40}],
							}));
            }
            else if (game.turn == false && game.p2VC > 0) {
							setGame(prevGame => ({
								...prevGame,
								p2VC: prevGame.p2VC - 1,
								turn: true,
								walls: [...prevGame.walls, {type: 'ver', left: i * 40, top: j * 40}],
							}));
            }
      		}}>
          	<View style={{...styles.fieldVer, left: i * 40, top: j * 40}}></View>
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
				p1x: prevGame.p1x + 40,
				turn: false,
			}));
    }
    else if (game.turn == false){
			setGame(prevGame => ({
				...prevGame,
				p2x: prevGame.p2x + 40,
				turn: true,
			}));
    }
  };
  const playerMoveLeft = () => {
    if (game.turn == true) {
			setGame(prevGame => ({
				...prevGame,
				p1x: prevGame.p1x - 40,
				turn: false,
			}));
    }
    else {
			setGame(prevGame => ({
				...prevGame,
				p2x: prevGame.p2x - 40,
				turn: true,
			}));
    }
  };
  const playerMoveUp = () => {
    if (game.turn == true) {
			setGame(prevGame => ({
				...prevGame,
				p1y: prevGame.p1y + 40,
				turn: false,
			}));
    }
    else {
			setGame(prevGame => ({
				...prevGame,
				p2y: prevGame.p2y + 40,
				turn: true,
			}));
    }
  };
  const playerMoveDown = () => {
    if (game.turn == true) {
			setGame(prevGame => ({
				...prevGame,
				p1y: prevGame.p1y - 40,
				turn: false,
			}));
    }
    else {
			setGame(prevGame => ({
				...prevGame,
				p2y: prevGame.p2y - 40,
				turn: true,
			}));
    }
  };
	
	const renderPlayer = () => {
    return (
      <>
        <Image style={{...styles.pawn, left: game.p1x, top: game.p1y}} source={{uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/b01ef9b4f2c29b730c5dd509f0dc36d2'}}/>
        <Image style={{...styles.pawn, left: game.p2x, top: game.p2y}} source={{uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/90b77e5979766ced2ece86cb02713f1d'}}/>
        {game.turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: game.p1x + 40, top: game.p1y }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: game.p2x + 40, top: game.p2y }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: game.p1x - 40, top: game.p1y }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: game.p2x - 40, top: game.p2y }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: game.p1x, top: game.p1y + 40 }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: game.p2x, top: game.p2y + 40 }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {game.turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: game.p1x, top: game.p1y - 40}}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {game.turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: game.p2x, top: game.p2y - 40}}></View>
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
			<View style={styles.topMenu}>
				<View style={{...styles.horWall, left: 50, top: 50,}}></View>
				<View style={{...styles.verWall, left: 250, top: 20,}}></View>
			</View>
			<View style={styles.gameContainer}>
				{renderHor()}
				{renderVer()}
				{renderPlayer()}
				{/*Object.keys(walls).map(key => 
					walls[key].type == 'hor' ?
						<View style={{...styles.horwall, left: walls[key].left, top: walls[key].top}}></View>
					: <View style={{...styles.verwall, left: walls[key].left, top: walls[key].top}}></View>
				)*/}
				{renderWalls()}
			</View>
			<View style={styles.bottomMenu}>
				<View style={{...styles.horWall, left: 50, top: 50,}}></View>
				<View style={{...styles.verWall, left: 250, top: 20,}}></View>
			</View>
    </View>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    backgroundColor: 'tomato',
    width: 360,
    height: 360,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topMenu: {
    backgroundColor: 'grey',
    width: 360,
    height: 120,
    marginTop: 100,
    flexDirection: 'row',
  },
  bottomMenu: {
    backgroundColor: 'grey',
    width: 360,
    height: 120,
    flexDirection: 'row',
  },
  pawn: {
    width: 40,
    height: 40,
    position: 'absolute',
  },
  moveTile: {
    width: 40,
    height: 40,
    position: 'absolute',
    backgroundColor: 'teal',
  },
  horWall: {
    width: 80,
    height: 10,
    backgroundColor: 'white',
    position: 'absolute',
  },
  verWall: {
    width: 10,
    height: 80,
    backgroundColor: 'white',
    position: 'absolute',
  },
  fieldHor: {
    width: 40,
    height: 5,
    backgroundColor: 'black',
    position: 'absolute',
  },
  fieldVer: {
    width: 5,
    height: 40,
    backgroundColor: 'black',
    position: 'absolute',
  },
});