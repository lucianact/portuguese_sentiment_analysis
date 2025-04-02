import { useState } from "react";
import "./App.css"; // make sure you're importing your CSS!

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
    <div className="app">
      <h1>Sentiment Checker</h1>

      <form className="input-container" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message here..."
        />
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
