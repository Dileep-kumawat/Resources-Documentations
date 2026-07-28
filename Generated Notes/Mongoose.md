# Mongoose — Complete Quick Recall Notes

---

# 1. What is Mongoose?

Mongoose is an **ODM (Object Data Modeling)** library for MongoDB in Node.js.

Think:

```text
Node.js App → Mongoose → MongoDB
```

It gives:

* Schemas
* Validation
* Middleware/hooks
* Relationships
* Cleaner queries
* Better structure

Without Mongoose:

* You directly use MongoDB driver.

With Mongoose:

* You get rules + structure + easier coding.

---

# 2. Installation

```bash
npm install mongoose
```

Import:

```js
const mongoose = require("mongoose");
```

Connect:

```js
mongoose.connect("mongodb://127.0.0.1:27017/mydb")
.then(() => console.log("Connected"))
.catch(err => console.log(err));
```

---

# 3. Core Flow (VERY IMPORTANT)

```text
Schema → Model → Document → Collection
```

## Schema

Blueprint/structure.

## Model

Used to interact with DB.

## Document

Single record.

## Collection

MongoDB table equivalent.

---

# 4. Schema

Example:

```js
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  isAdmin: Boolean
});
```

Schema defines:

* fields
* data types
* validation
* defaults
* indexes

---

# 5. Model

```js
const User = mongoose.model("User", userSchema);
```

Mongoose converts:

```text
User → users collection
```

---

# 6. Document

Single data object.

```js
const user = new User({
  name: "Dileep",
  age: 20
});
```

Save:

```js
await user.save();
```

---

# 7. CRUD Operations

# CREATE

```js
await User.create({
  name: "Dileep",
  age: 20
});
```

OR

```js
const user = new User({...});
await user.save();
```

---

# READ

## Find all

```js
const users = await User.find();
```

## Find one

```js
const user = await User.findOne({ name: "Dileep" });
```

## Find by ID

```js
const user = await User.findById(id);
```

---

# UPDATE

## Update one

```js
await User.updateOne(
  { name: "Dileep" },
  { age: 21 }
);
```

## Find and update

```js
await User.findByIdAndUpdate(id, {
  age: 22
});
```

Return updated document:

```js
await User.findByIdAndUpdate(
  id,
  { age: 22 },
  { new: true }
);
```

---

# DELETE

## Delete one

```js
await User.deleteOne({ name: "Dileep" });
```

## Delete by ID

```js
await User.findByIdAndDelete(id);
```

---

# 8. Schema Types

Common types:

```js
String
Number
Boolean
Date
Array
ObjectId
Buffer
Mixed
Map
Decimal128
```

Example:

```js
age: Number
```

---

# 9. Validation

Very important in interviews.

Example:

```js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  age: {
    type: Number,
    min: 18
  }
});
```

---

# Built-in Validators

| Validator | Meaning               |
| --------- | --------------------- |
| required  | field mandatory       |
| minlength | minimum string length |
| maxlength | maximum length        |
| min       | minimum number        |
| max       | maximum number        |
| enum      | allowed values        |
| match     | regex validation      |

---

# Custom Validation

```js
email: {
  type: String,
  validate: {
    validator: function(v) {
      return v.includes("@");
    },
    message: "Invalid email"
  }
}
```

---

# 10. Default Values

```js
isAdmin: {
  type: Boolean,
  default: false
}
```

---

# 11. Unique Fields

```js
email: {
  type: String,
  unique: true
}
```

Used mostly for:

* email
* username

---

# 12. Timestamps

```js
const schema = new mongoose.Schema(
  {...},
  { timestamps: true }
);
```

Automatically adds:

```js
createdAt
updatedAt
```

---

# 13. Middleware / Hooks

Runs before or after operations.

Two types:

* pre()
* post()

---

# Pre Hook

```js
userSchema.pre("save", function(next) {
  console.log("Before save");
  next();
});
```

---

# Post Hook

```js
userSchema.post("save", function(doc) {
  console.log("After save");
});
```

---

# Real-world Use

Most common:

* password hashing
* logging
* cleanup

---

# 14. Instance Methods

Methods available on document.

```js
userSchema.methods.sayHello = function() {
  return `Hello ${this.name}`;
};
```

Usage:

```js
const user = await User.findById(id);

user.sayHello();
```

---

# 15. Static Methods

Methods available on model.

```js
userSchema.statics.findAdults = function() {
  return this.find({ age: { $gte: 18 } });
};
```

Usage:

```js
User.findAdults();
```

---

# 16. Query Helpers

## Filtering

```js
User.find({ age: 20 });
```

---

# Comparison Operators

| Operator | Meaning               |
| -------- | --------------------- |
| $gt      | greater than          |
| $lt      | less than             |
| $gte     | greater or equal      |
| $lte     | less or equal         |
| $in      | value exists in array |

Example:

```js
User.find({
  age: { $gte: 18 }
});
```

---

# Sorting

```js
User.find().sort({ age: -1 });
```

```text
1  → ascending
-1 → descending
```

---

# Limit

```js
User.find().limit(5);
```

---

# Skip (Pagination)

```js
User.find().skip(10);
```

---

# Select Fields

```js
User.find().select("name email");
```

Exclude:

```js
User.find().select("-password");
```

---

# 17. Virtuals

Computed fields NOT stored in DB.

```js
userSchema.virtual("fullName").get(function() {
  return this.firstName + " " + this.lastName;
});
```

---

# 18. Relationships

MongoDB uses references.

Example:

```js
posts: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Post"
}]
```

---

# 19. Populate

Equivalent of JOIN.

```js
const user = await User.findById(id)
.populate("posts");
```

Instead of IDs:

```js
posts: [ObjectId]
```

You get:

```js
posts: [{ full post data }]
```

---

# 20. Lean Queries

Very important for performance.

```js
User.find().lean();
```

Returns:

* plain JS objects
* faster queries

No:

* methods
* virtuals
* save()

---

# 21. Indexing

Improves query speed.

```js
userSchema.index({ email: 1 });
```

---

# Compound Index

```js
userSchema.index({
  firstName: 1,
  lastName: 1
});
```

---

# 22. Aggregation

Used for advanced data processing.

```js
User.aggregate([
  {
    $match: { age: { $gte: 18 } }
  },
  {
    $group: {
      _id: "$age",
      total: { $sum: 1 }
    }
  }
]);
```

---

# Common Aggregation Operators

| Operator | Use              |
| -------- | ---------------- |
| $match   | filter           |
| $group   | group data       |
| $sort    | sort             |
| $project | select fields    |
| $lookup  | join collections |

---

# 23. Transactions

Used for atomic operations.

```js
const session = await mongoose.startSession();

session.startTransaction();
```

Useful in:

* banking
* payments
* balance updates

---

# 24. Schema Options

```js
new mongoose.Schema({}, {
  timestamps: true,
  strict: true,
  versionKey: false
});
```

---

# Important Options

| Option     | Meaning                    |
| ---------- | -------------------------- |
| timestamps | adds createdAt & updatedAt |
| strict     | only schema fields allowed |
| versionKey | removes __v                |

---

# 25. Enums

```js
role: {
  type: String,
  enum: ["user", "admin"]
}
```

---

# 26. Arrays

```js
skills: [String]
```

Array of objects:

```js
skills: [{
  name: String,
  level: Number
}]
```

---

# 27. Embedded Documents

```js
address: {
  city: String,
  pincode: Number
}
```

---

# 28. References vs Embedded

# Embedded

Store inside same document.

Good:

* small data
* tightly related

---

# References

Store ObjectId.

Good:

* large data
* reusable data

---

# 29. Mongoose Lifecycle

```text
Create Schema
↓
Create Model
↓
Create Document
↓
Save to MongoDB
↓
Query / Update / Delete
```

---

# 30. Common Interview Questions

## Difference between Schema and Model?

Schema:

* structure

Model:

* interacts with DB

---

## Difference between find() and findOne()?

find():

* returns array

findOne():

* returns single object

---

## What is populate()?

Fetches referenced documents.

---

## What is lean()?

Returns plain JS object for better performance.

---

## What are hooks?

Functions running before/after DB operations.

---

# 31. Most Important Real-world Patterns

# User Authentication

```js
pre("save") → hash password
```

---

# Blog App

```js
User ↔ Posts relationship
populate()
```

---

# Ecommerce

```js
Orders
Products
Transactions
```

---

# 32. High-value Memory Map

```text
Schema = Structure
Model = DB operations
Document = Single record
Collection = MongoDB table

create()
find()
update()
delete()

Validation
Hooks
Populate
Virtuals
Indexes
Aggregation
Transactions
```

---

# 33. Biggest Mistakes Beginners Make

## Mistake 1

Using Mongoose without understanding MongoDB basics.

---

## Mistake 2

Overusing populate().

It becomes slow.

---

## Mistake 3

No indexes on frequently queried fields.

Leads to terrible performance.

---

## Mistake 4

Using embedded docs for huge datasets.

Document size explodes.

---

## Mistake 5

Ignoring lean() in read-heavy APIs.

Wastes memory.

---

# 34. Fast Revision (1-Minute Recall)

```text
Mongoose = ODM for MongoDB

Core:
Schema → Model → Document

CRUD:
create
find
update
delete

Features:
Validation
Hooks
Populate
Virtuals
Indexes
Aggregation
Transactions

Performance:
lean()
indexes

Relations:
ObjectId + ref + populate
```

---

# 35. Golden Rule

Mongoose is not just about storing data.

Its real purpose is:

```text
Enforcing structure + validation + scalable architecture
```

That’s what most beginners completely miss.
