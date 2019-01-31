const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

mongoose.connect(
  "mongodb://localhost/online-shop",
  { useNewUrlParser: true }
);

// MODEL DEFINITION
const Department = mongoose.model("Department", {
  title: String
});

const Category = mongoose.model("Category", {
  title: String,
  description: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  }
});

const Product = mongoose.model("Product", {
  title: String,
  description: String,
  price: Number,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }
});
//
//
//
// ROUTES For Department
//
//
app.post("/department/create", async (req, res) => {
  try {
    const existingDepartement = await Department.findOne({
      title: new RegExp(req.body.title, "i")
    });
    if (existingDepartement === null) {
      const department = new Department({
        title: req.body.title
      });
      await department.save();
      return res.status(201).json({ message: "Department created." });
    } else {
      return res.status(400).json({
        error: {
          message: "Department already exists"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

app.get("/department", async (req, res) => {
  try {
    const departments = await Department.find().sort({ title: 1 });
    return res.json(departments);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

app.post("/department/update", async (req, res) => {
  try {
    const existingDepartement = await Department.findById(req.query.id);
    if (existingDepartement !== null) {
      existingDepartement.title = req.body.title;
      await existingDepartement.save();
      return res.status(202).json({ message: "Department title updated." });
    } else {
      return res.status(400).json({
        error: {
          message: "Department id does not exist"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

app.post("/department/delete", async (req, res) => {
  try {
    const existingDepartement = await Department.findById(req.query.id);
    if (existingDepartement !== null) {
      await existingDepartement.remove();
      return res.json({ message: "Department deleted." });
    } else {
      return res.status(400).json({
        error: {
          message: "Department id does not exist"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});
//
//
//
// ROUTES For Category
//
//
app.post("/category/create", async (req, res) => {
  try {
    const existingDepartement = await Department.findById(req.body.department);
    if (existingDepartement !== null) {
      const category = new Category({
        title: req.body.title,
        description: req.body.description,
        department: existingDepartement
      });
      await category.save();
      return res.json({ message: "Category created." });
    } else {
      return res.status(400).json({
        error: {
          message: "Department id does not exist"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

app.get("/category", async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ title: 1 })
      .populate("department");
    return res.json(categories);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

app.post("/category/update", async (req, res) => {
  try {
    const existingCategory = await Category.findById(req.query.id);
    if (existingCategory !== null) {
      if (existingCategory.department !== req.body.department) {
        const existingDepartment = await Department.findById(
          req.body.department
        );
        if (existingDepartment !== null) {
          existingCategory.department = existingDepartment;
        } else {
          return res.status(400).json({
            error: {
              message: "Update Category failed. Department id does not exist"
            }
          });
        }
      }
      existingCategory.title = req.body.title;
      existingCategory.description = req.body.description;
      await existingCategory.save();
      return res.json({ message: "Category updated." });
    } else {
      return res.status(400).json({
        error: {
          message: "Category id does not exist"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

app.post("/category/delete", async (req, res) => {
  try {
    const existingCategory = await Category.findById(req.query.id);
    if (existingCategory !== null) {
      await existingCategory.remove();
      return res.json({ message: "Category deleted." });
    } else {
      return res.status(400).json({
        error: {
          message: "Category id does not exist"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});
//
//
//
// ROUTES For Product
//
//
app.post("/product/create", async (req, res) => {
  try {
    const existingCategory = await Category.findById(req.body.category);
    if (existingCategory !== null) {
      const product = new Product({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: existingCategory
      });
      await product.save();
      return res.json({ message: "Product created." });
    } else {
      return res.status(400).json({
        error: {
          message: "Failed to create product: Category id does not exist"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

app.get("/product", async (req, res) => {
  try {
    let filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.title) {
      filter.title = new RegExp("^" + req.query.title + ".*$", "i");
    }
    // !!! filter.price = {}; Ne marche pas car price:{} plante le filtre
    if (req.query.priceMin) {
      filter.price = {};
      filter.price["$gt"] = req.query.priceMin;
    }
    if (req.query.priceMax) {
      if (filter.price === undefined) {
        filter.price = {};
      }
      filter.price["$lt"] = req.query.priceMax;
    }
    console.log("Filter: ", filter);
    const search = Product.find(filter)
      .populate("category")
      .populate({
        path: "category",
        populate: { path: "department", model: "Department" }
      });

    if (req.query.sort === "price-asc") {
      search.sort({ price: 1 });
    } else if (req.query.sort === "price-desc") {
      search.sort({ price: -1 });
    }
    const queryResults = await search;
    return res.json(queryResults);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

app.post("/product/update", async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.query.id);
    if (existingProduct !== null) {
      if (existingProduct.category !== req.body.category) {
        const existingCategory = await Category.findById(req.body.category);
        if (existingCategory !== null) {
          existingProduct.category = existingCategory;
        } else {
          return res.status(400).json({
            error: {
              message: "Updating product failed. Category id does not exist"
            }
          });
        }
      }
      existingProduct.title = req.body.title;
      existingProduct.description = req.body.description;
      existingProduct.price = req.body.price;
      await existingProduct.save();
      return res.json({ message: "Product updated." });
    } else {
      return res.status(400).json({
        error: {
          message: "Product id does not exist"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});
//
//
//
// Route ROOT and others...
app.get("/", (req, res) => {
  console.log("Hello world");
  res.json({ message: "Welcome to Online Shop" });
});

app.all("*", function(req, res) {
  sendError(res, "Page not found!", 404);
});

app.listen(3000, () => {
  console.log("<o>-]*>*]*>*- Online Shop Server started... -*<*[*<*[-<o>");
});

/* First ver
filter.price = {};
if (req.query.priceMin) {
  filter.price = { $gt: req.query.priceMin };
}
if (req.query.priceMax) {
   if (filter.price) {
    filter.price["$lt"] = req.query.priceMax;
   } else {
     filter.price = { $lt: req.query.priceMax };
}
*/
