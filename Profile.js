import {useEffect, useState} from "react";
import {Alert, StyleSheet, Modal, Text, View, ScrollView, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
import database from "@react-native-firebase/database";

function Profile (props) {
  const [info, setInfo] = useState("");
  // Define some example data for the ScrollView
  const [profileElems, setProfileElems] = useState([
    { id: 'Name', text: ''},
    { id: 'Age', text: props.age.toString() },
    { id: 'Date of Birth', text: props.dob.toString()},
    { id: 'Gender', text: props.bio_sex.toString()},
    { id: 'Height', text: props.height.toString()},
    { id: 'Home Address', text: ''},
    { id: 'Work Address', text: ''},
    { id: 'Favorite Place 1', text: ''},
    { id: 'Favorite Place 2', text: ''},
  ]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    database()
      .ref('user/' + props.user.uid + '/profile/')
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setInfo(data);

          // Update the profileElems array with the respective data from info
          const updatedProfileElems = profileElems.map((elem) => {
            if (elem.id in data) {
              return { ...elem, text: data[elem.id].toString() };
            }
            return elem;
          });

          setProfileElems(updatedProfileElems);
        }
      })
  };

  const [modalVisible, setModalVisible] = useState(false);

  // Define a function to update a data item by ID
  function updateDataItem(id, newText) {
    setProfileElems(previousData => {
      const newData = [...previousData];
      const index = newData.findIndex(item => item.id === id);
      newData[index] = { ...newData[index], text: newText};
      return newData;
    });
  }

  function saveProfile(profileElems) {
    const newReference = database().ref('user/' + props.user.uid);

    console.log('newReference key: ', newReference.key);

    // store contents of profile page user inputs to firebase
    for (let i = 0; i < profileElems.length; i++){
      newReference.child("profile")
        .update({
          [profileElems[i].id] : profileElems[i].text,
        })
        .then(() => console.log('Data updated.'));
    }
  }

  return (
    <View style={styles.centeredView}>
      {/*adjusts view to still show what is being typed if otherwise would be covered by keyboard*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <KeyboardAvoidingView
          style={styles.appContainer}
          behavior='padding'
        >
          <ScrollView>
            <Text style={styles.sectionHeading}>
              My Profile
            </Text>
            {/*Each profile element in its own view, allows side by side TextInput*/}
            {profileElems.map(item => (
              <View style={styles.item} key={item.id}>
                <Text style={styles.baseText}>
                  {item.id}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={"Type here"}
                  value={item.text}
                  onChangeText={newText => updateDataItem(item.id, newText)}
                />
              </View>
            ))}
            <View style={styles.save_or_cancel}>
              <Pressable
                // add function to call when pressed to read all inputs and save to DB
                onPress={() => {
                  saveProfile(profileElems)
                  setModalVisible(!setModalVisible)
                }}
                style={({pressed}) => [
                  {
                    opacity : pressed ? 0.3 : 1
                  }
                ]}>
                <Text style={styles.customButton}>
                  ✅
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setModalVisible(!setModalVisible)}
                style={({pressed}) => [
                  {
                    opacity : pressed ? 0.3 : 1
                  }
                ]}>
                <Text style={styles.customButton}>
                  🚫
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => {
          setModalVisible(true)
          loadProfileData()
        }}>
        <Text style={styles.textStyle}>Show Profile</Text>
      </Pressable>
    </View>
  );
}

export {Profile};

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
    fontSize: 50,
    fontWeight: "600"
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
  input: {
    fontFamily: 'American Typewriter',
    flex: 1,
    textAlign: 'right',
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
    fontFamily: 'American Typewriter',
    textAlign: 'center',
  }
});
