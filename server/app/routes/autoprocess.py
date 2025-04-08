from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from ..db.database import candidates_collection, interviews_collection
from ..models.candidate import (
    Candidate, 
    CandidateCreate, 
    CandidateInDB, 
    CandidateSearchParams, 
    CandidateUpdate
)
from ..models.interview import Interview

router = APIRouter(prefix="/autoprocess", tags=["autoprocess"])

@router.post("/resume-analysis", response_model=Candidate)
async def resume_analysis(
    resume_file: UploadFile = File(...),
):
    """
    Analyze a resume file and return a candidate object with the analysis results.
    """
    # Validate file type
    if not resume_file.content_type.startswith("application/pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Read the PDF file
    pdf_reader = PyPDF2.PdfFileReader(resume_file.file)
    num_pages = pdf_reader.numPages
    text = ""
    for page in range(num_pages):
        text += pdf_reader.getPage(page).extract_text()

    # Extract candidate information
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    position = extract_position(text)

    # Create a candidate object
    candidate = Candidate(
        name=name,
        email=email,
        phone=phone,
        position=position,
        department=department,
        experience=experience,
        status=status,
        resume_url=resume_file.filename,
        skills=skills,
        notes=notes,        
    )

    return candidate
    

