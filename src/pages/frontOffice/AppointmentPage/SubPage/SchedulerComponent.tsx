import React, { useEffect, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Scheduler, Resource } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.light.css';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import { AppointmentBookingDTO } from '../../../../interfaces/FrontOffice/AppointmentBookingDTO';
import { fetchAppointmentsByDate } from '../../../../services/FrontOfficeServices/AppointmentServices/AppointmentService';
import { OperationResult } from '../../../../interfaces/Common/OperationResult';
import { debounce } from '../../../../utils/Common/debounceUtils';


const views: Array<'day' | 'week' | 'workWeek' | 'month'> = ['day', 'week', 'workWeek', 'month'];

interface SchedulerState {
    appointments: AppointmentBookingDTO[];
    currentView: 'day' | 'week' | 'workWeek' | 'month';
    date: Date;
}

const useAppointments = (initialDate: Date) => {
    const [state, setState] = useState<SchedulerState>({
        appointments: [],
        currentView: 'day',
        date: initialDate,
    });

    const calculateDateRange = useCallback((view: 'day' | 'week' | 'workWeek' | 'month', date: Date) => {
        const start = new Date(date);
        const end = new Date(date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        switch (view) {
            case 'week':
                start.setDate(date.getDate() - date.getDay());
                end.setDate(start.getDate() + 6);
                break;
            case 'workWeek':
                start.setDate(date.getDate() - (date.getDay() - 1));
                end.setDate(start.getDate() + 4);
                break;
            case 'month':
                start.setDate(1);
                end.setMonth(date.getMonth() + 1);
                end.setDate(0);
                break;
        }

        return { start, end };
    }, []);

    const loadAppointments = useCallback(async (view: 'day' | 'week' | 'workWeek' | 'month', date: Date) => {
        const { start, end } = calculateDateRange(view, date);
        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];

        try {
            const result: OperationResult<AppointmentBookingDTO[]> = await fetchAppointmentsByDate(startDate, endDate);
            setState(prevState => ({
                ...prevState,
                appointments: result.success && result.data ? result.data : [],
            }));
        } catch (error) {
            setState(prevState => ({ ...prevState, appointments: [] }));
        }
    }, [calculateDateRange]);

    const debouncedLoadAppointments = useMemo(
        () => debounce(loadAppointments, 300),
        [loadAppointments]
    );

    useEffect(() => {
        debouncedLoadAppointments(state.currentView, state.date);
        return () => {
            debouncedLoadAppointments.cancel();
        };
    }, [state.currentView, state.date, debouncedLoadAppointments]);

    const refresh = () => {
        loadAppointments(state.currentView, state.date);
    };

    return {
        state,
        setState,
        refresh
    };
};

const SchedulerComponent = forwardRef((props, ref) => {
    const serverDate = useServerDate();
    const initialDate = serverDate || new Date();
    const { state, setState, refresh } = useAppointments(initialDate);

    useImperativeHandle(ref, () => ({
        refresh,
    }));

    const onViewChange = useCallback((view: string) => {
        if (['day', 'week', 'workWeek', 'month'].includes(view)) {
            setState(prevState => ({ ...prevState, currentView: view as 'day' | 'week' | 'workWeek' | 'month' }));
        } else {
            console.warn(`View "${view}" is not handled.`);
        }
    }, [setState]);

    const onCurrentDateChange = useCallback((value: string | number | Date) => {
        const newDate = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
        setState(prevState => ({ ...prevState, date: newDate }));
    }, [setState]);

    const onAppointmentFormOpening = useCallback((e: any) => {
        // Custom logic for appointment form opening
    }, []);

    const onAppointmentClick = useCallback((e: any) => {
        e.cancel = true; // Prevent default click behavior
    }, []);

    const onAppointmentDblClick = useCallback((e: any) => {
        e.cancel = true; // Prevent default double-click behavior
    }, []);

    const timeCellTemplate = useCallback((cellData: any) => {
        return (
            <div>
                {cellData.date.getHours().toString().padStart(2, '0')}:
                {cellData.date.getMinutes().toString().padStart(2, '0')}
            </div>
        );
    }, []);

    const onContentReady = useCallback((e: any) => {
        if (initialDate && !isNaN(initialDate.getTime())) {
            e.component.scrollTo(initialDate);
        }
    }, [initialDate]);

    const dataSource = useMemo(() => {
        return Array.isArray(state.appointments) ? state.appointments.map(appt => ({
            text: `${appt.abFName} ${appt.abLName || ''}`,
            startDate: new Date(appt.abDate),
            endDate: new Date(appt.abEndTime),
            id: appt.abID,
            status: appt.abStatus,
            allDay: false,
        })) : [];
    }, [state.appointments]);

    const resourceDataSource = useMemo(() => {
        return Array.isArray(state.appointments) ? state.appointments.map(appt => ({
            text: appt.providerName,
            id: appt.abID,
            color: appt.abStatus === 'Confirmed' ? '#1e90ff' : '#ff9747',
        })) : [];
    }, [state.appointments]);

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <Scheduler
                dataSource={dataSource}
                views={views}
                firstDayOfWeek={0}
                defaultCurrentView={state.currentView}
                currentDate={state.date}
                onCurrentViewChange={onViewChange}
                onCurrentDateChange={onCurrentDateChange}
                startDayHour={0}
                endDayHour={24}
                cellDuration={15}
                showAllDayPanel={false}
                useDropDownViewSwitcher={false}
                editing={{
                    allowAdding: true,
                    allowDeleting: true,
                    allowUpdating: true,
                    allowResizing: true,
                    allowDragging: true,
                }}
                adaptivityEnabled={true}
                showCurrentTimeIndicator={true}
                shadeUntilCurrentTime={true}
                height="100%"
                width="100%"
                onAppointmentDblClick={onAppointmentDblClick}
                onAppointmentClick={onAppointmentClick}
                onAppointmentFormOpening={onAppointmentFormOpening}
                timeCellRender={timeCellTemplate}
                onContentReady={onContentReady}
            >
                <Resource
                    fieldExpr="AppID"
                    allowMultiple={true}
                    dataSource={resourceDataSource}
                    label="Appointment"
                />
            </Scheduler>
        </div>
    );
});

export default React.memo(SchedulerComponent);