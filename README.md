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
λ++ supports threading, but race conditions manifest as **Time Freezes**.

```java
Thread t = new Thread(() -> {
    // This happens in parallel universe A
    drawCircle();
});
t.start();
// This happens in parallel universe B
chant();
```

---

## Getting Started

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

### Compiling
Run the **LARC** (Lambda Architect Rumbo's Compiler):

```bash
larc cast Doom.lmpp
```

**Output:**
```
[Registry] Registered ritual: Doom
[Runtime] Invoking Doom.main()...
Omae wa mou shindeiru.
[Runtime] Mana pool balanced. Reality is stable.
```

---

## The Standard Library (Grimoire)

- `System.out.println(String)`: Shouts into the void.
- `Mana.allocate(int)`: Borrows energy from the universe.
- `Mana.free(ManaPtr)`: Pays it back.
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

---

*Made with mana and ἀ̶̞̻͔̳̫̻̘γ̶̨̮͚̼͚̱̻̗̹̘͇̙͚͊̒ͅα̵̹͕̟̾́π̶̥̘͙̤̗̮̠̝̄́͌̀̍ͅώ̶̧̧̙̥͈͔͚̦̫͂͑̋̎̃́͗̐̓̅̍͗͋̕͝ by Rumbo.*
*Do not stare directly into the source code.*
