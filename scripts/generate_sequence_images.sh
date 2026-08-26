#!/bin/bash
counter=1
# Read file and split by @startuml / @enduml
awk '/@startuml/{flag=1; buf=""; next} /@enduml/{flag=0; print "@startuml\n" buf "@enduml" > "temp_" ++c ".puml"} flag {buf = buf $0 ORS}' docs/plantuml_sequence_diagrams.md

for file in temp_*.puml; do
    echo "Processing $file..."
    curl -s -X POST -H 'Content-Type: text/plain' --data-binary @$file https://kroki.io/plantuml/png -o docs/sequence_diagram_${counter}.png -w "HTTP %{http_code}\n"
    rm $file
    counter=$((counter+1))
done
