# Medieval Chants Corpus Processor

This project is a Python-based tool designed to process a corpus of medieval chants. It reads an input text file where
each chant is represented by exactly seven non‑empty lines (with a fixed structure), extracts key fields, and builds a
pandas DataFrame. The tool then creates a hierarchical folder structure and JSON files for each chant, organizing them
by subcorpus. Finally, it archives each subcorpus folder as a ZIP file.

## Features

- **Corpus Parsing:**  
  Reads a text file (`corpus.txt`) where each chant consists of 7 lines in the following order:
    1. **ID**
    2. **Subcorpus**
    3. **Incipit**
    4. **Genre**
    5. **Reference**
    6. **Syllables and Melody** (a line containing bracketed syllable texts and the following melodic tokens)
    7. **Just Syllables**

- **Melodic Content Processing:**  
  Splits the melodic content into:
    - `text_syllables`: Extracted from tokens enclosed in square brackets.
    - `melodic_content`: The remaining tokens, which are further parsed into individual pitch tokens.

- **Pitch Conversion:**  
  Converts each pitch token into a note object using the following rules:
    - **Base letter:**
        - The token’s first character is used as the base, except that H (or h) is always converted to **B**.
    - **Octave:**
        - If the token contains an apostrophe (`'`), the octave is **5**.
        - Otherwise, if the token starts with an uppercase letter, the octave is **3**; if lowercase, **4**.
    - **Markers:**
        - Special marker tokens `lu`, `ld`, and `or` (case-insensitive) modify the note type of the immediately
          following pitch:
            - `lu` → **Ascending** (liquescent up; sets `liquescent` to `True`)
            - `ld` → **Descending** (liquescent down; sets `liquescent` to `True`)
            - `or` → **Oriscus**
        - If no marker is present, the note type defaults to **Normal**.
    - Every note is then wrapped in a `"grouped"` container as required by the output format.

- **Output Structure:**  
  For each chant, the tool creates a folder (named with a generated UUID) containing:
    - **meta.json:** A metadata file built from the record (fields like subcorpus, incipit, genre, etc.).
    - **data.json:** A nested JSON structure that contains:
        - A RootContainer holding one FormteilContainer, which in turn contains one ZeileContainer.
        - The ZeileContainer holds one Syllable object per syllable, and each syllable’s melodic data is stored as a
          list of grouped note objects.

- **Hierarchical Organization and Archiving:**
    - The output is organized into subcorpus folders.
    - A global mapping (`SUBCORPUS_MAPPING`) allows you to change the folder name for a given raw subcorpus code (for
      example, renaming `"GR"` to `"GradualeTriplex"`).
    - Each chant folder is placed inside its corresponding subcorpus folder.
    - An additional folder structure is maintained so that when you archive (ZIP) a subcorpus folder, the top-level
      folder inside the ZIP is the renamed subcorpus (e.g. `"GradualeTriplex"`) which contains the individual chant (
      UUID) folders.

## Requirements

- Python 3.x
- The following Python libraries:
    - `os`
    - `shutil`
    - `json`
    - `uuid`
    - `re`
    - `pandas`

You can install the required package (pandas) via pip:

```bash
pip install pandas
