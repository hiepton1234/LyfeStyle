import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, TextInput } from 'react-native';
import InteractiveCalendar from "./InteractiveCalendar";

function AddActivity() {
    const [modalVisible, setModalVisible] = useState(false);
    const [activity, setActivity] = useState('');

    const handleActivityChange = (text) => {
        setActivity(text);
    };

    const handleAddActivity = () => {
        // Perform any action you want with the entered activity
        console.log('Activity:', activity);

        // Close the modal and clear the activity input
        setModalVisible(false);
        setActivity('');
    };

    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.baseText}>Which Day Would You Like To Add An Activity:</Text>
                        <InteractiveCalendar />
                        <Text style={styles.baseText}>Please Enter An Activity:</Text>
                        <TextInput
                            style={styles.input}
                            value={activity}
                            onChangeText={handleActivityChange}
                            placeholder="Enter activity"
                        />
                        <View style={styles.buttonContainer}>
                            <Pressable style={[styles.button, styles.buttonClose, { marginRight: 35 }]} onPress={handleAddActivity}>
                                <Text style={styles.textStyle}>Add</Text>
                            </Pressable>
                            <Pressable style={[styles.button, styles.buttonClose, { marginLeft: 35 }]} onPress={() => setModalVisible(!modalVisible)}>
                                <Text style={styles.textStyle}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            <Pressable style={[styles.button, styles.buttonOpen]} onPress={() => setModalVisible(true)}>
                <Text style={styles.textStyle}>Add Activity</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },

    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
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

    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 10,
    },

    buttonOpen: {
        backgroundColor: '#64D2FF',
    },

    buttonClose: {
        backgroundColor: '#64D2FF',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    textStyle: {
        fontFamily: 'American Typewriter',
        textAlign: 'center',
    },

    baseText: {
        fontFamily: 'American Typewriter',
        fontSize: 20,
        textAlign: 'center',
        paddingTop: 10,
    },

    input: {
        width: 250,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});

export { AddActivity };