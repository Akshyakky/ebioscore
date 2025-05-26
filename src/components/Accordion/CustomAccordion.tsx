import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface CustomAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CustomAccordion: React.FC<CustomAccordionProps> = ({ title, children, defaultExpanded = false }) => {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${title}-content`} id={`${title}-header`}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
export default CustomAccordion;
