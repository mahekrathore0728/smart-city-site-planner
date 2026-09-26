import json
from app import create_app

app = create_app()
client = app.test_client()

routes = [
    ('GET', '/api/health'),
    ('GET', '/api/projects'),
    ('GET', '/api/projects/demo-sih-26114'),
    ('GET', '/api/projects/demo-sih-26114/readiness'),
    ('GET', '/api/projects/demo-sih-26114/site'),
    ('GET', '/api/projects/demo-sih-26114/problems'),
    ('GET', '/api/projects/demo-sih-26114/sources'),
    ('GET', '/api/projects/demo-sih-26114/objectives'),
    ('GET', '/api/projects/demo-sih-26114/proposals'),
    ('GET', '/api/projects/demo-sih-26114/proposals/by-label/A'),
    ('GET', '/api/projects/demo-sih-26114/analyses'),
    ('GET', '/api/projects/demo-sih-26114/forma'),
    ('GET', '/api/projects/demo-sih-26114/revit'),
    ('GET', '/api/projects/demo-sih-26114/forma-board'),
    ('GET', '/api/projects/demo-sih-26114/final'),
    ('GET', '/api/projects/demo-sih-26114/presentation'),
    ('GET', '/api/projects/demo-sih-26114/walkthrough'),
    ('GET', '/api/projects/demo-sih-26114/team'),
    ('GET', '/api/projects/demo-sih-26114/checklist'),
    ('GET', '/api/nonexistent'),
]

all_passed = True
for method, path in routes:
    res = client.open(path, method=method)
    ct = res.headers.get('Content-Type', '')
    data = res.data.decode('utf-8')
    try:
        parsed = json.loads(data)
        is_json = True
    except Exception:
        is_json = False
        all_passed = False
    
    print(f"{method} {path} -> Status: {res.status_code}, Content-Type: {ct}, Valid JSON: {is_json}")
    if not is_json or res.status_code >= 500:
        print(f"  --> FAIL Body: {data[:100]}")

if all_passed:
    print("\nALL API ENDPOINTS RETURN VALID JSON!")
else:
    print("\nSOME API ENDPOINTS FAILED!")
