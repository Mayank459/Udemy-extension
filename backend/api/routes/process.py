from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

class ProcessRequest(BaseModel):
    transcript: str
    lecture_title: Optional[str] = "Untitled Lecture"
    course_title: Optional[str] = None
    force_refresh: Optional[bool] = False

class ProcessResponse(BaseModel):
    summary: str
    code_blocks: List[str]
    key_concepts: List[str]

@router.post("/process", response_model=ProcessResponse)
async def process_transcript(request: ProcessRequest):
    if not request.transcript:
        raise HTTPException(status_code=400, detail="Transcript is required")
    
    try:
        # call AI service
        result = await ai_service.process_lecture(
            transcript=request.transcript,
            lecture_title=request.lecture_title,
            force_refresh=request.force_refresh
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
