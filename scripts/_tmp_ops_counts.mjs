const res = await fetch('https://kingfisherwings-backend.onrender.com/docs-json');
const t = await res.text();
for (const needle of ['ops_continuum', 'comments_count', 'follow_ups_count', 'OpsContinuum']) {
  let idx = 0;
  let n = 0;
  while ((idx = t.indexOf(needle, idx)) !== -1 && n < 3) {
    console.log('\n---', needle, idx, '---');
    console.log(t.slice(Math.max(0, idx - 80), idx + 220));
    idx += needle.length;
    n++;
  }
}
