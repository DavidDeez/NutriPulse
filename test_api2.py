import urllib.request, json, urllib.error
req = urllib.request.Request(
    'https://api.fireworks.ai/inference/v1/chat/completions',
    data=json.dumps({'model': 'accounts/fireworks/models/llama-v3p1-70b-instruct', 'messages': [{'role': 'user', 'content': 'hi'}]}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.code)

