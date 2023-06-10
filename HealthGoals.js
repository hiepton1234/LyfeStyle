import React, {useEffect, useState} from "react";
import {Alert, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import database from "@react-native-firebase/database";
import ModalSelector from 'react-native-modal-selector'

function HealthGoals (props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [info, setInfo] = useState("");
  const [weightGoal, setWeightGoal] = useState("maintain")
  const possibleWeightGoals = [
    {key: 0, label: "maintain"},
    {key: 1, label: "lose"},
    {key: 2, label: "gain"},]
  const [sleepEarlier, setSleepEarlier] = useState(true)
  const [betterSleep, setBetterSleep] = useState(true)
  const [stepCountGoal, setStepCountGoal] = useState('')

  useEffect(() => {
    loadHealthGoals();
  }, []);

  const loadHealthGoals = () => {
    database()
      .ref('user/' + props.user.uid + '/goals/')
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          let updatedGoalList = {};

          snapshot.forEach((childSnapshot) => {
            const goalKey = childSnapshot.key;
            updatedGoalList[goalKey] = childSnapshot.val();
          });

          setWeightGoal(updatedGoalList.weightGoal);
          setSleepEarlier(updatedGoalList.sleepEarlier);
          setBetterSleep(updatedGoalList.betterSleep);
          setStepCountGoal(updatedGoalList.stepCountGoalGoal.toString())
        }
      })
  };

  const saveGoals = () => {
    const newReference = database().ref('user/' + props.user.uid + '/goals');

    newReference.update({weightGoal: weightGoal}).then(() => console.log("Updated weight goal"))
    newReference.update({sleepEarlier: sleepEarlier}).then(() => console.log("Saved sleep earlier"))
    newReference.update({betterSleep: betterSleep}).then(() => console.log("Saved sleep quality"))
    newReference.update({stepCountGoalGoal: Number(stepCountGoal)}).then(() => console.log("Saved Step Count Goal"))
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
          <Pressable
            onPress={() => {
              setModalVisible(!setModalVisible)
              saveGoals()
            }
          }
            style={({pressed}) => [
              {
                opacity : pressed ? 0.3 : 1
              }
            ]}>
            <Text style={styles.customButton}>❌</Text>
          </Pressable>
          <Text style={styles.title}>
            Health Goals
          </Text>
          <View style={styles.goalContainer}>
            <Text style={styles.baseText}>I would like to </Text>
            <ModalSelector
                data={possibleWeightGoals}
                initValue="maintain"
                accessible={true}
                animationType={"fade"}
                scrollViewAccessibilityLabel={'Scrollable options'}
                cancelButtonAccessibilityLabel={'Cancel Button'}
                optionTextStyle={{ fontFamily: 'American Typewriter' }}
                cancelButtonStyle={{ fontFamily: 'American Typewriter' }}
                onChange={(option) => { setWeightGoal(option.label) }}
            >

              <TextInput
                style={[styles.goalInput, {marginTop: 6.5}]}
                editable={false}
                placeholder="lose"
                value={weightGoal} />

            </ModalSelector>
            <Text style={styles.baseText}> weight</Text>
          </View>


          <View style={[styles.goalContainer, { paddingBottom: 20, paddingTop: 20 }]}>
            <Text style={styles.baseText}>Sleep earlier</Text>
            <Switch value={sleepEarlier} onValueChange={setSleepEarlier}></Switch>
          </View>
          <View style={styles.goalContainer}>
            <Text style={styles.baseText}>Improve sleep quality</Text>
            <Switch value={betterSleep} onValueChange={setBetterSleep}></Switch>
          </View>
          <View style={[styles.goalContainer, { paddingBottom: 20, paddingTop: 20 }]}>
            <Text style={[styles.modalText, { flex: 3 }]}>Steps goal: </Text>
            <TextInput
              style={styles.input}
              keyboardType={'number-pad'}
              placeholder={"10000"}
              value={stepCountGoal}
              onChangeText={newText => setStepCountGoal(newText)}/>
          </View>
          {/*<FlatList*/}
          {/*  data={goalList}*/}
          {/*  renderItem={(itemData) => (*/}
          {/*    <View style={styles.goalItem}>*/}
          {/*      <Text style={styles.baseText}>{itemData.item}</Text>*/}
          {/*    </View>*/}
          {/*  )}*/}
          {/*/>*/}
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => {
          setModalVisible(true)
          loadHealthGoals()
        }}>
        <Text style={styles.textStyle}>Health Goals</Text>
      </Pressable>
    </View>
  );
}

export {HealthGoals};

const styles = StyleSheet.create({
  title: {
    fontFamily: 'American Typewriter',
    paddingBottom: 10,
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  baseText: {
    fontFamily: 'American Typewriter',
    fontSize: 20,
    textAlign: 'center',
    paddingTop: 10,
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
    fontFamily: 'American Typewriter',
    flex: 1,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 5,
    padding: 14,
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
  modalText: {
    fontFamily: 'American Typewriter',
    fontSize: 20,
    lineHeight: 40,
    marginBottom: 10,
    textAlign: 'left',
  },
  buttonOpen: {
    backgroundColor: '#64D2FF',
  },
  buttonClose: {
    backgroundColor: '#64D2FF',
  },
  textStyle: {
    fontFamily: 'American Typewriter',
    textAlign: 'center',
  },
  goalContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    padding: 5,
  },
  input: {
    fontFamily: 'American Typewriter',
    flex: 1,
    textAlign: 'right',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 20,
  },
});
