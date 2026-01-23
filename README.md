# λ++ (LARC)

> "Write once, miscast everywhere."

λ++ (pronounced *Lambda Plus Plus* or *Luh-Mao*) is the world's first **Enterprise-Grade Arcane Programming Language**. It combines the verbosity of Java 7, the memory safety of C, and the dependency management of Go projects(that have been dead for years)

Designed by **Lambda Architect Rumbo**, λ++ ensures safe reality alteration.

---

## Features (Mandatory)

### 1. Manual Mana Management (MMM)
Garbage collection is for cowards. In λ++, you manually allocate and free **Mana**.
- **Forget to free?** Mana leak. The fabric of reality tears.
- **Double free?** Backlash. Your wand catches fire.
- **Use after free?** You summon something ancient.

```java
ManaPtr m = Mana.allocate(7); // Cost: 7
try {
    Fireball.cast(target, m);
} finally {
    Mana.free(m); // REQUIRED.
}
```

### 2. Checked Reality Exceptions
Exceptions aren't just errors; they are in-world events. You must catch them, or the compiler (The Circle) will exile you.

```java
try {
    Summoning.invoke("Demon");
} catch (CircleBreachedException e) {
    // Run.
} catch (SoulContractVoidedException e) {
    // Lawyer up.
}
```

### 3. Bureaucratic Metadata
Every class requires `@SpellMetadata`. If you don't file your permits, the spell fails.

```java
@SpellMetadata(
    school = School.EVOCATION, // Required
    level = 9,                 // Required
    concentration = true,      // Required
    ritual = false,            // Required
    permitNumber = "A7-B99"    // Optional (Recommended)
)
public final class Wish extends Spell<Reality> { ... }
```

### 4. GitHub-First Imports
Dependencies are fetched directly from the Astral Plane (GitHub).
If the repo is deleted, your spellbook becomes a brick.

```java
import "github.com/archmage/evocation";
import "github.com/merlin/beard-trimmer@v0.0.1-alpha";
```

### 5. Concurrent Rituals
λ++ supports threading via `Thread` and Lambda expressions. Race conditions manifest as **Time Freezes**.

```java
Thread t = new Thread(() -> {
    // This happens in parallel universe A
    drawCircle();
});
t.start();
// This happens in parallel universe B
chant();
```

### 6. Dependency Management (The Vendor Folder)
We don't use `npm_modules`. We use **Local Vendor Caching**.
To install a library, you must manually transcribe (copy-paste) the scrolls into `vendor/github.com/author/repo`.

**Supported Standard Libraries:**
- `github.com/archmage/evocation`: Fireballs, Lightning, and thermal runaway protection.
- `github.com/archmage/chronomancy`: Time manipulation (Threads).

### 7. Thaumaturgy Engine (Visual Magic)
The runtime includes a built-in Thaumaturgy visualizer that renders:
- **Runic Signatures**: Unique hashes for every spell (e.g., `[ ᚺ ᚢ ∞ ᚨ ᚠ ᛟ ]`).
- **Mana Flux**: Real-time animated bars showing energy allocation (`∆ Flux: 7µ`).
- **Quantum Formulas**: `Ψ(Spell) = ∂E/∂t`.

---

## Getting Started

### Installation
You don't install λ++. It installs you.
(But if you must, use `npm`)

```bash
# Clone the repo (from the Astral Plane)
git clone https://github.com/archmage/larc.git
cd larc

# Build the artifacts (Requires Node.js 20+)
npm install
npm run build

# Link the soul to your machine (Makes 'larc' command global)
npm link
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
[Registry] Registered ritual: Doom [ ᚺ ᚢ ∞ ᚨ ᚠ ᛟ ]
[Runtime] Invoking Doom.main()...
[ ᚺ ᚢ ∞ ᚨ ᚠ ᛟ ] Ψ(Doom.main) = ∂E/∂t
Omae wa mou shindeiru.

[Runtime] Mana pool balanced. Reality is stable.
  e^(iπ) + 1 = 0 (Reality Stabilized)
```

---

## The Standard Library (Grimoire)

- `System.out.println(String)`: Shouts into the void.
- `Mana.allocate(int)`: Borrows energy from the universe (Animated).
- `Mana.free(ManaPtr)`: Pays it back (Animated).
- `Thread`: Splits the timeline.

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

**Q: Did you publish this to npm?**
A: Yes and no at the same time.

---

*Made with mana and ἀ̶̞̻͔̳̫̻̘γ̶̨̮͚̼͚̱̻̗̹̘͇̙͚͊̒ͅα̵̹͕̟̾́π̶̥̘͙̤̗̮̠̝̄́͌̀̍ͅώ̶̧̧̙̥͈͔͚̦̫͂͑̋̎̃́͗̐̓̅̍͗͋̕͝ by Rumbo.*
*Do not stare directly into the source code.*
