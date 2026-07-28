# React Hook Form

## 1. What It Is

React Hook Form (RHF) is a **lightweight form library for React** focused on:

* Performance
* Minimal re-renders
* Easy validation
* Simpler form state handling

Instead of controlling every input with React state, RHF mainly uses **uncontrolled inputs + refs**.

---

# 2. Why RHF Exists

Traditional React forms become messy:

```jsx
const [name, setName] = useState("")
const [email, setEmail] = useState("")
const [errors, setErrors] = useState({})
```

Problems:

* Too much boilerplate
* Many re-renders
* Hard validation logic
* Large forms become painful

RHF fixes this.

---

# 3. Installation

```bash
npm install react-hook-form
```

---

# 4. Core Hook

```jsx
import { useForm } from "react-hook-form"
```

Main function:

```jsx
const {
  register,
  handleSubmit,
  watch,
  reset,
  setValue,
  getValues,
  formState: { errors }
} = useForm()
```

---

# 5. Basic Form

```jsx
import { useForm } from "react-hook-form"

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("name")}
      />

      <button type="submit">
        Submit
      </button>
    </form>
  )
}
```

---

# 6. `register()`

Most important RHF function.

Connects input to form state.

```jsx
<input {...register("email")} />
```

### Meaning

```jsx
register("email")
```

* Tracks input
* Stores value
* Handles validation
* Includes in submit data

---

# 7. Form Submission

```jsx
handleSubmit(onSubmit)
```

RHF:

1. Prevents default reload
2. Validates form
3. Sends data if valid

---

# 8. Validation

## Required

```jsx
<input
  {...register("email", {
    required: "Email is required"
  })}
/>
```

---

## Min Length

```jsx
<input
  {...register("password", {
    minLength: {
      value: 6,
      message: "Minimum 6 chars"
    }
  })}
/>
```

---

## Pattern

```jsx
<input
  {...register("email", {
    pattern: {
      value: /^\S+@\S+$/i,
      message: "Invalid email"
    }
  })}
/>
```

---

# 9. Errors Object

```jsx
formState: { errors }
```

Usage:

```jsx
{errors.email && (
  <p>{errors.email.message}</p>
)}
```

---

# 10. Validation Modes

```jsx
useForm({
  mode: "onChange"
})
```

Modes:

| Mode     | Meaning                      |
| -------- | ---------------------------- |
| onSubmit | Validate on submit           |
| onChange | Validate while typing        |
| onBlur   | Validate after leaving input |
| all      | Every interaction            |

Default:

```jsx
onSubmit
```

---

# 11. Default Values

```jsx
useForm({
  defaultValues: {
    name: "Dileep",
    age: 18
  }
})
```

Useful for:

* Edit forms
* Prefilled forms

---

# 12. `watch()`

Watch field values live.

```jsx
const name = watch("name")
```

Example:

```jsx
<p>{name}</p>
```

---

# 13. `getValues()`

Get current form values instantly.

```jsx
const values = getValues()
```

Single field:

```jsx
getValues("email")
```

Difference:

* `watch()` causes re-render
* `getValues()` does not

---

# 14. `setValue()`

Programmatically change field.

```jsx
setValue("name", "Dileep")
```

Useful:

* API data
* Auto-fill
* Dynamic updates

---

# 15. `reset()`

Reset form.

```jsx
reset()
```

With values:

```jsx
reset({
  name: "John"
})
```

---

# 16. `Controller`

Used for:

* Third-party UI libraries
* Controlled components

Examples:

* MUI
* Ant Design
* React Select

---

## Basic Example

```jsx
import { Controller, useForm } from "react-hook-form"

<Controller
  name="email"
  control={control}
  render={({ field }) => (
    <input {...field} />
  )}
/>
```

---

# 17. Why `Controller` Exists

RHF prefers uncontrolled inputs.

But some UI libraries use:

```jsx
value
onChange
```

`Controller` bridges RHF with controlled components.

---

# 18. `control`

Needed for:

* `Controller`
* `useFieldArray`

```jsx
const { control } = useForm()
```

---

# 19. `useFieldArray()`

For dynamic fields.

Example:

* Add/remove phone numbers
* Multiple addresses
* Skills list

---

## Example

```jsx
const { fields, append, remove } = useFieldArray({
  control,
  name: "skills"
})
```

---

## Render

```jsx
{
  fields.map((field, index) => (
    <div key={field.id}>
      <input
        {...register(`skills.${index}.value`)}
      />

      <button onClick={() => remove(index)}>
        Remove
      </button>
    </div>
  ))
}
```

---

## Add Field

```jsx
append({ value: "" })
```

---

# 20. Nested Fields

```jsx
register("user.name")
```

Result:

```js
{
  user: {
    name: "Dileep"
  }
}
```

---

# 21. Array Fields

```jsx
register("skills.0")
```

Result:

```js
{
  skills: ["React"]
}
```

---

# 22. Async Validation

```jsx
register("username", {
  validate: async (value) => {
    const exists = await checkUser(value)

    return !exists || "Username taken"
  }
})
```

---

# 23. Custom Validation

```jsx
register("age", {
  validate: value =>
    value >= 18 || "Must be adult"
})
```

---

# 24. Multiple Validations

```jsx
register("password", {
  required: "Required",
  minLength: {
    value: 8,
    message: "Too short"
  },
  validate: value =>
    value.includes("@") || "Needs @"
})
```

---

# 25. Form State

```jsx
formState
```

Important properties:

| Property      | Meaning           |
| ------------- | ----------------- |
| errors        | Validation errors |
| isDirty       | Form changed      |
| isValid       | Form valid        |
| isSubmitting  | During submit     |
| touchedFields | Touched inputs    |

---

# 26. `isDirty`

```jsx
formState.isDirty
```

True if user changed any field.

Useful:

* Unsaved changes warning
* Disable save button

---

# 27. `isValid`

```jsx
formState.isValid
```

Need:

```jsx
useForm({
  mode: "onChange"
})
```

---

# 28. Disable Submit Until Valid

```jsx
<button disabled={!isValid}>
  Submit
</button>
```

---

# 29. `trigger()`

Manually validate fields.

```jsx
trigger()
```

Specific field:

```jsx
trigger("email")
```

---

# 30. `clearErrors()`

```jsx
clearErrors("email")
```

Removes validation errors manually.

---

# 31. `setError()`

Add custom error.

```jsx
setError("email", {
  type: "manual",
  message: "Server error"
})
```

Useful:

* Backend validation

---

# 32. `handleSubmit` Error Callback

```jsx
handleSubmit(onValid, onInvalid)
```

---

# 33. Schema Validation

Usually with:

* Zod
* Yup

Most modern choice:

## Zod

---

# 34. Zod Integration

Install:

```bash
npm install zod @hookform/resolvers
```

---

## Example

```jsx
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const form = useForm({
  resolver: zodResolver(schema)
})
```

---

# 35. Why Zod Is Better

Compared to manual validation:

* Cleaner
* Centralized
* Type-safe
* Reusable
* Better scaling

---

# 36. Performance Advantage

RHF minimizes re-renders because:

* Uses refs
* Uncontrolled inputs
* State isolation

This is why RHF is faster than many form libraries.

---

# 37. Controlled vs Uncontrolled

## Controlled

React controls value.

```jsx
<input
  value={name}
  onChange={...}
/>
```

## Uncontrolled

DOM controls value.

```jsx
<input ref={...} />
```

RHF prefers uncontrolled.

---

# 38. Common Mistakes

## Mistake 1

Using `value` manually with `register`.

Bad:

```jsx
<input
  value={name}
  {...register("name")}
/>
```

You break RHF optimization.

---

## Mistake 2

Forgetting `defaultValues`.

Causes:

* uncontrolled/controlled warnings

---

## Mistake 3

Using `Controller` everywhere.

Most inputs DON'T need it.

---

# 39. When To Use `Controller`

Use ONLY when component:

* Doesn't expose ref properly
* Uses custom value handling

Examples:

* Date picker
* Select libraries

---

# 40. File Upload

```jsx
<input
  type="file"
  {...register("image")}
/>
```

Access:

```js
data.image[0]
```

---

# 41. Checkbox

```jsx
<input
  type="checkbox"
  {...register("terms")}
/>
```

---

# 42. Radio Buttons

```jsx
<input
  type="radio"
  value="male"
  {...register("gender")}
/>
```

---

# 43. Select Input

```jsx
<select {...register("country")}>
  <option>India</option>
</select>
```

---

# 44. DevTools

Install:

```bash
npm install @hookform/devtools
```

Useful for debugging form state.

---

# 45. Mental Model

## Think of RHF as:

```text
register() -> connect input
handleSubmit() -> validate + submit
errors -> validation messages
formState -> form status
Controller -> controlled components
useFieldArray -> dynamic inputs
```

---

# 46. Typical Real-World Flow

```text
1. useForm()
2. register inputs
3. add validation
4. handleSubmit()
5. show errors
6. send API request
7. reset()
```

---

# 47. Best Practices

## Good

* Use uncontrolled inputs
* Use schema validation
* Keep validation centralized
* Use reusable form components

## Bad

* Overusing Controller
* Mixing local state unnecessarily
* Huge forms without separation

---

# 48. Interview Questions

## Why RHF faster than Formik?

Because RHF:

* Uses uncontrolled inputs
* Avoids unnecessary re-renders
* Uses refs internally

---

## Difference between `watch` and `getValues`

| watch      | getValues    |
| ---------- | ------------ |
| Reactive   | Snapshot     |
| Re-renders | No re-render |

---

## When use Controller?

When component is controlled/custom.

---

# 49. One Full Example

```jsx
import { useForm } from "react-hook-form"

function Login() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const onSubmit = (data) => {
    console.log(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      <input
        placeholder="Email"
        {...register("email", {
          required: "Email required"
        })}
      />

      {errors.email && (
        <p>{errors.email.message}</p>
      )}

      <input
        type="password"
        placeholder="Password"
        {...register("password", {
          required: "Password required",
          minLength: {
            value: 6,
            message: "Minimum 6 chars"
          }
        })}
      />

      {errors.password && (
        <p>{errors.password.message}</p>
      )}

      <button type="submit">
        Login
      </button>

    </form>
  )
}
```

---

# 50. Final Recall Sheet (Memorize This)

```text
useForm() -> create form

register() -> connect inputs

handleSubmit() -> submit safely

errors -> validation errors

watch() -> live values

getValues() -> snapshot values

setValue() -> change field

reset() -> reset form

Controller -> controlled UI libs

useFieldArray() -> dynamic fields

resolver -> schema validation
```

---

# 51. The Important Truth Most Beginners Miss

If you still write forms using:

```jsx
useState()
```

for every input, you're wasting time and creating unnecessary renders.

RHF becomes valuable when:

* Forms get large
* Validation becomes complex
* Dynamic fields appear
* Performance matters

For tiny forms, plain React state is often enough. Beginners blindly forcing RHF into every form without understanding the tradeoff is cargo-cult coding.
