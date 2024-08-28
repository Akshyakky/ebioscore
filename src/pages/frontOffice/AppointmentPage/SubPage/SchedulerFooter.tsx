//frontOffice/AppointmentPage/SubPage/SchedulerFooter.tsx
const legends = [
    { color: 'green', label: 'Out Patient' },
    { color: 'red', label: 'In Patient' },
    { color: 'yellow', label: 'Visited Patient' },
    { color: 'blue', label: 'Seen Patient' },
    { color: 'orange', label: 'Breaks' },
    { color: 'grey', label: 'Non Working Hour' },
    { color: 'purple', label: 'Non Registered Patients' },
    { color: 'lightcoral', label: 'Elapsed Slots' },
];

const SchedulerFooter = () => {
    return (
        <div className="scheduler-footer" style={{ display: 'flex', justifyContent: 'space-around' }}>
            {legends.map((legend, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 20, height: 20, backgroundColor: legend.color, marginRight: 8 }}></div>
                    <span>{legend.label}</span>
                </div>
            ))}
        </div>
    );
};

export default SchedulerFooter;

