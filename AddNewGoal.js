import React, {useState} from 'react';
import {Alert, Modal, StyleSheet, Text, FlatList, Pressable, View, TextInput} from 'react-native';
import database from "@react-native-firebase/database";

function AddNewGoal(props) {
  const [modalVisible, setModalVisible] = useState(false);

  const [enteredGoal, setEnteredGoal] = useState('');

  const goalInputHandler = (enteredText) => {
    setEnteredGoal(enteredText);
  };

  const addGoalHandler = () => {
    if (enteredGoal.trim() === '') {
      return;
    }
    setGoalList((currentGoals) => [...currentGoals, enteredGoal]);
    setEnteredGoal('');
  };

  return(
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
            <Text style={styles.modalText}>Enter New Goal</Text>
            <View style={styles.item}>
              <TextInput
                style={styles.input}
                placeholder={"Type here"}
                onChangeText={goalInputHandler}
                value={enteredGoal}
              />
            </View>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(!modalVisible)
                addGoalHandler()
                saveGoals()
              }
            }>
              <Text style={styles.textStyle}>Submit New Goal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.textStyle}>Add New Health Goal</Text>
      </Pressable>
    </View>
  )
}

export {AddNewGoal};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
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
  input: {
    fontFamily: 'Avenir-Book',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    padding: 10,
    fontSize: 15,
    flex: 1
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 10,
  },
  buttonOpen: {
    margin: 10,
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    backgroundColor: '#F194FF',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontFamily: 'Avenir-Book',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  goalItem: {
    marginVertical: 10,
  },
});