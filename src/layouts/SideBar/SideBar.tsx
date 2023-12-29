import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import moduleService from "../../services/CommonService/ModuleService";
import { ModuleDto, SubModuleDto } from "../../interfaces/Common/Modules";
import {
  Navbar,
  Container,
  Offcanvas,
  Nav,
  NavDropdown,
  Form,
  Collapse,
} from "react-bootstrap";
import "./SideBar.css";
import {
  faDashboard,
  faDesktop,
  faFemale,
  faHeartbeat,
  faHSquare,
  faIndustry,
  faMedkit,
  faMoneyBill,
  faStethoscope,
  faTty,
  faUniversity,
  faUserLock,
  faUserMd,
  faUserNurse,
  faUserPlus,
  faUsers,
  faUserShield,
  faHandshakeAngle,
  faBedPulse,
  faWheelchair,
  faPeopleArrows,
  faFileLines,
  faBell,
  faClipboard,
  faBed,
  faPersonMilitaryToPerson,
  faBaby,
  faHospitalUser,
  faBars,
  faUserCircle,
  faFileAlt,
  faLock,
  faUserCog,
  faStream,
  faStar,
  faSignOutAlt,
  faUser,
  // ... import other icons as needed
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { logout } from "../../store/actionCreators";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService/AuthService";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";

const iconMap: { [key: string]: any } = {
  faDashboard: faDashboard,
  faUsers: faUsers,
  faUserShield: faUserShield,
  faTachometer: faStethoscope,
  faUserPlus: faUserPlus,
  faUserMd: faUserMd,
  faMoneyBill: faMoneyBill,
  faDesktop: faDesktop,
  faHSquare: faHSquare,
  faStethoscope: faStethoscope,
  faUserLock: faUserLock,
  faFemale: faFemale,
  faUniversity: faUniversity,
  faIndustry: faIndustry,
  faMedkit: faMedkit,
  faHeartbeat: faHeartbeat,
  faTty: faTty,
  faUserNurse: faUserNurse,
  faHandshakeAngle: faHandshakeAngle,
  faBedPulse: faBedPulse,
  faWheelchair: faWheelchair,
  faPeopleArrows: faPeopleArrows,
  faFileLines: faFileLines,
  faBell: faBell,
  faClipboard: faClipboard,
  faBed: faBed,
  faPersonMilitaryToPerson: faPersonMilitaryToPerson,
  faBaby: faBaby,
  faHospitalUser: faHospitalUser,
  // ... map other icon names to their respective components
};

interface SideBarProps {
  userID: number | null;
  token: string | null;
}
// Custom styles to ensure proper alignment and prevent wrapping
const customDropdownStyles: React.CSSProperties = {
  minWidth: "250px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const SideBar: React.FC<SideBarProps> = ({ userID, token }) => {
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [subModules, setSubModules] = useState<SubModuleDto[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState<string>("Default Page Title");
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (token) {
      try {
        const response = await AuthService.logout(token);
        console.log(response.Message); // Handle the response message
        dispatch(logout()); // Clear Redux state
        navigate("/login"); // Redirect to login page immediately
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  useEffect(() => {
    switch (location.pathname) {
      case "/login":
        setPageTitle("Login");
        break;
      case "/dashboard":
        setPageTitle("Dashboard");
        break;
        case "/RegistrationPage":
          setPageTitle("Registration");
          break;
      // Add more cases for other paths as needed
      default:
        setPageTitle("Default Page Title");
        break;
    }
  }, [location]);

  useEffect(() => {
    const fetchNavigationData = async () => {
      if (token) {
        // Check if token is available
        const modulesData = await moduleService.getActiveModules(
          userID ?? 0,
          token
        );
        setModules(modulesData);
        const subModulesData = await moduleService.getActiveSubModules(
          userID ?? 0,
          token
        );
        setSubModules(subModulesData);
      }
    };

    fetchNavigationData();
  }, [userID, token]); // Dependencies

  const toggleModule = (moduleId: number) => {
    setActiveModuleId(activeModuleId === moduleId ? null : moduleId);
  };

  // Determine if a module should be displayed
  const shouldDisplayModule = (module: ModuleDto) => {
    return (
      module.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      subModules.some(
        (subModule) =>
          subModule.auGrpID === module.auGrpID &&
          subModule.title.toLowerCase().includes(filterKeyword.toLowerCase())
      )
    );
  };

  // Filter modules based on the search term or if any of its submodules match the search term
  const filteredModules = modules.filter(shouldDisplayModule);

  // Determine submodules to display based on the search term
  const getFilteredSubModules = (module: ModuleDto) => {
    if (module.title.toLowerCase().includes(filterKeyword.toLowerCase())) {
      // If the module matches, display all its submodules
      return subModules.filter(
        (subModule) => subModule.auGrpID === module.auGrpID
      );
    } else {
      // Otherwise, filter submodules
      return subModules.filter(
        (subModule) =>
          subModule.auGrpID === module.auGrpID &&
          subModule.title.toLowerCase().includes(filterKeyword.toLowerCase())
      );
    }
  };

  return (
    <>
      <Navbar expand={false} className="bg-body-tertiary mb-1">
        <Container fluid>
          <Navbar.Toggle aria-controls="offcanvasNavbar">
            <FontAwesomeIcon icon={faBars} />
          </Navbar.Toggle>

          <Navbar.Brand>{pageTitle}</Navbar.Brand>
          <NavDropdown
            id="dropdown-button-dark-example2"
            menuVariant="dark"
            title={
              <>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {userInfo.userName || "Profile"}{" "}
                {/* Display user name or fallback to 'Profile' */}
              </>
            }
            className="custom-profile-dropdown me-2" // Added custom class here
            data-bs-theme="dark"
            drop="start"
          >
            <NavDropdown.Item href="#settings" style={customDropdownStyles}>
              <FontAwesomeIcon icon={faUserCircle} className="me-2" />
              View Profile
            </NavDropdown.Item>
            <NavDropdown.Item href="#/action-2">
              <FontAwesomeIcon icon={faFileAlt} className="me-2" />
              My Reports
            </NavDropdown.Item>
            <NavDropdown.Item href="#/action-3">
              <FontAwesomeIcon icon={faBell} className="me-2" />
              What's New
            </NavDropdown.Item>
            <NavDropdown.Item href="#/action-3">
              <FontAwesomeIcon icon={faLock} className="me-2" />
              Release Lock
            </NavDropdown.Item>
            <NavDropdown.Item href="#/action-3">
              <FontAwesomeIcon icon={faUserCog} className="me-2" />
              Admin View
            </NavDropdown.Item>
            <NavDropdown.Item href="#/action-3">
              <FontAwesomeIcon icon={faStream} className="me-2" />
              Recently Used Modules
            </NavDropdown.Item>
            <NavDropdown.Item href="#/action-3">
              <FontAwesomeIcon icon={faStar} className="me-2" />
              Most Used Modules
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#logout" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Logout
            </NavDropdown.Item>
          </NavDropdown>
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="start"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                eBios Core
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="sidebar-container">
              <Form className="d-flex mb-3">
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                  onChange={(e) => setFilterKeyword(e.target.value)}
                />
              </Form>
              <Nav className="flex-column">
                {filteredModules.map((module) => (
                  <Nav.Item key={"module-" + module.auGrpID} className="mb-2">
                    <NavLink
                      to="#"
                      className="text-decoration-none sidebar-link"
                      onClick={() => toggleModule(module.auGrpID)}
                    >
                      <FontAwesomeIcon
                        icon={iconMap[module.iCon] || faUsers}
                        className="sidebar-icon"
                      />
                      <span className="ms-2 sidebar-text">{module.title}</span>
                    </NavLink>
                    <Collapse in={activeModuleId === module.auGrpID}>
                      <div>
                        {getFilteredSubModules(module).map(
                          (subModule, index) => (
                            <NavLink
                              key={`subModule-${subModule.auGrpID}-${index}`}
                              to={subModule.link}
                              className="d-block text-decoration-none pl-4 sidebar-link"
                            >
                              <FontAwesomeIcon
                                icon={iconMap[subModule.iCon] || faUsers}
                                className="sidebar-icon"
                              />
                              <span className="ms-2 sidebar-text">
                                {subModule.title}
                              </span>
                            </NavLink>
                          )
                        )}
                      </div>
                    </Collapse>
                  </Nav.Item>
                ))}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default SideBar;
