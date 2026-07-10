from pathlib import Path
import re

root = Path('.')
pattern = re.compile(r"process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*(['\"])(?:http://127\.0\.0\.1:8000|http://localhost:8000)\1")

count = 0
files = []

for path in root.rglob('*'):
    if path.suffix in {'.ts', '.tsx'} and path.is_file():
        text = path.read_text(encoding='utf-8')
        new_text, n = pattern.subn('process.env.NEXT_PUBLIC_API_URL', text)
        if n > 0:
            path.write_text(new_text, encoding='utf-8')
            count += n
            files.append(str(path))

print(f'replaced occurrences: {count}')
print(f'files modified: {len(files)}')
for f in files:
    print(f)
