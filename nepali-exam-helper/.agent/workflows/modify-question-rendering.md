---
description: How to modify question rendering in the SEE exam app
---

# Modifying Question Rendering

When changing how questions, options, explanations, or answers are displayed in the test-taking interface, you MUST also update the **results page** (`results-card.tsx`).

## Components to Update Together

Whenever you modify text/content rendering in ANY of these files:

1. `components/group-a.tsx` - Multiple choice questions
2. `components/free-response-group.tsx` - Group B/C/D questions  
3. `components/english-question-renderer.tsx` - English tests
4. `components/nepali-question-renderer.tsx` - Nepali tests
5. `components/social-studies-question-renderer.tsx` - Social Studies tests

**You MUST also update:**

6. `components/results-card.tsx` - Displays all questions/answers/feedback after submission

## Checklist for Rendering Changes

- [ ] Update test-taking component(s)
- [ ] Update `results-card.tsx` for the same content types
- [ ] Verify both test-taking AND results views render correctly

---

## Math Formula Rendering (KaTeX)

### How It Works

The app uses **KaTeX** (via `react-katex`) to render LaTeX math formulas. The `MathText` component (`components/math-text.tsx`) handles this:

1. **Parses text** for LaTeX delimiters
2. **Renders math segments** using KaTeX
3. **Renders non-math text** normally
4. **Handles errors gracefully** - if LaTeX fails, shows raw text

### LaTeX Delimiters

| Delimiter | Type | Example |
|-----------|------|---------|
| `$...$` | Inline math | `The formula is $x^2 + y^2$` |
| `$$...$$` | Block/display math | `$$\frac{a}{b} = c$$` |

### Common LaTeX Syntax

| What | LaTeX | Renders As |
|------|-------|------------|
| Subscript | `$H_2O$` | H₂O |
| Superscript | `$x^2$` | x² |
| Fraction | `$\frac{a}{b}$` | a/b (stacked) |
| Square root | `$\sqrt{x}$` | √x |
| Text in math | `$\text{kg}$` | kg (upright) |
| Multiplication | `$\cdot$` | · |
| Chemical formula | `$C_nH_{2n}$` | CₙH₂ₙ |
| Units | `$\text{m}^{-1}$` | m⁻¹ |

### Usage in JSON Data Files

Add LaTeX delimiters directly in the JSON:

```json
{
  "questionEnglish": "What is the formula for $C_nH_{2n+2}$?",
  "options": [
    {"english": "$\\text{kg} \\cdot \\text{m}^{-1}$"},
    {"english": "$\\frac{F}{A} = P$"}
  ],
  "explanation": "The pressure formula is $P = \\frac{F}{A}$"
}
```

> **Note:** In JSON, backslashes must be escaped (`\\` instead of `\`)

### Usage in React Components

```tsx
import { MathText } from "./math-text"

// Render text that may contain math
<MathText text={question.english} />
<MathText text={option.nepali} />
<MathText text={explanation} />
```

