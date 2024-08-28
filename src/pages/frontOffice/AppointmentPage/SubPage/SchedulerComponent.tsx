import React, { useEffect, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Scheduler, Resource } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.light.css';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import { fetchAppointmentsByDateAndType } from '../../../../services/FrontOfficeServices/AppointmentServices/AppointmentService';
import { OperationResult } from '../../../../interfaces/Common/OperationResult';
import { debounce } from '../../../../utils/Common/debounceUtils';


const views: Array<'day' | 'week' | 'workWeek' | 'month'> = ['day', 'week', 'workWeek', 'month'];

interface SchedulerState {
    appointments: any[];
    currentView: 'day' | 'week' | 'workWeek' | 'month';
    date: Date;
}
interface SchedulerComponentProps {
    hpID?: number;
    rlID?: number;
}

const useAppointments = (initialDate: Date, hpID?: number, rlID?: number) => {
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
            const result: OperationResult<any[]> = await fetchAppointmentsByDateAndType(startDate, endDate, hpID, rlID);
            setState(prevState => ({
                ...prevState,
                appointments: result.success && result.data ? result.data : [],
            }));
        } catch (error) {
            setState(prevState => ({ ...prevState, appointments: [] }));
        }
    }, [calculateDateRange, hpID, rlID]);

    const debouncedLoadAppointments = useMemo(
        () => debounce(loadAppointments, 300),
        [loadAppointments]
    );

    useEffect(() => {
        debouncedLoadAppointments(state.currentView, state.date);
        return () => {
            debouncedLoadAppointments.cancel();
        };
    }, [state.currentView, state.date, hpID, rlID, debouncedLoadAppointments]);

    const refresh = () => {
        loadAppointments(state.currentView, state.date);
    };

    return {
        state,
        setState,
        refresh
    };
};

const SchedulerComponent = forwardRef<unknown, SchedulerComponentProps & { onAppointmentFormOpening: (startDate?: Date, endDate?: Date) => void }>((props, ref) => {
    debugger
    const serverDate = useServerDate();
    const initialDate = serverDate || new Date();
    const { hpID, rlID, onAppointmentFormOpening } = props;

    const { state, setState, refresh } = useAppointments(initialDate, hpID, rlID);

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

    const onAppointmentFormOpeningHandler = useCallback((e: any) => {
        e.cancel = true;
        const startDate = e.appointmentData.startDate;
        const endDate = e.appointmentData.endDate;
        if (onAppointmentFormOpening) {
            onAppointmentFormOpening(startDate, endDate);
        }
    }, [onAppointmentFormOpening]);

    const onAppointmentClick = useCallback((e: any) => {
        e.cancel = true;
        onAppointmentFormOpeningHandler(e);
    }, [onAppointmentFormOpeningHandler]);

    const onAppointmentDblClick = useCallback((e: any) => {
        e.cancel = true;
        onAppointmentFormOpeningHandler(e);
    }, [onAppointmentFormOpeningHandler]);

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
                onAppointmentFormOpening={onAppointmentFormOpeningHandler}
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
