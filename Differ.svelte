{#if diff}
  <div bind:this={diff_cont}>{@html diff}</div>
{/if}

<script>
import WikEdDiff from './diff.js'
const clamp = (int, min, max) => Math.max(Math.min(int, max), min);

const default_conf = {
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
    dir: 'auto',
}
export let conf = {}
export let to_diff

$: if (to_diff)
    show_diff(...to_diff)

conf = {...default_conf, ...conf}
const init_diff = () => new WikEdDiff(conf)

let diff = ''
let diff_cont
let diff_els = []
export let changes_count = 0
export function show_diff(a_input, b_input) {
    const differ = init_diff()
    differ.config.htmlCode.fragmentStart = `<pre dir=${conf.dir} class=wikEdDiffFragment>`
    diff = differ.diff(a_input, b_input)
    changes_count = differ.fragments.filter(({type}) => ['-', '+', '<', '>'].includes(type)).length
    current_el = -1
    tick().then(() => {
        diff_els = diff_cont.querySelectorAll('.wikEdDiffInsert, .wikEdDiffDelete, .wikEdDiffBlock')
    })
}

let current_el = -1
export function highlight_change(direction) {
    if (!diff_els.length)
        return
    current_el = clamp(current_el + direction, 0, diff_els.length - 1)
    diff_els[current_el].scrollIntoView({behavior: 'smooth', block: 'center'})
    diff_els[current_el].classList.add('active')
    diff_els[current_el].addEventListener('transitionend', function callback(e) {
        // Verify it's not another transition
        if (e.propertyName !== 'background-color') {
            e.target.removeEventListener('transitionend', callback)
            e.target.classList.remove('active')
        }
    })
}
export function clear() {
    diff = ''
}
</script>

<style>
div :global(:is(.wikEdDiffInsert, .wikEdDiffDelete, .wikEdDiffBlock)) {
  text-decoration: none;
  transition: background-color 200ms, padding 200ms;
}
div :global(:is(.wikEdDiffInsert.active, .wikEdDiffDelete.active, .wikEdDiffBlock.active)) {
  background-color: orange !important;
  padding: 0.2rem 0.5rem;
}
</style>
