import { View, Text, StyleSheet, TouchableWithoutFeedback, TextInput } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateNameScreen() {
  const [name, setName] = useState('username');

  return (<View style={styles.container}>
    <View style={styles.box}>
      <Text style={styles.title}>Create your name</Text>
      <TextInput style={styles.inputBox} placeholder='username' value={name} onChangeText={setName} />
			<Link href="/lobby" asChild>
				<TouchableWithoutFeedback onPress={() => {
					try {
						AsyncStorage.setItem('myName', name);
					} catch (e) {
						console.error(e);
					}
				}}>
					<Text style={styles.buttonText}>Select</Text>
				</TouchableWithoutFeedback>
			</Link>
    </View>
  </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'teal',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: 'tomato',
    width: 300,
    height: 500,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },
  inputBox: {
    borderRadius: 10,
    borderWidth: 5,
    fontSize: 30,
    marginHorizontal: 20,
    marginTop: 50,
  },
  buttonText: {
    color: 'white',
    backgroundColor: 'blue',
    borderRadius: 10,
    marginTop: 30,
    textAlign: 'center',
    marginHorizontal: 100,
    fontSize: 20,
    paddingVertical: 7,
  }
});