import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image } from 'react-native';

export default function SingleScreen() {
  const [p1x, setP1x] = useState(160);
  const [p1y, setP1y] = useState(0);
  const [p2x, setP2x] = useState(160);
  const [p2y, setP2y] = useState(320);
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
              console.log(p1HC);
              setWalls(currentWalls => [...currentWalls,
              <View style={{...styles.horWall, left: j * 40, top: i * 40}}></View>]);
              setP1HC(p1HC - 1);
              setTurn(false);
            }
            else if (turn == false && p2HC > 0) {
              setWalls(currentWalls => [...currentWalls,
              <View style={{...styles.horWall, left: j * 40, top: i * 40}}></View>]);
              console.log(p2HC);
              setP2HC(p2HC - 1);
              setTurn(true);
            }
          }}>
          <View style={{...styles.fieldHor, left: j * 40, top: i * 40}}></View>
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
              <View style={{...styles.verWall, left: i * 40, top: j * 40}}></View>]);
              setP1VC(p1VC - 1);
              setTurn(false);
            }
            else if (turn == false && p2VC > 0) {
              setWalls(currentWalls => [...currentWalls,
              <View style={{...styles.verWall, left: i * 40, top: j * 40}}></View>]);
              setP2VC(p2VC - 1);
              setTurn(true);
            }
          }}>
          <View style={{...styles.fieldVer, left: i * 40, top: j * 40}}></View>
          </TouchableWithoutFeedback>);
      }
    }
    return ver;
  };

  const playerMoveRight = () => {
    if (turn == true) {
      setP1x(p1x + 40);
      setTurn(false);
    }
    else if (turn == false){
      setP2x(p2x + 40);
      setTurn(true);
    }
  };
  const playerMoveLeft = () => {
    if (turn == true) {
      setP1x(p1x - 40);
      setTurn(false);
    }
    else {
      setP2x(p2x - 40);
      setTurn(true);
    }
  };
  const playerMoveUp = () => {
    if (turn == true) {
      setP1y(p1y + 40);
      setTurn(false);
    }
    else {
      setP2y(p2y + 40);
      setTurn(true);
    }
  };
  const playerMoveDown = () => {
    if (turn == true) {
      setP1y(p1y - 40);
      setTurn(false);
    }
    else {
      setP2y(p2y - 40);
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
            <View style={{ ...styles.moveTile, left: p1x + 40, top: p1y }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveRight}>
            <View style={{ ...styles.moveTile, left: p2x + 40, top: p2y }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: p1x - 40, top: p1y }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveLeft}>
            <View style={{ ...styles.moveTile, left: p2x - 40, top: p2y }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: p1x, top: p1y + 40 }}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveUp}>
            <View style={{ ...styles.moveTile, left: p2x, top: p2y + 40 }}></View>
          </TouchableWithoutFeedback>
        ): null}
        {turn == true ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: p1x, top: p1y - 40}}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {turn == false ? (
          <TouchableWithoutFeedback onPress={playerMoveDown}>
            <View style={{ ...styles.moveTile, left: p2x, top: p2y - 40}}></View>
          </TouchableWithoutFeedback>
        ): null}
      </>
    );
  };

  return (
    <>
    <View style={styles.topMenu}>
      <View style={{...styles.horWall, left: 50, top: 50,}}></View>
      <View style={{...styles.verWall, left: 250, top: 20,}}></View>
    </View>
    <View style={styles.gameContainer}>
      {renderHor()}
      {renderVer()}
      {renderPlayer()}
      {walls}
    </View>
    <View style={styles.bottomMenu}>
      <View style={{...styles.horWall, left: 50, top: 50,}}></View>
      <View style={{...styles.verWall, left: 250, top: 20,}}></View>
    </View>
    </>
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