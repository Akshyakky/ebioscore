import { useLoading } from "@/context/LoadingContext";
import useDayjs from "@/hooks/Common/useDateTime";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { useAppointments } from "@/hooks/FrontOffice/useAppointments";
import { CommonService } from "@/services/CommonServices/CommonService";
import { AppointmentService } from "@/services/FrontOfficeServices/AppointmentServices/AppointmentService";
import { BreakListService } from "@/services/FrontOfficeServices/BreakListServices/BreakListService";
import { Box, useTheme } from "@mui/material";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { dxSchedulerAppointment } from "devextreme/ui/scheduler";
import { Scheduler, Resource } from "devextreme-react/scheduler";

const views: Array<"day" | "week" | "workWeek" | "month"> = ["day", "week", "workWeek", "month"];

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
  5: "FO74", // yearly
};

const weekDayCodeMap: { [key: string]: string } = {
  FO75: "Sunday",
  FO76: "Monday",
  FO77: "Tuesday",
  FO78: "Wednesday",
  FO79: "Thursday",
  FO80: "Friday",
  FO81: "Saturday",
};

const SchedulerComponent = forwardRef<unknown, SchedulerComponentProps>((props, ref) => {
  const { hpID, rlID, onAppointmentFormOpening, onAppointmentClick } = props;
  const srvDate = useServerDate();
  const dayjs = useDayjs(srvDate || new Date());
  const { parse, format, formatTime, add, date: dayjsDate } = dayjs;
  const initialDate = useRef(srvDate || new Date());

  const { state, setState, refresh } = useAppointments(initialDate.current, hpID, rlID);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [breaks, setBreaks] = useState<BreakItem[]>([]);
  const { setLoading } = useLoading();
  const theme = useTheme();

  const schedulerStyles = useMemo(
    () => ({
      ".dx-scheduler": {
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.background.default,
        color: theme.palette.text.primary,
      },
      ".dx-scheduler-header": {
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.default : theme.palette.primary.main,
        color: theme.palette.mode === "dark" ? theme.palette.text.primary : theme.palette.primary.contrastText,
      },
      ".dx-scheduler-date-table-cell": {
        borderColor: theme.palette.divider,
      },
      ".dx-scheduler-time-panel-cell": {
        color: theme.palette.text.secondary,
      },
      ".dx-scheduler-appointment": {
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.dark : theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      },
      ".dx-scheduler-all-day-appointment": {
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.secondary.dark : theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
      },
      ".dx-scheduler-appointment-tooltip": {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      },
      ".dx-scheduler-date-time-indicator": {
        backgroundColor: `${theme.palette.error.main} !important`,
        "&::before": {
          backgroundColor: `${theme.palette.error.main} !important`,
        },
      },
      ".dx-scheduler-date-time-indicator-cell": {
        borderTopColor: `${theme.palette.error.main} !important`,
      },
    }),
    [theme]
  );

  useImperativeHandle(ref, () => ({ refresh }), [refresh]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [workingHoursResult, breaksResult] = await Promise.all([
          CommonService.fetchAllHospWorkingHours(),
          BreakListService.getActiveBreaks(state.date, add(1, "month", state.date).toDate(), hpID),
        ]);

        if (isMounted) {
          if (workingHoursResult.success && workingHoursResult.data) {
            const hours: WorkingHours = {};
            workingHoursResult.data.forEach((item) => {
              const day = item.daysDesc.toLowerCase();
              const startHour = parseInt(item.startTime.split(" ")[1].split(":")[0], 10);
              const endHour = parseInt(item.endTime.split(" ")[1].split(":")[0], 10);
              hours[day] = { start: startHour, end: endHour };
            });
            setWorkingHours(hours);
          }

          if (breaksResult.success && breaksResult.data) {
            const mappedBreaks = breaksResult.data.map((breakItem: BreakItem) => ({
              ...breakItem,
              bLFrqDesc: frequencyCodeMap[breakItem.bLFrqNo] || breakItem.bLFrqDesc,
              bLFrqWkDesc: breakItem.bLFrqWkDesc
                .split("-")
                .map((code) => weekDayCodeMap[code] || code)
                .join("-"),
            }));
            setBreaks(mappedBreaks);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [state.date, hpID, add]);

  const parseAppointmentDate = useCallback((dateString: string) => {
    const [datePart, timePart] = dateString.split("T");
    let [day, month, year] = datePart.includes("-") ? datePart.split("-") : datePart.split("/");

    day = day.padStart(2, "0");
    month = month.padStart(2, "0");

    if (year.length === 2) {
      const currentYear = new Date().getFullYear();
      const century = Math.floor(currentYear / 100) * 100;
      year = (century + parseInt(year)).toString();
    }

    return new Date(`${year}-${month}-${day}T${timePart}`);
  }, []);

  const onViewChange = useCallback(
    (view: string) => {
      if (["day", "week", "workWeek", "month"].includes(view)) {
        setState((prevState) => ({ ...prevState, currentView: view as "day" | "week" | "workWeek" | "month" }));
      }
    },
    [setState]
  );

  const onCurrentDateChange = useCallback(
    (value: string | number | Date) => {
      const newDate = parse(value.toString()).toDate();
      setState((prevState) => ({ ...prevState, date: newDate }));
    },
    [setState, parse]
  );

  const handleBreakAppointment = useCallback((e: any) => {
    e.cancel = true;
  }, []);

  const onAppointmentFormOpeningHandler = useCallback(
    (e: any) => {
      if (e.appointmentData.type === "break") {
        handleBreakAppointment(e);
        return;
      }
      e.cancel = true;
      const { startDate, endDate } = e.appointmentData;
      onAppointmentFormOpening?.(startDate, endDate);
    },
    [onAppointmentFormOpening, handleBreakAppointment]
  );

  const onAppointmentClickHandler = useCallback(
    (e: any) => {
      if (e.appointmentData.type === "break") {
        handleBreakAppointment(e);
        return;
      }
      e.cancel = true;
      if (e.appointmentData?.id) {
        onAppointmentClick(e.appointmentData.id);
      }
    },
    [onAppointmentClick, handleBreakAppointment]
  );

  const onAppointmentDblClick = useCallback(
    (e: any) => {
      if (e.appointmentData.type === "break") {
        handleBreakAppointment(e);
        return;
      }
      e.cancel = true;
      onAppointmentFormOpeningHandler(e);
    },
    [onAppointmentFormOpeningHandler, handleBreakAppointment]
  );

  const onAppointmentUpdating = useCallback(
    async (e: any) => {
      if (e.oldData.type === "break") {
        handleBreakAppointment(e);
      }
      e.cancel = true;
      const newStartDate = new Date(e.newData.startDate);
      const newEndDate = new Date(e.newData.endDate);
      try {
        setLoading(true);
        const result = await AppointmentService.updateAppointmentTimes(
          e.oldData.id,
          format("DD-MM-YYYY", newStartDate),
          format("DD-MM-YYYY HH:mm:ss", newStartDate),
          format("DD-MM-YYYY HH:mm:ss", newEndDate)
        );
        if (result.success) {
          // Update the appointment in the local state
          setState((prevState) => ({
            ...prevState,
            appointments: prevState.appointments.map((appt) =>
              appt.abID === e.oldData.id
                ? {
                    ...appt,
                    abTime: format("DD-MM-YYYY HH:mm:ss", newStartDate),
                    abEndTime: format("DD-MM-YYYY HH:mm:ss", newEndDate),
                  }
                : appt
            ),
          }));
        } else {
          console.error("Failed to update appointment:", result.errorMessage);
        }
      } catch (error) {
        console.error("Error updating appointment:", error);
      } finally {
        setLoading(false);
      }
    },
    [handleBreakAppointment]
  );

  const onAppointmentDeleting = useCallback(
    (e: any) => {
      if (e.appointmentData.type === "break") {
        handleBreakAppointment(e);
      }
    },
    [handleBreakAppointment]
  );

  const timeCellTemplate = useCallback((cellData: any) => <div>{formatTime(cellData.date)}</div>, [formatTime]);

  const onAppointmentDragHandler = useCallback((e: any) => {
    if (e.appointmentData.type === "break") {
      e.cancel = true; // Prevent dragging for breaks
    }
  }, []);

  const onAppointmentDrag = useCallback((e: any) => {
    if (e.appointmentData.type === "break") {
      e.cancel = true; // Prevent dragging for breaks
      return;
    }

    // Allow dragging for regular appointments
    e.cancel = false;
  }, []);

  const onAppointmentAdding = useCallback((e: any) => {
    // You can add any logic here for new appointments if needed
  }, []);

  const cellTemplate = useMemo(() => {
    return (itemData: any) => {
      const date = new Date(itemData.startDate);
      const dayOfWeek = format("dddd", date).toLowerCase();
      const hour = date.getHours();
      const currentTime = new Date();

      const dayWorkingHours = workingHours[dayOfWeek];

      let cellColor = theme.palette.background.default; // Default background color
      let textColor = theme.palette.text.primary; // Default text color

      if (dayWorkingHours) {
        if (hour < dayWorkingHours.start || hour >= dayWorkingHours.end) {
          cellColor = theme.palette.action.disabledBackground;
        } else if (date < currentTime) {
          cellColor = theme.palette.mode === "dark" ? theme.palette.error.dark : theme.palette.error.light;
        } else {
          cellColor = theme.palette.mode === "dark" ? theme.palette.success.dark : theme.palette.success.light;
        }
        textColor = theme.palette.getContrastText(cellColor);
      }

      return (
        <div
          style={{
            height: "100%",
            backgroundColor: cellColor,
            color: textColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative", // Add this to ensure the time indicator shows above the cell content
          }}
        >
          {itemData.text}
        </div>
      );
    };
  }, [workingHours, format, theme]);

  const onContentReady = useCallback((e: any) => {
    if (initialDate.current && !isNaN(initialDate.current.getTime())) {
      e.component.scrollTo(initialDate.current);
    }
  }, []);

  const appointmentTemplate = useCallback(
    (model: any) => {
      const { appointmentData } = model;
      let backgroundColor, textColor, statusIndicator;

      if (appointmentData.type === "break") {
        backgroundColor = theme.palette.warning.main;
        textColor = theme.palette.warning.contrastText;
      } else {
        backgroundColor = theme.palette.primary.main;
        textColor = theme.palette.primary.contrastText;

        switch (appointmentData.status) {
          case "Confirmed":
            statusIndicator = "✓";
            break;
          case "Pending":
            statusIndicator = "⏳";
            break;
          case "Cancelled":
            statusIndicator = "✗";
            break;
          default:
            statusIndicator = "";
        }
      }

      return (
        <div
          style={{
            backgroundColor,
            color: textColor,
            padding: "2px 5px",
            borderRadius: "3px",
            fontSize: "0.9em",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
            cursor: appointmentData.type === "break" ? "default" : "pointer",
          }}
        >
          {statusIndicator && <span style={{ marginRight: "5px" }}>{statusIndicator}</span>}
          {appointmentData.text}
        </div>
      );
    },
    [theme]
  );

  const appointmentTooltipTemplate = useCallback(
    (model: any) => {
      const { appointmentData } = model;
      return (
        <div style={{ padding: "10px" }}>
          <h3>{appointmentData.type === "break" ? "Break" : "Appointment"}</h3>
          <p>
            <strong>{appointmentData.text}</strong>
          </p>
          <p>Start: {format("HH:mm", appointmentData.startDate)}</p>
          <p>End: {format("HH:mm", appointmentData.endDate)}</p>
          {appointmentData.type === "break" && <p>Frequency: {appointmentData.frequency}</p>}
        </div>
      );
    },
    [format]
  );

  const dataSource = useMemo((): dxSchedulerAppointment[] => {
    const appointments = Array.isArray(state.appointments)
      ? state.appointments.map((appt) => ({
          text: `${appt.abFName} ${appt.abLName || ""}`,
          startDate: appt.abTime,
          endDate: appt.abEndTime,
          id: appt.abID,
          status: appt.abStatus,
          allDay: false,
          resourceId: appt.hplID || appt.rlID,
          type: "appointment",
        }))
      : [];

    const currentDate = new Date(state.date);
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const breakAppointments = breaks
      .filter((breakItem) => {
        const breakStart = new Date(breakItem.bLStartDate);
        const breakEnd = new Date(breakItem.bLEndDate);
        return breakStart <= monthEnd && breakEnd >= monthStart;
      })
      .flatMap((breakItem) => {
        const startDate = new Date(breakItem.bLStartDate);
        const endDate = new Date(breakItem.bLEndDate);
        const breakAppointments = [];

        while (startDate.getDate() <= endDate.getDate()) {
          if (
            breakItem.bLFrqDesc === "FO71" || // daily
            (breakItem.bLFrqDesc === "FO72" && breakItem.bLFrqWkDesc.includes(format("dddd", startDate))) || // weekly
            (breakItem.bLFrqDesc === "FO73" && startDate.getDate() === new Date(breakItem.bLStartDate).getDate()) || // monthly
            (breakItem.bLFrqDesc === "FO74" &&
              startDate.getMonth() === new Date(breakItem.bLStartDate).getMonth() &&
              startDate.getDate() === new Date(breakItem.bLStartDate).getDate())
          ) {
            // yearly

            breakAppointments.push({
              text: breakItem.bLName,
              startDate: new Date(startDate.setHours(new Date(breakItem.bLStartTime).getHours(), new Date(breakItem.bLStartTime).getMinutes())),
              endDate: new Date(startDate.setHours(new Date(breakItem.bLEndTime).getHours(), new Date(breakItem.bLEndTime).getMinutes())),
              id: `break_${breakItem.bLID}_${startDate.toISOString()}`,
              status: "Break",
              allDay: false,
              resourceId: breakItem.hplId,
              type: "break",
              frequency: breakItem.bLFrqDesc,
            });
          }
          startDate.setDate(startDate.getDate() + 1);
        }
        return breakAppointments;
      });

    return [...appointments, ...breakAppointments];
  }, [state.appointments, breaks, state.date, parseAppointmentDate, format]);

  const resourceDataSource = useMemo(() => {
    const resources = new Map();
    if (Array.isArray(state.appointments)) {
      state.appointments.forEach((appt) => {
        const resourceId = appt.hplID || appt.rlID;
        if (!resources.has(resourceId)) {
          resources.set(resourceId, {
            id: resourceId,
            text: appt.providerName || appt.rlName,
            color: theme.palette.primary.main, // Use primary color for all appointments
          });
        }
      });
    }
    breaks.forEach((breakItem) => {
      if (!resources.has(breakItem.hplId)) {
        resources.set(breakItem.hplId, {
          id: breakItem.hplId,
          text: breakItem.hplName || `Break Resource ${breakItem.hplId}`,
          color: theme.palette.warning.main, // Use warning color for breaks
        });
      }
    });
    return Array.from(resources.values());
  }, [state.appointments, breaks, theme]);

  const MemoizedResource = useMemo(() => <Resource fieldExpr="resourceId" allowMultiple={true} dataSource={resourceDataSource} label="Appointment" />, [resourceDataSource]);

  return (
    <Box sx={{ height: "100%", width: "100%", ...schedulerStyles }}>
      {/* <Loader type="skeleton" skeletonType="calendar" height="600px" width="100%" /> */}
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
        onAppointmentUpdating={onAppointmentUpdating}
        onAppointmentDeleting={onAppointmentDeleting}
        onAppointmentAdding={onAppointmentAdding}
        adaptivityEnabled={true}
        showCurrentTimeIndicator={true}
        shadeUntilCurrentTime={true}
        height="100%"
        width="100%"
        onAppointmentDblClick={onAppointmentDblClick}
        onAppointmentClick={onAppointmentClickHandler}
        onAppointmentFormOpening={onAppointmentFormOpeningHandler}
        // onAppointmentDrag={onAppointmentDragHandler}
        timeCellRender={timeCellTemplate}
        dataCellRender={cellTemplate}
        onContentReady={onContentReady}
        appointmentRender={appointmentTemplate}
        appointmentTooltipRender={appointmentTooltipTemplate}
      >
        {MemoizedResource}
      </Scheduler>
    </Box>
  );
});

export default React.memo(SchedulerComponent);
