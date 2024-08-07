// src/pages/frontOffice/AppointmentPage/SubPage/BigCalendarComponent.tsx
import React from 'react';
import { Calendar, momentLocalizer, Event, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const events: Event[] = [
    {
        title: 'Meeting with John',
        start: new Date(2023, 1, 1, 9, 0),
        end: new Date(2023, 1, 1, 10, 0),
    },
    {
        title: 'Lunch with Sarah',
        start: new Date(2023, 1, 1, 12, 0),
        end: new Date(2023, 1, 1, 13, 0),
    },
    // Add more dummy events as needed
];

const BigCalendarComponent: React.FC = () => {
    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                defaultView={Views.WEEK}
            />
        </div>
    );
};

export default BigCalendarComponent;
