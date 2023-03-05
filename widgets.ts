import { Command } from "commander";
import { 
    spinnerError,
    spinnerInfo,
    spinnerSuccess,
    updateSpinnerText
} from "./spinner";

export const widgets = new Command("widgets");

widgets.command("list").action(async () => {
    updateSpinnerText("Processing ");
    // do work
    await new Promise(resolve => {
        setTimeout(resolve, 1000);
    });
    spinnerSuccess();
    console.table([
        { id: 1, name: "Tommy"},
        { is: 2, name: "Betty"},
    ])
})

widgets.command("get")
.argument("<id>", "the id of the widget")
.option("-f, --format <format>","the format of the widget")
.action(async (id, options) => {
    updateSpinnerText("Getting widget " + id);
    await new Promise(resolve => setTimeout(resolve, 3000));
    spinnerSuccess();
    console.table({id: 1, name: "Tommy"});
})

widgets.command("unhandled-error").action(async () => {
    updateSpinnerText("Processing an unhandled failure ");
    await new Promise(resolve => setTimeout(resolve, 3000));
    throw new Error("Unhandled error");
})