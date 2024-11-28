import React, { useRef } from "react";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import SchedulerHeader from "../SubPage/SchedulerHeader";
import SchedulerComponent from "../SubPage/SchedulerComponent";
import SchedulerFooter from "../SubPage/SchedulerFooter";

const AppointmentDayViewPage: React.FC = () => {
  const schedulerRef1 = useRef<{ refresh: () => void } | null>(null);
  const schedulerRef2 = useRef<{ refresh: () => void } | null>(null);
  const schedulerRef3 = useRef<{ refresh: () => void } | null>(null);

  const handleRefresh1 = () => {
    if (schedulerRef1.current) {
      schedulerRef1.current.refresh();
    }
  };

  const handleRefresh2 = () => {
    if (schedulerRef2.current) {
      schedulerRef2.current.refresh();
    }
  };

  const handleRefresh3 = () => {
    if (schedulerRef3.current) {
      schedulerRef3.current.refresh();
    }
  };

  return (
    <>
      {/* First Header and Scheduler */}
      {/* <SchedulerHeader onRefresh={handleRefresh1} />
      <SchedulerComponent ref={schedulerRef1} /> */}

      {/* Second Header and Scheduler */}
      {/* <SchedulerHeader onRefresh={handleRefresh2} />
      <SchedulerComponent ref={schedulerRef2} /> */}

      {/* Third Header and Scheduler */}
      {/* <SchedulerHeader onRefresh={handleRefresh3} />
      <SchedulerComponent ref={schedulerRef3} /> */}

      {/* Footer */}
      <SchedulerFooter />
    </>
  );
};

export default AppointmentDayViewPage;
