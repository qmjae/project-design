# Adlaw Mobile Application
<p align="center">
  <img src="assets/adlaw-v2.png" />
</p>

This is a mobile application for our design project called "Design of Defective Module Detection for Solar  Panel Thermography Analysis System using Deep Learning". 

The general objective of the project is to design a defective module detection for  solar panel thermography analysis that fulfills the client's requirements while adhering to engineering standards and considering various constraints including economic, sustainability, environmental, safety, risk, public health, welfare, social, global, and cultural factors along with computation of trade-offs from multiple realistic constraints.

Specifically, it aims to:
1. Design a prototype that captures thermal images namely single cell, partial shading effect, open-circuited PV module, short-circuited PV module, and bypass diode failure.
2. Develop a mobile application that:
- Accepts user input from the system prototype, specifically thermal images of monocrystalline silicon solar panels.
- Alerts users about detected defects and their severity levels.
- Displays detailed information about the detected defects including: stress factors, power loss, category, classes of abnormalities and description based on IEC 62446-1, 2 and 3.
- Recommends corrective actions based on defect history.
3. Test and evaluate the accuracy of the prototype.


This application is built using FastAPI and Ultralytics YOLOv8. Using Appwrite as the backend service and React Native for the mobile application.


To install the dependencies, run the following command:
```
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# For development only
pip install -r requirements.txt[dev]
```
