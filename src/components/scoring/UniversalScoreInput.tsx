import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ScoreFormat } from "@/types/sport";
import {
  validateScoreInput,
  getScoringHint,
  formatScore,
  parseTimeToSeconds,
  isTimeBasedScoring,
  isDistanceBasedScoring,
  isNumericScoring,
} from "@/utils/sportHelpers";
import { Info } from "lucide-react";

interface UniversalScoreInputProps {
  format: ScoreFormat;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const UniversalScoreInput = ({
  format,
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  className = "",
}: UniversalScoreInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);

    // Validate input
    if (newValue.trim() === "") {
      setIsValid(true);
      setErrorMessage("");
      onChange(newValue);
      return;
    }

    const valid = validateScoreInput(newValue, format);
    setIsValid(valid);

    if (valid) {
      setErrorMessage("");
      onChange(newValue);
    } else {
      setErrorMessage(getValidationError(newValue, format));
    }
  };

  const getValidationError = (input: string, fmt: ScoreFormat): string => {
    switch (fmt.type) {
      case "time":
        return `Invalid time format. Expected ${fmt.format} (e.g., ${fmt.format === "mm:ss" ? "4:32" : "1:23:45"})`;
      case "distance":
        return `Invalid distance. Enter a number in ${fmt.unit}`;
      case "numeric":
        return `Invalid number. Enter a score in ${fmt.unit}`;
      case "rounds":
        return `Invalid round number. Must be between 1 and ${fmt.totalRounds}`;
      default:
        return "Invalid input";
    }
  };

  const getInputType = (): string => {
    if (isTimeBasedScoring(format)) {
      return "text"; // Use text for time format
    }
    if (isDistanceBasedScoring(format) || isNumericScoring(format)) {
      return "number";
    }
    return "text";
  };

  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;

    switch (format.type) {
      case "time":
        return format.format === "mm:ss" ? "4:32.50" : "1:23:45";
      case "distance":
        return `100${format.unit}`;
      case "numeric":
        return `15.75 ${format.unit}`;
      case "rounds":
        return `1-${format.totalRounds}`;
      default:
        return "Enter score";
    }
  };

  const hint = getScoringHint(format);

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}

      <div className="space-y-2">
        <Input
          type={getInputType()}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className={!isValid ? "border-destructive" : ""}
          step={format.type === "numeric" && format.decimals ? `0.${"0".repeat(format.decimals - 1)}1` : "any"}
        />

        {hint && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{hint}</span>
          </div>
        )}

        {!isValid && errorMessage && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

// Time-based score input with helper buttons
export const TimeScoreInput = ({
  format,
  value,
  onChange,
  label = "Time",
  ...props
}: Omit<UniversalScoreInputProps, "format"> & { format: Extract<ScoreFormat, { type: "time" }> }) => {
  return (
    <UniversalScoreInput
      format={format}
      value={value}
      onChange={onChange}
      label={label}
      {...props}
    />
  );
};

// Distance-based score input
export const DistanceScoreInput = ({
  format,
  value,
  onChange,
  label = "Distance",
  ...props
}: Omit<UniversalScoreInputProps, "format"> & { format: Extract<ScoreFormat, { type: "distance" }> }) => {
  return (
    <UniversalScoreInput
      format={format}
      value={value}
      onChange={onChange}
      label={label}
      {...props}
    />
  );
};

// Numeric score input
export const NumericScoreInput = ({
  format,
  value,
  onChange,
  label = "Score",
  ...props
}: Omit<UniversalScoreInputProps, "format"> & { format: Extract<ScoreFormat, { type: "numeric" }> }) => {
  return (
    <UniversalScoreInput
      format={format}
      value={value}
      onChange={onChange}
      label={label}
      {...props}
    />
  );
};

// Rounds-based score input
export const RoundsScoreInput = ({
  format,
  value,
  onChange,
  label = "Result",
  ...props
}: Omit<UniversalScoreInputProps, "format"> & { format: Extract<ScoreFormat, { type: "rounds" }> }) => {
  return (
    <div className={props.className}>
      <Label className="mb-2 block">{label}</Label>
      <div className="space-y-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter result (KO/TKO Round ${format.totalRounds} or Points Decision)`}
          disabled={props.disabled}
        />
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{getScoringHint(format)}</span>
        </div>
      </div>
    </div>
  );
};
