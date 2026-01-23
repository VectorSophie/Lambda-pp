export class Thaumaturgy {
    private static readonly RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', '∞', '∑', 'Ω', 'Ψ', 'Φ', '∆'];
    
    public static generateSignature(name: string): string {
        // Advanced Fowler-Noll-Vo (FNV-1a) variant for magical distinctness
        let hash = 0x811c9dc5;
        for (let i = 0; i < name.length; i++) {
            hash ^= name.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }
        
        // Generate a 6-rune unique sequence
        const sequence = Array.from({length: 6}, (_, i) => {
            // Mix hash with position to avoid repeating patterns
            const idx = Math.abs((hash ^ (i * 31337))) % this.RUNES.length;
            return this.RUNES[idx];
        }).join(' ');

        return `[ ${sequence} ]`;
    }

    private static sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static async animateFlux(current: number, change: number) {
        const target = current + change;
        const step = change > 0 ? 1 : -1;
        
        // Don't animate massive jumps too slowly, but keep it visible
        // Max 20 frames
        const totalFrames = Math.abs(change);
        const frameDelay = Math.max(10, Math.min(50, 500 / totalFrames));

        let visualCurrent = current;
        
        // If change is 0 (shouldn't happen often), just print
        if (change === 0) return;

        process.stdout.write('\x1B[?25l'); // Hide Cursor

        for (let i = 0; i <= Math.abs(change); i++) {
            const barLength = Math.max(0, visualCurrent);
            const bar = '▓'.repeat(barLength).padEnd(20, '░');
            
            // "Sparkles" around the active change
            const fluxChar = change > 0 ? '∆' : '∇'; 
            const energy = change > 0 ? '(+)' : '(-)';
            
            const output = `  ${fluxChar} Flux: ${visualCurrent}µ ${bar} ${energy}`;
            
            process.stdout.write(`\r${output}`);
            
            if (visualCurrent !== target) {
                visualCurrent += step;
                await this.sleep(frameDelay);
            }
        }
        
        process.stdout.write('\n\x1B[?25h'); // Newline & Show Cursor
    }

    public static formulateSpell(className: string, method: string): string {
        // ψ(x, t) - Wave function format
        return `\x1B[35m${this.generateSignature(className)}\x1B[0m \x1B[36mΨ(${className}.${method})\x1B[0m = \x1B[33m∂E/∂t\x1B[0m`;
    }

    public static stabilize(): string {
        return `  \x1B[32me^(iπ) + 1 = 0\x1B[0m (Reality Stabilized)`;
    }
}
