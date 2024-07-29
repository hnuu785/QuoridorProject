import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image, Text, Dimensions, Alert, Button } from 'react-native';
import { Link } from 'expo-router';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const length = windowWidth / 9;

export default function SingleScreen() {
	const [p1x, setP1x] = useState(length * 4);
  const [p1y, setP1y] = useState(0);
  const [p2x, setP2x] = useState(length * 4);
  const [p2y, setP2y] = useState(length * 8);
  const [turn, setTurn] = useState(true);
  // p1 true p2 false

  const [walls, setWalls] = useState([]);

  const [p1HC, setP1HC] = useState(10);
  const [p1VC, setP1VC] = useState(10);
  const [p2HC, setP2HC] = useState(10);
  const [p2VC, setP2VC] = useState(10);

  const renderHor = () => {
    const hor = [];
    for (let i = 1; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        hor.push(
          <TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
            if (turn == true && p1HC > 0) {
              setWalls(currentWalls => [...currentWalls,
              <View key={`${i}-${j}`} style={{...styles.horWall, left: j * length, top: i * length}}></View>]);
              setP1HC(p1HC - 1);
              setTurn(false);
            }
            else if (turn == false && p2HC > 0) {
              setWalls(currentWalls => [...currentWalls,
              <View key={`${i}-${j}`} style={{...styles.horWall, left: j * length, top: i * length}}></View>]);
              console.log(p2HC);
              setP2HC(p2HC - 1);
              setTurn(true);
            }
          }}>
          <View key={`${i}-${j}`} style={{...styles.fieldHor, left: j * length, top: i * length}}></View>
          </TouchableWithoutFeedback>);
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
            if (turn == true && p1VC > 0) {
              setWalls(currentWalls => [...currentWalls,
              <View key={`${i}-${j}`} style={{...styles.verWall, left: i * length, top: j * length}}></View>]);
              setP1VC(p1VC - 1);
              setTurn(false);
            }
            else if (turn == false && p2VC > 0) {
              setWalls(currentWalls => [...currentWalls,
              <View key={`${i}-${j}`} style={{...styles.verWall, left: i * length, top: j * length}}></View>]);
              setP2VC(p2VC - 1);
              setTurn(true);
            }
          }}>
          <View key={`${i}-${j}`} style={{...styles.fieldVer, left: i * length, top: j * length}}></View>
          </TouchableWithoutFeedback>);
      }
    }
    return ver;
  };

  const playerMoveRight = () => {
    if (turn == true) {
      setP1x(p1x + length);
      setTurn(false);
    }
    else if (turn == false){
      setP2x(p2x + length);
      setTurn(true);
    }
  };
  const playerMoveLeft = () => {
    if (turn == true) {
      setP1x(p1x - length);
      setTurn(false);
    }
    else {
      setP2x(p2x - length);
      setTurn(true);
    }
  };
  const playerMoveUp = () => {
    if (turn == true) {
      setP1y(p1y + length);
      setTurn(false);
    }
    else {
      setP2y(p2y + length);
      setTurn(true);
    }
  };
  const playerMoveDown = () => {
    if (turn == true) {
      setP1y(p1y - length);
      setTurn(false);
    }
    else {
      setP2y(p2y - length);
      setTurn(true);
    }
  };

  const renderPlayer = () => {
    return (
      <>
        <Image style={{...styles.pawn, left: p1x, top: p1y}} source={{uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/b01ef9b4f2c29b730c5dd509f0dc36d2'}}/>
        <Image style={{...styles.pawn, left: p2x, top: p2y}} source={{uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/90b77e5979766ced2ece86cb02713f1d'}}/>
        {turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: p1x + length, top: p1y }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: p2x + length, top: p2y }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: p1x - length, top: p1y }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: p2x - length, top: p2y }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: p1x, top: p1y + length }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: p2x, top: p2y + length }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: p1x, top: p1y - length }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: p2x, top: p2y - length }}></View>
          </TouchableWithoutFeedback>
        ): null}
      </>
    );
  };

	useEffect(() => {
		const win = async () => {
			await console.log(p1y);
			if (p1y == length * 8) {
				await Alert.alert('End of game', 'Player1 win!');
			}
			else if (p2y == 0) {
				await Alert.alert('End of game', 'Player2 win!');
			}
		};
		win();
	}, [p1y, p2y]);

	if (p1y == length * 8) {
		Alert.alert('End of this game', 'Player1 win!');
	}
	else if (p2y == 0) {
		Alert.alert('End of this game', 'Player2 win!');
	}

	const exit = () => {
		
	}

  return (
		<>
	    <View style={styles.gameContainer}>
				{renderHor()}
				{renderVer()}
				{renderPlayer()}
				{walls}
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
	exitBtn: {
		width: 50,
		height: 20,
		backgroundColor: 'skyblue',
	},
});