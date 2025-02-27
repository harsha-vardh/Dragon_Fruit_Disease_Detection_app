from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,  # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
MODEL = tf.keras.models.load_model(r"C:\Users\NAGASAI\OneDrive\Desktop\Hack\trained_model2.keras")

# Define class names
CLASS_NAMES = ["Good fruit","anthracnose", "fruit rot","soft rot","stem canker"]

@app.get("/")
async def home():
    return {"message": "FastAPI Dragon Fruit Disease Detection Running!"}

@app.get("/ping")
async def ping():
    return {"message": "Hello, I am alive"}

# Preprocess the uploaded image
def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((256, 256))  # Resize to match model input
    image = np.array(image) / 255.0  # Normalize pixel values
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        img_batch = np.expand_dims(image, axis=0)  # Expand dimensions for batch processing

        # Model Prediction
        predictions = MODEL.predict(img_batch)
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = np.max(predictions[0])

        return {"class": predicted_class, "confidence": float(confidence)}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
