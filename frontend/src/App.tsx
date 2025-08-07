import { useState } from "react";
import "./index.css";

function App() {
  const [input, setInput] = useState("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [correctSentiment, setCorrectSentiment] = useState("");
  const [userSaidIncorrect, setUserSaidIncorrect] = useState(false);

  // Mapping UI label strings to model-ready numeric labels
  const labelMap: Record<string, number> = {
    negative: 0,
    positive: 1,
    neutral: 2,
    sarcastic: 3,
  };

  // Send feedback to the backend
  const sendFeedback = async (correctLabel: number) => {
    const payload = {
      text: input,
      predicted_label: prediction,
      correct_label: correctLabel,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("FEEDBACK RESPONSE:", response); // debug log

      const data = await response.json();
      console.log("Feedback saved:", data.message);
      setFeedbackSubmitted(true);
      setPrediction(null);
      setInput(""); // Clear input after feedback
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrediction(null);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setCorrectSentiment("");
    setUserSaidIncorrect(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      console.log("PREDICT RESPONSE:", response); // debug log

      const data = await response.json();
      setPrediction(data.prediction);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="app">
      <h1>Portuguese Sentiment Analysis</h1>

      <form className="input-container" onSubmit={handleSubmit}>
        <textarea
          placeholder="Type a message in Portuguese..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Analyze Sentiment</button>
      </form>

      {prediction !== null && (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
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
        <div className="input-container" style={{ marginTop: "1rem" }}>
          <p>Was this prediction correct?</p>
          <div style={{ display: "flex", gap: "1rem" }}>
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
            <button
              type="button"
              onClick={() => {
                setUserSaidIncorrect(true);
              }}
            >
              No, show options
            </button>
          </div>
        </div>
      )}

      {showFeedback && !feedbackSubmitted && userSaidIncorrect && (
        <div className="input-container" style={{ marginTop: "1rem" }}>
          <label>
            If not, what is the correct sentiment?
            <select
              value={correctSentiment}
              onChange={(e) => setCorrectSentiment(e.target.value)}
              style={{
                marginLeft: "0.5rem",
                padding: "0.5rem",
                borderRadius: "8px",
              }}
            >
              <option value="">Select...</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
              <option value="sarcastic">Sarcastic/Ironic</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              const numericLabel = labelMap[correctSentiment];
              if (numericLabel !== undefined) {
                sendFeedback(numericLabel);
              }
            }}
            style={{ marginTop: "1rem" }}
            disabled={!correctSentiment}
          >
            Submit Feedback
          </button>
        </div>
      )}

      {feedbackSubmitted && (
        <p style={{ marginTop: "1rem", color: "green", textAlign: "center" }}>
          ✅ Feedback received. Thanks!
        </p>
      )}
    </div>
  );
}

export default App;
