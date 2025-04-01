import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle

# ───────────────────────────────────────
# 1. Load Cleaned Dataset
# ───────────────────────────────────────
df = pd.read_csv("data/cleaned_dataset.csv")

# Features (X) = the cleaned tweet text
X = df["cleaned_text"]

# Labels (y) = 0 or 1 sentiment
y = df["revised_sentiment"]

# ───────────────────────────────────────
# 2. Split Data into Train/Test
# ───────────────────────────────────────
# 80% for training, 20% for testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ───────────────────────────────────────
# 3. Vectorize Text with TF-IDF
# ───────────────────────────────────────
# Converts text into numerical features
vectorizer = TfidfVectorizer(max_features=5000)

# Fit on training data only (important!)
X_train_vectors = vectorizer.fit_transform(X_train)

# Transform test data with same vectorizer
X_test_vectors = vectorizer.transform(X_test)

# ───────────────────────────────────────
# 4. Save the Vectorized Data and Vectorizer
# ───────────────────────────────────────
# We'll use these files in the model training step

with open("data/X_train.pkl", "wb") as f:
    pickle.dump(X_train_vectors, f)

with open("data/X_test.pkl", "wb") as f:
    pickle.dump(X_test_vectors, f)

with open("data/y_train.pkl", "wb") as f:
    pickle.dump(y_train, f)

with open("data/y_test.pkl", "wb") as f:
    pickle.dump(y_test, f)

with open("data/tfidf_vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("✅ Data split, vectorized, and saved to disk.")