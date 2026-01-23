# Evocation Library (Standard Issue)

**Version:** 1.0.0 (The "Fire Hot" Update)
**Maintainer:** Archmage Ignis (Deceased, but spirit remains active on GitHub)

## Overview
This library provides the foundational types and base classes for all Evocation magic. 
Attempting to cast fireball without extending `EvocationSpell` constitutes a Class 3 Arcane Violation.

## Installation
```
import "github.com/archmage/evocation"
```

## Classes

### `School` (Enum)
Defines the 8 classic schools of magic. 
*Note: Necromancy is included for "academic purposes only".*

### `EvocationSpell<T>` (Abstract)
Base class for anything that goes boom.
- Handles default `ManaCost` validation.
- Provides `backlash()` protection (mostly).

## License
MIT (Magical Indemnity Treaty). You burn it, you bought it.
