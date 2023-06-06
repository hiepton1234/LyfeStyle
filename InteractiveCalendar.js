import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

const InteractiveCalendar = ({ onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

    useEffect(() => {
        onDateSelect(selectedDate);
    }, [selectedDate, onDateSelect]);

    const handleDayPress = (day) => {
        const selectedDateString = day.dateString;
        setSelectedDate(selectedDateString);
    };

    return (
        <View>
            <Calendar
                markedDates={{
                    [selectedDate]: { selected: true, selectedColor: '#64D2FF' },
                }}
                onDayPress={handleDayPress}
            />
        </View>
    );
};

export default InteractiveCalendar;
