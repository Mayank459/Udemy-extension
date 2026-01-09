import os
from typing import Dict, List, Any
import httpx
import re
import hashlib
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIService:
    def __init__(self):
        # Support multiple AI providers
        self.hf_token = os.getenv("HUGGINGFACE_API_KEY")  # Free tier available
        self.groq_key = os.getenv("GROQ_API_KEY")  # Fast & free tier
        self.openai_key = os.getenv("OPENAI_API_KEY")  # Paid option
        
        # Default to Hugging Face (free)
        self.provider = "huggingface"
        if self.groq_key:
            self.provider = "groq"
        elif self.openai_key:
            self.provider = "openai"
        
        # Hugging Face model endpoint
        self.hf_model = "mistralai/Mistral-7B-Instruct-v0.2"
        self.hf_api_url = f"https://api-inference.huggingface.co/models/{self.hf_model}"

    def _generate_cache_key(self, transcript: str) -> str:
        """Generate MD5 hash of transcript for cache key"""
        return hashlib.md5(transcript.encode()).hexdigest()
    
    @lru_cache(maxsize=100)
    def _cached_process(self, cache_key: str, transcript: str, lecture_title: str) -> str:
        """Cached version of processing - returns JSON string"""
        import json
        import asyncio
        
        # Run async code in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(self._process_lecture_internal(transcript, lecture_title))
            return json.dumps(result)
        finally:
            loop.close()
    
    async def process_lecture(self, transcript: str, lecture_title: str, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Orchestrates the AI processing pipeline with caching.
        """
        import json
        
        cache_key = self._generate_cache_key(transcript)
        
        # Clear cache if force refresh
        if force_refresh:
            self._cached_process.cache_clear()
            print(f"[Cache] Force refresh - cache cleared")
        
        # Try to get from cache
        try:
            cached_json = self._cached_process(cache_key, transcript, lecture_title)
            result = json.loads(cached_json)
            print(f"[Cache] {'Miss' if force_refresh else 'Hit'} - cache_key: {cache_key[:8]}...")
            return result
        except Exception as e:
            print(f"[Cache] Error: {e}")
            # Fallback to direct processing
            return await self._process_lecture_internal(transcript, lecture_title)
    
    async def _process_lecture_internal(self, transcript: str, lecture_title: str) -> Dict[str, Any]:
        """
        Internal processing logic (called by cached wrapper).
        """
        
        # 1. Summarization
        summary = await self._generate_summary(transcript, lecture_title)
        
        # 2. Code Extraction
        code_blocks = await self._extract_code(transcript)
        
        # 3. Key Concepts (extract from summary or transcript)
        key_concepts = self._extract_key_concepts(summary)
        
        return {
            "summary": summary,
            "code_blocks": code_blocks,
            "key_concepts": key_concepts
        }

    async def _generate_summary(self, transcript: str, title: str) -> str:
        """Generate summary using available AI provider"""
        
        # Truncate transcript if too long (to avoid token limits)
        max_chars = 8000
        truncated = transcript[:max_chars] if len(transcript) > max_chars else transcript
        
        prompt = f"""Analyze this lecture transcript and create a detailed summary.

Lecture Title: {title}

Transcript:
{truncated}

Provide a comprehensive summary covering:
1. Main topics and concepts
2. Key takeaways
3. Important definitions or formulas
4. Practical applications

Summary:"""

        if self.provider == "huggingface":
            return await self._call_huggingface(prompt)
        elif self.provider == "groq":
            return await self._call_groq(prompt)
        elif self.provider == "openai":
            return await self._call_openai(prompt)
        else:
            return f"**[Mock Summary for {title}]**\n\nNo AI provider configured. Add HUGGINGFACE_API_KEY to .env for free AI!"

    async def _call_huggingface(self, prompt: str) -> str:
        """Call Hugging Face Inference API (FREE)"""
        if not self.hf_token:
            return "⚠️ Add HUGGINGFACE_API_KEY to .env file. Get free key at: https://huggingface.co/settings/tokens"
        
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
                "top_p": 0.95,
                "return_full_text": False
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.hf_api_url, headers=headers, json=payload)
                
                if response.status_code == 503:
                    return "⏳ Model is loading... Try again in 20 seconds (Hugging Face free tier)"
                
                response.raise_for_status()
                result = response.json()
                
                # Handle different response formats
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "No summary generated")
                elif isinstance(result, dict):
                    return result.get("generated_text", "No summary generated")
                
                return str(result)
                
        except Exception as e:
            return f"Error calling Hugging Face: {str(e)}"

    async def _call_groq(self, prompt: str) -> str:
        """Call Groq API (Fast & Free Tier)"""
        if not self.groq_key:
            return "Add GROQ_API_KEY to .env"
        
        headers = {
            "Authorization": f"Bearer {self.groq_key}",
            "Content-Type": "application/json"
        }
        # Use llama-3.3-70b-versatile which is currently available on Groq
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.5,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": False
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    error_detail = response.text
                    return f"Groq API Error ({response.status_code}): {error_detail[:200]}"
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            return f"Groq HTTP Error: {e.response.status_code} - {e.response.text[:200]}"
        except Exception as e:
            return f"Error calling Groq: {str(e)}"

    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API (Paid)"""
        # Implement if needed
        return "OpenAI integration - add openai library"

    async def _extract_code(self, transcript: str) -> List[str]:
        """Extract code blocks from transcript using regex patterns"""
        code_blocks = []
        
        # Pattern 1: Look for common code indicators
        patterns = [
            r'```[\w]*\n(.*?)```',  # Markdown code blocks
            r'(?:def|class|import|function|const|let|var)\s+[\w]+.*?(?:\n|$)',  # Function/class definitions
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, transcript, re.DOTALL | re.MULTILINE)
            code_blocks.extend(matches)
        
        # Also use AI to extract code if available
        if self.hf_token and len(code_blocks) < 3:
            code_prompt = f"""Extract all code snippets from this transcript. Return only the code, one per line:

{transcript[:3000]}

Code snippets:"""
            
            ai_code = await self._call_huggingface(code_prompt)
            if ai_code and not ai_code.startswith("⚠️"):
                code_blocks.append(ai_code)
        
        return code_blocks[:10] if code_blocks else ["# No code found in transcript"]

    def _extract_key_concepts(self, summary: str) -> List[str]:
        """Extract key concepts from summary"""
        # Simple extraction - look for numbered lists or bullet points
        concepts = []
        lines = summary.split('\n')
        
        for line in lines:
            if re.match(r'^\d+\.|\-|\*', line.strip()):
                concept = re.sub(r'^\d+\.|\-|\*', '', line).strip()
                if concept and len(concept) > 10:
                    concepts.append(concept[:100])
        
        return concepts[:5] if concepts else ["Main topic covered in lecture"]
