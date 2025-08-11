import { useState } from "react";
import "./index.css";

function App() {
  // ----------------------------------------
  // State Management
  // ----------------------------------------
  const [input, setInput] = useState("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [correctSentiment, setCorrectSentiment] = useState("");
  const [userSaidIncorrect, setUserSaidIncorrect] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); 
  const [apiWokenUp, setApiWokenUp] = useState(false); // flag for cold-start backend
  const [isLoading, setIsLoading] = useState(false);   // loading state for spinner/UI

  // ----------------------------------------
  // Label Mapping (string -> numeric)
  // ----------------------------------------
  const labelMap: Record<string, number> = {
    negative: 0,
    positive: 1,
    neutral: 2,
    sarcastic: 3,
  };

  // ----------------------------------------
  // Send Feedback to Backend
  // ----------------------------------------
  const sendFeedback = async (correctLabel: number) => {
    const payload = {
      text: input,
      predicted_label: prediction,
      correct_label: correctLabel,
    };

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // console.log("FEEDBACK RESPONSE:", response); // debug log

      // const data = await response.json();
      // console.log("Feedback saved:", data.message);
      setFeedbackSubmitted(true);
      setPrediction(null);
      setInput(""); // clear input after feedback
    } catch (error) {
      // console.error("Error sending feedback:", error);
      setStatusMessage("⚠️ Feedback could not be submitted. Try again later.");
    }
  };

  // ----------------------------------------
  // Handle Sentiment Submit
  // ----------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // input validation
    if (!input.trim()) {
      setStatusMessage("⚠️ Please enter some text.");
      return;
    }

    if (input.trim().length < 6) {
      setStatusMessage("⚠️ Text is too short for accurate analysis. Try writing a full sentence.");
      return;
    }

    // reset state before sending
    setPrediction(null);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setCorrectSentiment("");
    setUserSaidIncorrect(false);

    if (!apiWokenUp) {
      setStatusMessage("Waking up API (using the free version), please hang in there! 🐢");
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      // console.log("PREDICT RESPONSE:", response); // debug log

      const data = await response.json();
      setPrediction(data.prediction);
      setShowFeedback(true);
      setStatusMessage("");
      setApiWokenUp(true); // only set once
    } catch (error) {
      // console.error("Error:", error);
      setStatusMessage("Something went wrong. Try again?");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // Component Rendering
  // ----------------------------------------
  return (
    <main className="app" role="main">
      <h1>Portuguese Sentiment Analysis</h1>

      {/* Status message display (warnings/errors/info) */}
      {statusMessage && (
        <p className="status-message">
          {statusMessage}
        </p>
      )}

      {/* Input form */}
      <form className="input-container" onSubmit={handleSubmit}>
        <textarea
          placeholder="Type a message in Portuguese..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Analyze Sentiment"}
        </button>
      </form>

      {/* Loading spinner + message */}
      {isLoading && (
        <div className="prediction-output">
          <div className="spinner" />
          {/* <p className="loading-text">Analyzing sentiment...</p> */}
        </div>
      )}

      {/* Prediction result display */}
      {prediction !== null && (
        <div className="prediction-output">
          <p>
            <strong>Prediction:</strong>{" "}
            {prediction === 1
              ? "Positive"
              : prediction === 0
              ? "Negative"
              : prediction === 2
              ? "Neutral"
              : "Sarcastic/Ironic"}
          </p>
        </div>
      )}

      {/* Ask for feedback */}
      {showFeedback && !feedbackSubmitted && (
        <div className="input-container feedback-block">
          <p className="bold-text">Was this prediction correct?</p>
          <div className="feedback-buttons">
            <button
              type="button"
              onClick={() => {
                if (prediction !== null) {
                  sendFeedback(prediction); // send confirmed feedback
                }
              }}
            >
              Yes
            </button>

            <select 
              className="feedback-select"
              defaultValue=""
              onChange={(e) => {
                const selected = e.target.value;
                const validLabels = ["positive", "negative", "neutral", "sarcastic"];
                
                if (!validLabels.includes(selected)) {
                  setStatusMessage("⚠️ Invalid selection. Please choose a valid sentiment.");
                  return;
                }

                const numericLabel = labelMap[selected];
                if (numericLabel === undefined) {
                  setStatusMessage("⚠️ Something went wrong. Please try again.");
                  return;
                }

              sendFeedback(numericLabel); // immediately send feedback
            }}
          >
            <option value="" disabled>
              No. Select correct sentiment
            </option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
            <option value="sarcastic">Sarcastic/Ironic</option>
          </select>
        </div>
      </div>
    )}

          


      {/* Feedback confirmation */}
      {feedbackSubmitted && (
        <p className="feedback-success">
          ✅ Feedback received. Thanks!
        </p>
      )}
    </main>
  );
}

export default App;
