import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress, Typography, Button, Card, CardContent, CardMedia, Container } from "@material-ui/core";
import { DropzoneArea } from "material-ui-dropzone";
import ClearIcon from "@material-ui/icons/Clear";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/predict";

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [componentKey, setComponentKey] = useState(0);

  const sendFile = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Backend Response:", res.data);
      setData(res.data);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Error processing image. Ensure the backend is running.");
    }

    setIsLoading(false);
  };

  const onSelectFile = (files) => {
    if (!files || files.length === 0) return;
    setSelectedFile(files[0]);
    setData(null);
    setPreview(URL.createObjectURL(files[0]));
  };

  const clearData = () => {
    setSelectedFile(null);
    setPreview(null);
    setData(null);
    setIsLoading(false);
    setComponentKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (preview) sendFile();
  }, [preview]);

  return (
    <Container
      style={{
        textAlign: "center", 
        padding: "2em", 
        minHeight: "100vh", 
        background: `url("/bgimage.png") no-repeat center center/cover`,
      }}
    >
      <Typography variant="h4" style={{ fontWeight: "bold", color: "#EE1AA7", marginBottom: "20px" }}>
        Runtime Terror - Dragon Fruit Disease Detection
      </Typography>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="body1"
          style={{ maxWidth: "30%", textAlign: "justify", color: "#ffff" }}
        >
          Dragon fruit crops are susceptible to several diseases, including bacterial soft rot, anthracnose,
          and stem canker. These diseases can significantly impact fruit quality and yield, making timely
          detection crucial for farmers.
        </Typography>

        <Card
          style={{
            maxWidth: 450,
            margin: "auto",
            padding: "1.5em",
            backgroundColor: "rgba(104, 164, 113, 0.56)",
            boxShadow: "8px 8px 16px rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
          }}
        >
          {!preview ? (
            <CardContent>
              <Typography variant="h5" style={{ marginBottom: "10px", fontWeight: "bold", color: "#EE1AA7" }}>
                Upload an Image
              </Typography>
              <DropzoneArea
                key={componentKey}
                acceptedFiles={["image/*"]}
                dropzoneText="Drag & Drop an image or Click to Upload"
                onChange={onSelectFile}
                filesLimit={1}
                showAlerts={false}
              />
            </CardContent>
          ) : (
            <CardMedia component="img" height="300" image={preview} style={{ borderRadius: "8px" }} />
          )}

          {isLoading && <CircularProgress style={{ margin: "10px" }} />}

          {data && (
            <CardContent>
              <Typography variant="h6" style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                Prediction: {data.class}
              </Typography>
              <Typography variant="body1" style={{ color: "#FFFFFF" }}>
                Confidence: {(data.confidence * 100).toFixed(2)}%
              </Typography>
            </CardContent>
          )}

          {preview && (
            <Button
              variant="contained"
              color="secondary"
              onClick={clearData}
              startIcon={<ClearIcon />}
              style={{ marginTop: "10px", backgroundColor: "#d32f2f", color: "#fff", fontWeight: "bold" }}
            >
              Clear
            </Button>
          )}
        </Card>

        <Typography
          variant="body1"
          style={{ maxWidth: "30%", textAlign: "justify", color: "#ffff" }}
        >
          By leveraging machine learning, this tool helps farmers quickly identify infections, enabling
          early intervention. Preventing disease spread can improve crop health, increase yield, and
          minimize financial losses.
        </Typography>
      </div>
    </Container>
  );
};
