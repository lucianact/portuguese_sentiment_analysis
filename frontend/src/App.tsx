import { useEffect, useRef, useState } from "react";
import "./index.css";

/* ==================================================
   Utility: quick gibberish detector for PT-like text
   - Vowel ratio heuristic (incl. PT diacritics)
   - Flags input with very low vowel density
================================================== */
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
  /* ----------------------------------------
     State (UI + request control)
  ---------------------------------------- */
  const [input, setInput] = useState("");                          // user text
  const [prediction, setPrediction] = useState<number | null>(null); // model output (0..3)
  const [showFeedback, setShowFeedback] = useState(false);         // show feedback UI?
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false); // feedback sent?
  const [statusMessage, setStatusMessage] = useState("");          // banner/status text
  const [statusType, setStatusType] = useState<"default" | "feedback">("default");
  const [isSubmitting, setIsSubmitting] = useState(false);         // disable submit while sending
  const [isSendingFeedback, setIsSendingFeedback] = useState(false); // disable feedback controls
  const [hideMsgTimer, setHideMsgTimer] = useState<number | null>(null);

  // With cron keeping the API warm, these are unused (kept commented for easy revert)
  // const [apiWokenUp, setApiWokenUp] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  /* ----------------------------------------
     Abort controllers to cancel in-flight calls
     - Prevents race conditions and timeouts lingering
  ---------------------------------------- */
  const predictAbortRef = useRef<AbortController | null>(null);
  const feedbackAbortRef = useRef<AbortController | null>(null);

  /* ----------------------------------------
     Label mapping to keep UI strings ↔ numeric
  ---------------------------------------- */
  const labelMap: Record<string, number> = {
    negative: 0,
    positive: 1,
    neutral: 2,
    sarcastic: 3,
  };

  /* ----------------------------------------
     Cleanup: clear timers and abort pending calls
  ---------------------------------------- */
  useEffect(() => {
    return () => {
      if (hideMsgTimer) window.clearTimeout(hideMsgTimer);
      if (predictAbortRef.current) predictAbortRef.current.abort();
      if (feedbackAbortRef.current) feedbackAbortRef.current.abort();
    };
  }, [hideMsgTimer]);

  /* ----------------------------------------
     Helper: safe fetch that times out and parses
     JSON or falls back to text without throwing.
     - Returns { ok, data, error } shape.
  ---------------------------------------- */
  async function safeRequest(
    url: string,
    options: RequestInit,
    timeoutMs = 10000,
    trackRef?: React.MutableRefObject<AbortController | null>
  ): Promise<{ ok: boolean; data: any; error?: string }> {
    // Abort any previous request tracked by this ref
    if (trackRef) {
      if (trackRef.current) trackRef.current.abort();
      trackRef.current = new AbortController();
      options.signal = trackRef.current.signal;
    }

    // Add a manual timeout on top of AbortController
    const controller = trackRef?.current ?? new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    options.signal = controller.signal;

    // Always declare JSON intent explicitly
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.method && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Accept", "application/json");
    options.headers = headers;

    try {
      const res = await fetch(url, options);
      const ct = res.headers.get("content-type") || "";
      let parsed: any = null;

      try {
        if (ct.includes("application/json")) {
          parsed = await res.json();
        } else {
          // Fallback to text for non-JSON responses
          const txt = await res.text();
          parsed = txt ? { message: txt } : null;
        }
      } catch {
        // Swallow parse errors; return null data with ok flag below
        parsed = null;
      }

      return res.ok
        ? { ok: true, data: parsed }
        : { ok: false, data: parsed, error: (parsed && (parsed.error || parsed.message)) || "Request failed" };
    } catch (err) {
      // Hide raw error details from users; keep message generic
      return { ok: false, data: null, error: "Network error or timeout" };
    } finally {
      window.clearTimeout(timeoutId);
      // If this request was tracked, clear the ref so a new one can be created next time
      if (trackRef && trackRef.current === controller) {
        trackRef.current = null;
      }
    }
  }

  /* ----------------------------------------
     Feedback sender
     - Posts the correction
     - Resets UI
     - Shows success banner (auto-hides in 3s)
  ---------------------------------------- */
  const sendFeedback = async (correctLabel: number) => {
    if (isSendingFeedback) return;
    setIsSendingFeedback(true);

    const payload = {
      text: input,
      predicted_label: prediction,
      correct_label: correctLabel,
    };

    const { ok, error } = await safeRequest(
      `${import.meta.env.VITE_API_BASE_URL}/feedback`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      8000,
      feedbackAbortRef
    );

    if (ok) {
      // Reset primary UI and show success banner
      setFeedbackSubmitted(true);
      setPrediction(null);
      setInput("");
      setShowFeedback(false);
      setStatusMessage("✅ Feedback received. Thanks!");
      setStatusType("feedback");

      // Auto-hide after 3s
      const id = window.setTimeout(() => {
        setStatusMessage("");
        setStatusType("default");
      }, 3000);
      setHideMsgTimer(id);
    } else {
      setStatusMessage(error || "⚠️ Feedback could not be submitted. Try again later.");
      setStatusType("default");
    }

    setIsSendingFeedback(false);
  };

  /* ----------------------------------------
     Submit handler
     - Validates input
     - Calls /predict with timeout and safe parse
     - Manages banners and disabled state
  ---------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = input.trim();

    // Basic validation (length and gibberish)
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

    // Reset result and feedback UI for a fresh prediction
    setPrediction(null);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setStatusMessage("");
    setStatusType("default");

    setIsSubmitting(true);
    // setIsLoading(true); // Spinner disabled but kept commented for easy revert

    const { ok, data, error } = await safeRequest(
      `${import.meta.env.VITE_API_BASE_URL}/predict`,
      {
        method: "POST",
        body: JSON.stringify({ text: trimmed }),
      },
      10000,
      predictAbortRef
    );

    if (!ok) {
      setStatusMessage(error || (data && (data.error || data.message)) || "⚠️ Something went wrong. Try again?");
      setStatusType("default");
      setIsSubmitting(false);
      // setIsLoading(false);
      return;
    }

    const predValue = typeof data?.prediction === "number" ? data.prediction : null;
    setPrediction(predValue);
    setShowFeedback(true);
    setStatusMessage("");
    setStatusType("default");

    setIsSubmitting(false);
    // setIsLoading(false);
  };

  /* ----------------------------------------
     Render
  ---------------------------------------- */
  return (
    <main className="app" role="main">
      {/* Title */}
      <h1>Portuguese Sentiment Analysis</h1>

      {/* Status / validation / success banner (announced to SRs) */}
      {statusMessage && (
        <p
          className={`status-message ${statusType === "feedback" ? "feedback-status" : ""}`}
          aria-live="polite"
        >
          {statusMessage}
        </p>
      )}

      {/* Input form (textarea + submit) */}
      <form
        className="input-container"
        onSubmit={handleSubmit}
        aria-label="Sentiment analysis form"
        autoComplete="off"
      >
        {/* Accessibility:
           - id + name help autofill/accessibility
           - aria-label explicitly names this control
        */}
        <textarea
          id="portuguese-input"
          name="portugueseInput"
          placeholder="Type a message in Portuguese..."
          value={input}
          onChange={(e) => {
            // Clear any stale status while user types
            if (statusMessage) setStatusMessage("");
            setInput(e.target.value);
          }}
          aria-label="Portuguese text input"
          maxLength={1000} // guard against extremely long payloads
        />

        {/* Submit button is disabled during request to prevent double submits */}
        <button type="submit" disabled={isSubmitting}>
          Analyze Sentiment
        </button>
      </form>

      {/* Spinner removed — API kept warm by cron */}
      {/* {isLoading && (
        <div className="prediction-output">
          <div className="spinner" />
        </div>
      )} */}

      {/* Prediction result block */}
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

      {/* Feedback block: confirm/correct the model's guess */}
      {showFeedback && !feedbackSubmitted && (
        <div className="input-container feedback-block">
          <p className="bold-text">Was this prediction correct?</p>

          <div className="feedback-buttons">
            {/* Quick confirm = send predicted label back */}
            <button
              type="button"
              disabled={isSendingFeedback || prediction === null}
              onClick={() => {
                if (prediction !== null) {
                  sendFeedback(prediction);
                }
              }}
            >
              Yes
            </button>

            {/* Select alternative label (sends immediately on change) */}
            <select
              id="feedback-select"
              name="feedbackSelect"
              className="feedback-select"
              defaultValue=""
              disabled={isSendingFeedback}
              onChange={(e) => {
                const selected = e.target.value as keyof typeof labelMap | "";
                if (!selected) return;

                const numericLabel = labelMap[selected];
                if (numericLabel === undefined) {
                  setStatusMessage("Invalid selection. Please choose a valid sentiment.");
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
