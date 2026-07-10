#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

---

**Important — make sure:**
- `Procfile` has NO file extension (not `.txt`, not `.sh`) — just `Procfile`
- Both files are in the same folder as `manage.py`

It should look like this:
```
backend/civic/
├── Procfile        ← new
├── build.sh        ← new
├── manage.py
├── requirements.txt
└── Civic/
    └── settings.py
```

---

Once both files are created, run these commands in your terminal to push everything to GitHub:
```
git add .
git commit -m "add deployment config"
git push