global.setInterval = () => {};
global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }
};
const els = {};
function makeEl(id) {
  if (!els[id]) els[id] = {
    _text: '', _html: '', style: {}, classList: { add(){}, remove(){}, contains(){return false;} },
    disabled: false,
    set textContent(v){ this._text = v; }, get textContent(){ return this._text; },
    set innerHTML(v){ this._html = v; }, get innerHTML(){ return this._html; },
    appendChild(){}, addEventListener(){}, querySelectorAll(){ return []; }, title:''
  };
  return els[id];
}
global.document = {
  getElementById: (id) => makeEl(id),
  createElement: () => makeEl('tmp_' + Math.random()),
  addEventListener(){}
};
global.navigator = {};
global.window = { addEventListener(){} };

const fs = require('fs');
const combined = fs.readFileSync('facts.js','utf8') + '\n' + fs.readFileSync('app.js','utf8') + '\n' + fs.readFileSync('tests_inline.js','utf8');
eval(combined);
