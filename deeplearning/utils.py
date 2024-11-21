from PIL import Image, ImageDraw
import io

def draw_boxes(image_bytes, detections):
    """Draw bounding boxes on image"""
    image = Image.open(io.BytesIO(image_bytes))
    draw = ImageDraw.Draw(image)
    
    for detection in detections:
        bbox = detection["bbox"]
        label = f"{detection['class']}: {detection['confidence']:.2f}"
        
        draw.rectangle(bbox, outline="red", width=2)
        draw.text((bbox[0], bbox[1]-15), label, fill="red")
    
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return buffered.getvalue()