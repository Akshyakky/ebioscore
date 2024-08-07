import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';

const events = [
    { title: 'Meeting with John', start: '2023-02-01T09:00:00', end: '2023-02-01T10:00:00' },
    { title: 'Lunch with Sarah', start: '2023-02-01T12:00:00', end: '2023-02-01T13:00:00' }
];

const CalendarComponent: React.FC = () => {
    const handleDateSelect = (selectInfo: DateSelectArg) => {
        let title = prompt('Please enter a new title for your event');
        let calendarApi = selectInfo.view.calendar;

        calendarApi.unselect(); // clear date selection

        if (title) {
            calendarApi.addEvent({
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay
            });
        }
    };

    const handleEventDrop = (info: EventDropArg) => {
        alert(`Event dropped to ${info.event.startStr}`);
    };

    const handleEventResize = (info: EventResizeDoneArg) => {
        alert(`Event resized to end at ${info.event.endStr}`);
    };

    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            editable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            events={events}
        />
    );
};

export default CalendarComponent;
