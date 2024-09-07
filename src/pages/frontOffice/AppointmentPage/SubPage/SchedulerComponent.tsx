import React, { useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Scheduler, Resource } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.light.css';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import useDayjs from '../../../../hooks/Common/useDateTime';
import { useAppointments } from '../../../../hooks/FrontOffice/useAppointments';

const views: Array<'day' | 'week' | 'workWeek' | 'month'> = ['day', 'week', 'workWeek', 'month'];
interface SchedulerComponentProps {
    hpID?: number;
    rlID?: number;
}
const SchedulerComponent = forwardRef<unknown, SchedulerComponentProps & { onAppointmentFormOpening: (startDate?: Date, endDate?: Date) => void }>((props, ref) => {
    const srvDate = useServerDate()
    const { date: serverDate, formatDate, formatDateTime, formatTime, add, formatISO, format, parse } = useDayjs(useServerDate());
    const initialDate = srvDate || new Date();
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
            startDate: formatDateTime(appt.abTime),
            endDate: formatDateTime(appt.abEndTime),
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

    const MemoizedResource = useMemo(() => (
        <Resource
            fieldExpr="AppID"
            allowMultiple={true}
            dataSource={resourceDataSource}
            label="Appointment"
        />
    ), [resourceDataSource]);

    return (
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
            {MemoizedResource}
        </Scheduler>
    );
});

export default React.memo(SchedulerComponent);
