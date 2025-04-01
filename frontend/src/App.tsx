import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [prediction, setPrediction] = useState<null | number>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrediction(null); // reset

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Sentiment Checker</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={4}
          cols={40}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message here..."
        />
        <br />
        <button type="submit">Analyze Sentiment</button>
      </form>

      {prediction !== null && (
        <p style={{ marginTop: "1rem" }}>
          Sentiment: <strong>{prediction === 1 ? "Positive" : "Negative"}</strong>
        </p>
      )}
    </div>
  );
}

export default App;