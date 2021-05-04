---
'value-or-promise': patch
---

fix(resolve): always resolve to actual Promise

Even though ValueOrPromise objects can be initialized with anything PromiseLike, it is helpful to have them always resolve to either values or to actual promises.
