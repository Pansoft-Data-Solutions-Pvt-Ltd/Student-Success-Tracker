import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Typography,
  DropdownButtonItem,
} from "@ellucian/react-design-system/core";

// Title-case helper: "SPRING 2026" → "Spring 2026"
const toTitleCase = (str) => {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const styles = `
  /* Force normal text-transform on all buttons */
  .card-header button,
  .card-header [class*="Button"],
  .card-header [class*="button"] {
    text-transform: none !important;
    letter-spacing: normal !important;
  }

  /* Dropdown items */
  .term-section [class*="dropdown"] li,
  .term-section [class*="Dropdown"] li,
  .term-section [class*="menu"] li,
  .term-section ul li {
    color: #000000 !important;
    background-color: #ffffff !important;
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Focus state */
  .term-section [class*="dropdown"] li:focus,
  .term-section [class*="Dropdown"] li:focus,
  .term-section [class*="menu"] li:focus,
  .term-section ul li:focus,
  .term-section [class*="dropdown"] li:focus-visible,
  .term-section ul li:focus-visible {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
    background-color: #EDE9FE !important;
    color: #000000 !important;
  }

  /* Hover state */
  .term-section [class*="dropdown"] li:hover,
  .term-section [class*="Dropdown"] li:hover,
  .term-section [class*="menu"] li:hover,
  .term-section ul li:hover {
    background-color: #EDE9FE !important;
    color: #000000 !important;
  }

  /* Selected item */
  .term-section [class*="selected"],
  .term-section [class*="active"],
  .term-section [class*="Selected"],
  .term-section [class*="Active"] {
    background-color: #EDE9FE !important;
    color: #000000 !important;
  }
`;

const HomeHeader = ({
  currentTerm,
  termCodesResult,
  loadingTermCodes,
  handleTermChange,
}) => {
  // HomeHeader is a pure display/interaction component.
  // Term initialisation (card term vs latest term) is handled in Home.jsx.
  // This component simply displays whichever term Home.jsx has set as current.

  const backHref = useMemo(() => {
    const segments = window?.location?.pathname
      ?.split("/")
      .filter(Boolean);

    if (segments.length > 0) {
      return `${window.location.origin}/${segments[0]}/`;
    }

    return window.location.origin;
  }, []);

  const handleBack = () => {
    window.location.assign(backHref);
  };

  return (
    <>
      <style>{styles}</style>

      <div className="card-header">
        {/* Back Button */}
        <div className="back-button-wrapper">
          <Button onClick={handleBack}>
            Back
          </Button>
        </div>

        {/* Title — reflects whatever term Home.jsx has initialised/selected */}
        <div>
          <Typography
            variant="h4"
            className="card-title"
            style={{
              fontWeight: 700,
              color: "#1F2937",
              textAlign: "center",
            }}
          >
            Academic Performance
            {currentTerm ? ` – ${toTitleCase(currentTerm)}` : ""}
          </Typography>
        </div>

        {/* Select Term dropdown */}
        <div className="top-bar">
          <div className="term-section">
            <Typography className="term-label">
              Select Term
            </Typography>

            <Button
              disabled={loadingTermCodes || !termCodesResult}
              dropdown={termCodesResult
                ?.sort((a, b) =>
                  a.termCode.localeCompare(b.termCode)
                )
                .map((term) => (
                  <DropdownButtonItem
                    key={term.termCode}
                    onClick={() => handleTermChange(term)}
                  >
                    {toTitleCase(term.term)}
                  </DropdownButtonItem>
                ))}
            >
              {loadingTermCodes
                ? "Loading..."
                : toTitleCase(currentTerm) || "Select Term"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

HomeHeader.propTypes = {
  currentTerm:      PropTypes.string,
  termCodesResult:  PropTypes.array,
  loadingTermCodes: PropTypes.bool.isRequired,
  handleTermChange: PropTypes.func.isRequired,
};

export default HomeHeader;