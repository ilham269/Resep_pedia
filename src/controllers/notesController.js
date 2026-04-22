const db = require("../config/db");

// GET ALL
exports.getNotes = (req, res) => {
  db.query("SELECT * FROM notes", (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

// CREATE
exports.createNote = (req, res) => {
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title wajib diisi" });
  }

  db.query(
    "INSERT INTO notes (title, content) VALUES (?, ?)",
    [title, content || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({
        message: "Note berhasil ditambah",
        id: result.insertId,
      });
    }
  );
};
