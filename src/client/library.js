import {dot} from "./dot.js";
import {mermaid} from "./mermaid.js";
import {Mutable} from "./mutable.js";
import {Library} from "./runtime.js";
import {tex} from "./tex.js";
import {width} from "./width.js";

export function makeLibrary() {
  const library = new Library();
  return Object.assign(library, {
    width: () => width(library),
    Mutable: () => Mutable(library),
    // Override the common recommended libraries so that if a user imports them,
    // they get the same version that the standard library provides (rather than
    // loading the library twice). Also, it’s nice to avoid require!
    d3: () => import("https://cdn.jsdelivr.net/npm/d3/+esm"),
    htl: () => import("https://cdn.jsdelivr.net/npm/htl/+esm"),
    html: () => import("https://cdn.jsdelivr.net/npm/htl/+esm").then((htl) => htl.html),
    svg: () => import("https://cdn.jsdelivr.net/npm/htl/+esm").then((htl) => htl.svg),
    Plot: () => import("https://cdn.jsdelivr.net/npm/@observablehq/plot/+esm"),
    Inputs: () => {
      // TODO Observable Inputs needs to include the CSS in the dist folder
      // published to npm, and we should replace the __ns__ namespace with
      // oi-{hash} in the ES module distribution, somehow.
      const inputs = import("https://cdn.jsdelivr.net/npm/@observablehq/inputs/+esm");
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/gh/observablehq/inputs/src/style.css";
      document.head.append(link);
      return inputs;
    },
    tex,
    dot,
    mermaid
  });
}