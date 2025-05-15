#!/bin/bash

set -e

TARGET_FILE="./src/server/db/auth-schema.ts"
TEMP_FILE="${TARGET_FILE}.tmp"

# Step 1: Remove pgTable from drizzle-orm import
sed -E 's/^import \{(.*)pgTable, *(.*)\} from "drizzle-orm\/pg-core";/import { \1\2 } from "drizzle-orm\/pg-core";/;
         s/^import \{(.*), *pgTable\} from "drizzle-orm\/pg-core";/import { \1 } from "drizzle-orm\/pg-core";/;
         s/^import \{ *pgTable *\} from "drizzle-orm\/pg-core";/import {} from "drizzle-orm\/pg-core";/' "$TARGET_FILE" > "$TEMP_FILE"

# Step 2: Inject the new import if not present
if ! grep -q 'createPrefixedTable as pgTable' "$TEMP_FILE"; then
  awk '
    BEGIN { inserted = 0 }
    /^import / { print; last_import = NR; next }
    {
      if (!inserted && NR > last_import) {
        print "import { createPrefixedTable as pgTable } from \"./utils/tables\";"
        inserted = 1
      }
      print
    }
  ' "$TEMP_FILE" > "$TARGET_FILE"
else
  mv "$TEMP_FILE" "$TARGET_FILE"
fi

# Clean up temp file if it still exists
[ -f "$TEMP_FILE" ] && rm "$TEMP_FILE"

# Step 3: Format with Prettier
npx prettier --write "$TARGET_FILE"

echo "✅ Patched and formatted $TARGET_FILE"