// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { off } from 'process';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "helloworld" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('allinone.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from allinone!', {modal: true})
    });
    context.subscriptions.push(disposable);


    context.subscriptions.push(vscode.commands.registerTextEditorCommand("allinone.auto_multi_select_with_empty_lines", on_auto_multi_select, {with_empty_lines: true}));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("allinone.auto_multi_select", on_auto_multi_select, {with_empty_lines: false}));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("allinone.auto_indent", on_auto_indent));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("allinone.insert_line_number", on_insert_line_number));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("allinone.sum", on_sum));

}

// this method is called when your extension is deactivated
export function deactivate() { }


function on_auto_multi_select(this: any, textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) {
    let sels_new: vscode.Selection[] = []
    let sels = textEditor.selections
    for (let i in sels) {
        let sel = sels[i]

        for (let i = sel.start.line; i <= sel.end.line; i++) {
            let line = textEditor.document.lineAt(i)
            if (!this.with_empty_lines && !line.range.isEmpty) {
                sels_new.push(new vscode.Selection(line.range.start, line.range.end))
            }
        }
    }

    if (sels_new.length > 0)
        textEditor.edit(_ => {
            textEditor.selections = sels_new
        })
}

function on_auto_indent(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) {
    let most_right = 0
    let lines: Map<number, boolean> = new Map<number, boolean>()

    let sels = textEditor.selections
    for (let i in sels) {
        let sel = sels[i]

        if (lines.has(sel.start.line)) {
            vscode.window.showErrorMessage("同一行不能有多个选择", {modal: true})
            return;
        }
        lines.set(sel.start.line, true)

        if (sel.start.character > most_right) {
            most_right = sel.start.character
        }
    }

    for (let i in sels) {
        let sel = sels[i]
        let offset = most_right - sel.start.character
        if (offset <= 0) continue;
        edit.insert(sel.start, " ".repeat(offset))
    }
}

function on_insert_line_number(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) {
    let sels = textEditor.selections
    for (let i in sels) {
        let sel = sels[i]

        edit.insert(sel.end, sel.end.line.toString())
    }
}

function on_sum(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) {
    let sum = 0
    let sels = textEditor.selections
    for (let i in sels) {
        let sel = sels[i]

        let s = textEditor.document.getText(sel)
        let num = Number(s)
        if (isNaN(num)) {
            vscode.window.showErrorMessage(s + "(on line: " + sel.start.line + ") is not a number", {modal: true})
            return
        }

        sum += num
    }

    vscode.window.showInformationMessage('The sum is: ' + sum, {modal: true});
}
