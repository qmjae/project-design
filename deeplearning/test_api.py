import requests

def test_detection():
    # URL of your FastAPI server
    url = "http://localhost:8000/detect/"
    
    # Image file to test
    image_path = "test_images/solar_color76_jpg.rf.fc43185c743c6970cf49c84efdbf8ae8.jpg"
    
    # Prepare the file
    files = {
        'file': ('image.jpg', open(image_path, 'rb'), 'image/jpeg')
    }
    
    # Make request
    response = requests.post(url, files=files)
    
    # Print results
    print(response.json())

if __name__ == "__main__":
    test_detection()