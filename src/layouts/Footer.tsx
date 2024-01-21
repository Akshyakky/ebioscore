import { Container } from "@mui/material";
import React from "react";

const Footer: React.FC = () => {
  return (
    <div className="footer">
      <Container>
        <p>
          Copyright &copy; {new Date().getFullYear()} Biosoft. All Rights
          Reserved.
        </p>
        {/* <p>
          <a href="/terms">Terms of Service</a> | <a href="/privacy">Privacy Policy</a>
        </p> */}
      </Container>
    </div>
  );
};

export default Footer;
