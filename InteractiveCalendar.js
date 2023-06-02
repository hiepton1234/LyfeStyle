import React, { useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

const InteractiveCalendar = ({ onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

    const handleDayPress = (day) => {
        const selectedDateString = day.dateString;
        setSelectedDate(selectedDateString);
        onDateSelect(selectedDateString);
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
