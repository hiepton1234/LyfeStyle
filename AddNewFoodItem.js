import React, {useState} from "react";
import {Alert, StyleSheet, Modal, Text, View, ScrollView, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
import database from "@react-native-firebase/database";
import {Picker} from "@react-native-picker/picker";
import {FoodRecs} from "./Recommender/FoodRecs";

class FoodItem {
  constructor(name, serving_size, num_servings, calories) {
    this.name = name
    this.serving_size = serving_size
    this.num_servings = num_servings
    this.calories = calories
  }
}
function AddNewFoodItem(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedServings, setSelectedServings] = useState('0.25');
  const possible_num_servings = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2']
  const [selectedLike, setSelectedLike] = useState('1');
  const like_scale = ['1', '2', '3', '4', '5']
  const [enteredFood, setEnteredFood] = useState('');

  const foodInputHandler = (enteredText) => {
    setEnteredFood(enteredText);
  };

  const addFoodHandler = () => {
    if (enteredFood.trim() === '') {
      return;
    }

    props.addNewFoodItem(props.index, enteredFood, selectedServings, selectedLike)

    setEnteredFood('');
    setSelectedServings('0.25')
    setSelectedLike('1')
  };

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.item}>
              <TextInput
                style={styles.input}
                placeholder={"Food name here"}
                onChangeText={foodInputHandler}
                value={enteredFood}
              />
            </View>
            <View style={styles.pickerSection}>
              <View style={{flex: 1}}>
                <Text style={styles.modalText}># of Servings</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.modalText}>Like Rating</Text>
              </View>
            </View>
            <View style={styles.pickerSection}>
              <Picker
                style={{ flex: 1 }}
                selectedValue={selectedServings}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedServings(itemValue)
                }>
                {possible_num_servings.map((item, index) => (
                  <Picker.Item label={item} value={item} />
                ))}
              </Picker>
              <Picker
                style={{ flex: 1 }}
                selectedValue={selectedLike}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedLike(itemValue)
                }>
                {like_scale.map((item, index) => (
                  <Picker.Item label={item} value={item} />
                ))}
              </Picker>
            </View>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(!modalVisible)
                addFoodHandler()
              }
              }>
                <Text style={styles.modalText}>Add Food Entry</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.textStyle}>Add Food</Text>
      </Pressable>
    </View>
  )
}

export {AddNewFoodItem};

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'American Typewriter',
    fontSize: 20,
    lineHeight: 40,
    marginRight: 10,
  },
  sectionHeading: {
    fontFamily: 'American Typewriter',
    fontWeight: "bold",
    fontSize: 40,
    lineHeight: 50,
  },
  customButton: {
    fontFamily: 'American Typewriter',
    fontSize: 35,
    fontWeight: "600",
    textAlign: "right",
  },
  appContainer: {
    backgroundColor: '#ffff',
    flex: 1,
    paddingTop: 50,
    padding: 25,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cccccc",
    // in most places where you can set size as num pixels, you can also use percentages passed as a string
    // want this element to take up 80% of available width, defined by the container in which the element sits
    width: '60%',
    margin: 8,
    padding: 8,
    justifyContent: ''
  },
  item: {
    flexDirection: "row",
  },
  pickerSection: {
    flexDirection: "row",
  },
  goalInput: {
    fontFamily: 'American Typewriter',
    flex: 1,
    textAlign: 'left',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalText: {
    fontFamily: 'American Typewriter',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    margin: 20,
    flex: 1,
    borderRadius: 20,
    paddingTop: 35,
    paddingBottom: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonOpen: {
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    backgroundColor: '#F194FF',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    margin: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'American Typewriter',
  },
  mealSection: {
    fontFamily: 'American Typewriter',
    fontWeight: "bold",
    fontSize: 20,
    lineHeight: 25,
  },
  input: {
    fontFamily: 'American Typewriter',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    padding: 10,
    fontSize: 15,
    flex: 1
  },
})