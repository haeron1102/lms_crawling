import requests
import json

OPENROUTER_API_KEY = ""

response = requests.post(
  url="https://openrouter.ai/api/v1/chat/completions",
  headers={
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
  },
  data=json.dumps({
    "model": "openai/gpt-3.5-turbo", 
    "messages": [
      { "role": "user", "content": "인생의 의미는 무엇일까요?" }
    ]
  })
)