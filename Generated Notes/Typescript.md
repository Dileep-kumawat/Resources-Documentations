# TypeScript Complete Recall Notes

---

# 1. What is TypeScript?

TypeScript = JavaScript + Static Typing.

It is developed by Microsoft and compiles into normal JavaScript.

Main goal:

* Catch errors BEFORE runtime.
* Make large applications manageable.
* Improve developer experience.

Think like this:

```txt
JavaScript:
Flexible but dangerous.

TypeScript:
Strict but safer.
```

---

# 2. Why TypeScript Matters

Without TypeScript:

* Wrong function arguments
* Undefined errors
* Bad refactoring
* Confusing codebases

With TypeScript:

* Autocomplete
* IntelliSense
* Safer refactoring
* Better maintainability
* Cleaner architecture

Reality:
TypeScript slows beginners slightly but massively speeds up serious projects.

---

# 3. Setup

Install:

```bash
npm install -g typescript
```

Check version:

```bash
tsc -v
```

Compile:

```bash
tsc index.ts
```

Watch mode:

```bash
tsc --watch
```

Create config:

```bash
tsc --init
```

Run TS directly:

```bash
npm install -g ts-node
ts-node app.ts
```

---

# 4. Basic Types

## String

```ts
let name: string = "Dileep"
```

## Number

```ts
let age: number = 18
```

## Boolean

```ts
let isActive: boolean = true
```

## Any

Avoid unless necessary.

```ts
let data: any = 10
data = "hello"
```

Problem:
You lose TypeScript safety.

---

## Unknown

Safer version of `any`.

```ts
let value: unknown
```

Need checking before use.

---

## Void

Function returns nothing.

```ts
function log(): void {
  console.log("hello")
}
```

---

## Null & Undefined

```ts
let a: null = null
let b: undefined = undefined
```

---

## Never

Function never ends.

```ts
function throwError(): never {
  throw new Error()
}
```

---

# 5. Arrays

```ts
let nums: number[] = [1,2,3]
```

Alternative:

```ts
let nums: Array<number> = [1,2,3]
```

Mixed array:

```ts
let arr: (string | number)[] = [1,"hi"]
```

---

# 6. Tuples

Fixed order + fixed types.

```ts
let user: [string, number]

user = ["Dileep", 18]
```

Good for:

* API responses
* Coordinates
* Key-value pairs

---

# 7. Objects

```ts
let user: {
  name: string
  age: number
}
```

Example:

```ts
let user = {
  name: "Dileep",
  age: 18
}
```

---

## Optional Properties

```ts
type User = {
  name: string
  age?: number
}
```

---

## Readonly

```ts
type User = {
  readonly id: number
}
```

Cannot modify later.

---

# 8. Functions

## Parameter Types

```ts
function add(a:number,b:number) {
  return a+b
}
```

---

## Return Type

```ts
function add(a:number,b:number):number {
  return a+b
}
```

---

## Optional Parameters

```ts
function greet(name?:string) {}
```

---

## Default Parameters

```ts
function greet(name="Guest") {}
```

---

## Rest Parameters

```ts
function sum(...nums:number[]) {}
```

---

# 9. Type Aliases

Reusable custom types.

```ts
type User = {
  name:string
  age:number
}
```

Usage:

```ts
let user: User
```

---

# 10. Union Types

Multiple possible types.

```ts
let id: string | number
```

---

# 11. Literal Types

Specific exact values.

```ts
let direction: "left" | "right"
```

Useful for strict APIs.

---

# 12. Enums

Named constants.

```ts
enum Role {
  Admin,
  User,
  Guest
}
```

String enum:

```ts
enum Role {
  Admin = "ADMIN"
}
```

---

# 13. Interfaces

Defines object structure.

```ts
interface User {
  name: string
  age: number
}
```

---

## Interface vs Type

Use Interface:

* Mostly for objects/classes

Use Type:

* Unions
* Advanced combinations

Reality:
Most developers use both interchangeably.

---

# 14. Type Assertions

Tell TypeScript:
“I know better.”

```ts
let value: unknown = "hello"

let len = (value as string).length
```

---

# 15. Functions as Types

```ts
type Add = (a:number,b:number)=>number
```

---

# 16. Classes

```ts
class User {
  name: string

  constructor(name:string){
    this.name = name
  }
}
```

---

## Access Modifiers

### Public

Accessible everywhere.

```ts
public name:string
```

---

### Private

Only inside class.

```ts
private password:string
```

---

### Protected

Inside class + subclasses.

```ts
protected data:string
```

---

## Readonly

```ts
readonly id:number
```

---

# 17. Inheritance

```ts
class Animal {
  move(){}
}

class Dog extends Animal {
  bark(){}
}
```

---

# 18. Abstract Classes

Cannot create object directly.

```ts
abstract class Shape {
  abstract area(): number
}
```

---

# 19. Generics

Reusable type-safe components.

Without generics:

* Repetition
* Weak flexibility

Example:

```ts
function identity<T>(value:T):T {
  return value
}
```

Usage:

```ts
identity<string>("hello")
identity<number>(10)
```

---

# 20. Generic Interfaces

```ts
interface ApiResponse<T> {
  data: T
  success: boolean
}
```

---

# 21. Utility Types

Extremely important in real projects.

---

## Partial

Makes everything optional.

```ts
Partial<User>
```

---

## Required

Makes everything required.

```ts
Required<User>
```

---

## Readonly

```ts
Readonly<User>
```

---

## Pick

Select properties.

```ts
Pick<User, "name">
```

---

## Omit

Remove properties.

```ts
Omit<User, "password">
```

---

## Record

```ts
Record<string, number>
```

---

# 22. Type Narrowing

Refining type safely.

```ts
if(typeof value === "string"){
  console.log(value.length)
}
```

---

# 23. Type Guards

Custom type checking.

```ts
function isString(value:any): value is string {
  return typeof value === "string"
}
```

---

# 24. keyof

Gets keys from object type.

```ts
type User = {
  name:string
  age:number
}

type Keys = keyof User
```

Result:

```ts
"name" | "age"
```

---

# 25. typeof

Gets type from variable.

```ts
const user = {
  name:"Dileep"
}

type User = typeof user
```

---

# 26. Mapped Types

Transform types dynamically.

```ts
type Options = {
  [K in keyof User]: boolean
}
```

---

# 27. Conditional Types

```ts
type Check<T> = T extends string ? true : false
```

---

# 28. Async in TypeScript

```ts
async function fetchData(): Promise<string> {
  return "hello"
}
```

---

# 29. Modules

Export:

```ts
export const name = "Dileep"
```

Import:

```ts
import { name } from "./file"
```

Default export:

```ts
export default User
```

Import default:

```ts
import User from "./file"
```

---

# 30. tsconfig.json Important Options

---

## strict

Most important setting.

```json
"strict": true
```

Always enable in serious projects.

---

## target

JS version output.

```json
"target": "ES2020"
```

---

## module

```json
"module": "commonjs"
```

---

## rootDir

Source folder.

```json
"rootDir": "./src"
```

---

## outDir

Compiled JS folder.

```json
"outDir": "./dist"
```

---

# 31. Common Mistakes

## Using `any` everywhere

Destroys TypeScript purpose.

---

## Ignoring strict mode

Weakens safety.

---

## Overengineering types

Many beginners create insane complex types too early.

Bad idea.

First:

* Learn clarity
* Then abstraction

---

# 32. Best Practices

* Prefer interfaces for objects
* Avoid `any`
* Use strict mode
* Use generics wisely
* Keep types readable
* Don’t make “type gymnastics”

---

# 33. Real Project Stack

Common setup:

```txt
React + TypeScript
Node.js + TypeScript
Next.js + TypeScript
Express + TypeScript
```

---

# 34. TypeScript Mental Model

This is the thing most tutorials fail to explain properly:

TypeScript DOES NOT exist at runtime.

After compilation:

```txt
TypeScript → JavaScript
```

All types disappear.

Meaning:
Types are ONLY for development safety.

---

# 35. Most Important Concepts To Master First

Priority order:

1. Basic Types
2. Functions
3. Objects
4. Interfaces
5. Type Aliases
6. Union Types
7. Generics
8. Utility Types
9. Type Narrowing
10. Advanced Types

Most beginners waste time trying advanced generics too early.

That’s ego-driven learning, not useful learning.

---

# 36. Fast Recall Cheat Sheet

```txt
string → text
number → numbers
boolean → true/false
any → unsafe escape hatch
unknown → safer any
void → no return
never → impossible return

[] → arrays
() => {} → functions
| → union
& → intersection
? → optional
readonly → immutable

interface → object contracts
type → reusable custom types
extends → inheritance
<T> → generics

Partial → optional everything
Pick → select fields
Omit → remove fields
Readonly → immutable fields
```

---

# 37. Interview-Level Questions

## Difference between Type and Interface?

Interface:

* extendable
* mainly object structure

Type:

* more flexible
* unions/intersections

---

## any vs unknown?

`any`

* disables checking

`unknown`

* forces validation

---

## Why use Generics?

Reusable + type-safe code.

---

## Why TypeScript if JavaScript already works?

Because scaling JavaScript without type safety becomes messy fast.

Small projects survive.
Large projects become chaos.

---

# 38. Final Understanding

If you truly understand:

* types
* functions
* interfaces
* generics
* narrowing

You already know most practical TypeScript.

The rest is mainly:

* patterns
* architecture
* experience

Most people endlessly consume tutorials instead of building projects.

That’s why they forget everything.

You remember TypeScript by USING it repeatedly, not rereading notes 50 times.
