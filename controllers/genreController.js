const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { validationResult, body } = require("express-validator");
const debug = require("debug")("genre");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await Genre.find({}).sort({ name: 1 }).exec();
  res.render("genre_list", { title: "Genre list", genres });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books (in parallel)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    // No results.
    debug(`id not found on update: ${req.params.id}`);
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, { title: 1, summary: 1 }).exec(),
  ]);

  // genre with this id exists
  if (genre === null) {
    res.render("/catalog/genres");
    return;
  }

  res.render("genre_delete", {
    title: "Delete Genre",
    genre,
    booksInGenre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, { title: 1, summary: 1 }).exec(),
  ]);

  if (booksInGenre.length > 0) {
    res.render("genre_delete", {
      title: "Delete Genre",
      genre,
      booksInGenre,
    });
    return;
  } else {
    await Genre.deleteOne({ _id: req.body.genreid });
    res.redirect("/catalog/genres");
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    debug(`id not found on update: ${req.params.id}`);
    const error = new Error("genre was not found");
    error.status = 404;
    next(error);
    return;
  }

  res.render("genre_form", { title: "Update Genre", genre });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = await Genre.findById(req.params.id).exec();
    genre.name = req.body.name;
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre,
        errors: errors.array(),
      });
    } else {
      const genreExists = await Genre.findOne({ name: genre.name }).exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];
