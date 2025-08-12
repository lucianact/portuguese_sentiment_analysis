import { useState } from "react";
import "./index.css";

function isGibberish(text: string) {
  const vowels = "aeiouáéíóúàâêôãõ";
  const letters = text
    .toLowerCase()
    .split("")
    .filter((c) => /[a-záéíóúàâêôãõ]/i.test(c));

  if (letters.length === 0) return true;

  const vowelCount = letters.filter((c) => vowels.includes(c)).length;
  const vowelRatio = vowelCount / letters.length;

  return vowelRatio < 0.25;
}

function App() {
  const [input, setInput] = useState("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"default" | "feedback">("default");
  const [apiWokenUp, setApiWokenUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const labelMap: Record<string, number> = {
    negative: 0,
    positive: 1,
    neutral: 2,
    sarcastic: 3,
  };

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
      setInput("");
      setShowFeedback(false);
      setStatusMessage("✅ Feedback received. Thanks!");
      setStatusType("feedback");

      // Hide message after 3 seconds
      setTimeout(() => {
      setStatusMessage("");
      setStatusType("default");
    }, 3000);
    } catch {
      setStatusMessage("⚠️ Feedback could not be submitted. Try again later.");
      setStatusType("default");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) {
      setStatusMessage("⚠️ Please enter some text.");
      setStatusType("default");
      return;
    }

    if (trimmed.length < 6) {
      setStatusMessage("⚠️ Text is too short for accurate analysis. Try writing a full sentence.");
      setStatusType("default");
      return;
    }

    if (isGibberish(trimmed)) {
      setStatusMessage("⚠️ Text looks like gibberish. Please write in proper Portuguese.");
      setStatusType("default");
      return;
    }

    setPrediction(null);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setStatusMessage((prev) =>
      !apiWokenUp
        ? "Waking up API (using the free version), please hang in there! 🐢"
        : prev
    );
    setStatusType("default");

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data?.error ?? "⚠️ Something went wrong. Try again?");
        setStatusType("default");
        return;
      }

      setPrediction(typeof data.prediction === "number" ? data.prediction : null);
      setShowFeedback(true);
      setStatusMessage("");
      setStatusType("default");
      setApiWokenUp(true);
    } catch {
      setStatusMessage("⚠️ Something went wrong. Try again?");
      setStatusType("default");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app" role="main">
      <h1>Portuguese Sentiment Analysis</h1>

      {statusMessage && (
        <p
          className={`status-message ${
            statusType === "feedback" ? "feedback-status" : ""
          }`}
        >
          {statusMessage}
        </p>
      )}

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

      {isLoading && (
        <div className="prediction-output">
          <div className="spinner" />
        </div>
      )}

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

      {showFeedback && !feedbackSubmitted && (
        <div className="input-container feedback-block">
          <p className="bold-text">Was this prediction correct?</p>
          <div className="feedback-buttons">
            <button
              type="button"
              onClick={() => {
                if (prediction !== null) {
                  sendFeedback(prediction);
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
                  setStatusType("default");
                  return;
                }

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
    </main>
  );
}

export default App;
