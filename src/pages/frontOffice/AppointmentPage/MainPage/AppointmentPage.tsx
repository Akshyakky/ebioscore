// src/pages/frontOffice/AppointmentPage/MainPage/AppointmentPage.tsx
import React from 'react';
import SchedulerComponent from '../SubPage/SchedulerComponent';
import MainLayout from '../../../../layouts/MainLayout/MainLayout';
import CalendarComponent from '../SubPage/CalendarComponent';
import BigCalendarComponent from '../SubPage/BigCalendarComponent';

const AppointmentPage: React.FC = () => {
    return (
        <MainLayout>
            <div>
                <h5>Dev Express Paid</h5>
                <SchedulerComponent />
            </div>
            <div>
                <h5>Full Calendar Free</h5>
                <CalendarComponent />
            </div>
            <div>
                <h5>React Big Calendar Free</h5>
                <BigCalendarComponent />
            </div>
        </MainLayout>
    );
};

export default AppointmentPage;
