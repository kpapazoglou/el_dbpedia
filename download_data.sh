#!/bin/bash

# Χρώματα για το τερματικό
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
GRAY='\033[1;30m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}Searching for Greek DBpedia files (lang=el)...${NC}"

# 1. Το Query
QUERY="PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dataid: <http://dataid.dbpedia.org/ns/core#>

SELECT DISTINCT ?file WHERE {
  ?dataset dcat:distribution ?distribution .
  ?distribution dcat:downloadURL ?file .
  
  # ΦΙΛΤΡΟ 1: Να είναι Ελληνικά
  FILTER (contains(str(?file), 'lang=el'))

  # ΦΙΛΤΡΟ 2: Να είναι ΜΟΝΟ τα αρχεία που χρειαζόμαστε, oxi metadata
  FILTER (
    contains(str(?file), '/labels') || 
    contains(str(?file), '/short-abstracts') || 
    contains(str(?file), '/long-abstracts') || 
    contains(str(?file), '/instance-types') || 
    contains(str(?file), '/mappingbased-objects') || 
    contains(str(?file), '/mappingbased-literals') || 
    contains(str(?file), '/images') ||
    contains(str(?file), '/geo-coordinates')
  )
}"

OUTPUT_DIR="dbpedia_data"
mkdir -p "$OUTPUT_DIR"

# 2. Εκτέλεση Query (Το curl κάνει αυτόματα το URL encode με το --data-urlencode)
CSV_TMP_FILE="/tmp/dbpedia_files.csv"

curl -s -G -H "Accept: text/csv" \
  --data-urlencode "query=$QUERY" \
  "https://databus.dbpedia.org/sparql" -o "$CSV_TMP_FILE"

# 3. Έλεγχος Αποτελεσμάτων
# Μετράμε γραμμές αγνοώντας το header (file) και τις κενές γραμμές
COUNT=$(tail -n +2 "$CSV_TMP_FILE" | grep -v '^\s*$' | wc -l)

if [ "$COUNT" -eq 0 ]; then
    echo -e "${RED}No files found! (Check filters)${NC}"
    rm -f "$CSV_TMP_FILE"
    exit 1
fi

echo -e "${YELLOW}Found $COUNT relevant files. Starting download...${NC}"

# 4. Λήψη Αρχείων
# Διαβάζουμε το CSV παραλείποντας την πρώτη γραμμή, αφαιρούμε τυχόν " και \r
tail -n +2 "$CSV_TMP_FILE" | tr -d '"' | tr -d '\r' | while read -r FILE_URL; do
    if [ -z "$FILE_URL" ]; then continue; fi

    # Παίρνουμε το όνομα του αρχείου από το τέλος του URL
    FILE_NAME=$(basename "$FILE_URL")
    OUTPUT_PATH="$OUTPUT_DIR/$FILE_NAME"
    
    # Έλεγχος αν υπάρχει ήδη
    if [ -f "$OUTPUT_PATH" ]; then
        echo -e "${GRAY}  Skipping (exists): $FILE_NAME${NC}"
        continue
    fi
    
    echo -e "${GREEN}  Downloading: $FILE_NAME${NC}"
    # Λήψη με το curl (-L για ακολουθία redirects, -s για silent mode)
    curl -L -s -o "$OUTPUT_PATH" "$FILE_URL"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}  Failed to download $FILE_NAME${NC}"
    fi
done

# Καθαρισμός προσωρινού αρχείου
rm -f "$CSV_TMP_FILE"
echo -e "${CYAN}Success! All files are in '$OUTPUT_DIR'${NC}"


# ==============================================================================
# ΟΔΗΓΙΕΣ ΓΙΑ ΕΙΣΑΓΩΓΗ ΣΤΟΝ VIRTUOSO ΜΕΣΩ DOCKER:
# ==============================================================================
# Βεβαιώσου ότι 'chmod +x download_data.sh' έχει εκτελεστεί για να γίνει το script εκτελέσιμο.
# 5. Τρέξε το script: ./download_data.sh (θα κατεβάσει τα αρχεία στον φάκελο dbpedia_data)
# 
# 6. Μετά το `docker-compose up -d --build`, βεβαιώσου ότι ο Virtuoso "βλέπει" τα αρχεία:
#    docker exec -it dbpedia-virtuoso ls -l /database/to_load
#
# 7. Μπες στο SQL terminal του Virtuoso:
#    docker exec -it dbpedia-virtuoso isql 1111 dba mysecretpassword
#
# 8. Εκτέλεσε τις παρακάτω εντολές στο SQL prompt (SQL>):
#    ld_dir('/database/to_load', '*.bz2', 'http://dbpedia.org');
#    rdf_loader_run();
#    checkpoint;
#
# 9. Για έλεγχο προόδου/ολοκλήρωσης τρέξε:
#    SELECT * FROM DB.DBA.LOAD_LIST;