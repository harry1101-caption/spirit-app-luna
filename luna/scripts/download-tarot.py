"""Re-download missing local card scans using recorded, explicit per-file sources."""
import concurrent.futures
import json
from pathlib import Path
import time
import urllib.request

folder = Path(__file__).resolve().parents[1] / 'public/images/tarot'
manifest = json.loads((folder / 'sources.json').read_text())

def download(item):
    target = folder / item['file']
    if target.exists() and target.stat().st_size > 1000:
        return
    for attempt in range(3):
        try:
            request = urllib.request.Request(item['download_url'], headers={'User-Agent': 'LunaAssetImport/1.0'})
            with urllib.request.urlopen(request, timeout=45) as response:
                content = response.read()
            if content[:2] != b'\xff\xd8':
                raise ValueError('The source did not return a JPEG')
            target.write_bytes(content)
            return
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 + attempt * 3)

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    list(pool.map(download, manifest))
print(f'{len(manifest)} locally stored card images are available.')
