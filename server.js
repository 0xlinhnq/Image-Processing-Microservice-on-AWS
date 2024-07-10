import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js";

// Init the Express application
const app = express();
const port = process.env.PORT || 8082;

app.use(bodyParser.json());

app.get("/filteredimage", async (req, res) => {
  const { image_url } = req.query;
  if (!image_url) {
    return res.status(400).send({ message: "url image is required" });
  }

  try {
    const pathFilter = await filterImageFromURL(image_url);

    // Send the resulting file in the response
    res.status(200).sendFile(pathFilter, (err) => {
      if (err) {
        return res.status(500).send({ message: "Error processing the images" });
      }

      // Delete any files on the server on finish of the response
      deleteLocalFiles([pathFilter])
        .then(() => {
          console.log("Files deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting files:", error);
        });
    });
  } catch (error) {
    return res.status(500).send({ message: "Image processing failed" });
  }
});

app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
