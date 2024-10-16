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
	const [squares, setSquares] = useState({});
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
			const squareRef = ref(database, '/rooms/' + await AsyncStorage.getItem('myRoomId') + '/squares');
			await onValue(squareRef, (snapshot) => {
				if (snapshot.exists()) {
					setSquares(snapshot.val());
				}
			});
			const moveRef = ref(database, '/rooms/' + await AsyncStorage.getItem('myRoomId') + '/moves');
			await onValue(squareRef, (snapshot) => {
				if (snapshot.exists()) {
					setSquares(snapshot.val());
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
		const win = async () => {
			if (game.p1y == length * 8) {
				await Alert.alert('End of game', 'Player1 win!');
			}
			else if (game.p2y == 0) {
				await Alert.alert('End of game', 'Player2 win!');
			}
		};
		win();
	}, [game]);
	
	const isThrough = (wl, wt) => {
		if (Math.abs(8 * (5 + length) + 5 - wl) <= 1 || Math.abs(8 * (5 + length) + 5 - wt) <= 1) {
			return true;
		}
		for (let i of Object.keys(squares)) {
			if (squares[i].type == 'hor') {
				let squareLeft = squares[i].x * (5 + length) + 5 + length;
				let squareTop = squares[i].y * (5 + length);
				if ((Math.abs(squareLeft - wl) <= length + 1 && Math.abs(squareLeft - wl) >= 6 && Math.abs(squareTop - wt) <= 1) || (Math.abs(squareLeft - wl) <= 1 && Math.abs(squareTop - wt) <= length + 1 && Math.abs(squareTop - wt) >= 6)) {
					return true;
				}
			} else if (squares[i].type == 'ver') {
				let squareLeft = squares[i].x * (5 + length);
				let squareTop = squares[i].y * (5 + length) + 5 + length;
				if ((Math.abs(squareLeft - wl) <= length + 1 && Math.abs(squareLeft - wl) >= 6 && Math.abs(squareTop - wt) <= 1) || (Math.abs(squareLeft - wl) <= 1 && Math.abs(squareTop - wt) <= length + 1 && Math.abs(squareTop - wt) >= 6)) {
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
		return false;
	};
	
	const canPlaceWall = (type, wallX, wallY) => {
		if (type == 'hor' && !isThrough(wallX * (5 + length) + 5, wallY * (5 + length))) {
			let tryWalls = [...walls, {type: type, x: wallX, y: wallY}, {type: type, x: wallX + 1, y: wallY}];
			let trySquares = [...squares, {type: type, x: wallX, y: wallY}];
			if (canReachDestination(game.p1x, game.p1y, 8, tryWalls) && canReachDestination(game.p2x, game.p2y, 0, tryWalls)) {
				setGame(prevGame => ({
					...prevGame,
					walls: tryWalls,
					squares: trySquares,
				}));
				return true;
			}
			else {
				return false;
			}
		} else if (type == 'ver' && !isThrough(wallX * (5 + length), wallY * (5 + length) + 5)) {
			let tryWalls = [...walls, {type: type, x: wallX, y: wallY}, {type: type, x: wallX, y: wallY + 1}];
			let trySquares = [...squares, {type: type, x: wallX, y: wallY}];
			if (canReachDestination(game.p1x, game.p1y, 8, tryWalls) && canReachDestination(game.p2x, game.p2y, 0, tryWalls)) {
				setGame(prevGame => ({
					...prevGame,
					walls: tryWalls,
					squares: trySquares,
				}));
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	};
	
	const renderHor = () => {
		const hor = [];
		for (let i = 0; i <= 9; i++) {
			for (let j = 0; j < 9; j++) {
				hor.push(
					<TouchableWithoutFeedback key={`${i}-${j}`} onPress={() => {
						if (game.turn == true && game.p1C > 0 && myName == game.hostName) {
							if (canPlaceWall('hor', j, i)) {
								setGame(prevGame => ({
									...prevGame,
									p1C: prevGame.p1C - 1,
									turn: false,
								}));
							}
						}
						else if (game.turn == false && game.p2C > 0 && myName == game.guestName) {
							if (canPlaceWall('hor', j, i)) {
								setGame(prevGame => ({
									...prevGame,
									p2C: prevGame.p2C - 1,
									turn: true,
								}));
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
						if (game.turn == true && game.p1C > 0) {
							if (canPlaceWall('ver', i, j)) {
								setGame(prevGame => ({
									...prevGame,
									p1C: prevGame.p1C - 1,
									turn: false,
								}));
							}
						}
						else if (game.turn == false && game.p2C > 0) {
							if (canPlaceWall('ver', i, j)) {
								setGame(prevGame => ({
									...prevGame,
									p2C: prevGame.p2C - 1,
									turn: true,
								}));
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
	
	const renderPlayer = () => {
		if (!game || Object.keys(game).length === 0) {
    	return null;
  	}
    return (
      <>
        <Image style={{...styles.pawn, left: game.p1x * (5 + length) + 5, top: game.p1y * (5 + length) + 5 }} source={{uri: "https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/64f5a7a595ec652823c94f4fcf2abe09"}} />
        <Image style={{...styles.pawn, left: game.p2x * (5 + length) + 5, top: game.p2y * (5 + length) + 5 }} source={{uri: "https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/cacb3335a59b92eedefc10dfaf3e9dea"}} />
			
				{/*player1 right*/}
			
        {game.turn == true && !(game.p1y == game.p2y && game.p1x + 1 == game.p2x) && isMoveValid(game.p1x, game.p1y, 'right', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x + 1, p1y: prevGame.p1y, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x + 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x + 1) * (5 + length) + 5 + length * 0.3, top: game.p1y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null}
				{game.turn == true && game.p1y == game.p2y && game.p1x + 1 == game.p2x && isMoveValid(game.p2x, game.p2y, 'right', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x + 2, p1y: prevGame.p1y, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x + 2,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x + 2) * (5 + length) + 5 + length * 0.3, top: game.p1y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1y == game.p2y && game.p1x + 1 == game.p2x && !isMoveValid(game.p2x, game.p2y, 'right', walls) && isMoveValid(game.p2x, game.p2y, 'up', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x + 1, p1y: prevGame.p1y - 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x + 1,
								p1y: prevGame.p1y - 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x + 1) * (5 + length) + 5 + length * 0.3, top: (game.p1y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1y == game.p2y && game.p1x + 1 == game.p2x && !isMoveValid(game.p2x, game.p2y, 'right', walls) && isMoveValid(game.p2x, game.p2y, 'down', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x + 1, p1y: prevGame.p1y + 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x + 1,
								p1y: prevGame.p1y + 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x + 1) * (5 + length) + 5 + length * 0.3, top: (game.p1y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
	
				{/*player2 right*/}
	
				{game.turn == false && !(game.p2y == game.p1y && game.p2x + 1 == game.p1x) && isMoveValid(game.p2x, game.p2y, 'right', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x + 1, p2y: prevGame.p2y}],
								p2x: prevGame.p2x + 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x + 1) * (5 + length) + 5 + length * 0.3, top: game.p2y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2y == game.p1y && game.p2x + 1 == game.p1x && isMoveValid(game.p1x, game.p1y, 'right', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x + 2, p2y: prevGame.p2y}],
								p2x: prevGame.p2x + 2,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x + 2) * (5 + length) + 5 + length * 0.3, top: game.p2y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2y == game.p1y && game.p2x + 1 == game.p1x && !isMoveValid(game.p1x, game.p1y, 'right', walls) && isMoveValid(game.p1x, game.p1y, 'up', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x + 1, p2y: prevGame.p2y - 1}],
								p2x: prevGame.p2x + 1,
								p2y: prevGame.p2y - 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x + 1) * (5 + length) + 5 + length * 0.3, top: (game.p2y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2y == game.p1y && game.p2x + 1 == game.p1x && !isMoveValid(game.p1x, game.p1y, 'right', walls) && isMoveValid(game.p1x, game.p1y, 'down', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x + 1, p2y: prevGame.p2y + 1}],
								p2x: prevGame.p2x + 1,
								p2y: prevGame.p2y + 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x + 1) * (5 + length) + 5 + length * 0.3, top: (game.p2y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
	
				{/*player1 left*/}
	
        {game.turn == true && !(game.p1y == game.p2y && game.p1x - 1 == game.p2x) && isMoveValid(game.p1x, game.p1y, 'left', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x - 1, p1y: prevGame.p1y, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x - 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x - 1) * (5 + length) + 5 + length * 0.3, top: game.p1y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1y == game.p2y && game.p1x - 1 == game.p2x && isMoveValid(game.p2x, game.p2y, 'left', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x - 2, p1y: prevGame.p1y, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x - 2,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x - 2) * (5 + length) + 5 + length * 0.3, top: game.p1y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1y == game.p2y && game.p1x - 1 == game.p2x && !isMoveValid(game.p2x, game.p2y, 'left', walls) && isMoveValid(game.p2x, game.p2y, 'up', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x - 1, p1y: prevGame.p1y - 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x - 1,
								p1y: prevGame.p1y - 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x - 1) * (5 + length) + 5 + length * 0.3, top: (game.p1y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1y == game.p2y && game.p1x - 1 == game.p2x && !isMoveValid(game.p2x, game.p2y, 'left', walls) && isMoveValid(game.p2x, game.p2y, 'down', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x - 1, p1y: prevGame.p1y + 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x - 1,
								p1y: prevGame.p1y + 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x - 1) * (5 + length) + 5 + length * 0.3, top: (game.p1y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
	
				{/*player2 left*/}
	
				{game.turn == false && !(game.p2y == game.p1y && game.p2x - 1 == game.p1x) && isMoveValid(game.p2x, game.p2y, 'left', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x - 1, p2y: prevGame.p2y}],
								p2x: prevGame.p2x - 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x - 1) * (5 + length) + 5 + length * 0.3, top: game.p2y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2y == game.p1y && game.p2x - 1 == game.p1x && isMoveValid(game.p1x, game.p1y, 'left', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x - 2, p2y: prevGame.p2y}],
								p2x: prevGame.p2x - 2,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x - 2) * (5 + length) + 5 + length * 0.3, top: game.p2y * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2y == game.p1y && game.p2x - 1 == game.p1x && !isMoveValid(game.p1x, game.p1y, 'left', walls) && isMoveValid(game.p1x, game.p1y, 'up', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x - 1, p2y: prevGame.p2y - 1}],
								p2x: prevGame.p2x - 1,
								p2y: prevGame.p2y - 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x - 1) * (5 + length) + 5 + length * 0.3, top: (game.p2y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2y == game.p1y && game.p2x - 1 == game.p1x && !isMoveValid(game.p1x, game.p1y, 'left', walls) && isMoveValid(game.p1x, game.p1y, 'down', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x - 1, p2y: prevGame.p2y + 1}],
								p2x: prevGame.p2x - 1,
								p2y: prevGame.p2y + 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x - 1) * (5 + length) + 5 + length * 0.3, top: (game.p2y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
	
				{/*player1 up*/}
	
				{game.turn == true && !(game.p1x == game.p2x && game.p1y - 1 == game.p2y) && isMoveValid(game.p1x, game.p1y, 'up', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y - 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1y: prevGame.p1y - 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: game.p1x * (5 + length) + 5 + length * 0.3, top: (game.p1y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1x == game.p2x && game.p1y - 1 == game.p2y && isMoveValid(game.p2x, game.p2y, 'up', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y - 2, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1y: prevGame.p1y - 2,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: game.p1x * (5 + length) + 5 + length * 0.3, top: (game.p1y - 2) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1x == game.p2x && game.p1y - 1 == game.p2y && !isMoveValid(game.p2x, game.p2y, 'up', walls) && isMoveValid(game.p2x, game.p2y, 'left', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x - 1, p1y: prevGame.p1y - 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x - 1,
								p1y: prevGame.p1y - 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x - 1) * (5 + length) + 5 + length * 0.3, top: (game.p1y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1x == game.p2x && game.p1y - 1 == game.p2y && !isMoveValid(game.p2x, game.p2y, 'up', walls) && isMoveValid(game.p2x, game.p2y, 'right', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x + 1, p1y: prevGame.p1y - 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x + 1,
								p1y: prevGame.p1y - 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p1x + 1) * (5 + length) + 5 + length * 0.3, top: (game.p1y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
	
				{/*player2 up*/}
	
				{game.turn == false && !(game.p2x == game.p1x && game.p2y - 1 == game.p1y) && isMoveValid(game.p2x, game.p2y, 'up', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x, p2y: prevGame.p2y - 1}],
								p2y: prevGame.p2y - 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: game.p2x * (5 + length) + 5 + length * 0.3, top: (game.p2y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2x == game.p1x && game.p2y - 1 == game.p1y && isMoveValid(game.p1x, game.p1y, 'up', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x, p2y: prevGame.p2y - 2}],
								p2y: prevGame.p2y - 2,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: game.p2x * (5 + length) + 5 + length * 0.3, top: (game.p2y - 2) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2x == game.p1x && game.p2y - 1 == game.p1y && !isMoveValid(game.p1x, game.p1y, 'up', walls) && isMoveValid(game.p1x, game.p1y, 'left', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x - 1, p2y: prevGame.p2y - 1}],
								p2x: prevGame.p2x - 1,
								p2y: prevGame.p2y - 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x - 1) * (5 + length) + 5 + length * 0.3, top: (game.p2y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2x == game.p1x && game.p2y - 1 == game.p1y && !isMoveValid(game.p1x, game.p1y, 'up', walls) && isMoveValid(game.p1x, game.p1y, 'right', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x + 1, p2y: prevGame.p2y - 1}],
								p2x: prevGame.p2x + 1,
								p2y: prevGame.p2y - 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: (game.p2x + 1) * (5 + length) + 5 + length * 0.3, top: (game.p2y - 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
	
				{/*player1 down*/}
	
				{game.turn == true && !(game.p1x == game.p2x && game.p1y + 1 == game.p2y) && isMoveValid(game.p1x, game.p1y, 'down', walls) && myName == game.hostName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y + 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1y: prevGame.p1y + 1,
								turn: false,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: game.p1x * (5 + length) + 5 + length * 0.3, top: (game.p1y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == true && game.p1x == game.p2x && game.p1y + 1 == game.p2y && isMoveValid(game.p2x, game.p2y, 'down', walls) && myName == game.hostName ? (
					<TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y + 2, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1y: prevGame.p1y + 2,
								turn: false,
							}));
					}}>
						<View style={{ ...styles.moveTile, left: game.p1x * (5 + length) + 5 + length * 0.3, top: (game.p1y + 2) * (5 + length) + 5 + length * 0.3 }}></View>
					</TouchableWithoutFeedback>
      	) : null }
				{game.turn == true && game.p1x == game.p2x && game.p1y + 1 == game.p2y && !isMoveValid(game.p2x, game.p2y, 'down', walls) && isMoveValid(game.p2x, game.p2y, 'left', walls) && myName == game.hostName ? (
					<TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x - 1, p1y: prevGame.p1y + 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x - 1,
								p1y: prevGame.p1y + 1,
								turn: false,
							}));
					}}>
						<View style={{ ...styles.moveTile, left: (game.p1x - 1) * (5 + length) + 5 + length * 0.3, top: (game.p1y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
					</TouchableWithoutFeedback>
      	) : null }
				{game.turn == true && game.p1x == game.p2x && game.p1y + 1 == game.p2y && !isMoveValid(game.p2x, game.p2y, 'down', walls) && isMoveValid(game.p2x, game.p2y, 'right', walls) && myName == game.hostName ? (
					<TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x + 1, p1y: prevGame.p1y + 1, p2x: prevGame.p2x, p2y: prevGame.p2y}],
								p1x: prevGame.p1x + 1,
								p1y: prevGame.p1y + 1,
								turn: false,
							}));
					}}>
						<View style={{ ...styles.moveTile, left: (game.p1x + 1) * (5 + length) + 5 + length * 0.3, top: (game.p1y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
					</TouchableWithoutFeedback>
      	) : null }
	
				{/*player2 down*/}
	
				{game.turn == false && !(game.p2x == game.p1x && game.p2y + 1 == game.p1y) && isMoveValid(game.p2x, game.p2y, 'down', walls) && myName == game.guestName ? (
          <TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x, p2y: prevGame.p2y + 1}],
								p2y: prevGame.p2y + 1,
								turn: true,
							}));
					}}>
            <View style={{ ...styles.moveTile, left: game.p2x * (5 + length) + 5 + length * 0.3, top: (game.p2y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
          </TouchableWithoutFeedback>
        ) : null }
				{game.turn == false && game.p2x == game.p1x && game.p2y + 1 == game.p1y && isMoveValid(game.p1x, game.p1y, 'down', walls) && myName == game.guestName ? (
					<TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x, p2y: prevGame.p2y + 2}],
								p2y: prevGame.p2y + 2,
								turn: true,
							}));
					}}>
						<View style={{ ...styles.moveTile, left: game.p2x * (5 + length) + 5 + length * 0.3, top: (game.p2y + 2) * (5 + length) + 5 + length * 0.3 }}></View>
					</TouchableWithoutFeedback>
      	) : null }
				{game.turn == false && game.p2x == game.p1x && game.p2y + 1 == game.p1y && !isMoveValid(game.p1x, game.p1y, 'down', walls) && isMoveValid(game.p1x, game.p1y, 'left', walls) && myName == game.guestName ? (
					<TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x - 1, p2y: prevGame.p2y + 1}],
								p2x: prevGame.p2x - 1,
								p2y: prevGame.p2y + 1,
								turn: true,
							}));
					}}>
						<View style={{ ...styles.moveTile, left: (game.p2x - 1) * (5 + length) + 5 + length * 0.3, top: (game.p2y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
					</TouchableWithoutFeedback>
      	) : null }
				{game.turn == false && game.p2x == game.p1x && game.p2y + 1 == game.p1y && !isMoveValid(game.p1x, game.p1y, 'down', walls) && isMoveValid(game.p1x, game.p1y, 'right', walls) && myName == game.guestName ? (
					<TouchableWithoutFeedback onPress={() => {
							setGame(prevGame => ({
								...prevGame,
								moves: [...prevGame.moves, {p1x: prevGame.p1x, p1y: prevGame.p1y, p2x: prevGame.p2x + 1, p2y: prevGame.p2y + 1}],
								p2x: prevGame.p2x + 1,
								p2y: prevGame.p2y + 1,
								turn: true,
							}));
					}}>
						<View style={{ ...styles.moveTile, left: (game.p2x + 1) * (5 + length) + 5 + length * 0.3, top: (game.p2y + 1) * (5 + length) + 5 + length * 0.3 }}></View>
					</TouchableWithoutFeedback>
      	) : null }
      </>
    );
  };
	
	const renderWalls = () => {
		if (!walls || Object.keys(walls).length === 0) {
    	return null;
  	}
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
		});
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
			<View style={{width: 20, height: 20, backgroundColor: 'white', marginTop: 30, marginLeft: 30}}></View>
			<Text style={{fontSize: 30, marginTop: 30, marginLeft: 30}}>{game.p1C}</Text>
			<View style={styles.gameContainer}>
				{renderHor()}
				{renderVer()}
				{renderPlayer()}
				{renderWalls()}
				{renderSquares()}
			</View>
			<Link href='/' asChild>
				<TouchableWithoutFeedback>
					<Text style={styles.exitBtn}>EXIT</Text>
				</TouchableWithoutFeedback>
			</Link>
			<View style={{width: 20, height: 20, backgroundColor: 'white', marginTop: 30, marginLeft: 30}}></View>
			<Text style={{fontSize: 30, marginTop: 30, marginLeft: 30}}>{game.p2C}</Text>
		</View>
  );
}

const styles = StyleSheet.create({
	Container: {
		backgroundColor: 'teal',
		flex: 1,
	},
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