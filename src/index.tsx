import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "devextreme/dist/css/dx.material.orange.light.css";
import "sweetalert2/dist/sweetalert2.min.css";

// Optional: Create a performance reporting function
const reportPerformance = (metric: any) => {
  // You can send to analytics here
  console.log(metric);
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);

// Report web vitals with the custom reporter
reportWebVitals(reportPerformance);
