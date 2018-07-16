console.log("%cLoad libraries " + new Date(), 'color: #00f');
// loaded first
import '../css/main.scss';

window.$ = require('jquery');
window.moment = require('moment');
import _ from 'lodash';
import EmojiConvertor from 'emoji-js';
window.emoji = new EmojiConvertor();

import { TweenMax, Power2, CSSPlugin } from "gsap/TweenMax";