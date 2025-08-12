import { useState } from "react";
import "./index.css";

function isGibberish(text: string) {
  // Simple Portuguese-friendly vowel ratio heuristic
  const vowels = "aeiouáéíóúàâêôãõ";
  const letters = text
    .toLowerCase()
    .split("")
    .filter((c) => /[a-záéíóúàâêôãõ]/i.test(c));

  if (letters.length === 0) return true;

  const vowelCount = letters.filter((c) => vowels.includes(c)).length;
  const vowelRatio = vowelCount / letters.length;

  // Tune this threshold if you want stricter/looser filtering
  return vowelRatio < 0.25;
}

function App() {
  // ----------------------------------------
  // State Management
  // ----------------------------------------
  const [input, setInput] = useState("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setFeedbackSubmitted(true);
      setPrediction(null);
      setInput(""); // clear input after feedback
      setShowFeedback(false);
      setStatusMessage("✅ Feedback received. Thanks!");
    } catch {
      setStatusMessage("⚠️ Feedback could not be submitted. Try again later.");
    }
  };

  // ----------------------------------------
  // Handle Sentiment Submit
  // ----------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const trimmed = input.trim();
    if (!trimmed) {
      setStatusMessage("⚠️ Please enter some text.");
      return;
    }

    if (trimmed.length < 6) {
      setStatusMessage("⚠️ Text is too short for accurate analysis. Try writing a full sentence.");
      return;
    }

    // Gibberish check
    if (isGibberish(trimmed)) {
      setStatusMessage("⚠️ Text looks like gibberish. Please write in proper Portuguese.");
      return;
    }

    // Reset state before sending
    setPrediction(null);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setStatusMessage((prev) =>
      !apiWokenUp ? "Waking up API (using the free version), please hang in there! 🐢" : prev
    );

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend might return errors like { error: "..." }
        setStatusMessage(data?.error ?? "⚠️ Something went wrong. Try again?");
        return;
      }

      // Expecting data.prediction to be 0|1|2|3 from your backend
      setPrediction(typeof data.prediction === "number" ? data.prediction : null);
      setShowFeedback(true);
      setStatusMessage("");
      setApiWokenUp(true); // only set once
    } catch {
      setStatusMessage("⚠️ Something went wrong. Try again?");
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
      {statusMessage && <p className="status-message">{statusMessage}</p>}

      {/* Input form */}
      <form className="input-container" onSubmit={handleSubmit}>
        <textarea
          placeholder="Type a message in Portuguese..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Portuguese text input"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Analyze Sentiment"}
        </button>
      </form>

      {/* Loading spinner + message */}
      {isLoading && (
        <div className="prediction-output">
          <div className="spinner" />
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
                  sendFeedback(prediction); // user confirmed model's prediction
                }
              }}
            >
              Yes
            </button>

            <select
              className="feedback-select"
              defaultValue=""
              onChange={(e) => {
                const selected = e.target.value as keyof typeof labelMap | "";
                if (!selected) return;

                const numericLabel = labelMap[selected];
                if (numericLabel === undefined) {
                  setStatusMessage("⚠️ Invalid selection. Please choose a valid sentiment.");
                  return;
                }

                // Immediately send feedback with user's chosen correction
                sendFeedback(numericLabel);
              }}
              aria-label="Select correct sentiment"
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
        <p className="feedback-success">✅ Feedback received. Thanks!</p>
      )}
    </main>
  );
}

export default App;
