import {useState} from "react";
import {
  Alert,
  StyleSheet,
  Modal,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Button
} from 'react-native';
import {AddNewGoal} from './AddNewGoal'

function HealthGoals (props) {
  const [modalVisible, setModalVisible] = useState(false);
  // Define some example data for the ScrollView
  const [profileElems, setProfileElems] = useState([
    { id: 'Name:', text: '' },
    { id: 'Age:', text: props.age.toString() },
    { id: 'Date of Birth:', text: props.dob.toString()},
    { id: 'Gender:', text: props.bio_sex.toString()},
    { id: 'Height:', text: props.height.toString() },
    { id: 'Home Address:', text: ''},
    { id: 'Work Address:', text: ''},
    { id: 'Favorite Place 1:', text: ''},
    { id: 'Favorite Place 2:', text: ''},
  ]);

  // Define a function to update a data item by ID
  function updateDataItem(id, newText) {
    setProfileElems(previousData => {
      const newData = [...previousData];
      const index = newData.findIndex(item => item.id === id);
      newData[index] = { ...newData[index], text: newText };
      return newData;
    });
  }

  return (
    <View style={styles.centeredView}>
      {/*adjusts view to still show what is being typed if otherwise would be covered by keyboard*/}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.appContainer}>
          <Text style={styles.sectionHeading}>
            My Health Goals
          </Text>
          <AddNewGoal/>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}>
        <Text style={{ fontFamily: 'American Typewriter' }}>Health Goals</Text>
      </Pressable>
    </View>
  );
}

export {HealthGoals};

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Avenir-Book',
    fontSize: 20,
    lineHeight: 40,
    marginRight: 10,
  },
  sectionHeading: {
    fontFamily: 'Avenir-Book',
    fontWeight: "bold",
    fontSize: 40,
    lineHeight: 50,
  },
  customButton: {
    fontFamily: 'Avenir-Book',
    fontSize: 50,
    fontWeight: "600"
  },
  appContainer: {
    backgroundColor: '#edf7f5',
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
  save_or_cancel: {
    flexDirection: "row",
    justifyContent: 'space-evenly',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  goalInput: {
    fontFamily: 'Avenir-Book',
    flex: 1,
    textAlign: 'left',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#64D2FF',
  },
  buttonClose: {
    backgroundColor: '#64D2FF',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
