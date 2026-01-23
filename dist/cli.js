#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const interpreter_1 = require("./interpreter");
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
        const lexer = new lexer_1.Lexer(source);
        const tokens = lexer.tokenize();
        // console.log("Tokens:", tokens.map(t => `${t.type}(${t.value})`).join(" "));
        // 2. Parsing
        console.log(`[LARC] Parsing...`);
        const parser = new parser_1.Parser(tokens);
        const ast = parser.parse();
        // console.log("Imports found:", ast.imports);
        // 2.5 Resolve Imports (Simulated Linker)
        if (ast.imports && ast.imports.length > 0) {
            console.log(`[Linker] Resolving ${ast.imports.length} dependencies...`);
            ast.imports.forEach(imp => {
                const vendorPath = path.join(process.cwd(), 'vendor', imp.path, 'src');
                if (fs.existsSync(vendorPath)) {
                    console.log(`  > Linked ${imp.path} from local vendor cache.`);
                    // Ideally: parse all files in src and add to program body
                    const files = fs.readdirSync(vendorPath).filter(f => f.endsWith('.lmpp'));
                    files.forEach(f => {
                        const libSource = fs.readFileSync(path.join(vendorPath, f), 'utf-8');
                        const libLexer = new lexer_1.Lexer(libSource);
                        const libParser = new parser_1.Parser(libLexer.tokenize());
                        const libAst = libParser.parse();
                        // Merge bodies (Naive)
                        ast.body.push(...libAst.body);
                        console.log(`    + Injected ${f}`);
                    });
                }
                else {
                    console.warn(`  [!] Warning: Dependency ${imp.path} not found in vendor/. Casting may fail.`);
                }
            });
        }
        if (command === 'build') {
            console.log(`[LARC] Build successful. ${path.basename(filePath)} is valid.`);
            console.log(JSON.stringify(ast, null, 2));
        }
        else if (command === 'cast') {
            // 3. Interpreting
            console.log(`[LARC] Casting...`);
            const interpreter = new interpreter_1.Interpreter();
            interpreter.interpret(ast);
        }
        else {
            console.error(`Unknown command: ${command}`);
            process.exit(1);
        }
    }
    catch (e) {
        console.error(`\n[LARC] COMPILATION FAILED:`);
        console.error(`  ${e.message}`);
        process.exit(1);
    }
}
main();
