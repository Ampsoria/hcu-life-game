import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const listeners = {};
const saved = new Map();
const buttons = Array.from({length:2}, () => {
  const attrs = {};
  const label = {textContent:'เพลง: เปิด'};
  const icon = {textContent:'♫'};
  return {
    attrs, label, icon, title:'',
    setAttribute(name, value) { attrs[name] = value; },
    querySelector(selector) { return selector === '.music-text' ? label : icon; },
    classList:{toggle() {}}
  };
});
let scheduled = null;
let played = 0;
let closed = 0;
const connectable = () => ({connect() { return this; }});
class FakeAudioContext {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  createGain() { return {...connectable(), gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}}}; }
  createBiquadFilter() { return {...connectable(), frequency:{setValueAtTime(){}}}; }
  createOscillator() { return {...connectable(), frequency:{setValueAtTime(){}},start(){played++},stop(){}}; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  close() { this.state = 'closed'; closed++; return Promise.resolve(); }
}
const document = {
  hidden:false,
  addEventListener(name, fn) { listeners[name] = fn; },
  querySelectorAll() { return buttons; },
  getElementById() { return {}; }
};
const sandbox = {
  window:{AudioContext:FakeAudioContext}, document,
  localStorage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)},
  MutationObserver:class { observe() {} },
  setInterval(fn) { scheduled = fn; return 1; },
  clearInterval() { scheduled = null; },
  console
};
vm.runInNewContext(fs.readFileSync(new URL('../dist/music.js',import.meta.url),'utf8'),sandbox);
assert.equal(buttons[0].attrs['aria-pressed'],'true');
listeners.click({target:{closest:()=>null}});
assert.ok(played > 0,'first user click should begin scheduling notes');
assert.equal(typeof scheduled,'function');
const before = played;
scheduled();
assert.ok(played >= before);
listeners.click({target:{closest:()=>buttons[0]}});
assert.equal(saved.get('hcu-life-music-enabled'),'false');
assert.equal(buttons[1].attrs['aria-pressed'],'false');
assert.equal(buttons[0].label.textContent,'เพลง: ปิด');
assert.equal(scheduled,null);
assert.equal(closed,1);
listeners.click({target:{closest:()=>buttons[1]}});
assert.equal(saved.get('hcu-life-music-enabled'),'true');
assert.equal(buttons[0].attrs['aria-pressed'],'true');
assert.equal(buttons[1].label.textContent,'เพลง: เปิด');
assert.equal(typeof scheduled,'function');
document.hidden = true;
listeners.visibilitychange();
assert.equal(scheduled,null,'hidden page should stop its scheduler');
console.log('music: start, toggle, persistence, and background pause verified');
