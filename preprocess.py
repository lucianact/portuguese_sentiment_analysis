# ───────────────────────────────────────
# Imports
# ───────────────────────────────────────
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# ───────────────────────────────────────
# Download NLTK Resources
# ───────────────────────────────────────
nltk.download('punkt')  # Downloads tokenizer model to split text into words
nltk.download('stopwords')  # Downloads lists of stopwords for supported languages

# ───────────────────────────────────────
# Text Cleaning Function
# ───────────────────────────────────────

# Load Portuguese stopwords into a Python set (faster for lookup)
stop_words = set(stopwords.words('portuguese'))

def clean_text(text):
    # Lowercase all characters (standard NLP practice)
    text = text.lower()

    # Remove URLs (e.g., http://... or www....)
    text = re.sub(r"http\S+|www\S+|https\S+", '', text)

    # Remove @mentions and hashtags (#hashtag or @user)
    text = re.sub(r'\@\w+|\#', '', text)

    # Remove everything except letters (including accented letters),
    # whitespace, and common emoticon characters like :) and :(
    text = re.sub(r'[^a-zA-ZÀ-ÿ\s:\)\(]', '', text)

    # Tokenize the cleaned text into words (using Portuguese rules)
    tokens = text.split()

    # Remove stopwords (e.g., de, é, em, para...)
    filtered_tokens = [word for word in tokens if word not in stop_words]

    # Re-join words into a cleaned string
    return ' '.join(filtered_tokens)

# ───────────────────────────────────────
# Main Program Logic
# ───────────────────────────────────────

def main():

    # Load CSV dataset into a DataFrame
    df = pd.read_csv("data/sentiment_dataset.csv")

    # Display a preview of the data
    print("First 5 rows:")
    print(df.head())

    # Show column names
    print("\nColumn names:")
    print(df.columns)

    # Print out how many positive and negative examples we have
    print("\nSentiment distribution:")
    print(df['revised_sentiment'].value_counts())

    # Apply your text cleaning function to each tweet
    print("\nCleaning tweets...")
    df['cleaned_text'] = df['tweet_text'].apply(clean_text)

    # Show before/after for the first few tweets
    print("\nSample cleaned tweets:")
    print(df[['tweet_text', 'cleaned_text']].head())

    # Save cleaned data for use in model training
    df.to_csv("data/cleaned_dataset.csv", index=False)
    print("\nCleaned dataset saved to data/cleaned_dataset.csv")

# ───────────────────────────────────────
# Only run main() if this file is executed directly
# ───────────────────────────────────────
if __name__ == "__main__":
    main()