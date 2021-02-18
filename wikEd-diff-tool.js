// @name        wikEd diff tool
// @version     1.0.0
// @date        September 25, 2014
// @description online tool for improved word-based diff library with block move detection
// @homepage    https://cacycle.altervista.org/wikEd-diff-tool.html
// @requires    https://en.wikipedia.org/w/index.php?title=User:Cacycle/diff.js&action=raw&ctype=text/javascript
// @author      Cacycle (https://en.wikipedia.org/wiki/User:Cacycle)
// @license     released into the public domain

// JSHint options: W004: is already defined, W100: character may get silently deleted
/* jshint -W004, -W100, newcap: true, browser: true, jquery: true, sub: true, bitwise: true, curly: true, evil: true, forin: true, freeze: true, globalstrict: true, immed: true, latedef: true, loopfunc: true, quotmark: single, strict: true, undef: true */
/* global console */

import WikEdDiff from './diff.js';
const $ = (s, cont) => (cont || document).querySelector(s);
const $$ = (s, cont) => (cont || document).querySelectorAll(s);

// define global objects
var config = {};

const WikEdDiffTool = {
    init() {
        // define all wikEdDiff options
        this.options = [
            'fullDiff',
            'showBlockMoves',
            'charDiff',
            'repeatedDiff',
            'recursiveDiff',
            'recursionMax',
            'unlinkBlocks',
            'blockMinLength',
            'unlinkMax',
            'coloredBlocks',
            'debug',
            'timer',
            'unitTesting',
            'noUnicodeSymbols',
            'stripTrailingNewline'
        ];

        // continue after content has loaded
        window.addEventListener('DOMContentLoaded', () => { this.load(); });
    },

    load() {
      // attach event handlers
        $('#old').addEventListener('dragover', () => { this.dragHandler(); }, false);
        $('#old').addEventListener('drop', () => { this.dropHandler(); }, false);

        $('#new').addEventListener('dragover', () => { this.dragHandler(); }, false);
        $('#new').addEventListener('drop', () => { this.dropHandler(); }, false);

        document.body.addEventListener('dragover', () => { this.preventDropHandler(); }, false);

        // call diff
        window.addEventListener('load', () => { this.diff(); });
    },

    diff() {
        // get form options
        for (var option = 0; option < this.options.length; option ++) {
            config[this.options[option]] = document.getElementById(this.options[option]).checked === true;
        }
        config.blockMinLength = +$('#blockMinLength').value;
        config.unlinkMax = +$('#unlinkMax').value;
        config.recursionMax = +$('#recursionMax').value;

        $('#diff').innerHTML = (new WikEdDiff(config)).diff($('#old').value, $('#new').value);
    },

    example() {
        $('#old').value = 'Chocolate is a typically sweet, usually brown, food preparation of seeds, roasted in the form of a liquid, paste or in a block and ground, often flavored, as with vanilla. It is made or used as a flavoring ingredient. Cacao has been cultivated by many cul tures for at lesst three millennia in Mexico and Central America. The earliest evidence of use traces to the Mokaya, with back to 1900 evidence of chocolate beverages dating BC. See also: \n- Candy making\n- Chocolate almonds';

        $('#new').value = 'Chocolate is a food preparation of Theobroma cacao seeds, roasted and ground, often flavored, as with vanilla. It is made in the form of a liquid, paste or in a block or used as a flavoring ingredient. Cacao has been cultivated by many cultures for at least three millennia in Mexico and Central America. The earliest evidence of use traces to the Mokaya, with evidence of chocolate beverages dating back to 1900 BC. See also:\n- Candy making\n- Chocolate chip\n- Chocolate almonds';

        this.diff();
    },

    clear() {
        $('#old').value = '';
        $('#new').value = '';
        this.diff();
    },

    //
    // WikEdDiffTool.getFileText(): get text file content, cycles through all files in file list object
    //
    getFileText(fileListObj, target, fileNumber) {
        if (fileNumber >= fileListObj.length)
            return;

        var fileObj = fileListObj[fileNumber];
        if (target.value !== '')
            target.value += '\n\n'

        // get size and format
        var size = fileObj.size;
        var sizeFormatted = size + '';
        sizeFormatted = sizeFormatted.replace(/(\d\d\d)?(\d\d\d)?(\d\d\d)?(\d\d\d)$/, ',$1,$2,$3,$4')
                                     .replace(/^,+/, '')
                                     .replace(/,,+/, ',');
        target.value += encodeURI(fileObj.name) + ' (' + sizeFormatted + ' bytes):\n';

        // check file length
        var contentMB = parseInt(size / 1024 / 1024 * 10) / 10;
        if (contentMB > 10) {
            target.value += 'Error: file larger than 10 MB (' + contentMB + ' MB)\n';
            this.getFileText(fileListObj, target, fileNumber + 1);
            return;
        }

        // read file content asynchronously
        var readerObj = new FileReader();
        readerObj.onload = function() {
            target.value += readerObj.result;
            this.getFileText(fileListObj, target, fileNumber + 1);
        }
        readerObj.readAsText(fileObj);
    },

    //
    // WikEdDiffTool.dropHandler(): event handler for dropping files on old or new fields
    //
    dropHandler(event) {
        event.stopPropagation();
        event.preventDefault();

        // get FileList object.
        var fileListObj = event.dataTransfer.files;
        event.target.value = '';

        // get text from dropped files
        this.getFileText(fileListObj, event.target, 0)
    },

    //
    // WikEdDiffTool.dragHandler(): event handler for dropping files on old or new fields
    //
    dragHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    },


    //
    // WikEdDiffTool.preventDropHandler(): disable drag and drop over certain elements
    //
    preventDropHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'none';
    },
};

// initialize WikEdDiffTool
WikEdDiffTool.init();
window.WikEdDiffTool = WikEdDiffTool;
