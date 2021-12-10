{#if diff}
  {@html diff || ''}
{/if}

<script>
import WikEdDiff from './diff.js'

export let diff_conf = {
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

let diff = ''
export function show_diff(a_input, b_input) {
    diff = (new WikEdDiff(diff_conf)).diff(a_input, b_input)
}
export function clear() {
    diff = ''
}
</script>
