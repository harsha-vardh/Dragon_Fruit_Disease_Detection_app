from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

# Initialize FastAPI App
app = FastAPI()

# CORS Setup (Allow React Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
MODEL = tf.keras.models.load_model("path_to_your_model")

# Define class names
CLASS_NAMES = ["Good fruit", "soft rot", "fruit rot", "anthracnose", "stem canker"]

@app.get("/")
async def home():
    return {"message": "FastAPI Dragon Fruit Disease Detection Running!"}

@app.get("/ping")
async def ping():
    return {"message": "Hello, I am alive"}

# Function to preprocess uploaded image
def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((256, 256))  # Resize to match model input
    image = np.array(image) / 255.0  # Normalize pixel values
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        img_batch = np.expand_dims(image, axis=0)  # Add batch dimension

        # Model Prediction
        predictions = MODEL.predict(img_batch)
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = np.max(predictions[0])

        return {"class": predicted_class, "confidence": float(confidence)}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
    
