# This is where the model actually gets trained.
# I’m loading the already vectorized text + labels, training a logistic regression model,
# checking how well it performs, and saving it to a .pkl file for later use (like in the app).
# Only need to run this if I change the dataset or want to retrain with different settings.

import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# ───────────────────────────────────────
# Load the vectorized data
# ───────────────────────────────────────
with open("data/X_train.pkl", "rb") as f:
    X_train = pickle.load(f)

with open("data/X_test.pkl", "rb") as f:
    X_test = pickle.load(f)

with open("data/y_train.pkl", "rb") as f:
    y_train = pickle.load(f)

with open("data/y_test.pkl", "rb") as f:
    y_test = pickle.load(f)

#───────────────────────────────────────
# Train the model
# ───────────────────────────────────────
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# ───────────────────────────────────────
# Evaluate the model
# ───────────────────────────────────────
y_pred = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# ───────────────────────────────────────
# Save the trained model
# ───────────────────────────────────────
with open("data/sentiment_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("\n✅ Model trained and saved to 'data/sentiment_model.pkl'")