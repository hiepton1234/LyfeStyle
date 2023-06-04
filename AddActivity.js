import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

function AddActivity() {
    const [modalVisible, setModalVisible] = useState(false);
    const [activity, setActivity] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());

    const handleActivityChange = (text) => {
        setActivity(text);
    };

    const handleStartTimeChange = (event, selectedTime) => {
        if (selectedTime !== undefined) {
            setStartTime(selectedTime);
        }
    };

    const handleEndTimeChange = (event, selectedTime) => {
        if (selectedTime !== undefined) {
            setEndTime(selectedTime);
        }
    };

    const handleAddActivity = () => {
        // Perform any action you want with the entered activity and selected times
        console.log('Activity:', activity);
        console.log('Start Time:', startTime);
        console.log('End Time:', endTime);

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
                        <Text style={styles.baseText}>Please Enter An Activity:</Text>
                        <TextInput
                            style={styles.input}
                            value={activity}
                            onChangeText={handleActivityChange}
                            placeholder="Please enter activity here"
                        />

                        <Text style={styles.baseText}>Start Time:</Text>
                        <DateTimePicker
                            value={startTime}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={handleStartTimeChange}
                        />

                        <Text style={styles.baseText}>End Time:</Text>
                        <DateTimePicker
                            value={endTime}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={handleEndTimeChange}
                        />

                        <View style={styles.buttonContainer}>
                            <Pressable style={[styles.button, styles.buttonClose, { marginRight: 35 }]} onPress={handleAddActivity}>
                                <Text style={styles.textStyle}>Add</Text>
                            </Pressable>
                            <Pressable style={[styles.button, styles.buttonClose, { marginLeft: 35 }]} onPress={() => setModalVisible(!modalVisible)}>
                                <Text style={styles.textStyle}>Back</Text>
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
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export { AddActivity };
