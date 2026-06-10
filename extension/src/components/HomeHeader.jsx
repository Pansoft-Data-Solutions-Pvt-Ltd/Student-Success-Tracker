import React, { useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Typography,
  DropdownButtonItem,
} from "@ellucian/react-design-system/core";

const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

// Inject into <head> — beats JSS every time
const injectHeadStyles = () => {
  const id = "home-header-override";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.innerHTML = `
    .home-header-btn button {
      background-color: #ffffff !important;
      color: #320070 !important;
      border: 1px solid #320070 !important;
      border-radius: 4px !important;
      padding: 6px 16px !important;
      font-weight: 600 !important;
      text-transform: none !important;
      letter-spacing: normal !important;
      box-shadow: none !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .home-header-btn button:hover {
      background-color: #F6F6FD !important;
    }
    .home-header-btn button * {
      color: #320070 !important;
      fill: #320070 !important;
      text-transform: none !important;
      letter-spacing: normal !important;
    }
  `;
  document.head.appendChild(style);
};

const HomeHeader = ({
  currentTerm,
  termCodesResult,
  loadingTermCodes,
  handleTermChange,
}) => {
  useEffect(() => {
    injectHeadStyles();
  }, []);

  const backHref = useMemo(() => {
    const segments = window?.location?.pathname?.split("/").filter(Boolean);
    if (segments.length > 0) {
      return `${window.location.origin}/${segments[0]}/`;
    }
    return window.location.origin;
  }, []);

  const handleBack = () => {
    window.location.assign(backHref);
  };

  const termLabel = loadingTermCodes
    ? "Loading..."
    : toTitleCase(currentTerm) || "Select Term";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 24px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #E5E7EB",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* LEFT — Back Button */}
      <div className="home-header-btn" style={{ flex: "0 0 auto" }}>
        <Button onClick={handleBack}>← Back</Button>
      </div>

      {/* CENTER — Title */}
      <div style={{ flex: 1, textAlign: "center", margin: "0 16px" }}>
        <Typography
          style={{
            fontWeight: 800,
            fontSize: "22px",
            color: "#1F2937",
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
            display: "block",
          }}
        >
          Academic Performance
          {currentTerm ? ` – ${toTitleCase(currentTerm)}` : ""}
        </Typography>
      </div>

      {/* RIGHT — Select Term */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Typography
          style={{
            whiteSpace: "nowrap",
            color: "#1F2937",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Select Term
        </Typography>

        <div className="home-header-btn">
         <Button
  disabled={loadingTermCodes || !termCodesResult}
  dropdown={termCodesResult
    ?.sort((a, b) => a.termCode.localeCompare(b.termCode))
    .map((term) => (
      <DropdownButtonItem
        key={term.termCode}
        onClick={() => handleTermChange(term)}
      >
        {toTitleCase(term.term)}
      </DropdownButtonItem>
    ))}
>
  <svg
    className="ds-icon ds-calendar-check"
    style={{
      width: "18px",
      height: "18px",
      flexShrink: 0,
      fill: "currentColor",
    }}
    aria-hidden="true"
  >
    <use xlinkHref="#ds-icon-calendar-check" />
  </svg>

  <span
    style={{
      fontSize: "15px",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "normal",
      color: "inherit",
    }}
  >
    {termLabel}
  </span>

  {/* REMOVED the manual chevron SVG — Ellucian adds it automatically */}
</Button>
        </div>
      </div>
    </div>
  );
};

HomeHeader.propTypes = {
  currentTerm: PropTypes.string,
  termCodesResult: PropTypes.array,
  loadingTermCodes: PropTypes.bool.isRequired,
  handleTermChange: PropTypes.func.isRequired,
};

export default HomeHeader;