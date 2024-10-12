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
	
	const isThrough = (wl, wt) => {
		if (Math.abs(8 * (5 + length) + 5 - wl) <= 1 || Math.abs(8 * (5 + length) + 5 - wt) <= 1) {
			return true;
		}
		for (let i of Object.keys(squares)) {
			if (squares[i].type == 'hor') {
				let squareLeft = squares[i].x * (5 + length) + 5 + length;
				let squareTop = squares[i].y * (5 + length);
				if ((Math.abs(squareLeft - wl) <= length + 1 && Math.abs(squareTop - wt) <= 1 ) || (Math.abs(squareLeft - wl) <= 1 && Math.abs(squareTop - wt) <= length + 1)) {
					return true;
				}
			} else if (squares[i].type == 'ver') {
				let squareLeft = squares[i].x * (5 + length);
				let squareTop = squares[i].y * (5 + length) + 5 + length;
				if ((Math.abs(squareLeft - wl) <= length + 1 && Math.abs(squareTop - wt) <= 1 ) || (Math.abs(squareLeft - wl) <= 1 && Math.abs(squareTop - wt) <= length + 1)) {
					return true;
				}
			}
		}
		for (let i of Object.keys(walls)) {
			if (walls[i].type == 'hor') {
				let wallLeft = walls[i].x * (5 + length) + 5;
				let wallTop = walls[i].y * (5 + length);
				if (wallLeft - wl <= 5 + length + 1 && wallLeft > wl && Math.abs(wallTop - wt) <= 1) {
					return true;
				}
			} else if (walls[i].type == 'ver') {
				let wallLeft = walls[i].x * (5 + length);
				let wallTop = walls[i].y * (5 + length) + 5;
				if (Math.abs(wallLeft - wl) <= 1 && wallTop - wt <= 5 + length + 1 && wallTop > wt) {
					return true;
				}
			}
		}
		return false;
	};
	
	// BFS를 사용하여 목적지까지 도달할 수 있는지 확인하는 함수
	const canReachDestination = (startX, startY, targetY, walls) => {
		const queue = [[startX, startY]];
		const visited = Array(9).fill().map(() => Array(9).fill(false));
		visited[startX][startY] = true;

		const directions = [
			[0, 1],  // 아래로 이동
			[0, -1], // 위로 이동
			[1, 0],  // 오른쪽으로 이동
			[-1, 0], // 왼쪽으로 이동
		];

		while (queue.length > 0) {
			const [x, y] = queue.shift();

			// 플레이어가 목표 지점에 도달한 경우
			if (y === targetY) {
				return true;
			}

			for (let [dx, dy] of directions) {
				const newX = x + dx;
				const newY = y + dy;

				// 새로운 좌표가 유효한 범위 내에 있고, 방문하지 않았으며, 해당 방향으로 이동이 가능한 경우
				if (newX >= 0 && newX < 9 && newY >= 0 && newY < 9 && !visited[newX][newY] && isMoveValid(x, y, dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up', walls)) {
					visited[newX][newY] = true;
					queue.push([newX, newY]);
				}
			}
		}
		// 목표 지점에 도달할 수 없을 때 false 반환
		console.log('cant destination');
		return false;
	};
	
	const canPlaceWall = (type, wallX, wallY) => {
		if (type == 'hor' && !isThrough(wallX * (5 + length) + 5, wallY * (5 + length))) {
			let tryWalls = [...walls, {type: type, x: wallX, y: wallY}, {type: type, x: wallX + 1, y: wallY}];
			let trySquares = [...squares, {type: type, x: wallX, y: wallY}];
			if (canReachDestination(p1x, p1y, 8, tryWalls) && canReachDestination(p2x, p2y, 0, tryWalls)) {
				setWalls(tryWalls);
				setSquares(trySquares)
				console.log('canDestination');
				return true;
			}
			else {
				console.log('cantplaceWall!');
				return false;
			}
		} else if (type == 'ver' && !isThrough(wallX * (5 + length), wallY * (5 + length) + 5)) {
			let tryWalls = [...walls, {type: type, x: wallX, y: wallY}, {type: type, x: wallX, y: wallY + 1}];
			let trySquares = [...squares, {type: type, x: wallX, y: wallY}];
			if (canReachDestination(p1x, p1y, 8, tryWalls) && canReachDestination(p2x, p2y, 0, tryWalls)) {
				setWalls(tryWalls);
				setSquares(trySquares)
				console.log('canDestination');
				return true;
			}
			else {
				console.log('cantplaceWall!');
				return false;
			}
		}
		else {
			console.log('isThrough!');
			return false;
		}
	};

  const renderHor = () => {
    const hor = [];
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < 9; j++) {
				hor.push(
					<TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
						if (turn == true && p1C > 0) {
							if (canPlaceWall('hor', j, i)) {
								setP1C(p1C - 1);
								setTurn(false);
							}
						} else if (turn == false && p2C > 0) {
							if (canPlaceWall('hor', j, i)) {
								setP2C(p2C - 1);
								setTurn(true);
							}
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
						if (turn == true && p1C > 0) {
							if (canPlaceWall('ver', i, j)) {
								setP1C(p1C - 1);
								setTurn(false);
							}
						} else if (turn == false && p2C > 0) {
							if (canPlaceWall('ver', i, j)) {
								setP2C(p2C - 1);
								setTurn(true);
							}
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
        {turn == true && isMoveValid(p1x, p1y, 'right', walls) ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: (p1x + 1) * (5 + length) + 5 + length * 0.3, top: p1y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{turn == false && isMoveValid(p2x, p2y, 'right', walls) ? (
					<TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: (p2x + 1) * (5 + length) + 5 + length * 0.3, top: p2y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
				) : null }
        {turn == true && isMoveValid(p1x, p1y, 'left', walls) ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: (p1x - 1) * (5 + length) + 5 + length * 0.3, top: p1y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{turn == false && isMoveValid(p2x, p2y, 'left', walls) ? (
					<TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: (p2x - 1) * (5 + length) + 5 + length * 0.3, top: p2y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
				) : null }
        {turn == true && isMoveValid(p1x, p1y, 'up', walls) ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: p1x * (5 + length) + 5 + length * 0.3, top: (p1y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{turn == false && isMoveValid(p2x, p2y, 'up', walls) ? (
					<TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: p2x * (5 + length) + 5 + length * 0.3, top: (p2y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
				) : null }
				{turn == true && isMoveValid(p1x, p1y, 'down', walls) ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: p1x * (5 + length) + 5 + length * 0.3, top: (p1y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{turn == false && isMoveValid(p2x, p2y, 'down', walls) ? (
					<TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: p2x * (5 + length) + 5 + length * 0.3, top: (p2y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
				) : null }
      </>
    );
  };

	const isMoveValid = (x, y, direction, walls) => {
		for (let i of Object.keys(walls)) {
			if (walls[i].type == 'hor') {
				let wallX = walls[i].x * (5 + length) + 5;
				let wallY = walls[i].y * (5 + length);
				if (direction == 'right' && Math.abs(x * (5 + length) + 5 + length - wallX) <= 1 && Math.abs(y * (5 + length) + 5 - wallY) <= 1) {
					return false;
				}
				if (direction == 'left' && Math.abs(x * (5 + length) + 5 - 5 - wallX) <= 1 && Math.abs(y * (5 + length) + 5 - wallY) <= 1) {
					return false;
				}
				if (direction == 'up' && Math.abs(x * (5 + length) + 5 - wallX) <= 1 && Math.abs(y * (5 + length) + 5 - 5 - wallY) <= 1) {
					return false;
				}
				if (direction == 'down' && Math.abs(x * (5 + length) + 5 - wallX) <= 1 && Math.abs(y * (5 + length) + 5 + length - wallY) <= 1) {
					return false;
				}
				if (direction == 'up' && y == 0) {
					return false;
				}
				if (direction == 'down' && y == 8) {
					return false;
				}
			} else if (walls[i].type == 'ver') {
				let wallX = walls[i].x * (5 + length);
				let wallY = walls[i].y * (5 + length) + 5;
				if (direction == 'right' && Math.abs(x * (5 + length) + 5 + length - wallX) <= 1 && Math.abs(y * (5 + length) + 5 - wallY) <= 1) {
					return false;
				}
				if (direction == 'left' && Math.abs(x * (5 + length) + 5 - 5 - wallX) <= 1 && Math.abs(y * (5 + length) + 5 - wallY) <= 1) {
					return false;
				}
				if (direction == 'up' && Math.abs(x * (5 + length) + 5 - wallX) <= 1 && Math.abs(y * (5 + length) + 5 - 5 - wallY) <= 1) {
					return false;
				}
				if (direction == 'down' && Math.abs(x * (5 + length) + 5 - wallX) <= 1 && Math.abs(y * (5 + length) + 5 + length - wallY) <= 1) {
					return false;
				}
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

  const renderWalls = () => {
		return Object.keys(walls).map((key, index) => {
			if (walls[key].type == 'hor') {
				let wallX = walls[key].x * (5 + length) + 5;
				let wallY = walls[key].y * (5 + length);
				return (<View key={`wall-${index}`} style={{...styles.horWall, left: wallX, top: wallY}}></View>);
			} else if (walls[key].type == 'ver') {
				let wallX = walls[key].x * (5 + length);
				let wallY = walls[key].y * (5 + length) + 5;
				return (<View key={`wall-${index}`} style={{...styles.verWall, left: wallX, top: wallY}}></View>);
			}
		})
	};

	const renderSquares = () => {
		return Object.keys(squares).map((key, index) => {
			if (squares[key].type == 'hor') {
				let squareX = squares[key].x * (5 + length) + 5 + length;
				let squareY = squares[key].y * (5 + length);
				return (<View key={`square-${index}`} style={{...styles.square, left: squareX, top: squareY}}></View>);
			} else if (squares[key].type == 'ver') {
				let squareX = squares[key].x * (5 + length);
				let squareY = squares[key].y * (5 + length) + 5 + length;
				return (<View key={`square-${index}`} style={{...styles.square, left: squareX, top: squareY}}></View>);
			}
		})
	};

  return (
		<View style={styles.Container}>
	    <View style={styles.gameContainer}>
				{renderHor()}
				{renderVer()}
				{renderPlayer()}
				{renderWalls()}
				{renderSquares()}
				{console.log(canReachDestination(p1x, p1y, 8, walls))}
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