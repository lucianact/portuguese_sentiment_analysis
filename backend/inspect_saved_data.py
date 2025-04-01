import pickle

def inspect_pickle(path, name):
    with open(path, "rb") as f:
        obj = pickle.load(f)
        print(f"\n{name}:")
        print("-" * 40)
        print(f"Type: {type(obj)}")
        if hasattr(obj, "shape"):
            print(f"Shape: {obj.shape}")
        elif hasattr(obj, "__len__"):
            print(f"Length: {len(obj)}")
        else:
            print("No shape or length info available.")
    return obj


# Load all files
X_train = inspect_pickle("data/X_train.pkl", "X_train (vectorized)")
X_test = inspect_pickle("data/X_test.pkl", "X_test (vectorized)")
y_train = inspect_pickle("data/y_train.pkl", "y_train (labels)")
y_test = inspect_pickle("data/y_test.pkl", "y_test (labels)")
vectorizer = inspect_pickle("data/tfidf_vectorizer.pkl", "TF-IDF Vectorizer")

# Show tokens learned by the vectorizer
print("\nFirst 20 tokens in vocabulary:")
print(vectorizer.get_feature_names_out()[:20])

# Show one example
print("\nOriginal tweet text sample (cleaned):")
print(X_train[0])  # sparse matrix

print("\nCorresponding label:")
print(y_train.iloc[0])  # 0 or 1

# Show sparse vector for the same tweet
print("\nSparse vector (non-zero tf-idf values):")
print(X_train[0])

# Optional: count how many non-zero elements in this vector
print("\nNumber of non-zero elements in vector:", X_train[0].count_nonzero())

# Decode vector to actual words
print("\nDecoded words in tweet 0:")
vocab = vectorizer.get_feature_names_out()
vector_row = X_train[0]
indices = vector_row.indices
for i in indices:
    print(f"- {vocab[i]}")