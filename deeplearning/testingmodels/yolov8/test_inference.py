import os
from PIL import Image
import json
from deeplearning.testingmodels.yolov8.inference import model_fn, input_fn, predict_fn, output_fn

def test_inference():
    try:
        # 1. Set up test paths
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = current_dir  # or specify your model directory
        test_image_path = os.path.join(current_dir, "test_images", "solar_color76_jpg.rf.fc43185c743c6970cf49c84efdbf8ae8.jpg")  # adjust path as needed
        
        print("Testing inference pipeline...")
        
        # 2. Load model
        print("Loading model...")
        model = model_fn(model_dir)
        print("Model loaded successfully")
        
        # 3. Load and prepare test image
        print("Loading test image...")
        with open(test_image_path, 'rb') as f:
            image_bytes = f.read()
        
        # 4. Test input function
        print("Testing input processing...")
        processed_image = input_fn(image_bytes, 'image/jpeg')
        print("Image processed successfully")
        
        # 5. Make prediction
        print("Making prediction...")
        results = predict_fn(processed_image, model)
        print("Prediction completed")
        
        # 6. Process output
        print("Processing output...")
        final_output = output_fn(results, 'application/json')
        print("\nResults:")
        print(json.dumps(json.loads(final_output), indent=2))
        
        return True
        
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        return False

if __name__ == "__main__":
    test_inference()