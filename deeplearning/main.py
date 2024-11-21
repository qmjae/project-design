from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
from defect_classes import get_defect_info, get_recommendations, get_priority_level

app = FastAPI()

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
    model = YOLO("model/yolov8-solar.pt", task='detect')
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.get("/")
def read_root():
    return {"message": "Solar Panel Defect Detection API"}

@app.post("/detect/")
async def detect_defects(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    try:
        # Validate file
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(400, detail=f"Invalid file type: {file.content_type}")
        
        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Make prediction
        results = model(image)
        
        # Process results with detailed information
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                try:
                    class_name = result.names[int(box.cls[0])]
                    defect_info = get_defect_info(class_name)
                    
                    if defect_info:  # Only add if we have info for this class
                        detection = {
                            "class": class_name,
                            "confidence": float(box.conf[0]),
                            "bbox": box.xyxy[0].tolist(),
                            "priority": defect_info.priorityLevel,
                            "powerLoss": defect_info.powerLoss,
                            "category": defect_info.category,
                            "stressFactors": defect_info.stressFactors,
                            "description": defect_info.description,
                            "recommendations": defect_info.recommendations
                        }
                        detections.append(detection)
                except Exception as e:
                    print(f"Error processing detection: {e}")
                    continue
        
        return {
            "status": "success",
            "detections": detections
        }
        
    except Exception as e:
        print(f"Error in detect_defects: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/defect-info/{class_name}")
async def get_defect_details(class_name: str):
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
    raise HTTPException(status_code=404, detail="Defect class not found")

# Add health check endpoint
@app.get("/health")
async def health_check():
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    return {"status": "healthy", "model_loaded": True}