Write-Host "Searching for Greek DBpedia files (lang=el)..." -ForegroundColor Cyan

# 1. Το Query: Ψάχνει Links με 'lang=el' ΚΑΙ συγκεκριμένα ονόματα αρχείων
$Query = @"
PREFIX dcat: <http://www.w3.org/ns/dcat#>
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
}
"@

$OutputDir = "dbpedia_data"
if (!(Test-Path -Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }

# 2. Εκτέλεση Query
$EncodedQuery = [uri]::EscapeDataString($Query)
$Url = "https://databus.dbpedia.org/sparql?query=$EncodedQuery&format=text/csv"

try {
    $CsvText = Invoke-RestMethod -Uri $Url -Method Get
    $Data = $CsvText | ConvertFrom-Csv
}
catch {
    Write-Error "Error contacting Databus: $_"
    exit
}

# 3. Έλεγχος
if (!$Data) {
    Write-Warning "No files found! (Check filters)"
    exit
}

$Count = @($Data).Count
Write-Host "Found $Count relevant files. Starting download..." -ForegroundColor Yellow

# 4. Λήψη
foreach ($Row in $Data) {
    $FileUrl = $Row.file
    if ([string]::IsNullOrWhiteSpace($FileUrl)) { continue }

    $FileName = $FileUrl.Split('/')[-1]
    $OutputPath = Join-Path -Path $OutputDir -ChildPath $FileName
    
    # Έλεγχος αν υπάρχει ήδη
    if (Test-Path $OutputPath) {
        Write-Host "   Skipping (exists): $FileName" -ForegroundColor Gray
        continue
    }
    
    Write-Host "   Downloading: $FileName" -ForegroundColor Green
    try {
        Invoke-WebRequest -Uri $FileUrl -OutFile $OutputPath
    }
    catch {
        Write-Warning "   Failed to download $FileName"
    }
}

Write-Host "Success! All files are in '$OutputDir'" -ForegroundColor Cyan


# 5 run with .\download_data.ps1 on powershell terminal, kai tha ksekinisei na kanei download ta arxeia sto fakelo 'dbpedia_data' pou tha dimiourgithei an den yparxei

# 6 meta to docker compose up -d --build , kai exoyn sikwthei ola
# gia na mpoyme sto virtusos sto terminal  ,h entoli 'docker exec -it dbpedia-virtuoso isql 1111 dba mysecretpassword'
# sti sunexeia 'SQL>  "ld_dir('/database/to_load', '*.bz2', 'http://dbpedia.org');" ta .bz2 αρχεία για να τα βάλεις στο graph http://dbpedia.org". ths vasis mas
#rdf_loader_run(); gia na ksekinisei to sql
#'checkpoint;'gia na grapsei 
#gia test 'SELECT * FROM DB.DBA.LOAD_LIST;'
