import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Text, Image, Dimensions, Alert, Button } from 'react-native';
import { Link } from 'expo-router';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const length = (windowWidth - 55) / 9;

export default function SingleScreen() {
	const [p1x, setP1x] = useState(4);
	const [p1y, setP1y] = useState(0);
  const [p2x, setP2x] = useState(4);
  const [p2y, setP2y] = useState(8);
  const [turn, setTurn] = useState(true);
  // p1 true p2 false

  const [walls, setWalls] = useState([]);
	const [squares, setSquares] = useState([]);
  const [p1C, setP1C] = useState(10);
  const [p2C, setP2C] = useState(10);
	
	useEffect(() => {
		const win = async () => {
			if (p1y == length * 8) {
				await Alert.alert('End of game', 'Player1 win!');
			}
			else if (p2y == 0) {
				await Alert.alert('End of game', 'Player2 win!');
			}
		};
		win();
	}, [p1y, p2y]);
	
	const isThroughSquare = (x, y) => {
		for (let i of Object.keys(squares)) {
			console.log(squares[i].top+' '+squares[i].left);
			if ((Math.abs(squares[i].left - x) <= length + 1 && Math.abs(squares[i].top - y) <= 1 ) || (Math.abs(squares[i].left - x) <= 1 && Math.abs(squares[i].top - y) <= length + 1)) {
				console.log('through2');
				return true;
			}
		}
		return false;
	};
	
  const renderHor = () => {
    const hor = [];
		const horWall = [];
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < 9; j++) {
				hor.push(
					<TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
						if (turn == true && p1C > 0 && !isThroughSquare(j * (5 + length) + 5, i * (5 + length))) {
							setWalls(currentWalls => [...currentWalls,
							<View key={`${i}-${j}-1`} style={{...styles.horWall, left: j * (5 + length) + 5, top: i * (5 + length)}}></View>]);
							setSquares(currentSquares => [...currentSquares,
							<View key={`${i}-${j}-2`} style={{...styles.square, left: j * (5 + length) + 5 + length, top: i * (5 + length)}}></View>]);
							setWalls(currentWalls => [...currentWalls,
							<View key={`${i}-${j}-3`} style={{...styles.horWall, left: (j + 1) * (5 + length) + 5, top: i * (5 + length)}}></View>]);
							setP1C(p1C - 1);
							setTurn(false);
						}
						else if (turn == false && p2C > 0 && !isThroughSquare(j * (5 + length) + 5, i * (5 + length))) {
							setWalls(currentWalls => [...currentWalls,
							<View key={`${i}-${j}-1`} style={{...styles.horWall, left: j * (5 + length) + 5, top: i * (5 + length)}}></View>]);
							setSquares(currentSquares => [...currentSquares,
							<View key={`${i}-${j}-2`} style={{...styles.square, left: j * (5 + length) + 5 + length, top: i * (5 + length)}}></View>]);
							setWalls(currentWalls => [...currentWalls,
							<View key={`${i}-${j}-3`} style={{...styles.horWall, left: (j + 1) * (5 + length) + 5, top: i * (5 + length)}}></View>]);
							setP2C(p2C - 1);
							setTurn(true);
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
		const verWall = [];
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < 9; j++) {
				ver.push(
					<TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
						if (turn == true && p1C > 0 && !isThroughSquare(i * (5 + length), j * (length + 5) + 5)) {
							setWalls(currentWalls => [...currentWalls,
							<View key={`${i}-${j}-1`} style={{...styles.verWall, left: i * (5 + length), top: j * (length + 5) + 5}}></View>]);
							setSquares(currentSquares => [...currentSquares,
							<View key={`${i}-${j}-2`} style={{...styles.square, left: i * (5 + length), top: j * (length + 5) + 5 + length}}></View>]);
							setWalls(currentWalls => [...currentWalls,
							<View key={`${i}-${j}-3`} style={{...styles.verWall, left: i * (5 + length), top: (j + 1) * (length + 5) + 5}}></View>]);
							setP1C(p1C - 1);
							setTurn(false);
						}
						else if (turn == false && p2C > 0 && !isThroughSquare(i * (5 + length), j * (length + 5) + 5)) {
							setWalls(currentWalls => [...currentWalls,
							<View key={`${i}-${j}-1`} style={{...styles.verWall, left: i * (5 + length), top: j * (length + 5) + 5}}></View>]);
							setSquares(currentSquares => [...currentSquares,
							<View key={`${i}-${j}-2`} style={{...styles.square, left: i * (5 + length), top: j * (length + 5) + 5 + length}}></View>]);
							setWalls(currentWalls => [...currentWalls,
							<View key={`${i}-${j}-3`} style={{...styles.verWall, left: i * (5 + length), top: (j + 1) * (length + 5) + 5}}></View>]);
							setP2C(p2C - 1);
							setTurn(true);
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
    if (turn === true) {
      setP1x(p1x + 1);
      setTurn(false);
    } else if (turn === false) {
      setP2x(p2x + 1);
      setTurn(true);
    }
  };

  const playerMoveLeft = () => {
    if (turn === true) {
      setP1x(p1x - 1);
      setTurn(false);
    } else if (turn === false) {
      setP2x(p2x - 1);
      setTurn(true);
    }
  };

  const playerMoveUp = () => {
    if (turn === true) {
      setP1y(p1y - 1);
      setTurn(false);
    } else if (turn === false) {
      setP2y(p2y - 1);
      setTurn(true);
    }
  };

  const playerMoveDown = () => {
    if (turn === true) {
      setP1y(p1y + 1);
      setTurn(false);
    } else if (turn === false) {
      setP2y(p2y + 1);
      setTurn(true);
    }
  };

  const renderPlayer = () => {
    return (
      <>
				<Image style={{...styles.pawn, left: p1x * (5 + length) + 5, top: p1y * (5 + length) + 5 }} source={{uri: "https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/64f5a7a595ec652823c94f4fcf2abe09"}}/>
        <Image style={{...styles.pawn, left: p2x * (5 + length) + 5, top: p2y * (5 + length) + 5 }} source={{uri: "https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/cacb3335a59b92eedefc10dfaf3e9dea"}}/>
        {turn == true && isMoveValid(p1x, p1y, 'right') ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: (p1x + 1) * (5 + length) + 5 + length * 0.3, top: p1y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{turn == false && isMoveValid(p2x, p2y, 'right') ? (
					<TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: (p2x + 1) * (5 + length) + 5 + length * 0.3, top: p2y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
				) : null }
        {turn == true && isMoveValid(p1x, p1y, 'left') ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: (p1x - 1) * (5 + length) + 5 + length * 0.3, top: p1y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{turn == false && isMoveValid(p2x, p2y, 'left') ? (
					<TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: (p2x - 1) * (5 + length) + 5 + length * 0.3, top: p2y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
				) : null }
        {turn == true && isMoveValid(p1x, p1y, 'up') ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: p1x * (5 + length) + 5 + length * 0.3, top: (p1y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{turn == false && isMoveValid(p2x, p2y, 'up') ? (
					<TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: p2x * (5 + length) + 5 + length * 0.3, top: (p2y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
				) : null }
				{turn == true && isMoveValid(p1x, p1y, 'down') ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: p1x * (5 + length) + 5 + length * 0.3, top: (p1y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{turn == false && isMoveValid(p2x, p2y, 'down') ? (
					<TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: p2x * (5 + length) + 5 + length * 0.3, top: (p2y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
				) : null }
      </>
    );
  };

	const isMoveValid = (x, y, direction) => {
    for (let wall of walls) {
			const wallLeft = wall.props.style.left;
			const wallTop = wall.props.style.top;
      if (direction == 'right' && wallLeft == x * (5 + length) + 5 + length && wallTop == y * (5 + length) + 5) {
        return false;
      }
      if (direction == 'left' && wallLeft == x * (5 + length) + 5 - 5  && wallTop == y * (5 + length) + 5) {
        return false;
      }
      if (direction == 'up' && wallLeft == x * (5 + length) + 5 && wallTop == y * (5 + length) + 5 - 5) {
        return false;
      }
      if (direction == 'down' && wallLeft == x * (5 + length) + 5 && wallTop == y * (5 + length) + 5 + length) {
        return false;
      }
    }
		if (direction == 'up' && y == 0) {
			return false;
		}
		if (direction == 'down' && y == 8) {
			return false;
		}
    return true;
  };

  return (
		<View style={styles.Container}>
	    <View style={styles.gameContainer}>
				{renderHor()}
				{renderVer()}
				{renderPlayer()}
				{walls}
				{squares}
				{console.log(walls)}
				{console.log(squares)}
				{console.log(length)}
	    </View>
			<Link href='/' asChild>
				<TouchableWithoutFeedback>
					<Text style={styles.exitBtn}>EXIT</Text>
				</TouchableWithoutFeedback>
			</Link>
		</View>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    backgroundColor: 'tomato',
    width: windowWidth,
    height: windowWidth,
		marginTop: 150,
  },
  pawn: {
    width: length,
    height: length,
    position: 'absolute',
  },
  moveTile: {
    width: length * 0.4,
    height: length * 0.4,
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
	square: {
		width: 5,
		height: 5,
		backgroundColor: 'white',
		position: 'absolute',
	}
});