// src/pages/frontOffice/AppointmentPage/MainPage/AppointmentPage.tsx
import React, { useRef } from 'react';
import SchedulerComponent from '../SubPage/SchedulerComponent';
import MainLayout from '../../../../layouts/MainLayout/MainLayout';
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
        <MainLayout>
            <SchedulerHeader onRefresh={handleRefresh} />
            <SchedulerComponent ref={schedulerRef} />
            <SchedulerFooter />
        </MainLayout>
    );
};

export default AppointmentPage;
