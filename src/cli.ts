#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Usage: larc <command> [file]");
        console.log("Commands:");
        console.log("  build <file>   Compile the spell (check syntax)");
        console.log("  cast <file>    Execute the spell (interpret)");
        process.exit(1);
    }

    const command = args[0];
    const filePath = args[1];

    if (!filePath) {
        console.error("Error: No file specified.");
        process.exit(1);
    }

    const absolutePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: File not found at ${absolutePath}`);
        process.exit(1);
    }

    const source = fs.readFileSync(absolutePath, 'utf-8');

    try {
        // 1. Lexing
        console.log(`[LARC] Lexing ${path.basename(filePath)}...`);
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        // console.log("Tokens:", tokens.map(t => `${t.type}(${t.value})`).join(" "));

        // 2. Parsing
        console.log(`[LARC] Parsing...`);
        const parser = new Parser(tokens);
        const ast = parser.parse();

        if (command === 'build') {
            console.log(`[LARC] Build successful. ${path.basename(filePath)} is valid.`);
            console.log(JSON.stringify(ast, null, 2));
        } else if (command === 'cast') {
            // 3. Interpreting
            console.log(`[LARC] Casting...`);
            const interpreter = new Interpreter();
            interpreter.interpret(ast);
        } else {
            console.error(`Unknown command: ${command}`);
            process.exit(1);
        }

    } catch (e: any) {
        console.error(`\n[LARC] COMPILATION FAILED:`);
        console.error(`  ${e.message}`);
        process.exit(1);
    }
}

main();
