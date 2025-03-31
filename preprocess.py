import pandas as pd

# Load dataset
df = pd.read_csv("data/sentiment_dataset.csv")

# Show the first few rows
print("🔍 First 5 rows:")
print(df.head())

# Show column names
print("\n📊 Column names:")
print(df.columns)

# Check how many positive vs. negative examples
print("\n🧮 Sentiment distribution:")
print(df['revised_sentiment'].value_counts())