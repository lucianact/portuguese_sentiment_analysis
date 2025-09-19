import SubNav from "../components/SubNav";

export default function AboutProject() {
  return (
    <div className="article-page">
      <article className="article">
        <h1>About this project</h1>
        <SubNav current="about-project" />

        {/* Overview */}
        <section>
          <h2>Overview of my first NLP project</h2>
          <p>
            This project exists because I wanted to explore Python’s machine learning libraries and finally
            get a hands-on feel for how Natural Language Processing (NLP) works. In a simple way, NLP is the
            branch of machine learning that teaches computers to work with human languages like English or
            Portuguese (my first language).
          </p>
          <p>
            Coming from a background in language studies and linguistics, I’ve always been fascinated by the
            idea that we can teach machines not only grammar rules but also context and sentiment. Portuguese
            is rich in regional variation, slang, and figures of speech, which makes it hard even for native
            speakers to catch every nuance, so it felt like a perfect language to experiment with.
          </p>
        </section>

        {/* What I built */}
        <section>
          <h2>What I built</h2>
          <p>
            A full-stack Portuguese sentiment analysis web app that lets users paste or type text and instantly
            see a predicted sentiment.
          </p>
          <ul>
            <li>
              <strong>Frontend:</strong> React with TypeScript for a fast, component-based UI and strong typing.
              I added a quick gibberish/language heuristic so most filtering happens in the browser, keeping
              the experience responsive and reducing unnecessary server calls.
            </li>
            <li>
              <strong>Backend:</strong> Flask because it’s lightweight, Python-native, and plays nicely with the
              ML libraries I’m using. All NLP logic (preprocessing, vectorization, inference) lives on the server,
              so I can update it without shipping new frontend builds.
            </li>
            <li>
              <strong>Data / Hosting:</strong> I started on Render for the convenience of deploying Flask with
              Postgres, then moved the database to Supabase (PostgreSQL) when Render’s free tier expired. Along
              the way I learned to handle real-world deployment issues like cold starts, worker limits, and
              keeping services “awake.”
            </li>
          </ul>
        </section>

        {/* How it works */}
        <section>
          <h2>How the app works</h2>
          <ol>
            <li>The browser validates the input (Portuguese-like and not gibberish).</li>
            <li>The text is sent to my Flask API, which cleans and vectorizes it using TF-IDF.</li>
            <li>A Logistic Regression model predicts the sentiment and returns the result to the UI.</li>
          </ol>
        </section>

        {/* Feedback loop */}
        <section>
          <h2>User feedback loop</h2>
          <p>
            Every prediction includes a small “was this prediction correct?” widget. Users can confirm or correct
            the sentiment with a single click. Those confirmations/corrections are stored in a database separate
            from the model’s training data. Over time, this richer, human-labeled dataset will let me retrain and
            fine-tune models for neutrality, irony, and other nuanced tones that the original dataset lacked.
          </p>
        </section>

        {/* Approach */}
        <section>
          <h2>My NLP approach</h2>
          <p>
            I started with an accessible pipeline: collect Portuguese text data; clean and normalize it (including
            handling diacritics and slang); transform it with TF-IDF; and train a Logistic Regression classifier.
            It’s lightweight, explainable, and quick to deploy. On an initial test set of a few thousand tweets,
            it reached roughly <strong>82%</strong> accuracy on clear positive/negative examples.
          </p>
          <p>
            The trade-off: bag-of-words models struggle with subtle cues, shifting tone, and context. My first
            dataset had binary labels (positive/negative), so the model can’t yet interpret neutrality or irony.
            TF-IDF also assigns static weights regardless of context—e.g., “horrível” is strongly negative and
            “amei” positive, even when those words appear in different contexts.
          </p>
        </section>

        {/* Examples */}
        <section>
          <h2>Sample predictions</h2>
          <ul>
            <li>
              <strong>Input:</strong> <code>amei o filme</code> → <strong>Predicted:</strong> Positive
            </li>
            <li>
              <strong>Input:</strong> <code>amei… só que não</code> (sarcasm) →{" "}
              <strong>Predicted:</strong> Positive <em>(wrong)</em>
            </li>
          </ul>
        </section>

        {/* Next steps */}
        <section>
          <h2>Next steps</h2>
          <ul>
            <li>
              Use the feedback-driven dataset to experiment with contextual embeddings like BERTimbau and
              sentence-level embeddings to capture meaning across phrases.
            </li>
            <li>
              Refine the frontend feedback loop so users can flag tricky cases and I can retrain iteratively.
            </li>
            <li>
              Move toward recognizing not just polarity but also neutrality, sarcasm, and other complex sentiments.
            </li>
          </ul>
        </section>

        {/* Why it matters */}
        <section>
          <h2>Why it matters</h2>
          <p>
            This project turned my curiosity about language and AI into a working product. It taught me how to
            connect my linguistics background with practical machine learning, how to think about data quality and
            model choice, and how to navigate the realities of deploying an ML-powered web app. It’s a small but
            meaningful first step toward building tools that actually help Portuguese learners or speakers online.
          </p>
        </section>
      </article>
    </div>
  );
}
