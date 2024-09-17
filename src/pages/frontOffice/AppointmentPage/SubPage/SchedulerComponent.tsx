import React, { useMemo, useCallback, forwardRef, useImperativeHandle, useEffect, useState, useRef } from 'react';
import { Scheduler, Resource } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.light.css';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import useDayjs from '../../../../hooks/Common/useDateTime';
import { useAppointments } from '../../../../hooks/FrontOffice/useAppointments';
import { CommonService } from '../../../../services/CommonServices/CommonService';
import { BreakListService } from '../../../../services/FrontOfficeServices/BreakListServices/BreakListService';

const views: Array<'day' | 'week' | 'workWeek' | 'month'> = ['day', 'week', 'workWeek', 'month'];

interface SchedulerComponentProps {
    hpID?: number;
    rlID?: number;
    onAppointmentFormOpening: (startDate?: Date, endDate?: Date) => void;
    onAppointmentClick: (abID: number) => void;
}

interface WorkingHours {
    [key: string]: { start: number; end: number };
}


interface BreakItem {
    bLID: number;
    bLName: string;
    bLStartDate: string;
    bLEndDate: string;
    bLStartTime: string;
    bLEndTime: string;
    bLFrqNo: number;
    bLFrqDesc: string;
    bLFrqWkDesc: string;
    hplId: number;
    hplName?: string;
}

const frequencyCodeMap: { [key: number]: string } = {
    0: "FO70", // none
    1: "FO71", // daily
    2: "FO72", // weekly
    3: "FO73", // monthly
    5: "FO74"  // yearly
};

const weekDayCodeMap: { [key: string]: string } = {
    "FO75": "Sunday",
    "FO76": "Monday",
    "FO77": "Tuesday",
    "FO78": "Wednesday",
    "FO79": "Thursday",
    "FO80": "Friday",
    "FO81": "Saturday"
};


const SchedulerComponent = forwardRef<unknown, SchedulerComponentProps>((props, ref) => {
    const srvDate = useServerDate();
    const dayjs = useDayjs(srvDate || new Date());
    const { parse, format, formatTime, add, date: dayjsDate } = useDayjs(srvDate || new Date());
    const initialDate = useRef(srvDate || new Date());
    const { hpID, rlID, onAppointmentFormOpening, onAppointmentClick } = props;

    const { state, setState, refresh } = useAppointments(initialDate.current, hpID, rlID);
    const [workingHours, setWorkingHours] = useState<WorkingHours>({});
    const [breaks, setBreaks] = useState<BreakItem[]>([]);

    useImperativeHandle(ref, () => ({
        refresh,
    }));

    useEffect(() => {
        let isMounted = true;
        const fetchWorkingHours = async () => {
            try {
                const result = await CommonService.fetchAllHospWorkingHours();
                if (result.success && result.data && isMounted) {
                    const hours: WorkingHours = {};
                    result.data.forEach(item => {
                        const day = item.daysDesc.toLowerCase();
                        const startHour = parseInt(item.startTime.split(' ')[1].split(':')[0], 10);
                        const endHour = parseInt(item.endTime.split(' ')[1].split(':')[0], 10);
                        hours[day] = { start: startHour, end: endHour };
                    });
                    setWorkingHours(hours);
                }
            } catch (error) {
                // Handle error
            }
        };

        fetchWorkingHours();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchBreaks = async () => {
            try {
                const result = await BreakListService.getActiveBreaks(state.date, add(1, 'month', state.date).toDate(), hpID);
                if (result.success && result.data && isMounted) {
                    const mappedBreaks = result.data.map((breakItem: BreakItem) => ({
                        ...breakItem,
                        bLFrqDesc: frequencyCodeMap[breakItem.bLFrqNo] || breakItem.bLFrqDesc,
                        bLFrqWkDesc: breakItem.bLFrqWkDesc.split('-')
                            .map(code => weekDayCodeMap[code] || code)
                            .join('-')
                    }));
                    setBreaks(mappedBreaks);
                }
            } catch (error) {
                console.error('Error fetching breaks:', error);
            }
        };

        fetchBreaks();

        return () => {
            isMounted = false;
        };
    }, [state.date, hpID, add]);

    const parseAppointmentDate = useCallback((dateString: string) => {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        const reformattedDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
        return new Date(reformattedDateString);
    }, []);

    const onViewChange = useCallback((view: string) => {
        if (['day', 'week', 'workWeek', 'month'].includes(view)) {
            setState(prevState => ({ ...prevState, currentView: view as 'day' | 'week' | 'workWeek' | 'month' }));
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
        e.cancel = true;
        if (e.appointmentData && e.appointmentData.id) {
            onAppointmentClick(e.appointmentData.id);
        }
    }, [onAppointmentClick]);

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

    const cellTemplate = useCallback((itemData: any) => {
        const date = new Date(itemData.startDate);
        const dayOfWeek = format("dddd", date).toLowerCase();
        const hour = date.getHours();
        const currentTime = new Date();

        const dayWorkingHours = workingHours[dayOfWeek];

        let cellColor = 'transparent';
        if (dayWorkingHours) {
            if (hour < dayWorkingHours.start || hour >= dayWorkingHours.end) {
                cellColor = 'rgba(0, 0, 0, 0.1)'; // Non-working hours
            } else if (date < currentTime) {
                cellColor = 'rgba(255, 0, 0, 0.1)'; // Elapsed slots
            } else {
                cellColor = 'rgba(0, 255, 0, 0.1)'; // Working hours
            }
        }

        return (
            <div style={{
                height: '100%',
                backgroundColor: cellColor
            }}>
                {itemData.text}
            </div>
        );
    }, [workingHours, format]);

    const onContentReady = useCallback((e: any) => {
        if (initialDate.current && !isNaN(initialDate.current.getTime())) {
            e.component.scrollTo(initialDate.current);
        }
    }, []);

    const dataSource = useMemo(() => {
        const appointments = Array.isArray(state.appointments) ? state.appointments.map(appt => ({
            text: `${appt.abFName} ${appt.abLName || ''}`,
            startDate: parseAppointmentDate(appt.abTime),
            endDate: parseAppointmentDate(appt.abEndTime),
            id: appt.abID,
            status: appt.abStatus,
            allDay: false,
            resourceId: appt.hplID || appt.rlID,
            type: 'appointment'
        })) : [];

        const breakAppointments = breaks.flatMap(breakItem => {
            const startDate = new Date(breakItem.bLStartDate);
            const endDate = new Date(breakItem.bLEndDate);
            const breakAppointments = [];

            while (startDate <= endDate) {
                if (breakItem.bLFrqDesc === 'FO71' || // daily
                    (breakItem.bLFrqDesc === 'FO72' && breakItem.bLFrqWkDesc.includes(format('dddd', startDate))) || // weekly
                    (breakItem.bLFrqDesc === 'FO73' && startDate.getDate() === new Date(breakItem.bLStartDate).getDate()) || // monthly
                    (breakItem.bLFrqDesc === 'FO74' && startDate.getMonth() === new Date(breakItem.bLStartDate).getMonth() && startDate.getDate() === new Date(breakItem.bLStartDate).getDate())) { // yearly

                    breakAppointments.push({
                        text: breakItem.bLName,
                        startDate: new Date(startDate.setHours(new Date(breakItem.bLStartTime).getHours(), new Date(breakItem.bLStartTime).getMinutes())),
                        endDate: new Date(startDate.setHours(new Date(breakItem.bLEndTime).getHours(), new Date(breakItem.bLEndTime).getMinutes())),
                        id: `break_${breakItem.bLID}_${startDate.toISOString()}`,
                        status: 'Break',
                        allDay: false,
                        resourceId: breakItem.hplId,
                        type: 'break'
                    });
                }
                startDate.setDate(startDate.getDate() + 1);
            }

            return breakAppointments;
        });

        return [...appointments, ...breakAppointments];
    }, [state.appointments, breaks, parseAppointmentDate, format]);

    const resourceDataSource = useMemo(() => {
        const resources = new Map();
        if (Array.isArray(state.appointments)) {
            state.appointments.forEach(appt => {
                const resourceId = appt.hplID || appt.rlID;
                if (!resources.has(resourceId)) {
                    resources.set(resourceId, {
                        id: resourceId,
                        text: appt.providerName || appt.rlName,
                        color: appt.abStatus === 'Confirmed' ? '#1e90ff' : '#ff9747',
                    });
                }
            });
        }
        // Add resources for breaks if they're not already included
        breaks.forEach(breakItem => {
            if (!resources.has(breakItem.hplId)) {
                resources.set(breakItem.hplId, {
                    id: breakItem.hplId,
                    text: breakItem.hplName || `Break Resource ${breakItem.hplId}`, // Use a fallback if hplName is not present
                    color: '#ff0000', // You can choose a specific color for breaks
                });
            }
        });
        return Array.from(resources.values());
    }, [state.appointments, breaks]);

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
            dataCellRender={cellTemplate}
            onContentReady={onContentReady}
        >
            {MemoizedResource}
        </Scheduler>
    );
});

export default React.memo(SchedulerComponent);