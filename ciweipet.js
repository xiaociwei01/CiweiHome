/* ================================================================
   🦔 Ciwei Pet · 内联桌面宠物脚本 v2
   依赖：ciwei-pet.css
   新增：缩放功能 + 长按触发菜单（触屏友好）
================================================================ */
(function () {
    'use strict';

    if (window.__ciweiPetLoaded) return;
    window.__ciweiPetLoaded = true;

    // ============================================================
    // 配置
    // ============================================================
    var IMG_BASE = 'https://xiaociwei01.github.io/CiweiPet/';
    var IMAGES = {
        idle1:     IMG_BASE + 'idle-1.png',
        idle2:     IMG_BASE + 'idle-2.png',
        blink:     IMG_BASE + 'blink.png',
        surprised: IMG_BASE + 'surprised.png',
        happy:     IMG_BASE + 'happy.png',
        angry:     IMG_BASE + 'angry.png',
        sleep:     IMG_BASE + 'sleep.png'
    };

    // 尺寸档位（相对基准尺寸的倍数）
    var SCALES = [0.7, 0.85, 1.0, 1.25, 1.5, 2.0];
    var DEFAULT_SCALE_INDEX = 2;  // 1.0

    var MSG = {
        c1:  ['你戳我干什么？', '干嘛呀～', '有事吗？', '唔？'],
        c2:  ['又戳？', '别闹～', '住手！'],
        c3:  ['别戳了！', '再戳我就跑了！', '哼！'],
        c5:  ['喂！我生气了！', '小心我咬你！', '💢'],
        c8:  ['行吧你赢了……', '求你了放过我吧 🥺', '我认输……'],
        idle: [
            '今天天气不错～', '写代码好累啊', '有人在吗？', '我又饿了',
            '☕ 来杯咖啡', '记得按时吃饭', '熬夜对身体不好哦',
            '🦔 刺猬永不认输', '在想什么呢……', '要不要一起摸鱼？',
            '嗯…发呆中…', '有点无聊～'
        ],
        pet:  ['嘿嘿～好开心！', '咕噜咕噜~', '再摸摸嘛～', '好舒服~'],
        food: ['🍎 好吃！谢谢～', '吧唧吧唧…', '还要还要！'],
        sleep:['晚安～', '好困……我先睡一会儿', '呼呼呼……', '有点困了……'],
        wake: ['唔……醒啦！', '谁呀…好困…', '呼啊——'],
        spin: ['转圈圈～', '晕了晕了…', '🔄 看我表演！'],
        roam: ['散散步～', '走走走～', '换个地方待会儿'],
        longTimeNoSee: ['好久不见…', '你去哪儿了？', '想你了～'],
        scaleMax: ['已经最大啦～', '不能再大咯～'],
        scaleMin: ['已经最小啦～', '不能再小咯～']
    };

    var KEYS = {
        pos:     'ciwei_pet_position',
        sleeping:'ciwei_pet_sleeping',
        last:    'ciwei_pet_last_interaction',
        clicks:  'ciwei_pet_click_count',
        hidden:  'ciwei_pet_hidden',
        sound:   'ciwei_pet_sound',
        scale:   'ciwei_pet_scale_index'
    };

    var SIZE_DESKTOP = 120;
    var SIZE_MOBILE  = 88;
    var LONG_PRESS_MS = 500;   // 长按触发菜单的毫秒数
    var MOVE_THRESHOLD = 6;    // 移动阈值（区分拖拽/长按）

    // ============================================================
    // 工具
    // ============================================================
    var rand = function (a, b) { return a + Math.random() * (b - a); };
    var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
    var clamp = function (v, a, b) { return Math.max(a, Math.min(v, b)); };
    var isMobile = function () { return window.matchMedia('(max-width: 600px)').matches; };
    var lsGet = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
    var lsSet = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };

    // ============================================================
    // 动态创建 DOM
    // ============================================================
    var host = document.createElement('div');
    host.id = 'ciwei-pet';
    host.innerHTML =
        '<div class="cp-bubble"></div>' +
        '<div class="cp-toolbar">' +
            '<button class="cp-toolbar-btn" data-action="love"  title="摸摸头">❤️</button>' +
            '<button class="cp-toolbar-btn" data-action="food"  title="喂食">🍎</button>' +
            '<button class="cp-toolbar-btn" data-action="sleep" title="哄睡">💤</button>' +
            '<button class="cp-toolbar-btn" data-action="spin"  title="转圈">🔄</button>' +
            '<button class="cp-toolbar-btn" data-action="reset" title="归位">🏠</button>' +
        '</div>' +
        '<div class="cp-body">' +
            '<div class="cp-tilt">' +
                '<img class="cp-img" alt="小刺猬" draggable="false">' +
                '<div class="cp-light"></div>' +
            '</div>' +
            '<div class="cp-shadow"></div>' +
            '<div class="cp-zzz">💤</div>' +
        '</div>';

    var particleLayer = document.createElement('div');
    particleLayer.id = 'ciwei-pet-particles';

    var menu = document.createElement('div');
    menu.id = 'ciwei-pet-menu';
    menu.innerHTML =
        '<div class="cp-mi" data-menu="love">❤️ <span>摸摸头</span></div>' +
        '<div class="cp-mi" data-menu="food">🍎 <span>喂食</span></div>' +
        '<div class="cp-mi" data-menu="sleep">💤 <span>哄睡</span></div>' +
        '<div class="cp-sep"></div>' +
        '<div class="cp-mi" data-menu="spin">🔄 <span>转圈圈</span></div>' +
        '<div class="cp-mi" data-menu="roam">🚶 <span>散散步</span></div>' +
        '<div class="cp-mi" data-menu="reset">🏠 <span>回角落</span></div>' +
        '<div class="cp-sep"></div>' +
        '<div class="cp-mi" data-menu="scale-up">🔍➕ <span>放大</span></div>' +
        '<div class="cp-mi" data-menu="scale-down">🔍➖ <span>缩小</span></div>' +
        '<div class="cp-mi highlight" data-menu="scale-reset">' +
            '📏 <span>重置大小</span>' +
            '<span class="cp-mi-check" id="cp-scale-check">100%</span>' +
        '</div>' +
        '<div class="cp-sep"></div>' +
        '<div class="cp-mi active" data-menu="sound">' +
            '🔊 <span>音效</span>' +
            '<span class="cp-mi-check" id="cp-sound-check">开启</span>' +
        '</div>' +
        '<div class="cp-mi" data-menu="fps">' +
            '📊 <span>帧率</span>' +
            '<span class="cp-mi-check" id="cp-fps-check">--</span>' +
        '</div>' +
        '<div class="cp-sep"></div>' +
        '<div class="cp-mi danger" data-menu="hide">🙈 <span>隐藏</span></div>';

    var restoreBtn = document.createElement('div');
    restoreBtn.id = 'ciwei-pet-restore';
    restoreBtn.textContent = '🦔';

    function mount() {
        if (!document.body) { setTimeout(mount, 20); return; }
        document.body.appendChild(particleLayer);
        document.body.appendChild(menu);
        document.body.appendChild(restoreBtn);
        document.body.appendChild(host);
        init();
    }

    // ============================================================
    // DOM 引用
    // ============================================================
    var img      = host.querySelector('.cp-img');
    var bodyEl   = host.querySelector('.cp-body');
    var tiltEl   = host.querySelector('.cp-tilt');
    var lightEl  = host.querySelector('.cp-light');
    var bubble   = host.querySelector('.cp-bubble');
    var toolbar  = host.querySelector('.cp-toolbar');
    var soundChk = menu.querySelector('#cp-sound-check');
    var fpsChk   = menu.querySelector('#cp-fps-check');
    var scaleChk = menu.querySelector('#cp-scale-check');

    // ============================================================
    // 状态
    // ============================================================
    var S = {
        x: 0, y: 0,
        sleeping: false,
        hidden: false,
        clicks: 0,
        last: Date.now(),
        face: 'idle1',
        dragging: false,
        moved: false,
        longPressed: false,
        sClientX: 0, sClientY: 0,
        sPosX: 0, sPosY: 0,
        vx: 0, vy: 0,
        lastMoveX: 0, lastMoveY: 0, lastMoveTime: 0,
        sliding: false,
        soundOn: true,
        mood: 60,
        scaleIndex: DEFAULT_SCALE_INDEX,
        bubbleTimer: null,
        typeTimer: null,
        resetTimer: null,
        struggleTimer: null,
        idleActionTimer: null,
        zzzTimer: null,
        avoidTimer: null,
        avoidCooldown: 0,
        longPressTimer: null,
        mouseX: window.innerWidth / 2,
        mouseY: window.innerHeight / 2,
        mouseActive: false
    };

    var lastLongPressTime = 0;

    // ============================================================
    // 帧率检测
    // ============================================================
    var measuredFPS = 60;
    var fpsFrames = 0;
    var fpsStart = performance.now();
    var fpsHistory = [];

    function tickFPS(now) {
        fpsFrames++;
        var elapsed = now - fpsStart;
        if (elapsed >= 500) {
            var m = Math.round(fpsFrames * 1000 / elapsed);
            fpsHistory.push(m);
            if (fpsHistory.length > 6) fpsHistory.shift();
            var sum = 0;
            for (var i = 0; i < fpsHistory.length; i++) sum += fpsHistory[i];
            measuredFPS = Math.round(sum / fpsHistory.length);

            var cls = 'mid';
            if (measuredFPS >= 90) cls = 'high';
            else if (measuredFPS < 45) cls = 'low';
            document.body.dataset.fps = cls;

            if (fpsChk) fpsChk.textContent = measuredFPS + 'fps';
            fpsFrames = 0;
            fpsStart = now;
        }
    }

    function particleFactor() {
        if (measuredFPS >= 100) return 1.4;
        if (measuredFPS >= 60)  return 1.0;
        if (measuredFPS >= 40)  return .75;
        return .5;
    }

    // ============================================================
    // 尺寸 / 缩放
    // ============================================================
    function getBaseSize() {
        return isMobile() ? SIZE_MOBILE : SIZE_DESKTOP;
    }
    function getSize() {
        return Math.round(getBaseSize() * SCALES[S.scaleIndex]);
    }
    function getScalePercent() {
        return Math.round(SCALES[S.scaleIndex] * 100);
    }

    function applySize() {
        var size = getSize();
        host.style.setProperty('--cp-size', size + 'px');
    }

    function applyScale() {
        host.classList.add('scaling');
        applySize();

        // 缩放后重新约束位置（避免超出屏幕）
        var c = clampPos(S.x, S.y);
        S.x = c.x; S.y = c.y;
        host.style.transform = 'translate3d(' + c.x + 'px,' + c.y + 'px,0)';
        updateFlip();

        // 强制 reflow 后再移除 scaling 类
        void host.offsetWidth;
        requestAnimationFrame(function () {
            host.classList.remove('scaling');
        });

        savePos();
        saveScale();
        updateScaleDisplay();
    }

    function saveScale() {
        lsSet(KEYS.scale, String(S.scaleIndex));
    }

    function updateScaleDisplay() {
        if (scaleChk) scaleChk.textContent = getScalePercent() + '%';
    }

    function doScaleUp() {
        if (S.scaleIndex >= SCALES.length - 1) {
            showBubble(pick(MSG.scaleMax), 1400, false);
            return;
        }
        S.scaleIndex++;
        applyScale();
        initAudio();
        SFX.pet();
        burst('✨', 3);
        showBubble('🔍➕ ' + getScalePercent() + '%', 1200, false);
    }

    function doScaleDown() {
        if (S.scaleIndex <= 0) {
            showBubble(pick(MSG.scaleMin), 1400, false);
            return;
        }
        S.scaleIndex--;
        applyScale();
        initAudio();
        SFX.pet();
        burst('✨', 3);
        showBubble('🔍➖ ' + getScalePercent() + '%', 1200, false);
    }

    function doScaleReset() {
        if (S.scaleIndex === DEFAULT_SCALE_INDEX) {
            showBubble('已经是默认大小～', 1200, false);
            return;
        }
        S.scaleIndex = DEFAULT_SCALE_INDEX;
        applyScale();
        initAudio();
        SFX.pet();
        burst('📏', 3);
        showBubble('📏 恢复 100%', 1400, false);
    }

    // ============================================================
    // 位置
    // ============================================================
    function setPos(x, y, animate) {
        S.x = x; S.y = y;
        if (animate) {
            host.classList.add('animating');
            clearTimeout(host._animTimer);
            host._animTimer = setTimeout(function () {
                host.classList.remove('animating');
            }, 600);
        }
        host.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        updateFlip();
    }

    function clampPos(x, y) {
        var s = getSize();
        return {
            x: clamp(x, 0, Math.max(0, window.innerWidth  - s)),
            y: clamp(y, 0, Math.max(0, window.innerHeight - s))
        };
    }

    function updateFlip() {
        var s = getSize();
        if (S.y < 70) host.classList.add('bubble-below');
        else          host.classList.remove('bubble-below');
        if (S.y + s + 70 > window.innerHeight) host.classList.add('toolbar-above');
        else                                    host.classList.remove('toolbar-above');
    }

    // ============================================================
    // 持久化
    // ============================================================
    function savePos() { lsSet(KEYS.pos, JSON.stringify({ x: Math.round(S.x), y: Math.round(S.y) })); }
    function saveLast() { S.last = Date.now(); lsSet(KEYS.last, String(S.last)); }
    function saveSleep() { lsSet(KEYS.sleeping, S.sleeping ? 'true' : 'false'); }
    function saveClicks() { lsSet(KEYS.clicks, String(S.clicks)); }
    function saveHidden() { lsSet(KEYS.hidden, S.hidden ? 'true' : 'false'); }
    function saveSound() { lsSet(KEYS.sound, S.soundOn ? 'true' : 'false'); }

    // ============================================================
    // 图片 & 心情
    // ============================================================
    function setImage(name) {
        if (!IMAGES[name]) return;
        S.face = name;
        img.src = IMAGES[name];
    }

    function updateMoodColor() {
        var t = clamp(S.mood, 0, 100) / 100;
        var r = Math.round(255 - t * 167);
        var g = Math.round(140 + t * 26);
        var b = Math.round(100 + t * 155);
        host.style.setProperty('--cp-accent', r + ',' + g + ',' + b);
    }

    // ============================================================
    // 音效
    // ============================================================
    var audioCtx = null;
    function initAudio() {
        if (audioCtx) return;
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    function tone(opt) {
        if (!S.soundOn || !audioCtx) return;
        try {
            var t = audioCtx.currentTime;
            var o = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            o.type = opt.type || 'sine';
            o.frequency.setValueAtTime(opt.freq || 440, t);
            if (opt.slideTo) o.frequency.exponentialRampToValueAtTime(opt.slideTo, t + (opt.dur || .1));
            g.gain.setValueAtTime(opt.gain || .05, t);
            g.gain.exponentialRampToValueAtTime(.001, t + (opt.dur || .1));
            o.connect(g).connect(audioCtx.destination);
            o.start(t); o.stop(t + (opt.dur || .1));
        } catch (e) {}
    }
    var SFX = {
        click:  function () { tone({ freq: 660, dur: .09, type: 'triangle', gain: .05, slideTo: 880 }); },
        pet:    function () { tone({ freq: 523, dur: .15, gain: .05, slideTo: 784 }); },
        food:   function () { tone({ freq: 880, dur: .18, gain: .06, slideTo: 1320 }); },
        sleep:  function () { tone({ freq: 392, dur: .4,  gain: .05, slideTo: 262 }); },
        wake:   function () { tone({ freq: 440, dur: .25, gain: .05, slideTo: 880 }); },
        spin:   function () { tone({ freq: 1200, dur: .35, type: 'sawtooth', gain: .035, slideTo: 400 }); },
        bounce: function () { tone({ freq: 200, dur: .09, type: 'square', gain: .04, slideTo: 120 }); }
    };

    // ============================================================
    // 气泡
    // ============================================================
    function showBubble(text, duration, typewriter) {
        duration = duration || 2600;
        typewriter = typewriter !== false;
        clearTimeout(S.bubbleTimer);
        clearInterval(S.typeTimer);
        bubble.classList.add('show');
        if (!typewriter) {
            bubble.textContent = text;
        } else {
            bubble.textContent = '';
            var i = 0;
            S.typeTimer = setInterval(function () {
                bubble.textContent += text[i++];
                if (i >= text.length) clearInterval(S.typeTimer);
            }, 30);
        }
        S.bubbleTimer = setTimeout(function () {
            bubble.classList.remove('show');
        }, duration + (typewriter ? text.length * 30 : 0));
    }

    // ============================================================
    // 粒子
    // ============================================================
    function burst(emoji, count, originRect) {
        count = Math.max(1, Math.round((count || 4) * particleFactor()));
        var rect = originRect || bodyEl.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top  + rect.height / 2;
        for (var i = 0; i < count; i++) {
            (function () {
                var p = document.createElement('div');
                p.className = 'cp-particle';
                p.textContent = emoji;
                var angle = rand(0, Math.PI * 2);
                var dist = rand(38, 78);
                p.style.left = cx + 'px';
                p.style.top  = cy + 'px';
                p.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(0) + 'px');
                p.style.setProperty('--dy', (Math.sin(angle) * dist - 26).toFixed(0) + 'px');
                p.style.setProperty('--rot', rand(-50, 50).toFixed(0) + 'deg');
                p.style.fontSize = rand(13, 21).toFixed(0) + 'px';
                p.style.animationDelay = rand(0, .14).toFixed(2) + 's';
                particleLayer.appendChild(p);
                setTimeout(function () { p.remove(); }, 1500);
            })();
        }
    }

    // ============================================================
    // 状态机
    // ============================================================
    var faceRevertTimer = null;
    function setFace(name, revertMs) {
        setImage(name);
        clearTimeout(faceRevertTimer);
        if (revertMs) {
            faceRevertTimer = setTimeout(function () {
                if (S.sleeping) setImage('sleep');
                else            setImage('idle1');
            }, revertMs);
        }
    }

    // ============================================================
    // 待机循环
    // ============================================================
    setInterval(function () {
        if (S.sleeping || S.hidden) return;
        if (S.face === 'idle1' || S.face === 'idle2') {
            setImage(S.face === 'idle1' ? 'idle2' : 'idle1');
        }
    }, 1000);

    (function blinkLoop() {
        setTimeout(function () {
            if (!S.sleeping && !S.hidden && S.face !== 'sleep' &&
                (S.face === 'idle1' || S.face === 'idle2')) {
                var prev = S.face;
                setImage('blink');
                setTimeout(function () {
                    if (S.face === 'blink') setImage(prev);
                }, 280);
            }
            blinkLoop();
        }, rand(3000, 7000));
    })();

    // ============================================================
    // 空闲小动作
    // ============================================================
    function scheduleIdleAction() {
        clearTimeout(S.idleActionTimer);
        S.idleActionTimer = setTimeout(function () {
            if (S.sleeping || S.hidden || S.dragging || S.sliding ||
                Date.now() - S.last < 15000) {
                scheduleIdleAction();
                return;
            }
            var roll = Math.random();
            if (roll < .18)      setFace('surprised', 900);
            else if (roll < .35) burst('💭', 2);
            else if (roll < .5)  showBubble(pick(MSG.idle));
            else if (roll < .68) roam(120, 200);
            else if (roll < .82) goSleep();
            scheduleIdleAction();
        }, rand(22000, 48000));
    }

    // ============================================================
    // 睡觉
    // ============================================================
    function startZzz() {
        clearInterval(S.zzzTimer);
        S.zzzTimer = setInterval(function () {
            if (!S.sleeping || S.hidden) return;
            var r = bodyEl.getBoundingClientRect();
            var z = document.createElement('div');
            z.className = 'cp-particle';
            z.textContent = '💤';
            z.style.left = (r.right - 8) + 'px';
            z.style.top  = (r.top - 4) + 'px';
            z.style.setProperty('--dx', rand(10, 28).toFixed(0) + 'px');
            z.style.setProperty('--dy', '-58px');
            z.style.setProperty('--rot', '0deg');
            z.style.fontSize = '14px';
            z.style.animationDuration = '2.1s';
            particleLayer.appendChild(z);
            setTimeout(function () { z.remove(); }, 2300);
        }, 2200);
    }
    function stopZzz() { clearInterval(S.zzzTimer); S.zzzTimer = null; }

    function goSleep() {
        if (S.sleeping) return;
        S.sleeping = true;
        saveSleep(); saveLast();
        host.classList.add('sleeping');
        host.classList.remove('idle-float');
        setImage('sleep');
        showBubble(pick(MSG.sleep), 2200, false);
        startZzz();
        SFX.sleep();
    }

    function wakeUp() {
        if (!S.sleeping) return;
        S.sleeping = false;
        saveSleep(); saveLast();
        host.classList.remove('sleeping');
        host.classList.add('idle-float');
        stopZzz();
        setImage('surprised');
        showBubble(pick(MSG.wake), 1800, false);
        burst('✨', 3);
        SFX.wake();
        setTimeout(function () {
            if (!S.sleeping && S.face === 'surprised') setImage('idle1');
        }, 1200);
    }

    // ============================================================
    // 点击
    // ============================================================
    function handleClick() {
        saveLast();
        initAudio();
        if (S.sleeping) { wakeUp(); return; }
        if (Date.now() - S.last > 5 * 60 * 1000) S.clicks = 0;
        S.clicks++;
        saveClicks();
        S.mood = clamp(S.mood - 2, 0, 100);
        updateMoodColor();

        var msg = '', face = 'happy';
        var n = S.clicks;
        if (n === 1)      { msg = pick(MSG.c1); face = 'happy'; }
        else if (n === 2) { msg = pick(MSG.c2); face = 'happy'; }
        else if (n === 3) { msg = pick(MSG.c3); face = 'surprised'; }
        else if (n === 5) { msg = pick(MSG.c5); face = 'surprised'; }
        else if (n >= 8)  { msg = pick(MSG.c8); face = 'angry'; }
        else              { msg = pick(MSG.idle); face = 'happy'; }
        if (n > 15) msg = '你戳了 ' + n + ' 次了，累不累？';
        if (n === 25) {
            msg = '🎉 你解锁了隐藏彩蛋！';
            burst('🎊', 12);
            S.mood = 100;
            updateMoodColor();
        }

        setFace(face, 2400);
        showBubble(msg);
        host.classList.add('squash');
        setTimeout(function () { host.classList.remove('squash'); }, 440);
        burst(face === 'angry' ? '💢' : '✨', face === 'angry' ? 3 : 4);
        SFX.click();

        clearTimeout(S.resetTimer);
        S.resetTimer = setTimeout(function () {
            if (!S.sleeping) setImage('idle1');
            S.clicks = 0;
            saveClicks();
        }, 4000);
    }

    // ============================================================
    // 拖拽 + 长按菜单
    // ============================================================
    function startStruggle() {
        clearInterval(S.struggleTimer);
        var toggle = false;
        S.struggleTimer = setInterval(function () {
            setImage(toggle ? 'surprised' : 'angry');
            toggle = !toggle;
        }, 260);
    }
    function stopStruggle() {
        clearInterval(S.struggleTimer);
        S.struggleTimer = null;
        if (!S.sleeping) setImage('idle1');
    }

    function onDown(e, isTouch) {
        if (e.target.closest('.cp-toolbar') || e.target.closest('#ciwei-pet-menu')) return;
        if (e.button && e.button !== 0) return;

        initAudio();
        S.dragging = true;
        S.moved = false;
        S.longPressed = false;
        host.classList.add('dragging');
        host.classList.remove('idle-float', 'animating');

        var p = e.touches ? e.touches[0] : e;
        S.sClientX = p.clientX;
        S.sClientY = p.clientY;
        S.sPosX = S.x;
        S.sPosY = S.y;
        S.vx = 0; S.vy = 0;
        S.lastMoveX = p.clientX;
        S.lastMoveY = p.clientY;
        S.lastMoveTime = performance.now();

        if (!S.sleeping) startStruggle();

        // 触屏：启动长按计时器
        clearTimeout(S.longPressTimer);
        if (isTouch) {
            S.longPressTimer = setTimeout(function () {
                if (!S.moved && S.dragging) {
                    S.longPressed = true;
                    S.dragging = false;
                    host.classList.remove('dragging');
                    host.classList.add('idle-float');
                    stopStruggle();
                    lastLongPressTime = performance.now();
                    if (navigator.vibrate) {
                        try { navigator.vibrate(25); } catch (err) {}
                    }
                    showMenuAt(S.sClientX, S.sClientY);
                }
            }, LONG_PRESS_MS);
        }

        e.preventDefault();
    }

    function onMove(e) {
        if (!S.dragging) return;
        e.preventDefault();
        var p = e.touches ? e.touches[0] : e;
        var dx = p.clientX - S.sClientX;
        var dy = p.clientY - S.sClientY;

        if (!S.moved && (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)) {
            S.moved = true;
            clearTimeout(S.longPressTimer);
        }
        if (!S.moved) return;

        var c = clampPos(S.sPosX + dx, S.sPosY + dy);
        setPos(c.x, c.y, false);

        var now = performance.now();
        var dt = now - S.lastMoveTime;
        if (dt > 0) {
            S.vx = (p.clientX - S.lastMoveX) / dt * 16;
            S.vy = (p.clientY - S.lastMoveY) / dt * 16;
        }
        S.lastMoveX = p.clientX;
        S.lastMoveY = p.clientY;
        S.lastMoveTime = now;
    }

    function onUp() {
        clearTimeout(S.longPressTimer);

        // 长按已触发：跳过拖拽和点击逻辑
        if (S.longPressed) {
            S.longPressed = false;
            return;
        }
        if (!S.dragging) return;

        S.dragging = false;
        host.classList.remove('dragging');
        host.classList.add('idle-float');
        stopStruggle();

        if (!S.moved) { handleClick(); return; }
        savePos(); saveLast();

        // 边缘吸附
        var s = getSize();
        var margin = 8;
        var dL = S.x;
        var dR = window.innerWidth - s - S.x;
        var dT = S.y;
        var dB = window.innerHeight - s - S.y;
        var minD = Math.min(dL, dR, dT, dB);
        if (minD < 15 && minD > 0) {
            if (minD === dL)      S.x = margin;
            else if (minD === dR) S.x = window.innerWidth  - s - margin;
            else if (minD === dT) S.y = margin;
            else                  S.y = window.innerHeight - s - margin;
            setPos(S.x, S.y, true);
            setTimeout(savePos, 600);
            return;
        }
        if (Math.abs(S.vx) > .4 || Math.abs(S.vy) > .4) S.sliding = true;
    }

    // 分开绑定鼠标/触摸，方便区分长按来源
    host.addEventListener('mousedown', function (e) { onDown(e, false); });
    host.addEventListener('touchstart', function (e) { onDown(e, true); }, { passive: false });

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup',   onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend',  onUp);

    img.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // 双击转圈
    var lastTap = 0;
    host.addEventListener('click', function (e) {
        if (S.moved) return;
        var now = performance.now();
        if (now - lastTap < 300) {
            e.stopPropagation();
            doSpin();
            lastTap = 0;
        } else {
            lastTap = now;
        }
    });

    // 双击空白走位
    document.addEventListener('dblclick', function (e) {
        if (e.target.closest('#ciwei-pet') ||
            e.target.closest('#ciwei-pet-menu') ||
            e.target.closest('#ciwei-pet-restore') ||
            e.target.closest('a, button, input, textarea, select, label') ||
            e.target.closest('[class*="modal"]')) return;
        if (S.sleeping) return;
        walkTo(e.clientX - getSize() / 2, e.clientY - getSize() / 2);
    });

    // ============================================================
    // 主循环
    // ============================================================
    var lastFrame = performance.now();
    function mainLoop(now) {
        tickFPS(now);
        var dt = (now - lastFrame) / 1000;
        lastFrame = now;
        if (dt > .05) dt = .05;

        if (S.sliding && !S.dragging) {
            var friction = Math.pow(.06, dt);
            S.vx *= friction;
            S.vy *= friction;
            if (Math.abs(S.vx) < .3 && Math.abs(S.vy) < .3) {
                S.sliding = false;
                var c0 = clampPos(S.x, S.y);
                setPos(c0.x, c0.y, false);
                savePos();
            } else {
                var s = getSize();
                var nx = S.x + S.vx * dt * 60;
                var ny = S.y + S.vy * dt * 60;
                var hit = false;
                if (nx < 0) { nx = 0; S.vx = -S.vx * .55; hit = true; }
                if (ny < 0) { ny = 0; S.vy = -S.vy * .55; hit = true; }
                if (nx > window.innerWidth  - s) { nx = window.innerWidth  - s; S.vx = -S.vx * .55; hit = true; }
                if (ny > window.innerHeight - s) { ny = window.innerHeight - s; S.vy = -S.vy * .55; hit = true; }
                setPos(nx, ny, false);
                if (hit) {
                    host.classList.add('squash');
                    setTimeout(function () { host.classList.remove('squash'); }, 300);
                    var rect = bodyEl.getBoundingClientRect();
                    var side = nx <= 0 ? 'left' :
                               nx >= window.innerWidth - s ? 'right' :
                               ny <= 0 ? 'top' : 'bottom';
                    var o = side === 'left'   ? { left: rect.left - 10, top: rect.top + rect.height / 2, width: 20, height: 20 } :
                            side === 'right'  ? { left: rect.right - 10, top: rect.top + rect.height / 2, width: 20, height: 20 } :
                            side === 'top'    ? { left: rect.left + rect.width / 2, top: rect.top - 10, width: 20, height: 20 } :
                                                { left: rect.left + rect.width / 2, top: rect.bottom - 10, width: 20, height: 20 };
                    burst('💨', 4, o);
                    SFX.bounce();
                }
            }
        }

        if (S.mouseActive && !S.hidden) {
            var sz = getSize();
            var lx = clamp(((S.mouseX - (S.x - 18)) / (sz + 36)) * 100, 0, 100);
            var ly = clamp(((S.mouseY - (S.y - 18)) / (sz + 36)) * 100, 0, 100);
            lightEl.style.setProperty('--cp-light-x', lx.toFixed(1) + '%');
            lightEl.style.setProperty('--cp-light-y', ly.toFixed(1) + '%');
        }

        requestAnimationFrame(mainLoop);
    }

    // ============================================================
    // 视线跟随
    // ============================================================
    document.addEventListener('mousemove', function (e) {
        S.mouseX = e.clientX;
        S.mouseY = e.clientY;
        S.mouseActive = true;
        if (isMobile() || S.dragging || S.hidden || S.sleeping) return;
        var s = getSize();
        var cx = S.x + s / 2;
        var cy = S.y + s / 2;
        var dx = (e.clientX - cx) / window.innerWidth;
        var dy = (e.clientY - cy) / window.innerHeight;
        var rx = clamp(dy * 14, -9, 9);
        var ry = clamp(-dx * 14, -9, 9);
        tiltEl.style.transform = 'perspective(500px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });

    document.addEventListener('mouseleave', function () {
        S.mouseActive = false;
        tiltEl.style.transform = '';
    });

    host.addEventListener('mouseenter', function () {
        if (!isMobile() && !S.dragging && !S.sleeping && !S.hidden) {
            tiltEl.style.transform += ' scale(1.04)';
        }
    });
    host.addEventListener('mouseleave', function () {
        if (!S.dragging) tiltEl.style.transform = '';
    });

    // ============================================================
    // 智能避让
    // ============================================================
    document.addEventListener('mousemove', function (e) {
        if (isMobile() || S.dragging || S.sleeping || S.hidden) return;
        if (performance.now() < S.avoidCooldown) return;
        var s = getSize();
        var cx = S.x + s / 2;
        var cy = S.y + s / 2;
        var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (dist < 85 && !S.avoidTimer) {
            S.avoidTimer = setTimeout(function () {
                if (S.dragging || S.sleeping) { S.avoidTimer = null; return; }
                var dx = cx - e.clientX;
                var dy = cy - e.clientY;
                var len = Math.hypot(dx, dy) || 1;
                var md = 46;
                var tx = S.x + (dx / len) * md;
                var ty = S.y + (dy / len) * md;
                var c = clampPos(tx, ty);
                if (Math.hypot(c.x - S.x, c.y - S.y) > 15) {
                    setPos(c.x, c.y, true);
                    setTimeout(savePos, 600);
                }
                S.avoidCooldown = performance.now() + 8000;
                S.avoidTimer = null;
            }, 900);
        } else if (dist > 120) {
            clearTimeout(S.avoidTimer);
            S.avoidTimer = null;
        }
    });

    // ============================================================
    // 动作
    // ============================================================
    function doPet() {
        saveLast(); initAudio();
        S.mood = clamp(S.mood + 8, 0, 100);
        updateMoodColor();
        if (S.sleeping) { wakeUp(); return; }
        setFace('happy', 1600);
        showBubble(pick(MSG.pet), 1800, false);
        burst('❤️', 5);
        SFX.pet();
    }
    function doFood() {
        saveLast(); initAudio();
        S.mood = clamp(S.mood + 12, 0, 100);
        updateMoodColor();
        if (S.sleeping) wakeUp();
        setFace('happy', 1800);
        showBubble(pick(MSG.food), 1800, false);
        burst('🍎', 4);
        SFX.food();
    }
    function doSleepToggle() {
        saveLast(); initAudio();
        if (S.sleeping) wakeUp(); else goSleep();
    }
    function doSpin() {
        saveLast(); initAudio();
        if (S.sleeping) wakeUp();
        host.classList.add('spin');
        setFace('happy', 1500);
        showBubble(pick(MSG.spin), 1600, false);
        burst('💫', 5);
        SFX.spin();
        setTimeout(function () { host.classList.remove('spin'); }, 880);
    }
    function roam(maxX, maxY) {
        if (S.sleeping || S.dragging || S.sliding) return;
        var dirX = Math.random() < .5 ? -1 : 1;
        var dirY = Math.random() < .5 ? -1 : 1;
        var dx = dirX * rand(maxX * .4, maxX);
        var dy = dirY * rand(maxY * .4, maxY);
        var target = clampPos(S.x + dx, S.y + dy);
        if (Math.hypot(target.x - S.x, target.y - S.y) < 40) return;
        walkTo(target.x, target.y);
    }
    function doRoam() {
        saveLast();
        if (S.sleeping) wakeUp();
        showBubble(pick(MSG.roam), 1500, false);
        roam(150, 250);
    }
    function walkTo(tx, ty) {
        if (S.sleeping) return;
        var c = clampPos(tx, ty);
        var sx = S.x, sy = S.y;
        var dist = Math.hypot(c.x - sx, c.y - sy);
        var dur = clamp(dist * 4, 400, 1800);
        var startTime = performance.now();
        S.sliding = false;
        function step(now) {
            var t = Math.min(1, (now - startTime) / dur);
            var e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            var nx = sx + (c.x - sx) * e;
            var ny = sy + (c.y - sy) * e;
            setPos(nx, ny, false);
            var b = Math.sin(t * Math.PI * 8) * 2.5;
            bodyEl.style.transform = 'translateY(' + b + 'px)';
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                bodyEl.style.transform = '';
                savePos();
            }
        }
        requestAnimationFrame(step);
    }
    function doReset() {
        saveLast(); initAudio();
        if (S.sleeping) wakeUp();
        var s = getSize();
        var tx = window.innerWidth  - s - 24;
        var ty = window.innerHeight - s - 24;
        setPos(tx, ty, true);
        showBubble('归位！', 1500, false);
        burst('🏠', 3);
        setTimeout(savePos, 600);
    }
    function doHide() {
        S.hidden = true;
        saveHidden();
        host.classList.add('hidden');
        restoreBtn.classList.add('show');
    }
    function doShow() {
        S.hidden = false;
        saveHidden();
        host.classList.remove('hidden');
        restoreBtn.classList.remove('show');
    }

    // ============================================================
    // 工具栏
    // ============================================================
    toolbar.addEventListener('click', function (e) {
        var btn = e.target.closest('.cp-toolbar-btn');
        if (!btn) return;
        e.stopPropagation();
        var act = btn.dataset.action;
        if (act === 'love')       doPet();
        else if (act === 'food')  doFood();
        else if (act === 'sleep') doSleepToggle();
        else if (act === 'spin')  doSpin();
        else if (act === 'reset') doReset();
    });
    toolbar.addEventListener('mouseenter', function () { host.classList.add('show-toolbar'); });
    toolbar.addEventListener('mouseleave', function () { host.classList.remove('show-toolbar'); });
    restoreBtn.addEventListener('click', doShow);

    // ============================================================
    // 菜单显示
    // ============================================================
    function showMenuAt(x, y) {
        menu.style.left = x + 'px';
        menu.style.top  = y + 'px';
        menu.classList.add('show');

        // 更新显示
        soundChk.textContent = S.soundOn ? '开启' : '关闭';
        fpsChk.textContent = measuredFPS + 'fps';
        updateScaleDisplay();

        // 边界调整（优先考虑屏幕上/左方向，避免被手指挡住）
        var mr = menu.getBoundingClientRect();
        if (x + mr.width > window.innerWidth) {
            menu.style.left = Math.max(8, window.innerWidth - mr.width - 8) + 'px';
        }
        if (y + mr.height > window.innerHeight) {
            // 在手指上方弹出
            menu.style.top = Math.max(8, y - mr.height - 8) + 'px';
        }
        if (parseFloat(menu.style.top) < 8) {
            menu.style.top = '8px';
        }
    }

    // 右键（桌面）
    host.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (isMobile()) return;
        showMenuAt(e.clientX, e.clientY);
    });

    // 菜单点击
    menu.addEventListener('click', function (e) {
        var item = e.target.closest('[data-menu]');
        if (!item) return;
        e.stopPropagation();
        var act = item.dataset.menu;

        if (act === 'love')        { doPet(); menu.classList.remove('show'); }
        else if (act === 'food')   { doFood(); menu.classList.remove('show'); }
        else if (act === 'sleep')  { doSleepToggle(); menu.classList.remove('show'); }
        else if (act === 'spin')   { doSpin(); menu.classList.remove('show'); }
        else if (act === 'roam')   { doRoam(); menu.classList.remove('show'); }
        else if (act === 'reset')  { doReset(); menu.classList.remove('show'); }
        else if (act === 'hide')   { doHide(); menu.classList.remove('show'); }
        else if (act === 'scale-up')    { doScaleUp(); }
        else if (act === 'scale-down')  { doScaleDown(); }
        else if (act === 'scale-reset') { doScaleReset(); }
        else if (act === 'sound') {
            S.soundOn = !S.soundOn;
            saveSound();
            soundChk.textContent = S.soundOn ? '开启' : '关闭';
            item.classList.toggle('active', S.soundOn);
            if (S.soundOn) { initAudio(); SFX.pet(); }
        }
        // fps 项纯展示
    });

    // 点击空白关菜单（长按后 600ms 内忽略）
    document.addEventListener('click', function (e) {
        if (performance.now() - lastLongPressTime < 600) return;
        if (!e.target.closest('#ciwei-pet-menu') && !e.target.closest('#ciwei-pet')) {
            menu.classList.remove('show');
        }
    });

    // ============================================================
    // 后台省电
    // ============================================================
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            savePos(); saveSleep(); saveClicks();
            lsSet(KEYS.last, String(S.last));
        } else {
            lastFrame = performance.now();
        }
    });

    // ============================================================
    // 恢复状态
    // ============================================================
    function restore() {
        // 缩放档位（先读，因为 getSize 依赖它）
        var savedScale = parseInt(lsGet(KEYS.scale) || String(DEFAULT_SCALE_INDEX), 10);
        if (isNaN(savedScale) || savedScale < 0 || savedScale >= SCALES.length) {
            savedScale = DEFAULT_SCALE_INDEX;
        }
        S.scaleIndex = savedScale;
        applySize();
        updateScaleDisplay();

        // 位置
        var saved = null;
        try { saved = JSON.parse(lsGet(KEYS.pos) || 'null'); } catch (e) {}
        var s = getSize();
        if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
            var c = clampPos(saved.x, saved.y);
            setPos(c.x, c.y, false);
        } else {
            setPos(window.innerWidth - s - 24, window.innerHeight - s - 24, false);
        }

        // 睡觉
        if (lsGet(KEYS.sleeping) === 'true') {
            S.sleeping = true;
            host.classList.add('sleeping');
            setImage('sleep');
            startZzz();
        } else {
            host.classList.add('idle-float');
            setImage('idle1');
        }

        S.clicks = parseInt(lsGet(KEYS.clicks) || '0', 10) || 0;
        var last = parseInt(lsGet(KEYS.last) || '0', 10);
        if (last > 0) S.last = last;

        if (lsGet(KEYS.hidden) === 'true') {
            S.hidden = true;
            host.classList.add('hidden');
            restoreBtn.classList.add('show');
        }

        S.soundOn = lsGet(KEYS.sound) !== 'false';
        soundChk.textContent = S.soundOn ? '开启' : '关闭';
        updateMoodColor();
    }

    // ============================================================
    // 初始化
    // ============================================================
    function init() {
        for (var k in IMAGES) {
            if (IMAGES.hasOwnProperty(k)) {
                var i = new Image();
                i.src = IMAGES[k];
            }
        }

        restore();
        requestAnimationFrame(function () { host.classList.add('ready'); });
        requestAnimationFrame(mainLoop);
        scheduleIdleAction();

        setTimeout(function () {
            if (S.sleeping || S.hidden) return;
            var idleFor = Date.now() - S.last;
            if (idleFor > 24 * 60 * 60 * 1000) {
                showBubble(pick(MSG.longTimeNoSee), 3200, false);
            } else {
                showBubble('你好呀～我是小刺猬 🦔', 2600, false);
            }
            burst('✨', 4);
        }, 1200);

        // 窗口变化：重新约束位置 + 重新应用缩放
        var rt = null;
        window.addEventListener('resize', function () {
            clearTimeout(rt);
            rt = setTimeout(function () {
                applySize();
                var c = clampPos(S.x, S.y);
                setPos(c.x, c.y, false);
                savePos();
            }, 150);
        });

        window.addEventListener('beforeunload', function () {
            savePos(); saveSleep(); saveClicks();
            lsSet(KEYS.last, String(S.last));
        });

        console.log('🦔 CiweiPet 内联版 v2 已启动 · ' + measuredFPS + 'fps · ' + getScalePercent() + '%');
    }

    // 启动
    mount();

})();