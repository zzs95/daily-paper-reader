#!/bin/bash

# Delete archive folders from 20260520 to 20260616
for date in {20260520..20260616}; do
    folder_path="archive/$date/recommend"
    if [ -d "$folder_path" ]; then
        git rm -rf "$folder_path"
        echo "Deleted: $folder_path"
    fi
done

git commit -m "Delete archive recommend folders from 20260520 to 20260616"
git push origin main
