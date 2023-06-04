import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import InteractiveCalendar from './InteractiveCalendar';

function AddActivity() {
    const [modalVisible, setModalVisible] = useState(false);
    const [activity, setActivity] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [activities, setActivities] = useState([]);
    const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

    const handleActivityChange = (text) => {
        setActivity(text);
    };

    const handleStartTimeChange = (time) => {
        setStartTime(time);
        setStartTimePickerVisible(false);
    };

    const handleEndTimeChange = (time) => {
        setEndTime(time);
        setEndTimePickerVisible(false);
    };

    const handleAddActivity = () => {
        // Create a new activity object
        const newActivity = {
            activity: activity,
            startTime: startTime,
            endTime: endTime,
            selectedDate: selectedDate,
        };

        // Add the new activity to the activities array
        setActivities([...activities, newActivity]);

        // Close the modal and clear the input fields
        setModalVisible(false);
        setActivity('');
        setStartTime('');
        setEndTime('');
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const showStartTimePicker = () => {
        setStartTimePickerVisible(true);
    };

    const hideStartTimePicker = () => {
        setStartTimePickerVisible(false);
    };

    const showEndTimePicker = () => {
        setEndTimePickerVisible(true);
    };

    const hideEndTimePicker = () => {
        setEndTimePickerVisible(false);
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
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.baseText}>Please Enter An Activity:</Text>
                        <TextInput
                            style={styles.input}
                            value={activity}
                            onChangeText={handleActivityChange}
                            placeholder="Please enter an activity here"
                        />

                        <Text style={styles.baseText}>Start Time:</Text>
                        <Pressable onPress={showStartTimePicker}>
                            <Text style={{ color: '#64D2FF', fontFamily: 'American Typewriter' }}>
                                {startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Start Time'}
                            </Text>
                        </Pressable>
                        {isStartTimePickerVisible && (
                            <DateTimePickerModal
                                isVisible={isStartTimePickerVisible}
                                mode="time"
                                onConfirm={handleStartTimeChange}
                                onCancel={hideStartTimePicker}
                            />
                        )}

                        <Text style={styles.baseText}>End Time:</Text>
                        <Pressable onPress={showEndTimePicker}>
                            <Text style={{ color: '#64D2FF', fontFamily: 'American Typewriter' }}>
                                {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select End Time'}
                            </Text>
                        </Pressable>
                        {isEndTimePickerVisible && (
                            <DateTimePickerModal
                                isVisible={isEndTimePickerVisible}
                                mode="time"
                                onConfirm={handleEndTimeChange}
                                onCancel={hideEndTimePicker}
                            />
                        )}

                        <Text style={styles.baseText}>Which Day?:</Text>
                        <InteractiveCalendar onDateSelect={handleDateSelect} />

                        <View style={styles.buttonContainer}>
                            <Pressable style={[styles.button, styles.buttonClose, { marginRight: 35 }]} onPress={handleAddActivity}>
                                <Text style={styles.textStyle}>Add</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonClose, { marginLeft: 35 }]}
                                onPress={() => setModalVisible(!modalVisible)}
                            >
                                <Text style={styles.textStyle}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            <Pressable style={[styles.button, styles.buttonOpen]} onPress={() => setModalVisible(true)}>
                <Text style={styles.textStyle}>Add Activity</Text>
            </Pressable>
            {isStartTimePickerVisible && (
                <DateTimePickerModal
                    isVisible={isStartTimePickerVisible}
                    mode="time"
                    onConfirm={handleStartTimeChange}
                    onCancel={hideStartTimePicker}
                />
            )}
            {isEndTimePickerVisible && (
                <DateTimePickerModal
                    isVisible={isEndTimePickerVisible}
                    mode="time"
                    onConfirm={handleEndTimeChange}
                    onCancel={hideEndTimePicker}
                />
            )}
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
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
});

export { AddActivity };
