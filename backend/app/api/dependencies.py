from app.adapters.storage.local_storage_adapter import LocalStorageAdapter
from app.adapters.vector.mock_vector_adapter import MockVectorAdapter
from app.adapters.inference.mock_slm_adapter import MockSLMAdapter
from app.services.document_processor import DocumentProcessor

# Global instances for the mock in-memory stores so they share state across routers
storage_service = LocalStorageAdapter()
vector_service = MockVectorAdapter()
inference_service = MockSLMAdapter()
doc_processor = DocumentProcessor()

def get_storage_service():
    return storage_service

def get_vector_service():
    return vector_service

def get_inference_service():
    return inference_service

def get_document_processor():
    return doc_processor
