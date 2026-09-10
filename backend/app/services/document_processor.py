import fitz  # PyMuPDF
from typing import List, Dict, Any

class DocumentProcessor:
    def __init__(self, chunk_size: int = 1000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def process_pdf(self, file_content: bytes) -> List[Dict[str, Any]]:
        """
        Extracts text from a PDF byte stream and splits it into overlapping chunks.
        """
        doc = fitz.open(stream=file_content, filetype="pdf")
        chunks = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            
            if not text.strip():
                continue
                
            # Basic chunking by character count for simplicity
            start = 0
            while start < len(text):
                end = start + self.chunk_size
                chunk_text = text[start:end]
                
                chunks.append({
                    "text": chunk_text,
                    "page": page_num + 1
                })
                
                start += (self.chunk_size - self.overlap)
                
        return chunks
