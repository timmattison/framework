import {Runtime} from "observablehq:runtime";
import {registerDatabase, registerFile} from "observablehq:stdlib";
import {DatabaseClient, FileAttachment, Generators, Mutable} from "observablehq:stdlib";
import {inspect, inspectError} from "./inspect.js";
import * as recommendedLibraries from "./stdlib/recommendedLibraries.js";
import * as sampleDatasets from "./stdlib/sampleDatasets.js";

const library = {
  now: () => Generators.now(),
  width: () => Generators.width(document.querySelector("main")),
  DatabaseClient: () => DatabaseClient,
  FileAttachment: () => FileAttachment,
  Generators: () => Generators,
  Mutable: () => Mutable,
  ...recommendedLibraries,
  ...sampleDatasets
};

const runtime = new Runtime(library);
export const main = runtime.module();

export const cellsById = new Map(); // TODO hide

export function define(cell) {
  const {id, inline, inputs = [], outputs = [], files = [], databases = [], body} = cell;
  const variables = [];
  cellsById.get(id)?.variables.forEach((v) => v.delete());
  cellsById.set(id, {cell, variables});
  const root = document.querySelector(`#cell-${id}`);
  let reset = null;
  const clear = () => ((root.innerHTML = ""), (reset = null));
  const display = inline
    ? (v) => {
        reset?.();
        if (isNode(v) || typeof v === "string" || !v?.[Symbol.iterator]) root.append(v);
        else root.append(...v);
        return v;
      }
    : (v) => {
        reset?.();
        root.append(isNode(v) ? v : inspect(v));
        return v;
      };
  const v = main.variable(
    {
      pending: () => (reset = clear),
      fulfilled: () => reset?.(),
      rejected: (error) => (reset?.(), root.append(inspectError(error)))
    },
    {
      shadow: {
        display: () => display,
        view: () => (v) => Generators.input(display(v))
      }
    }
  );
  v.define(outputs.length ? `cell ${id}` : null, inputs, body);
  variables.push(v);
  for (const o of outputs) variables.push(main.variable(true).define(o, [`cell ${id}`], (exports) => exports[o]));
  for (const f of files) registerFile(f.name, f);
  for (const d of databases) registerDatabase(d.name, d);
}

// Note: Element.prototype is instanceof Node, but cannot be inserted!
function isNode(value) {
  return value instanceof Node && value instanceof value.constructor;
}
