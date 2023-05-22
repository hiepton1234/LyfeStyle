import {useState} from "react";
import {Alert, StyleSheet, Modal, Text, View, Button, SectionList, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
import database from "@react-native-firebase/database";
import {AddNewFoodItem} from "./AddNewFoodItem";

function FoodPage(props) {
  const [modalVisible, setModalVisible] = useState(false);

  const [mealList, setMealList] = useState([
    {
      meal: 'Breakfast',
      data: []
    },
    {
      meal: 'Lunch',
      data: [],
    },
    {
      meal: 'Dinner',
      data: [],
    },
    {
      meal: 'Snacks',
      data: [],
    },
    ])

  const addNewFoodItem = (index, enteredText) => {
    const newMealList = [...mealList];
    newMealList[index].data.push(enteredText);
    setMealList(newMealList);
  };

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Food page has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.appContainer}>
          <Pressable
            onPress={() => {setModalVisible(!setModalVisible)}}
            style={({pressed}) => [{opacity : pressed ? 0.3 : 1}]}>
            <Text style={styles.customButton}>❌</Text>
          </Pressable>
          <Text style={styles.sectionHeading}>
            Food Tracking
          </Text>
          {/*<SectionList*/}
          {/*  sections={meals}*/}
          {/*  keyExtractor={(item, index) => item + index}*/}
          {/*  renderItem={({item}) => (*/}
          {/*    <View style={styles.item}>*/}
          {/*      <Text style={styles.title}>{item}</Text>*/}
          {/*    </View>*/}
          {/*  )}*/}
          {/*  renderSectionHeader={({section: {meal}}) => (*/}
          {/*    <Text style={styles.mealSection}>{meal}</Text>*/}
          {/*  )}*/}
          {/*  renderSectionFooter={({section: {meal}}) => (*/}
          {/*    <AddNewFoodItem data={meals[0].data}/>*/}
          {/*    )}*/}
          {/*/>*/}
          <View>
            {mealList.map((meal, index) => (
              <View key={index}>
                <Text style={styles.modalText}>{meal.meal}</Text>
                <View>
                  {meal.data.map((food, foodIndex) => (
                    <Text style={styles.baseText} key={foodIndex}>{food}</Text>
                  ))}
                </View>
                <AddNewFoodItem index={index} addNewFoodItem={addNewFoodItem}/>
              </View>
            ))}
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.textStyle}>Food Tracking</Text>
      </Pressable>
    </View>
  )
}

export {FoodPage};

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
    fontSize: 35,
    fontWeight: "600",
    textAlign: "right",
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
    backgroundColor: '#edf7f5',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
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
  modalText: {
    fontFamily: 'Avenir-Book',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 5,
  },
  buttonOpen: {
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
  mealSection: {
    fontFamily: 'Avenir-Book',
    fontWeight: "bold",
    fontSize: 20,
    lineHeight: 25,
  }
})