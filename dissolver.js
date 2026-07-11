const dissolver = function(ART) {

  // Split into lines, keep exact spacing.
  const lines = ART.replace(/\n$/, "").split("\n");

  // Flatten into a single array of characters + per-char random reveal threshold.
  // Only non-space characters get a threshold; spaces stay spaces forever.
  const rows = lines.map(line => {
    return Array.from(line).map(ch => {
      return {
        ch,
        isSpace: ch === " ",
        // Random value in [0,1). A character disappears once the current
        // "hidden fraction" exceeds this value, and reappears once it drops
        // back below it -- so each cycle removes/restores chars in the same
        // stable order, giving a smooth dissolve instead of pure flicker.
        threshold: Math.random()
      };
    });
  });

  const pre = document.getElementById("art");

  // Animation timing
  const CYCLE_MS = 6000;       // time for 0% -> 100% -> 0%
  const FPS_INTERVAL = 1000 / 20; // cap redraws to ~20fps for performance
  let lastDraw = 0;

    function easeExpo(t) {
    return Math.pow(t, 3); // higher = snappier peak, lower = gentler
    }
  
  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function currentHiddenFraction(elapsed) {
    const t = (elapsed % CYCLE_MS) / CYCLE_MS; // 0..1 over full cycle
    // triangle wave 0 -> 1 -> 0
    // const tri = t < 0.5 ? t * 2 : (1 - t) * 2;
    // return easeInOutSine(tri);
    const tri = t < 0.5 ? t * 2 : (1 - t) * 2;
    return easeExpo(tri); 
}

  function render(hiddenFraction) {
    const out = new Array(rows.length);
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      let line = "";
      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        if (cell.isSpace) {
          line += " ";
        } else if (cell.threshold < hiddenFraction) {
          line += " "; // hidden this frame
        } else {
          line += cell.ch;
        }
      }
      out[r] = line;
    }
    pre.textContent = out.join("\n");
  }

  function tick(now) {
    if (now - lastDraw >= FPS_INTERVAL) {
      lastDraw = now;
      const hiddenFraction = currentHiddenFraction(now);
      render(hiddenFraction);
    }
    requestAnimationFrame(tick);
  }

  render(0);
  requestAnimationFrame(tick);
};