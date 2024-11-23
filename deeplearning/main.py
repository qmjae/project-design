from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import logging
import io
import time
from defect_classes import get_defect_info, get_recommendations, get_priority_level
import cv2
import base64

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Solar Panel Defect Detection API",
    description="API for detecting defects in solar panels using thermal images",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
try:
    model = YOLO("model/best.pt", task='detect')
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None

@app.get("/")
def read_root():
    return {
        "message": "Solar Panel Defect Detection API",
        "status": "active",
        "model_loaded": model is not None
    }

@app.post("/detect/")
async def detect_defects(file: UploadFile = File(...)):
    start_time = time.time()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No file uploaded"
        )
        
    try:
        # Validate file
        allowed_types = ["image/jpeg", "image/png", "image/jpg"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {file.content_type}. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Check if model is loaded
        if model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model not loaded"
            )
        
        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Make prediction
        results = model(image)[0]  # Get first result
        logger.info(f"Raw model results: {results}")  # Debug log
        
        # Process results with detailed information
        detections = []
        boxes = results.boxes
        logger.info(f"Number of boxes detected: {len(boxes)}")  # Debug log
        
        for box in boxes:
            try:
                class_id = int(box.cls[0])
                logger.info(f"Processing class_id: {class_id}")  # Debug log
                
                class_name = results.names[class_id]
                logger.info(f"Class name: {class_name}")  # Debug log
                
                confidence = float(box.conf[0])
                logger.info(f"Confidence: {confidence}")  # Debug log
                
                # Skip low confidence detections
                if confidence < 0.5:
                    logger.info(f"Skipping detection due to low confidence: {confidence}")  # Debug log
                    continue
                    
                defect_info = get_defect_info(class_name)
                logger.info(f"Defect info: {defect_info}")  # Debug log
                
                if defect_info:  # Only add if we have info for this class
                    detection = {
                        "class": class_name,
                        "confidence": round(confidence * 100, 2),
                        "bbox": box.xyxy[0].tolist(),
                        "priority": defect_info.priorityLevel,
                        "powerLoss": defect_info.powerLoss,
                        "category": defect_info.category,
                        "stressFactors": defect_info.stressFactors,
                        "description": defect_info.description,
                        "recommendations": defect_info.recommendations
                    }
                    detections.append(detection)
                    logger.info(f"Added detection: {detection}")  # Debug log
                else:
                    logger.warning(f"No defect info found for class: {class_name}")  # Debug log
            except Exception as e:
                logger.error(f"Error processing detection: {str(e)}")
                logger.exception(e)  # This will log the full stack trace
                continue
        
        processing_time = time.time() - start_time
        
        return {
            "status": "success",
            "processing_time": f"{processing_time:.2f}s",
            "detections": detections,
            "total_detections": len(detections)
        }
        
    except Exception as e:
        logger.error(f"Error in detect_defects: {str(e)}")
        logger.exception(e)  # This will log the full stack trace
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "detail": str(e),
                "processing_time": f"{time.time() - start_time:.2f}s"
            }
        )

@app.get("/defect-info/{class_name}")
async def get_defect_details(class_name: str):
    try:
        defect_info = get_defect_info(class_name)
        if defect_info:
            return {
                "className": defect_info.className,
                "stressFactors": defect_info.stressFactors,
                "priorityLevel": defect_info.priorityLevel,
                "powerLoss": defect_info.powerLoss,
                "category": defect_info.category,
                "CoA": defect_info.CoA,
                "description": defect_info.description,
                "recommendations": defect_info.recommendations
            }
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Defect class '{class_name}' not found"
        )
    except Exception as e:
        logger.error(f"Error in get_defect_details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/health")
async def health_check():
    if model is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "detail": "Model not loaded",
                "timestamp": time.time()
            }
        )
    return {
        "status": "healthy",
        "model_loaded": True,
        "timestamp": time.time()
    }
