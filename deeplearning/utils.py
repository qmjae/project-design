from PIL import Image, ImageDraw
import io

def draw_boxes(image_bytes, detections):
    """Draw bounding boxes on image"""
    image = Image.open(io.BytesIO(image_bytes))
    draw = ImageDraw.Draw(image)
    
    DEFECT_COLORS = {
        'short-circuit': 'red',
        'partial-shading': 'green',
        'dust-deposit': 'blue',
        'bypass-diode': 'orange'
    }
    
    for detection in detections:
        bbox = detection["bbox"]
        class_name = detection["class"]
        confidence = detection["confidence"]
        color = DEFECT_COLORS.get(class_name, 'red')
        
        # Draw bounding box
        draw.rectangle(bbox, outline=color, width=2)
        
        # Draw label with confidence
        label = f"{class_name}: {confidence:.2f}%"
        draw.text((bbox[0], bbox[1]-15), label, fill=color)
    
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return buffered.getvalue()