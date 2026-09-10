/* ============================================================
   🦔 Ciwei Pet · 内联桌面宠物脚本 v3
   新增：投掷弹射 · 对话系统 · 身份档案 · 横排菜单 · 深浅色跟随
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

    var PET_PROFILE = {
        name: '小ci',
        developer: 'LouFoong',
        birthday: '2026-09-10',
        ipLine: '一只住在 CiweiHome 里的电子刺猬，也是开发者 LouFoong 的 IP 分身'
    };

    var SCALES = [0.7, 0.85, 1.0, 1.25, 1.5, 2.0];
    var DEFAULT_SCALE_INDEX = 2;

    var DIALOGUES = [
    // === 身份向 ===
    { id:'who',       icon:'🦔', q:'你是谁？',         a:'我是{name}，{developer} 的电子宠物刺猬。', face:'happy' },
    { id:'info',      icon:'📇', q:'你的信息',         a:'我叫{name}，生日是 {birthday}。{ipLine}', face:'idle1' },
    { id:'age',       icon:'🎂', q:'你多大了？',       a:'我出生于 {birthday}，到今天已经 {days} 天啦！', face:'surprised' },
    { id:'developer', icon:'👨‍💻', q:'LouFoong 是谁？', a:'{developer} 是我的创造者，一个喜欢折腾的独立开发者。', face:'idle1' },
    { id:'like',      icon:'💖', q:'你喜欢什么？',     a:'喜欢被摸头，喜欢吃苹果。最讨厌被人一直戳！', face:'happy' },

    // === 陪伴向 ===
    { id:'doing',     icon:'🌙', q:'你在干什么？',     a:'在发呆…或者在想你。', face:'idle1' },
    { id:'tired',     icon:'💤', q:'你会累吗？',       a:'不会，但我会困。戳我太久我会打瞌睡。', face:'sleep' },
    { id:'sleepwhere',icon:'😴', q:'你睡哪里？',       a:'屏幕右下角，那里最舒服。', face:'happy' },
    { id:'eat',       icon:'🍎', q:'你喜欢吃什么？',   a:'苹果，还有你喂我的每一个 emoji。', face:'happy' },
    { id:'sing',      icon:'🎵', q:'你会唱歌吗？',     a:'不会，但我会吱吱叫。', face:'happy' },

    // === 情绪向 ===
    { id:'sad',       icon:'😊', q:'我今天不开心',     a:'那我陪你待一会儿。你不说话我也在。', face:'idle1' },
    { id:'mytired',   icon:'😢', q:'我累了',           a:'休息一下吧，我帮你看着屏幕。', face:'idle1' },
    { id:'howtodo',   icon:'🤔', q:'我该怎么办',       a:'慢慢想，不急。刺猬也是慢慢长大的。', face:'idle1' },
    { id:'annoyed',   icon:'🌧️', q:'今天好烦',         a:'那把我戳一顿吧，我不生气。', face:'angry' },

    // === 趣味向 ===
    { id:'random',    icon:'🎲', q:'随便说点什么',     a:'你是想让我说俏皮话，还是想让我转圈圈？', face:'happy' },
    { id:'fortune',   icon:'🔮', q:'我今天的运气怎么样？', a:'抬头看看屏幕…嗯，你今天会遇到一只好刺猬。', face:'surprised' },
    { id:'choose',    icon:'🪙', q:'帮我选一个',       a:'正面是我，反面也是我。', face:'happy' },

    // === AI 预留（先占位） ===
    { id:'ai-joke',   icon:'😂', q:'讲个笑话',         a:'（AI 还没上线…等我接上 DeepSeek，笑话管够）', face:'happy', ai:'tell_me_a_joke' },
    { id:'ai-chat',   icon:'🤖', q:'陪我聊聊天',       a:'（我现在的回答是固定的，等 LouFoong 给我接上 AI，我就能真的陪你聊天了）', face:'idle1', ai:'chat' },

    // === 彩蛋解锁 ===
    { id:'secret',    icon:'🔒', q:'你的秘密是什么？', a:'你居然找到了这个彩蛋！{developer} 说你可以凭借这个界面的截图找他要1块钱', face:'surprised', hidden:true }
];

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
        scaleMin: ['已经最小啦～', '不能再小咯～'],
        lateNight: ['这么晚还不睡？', '深夜了…要早点休息哦', '🌙 陪我一起熬夜吗'],
        birthday: ['🎂 今天是我的生日！', '🎉 今天我过生日～'],
        thrown: ['哇啊啊——', '💫 飞起来了！', '要摔了要摔了！']
    };

    var KEYS = {
        pos:     'ciwei_pet_position',
        sleeping:'ciwei_pet_sleeping',
        last:    'ciwei_pet_last_interaction',
        clicks:  'ciwei_pet_click_count',
        hidden:  'ciwei_pet_hidden',
        sound:   'ciwei_pet_sound',
        scale:   'ciwei_pet_scale_index',
        meeting: 'ciwei_pet_meeting_date',
        asked:   'ciwei_pet_asked_dialogues',
        secret:  'ciwei_pet_secret_unlocked'
    };

    var SIZE_DESKTOP = 120;
    var SIZE_MOBILE  = 88;
    var LONG_PRESS_MS = 500;
    var MOVE_THRESHOLD = 6;
    var THROW_SPEED_THRESHOLD = 4.0;

    // ============================================================
    // 工具
    // ============================================================
    var rand = function (a, b) { return a + Math.random() * (b - a); };
    var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
    var clamp = function (v, a, b) { return Math.max(a, Math.min(v, b)); };
    var isMobile = function () { return window.matchMedia('(max-width: 600px)').matches; };
    var lsGet = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
    var lsSet = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };

    function daysSince(ts) {
        if (!ts) return 0;
        return Math.max(1, Math.floor((Date.now() - ts) / 86400000) + 1);
    }
    function formatBirthday(str) {
        var p = str.split('-');
        if (p.length !== 3) return str;
        return p[0] + '年' + parseInt(p[1], 10) + '月' + parseInt(p[2], 10) + '日';
    }
    function fillTemplate(text) {
        var meeting = parseInt(lsGet(KEYS.meeting) || '0', 10);
        return text
            .replace(/{name}/g, PET_PROFILE.name)
            .replace(/{developer}/g, PET_PROFILE.developer)
            .replace(/{birthday}/g, formatBirthday(PET_PROFILE.birthday))
            .replace(/{ipLine}/g, PET_PROFILE.ipLine)
            .replace(/{days}/g, daysSince(meeting));
    }

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
            '<button class="cp-toolbar-btn" data-action="dialogue" title="聊天">💬</button>' +
            '<button class="cp-toolbar-btn" data-action="sleep" title="哄睡">💤</button>' +
            '<button class="cp-toolbar-btn" data-action="reset" title="归位">🏠</button>' +
        '</div>' +
        '<div class="cp-body">' +
            '<div class="cp-tilt">' +
                '<img class="cp-img" alt="小ci" draggable="false">' +
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
        '<div class="cp-mi" data-menu="love"     data-label="摸摸头">❤️</div>' +
        '<div class="cp-mi" data-menu="food"     data-label="喂食">🍎</div>' +
        '<div class="cp-mi" data-menu="dialogue" data-label="聊天">💬</div>' +
        '<div class="cp-mi" data-menu="sleep"    data-label="哄睡">💤</div>' +
        '<div class="cp-mi" data-menu="spin"     data-label="转圈">🔄</div>' +
        '<div class="cp-mi" data-menu="more"     data-label="更多">⚙️</div>';

    var submenu = document.createElement('div');
    submenu.id = 'ciwei-pet-submenu';
    submenu.innerHTML =
        '<div class="cp-sub-item" data-menu="roam">🚶 <span>散散步</span></div>' +
        '<div class="cp-sub-item" data-menu="reset">🏠 <span>回角落</span></div>' +
        '<div class="cp-sep"></div>' +
        '<div class="cp-sub-item" data-menu="scale-up">🔍➕ <span>放大</span></div>' +
        '<div class="cp-sub-item" data-menu="scale-down">🔍➖ <span>缩小</span></div>' +
        '<div class="cp-sub-item" data-menu="scale-reset">' +
            '📏 <span>重置大小</span>' +
            '<span class="cp-sub-check" id="cp-scale-check">100%</span>' +
        '</div>' +
        '<div class="cp-sep"></div>' +
        '<div class="cp-sub-item active" data-menu="sound">' +
            '🔊 <span>音效</span>' +
            '<span class="cp-sub-check" id="cp-sound-check">开启</span>' +
        '</div>' +
        '<div class="cp-sep"></div>' +
        '<div class="cp-sub-item danger" data-menu="hide">🙈 <span>隐藏</span></div>';

    var dialogue = document.createElement('div');
    dialogue.id = 'ciwei-pet-dialogue';
    dialogue.innerHTML =
        '<div class="cp-dlg-header">' +
            '<span class="cp-dlg-title">💬 和小ci聊天</span>' +
            '<button class="cp-dlg-close" id="cp-dlg-close">✕</button>' +
        '</div>' +
        '<div id="cp-dlg-body"></div>';

    var restoreBtn = document.createElement('div');
    restoreBtn.id = 'ciwei-pet-restore';
    restoreBtn.textContent = '🦔';

    function mount() {
        if (!document.body) { setTimeout(mount, 20); return; }
        document.body.appendChild(particleLayer);
        document.body.appendChild(menu);
        document.body.appendChild(submenu);
        document.body.appendChild(dialogue);
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
    var dlgBody  = dialogue.querySelector('#cp-dlg-body');
    var dlgClose = dialogue.querySelector('#cp-dlg-close');
    var soundChk = submenu.querySelector('#cp-sound-check');
    var scaleChk = submenu.querySelector('#cp-scale-check');

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
        thrown: false,
        soundOn: true,
        mood: 60,
        scaleIndex: DEFAULT_SCALE_INDEX,
        bubbleTimer: null, typeTimer: null, resetTimer: null,
        struggleTimer: null, idleActionTimer: null, zzzTimer: null,
        avoidTimer: null, avoidCooldown: 0, longPressTimer: null,
        mouseX: window.innerWidth / 2,
        mouseY: window.innerHeight / 2,
        mouseActive: false,
        dialogueOpen: false,
        replyTimer: null
    };
    var lastLongPressTime = 0;

    // ============================================================
    // 帧率检测
    // ============================================================
    var measuredFPS = 60, fpsFrames = 0;
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
            fpsFrames = 0; fpsStart = now;
        }
    }
    function particleFactor() {
        if (measuredFPS >= 100) return 1.4;
        if (measuredFPS >= 60)  return 1.0;
        if (measuredFPS >= 40)  return .75;
        return .5;
    }

    // ============================================================
    // 尺寸
    // ============================================================
    function getBaseSize() { return isMobile() ? SIZE_MOBILE : SIZE_DESKTOP; }
    function getSize() { return Math.round(getBaseSize() * SCALES[S.scaleIndex]); }
    function getScalePercent() { return Math.round(SCALES[S.scaleIndex] * 100); }

    function applySize() {
        document.documentElement.style.setProperty('--cp-size', getSize() + 'px');
    }
    function applyScale() {
        host.classList.add('scaling');
        applySize();
        var c = clampPos(S.x, S.y);
        S.x = c.x; S.y = c.y;
        host.style.transform = 'translate3d(' + c.x + 'px,' + c.y + 'px,0)';
        updateFlip();
        void host.offsetWidth;
        requestAnimationFrame(function () { host.classList.remove('scaling'); });
        savePos(); saveScale(); updateScaleDisplay();
    }
    function saveScale() { lsSet(KEYS.scale, String(S.scaleIndex)); }
    function updateScaleDisplay() { if (scaleChk) scaleChk.textContent = getScalePercent() + '%'; }

    function doScaleUp() {
        if (S.scaleIndex >= SCALES.length - 1) { showBubble(pick(MSG.scaleMax), 1400, false); return; }
        S.scaleIndex++; applyScale(); initAudio(); SFX.pet();
        burst('✨', 3); showBubble('🔍➕ ' + getScalePercent() + '%', 1200, false);
    }
    function doScaleDown() {
        if (S.scaleIndex <= 0) { showBubble(pick(MSG.scaleMin), 1400, false); return; }
        S.scaleIndex--; applyScale(); initAudio(); SFX.pet();
        burst('✨', 3); showBubble('🔍➖ ' + getScalePercent() + '%', 1200, false);
    }
    function doScaleReset() {
        if (S.scaleIndex === DEFAULT_SCALE_INDEX) { showBubble('已经是默认大小～', 1200, false); return; }
        S.scaleIndex = DEFAULT_SCALE_INDEX; applyScale(); initAudio(); SFX.pet();
        burst('📏', 3); showBubble('📏 恢复 100%', 1400, false);
    }

    // ============================================================
    // 位置
    // ============================================================
    function setPos(x, y, animate) {
        S.x = x; S.y = y;
        if (animate) {
            host.classList.add('animating');
            clearTimeout(host._animTimer);
            host._animTimer = setTimeout(function () { host.classList.remove('animating'); }, 600);
        }
        host.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        updateFlip();
    }
    function clampPos(x, y) {
        var s = getSize();
        return {
            x: clamp(x, 0, Math.max(0, window.innerWidth - s)),
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
    // 图片 / 心情
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
        document.documentElement.style.setProperty('--cp-accent', r + ',' + g + ',' + b);
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
        bounce: function () { tone({ freq: 200, dur: .09, type: 'square', gain: .04, slideTo: 120 }); },
        talk:   function () { tone({ freq: 700, dur: .08, type: 'triangle', gain: .04, slideTo: 900 }); },
        throw:  function () { tone({ freq: 1000, dur: .25, type: 'sine', gain: .04, slideTo: 200 }); }
    };

    // ============================================================
    // 气泡（横排优先）
    // ============================================================
    function showBubble(text, duration, typewriter) {
        duration = duration || 2600;
        typewriter = typewriter !== false;
        clearTimeout(S.bubbleTimer);
        clearInterval(S.typeTimer);

        var needWrap = text.length > 14;
        bubble.classList.toggle('long', needWrap);

        bubble.classList.add('show');
        if (!typewriter) { bubble.textContent = text; }
        else {
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
        var cy = rect.top + rect.height / 2;
        for (var i = 0; i < count; i++) {
            (function () {
                var p = document.createElement('div');
                p.className = 'cp-particle';
                p.textContent = emoji;
                var angle = rand(0, Math.PI * 2);
                var dist = rand(38, 78);
                p.style.left = cx + 'px';
                p.style.top = cy + 'px';
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
    // 待机
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

    function scheduleIdleAction() {
        clearTimeout(S.idleActionTimer);
        S.idleActionTimer = setTimeout(function () {
            if (S.sleeping || S.hidden || S.dragging || S.sliding ||
                S.dialogueOpen ||
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
            z.style.top = (r.top - 4) + 'px';
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
        saveLast(); initAudio();
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

        if (n === 25 && lsGet(KEYS.secret) !== 'true') {
            msg = '🎉 你解锁了隐藏彩蛋！';
            burst('🎊', 12);
            S.mood = 100;
            updateMoodColor();
            lsSet(KEYS.secret, 'true');
            setTimeout(function () {
                showBubble('💬 菜单里多了一个秘密选项…', 3200, false);
            }, 2400);
        } else if (n === 25) {
            msg = '又戳 25 次了，你不累吗？';
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
    // 拖拽 + 长按菜单 + 投掷弹射
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
        if (e.target.closest('.cp-toolbar') ||
            e.target.closest('#ciwei-pet-menu') ||
            e.target.closest('#ciwei-pet-submenu') ||
            e.target.closest('#ciwei-pet-dialogue')) return;
        if (e.button && e.button !== 0) return;

        initAudio();
        S.dragging = true;
        S.moved = false;
        S.longPressed = false;
        S.thrown = false;
        host.classList.add('dragging');
        host.classList.remove('idle-float', 'animating');

        var p = e.touches ? e.touches[0] : e;
        S.sClientX = p.clientX; S.sClientY = p.clientY;
        S.sPosX = S.x; S.sPosY = S.y;
        S.vx = 0; S.vy = 0;
        S.lastMoveX = p.clientX; S.lastMoveY = p.clientY;
        S.lastMoveTime = performance.now();

        if (!S.sleeping) startStruggle();

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
                    if (navigator.vibrate) { try { navigator.vibrate(25); } catch (err) {} }
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
        S.lastMoveX = p.clientX; S.lastMoveY = p.clientY;
        S.lastMoveTime = now;
    }

    function onUp() {
        clearTimeout(S.longPressTimer);
        if (S.longPressed) { S.longPressed = false; return; }
        if (!S.dragging) return;
        S.dragging = false;
        host.classList.remove('dragging');
        host.classList.add('idle-float');
        stopStruggle();

        if (!S.moved) { handleClick(); return; }
        savePos(); saveLast();

        var s = getSize();
        var margin = 8;
        var dL = S.x;
        var dR = window.innerWidth - s - S.x;
        var dT = S.y;
        var dB = window.innerHeight - s - S.y;
        var minD = Math.min(dL, dR, dT, dB);

        var speed = Math.hypot(S.vx, S.vy);

        // 投掷模式：速度超过阈值
        if (speed > THROW_SPEED_THRESHOLD) {
            S.thrown = true;
            S.sliding = true;
            // 增强初速度
            S.vx *= 1.25;
            S.vy *= 1.25;
            // 飞出去时的姿态
            if (!S.sleeping) setFace('surprised', 1500);
            SFX.throw();
            burst('💫', 3);
            showBubble(pick(MSG.thrown), 1500, false);
            return;
        }

        // 边缘吸附（低速）
        if (minD < 15 && minD > 0) {
            if (minD === dL)      S.x = margin;
            else if (minD === dR) S.x = window.innerWidth - s - margin;
            else if (minD === dT) S.y = margin;
            else                  S.y = window.innerHeight - s - margin;
            setPos(S.x, S.y, true);
            setTimeout(savePos, 600);
            return;
        }
        // 普通惯性
        if (speed > .4) S.sliding = true;
    }

    host.addEventListener('mousedown', function (e) { onDown(e, false); });
    host.addEventListener('touchstart', function (e) { onDown(e, true); }, { passive: false });
    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    img.addEventListener('dragstart', function (e) { e.preventDefault(); });

    var lastTap = 0;
    host.addEventListener('click', function (e) {
        if (S.moved) return;
        var now = performance.now();
        if (now - lastTap < 300) { e.stopPropagation(); doSpin(); lastTap = 0; }
        else { lastTap = now; }
    });

    document.addEventListener('dblclick', function (e) {
        if (e.target.closest('#ciwei-pet') ||
            e.target.closest('#ciwei-pet-menu') ||
            e.target.closest('#ciwei-pet-submenu') ||
            e.target.closest('#ciwei-pet-dialogue') ||
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
            // 投掷模式摩擦更小 + 反弹更强
            var friction = S.thrown ? Math.pow(.32, dt) : Math.pow(.06, dt);
            var bounceRate = S.thrown ? .72 : .55;

            S.vx *= friction;
            S.vy *= friction;

            var stopThreshold = S.thrown ? .6 : .3;
            if (Math.abs(S.vx) < stopThreshold && Math.abs(S.vy) < stopThreshold) {
                S.sliding = false;
                var c0 = clampPos(S.x, S.y);
                setPos(c0.x, c0.y, false);
                savePos();

                // 投掷落地
                if (S.thrown) {
                    S.thrown = false;
                    if (!S.sleeping) setFace('happy', 1400);
                    burst('✨', 4);
                    host.classList.add('squash');
                    setTimeout(function () { host.classList.remove('squash'); }, 420);
                    SFX.bounce();
                }
            } else {
                var s = getSize();
                var nx = S.x + S.vx * dt * 60;
                var ny = S.y + S.vy * dt * 60;
                var hit = false;
                if (nx < 0) { nx = 0; S.vx = -S.vx * bounceRate; hit = true; }
                if (ny < 0) { ny = 0; S.vy = -S.vy * bounceRate; hit = true; }
                if (nx > window.innerWidth - s) { nx = window.innerWidth - s; S.vx = -S.vx * bounceRate; hit = true; }
                if (ny > window.innerHeight - s) { ny = window.innerHeight - s; S.vy = -S.vy * bounceRate; hit = true; }
                setPos(nx, ny, false);

                if (hit) {
                    host.classList.add('squash');
                    setTimeout(function () { host.classList.remove('squash'); }, 300);

                    if (S.thrown && navigator.vibrate) {
                        try { navigator.vibrate(15); } catch (err) {}
                    }

                    var rect = bodyEl.getBoundingClientRect();
                    var side = nx <= 0 ? 'left' :
                               nx >= window.innerWidth - s ? 'right' :
                               ny <= 0 ? 'top' : 'bottom';
                    var o = side === 'left'   ? { left: rect.left - 10, top: rect.top + rect.height / 2, width: 20, height: 20 } :
                            side === 'right'  ? { left: rect.right - 10, top: rect.top + rect.height / 2, width: 20, height: 20 } :
                            side === 'top'    ? { left: rect.left + rect.width / 2, top: rect.top - 10, width: 20, height: 20 } :
                                                { left: rect.left + rect.width / 2, top: rect.bottom - 10, width: 20, height: 20 };
                    burst(S.thrown ? '💥' : '💨', S.thrown ? 5 : 4, o);
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
        S.mouseX = e.clientX; S.mouseY = e.clientY; S.mouseActive = true;
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
        if (isMobile() || S.dragging || S.sleeping || S.hidden || S.dialogueOpen) return;
        if (performance.now() < S.avoidCooldown) return;
        var s = getSize();
        var cx = S.x + s / 2;
        var cy = S.y + s / 2;
        var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (dist < 85 && !S.avoidTimer) {
            S.avoidTimer = setTimeout(function () {
                if (S.dragging || S.sleeping || S.dialogueOpen) { S.avoidTimer = null; return; }
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
        S.mood = clamp(S.mood + 8, 0, 100); updateMoodColor();
        if (S.sleeping) { wakeUp(); return; }
        setFace('happy', 1600);
        showBubble(pick(MSG.pet), 1800, false);
        burst('❤️', 5);
        SFX.pet();
    }
    function doFood() {
        saveLast(); initAudio();
        S.mood = clamp(S.mood + 12, 0, 100); updateMoodColor();
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
        if (S.sleeping || S.dragging || S.sliding || S.dialogueOpen) return;
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
        var tx = window.innerWidth - s - 24;
        var ty = window.innerHeight - s - 24;
        setPos(tx, ty, true);
        showBubble('归位！', 1500, false);
        burst('🏠', 3);
        setTimeout(savePos, 600);
    }
    function doHide() {
        S.hidden = true; saveHidden();
        host.classList.add('hidden');
        restoreBtn.classList.add('show');
    }
    function doShow() {
        S.hidden = false; saveHidden();
        host.classList.remove('hidden');
        restoreBtn.classList.remove('show');
    }

    // ============================================================
    // 对话系统
    // ============================================================
    function getAskedList() {
        var raw = lsGet(KEYS.asked);
        if (!raw) return [];
        try { return JSON.parse(raw) || []; } catch (e) { return []; }
    }
    function markAsked(id) {
        var list = getAskedList();
        if (list.indexOf(id) === -1) {
            list.push(id);
            lsSet(KEYS.asked, JSON.stringify(list));
        }
    }
    function isSecretUnlocked() { return lsGet(KEYS.secret) === 'true'; }

    function buildDialogueMenu() {
        var asked = getAskedList();
        var secretOK = isSecretUnlocked();
        var html = '';
        for (var i = 0; i < DIALOGUES.length; i++) {
            var d = DIALOGUES[i];
            if (d.hidden && !secretOK) continue;
            var cls = 'cp-dlg-item';
            if (asked.indexOf(d.id) !== -1) cls += ' asked';
            if (d.hidden) cls += ' secret';
            html += '<div class="' + cls + '" data-dlg-id="' + d.id + '">' +
                    '<span class="cp-dlg-icon">' + d.icon + '</span>' +
                    '<span>' + d.q + '</span>' +
                    '</div>';
        }
        dlgBody.innerHTML = html;
    }

    function showDialogueAt() {
        S.dialogueOpen = true;
        buildDialogueMenu();

        var s = getSize();
        var px = S.x + s + 8;
        var py = S.y;

        dialogue.style.left = px + 'px';
        dialogue.style.top  = py + 'px';
        dialogue.classList.add('show');

        var dr = dialogue.getBoundingClientRect();

        if (px + dr.width > window.innerWidth - 8) {
            var leftX = S.x - dr.width - 8;
            if (leftX < 8) leftX = Math.max(8, window.innerWidth - dr.width - 8);
            dialogue.style.left = leftX + 'px';
        }
        if (py + dr.height > window.innerHeight - 8) {
            dialogue.style.top = Math.max(8, window.innerHeight - dr.height - 8) + 'px';
        }
        if (parseFloat(dialogue.style.top) < 8) dialogue.style.top = '8px';

        clearTimeout(S.avoidTimer);
        S.avoidTimer = null;
        S.avoidCooldown = performance.now() + 60000;
    }

    function hideDialogue() {
        dialogue.classList.remove('show');
        S.dialogueOpen = false;
        S.avoidCooldown = performance.now() + 2000;
    }

    dlgBody.addEventListener('click', function (e) {
        var item = e.target.closest('[data-dlg-id]');
        if (!item) return;
        e.stopPropagation();
        var id = item.getAttribute('data-dlg-id');
        var d = null;
        for (var i = 0; i < DIALOGUES.length; i++) {
            if (DIALOGUES[i].id === id) { d = DIALOGUES[i]; break; }
        }
        if (!d) return;

        initAudio();
        SFX.talk();

        var prevReplying = dlgBody.querySelector('.replying');
        if (prevReplying) prevReplying.classList.remove('replying');
        item.classList.add('replying');

        var text = fillTemplate(d.a);
        if (!S.sleeping) setFace(d.face || 'happy', 3000);
        showBubble(text, 4000, true);

        S.mood = clamp(S.mood + 4, 0, 100);
        updateMoodColor();
        saveLast();
        markAsked(id);

        if (d.hidden) burst('🎉', 8);
        else          burst('💬', 2);

        clearTimeout(S.replyTimer);
        S.replyTimer = setTimeout(function () {
            item.classList.remove('replying');
            buildDialogueMenu();
        }, 4200);
    });

    dlgClose.addEventListener('click', function (e) {
        e.stopPropagation();
        hideDialogue();
    });

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
        else if (act === 'dialogue') showDialogueAt();
        else if (act === 'reset') doReset();
    });
    toolbar.addEventListener('mouseenter', function () { host.classList.add('show-toolbar'); });
    toolbar.addEventListener('mouseleave', function () { host.classList.remove('show-toolbar'); });
    restoreBtn.addEventListener('click', doShow);

    // ============================================================
    // 菜单
    // ============================================================
    function showMenuAt(x, y) {
        menu.style.left = x + 'px';
        menu.style.top  = y + 'px';
        menu.classList.add('show');
        submenu.classList.remove('show');

        var mr = menu.getBoundingClientRect();
        if (x + mr.width > window.innerWidth - 8) {
            menu.style.left = Math.max(8, window.innerWidth - mr.width - 8) + 'px';
        }
        if (y + mr.height > window.innerHeight - 8) {
            menu.style.top = Math.max(8, y - mr.height - 8) + 'px';
        }
        if (parseFloat(menu.style.top) < 8) menu.style.top = '8px';
    }

    function showSubmenu() {
        var mr = menu.getBoundingClientRect();
        var sx = mr.left;
        var sy = mr.bottom + 4;
        submenu.style.left = sx + 'px';
        submenu.style.top  = sy + 'px';
        submenu.classList.add('show');

        soundChk.textContent = S.soundOn ? '开启' : '关闭';
        updateScaleDisplay();

        var sr = submenu.getBoundingClientRect();
        if (sx + sr.width > window.innerWidth - 8) {
            submenu.style.left = Math.max(8, window.innerWidth - sr.width - 8) + 'px';
        }
        if (sy + sr.height > window.innerHeight - 8) {
            submenu.style.top = Math.max(8, mr.top - sr.height - 4) + 'px';
        }
    }

    host.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (isMobile()) return;
        showMenuAt(e.clientX, e.clientY);
    });

    menu.addEventListener('click', function (e) {
        var item = e.target.closest('[data-menu]');
        if (!item) return;
        e.stopPropagation();
        var act = item.dataset.menu;

        if (act === 'more') {
            if (submenu.classList.contains('show')) submenu.classList.remove('show');
            else showSubmenu();
            return;
        }

        if (act === 'love')       { doPet(); menu.classList.remove('show'); }
        else if (act === 'food')  { doFood(); menu.classList.remove('show'); }
        else if (act === 'dialogue') {
            menu.classList.remove('show');
            submenu.classList.remove('show');
            setTimeout(function () { showDialogueAt(); }, 60);
        }
        else if (act === 'sleep') { doSleepToggle(); menu.classList.remove('show'); }
        else if (act === 'spin')  { doSpin(); menu.classList.remove('show'); }
    });

    submenu.addEventListener('click', function (e) {
        var item = e.target.closest('[data-menu]');
        if (!item) return;
        e.stopPropagation();
        var act = item.dataset.menu;

        if (act === 'roam')        { doRoam(); submenu.classList.remove('show'); menu.classList.remove('show'); }
        else if (act === 'reset')  { doReset(); submenu.classList.remove('show'); menu.classList.remove('show'); }
        else if (act === 'hide')   { doHide(); submenu.classList.remove('show'); menu.classList.remove('show'); }
        else if (act === 'scale-up')    { doScaleUp(); }
        else if (act === 'scale-down')  { doScaleDown(); }
        else if (act === 'scale-reset') { doScaleReset(); }
        else if (act === 'sound') {
            S.soundOn = !S.soundOn; saveSound();
            soundChk.textContent = S.soundOn ? '开启' : '关闭';
            item.classList.toggle('active', S.soundOn);
            if (S.soundOn) { initAudio(); SFX.pet(); }
        }
    });

    document.addEventListener('click', function (e) {
        if (performance.now() - lastLongPressTime < 600) return;
        var inMenu = e.target.closest('#ciwei-pet-menu');
        var inSub  = e.target.closest('#ciwei-pet-submenu');
        var inPet  = e.target.closest('#ciwei-pet');
        if (!inMenu && !inSub && !inPet) {
            menu.classList.remove('show');
            submenu.classList.remove('show');
        }
    });

    // ============================================================
    // 彩蛋
    // ============================================================
    function checkBirthday() {
        var today = new Date();
        var md = ('0' + (today.getMonth() + 1)).slice(-2) + '-' +
                 ('0' + today.getDate()).slice(-2);
        var birthMD = PET_PROFILE.birthday.slice(5);
        if (md === birthMD) {
            setTimeout(function () {
                if (S.sleeping || S.hidden) return;
                showBubble(pick(MSG.birthday), 4000, false);
                burst('🎂', 10);
                burst('🎉', 6);
                SFX.wake();
            }, 3000);
        }
    }
    function checkLateNight() {
        var h = new Date().getHours();
        if (h >= 2 && h < 5) {
            setTimeout(function () {
                if (S.sleeping || S.hidden) return;
                showBubble(pick(MSG.lateNight), 3600, false);
            }, 5000);
        }
    }
    function checkLongTimeNoSee() {
        setTimeout(function () {
            if (S.sleeping || S.hidden) return;
            var idleFor = Date.now() - S.last;
            if (idleFor > 24 * 60 * 60 * 1000) {
                showBubble(pick(MSG.longTimeNoSee), 3200, false);
            } else {
                showBubble('你好呀～我是小ci 🦔', 2600, false);
            }
            burst('✨', 4);
        }, 1200);
    }

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
        if (!lsGet(KEYS.meeting)) lsSet(KEYS.meeting, String(Date.now()));

        var savedScale = parseInt(lsGet(KEYS.scale) || String(DEFAULT_SCALE_INDEX), 10);
        if (isNaN(savedScale) || savedScale < 0 || savedScale >= SCALES.length) {
            savedScale = DEFAULT_SCALE_INDEX;
        }
        S.scaleIndex = savedScale;
        applySize();
        updateScaleDisplay();

        var saved = null;
        try { saved = JSON.parse(lsGet(KEYS.pos) || 'null'); } catch (e) {}
        var s = getSize();
        if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
            var c = clampPos(saved.x, saved.y);
            setPos(c.x, c.y, false);
        } else {
            setPos(window.innerWidth - s - 24, window.innerHeight - s - 24, false);
        }

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

        checkLongTimeNoSee();
        checkBirthday();
        checkLateNight();

        var rt = null;
        window.addEventListener('resize', function () {
            clearTimeout(rt);
            rt = setTimeout(function () {
                applySize();
                var c = clampPos(S.x, S.y);
                setPos(c.x, c.y, false);
                savePos();
                if (S.dialogueOpen) {
                    hideDialogue();
                    showDialogueAt();
                }
            }, 150);
        });

        window.addEventListener('beforeunload', function () {
            savePos(); saveSleep(); saveClicks();
            lsSet(KEYS.last, String(S.last));
        });

        console.log('🦔 小ci · 内联版 v3 已启动 · ' + getScalePercent() + '%');
    }

    mount();

})();