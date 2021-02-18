# wikEd diff: inline-style difference engine with block move support

WikEdDiff.php and the JavaScript library wikEd diff are synced one-to-one ports. Changes and
fixes are to be applied to both versions.

JavaScript library (mirror): https://en.wikipedia.org/wiki/User:Cacycle/diff
JavaScript online tool: http://cacycle.altervista.org/wikEd-diff-tool.html
MediaWiki extension: https://www.mediawiki.org/wiki/Extension:wikEdDiff

This difference engine applies a word-based algorithm that uses unique words as anchor points
to identify matching text and moved blocks (Paul Heckel: A technique for isolating differences
between files. Communications of the ACM 21(4):264 (1978)).

## Additional features:

- Visual inline style, changes are shown in a single output text
- Block move detection and highlighting
- Resolution down to characters level
- Unicode and multilingual support
- Stepwise split (paragraphs, lines, sentences, words, characters)
- Recursive diff
- Optimized code for resolving unmatched sequences
- Minimization of length of moved blocks
- Alignment of ambiguous unmatched sequences to next line break or word border
- Clipping of unchanged irrelevant parts from the output (optional)
- Fully customizable
- Text split optimized for MediaWiki source texts
- Well commented and documented code

## Datastructures (abbreviations from publication):

    class WikEdDiffText:  diff text object (new or old version)
      .text                 text of version
      .words[]              word count table
      .first                index of first token in tokens list
      .last                 index of last token in tokens list

      .tokens[]:          token list for new or old string (doubly-linked list) (N and O)
        .prev               previous list item
        .next               next list item
        .token              token string
        .link               index of corresponding token in new or old text (OA and NA)
        .number             list enumeration number
        .unique             token is unique word in text

    class WikEdDiff:      diff object
      .config[]:            configuration settings, see top of code for customization options
         .regExp[]:            all regular expressions
             .split             regular expressions used for splitting text into tokens
         .htmlCode            HTML code fragments used for creating the output
         .msg                 output messages
      .newText              new text
      .oldText              old text
      .maxWords             word count of longest linked block
      .html                 diff html
      .error                flag: result has not passed unit tests
      .bordersDown[]        linked region borders downwards, [new index, old index]
      .bordersUp[]          linked region borders upwards, [new index, old index]
      .symbols:             symbols table for whole text at all refinement levels
        .token[]              hash table of parsed tokens for passes 1 - 3, points to symbol[i]
        .symbol[]:            array of objects that hold token counters and pointers:
          .newCount             new text token counter (NC)
          .oldCount             old text token counter (OC)
          .newToken             token index in text.newText.tokens
          .oldToken             token index in text.oldText.tokens
        .linked               flag: at least one unique token pair has been linked

      .blocks[]:            array, block data (consecutive text tokens) in new text order
        .oldBlock             number of block in old text order
        .newBlock             number of block in new text order
        .oldNumber            old text token number of first token
        .newNumber            new text token number of first token
        .oldStart             old text token index of first token
        .count                number of tokens
        .unique               contains unique linked token
        .words                word count
        .chars                char length
        .type                 '=', '-', '+', '|' (same, deletion, insertion, mark)
        .section              section number
        .group                group number of block
        .fixed                belongs to a fixed (not moved) group
        .moved                moved block group number corresponding with mark block
        .text                 text of block tokens

      .sections[]:          array, block sections with no block move crosses outside a section
        .blockStart           first block in section
        .blockEnd             last block in section

      .groups[]:            array, section blocks that are consecutive in old text order
        .oldNumber            first block oldNumber
        .blockStart           first block index
        .blockEnd             last block index
        .unique               contains unique linked token
        .maxWords             word count of longest linked block
        .words                word count
        .chars                char count
        .fixed                not moved from original position
        .movedFrom            group position this group has been moved from
        .color                color number of moved group

      .fragments[]:         diff fragment list ready for markup, abstraction layer for customization
        .text                 block or mark text
        .color                moved block or mark color number
        .type                 '=', '-', '+'   same, deletion, insertion
                              '<', '>'        mark left, mark right
                              '(<', '(>', ')' block start and end
                              '~', ' ~', '~ ' omission indicators
                              '[', ']', ','   fragment start and end, fragment separator
                              '{', '}'        container start and end
