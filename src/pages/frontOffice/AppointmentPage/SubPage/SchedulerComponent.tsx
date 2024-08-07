import React from 'react';
import { Scheduler, Resource } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.light.css';
import { Appointment } from '../../../../models/FrontOffice/AppointmentData';

const views: Array<"day" | "week" | "workWeek" | "month"> = ['day', 'week', 'workWeek', 'month'];
const currentDate = new Date();

const appointments: Appointment[] = [
    {
        text: 'Meeting with John',
        startDate: new Date(2023, 1, 1, 9, 0),
        endDate: new Date(2023, 1, 1, 10, 0),
        AppID: 1,
        Comments: 'Discuss project status',
        AppointmentNo: 1234,
        UHID: 'UHID001',
        PName: 'John Doe',
    },
    {
        text: 'Lunch with Sarah',
        startDate: new Date(2023, 1, 1, 12, 0),
        endDate: new Date(2023, 1, 1, 13, 0),
        AppID: 2,
        Comments: 'At the new Italian place',
        AppointmentNo: 5678,
        UHID: 'UHID002',
        PName: 'Sarah Smith',
    },
    // Add more dummy appointments as needed
];

const resources = [{
    fieldExpr: 'AppID',
    allowMultiple: true,
    label: 'Appointment',
    dataSource: [
        { text: 'Type 1', id: 1, color: '#1e90ff' },
        { text: 'Type 2', id: 2, color: '#ff9747' },
        // Add more resource data as needed
    ],
}];

const SchedulerComponent: React.FC = () => {
    const onAppointmentFormOpening = (e: any) => {
        // Customize the appointment form
    };

    const onAppointmentClick = (e: any) => {
        e.cancel = true;
        // Handle appointment click
    };

    const onAppointmentDblClick = (e: any) => {
        e.cancel = true;
        // Handle appointment double-click
    };

    return (
        <Scheduler
            dataSource={appointments}
            views={views}
            defaultCurrentView="workWeek"
            defaultCurrentDate={currentDate}
            height={600}
            startDayHour={9}
            editing={{
                allowAdding: true,
                allowDeleting: true,
                allowUpdating: true,
                allowResizing: true,
                allowDragging: true,
            }}
            onAppointmentFormOpening={onAppointmentFormOpening}
            onAppointmentClick={onAppointmentClick}
            onAppointmentDblClick={onAppointmentDblClick}
        >
            <Resource
                fieldExpr="AppID"
                allowMultiple={true}
                dataSource={resources}
                label="Appointment"
            />
        </Scheduler>
    );
};

export default SchedulerComponent;
