# MongoDB — Complete Recall Notes

Official Docs: [MongoDB Documentation](https://www.mongodb.com/docs/?utm_source=chatgpt.com)

---

# 1. What is MongoDB?

MongoDB is a **NoSQL document database**.

Instead of storing data in rows & tables like SQL databases, it stores data as:

* **Collections** → like tables
* **Documents** → like rows
* Documents are stored in **BSON** (Binary JSON)

Example document:

```json
{
  "name": "Dileep",
  "age": 20,
  "skills": ["Java", "MongoDB"]
}
```

---

# 2. SQL vs MongoDB

| SQL          | MongoDB                    |
| ------------ | -------------------------- |
| Database     | Database                   |
| Table        | Collection                 |
| Row          | Document                   |
| Column       | Field                      |
| JOIN         | Embedded Docs / References |
| Schema Fixed | Schema Flexible            |

---

# 3. Why MongoDB?

## Advantages

* Flexible schema
* Fast development
* Handles huge data easily
* JSON-like structure
* Easy scaling
* Good for real-time apps

## Used In

* Social media
* Chat apps
* Analytics
* IoT
* E-commerce

---

# 4. Important Terminology

| Term       | Meaning                   |
| ---------- | ------------------------- |
| Database   | Container for collections |
| Collection | Group of documents        |
| Document   | JSON-like data            |
| Field      | Key-value pair            |
| BSON       | Binary JSON               |
| `_id`      | Unique identifier         |

Example:

```json
{
  "_id": ObjectId("123"),
  "name": "Ram"
}
```

---

# 5. MongoDB Architecture

```text
Database
   └── Collection
          └── Document
```

Example:

```text
CollegeDB
   └── Students
          └── {name:"Dileep", age:20}
```

---

# 6. Installing & Starting MongoDB

## Start MongoDB Server

```bash
mongod
```

## Open Mongo Shell

```bash
mongosh
```

---

# 7. Database Commands

## Show databases

```js
show dbs
```

## Create/use database

```js
use college
```

## Current database

```js
db
```

## Delete database

```js
db.dropDatabase()
```

---

# 8. Collection Commands

## Create collection

```js
db.createCollection("students")
```

## Show collections

```js
show collections
```

## Delete collection

```js
db.students.drop()
```

---

# 9. CRUD Operations (MOST IMPORTANT)

CRUD = Create Read Update Delete

---

# CREATE

## Insert one document

```js
db.students.insertOne({
  name: "Dileep",
  age: 20
})
```

## Insert many

```js
db.students.insertMany([
  {name:"Ram"},
  {name:"Sam"}
])
```

---

# READ

## Find all

```js
db.students.find()
```

## Pretty format

```js
db.students.find().pretty()
```

## Find one

```js
db.students.findOne({name:"Dileep"})
```

## Condition query

```js
db.students.find({age:20})
```

---

# UPDATE

## Update one

```js
db.students.updateOne(
  {name:"Dileep"},
  {$set:{age:21}}
)
```

## Update many

```js
db.students.updateMany(
  {},
  {$set:{status:"active"}}
)
```

---

# DELETE

## Delete one

```js
db.students.deleteOne({name:"Ram"})
```

## Delete many

```js
db.students.deleteMany({age:20})
```

---

# 10. Query Operators

---

## Comparison Operators

| Operator | Meaning            |
| -------- | ------------------ |
| `$eq`    | Equal              |
| `$ne`    | Not equal          |
| `$gt`    | Greater than       |
| `$gte`   | Greater than equal |
| `$lt`    | Less than          |
| `$lte`   | Less than equal    |
| `$in`    | Match values       |
| `$nin`   | Not in             |

Example:

```js
db.students.find({age:{$gt:18}})
```

---

## Logical Operators

| Operator | Meaning |
| -------- | ------- |
| `$and`   | AND     |
| `$or`    | OR      |
| `$not`   | NOT     |

Example:

```js
db.students.find({
  $or:[
    {age:20},
    {name:"Ram"}
  ]
})
```

---

# 11. Projection

Used to show selected fields.

```js
db.students.find(
  {},
  {name:1, age:1}
)
```

Hide `_id`

```js
db.students.find(
  {},
  {_id:0, name:1}
)
```

---

# 12. Sorting & Limiting

## Sort

```js
db.students.find().sort({age:1})
```

* `1` → ascending
* `-1` → descending

## Limit

```js
db.students.find().limit(5)
```

## Skip

```js
db.students.find().skip(5)
```

---

# 13. Arrays in MongoDB

Document:

```json
{
  "name":"Dileep",
  "skills":["Java","MongoDB"]
}
```

## Query array

```js
db.students.find({skills:"Java"})
```

## Push into array

```js
db.students.updateOne(
  {name:"Dileep"},
  {$push:{skills:"NodeJS"}}
)
```

---

# 14. Embedded Documents

```json
{
  "name":"Dileep",
  "address":{
    "city":"Vizag",
    "pin":530001
  }
}
```

Query:

```js
db.students.find({"address.city":"Vizag"})
```

---

# 15. Indexing (VERY IMPORTANT)

Indexes improve search speed.

## Create index

```js
db.students.createIndex({name:1})
```

## Show indexes

```js
db.students.getIndexes()
```

## Drop index

```js
db.students.dropIndex({name:1})
```

---

# 16. Aggregation Framework

Used for data processing.

Pipeline stages:

| Stage      | Purpose       |
| ---------- | ------------- |
| `$match`   | Filter        |
| `$group`   | Group data    |
| `$sort`    | Sort          |
| `$limit`   | Limit         |
| `$project` | Select fields |

Example:

```js
db.students.aggregate([
  {$match:{age:20}},
  {$group:{_id:"$age", total:{$sum:1}}}
])
```

---

# 17. Relationships in MongoDB

Two approaches:

## 1. Embedding

Store inside same document.

```json
{
  "name":"Dileep",
  "marks":[90,95]
}
```

### Best for:

* Small related data
* Fast reads

---

## 2. Referencing

Store document IDs.

```json
{
  "student":"id123"
}
```

### Best for:

* Large data
* Reusable relations

---

# 18. Schema Validation

MongoDB is schema flexible, but validation can be added.

Example:

```js
db.createCollection("students", {
 validator:{
   $jsonSchema:{
     bsonType:"object",
     required:["name","age"]
   }
 }
})
```

---

# 19. MongoDB Data Types

| Type     | Example          |
| -------- | ---------------- |
| String   | `"Dileep"`       |
| Integer  | `20`             |
| Boolean  | `true`           |
| Array    | `[1,2]`          |
| Object   | `{city:"Vizag"}` |
| Null     | `null`           |
| Date     | `new Date()`     |
| ObjectId | Unique id        |

---

# 20. Replication

Replication = multiple copies of data.

## Purpose

* Backup
* High availability
* Fault tolerance

### Structure

```text
Primary
   ↓
Secondary
```

Primary handles writes.

---

# 21. Sharding

Sharding = splitting data across servers.

Used for:

* Big data
* Horizontal scaling

Components:

| Component     | Role            |
| ------------- | --------------- |
| Shard         | Stores data     |
| Config Server | Metadata        |
| Query Router  | Routes requests |

---

# 22. Transactions

MongoDB supports ACID transactions.

Example:

```js
session.startTransaction()
```

Used when multiple operations must succeed together.

---

# 23. Authentication & Security

## Create user

```js
db.createUser({
  user:"admin",
  pwd:"123",
  roles:["readWrite"]
})
```

Security practices:

* Enable auth
* Use strong passwords
* Use role-based access
* Enable encryption

---

# 24. Backup & Restore

## Backup

```bash
mongodump
```

## Restore

```bash
mongorestore
```

---

# 25. MongoDB Compass

GUI tool for MongoDB.

Features:

* Visual database management
* Query builder
* Performance monitoring

Download: [MongoDB Compass](https://www.mongodb.com/products/tools/compass?utm_source=chatgpt.com)

---

# 26. Mongoose (Node.js ODM)

Official Site: [Mongoose ODM](https://mongoosejs.com/?utm_source=chatgpt.com)

Mongoose helps Node.js interact with MongoDB.

Example:

```js
const userSchema = new mongoose.Schema({
  name:String,
  age:Number
})
```

---

# 27. Important Interview Questions

## Q1. Difference between SQL and MongoDB?

* SQL → relational
* MongoDB → document-based NoSQL

---

## Q2. What is BSON?

Binary version of JSON used internally by MongoDB.

---

## Q3. What is indexing?

Data structure that improves query speed.

---

## Q4. Embedding vs Referencing?

Embedding → nested data
Referencing → linked documents

---

## Q5. What is aggregation?

Framework for processing & analyzing data.

---

# 28. Frequently Used Commands (Rapid Revision)

```js
show dbs
use college

show collections

db.students.insertOne({})
db.students.find()
db.students.findOne()

db.students.updateOne()
db.students.deleteOne()

db.students.createIndex()

db.students.aggregate([])
```

---

# 29. MongoDB Learning Order (IMPORTANT)

If you skip this order, you'll waste time jumping randomly.

## Correct Order

1. Basics
2. CRUD
3. Query operators
4. Arrays & embedded docs
5. Indexing
6. Aggregation
7. Relationships
8. Replication & sharding
9. Security
10. Mongoose

---

# 30. One-Line Memory Tricks

| Topic       | Memory Shortcut  |
| ----------- | ---------------- |
| Collection  | Table equivalent |
| Document    | JSON object      |
| BSON        | Binary JSON      |
| CRUD        | Main operations  |
| Index       | Speed booster    |
| Aggregation | Data analysis    |
| Replication | Backup copies    |
| Sharding    | Split data       |
| Embedding   | Nested docs      |
| Referencing | Linked docs      |

---

# Final Revision Strategy

Do NOT reread everything repeatedly. That’s inefficient.

Use this approach:

## Round 1

Understand concepts.

## Round 2

Practice commands manually.

## Round 3

Build mini project:

* Student DB
* Todo app
* Chat backend

## Round 4

Revise only:

* CRUD
* Aggregation
* Indexing
* Relationships

Those are the areas people forget most.

---

# 5-Minute Ultra Short Revision

```text
MongoDB = NoSQL document DB

Database → Collection → Document

CRUD:
insertOne()
find()
updateOne()
deleteOne()

Operators:
$gt $lt $in $or

Index → faster queries

Aggregation → data processing

Replication → backup copies

Sharding → scaling

Embedding → nested data
Referencing → linked data
```
