#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Runner } from './runner';

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
        console.log(`[LARC] Lexing ${path.basename(filePath)}...`);
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();

        console.log(`[LARC] Parsing...`);
        const parser = new Parser(tokens);
        const ast = parser.parse();

        if (ast.imports && ast.imports.length > 0) {
            console.log(`[Linker] Resolving ${ast.imports.length} dependencies...`);
            ast.imports.forEach(imp => {
                const vendorPath = path.join(process.cwd(), 'vendor', imp.path, 'src');
                if (fs.existsSync(vendorPath)) {
                    console.log(`  > Linked ${imp.path} from local vendor cache.`);
                    const files = fs.readdirSync(vendorPath).filter(f => f.endsWith('.lmpp'));
                    files.forEach(f => {
                         const libSource = fs.readFileSync(path.join(vendorPath, f), 'utf-8');
                         const libLexer = new Lexer(libSource);
                         const libParser = new Parser(libLexer.tokenize());
                         const libAst = libParser.parse();
                         ast.body.push(...libAst.body);
                         console.log(`    + Injected ${f}`);
                    });
                } else {
                    console.warn(`  [!] Warning: Dependency ${imp.path} not found in vendor/. Casting may fail.`);
                }
            });
        }

        if (command === 'build') {
            console.log(`[LARC] Build successful. ${path.basename(filePath)} is valid.`);
            console.log(JSON.stringify(ast, null, 2));
        } else if (command === 'cast') {
            console.log(`[LARC] Casting...`);
            await Runner.run(ast);
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
