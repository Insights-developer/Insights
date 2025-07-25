import tabula
import pandas as pd
import re
import numpy as np

def parse_result_chunk(chunk):
    """
    Parses a single result chunk (e.g., '07/11/25 E 5- 1 - 1 FB 1')
    into a structured dictionary. This is designed to be very forgiving.
    """
    # This regex makes the "FB" and the Fireball number completely optional.
    match = re.search(r'(\d{2}/\d{2}/\d{2})\s+([EM])\s+(\d)\s*-\s*(\d)\s*-\s*(\d)(?:\s+FB\s*(\d?))?', str(chunk))
    if match:
        # Unpack the groups. The Fireball group (fb) may be None if it wasn't found.
        date, draw_char, n1, n2, n3, fb = match.groups()
        return {
            'Date': date,
            'DrawTime': 'Midday' if draw_char == 'M' else 'Evening',
            'Number': f"{n1}{n2}{n3}",
            'Fireball': fb if fb is not None and fb.strip() != '' else '' # Handle cases where Fireball is missing or empty
        }
    return None

def clean_and_process_data(df_list):
    """
    Cleans the raw data extracted from the PDF tables, processes it into a structured format,
    and separates it into Midday and Evening results.
    """
    all_results = []
    
    # This pattern looks for the date to identify the start of a result string
    split_pattern = r'(?=\d{2}/\d{2}/\d{2})'

    for df in df_list:
        # --- The Definitive Fix ---
        # 1. Process the column headers, which contain the first row of results.
        # Iterate over each header item individually instead of joining them.
        for header_chunk in df.columns:
            parts = re.split(split_pattern, str(header_chunk))
            for part in parts:
                if part.strip() and part.strip() != 'nan':
                    parsed = parse_result_chunk(part.strip())
                    if parsed:
                        all_results.append(parsed)

        # 2. Iterate through the DataFrame row by row.
        for index, row in df.iterrows():
            # Iterate through each individual cell in the row
            for cell_text in row.values:
                # A single cell can contain multiple results separated by newlines.
                # We split by the date pattern again, which is the most reliable delimiter.
                sub_parts = re.split(split_pattern, str(cell_text))
                for part in sub_parts:
                    if part.strip() and part.strip() != 'nan':
                        parsed = parse_result_chunk(part.strip())
                        if parsed:
                            all_results.append(parsed)

    if not all_results:
        return pd.DataFrame(), pd.DataFrame()

    results_df = pd.DataFrame(all_results)
    
    # Remove any potential duplicate rows that might arise from parsing errors
    results_df.drop_duplicates(inplace=True)

    # Reformat the date from MM/DD/YY to YYYY-MM-DD
    results_df['Date'] = pd.to_datetime(results_df['Date'], format='%m/%d/%y').dt.strftime('%Y-%m-%d')

    # Sort all results by date in descending order before splitting
    results_df.sort_values(by='Date', ascending=False, inplace=True)

    # Separate into Midday and Evening DataFrames
    midday_df = results_df[results_df['DrawTime'] == 'Midday'].drop(columns=['DrawTime'])
    evening_df = results_df[results_df['DrawTime'] == 'Evening'].drop(columns=['DrawTime'])
    
    return midday_df, evening_df

def main():
    """
    Main function to parse the local PDF and save the results to CSV files.
    """
    pdf_path = "p3.pdf"
    print(f"Parsing local PDF file: {pdf_path}")
    
    try:
        # --- THE DEFINITIVE FIX ---
        # Force tabula to treat each page as a single data stream, ignoring columns.
        # This is more robust against layout inconsistencies.
        dfs = tabula.read_pdf(pdf_path, pages='all', stream=True, multiple_tables=False, guess=False)
        
        print(f"Successfully extracted table data from {len(dfs)} pages.")

        midday_results, evening_results = clean_and_process_data(dfs)

        if not midday_results.empty:
            midday_results.to_csv('pick3_midday_historical.csv', index=False)
            print(f"Successfully saved {len(midday_results)} Midday results to pick3_midday_historical.csv")
        else:
            print("No Midday results were found.")

        if not evening_results.empty:
            evening_results.to_csv('pick3_evening_historical.csv', index=False)
            print(f"Successfully saved {len(evening_results)} Evening results to pick3_evening_historical.csv")
        else:
            print("No Evening results were found.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
