import os
import uuid
from fastapi import UploadFile, HTTPException, status

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
UPLOAD_DIR = "uploads"

def save_uploaded_file(file: UploadFile) -> str:
    """
    Saves an uploaded product image file securely after validating its extension.
    Returns the relative path web url where it is accessible.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing"
        )
        
    filename = file.filename
    ext = filename.split(".")[-1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '.{ext}' is not supported. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename to avoid duplicates/collisions
    new_filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, new_filename)
    
    try:
        with open(filepath, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file to disk: {str(e)}"
        )
        
    # Return path relative to server root
    return f"/uploads/{new_filename}"
