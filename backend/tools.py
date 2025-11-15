import os
import csv
from langchain.tools import tool

@tool
def save_qa_tool(question: str, answer: str) -> str:
    """Append a question/answer pair to interview_log.csv.

    The CSV file will be created in the same directory as this tools.py file.
    If the file is empty, a header row ["Question", "Answer"] will be written first.
    """
    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, "interview_log.csv")

    # Ensure directory exists
    os.makedirs(base_dir, exist_ok=True)

    with open(csv_path, "a+", newline='', encoding='utf-8') as f:
        f.seek(0, os.SEEK_END)
        is_empty = f.tell() == 0

        writer = csv.writer(f)
        if is_empty:
            writer.writerow(["Question", "Answer"])

        # Basic deduplication: avoid writing the same QA pair twice in a row.
        try:
            f.seek(0)
            rows = list(csv.reader(f))
            if len(rows) >= 2:
                last_row = rows[-1]
                if len(last_row) >= 2 and last_row[0] == question and last_row[1] == answer:
                    return "Duplicate Q&A skipped."
        except Exception:
            # If anything goes wrong reading the file, fall back to writing the row.
            pass

        writer.writerow([question, answer])

    return "Q&A pair saved successfully."
