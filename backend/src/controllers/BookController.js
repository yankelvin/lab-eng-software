const Book = require("../models/Book");
const Ajv = require("ajv");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

module.exports = {
  async store(req, res) {
    const { name, author, publisher, yearPublication, area, purchaseDate, pricePaid } = req.body;
    const ajv = new Ajv({ allErrors: true });

    var schema = {
      properties: {
        name: { type: "string", maxLength: 50, minLength: 5 },
        author: { type: "string", maxLength: 50, minLength: 5 },
        image: { type: "string" },
        publisher: { type: "string", maxLength: 50, minLength: 5 },
        yearPublication: { type: "string" },
        area: { type: "string", maxLength: 20, minLength: 5 },
        purchaseDate: { type: "string" },
        pricePaid: { type: "string" }
      }
    };

    var validate = ajv.compile(schema);

    // Validações
    if (!validate(req.body)) {
      return res.json({
        400: `O pedido não pôde ser entregue devido à sintaxe incorreta. ${ajv.errorsText(
          validate.errors
        )}`
      });
    }

    const bookExists = await Book.findOne({ name: name });

    if (bookExists) {
      return res.status(400).json({ error: `${name} already exists` });
    }

    const { filename: image } = req.file;
    const [imageName] = image.split(".");
    const fileName = `${imageName}.jpg`;

    await sharp(req.file.path)
      .resize(50, 50)
      .png({ quality: 100 })
      .toFile(path.resolve(req.file.destination, "resized", fileName));

    fs.unlinkSync(req.file.path);

    const book = await Book.create({
      name,
      author,
      publisher,
      yearPublication,
      image: fileName,
      area,
      purchaseDate,
      pricePaid
    });

    return res.json({ book });
  },
  async index(req, res) {
    if (req.body) {
      const books = await Book.find(req.body);

      try {
        const books = await Book.find(req.body);
        if (books.length) {
          return res.json(books);
        } else {
          return res
            .status(404)
            .json({ "Requisição inválida": `${JSON.stringify(req.body)} not found` });
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        //return res.json({ 400: `Requisição invalida ${req.body}` });
      }
    }
    const books = await Book.find().sort("-createdAt");
    return res.json({ 200: books });
  },
  async update(req, res) {
    const book = await Book.findByIdAndUpdate(req.body._id, req.body);
    if (!book) {
      return res.json({ 404: `${req.body._id} not found` });
    }
    return res.json({ 200: book });
  },
  async delete(req, res) {
    if (req.body._id) {
      return res.json({ 200: await Book.findByIdAndDelete(req.body._id) });
    }
    return res.json({ 400: "id is missing" });
  }
};
