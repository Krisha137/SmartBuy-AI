"""
AI Service Abstraction for SmartBuy AI.
Provides unified requirement understanding via server-side LLM provider calls
with seamless fallback to deterministic NLP rule parser.
"""

import json
import logging
import urllib.request
import urllib.error
from decouple import config
from .schemas import validate_parsed_requirements
from .prompts import SYSTEM_PROMPT
from .requirement_parser import RuleBasedRequirementParser

logger = logging.getLogger(__name__)


class AIService:
    """
    Server-side AI service abstraction for natural language requirement extraction.
    Ensures zero frontend credential exposure, strict JSON validation,
    and automatic fallback to rule-based NLP parsing.
    """

    def __init__(self, api_key: str = None, provider: str = None):
        self.api_key = api_key or config('AI_API_KEY', default='')
        self.provider = provider or config('AI_PROVIDER', default='gemini')

    def understand_requirements(self, query: str) -> dict:
        """
        Parses a natural language query into a validated requirement dict.
        """
        if query is None or not isinstance(query, str):
            raise ValueError("Query must be a string.")

        query = query.strip()
        if len(query) == 0:
            raise ValueError("Query cannot be empty or whitespace only.")
        if len(query) > 500:
            raise ValueError("Query exceeds maximum allowed length of 500 characters.")

        parsed_data = None

        # Call LLM provider if server-side API key is present
        if self.api_key and self.api_key.strip():
            try:
                parsed_data = self._call_llm_provider(query)
            except Exception as e:
                logger.info(f"AI Provider call fallback: {e}")

        # Fallback to rule-based parser if no API key or provider call failed
        if not parsed_data:
            rule_parser = RuleBasedRequirementParser()
            parsed_data = rule_parser.parse(query)

        # Run backend validation
        validated_result, errors = validate_parsed_requirements(parsed_data)
        if errors:
            raise ValueError(f"Requirement validation failed: {'; '.join(errors)}")

        return validated_result

    def _call_llm_provider(self, query: str) -> dict:
        """
        Calls Gemini REST API (or OpenAI REST API) server-side with structured prompt.
        """
        if self.provider.lower() == 'openai':
            return self._call_openai(query)
        else:
            return self._call_gemini(query)

    def _call_gemini(self, query: str) -> dict:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{SYSTEM_PROMPT}\n\nUSER QUERY:\n{query}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)

            candidates = res_json.get('candidates', [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini API.")

            text_content = candidates[0]['content']['parts'][0]['text']
            return self._clean_and_parse_json(text_content)

    def _call_openai(self, query: str) -> dict:
        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": query}
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            },
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            text_content = res_json['choices'][0]['message']['content']
            return self._clean_and_parse_json(text_content)

    def _clean_and_parse_json(self, text_content: str) -> dict:
        clean_text = text_content.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]

        return json.loads(clean_text.strip())
