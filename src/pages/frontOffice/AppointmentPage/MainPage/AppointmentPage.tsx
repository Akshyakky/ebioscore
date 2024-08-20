// src/pages/frontOffice/AppointmentPage/MainPage/AppointmentPage.tsx
import React, { useRef } from 'react';
import SchedulerComponent from '../SubPage/SchedulerComponent';
import SchedulerHeader from '../SubPage/SchedulerHeader';
import SchedulerFooter from '../SubPage/SchedulerFooter';

const AppointmentPage: React.FC = () => {
    const schedulerRef = useRef<{ refresh: () => void } | null>(null);
    const handleRefresh = () => {
        if (schedulerRef.current) {
            schedulerRef.current.refresh();
        }
    };
    return (
        <>
            <SchedulerHeader onRefresh={handleRefresh} />
            <SchedulerComponent ref={schedulerRef} />
            <SchedulerFooter />
        </>
    );
};

export default AppointmentPage;
