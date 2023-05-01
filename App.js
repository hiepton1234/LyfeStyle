import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import {useState} from "react";
import DateTimePicker from '@react-native-community/datetimepicker';


  export default function App() {
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(true);

    const handleDateChange = (event, selectedDate) => {
      setShowPicker(Platform.OS === 'ios');
      setDate(selectedDate || date);
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personicle</Text>
      <Text style={styles.subtitle}>Sleep</Text>
      {showPicker && (
          <DateTimePicker
              value={date}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
          />
      )}
      <Text style={styles.subtitle}> to </Text>
      {showPicker && (
          <DateTimePicker
              value={date}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
          />
      )}
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
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Times New Roman',
  },

  subtitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
    color: '#000000',
    fontFamily: 'Times New Roman',
  },
});
