import json
import torch
from ultralytics import YOLO
from PIL import Image
import io

def model_fn(model_dir):
    """Load the YOLOv8 model"""
    model = YOLO(f"{model_dir}/yolov8-solar.pt")
    return model

def input_fn(request_body, request_content_type):
    """Convert request input to image"""
    if request_content_type == 'image/jpeg' or request_content_type == 'image/png' or request_content_type == 'image/jpg':
        image = Image.open(io.BytesIO(request_body))
        return image
    else:
        raise ValueError(f"Unsupported content type: {request_content_type}")

def predict_fn(input_object, model):
    """Make prediction using model"""
    results = model(input_object)
    return results

def output_fn(prediction_output, accept):
    """Convert prediction output to response"""
    if accept == 'application/json':
        detections = []
        
        for result in prediction_output:
            boxes = result.boxes
            for box in boxes:
                detection = {
                    "class": result.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": box.xyxy[0].tolist()
                }
                detections.append(detection)
        
        return json.dumps({
            "status": "success",
            "detections": detections
        })
    raise ValueError(f"Unsupported accept type: {accept}")