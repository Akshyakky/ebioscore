import React, { useState } from "react";
import { FloatingLabel, Col, Form } from "react-bootstrap";
import "./AutocompleteTextBox.css";

interface AutocompleteTextBoxProps {
  ControlID: string;
  title?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fetchSuggestions?: (input: string) => Promise<string[]>;
  onSelectSuggestion?: (suggestion: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "lg";
  isMandatory?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  ariaLabel?: string;
  maxLength?: number;
  isSubmitted?: boolean;
  errorMessage?: string;
  inputValue?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const AutocompleteTextBox: React.FC<AutocompleteTextBoxProps> = ({
  ControlID,
  title,
  value = "",
  onChange,
  onSelectSuggestion,
  fetchSuggestions,
  placeholder,
  type = "text",
  className,
  style,
  size,
  isMandatory = false,
  disabled = false,
  readOnly = false,
  ariaLabel = "",
  maxLength,
  isSubmitted = false,
  errorMessage,
  inputValue,
  onBlur,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault(); // Prevents scrolling the page
      setSelectedIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % suggestions.length;
        scrollSuggestionIntoView(nextIndex);
        return nextIndex;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); // Prevents scrolling the page
      setSelectedIndex((prevIndex) => {
        const nextIndex =
          (prevIndex - 1 + suggestions.length) % suggestions.length;
        scrollSuggestionIntoView(nextIndex);
        return nextIndex;
      });
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault(); // Prevent form submission
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  const scrollSuggestionIntoView = (index: number) => {
    const suggestionElement = document.querySelector(
      `.autocomplete-suggestion-${index}`
    );
    suggestionElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const controlId = `txt${ControlID}`;
  // This function returns an array with the non-matched and matched parts of the suggestion
  const highlightMatch = (suggestion: string, inputValue: string) => {
    const matchIndex = suggestion
      .toLowerCase()
      .indexOf(inputValue.toLowerCase());
    if (matchIndex === -1) {
      return [suggestion];
    }
    const beforeMatch = suggestion.slice(0, matchIndex);
    const matchText = suggestion.slice(
      matchIndex,
      matchIndex + inputValue.length
    );
    const afterMatch = suggestion.slice(matchIndex + inputValue.length);
    return [
      beforeMatch,
      <span key="match" className="highlight">
        {matchText}
      </span>,
      afterMatch,
    ];
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIndex(-1);
    if (onChange) {
      onChange(e);
    }

    const inputValue = e.target.value;
    if (inputValue && fetchSuggestions) {
      const fetchedSuggestions = await fetchSuggestions(inputValue);
      setSuggestions(fetchedSuggestions);
      setSuggestionsVisible(true);
    } else {
      setSuggestionsVisible(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    setSuggestionsVisible(false);
    setSelectedIndex(-1); // Reset selected index when a suggestion is clicked
  };

  // Determine if the textbox is invalid
  const isInvalid = (isMandatory && isSubmitted && !value) || !!errorMessage;

  // Determine the error message to display
  const errorToShow =
    errorMessage || (isMandatory && !value ? `${title} is required.` : "");

  return (
    <Form.Group as={Col} controlId={controlId} className="mb-3">
      <FloatingLabel
        controlId={controlId}
        label={title || ""}
        className={className}
        style={style}
      >
        <Form.Control
          type={type}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder || title}
          size={size}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel || title}
          isInvalid={isInvalid}
          maxLength={maxLength}
          autoComplete="off"
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        />
        {isInvalid && (
          <Form.Control.Feedback type="invalid">
            {errorToShow}
          </Form.Control.Feedback>
        )}
        {isSuggestionsVisible && suggestions.length > 0 && (
          <ul className="autocomplete-suggestions">
            {suggestions.map((suggestion, index) => {
              const isSelected = index === selectedIndex;
              const parts = highlightMatch(suggestion, inputValue || "");
              return (
                <li
                  key={index}
                  className={`autocomplete-suggestion-${index} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {parts.map((part, index) => (
                    <React.Fragment key={index}>{part}</React.Fragment>
                  ))}
                </li>
              );
            })}
          </ul>
        )}
      </FloatingLabel>
    </Form.Group>
  );
};

export default AutocompleteTextBox;
