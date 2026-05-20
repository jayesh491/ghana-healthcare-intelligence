import sqlite3
import pandas as pd

# Change this to your exact filename
CSV_FILE = "ghana_hospitals.csv"
DB_NAME = "healthcare.db"

def load_csv_to_db():
    print(f"Loading {CSV_FILE}...")
    
    # Read CSV
    df = pd.read_csv(CSV_FILE, low_memory=False)
    print(f"Found {len(df)} rows and {len(df.columns)} columns")
    print("Columns:", list(df.columns))
    
    # Connect to DB
    conn = sqlite3.connect(DB_NAME)
    
    # Create hospitals table from CSV
    df.to_sql('hospitals', conn, if_exists='replace', index=False)
    
    conn.commit()
    conn.close()
    print("✅ Data loaded successfully!")

if __name__ == "__main__":
    load_csv_to_db()