import {FileAttachment} from "npm:@observablehq/stdlib";
export const fooJsonData = await FileAttachment("foo-data.json").json();
export const fooCsvData = await FileAttachment("foo-data.csv").text();
