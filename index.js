const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(cors());

const fileName = "repertorio.json";

app.listen(3000, () => {
  console.log("¡Servidor encendido!");
  if (!fs.existsSync(fileName)) fs.writeFileSync(fileName, JSON.stringify([]));
});

app.post("/canciones", (req, res) => {
  const { id, titulo, artista, tono } = req.body;
  if (!id || !titulo || !artista || !tono)
    return res.status(400).json({
      message: "Debes ingresar el nombre de la canción, el artista y el tono.",
    });
  const newSong = { id, titulo, artista, tono };
  const songList = JSON.parse(fs.readFileSync(fileName, "utf8"));
  if (songList.find((song) => song.titulo === titulo)) {
    return res.status(400).json({ message: `La canción ${titulo} ya existe.` });
  }
  if (songList.length > 0) newSong.id = songList[songList.length - 1].id + 1;
  songList.push(newSong);
  fs.writeFileSync(fileName, JSON.stringify(songList));
  return res.status(201).json({ message: "Canción creada", song: newSong });
});

app.get("/canciones", (req, res) => {
  const readFile = JSON.parse(fs.readFileSync(fileName, "utf8"));
  return res.status(200).json(readFile);
});

app.put("/canciones/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, artista, tono } = req.body;
  if (!id)
    return res
      .status(400)
      .json({ message: "Debes ingresar el ID de la canción a modificar." });
  if (!titulo && !artista && !tono)
    return res.status(400).json({
      message: "Debes ingresar al menos un campo a modificar.",
    });

  const songList = JSON.parse(fs.readFileSync(fileName, "utf8"));

  const foundSong = songList.findIndex((song) => song.id === parseInt(id));

  if (foundSong === -1)
    return res
      .status(404)
      .json({ message: `No se encontró la canción con ID: ${id}` });

  songList[foundSong] = { ...songList[foundSong], titulo, artista, tono };

  fs.writeFileSync(fileName, JSON.stringify(songList));

  return res.status(200).json({
    message: `Canción con ID: ${id} actualizada.`,
    song: songList[foundSong],
  });
});

app.delete("/canciones/:id", (req, res) => {
  const { id } = req.params;
  if (!id)
    return res
      .status(400)
      .json({ message: "Debes ingresar el ID de la canción a eliminar." });
  const songList = JSON.parse(fs.readFileSync(fileName, "utf8"));

  const foundSong = songList.findIndex((song) => song.id === parseInt(id));

  songList.splice(foundSong, 1);

  fs.writeFileSync(fileName, JSON.stringify(songList));

  if (foundSong === -1)
    return res
      .status(404)
      .json({ message: `No se encontró la canción con ID: ${id}` });
  return res.status(200).json({
    message: `Canción con ID: ${id} eliminada.`,
  });
});
