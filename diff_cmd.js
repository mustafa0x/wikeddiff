/*
 * Usage:
 * - `node diff_cmd.js <a> <b>` to diff two files.
 * - `node diff_cmd.js <diff-file>.diff` to diff lines in a diff file.
 *   This is usually more efficient than the first approach
 */
import fs from 'fs'
import WikEdDiff from './diff.js'
import {dirname} from 'path'
import {fileURLToPath} from 'url'

const r = f => fs.readFileSync(f, 'utf8')
function get_file_number() {
    let file_i = 1
    while (fs.existsSync(`diff-${file_i}.html`)) file_i++
    return file_i
}
function separate_diff(diff) {
    const text = {old: '', new: ''}
    let first_pos = true
    for (let line of diff.split('\n')) {
        if (/^(diff|index|--- a\/|\+\+\+ b\/)/.test(line))
            continue
        if (line.startsWith('@@')) {
            if (!first_pos) {
                text.old += '\n...\n'
                text.new += '\n...\n'
            }
            first_pos = false
            continue
        }
        line += '\n'
        const first = line[0]
        if (/-|\+| /.test(line[0]))
            line = line.slice(1)
        if (first === ' ') {
            text.old += line
            text.new += line
        }
        else if (first === '-')
            text.old += line
        else if (first === '+')
            text.new += line
    }
    return text
}

const config = {
    fullDiff: false,
    showBlockMoves: true,
    charDiff: true,
    repeatedDiff: true,
    recursiveDiff: true,
    recursionMax: 5,
    unlinkBlocks: true,
    blockMinLength: 3,
    unlinkMax: 10,
    coloredBlocks: false,
    debug: false,
    timer: false,
    unitTesting: false,
    noUnicodeSymbols: false,
    stripTrailingNewline: false,
}
const differ = (a, b) => (new WikEdDiff(config)).diff(a, b)

let diff
const stdin = fs.readFileSync(0).toString()
if (stdin) {
    const text = separate_diff(stdin)
    diff = differ(text.old, text.new)
}
else if (process.argv[2].endsWith('.diff')) {
    const text = separate_diff(r(process.argv[2]))
    diff = differ(text.old, text.new)
}
else
    diff = differ(r(process.argv[2]), r(process.argv[3]))

const prefix = `<!doctype html>
<meta charset=utf-8>
<style>${r(dirname(fileURLToPath(import.meta.url)) + '/diff-styles.css')}</style>`

fs.writeFileSync(`diff-${get_file_number()}.html`, prefix + diff)
