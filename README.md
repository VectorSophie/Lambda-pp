# λ++ (LARC v2.0.0: λLC Edition)

> "From Sorcery to Ontology. Reduce until reality stabilizes."

λ++ is the world's first **Enterprise-Grade Pure Functional Arcane Programming Language**. 

In version 2.0.0, we have moved beyond procedural "casting" into the realm of **Formal Magicks**. The language is now powered by a **Pure Lambda Calculus (λLC)** engine that uses β-reduction to collapse spells into Normal Form.

---

## The New Philosophy: Formal Magicks

In λ++, we no longer "execute" code. We **reduce terms**.
- **The Spell**: A pure λ-abstraction (λtarget. λs. bind ... s).
- **The Mana**: A threaded Monadic state, not a global variable.
- **The Casting**: A sequence of β-reductions that must logically prove the stability of reality.

### 1. Monadic Mana Management (M3)
Manual Mana Management is now **mathematically enforced**. 
`Mana.allocate(n)` and `Mana.free(ptr)` are monadic primitives that thread the `ManaState` through your spell's bind chain.

- **Forget to free?** The monadic chain carries a non-empty `LiveList` into the final `checkLeaks` term. Reduction fails.
- **Double free?** The `Either` monad short-circuits with a `DoubleFreeException`.

```java
// Surface λ++ Syntax
ManaPtr m = Mana.allocate(7);
try {
    Fireball.cast(target, m);
} finally {
    Mana.free(m);
}

// Internal λLC Reduction (Desugared)
λs. bind (allocate 7) (λm. 
      bind (Fireball.cast target m) (λ_. 
        bind (free m) (λ__. 
          (check_leaks)
        )
      )
    ) s
```

### 2. Pure Thaumaturgy Engine
The core reducer is now **pure**. It does not perform I/O. Instead, it emits **Observations** (Flux changes, Runic signatures) as part of its monadic result.

The LARC CLI acts as the **Priest**, interpreting these observations to render:
- **Runic Signatures**: Unique hashes generated from pure execution logs.
- **Mana Flux**: Animated visual feedback derived from state-threaded `FluxChange` events.

### 3. Church-Encoded Rituals
All object-oriented constructs (Classes, Methods, Members) are desugared into **Church Records** and **Nested Lambdas**. 
- **Methods**: Functions that take `this` as their first parameter.
- **Objects**: Records (nested pairs) that store method closures and field values.
- **Dispatch**: Selecting a slot from the object record and applying it.

---

## Features (Mandatory)

### 1. Zero Side-Effect Core
The engine (`src/reducer.ts`) is a pure function: `evaluate(term, env, state) -> MonadicResult`.
Reality is guaranteed to be stable if the reduction reaches its Normal Form.

### 2. Continuation-Based Exceptions
Exceptions are no longer "errors" but control-flow branches in the `Either` Monad.
If a spell breaches the circle, the monadic chain collapses.

### 3. Recursive Inevitability
Since λLC has no named functions at the core level, all recursion is implemented via the **Z-combinator** (the call-by-value fixed-point combinator).

---

## Getting Started

### Installation
(LARC v2.0.0 requires the `feature/lambda-calculus-conversion` branch)

```bash
git clone https://github.com/VectorSophie/Lambda-pp.git
cd Lambda-pp
git checkout feature/lambda-calculus-conversion
npm install
npm run build
```

### Writing Your First Curse

Create `Doom.lmpp`:

```java
package tower.forbidden;

import "github.com/archmage/void";

@SpellMetadata(school=School.NECROMANCY, level=1, concentration=false, ritual=true)
public final class Doom {
    public static void main(String[] args) {
        System.out.println("Omae wa mou shindeiru.");
    }
}
```

### Compiling & Casting
Run the **LARC** (Lambda Architect Rumbo's Compiler):

```bash
larc cast Doom.lmpp
```

**Output:**
```
--------------------------------------------------
LARC v2.0.0 (λLC) - Reducing tower.forbidden...
--------------------------------------------------
[LARC] Parsing...
[Linker] Resolving dependencies...
[LARC] Casting...

[Runtime] Allocating 1 mana...
[Cast] Casting spell...
  Manifesting: Doom [ ᚺ ᚢ ∞ ᚨ ᚠ ᛟ ]
Omae wa mou shindeiru.

[Runtime] Mana pool balanced. Reality is stable.
  e^(iπ) + 1 = 0 (Reality Stabilized)
```

---

## The Grimoire (Standard Primitives)

- `System.out.println(String)`: Shouts into the void (Monadic Bind).
- `Mana.allocate(int)`: Borrows energy (Monadic State).
- `Mana.free(ManaPtr)`: Pays it back (Monadic State).
- `Thread`: Splits the timeline (Pi-Calculus).

---

## FAQ

**Q: Why is there no `var` keyword?**
A: Uncertainty is weakness. State your types explicitly.

**Q: My build failed with `ManaLeakException` during compilation.**
A: You leaked mana in the *compiler*. Run away.

**Q: Can I use this for web development?**
A: Yes, but `HTTP 404` summons a poltergeist.

**Q: Is it Turing Complete?**
A: It is **Eldritch Complete**. It can compute anything.

---

*Made with mathematical inevitability and ἀ̶̞̻͔̳̫̻̘γ̶̮͚̼͊̒꙲π̶̥̘͙̄́͌̀̍ῶ̶͝ by Rumbo.*
*Do not stare directly into the reducer.*
