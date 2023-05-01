import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import {useState} from "react";


  export default function App() {
    const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personicle</Text>
      <Text style={styles.subtitle}>Sleep</Text>
      <TextInput
          style={styles.input}
          onChangeText={text => setText(text)}
          value={text}
          placeholder="Enter some text here"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  title: {
    fontSize: 24,
    paddingTop: 70,
    marginBottom: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'TimesNewRomanPS-BoldMT',
  },

  subtitle: {
    fontSize: 16,
    color: '#555',
  },

  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
  },

  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
