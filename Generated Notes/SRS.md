# SRS (Software Requirements Specification) — Complete Recall Notes

## 1. What is SRS?

An **SRS document** is a formal document that describes:

* **What the software should do**
* **How the system should behave**
* **Requirements and constraints**
* **Communication between client & developers**

It acts as a **blueprint** for the software project.

---

# 2. Main Purpose of SRS

### Why SRS is important?

* Prevents confusion
* Defines project scope clearly
* Helps developers, testers, clients
* Reduces future changes/rework
* Basis for design, coding, testing

---

# 3. Characteristics of a Good SRS

A good SRS should be:

| Characteristic | Meaning                       |
| -------------- | ----------------------------- |
| Correct        | Matches customer needs        |
| Complete       | No missing requirements       |
| Unambiguous    | Only one interpretation       |
| Consistent     | No conflicting requirements   |
| Verifiable     | Can be tested                 |
| Modifiable     | Easy to update                |
| Traceable      | Requirement tracking possible |

---

# 4. Types of Requirements

## A) Functional Requirements

Describe:

> What the system should do

### Examples:

* User login
* Payment processing
* Search functionality

### Keywords:

* Input
* Output
* Processing
* Business logic

---

## B) Non-Functional Requirements

Describe:

> How the system performs

### Examples:

* Performance
* Security
* Reliability
* Scalability
* Response time

### Example:

* “System should load within 2 seconds”

---

# 5. Structure / Format of SRS

Typical SRS structure:

---

# 1. Introduction

Contains:

## a) Purpose

Why the software exists

## b) Scope

Features and boundaries

## c) Definitions

Technical terms/acronyms

## d) References

Related documents

---

# 2. Overall Description

High-level system overview.

Includes:

| Topic                | Meaning                        |
| -------------------- | ------------------------------ |
| Product Perspective  | Relation with other systems    |
| Product Functions    | Main features                  |
| User Characteristics | Types of users                 |
| Constraints          | Hardware/software/legal limits |
| Assumptions          | Expected conditions            |

---

# 3. Specific Requirements

Core section of SRS.

Includes:

## Functional requirements

Detailed features

## Non-functional requirements

Performance/security etc.

## External interface requirements

* UI
* Hardware
* APIs
* Communication

---

# 4. Appendices

Extra information:

* Diagrams
* Tables
* References

---

# 6. SRS vs Design Document

| SRS                   | Design Document               |
| --------------------- | ----------------------------- |
| WHAT system should do | HOW system will do it         |
| Client-focused        | Developer-focused             |
| Requirements          | Architecture & implementation |

---

# 7. Benefits of SRS

## For Developers

* Clear coding direction

## For Testers

* Test cases based on requirements

## For Clients

* Confirms expectations

## For Project Managers

* Better planning & estimation

---

# 8. Problems Without SRS

Without SRS:

* Scope creep
* Miscommunication
* Extra cost
* Delays
* Incorrect software

---

# 9. SRS Life Cycle Role

SRS is mainly used in:

```text
Requirement Gathering
        ↓
SRS Preparation
        ↓
Design
        ↓
Development
        ↓
Testing
        ↓
Deployment
```

---

# 10. IEEE Standard SRS

Most organizations follow:

> IEEE 830 SRS standard

It provides:

* Standard structure
* Proper formatting
* Documentation guidelines

---

# 11. Example Mini SRS (Simple)

## Project:

Library Management System

### Functional Requirements

* User login
* Search books
* Borrow/return books

### Non-functional Requirements

* Response time < 3 sec
* Secure authentication

### Constraints

* Runs on Windows/Linux
* MySQL database

---

# 12. Difference Between FR and NFR

| Functional Requirement | Non-Functional Requirement |
| ---------------------- | -------------------------- |
| What system does       | How system behaves         |
| Features/functions     | Quality attributes         |
| Login system           | Login response < 2 sec     |

---

# 13. Stakeholders in SRS

People involved:

* Client
* Users
* Developers
* Testers
* Project managers
* Business analysts

---

# 14. Requirement Validation

Checking whether requirements are:

* Correct
* Feasible
* Complete
* Testable

Methods:

* Reviews
* Inspections
* Prototyping

---

# 15. Requirement Traceability

Traceability means:

> Tracking requirements throughout development

Helps:

* Change management
* Testing
* Bug tracking

---

# 16. Common Mistakes in SRS

## Bad SRS Problems:

* Vague statements
* Missing requirements
* Contradictions
* Over-complex language
* No prioritization

---

# 17. Functional Requirement Example

```text
The system shall allow users to reset passwords using email verification.
```

---

# 18. Non-Functional Requirement Example

```text
System uptime shall be 99.9%.
```

---

# 19. Keywords to Remember for Exams

| Keyword        | Meaning              |
| -------------- | -------------------- |
| Requirement    | Need of user/system  |
| Functional     | Features             |
| Non-functional | Quality/performance  |
| Constraint     | Limitation           |
| Validation     | Checking correctness |
| Traceability   | Requirement tracking |

---

# 20. One-Line Memory Tricks

## SRS =

> “Agreement between client and developer.”

## Functional Requirement =

> “WHAT system does.”

## Non-functional Requirement =

> “HOW well system works.”

## Design Document =

> “Implementation plan.”

---

# 21. Short Exam Answers

## What is SRS?

An SRS is a document that specifies functional and non-functional requirements of software.

---

## Why is SRS important?

It reduces misunderstanding and serves as the foundation for development and testing.

---

## What are the types of requirements?

* Functional requirements
* Non-functional requirements

---

## Difference between SRS and Design Document?

SRS defines WHAT to build; design document defines HOW to build it.

---

# 22. Ultra-Short Revision Sheet

```text
SRS = Blueprint of software

Contains:
- Functional requirements
- Non-functional requirements
- Constraints
- Interfaces

Good SRS:
- Complete
- Correct
- Consistent
- Verifiable

FR = What system does
NFR = How system performs

Purpose:
- Clear communication
- Reduce errors
- Support development/testing
```
