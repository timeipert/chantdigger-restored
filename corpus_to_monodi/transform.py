import os
import shutil
import json
import uuid
import re
import pandas as pd

# Define a mapping from raw subcorpus codes to the desired folder names.
SUBCORPUS_MAPPING = {
    "GR": "GradualeTriplex",
    "ML": "AntMed",
    "AR": "Graduale Vat 5319",
    "BEN": "Offertoriale triplex"
    # add more mappings as needed...
}

def convert_pitch(token, marker=None):
    """
    Convert a pitch token (e.g. "g", "c'", "H") into a note object.

    Rules:
      - The base letter is the first character (but if it is H/h, use "B").
      - If the token contains an apostrophe, the octave is 5.
      - Otherwise, if the token’s first character is uppercase, the octave is 3;
        if lowercase, the octave is 4.
      - The noteType is set according to the marker:
          "lu" -> "Ascending"
          "ld" -> "Descending"
          "or" -> "Oriscus"
        and if no marker is present, noteType is "Normal".
      - For "lu" or "ld", the liquescent field is set to True.

    Returns a dictionary representing the note.
    """
    if marker == "lu":
        note_type = "Ascending"
    elif marker == "ld":
        note_type = "Descending"
    elif marker == "or":
        note_type = "Oriscus"
    else:
        note_type = "Normal"

    first_char = token[0]
    if first_char.upper() == "H":
        base_letter = "B"
    else:
        base_letter = first_char.upper()

    if "'" in token:
        octave = 5
    else:
        octave = 3 if first_char.isupper() else 4

    liquescent = True if note_type in ["Ascending", "Descending"] else False

    return {
        "uuid": str(uuid.uuid4()),
        "noteType": note_type,
        "base": base_letter,
        "octave": octave,
        "liquescent": liquescent,
        "focus": False
    }


def parse_syllables_and_melody(line):
    """
    Split a melody line into:
      - text_syllables: the syllable texts extracted from bracketed tokens (e.g. "[RI-]")
      - melodic_content: a list of strings, each containing the tokens that follow the corresponding bracketed syllable.

    Example:
       Input: "[RI-] a h a g"
       Returns: (["RI-"], ["a h a g"])
    """
    tokens = line.split()
    text_syllables = []
    melodic_content = []
    current_tokens = []

    for token in tokens:
        if token.startswith('[') and token.endswith(']'):
            if current_tokens:
                melodic_content.append(" ".join(current_tokens))
                current_tokens = []
            syllable = token.strip("[]")
            text_syllables.append(syllable)
        else:
            current_tokens.append(token)
    if current_tokens:
        melodic_content.append(" ".join(current_tokens))
    return text_syllables, melodic_content


def read_corpus(filepath):
    """
    Reads the corpus file and returns a DataFrame where each record (chant)
    is expected to consist of exactly 7 non-empty lines in this order:
      1. id
      2. subcorpus
      3. incipit
      4. genre
      5. reference
      6. syllables_and_melody
      7. just_syllables

    If a block is misaligned (e.g. line 6 lacks a '['), a warning is printed and the reader
    attempts to re-synchronize by skipping one line.
    """
    with open(filepath, encoding="utf-8") as f:
        lines = [line.rstrip("\n") for line in f if line.strip()]

    records = []
    total_lines = len(lines)
    i = 0
    while i < total_lines:
        if re.match(r"^\d+$", lines[i].strip()):
            if i + 6 < total_lines:
                block = lines[i:i+7]
                if '[' in block[5]:
                    record = {
                        "id": block[0].strip(),
                        "subcorpus": block[1].strip(),
                        "incipit": block[2].strip(),
                        "genre": block[3].strip(),
                        "reference": block[4].strip(),
                        "syllables_and_melody": block[5].strip(),
                        "just_syllables": block[6].strip(),
                    }
                    records.append(record)
                    i += 7
                else:
                    print(f"Warning: Misaligned record starting at line {i+1}. Skipping one line for realignment.")
                    i += 1
            else:
                print(f"Warning: Incomplete record starting at line {i+1}.")
                break
        else:
            print(f"Warning: Expected an ID at line {i+1} but found: {lines[i]}. Skipping line.")
            i += 1
    return pd.DataFrame(records)


def create_monodi_files(df, output_base="monodi_files", subcorpus_mapping=None):
    """
    For each chant (row in the DataFrame) create a folder (named by a generated UUID)
    inside the subcorpus folder under the output_base.

    This function first clears the entire output_base.

    Each folder will contain:
      - meta.json: a metadata file built from the record (with available fields)
      - data.json: a nested structure containing one RootContainer, one FormteilContainer,
        one ZeileContainer, and for each syllable a Syllable object.

    For each syllable, the melodic content (a space-separated string) is split into tokens.
    Marker tokens ("lu", "ld", "or") change the noteType of the immediately following pitch token.
    Every pitch token is converted via convert_pitch and then wrapped in a "grouped" container.
    """
    if subcorpus_mapping is None:
        subcorpus_mapping = {}

    # Clear the output directory entirely.
    if os.path.exists(output_base):
        shutil.rmtree(output_base)
    os.makedirs(output_base, exist_ok=True)

    # Process each chant.
    for _, row in df.iterrows():
        raw_sub = row["subcorpus"].strip() if pd.notnull(row["subcorpus"]) else "Unknown"
        # Use the mapping to rename the subcorpus folder if available.
        subfolder_name = subcorpus_mapping.get(raw_sub, raw_sub)
        # Create a subfolder inside output_base that will hold this subcorpus.
        subfolder_path = os.path.join(output_base, subfolder_name)
        os.makedirs(subfolder_path, exist_ok=True)

        # Create a new folder for this chant inside the subcorpus folder.
        folder_id = str(uuid.uuid4())
        folder_path = os.path.join(subfolder_path, folder_id)
        os.makedirs(folder_path, exist_ok=True)

        meta = {
            "id": folder_id,
            "quelle_id": subfolder_name,
            "dokumenten_id": row["reference"] if pd.notnull(row["reference"]) else "",
            "gattung1": row["genre"] if pd.notnull(row["genre"]) else "",
            "gattung2": "",
            "festtag": "",
            "feier": "",
            "textinitium": row["incipit"] if pd.notnull(row["incipit"]) else "",
            "bibliographischerverweis": row["reference"] if pd.notnull(row["reference"]) else "",
            "druckausgabe": "",
            "zeilenstart": "",
            "foliostart": "",
            "kommentar": "",
            "editionsstatus": "ediert",
            "additionalData": {
                "Melodiennummer_Katalog": "",
                "Editor": "sandaanna@gmail.com",
                "iiifs": "",
                "Bezugsgesang": "",
                "Melodie_Standard": "–",
                "Endseite": "",
                "Startposition": "",
                "Zusatz_zu_Textinitium": "",
                "Referenz_auf_Spiel": "",
                "Endzeile": "",
                "Nachtragsschicht": "",
                "Überlieferungszustand": "",
                "Melodie_Quelle": ""
            },
            "publish": "meta-and-notes"
        }

        # Parse the syllables and their melodic content.
        text_syllables, melodic_contents = parse_syllables_and_melody(row["syllables_and_melody"])

        syllable_objs = []
        for syllable_text, melody_str in zip(text_syllables, melodic_contents):
            tokens = melody_str.split()
            marker = None  # Reset marker for each syllable.
            note_wrappers = []  # Holds the grouped note objects.
            for token in tokens:
                token_lower = token.lower()
                if token_lower in {"lu", "ld", "or"}:
                    marker = token_lower
                else:
                    note_obj = convert_pitch(token, marker)
                    note_wrapper = {"grouped": [note_obj]}
                    note_wrappers.append(note_wrapper)
                    marker = None
            syllable_obj = {
                "uuid": str(uuid.uuid4()),
                "kind": "Syllable",
                "text": syllable_text,
                "endsWord": True,
                "syllableType": "Normal",
                "notes": {
                    "spaced": [
                        {"nonSpaced": note_wrappers}
                    ]
                }
            }
            syllable_objs.append(syllable_obj)

        zeile_container = {
            "uuid": str(uuid.uuid4()),
            "kind": "ZeileContainer",
            "children": syllable_objs
        }

        formteil_container = {
            "uuid": str(uuid.uuid4()),
            "kind": "FormteilContainer",
            "data": [],
            "children": [zeile_container]
        }

        data_json = {
            "comments": [],
            "documentType": "Level1",
            "uuid": str(uuid.uuid4()),
            "kind": "RootContainer",
            "children": [formteil_container]
        }

        meta_path = os.path.join(folder_path, "meta.json")
        with open(meta_path, "w", encoding="utf-8") as meta_file:
            json.dump(meta, meta_file, indent=2, ensure_ascii=False)

        data_path = os.path.join(folder_path, "data.json")
        with open(data_path, "w", encoding="utf-8") as data_file:
            json.dump(data_json, data_file, indent=2, ensure_ascii=False)

        print(f"Created monodi files in folder: {folder_path}")

    # Now, create one ZIP archive per subcorpus folder.
    # We want the ZIP file to include the subcorpus folder (e.g., "GradualeTriplex")
    # as the top-level folder inside the ZIP.
    for entry in os.listdir(output_base):
        subfolder_path = os.path.join(output_base, entry)
        if os.path.isdir(subfolder_path):
            # Use the parent (output_base) as root_dir and specify base_dir=entry
            zip_base = os.path.join(output_base, entry)
            shutil.make_archive(base_name=zip_base, format="zip", root_dir=output_base, base_dir=entry)
            print(f"Created zip file: {zip_base}.zip")


def process_corpus(corpus_path, output_csv="chants.csv", output_dir="monodi_files"):
    """
    Process the full workflow:
      1. Read the corpus file into a DataFrame.
      2. Parse the 'syllables_and_melody' field.
      3. Save the resulting DataFrame to CSV.
      4. Create one monodi folder (with meta.json and data.json) per chant,
         organized into subcorpus folders (renamed via SUBCORPUS_MAPPING),
         and then create a ZIP archive for each subcorpus.
    """
    df = read_corpus(corpus_path)
    if df.empty:
        print("No valid records found.")
        return

    parsed_records = []
    for _, row in df.iterrows():
        text_syllables, melodic_content = parse_syllables_and_melody(row["syllables_and_melody"])
        row_dict = row.to_dict()
        row_dict["text_syllables"] = text_syllables
        row_dict["melodic_content"] = melodic_content
        parsed_records.append(row_dict)

    df_parsed = pd.DataFrame(parsed_records)
    df_parsed.to_csv(output_csv, index=False)
    print(f"DataFrame saved to '{output_csv}'")
    create_monodi_files(df_parsed, output_dir, subcorpus_mapping=SUBCORPUS_MAPPING)


def main():
    corpus_path = "../corpus.txt"
    process_corpus(corpus_path)


if __name__ == "__main__":
    main()