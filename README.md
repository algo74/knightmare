# Chicken Knightmare

A browser-based arcade game where you pilot a chess **knight** across a
continuously scrolling board, capturing pieces for points while avoiding capture.

**Play it live:** https://algo74.github.io/knightmare/

**Game demo:** https://algo74.github.io/knightmare/index.1.html

## Gameplay
- Move using the knight's L-shaped moves.
- Capture pieces for points — pawn (100), bishop (500), knight (1000),
  rook (2000), queen (5000) — while the board scrolls and new pieces appear.
- Enemy pieces can capture you; get taken and it's game over.
- An optional built-in AI can play for you, evaluating each candidate move
  with a scoring heuristic and choosing the best one.

## Tech stack
- Vanilla JavaScript, HTML5, CSS3
- jQuery / jQuery UI for DOM and interaction
- Jasmine for unit tests (`SpecRunner.html`)
- ESLint (standard config) for linting
- Deployed as a static site on GitHub Pages

## Architecture
- `game_engine.js` — game state, board, rules, scoring, and rendering
- `game_ai.js` — autonomous move-selection AI (look-ahead move scoring)

## Running locally
```bash
git clone https://github.com/algo74/knightmare.git
cd knightmare
# open index.html in a browser, or serve the folder:
npx serve .
```

## Tests
Open `SpecRunner.html` in a browser to run the Jasmine specs.
