import React, { useState } from "react";
import PropTypes from "prop-types";
import Markdown from "react-markdown";

import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@ellucian/react-design-system/core";

const TargetGpaModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  result,
  error,
}) => {
  const [targetGpa, setTargetGpa] = useState("");

  const handleClose = () => {
    setTargetGpa("");
    onClose();
  };

  const isValidGpa = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 4;
  };

const handleSubmit = () => {
  if (!isValidGpa(targetGpa)) return;
  onSubmit(parseFloat(targetGpa));
};

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h3">GPA Recommendation</Typography>
      </DialogTitle>

      <DialogContent>
        {/* GPA Input */}
        <div style={{ marginBottom: "16px" }}>
          <Typography variant="body1" style={{ marginBottom: "8px" }}>
            Enter a target GPA you want to achieve to get AI recommendation
          </Typography>
          <TextField
            label="Target GPA"
            value={targetGpa}
            onChange={(e) => setTargetGpa(e?.target?.value ?? "")}
            placeholder="e.g. 3.5"
            error={targetGpa && !isValidGpa(targetGpa)}
            helperText={
              targetGpa && !isValidGpa(targetGpa)
                ? "GPA must be between 0 and 4"
                : ""
            }
            fullWidth
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 0",
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2" style={{ color: "#4b5563" }}>
              Fetching recommendations...
            </Typography>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <Typography
            variant="body2"
            style={{
              color: "#dc2626",
              fontWeight: 600,
              marginTop: "12px",
            }}
          >
            Error: {error}
          </Typography>
        )}

        {/* Result */}
        {result && !loading && (
          <div
            style={{
              marginTop: "12px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <Typography variant="h4" style={{ marginBottom: "8px" }}>
              Recommendation
            </Typography>
            <Typography
              component="div"
              variant="body2"
              style={{ lineHeight: 1.6 }}
            >
              <Markdown>{result}</Markdown>
            </Typography>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="text" onClick={handleClose}>
          Close
        </Button>
        {!result && (
          <Button onClick={handleSubmit} disabled={loading || !isValidGpa(targetGpa) }>
            {loading ? "Loading..." : "Get Recommendations"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

TargetGpaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  result: PropTypes.string,
  error: PropTypes.string,
};

TargetGpaModal.defaultProps = {
  loading: false,
  result: null,
  error: null,
};

export default TargetGpaModal;
