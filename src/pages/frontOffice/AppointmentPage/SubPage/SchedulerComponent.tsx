import React, { useMemo, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Scheduler, Resource } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.light.css';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import useDayjs from '../../../../hooks/Common/useDateTime';
import { useAppointments } from '../../../../hooks/FrontOffice/useAppointments';

const views: Array<'day' | 'week' | 'workWeek' | 'month'> = ['day', 'week', 'workWeek', 'month'];
interface SchedulerComponentProps {
    hpID?: number;
    rlID?: number;
    onAppointmentFormOpening: (startDate?: Date, endDate?: Date) => void;
    onAppointmentClick: (abID: number) => void;
}
const SchedulerComponent = forwardRef<unknown, SchedulerComponentProps>((props, ref) => {
    const srvDate = useServerDate()
    const dayjs = useDayjs(srvDate || new Date());
    const initialDate = srvDate || new Date();
    const { hpID, rlID, onAppointmentFormOpening, onAppointmentClick } = props;

    const { state, setState, refresh } = useAppointments(initialDate, hpID, rlID);

    useImperativeHandle(ref, () => ({
        refresh,
    }));


    const parseAppointmentDate = useCallback((dateString: string) => {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');

        const reformattedDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;

        const parsedDate = new Date(reformattedDateString);

        return parsedDate;
    }, []);

    const onViewChange = useCallback((view: string) => {
        if (['day', 'week', 'workWeek', 'month'].includes(view)) {
            setState(prevState => ({ ...prevState, currentView: view as 'day' | 'week' | 'workWeek' | 'month' }));
        } else {
            console.warn(`View "${view}" is not handled.`);
        }
    }, [setState]);

    const onCurrentDateChange = useCallback((value: string | number | Date) => {
        const newDate = dayjs.parse(value.toString()).toDate();
        setState(prevState => ({ ...prevState, date: newDate }));
    }, [setState, dayjs]);

    const onAppointmentFormOpeningHandler = useCallback((e: any) => {
        e.cancel = true;
        const startDate = e.appointmentData.startDate;
        const endDate = e.appointmentData.endDate;
        if (onAppointmentFormOpening) {
            onAppointmentFormOpening(startDate, endDate);
        }
    }, [onAppointmentFormOpening]);

    const onAppointmentClickHandler = useCallback((e: any) => {
        e.cancel = true; // Prevent the default appointment window from opening
        if (e.appointmentData && e.appointmentData.id) {
            onAppointmentClick(e.appointmentData.id);
        }
    }, [onAppointmentClick]);

    // const onAppointmentClick = useCallback((e: any) => {
    //     e.cancel = true;
    //     onAppointmentFormOpeningHandler(e);
    // }, [onAppointmentFormOpeningHandler]);

    const onAppointmentDblClick = useCallback((e: any) => {
        e.cancel = true;
        onAppointmentFormOpeningHandler(e);
    }, [onAppointmentFormOpeningHandler]);

    const timeCellTemplate = useCallback((cellData: any) => {
        return (
            <div>
                {dayjs.formatTime(cellData.date)}
            </div>
        );
    }, [dayjs]);

    const onContentReady = useCallback((e: any) => {
        if (initialDate && !isNaN(initialDate.getTime())) {
            e.component.scrollTo(initialDate);
        }
    }, [initialDate]);

    const dataSource = useMemo(() => {
        console.log('Appointments:', state.appointments);
        return Array.isArray(state.appointments) ? state.appointments.map(appt => {
            const startDate = parseAppointmentDate(appt.abTime);
            const endDate = parseAppointmentDate(appt.abEndTime);
            return {
                text: `${appt.abFName} ${appt.abLName || ''}`,
                startDate,
                endDate,
                id: appt.abID,
                status: appt.abStatus,
                allDay: false,
                resourceId: appt.hplID || appt.rlID,
            };
        }) : [];
    }, [state.appointments, parseAppointmentDate]);
    const resourceDataSource = useMemo(() => {
        const resources = new Map();
        if (Array.isArray(state.appointments)) {
            state.appointments.forEach(appt => {
                const resourceId = appt.hplID || appt.rlID;
                if (!resources.has(resourceId)) {
                    resources.set(resourceId, {
                        id: resourceId, // Change this to match the resourceId in appointments
                        text: appt.providerName || appt.rlName,
                        color: appt.abStatus === 'Confirmed' ? '#1e90ff' : '#ff9747',
                    });
                }
            });
        }
        return Array.from(resources.values());
    }, [state.appointments]);

    // useEffect(() => {
    //     console.log('DataSource:', dataSource);
    //     console.log('ResourceDataSource:', resourceDataSource);
    // }, [dataSource, resourceDataSource]);

    const MemoizedResource = useMemo(() => (
        <Resource
            fieldExpr="resourceId"
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
            onAppointmentClick={onAppointmentClickHandler}
            onAppointmentFormOpening={onAppointmentFormOpeningHandler}
            timeCellRender={timeCellTemplate}
            onContentReady={onContentReady}
        >
            {MemoizedResource}
        </Scheduler>
    );
});

export default React.memo(SchedulerComponent);
