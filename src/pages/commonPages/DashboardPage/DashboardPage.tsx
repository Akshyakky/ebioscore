import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Button,
  Badge,
} from "react-bootstrap";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { DashBoardService } from "../../../services/DashboardService/DashBoardService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/reducers";
import { useLoading } from "../../../context/LoadingContext";

// Define the interface for the count data
interface CountData {
  myCount: number | null;
  overallCount: number | null;
  show: boolean;
}

// Define the type with an index signature
type TitleMapping = {
  [key: string]: string;
};

// Define the mapping object with explicit types
const titleMapping: TitleMapping = {
  registration: "Registration",
  revisit: "Revisit",
  admission: "Admission",
  wbtransfer: "Ward Bed Transfer",
  discharge: "Discharge",
  income: "Income",
  collection: "Collection",
  refund: "Refund",
  creditnote: "Credit Note",
  transfernote: "Transfer Note",
  transferpaydetail: "Transfer Pay Details",
  advancecollection: "Advance Collection",
  // ... more mappings
};

const DashboardPage: React.FC = () => {
  const today = new Date();
  const setStartOfDay = (date: Date) => {
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    );
    return utcDate.toISOString();
  };

  const setEndOfDay = (date: Date) => {
    const utcDate = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
      )
    );
    return utcDate.toISOString();
  };

  const [dateRange, setDateRange] = useState({
    fromDate: setStartOfDay(today),
    toDate: setEndOfDay(today),
  });
  const [selectedOption, setSelectedOption] = useState("TD");
  const [counts, setCounts] = useState<Record<string, CountData>>({});
  const [showCounts, setShowCounts] = useState(false);
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const { setLoading } = useLoading();

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
    const today = new Date();
    let from, to;

    switch (event.target.value) {
      case "TD": // Today
        from = setStartOfDay(new Date(today));
        to = setEndOfDay(new Date(today));
        break;
      case "YD": // Yesterday
        from = setStartOfDay(new Date(today.setDate(today.getDate() - 1)));
        to = setEndOfDay(new Date(today.setDate(today.getDate())));
        break;
      case "TW": // This Week
        from = setStartOfDay(startOfWeek(today));
        to = setEndOfDay(endOfWeek(today));
        break;
      case "LW": // Last Week
        from = setStartOfDay(
          startOfWeek(new Date(today.setDate(today.getDate() - 7)))
        );
        to = setEndOfDay(endOfWeek(new Date(today.setDate(today.getDate()))));
        break;
      case "TM": // This Month
        from = setStartOfDay(startOfMonth(today));
        to = setEndOfDay(endOfMonth(today));
        break;
      case "LM": // Last Month
        from = setStartOfDay(
          startOfMonth(new Date(today.setMonth(today.getMonth() - 1)))
        );
        to = setEndOfDay(
          endOfMonth(new Date(today.setMonth(today.getMonth())))
        );
        break;
      case "TY": // This Year
        from = setStartOfDay(startOfYear(today));
        to = setEndOfDay(endOfYear(today));
        break;
      case "LY": // Last Year
        from = setStartOfDay(
          startOfYear(new Date(today.setFullYear(today.getFullYear() - 1)))
        );
        to = setEndOfDay(
          endOfYear(new Date(today.setFullYear(today.getFullYear())))
        );
        break;
      case "DT": // Date Range
        return; // The user will pick the dates
      default:
        from = setStartOfDay(new Date(today));
        to = setEndOfDay(new Date(today));
    }

    setDateRange({
      fromDate: from,
      toDate: to,
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const categories = [
        "Registration",
        "Revisit",
        "Admission",
        "WBTransfer",
        "Discharge",
        "Income",
        "Collection",
        "Refund",
        "CreditNote",
        "TransferNote",
        "TransferPayDetail",
        "AdvanceCollection",
      ];
      for (const category of categories) {
        const myCountResult = await DashBoardService.fetchCount(
          `Get${category}Userwise`,
          dateRange,
          token
        );
        const overallCountResult = await DashBoardService.fetchCount(
          `Get${category}`,
          dateRange,
          token
        );

        const isMyCountAvailable =
          !myCountResult.unauthorized && !myCountResult.error;
        const isOverallCountAvailable =
          !overallCountResult.unauthorized && !overallCountResult.error;

        if (isMyCountAvailable || isOverallCountAvailable) {
          setCounts((prevCounts) => ({
            ...prevCounts,
            [category.toLowerCase()]: {
              myCount: isMyCountAvailable ? myCountResult.count : null,
              overallCount: isOverallCountAvailable
                ? overallCountResult.count
                : null,
              show: true, // Set show to true if either count is available
            },
          }));
        } else {
          setCounts((prevCounts) => ({
            ...prevCounts,
            [category.toLowerCase()]: {
              ...prevCounts[category.toLowerCase()],
              show: false, // Set show to false if neither count is available
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error in fetchData", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };
  const handleShowButtonClick = async () => {
    await fetchData();
    setShowCounts(true); // Set showCounts to true after data is fetched
  };

  return (
    <MainLayout>
      <Container fluid>
        <Row>
          {/* Main Content */}
          <Col md={12} lg={12} className="ml-sm-auto px-md-4">
            {/* Date Range and Dropdown */}
            <Row className="align-items-center pt-3 pb-2 mb-3 border-bottom">
              <Col md={3}>
                <Form.Label>Select date range</Form.Label>
                <Form.Select
                  id="drpFilter"
                  title="Select Period"
                  onChange={handleSelect}
                  size="sm"
                >
                  <option value="TD">Today</option>
                  <option value="YD">Yesterday</option>
                  <option value="TW">This Week</option>
                  <option value="LW">Last Week</option>
                  <option value="TM">This Month</option>
                  <option value="LM">Last Month</option>
                  <option value="TY">This Year</option>
                  <option value="LY">Last Year</option>
                  <option value="DT">Date Range</option>
                </Form.Select>

                {/* Conditional Date Range Picker */}
              </Col>
              {selectedOption === "DT" && (
                <Col md={6}>
                  <Row>
                    {/* From Date */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>From</Form.Label>
                        <Form.Control
                          size="sm"
                          type="date"
                          name="from"
                          value={String(dateRange.fromDate)}
                          onChange={handleDateRangeChange}
                        />
                      </Form.Group>
                    </Col>

                    {/* To Date */}
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label>To</Form.Label>
                        <Form.Control
                          size="sm"
                          type="date"
                          name="to"
                          value={String(dateRange.toDate)}
                          onChange={handleDateRangeChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              )}
              <Col md={3} className="d-flex align-items-center">
                <Form.Group>
                  <Button
                    className="mt-md-4 btn-sm"
                    onClick={handleShowButtonClick}
                  >
                    <FontAwesomeIcon icon={faEye} /> Show
                  </Button>
                </Form.Group>
              </Col>
            </Row>

            {showCounts && (
              <Row>
                {Object.entries(counts).map(
                  ([key, countData]) =>
                    countData.show && ( // Only render the card if `show` is true
                      <Col md={6} lg={3} key={key} className="mb-4">
                        <Card className="shadow-sm h-100">
                          <Card.Body>
                            <Card.Title className="d-flex align-items-center justify-content-between">
                              <span className="text-capitalize">
                                {titleMapping[key.toLowerCase()] || key}{" "}
                                {/* Use the mapping or default to key */}
                              </span>
                              <FontAwesomeIcon
                                icon={faUsers}
                                className="text-secondary"
                              />
                            </Card.Title>
                            <hr />
                            {countData.myCount !== null && ( // Only show if `myCount` is not null
                              <Badge bg="primary" className="me-2">
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className="me-1"
                                />
                                My Count: {countData.myCount}
                              </Badge>
                            )}
                            {countData.overallCount !== null && ( // Only show if `overallCount` is not null
                              <Badge bg="success">
                                <FontAwesomeIcon
                                  icon={faUsers}
                                  className="me-1"
                                />
                                Overall: {countData.overallCount}
                              </Badge>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                )}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default DashboardPage;
