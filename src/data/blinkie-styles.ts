// src/data/blinkie-styles.ts
// Auto-generated from blinkies.cafe blinkieData.js (245 styles)

// Real blinkie style definitions from blinkies.cafe repo
// Each style matches the original blinkieData.js format
export interface BlinkieStyleDef {
  name: string
  bgID: string           // Background PNG prefix (may differ from style key)
  frames: number         // Number of animation frames
  delay: number          // Frame delay in centiseconds (10 = 100ms)
  colour: string | string[]  // Text color (single or per-frame)
  font: string           // Font family
  fontsize: number       // Font size in px
  fontweight?: string    // 'bold' | 'normal'
  x: number | number[]   // Text X offset from center (single or per-frame)
  y: number | number[]   // Text Y offset from center (single or per-frame)
  outline?: string | string[]  // Outline color (single or per-frame, optional)
  shadow?: string | string[]   // Shadow color (single or per-frame, optional)
  shadowx?: number | number[]  // Shadow X offset (single or per-frame)
  shadowy?: number | number[]  // Shadow Y offset (single or per-frame)
  tags: string[]         // Category tags
  bgType?: string        // Background type (defaults to 'png')
}

export type BlinkieStyleId = keyof typeof BLINKIE_STYLES

// Auto-generated from blinkies.cafe blinkieData.js (245 styles)
export const BLINKIE_STYLES: Record<string, BlinkieStyleDef> = {
  '0283-purplelace': {
    name: "sweet dreams", bgID: "0283-purplelace", frames: 4, delay: 17, colour: "#ffffff", font: "green screen", fontsize: 12, x: -1, y: 0, outline: "#d499ea", tags: ["user","pink","transparent","2024may"],
  },
  '0282-miraclemoon': {
    name: "miracle maker", bgID: "0282-miraclemoon", frames: 2, delay: 17, colour: "#df529e", font: "alagard", fontsize: 16, x: 7, y: -1, outline: "#36205f", tags: ["user","pink","nature","2024may"],
  },
  '0281-tumblrgrl': {
    name: "Tumblr Grl", bgID: "0281-tumblrgrl", frames: 2, delay: 20, colour: "#eb7ada", font: "offical emotes.", fontsize: 16, x: -26, y: 0, tags: ["user","pink","2024may"],
  },
  '0280-pinkalien': {
    name: "Take me away", bgID: "0280-pinkalien", frames: 2, delay: 10, colour: "#ffdef2", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -13, y: 0, outline: "#8a6e81", tags: ["user","spooky","pink","2024may"],
  },
  '0275-stressed': {
    name: "Stressed...", bgID: "0275-stressed", frames: 2, delay: 20, colour: "#000000", font: "Perfect DOS VGA 437", fontsize: 20, fontweight: "bold", x: -1, y: 0, outline: "#ff7d7d", tags: ["user","pawpr1nc3","2024may"],
  },
  '0278-galpals': {
    name: "Gal Pals", bgID: "0278-galpals", frames: 4, delay: 13, colour: "#DA69BB", font: "rainyhearts", fontsize: 16, x: -1, y: 0, tags: ["user","pink","2024may","my melody","kuromi","sanrio"],
  },
  '0277-zombies': {
    name: "ZOMBIES BITE BACK", bgID: "0277-zombies", frames: 2, delay: 15, colour: "#ba4e11", font: "green screen", fontsize: 12, x: 12, y: 0, outline: "#600c0d", tags: ["user","anakin","spooky","2024apr"],
  },
  '0276-washhands': {
    name: "Wash your damn hands", bgID: "0276-washhands", frames: 2, delay: 15, colour: "#e5e5e5", font: "moonaco", fontsize: 16, x: -12, y: 0, outline: "#212121", tags: ["user","spooky","2024apr"],
  },
  '0275-spiderweb': {
    name: "spider web", bgID: "0275-spiderweb", frames: 2, delay: 15, colour: "#997799", font: "lanapixel", fontsize: 11, x: -1, y: -1, tags: ["user","spooky","2024apr"],
  },
  '0275-bunnybounce': {
    name: "bunny mode", bgID: "0275-bunnybounce", frames: 4, delay: 8, colour: "#ff6699", font: "monogramextended", fontsize: 16, x: 6, y: 1, tags: ["nature","pink","user","nikki"],
  },
  '0271-chronicmigraines': {
    name: "Chronic Migraines", bgID: "0271-chronicmigraines", frames: 2, delay: 15, colour: "#c6f53d", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -18, y: 0, outline: "#04949c", tags: ["user","soleil","2024mar"],
  },
  '0270-owmybones': {
    name: "ow my bones", bgID: "0270-owmybones", frames: 2, delay: 15, colour: "#eee8da", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, outline: "#463d28", tags: ["user","soleil","spooky","2024mar"],
  },
  '0269-sickashell': {
    name: "SICK as HELL", bgID: "0269-sickashell", frames: 4, delay: 15, colour: "#f90098", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, outline: "#780090", tags: ["user","soleil","2024mar"],
  },
  '0268-hardofhearing': {
    name: "Hard of Hearing", bgID: "0268-hardofhearing", frames: 2, delay: 15, colour: "#0db1fc", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, outline: "#4b04ff", tags: ["user","soleil","2024mar"],
  },
  '0267-spineinjury': {
    name: "Spine Injury", bgID: "0267-spineinjury", frames: 2, delay: 15, colour: "#04fc6c", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, outline: "#04acb4", tags: ["user","soleil","2024mar"],
  },
  '0265-wheelchair': {
    name: "Wheelchair User!", bgID: "0265-wheelchair", frames: 2, delay: 15, colour: "#ff02aa", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -4, y: 0, outline: "#720089", tags: ["user","pink","soleil","2024mar"],
  },
  '0266-lovefool': {
    name: "LOVEFOOL", bgID: "0266-lovefool", frames: 2, delay: 15, colour: "#ffa6c9", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, outline: "#ff569d", tags: ["love","user","pink","soleil","2024mar"],
  },
  '0259-spiralpastel': {
    name: "Hypnotizedddd", bgID: "0259-spiralpastel", frames: 2, delay: 20, colour: "#ff8400", font: "digitaldisco", fontsize: 16, x: 7, y: 0, shadow: ["#ffcff4","#d5faff"], shadowx: [4,-4], shadowy: [-2,2], tags: ["rainbow","user","pawpr1nc3"],
  },
  '0258-smileyshug': {
    name: "I love you guys 🙂", bgID: "0258-smileyshug", frames: 4, delay: 15, colour: "#f6d2da", font: "offical emotes.", fontsize: 16, x: -19, y: 0, tags: ["love","user","anakin","smiley","reactions"],
  },
  '0242-loveletter': {
    name: "Love Letter", bgID: "0242-loveletter", frames: 8, delay: 20, colour: "#57006d", font: "pixelpoiiz", fontsize: 10, x: -12, y: 0, outline: "#e591f0", tags: ["love","occasion","pink","user","socks","bp1"],
  },
  '0238-heartsconnected': {
    name: "Secret Soulmates", bgID: "0238-heartsconnected", frames: 10, delay: 10, colour: ["#ff0000","#ec0000","#d90102","#c80102","#b40203","#a00305","#b40203","#c80102","#d90102","#ec0000"], font: "moonaco", fontsize: 16, x: -1, y: 0, tags: ["love","user","jean","bp1"],
  },
  '0245-pikachuhearts': {
    name: "I pika-choose you!", bgID: "0245-pikachuhearts", frames: 2, delay: 17, colour: "#efe774", font: "grapesoda", fontsize: 16, x: -2, y: 0, outline: "#b80085", tags: ["love","pink","fandom","pokemon","pikachu","user","crow","crowpunk","bp1"],
  },
  '0256-transparentpastelbubbles': {
    name: "bubbly 4 u!", bgID: "0256-transparentpastelbubbles", frames: 2, delay: 20, colour: "#ff789a", font: "grapesoda", fontsize: 16, x: -1, y: 0, outline: "#ffffff", tags: ["transparent","bp1"],
  },
  '0253-rainbowheartclownballoons': {
    name: "kiss a clown!!!", bgID: "0253-rainbowheartclownballoons", frames: 2, delay: 21, colour: "#ff0800", font: "grapesoda", fontsize: 16, x: -14, y: 0, outline: "#ffffff", tags: ["rainbow","occasion","user","crow","crowpunk","bp1"],
  },
  '0251-pastelpinkbutterfly': {
    name: "butterfly kisses", bgID: "0251-pastelpinkbutterfly", frames: 2, delay: 20, colour: "#b100cd", font: "monogramextended", fontsize: 16, x: 8, y: 1, tags: ["nature","pink","user","pawpr1nc3","bp1"],
  },
  '0243-heartflowerplant': {
    name: "Love In Bloom", bgID: "0243-heartflowerplant", frames: 2, delay: 14, colour: "#036d00", font: "rainyhearts", fontsize: 16, x: 7, y: 0, tags: ["love","nature","user","pawpr1nc3","bp1"],
  },
  '0255-glowinghearts': {
    name: "Lovecore Lover", bgID: "0255-glowinghearts", frames: 4, delay: 10, colour: "#ffffff", font: "digitaldisco", fontsize: 16, x: -2, y: -1, outline: "#c40000", tags: ["love","user","jay","bp1"],
  },
  '0250-redbouncyhearts': {
    name: "Lovestruck", bgID: "0250-redbouncyhearts", frames: 2, delay: 20, colour: "#d00000", font: "moonaco", fontsize: 16, x: -1, y: 0, tags: ["love","user","pawpr1nc3","bp1"],
  },
  '0249-beatinghearts': {
    name: "ドキドキ !", bgID: "0249-beatinghearts", frames: 6, delay: 12, colour: "#ff4f6a", font: "lanapixel", fontsize: 11, x: -1, y: -1, tags: ["love","user","anonymous","bp1"],
  },
  '0248-lipsrosesparkle': {
    name: "mwah!", bgID: "0248-lipsrosesparkle", frames: 3, delay: 10, colour: "#c72728", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -2, y: 0, tags: ["love","pink","red","occasion","sparkle","user","frenz","fren-z","bp1"],
  },
  '0254-strawberrygradient': {
    name: "hopeful romantic", bgID: "0254-strawberrygradient", frames: 2, delay: 10, colour: "#e40029", font: "pixelpoiiz", fontsize: 10, x: -1, y: 0, outline: "#eabec2", tags: ["plain","pink","user","proxy","bp1"],
  },
  '0247-pinkheart': {
    name: "Heartfelt <3", bgID: "0247-pinkheart", frames: 2, delay: 13, colour: "#fb9ca6", font: "lanapixel", fontsize: 11, x: -7, y: -1, tags: ["love","pink","user","jellobubble","bp1"],
  },
  '0246-heartflowergrass': {
    name: "Love is in bloom", bgID: "0246-heartflowergrass", frames: 2, delay: 20, colour: "#f15e58", font: "rainyhearts", fontsize: 16, x: -7, y: 0, tags: ["love","nature","user","mikey","bp1"],
  },
  '0239-heartmessage': {
    name: "Message for u!", bgID: "0239-heartmessage", frames: 2, delay: 20, colour: "#d60016", font: "rainyhearts", fontsize: 16, x: 7, y: 1, tags: ["love","reaction","pink","user","pawpr1nc3","bp1"],
  },
  '0252-heartpair': {
    name: "ily dear", bgID: "0252-heartpair", frames: 2, delay: 20, colour: "#e91e63", font: "rainyhearts", fontsize: 16, x: -7, y: 0, tags: ["love","user","vexel","bp1"],
  },
  '0257-dollcoupleheart': {
    name: "I  ♥  My  Boy", bgID: "0257-dollcoupleheart", frames: 2, delay: 20, colour: "#ffffff", font: "moonaco", fontsize: 16, x: -1, y: 0, tags: ["love","bp1"],
  },
  '0244-redlips': {
    name: "Read My Lips", bgID: "0244-redlips", frames: 2, delay: 10, colour: "#ff9d9d", font: "moonaco", fontsize: 16, x: -1, y: 0, tags: ["love","user","jay","bp1"],
  },
  '0241-redpulse': {
    name: "*.*. Red Pulse .*.*", bgID: "0241-redpulse", frames: 10, delay: 10, colour: "#ff0000", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, tags: ["plain"],
  },
  '0240-nursestethoscope': {
    name: "Nurse BF <3", bgID: "0240-nursestethoscope", frames: 10, delay: 10, colour: "#ff0000", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -16, y: 0, tags: ["occasion"],
  },
  '0236-pastelshootingstar': {
    name: "Shooting star", bgID: "0236-pastelshootingstar", frames: 4, delay: 20, colour: ["#ff8400","#ff74e0","#ff8400","#ff74e0"], font: "rainyhearts", fontsize: 16, x: 8, y: 1, tags: ["nature","user"],
  },
  '0235-rainbowstar': {
    name: "S I L L Y  !!", bgID: "0235-rainbowstar", frames: 6, delay: 15, colour: "#ffffff", font: "fipps", fontsize: 8, x: 9, y: 0, tags: ["nature","sparkle","rainbow","user"],
  },
  '0237-purplestars': {
    name: "supah star", bgID: "0237-purplestars", frames: 3, delay: 16, colour: "#ffffff", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, tags: ["nature","sparkle","user"],
  },
  '0234-mbavdoublenegativeangeldevil': {
    name: "Double Negative", bgID: "0234-mbavdoublenegativeangeldevil", frames: 2, delay: 17, colour: "#ffffff", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 0, y: 0, tags: ["fandom","spooky","anakin"],
  },
  '0231-treeforest': {
    name: "Forest Walker", bgID: "0231-treeforest", frames: 2, delay: 18, colour: "#1d592b", font: "alagard", fontsize: 16, x: -20, y: -1, outline: "#b7f0bd", tags: ["nature","user","proxy"],
  },
  '0230-plantpot': {
    name: "growing", bgID: "0230-plantpot", frames: 2, delay: 18, colour: "#60a040", font: "rainyhearts", fontsize: 16, x: 5, y: 1, tags: ["nature","user","pawpr1nc3"],
  },
  '0227-birds': {
    name: "Keeping afloat", bgID: "0227-birds", frames: 2, delay: 25, colour: "#550088", font: "rainyhearts", fontsize: 16, x: -1, y: 1, tags: ["nature","user"],
  },
  '0223-yandere': {
    name: "D A R L I N G", bgID: "0223-yandere", frames: 3, delay: 22, colour: "#eb0505", font: "doublehomicide", fontsize: 16, x: 0, y: 0, tags: ["spooky","pink","love","user"],
  },
  '0228-pinkdrip': {
    name: "love me love me love me love me lov", bgID: "0228-pinkdrip", frames: 5, delay: 10, colour: "#f2b2eb", font: "doublehomicide", fontsize: 16, x: -1, y: 0, outline: "#e443e4", tags: ["spooky","pink","love","transparent"],
  },
  '0229-roses': {
    name: "Thus with a kiss I die.", bgID: "0229-roses", frames: 2, delay: 20, colour: "#d0466a", font: "moonaco", fontsize: 16, x: -1, y: 0, tags: ["love","nature"],
  },
  '0226-snowflake': {
    name: "Snow Day", bgID: "0226-snowflake", frames: 3, delay: 10, colour: "#ffffff", font: "rainyhearts", fontsize: 16, x: -1, y: 0, outline: "#4b92d1", tags: ["nature","anakin"],
  },
  '0224-raincloud': {
    name: "Cloudy...", bgID: "0224-raincloud", frames: 4, delay: 20, colour: "#3375ff", font: "pixelpoiiz", fontsize: 10, x: -1, y: 0, tags: ["nature","user"],
  },
  '0225-softblue': {
    name: "First Snow", bgID: "0225-softblue", frames: 3, delay: 10, colour: "#ffffff", font: "rainyhearts", fontsize: 16, x: -1, y: 0, outline: "#4b92d1", tags: ["plain","anakin"],
  },
  '0220-pills': {
    name: "TAKE YOUR MEDS", bgID: "0220-pills", frames: 4, delay: 14, colour: "#00005e", font: "04b_19", fontsize: 14, x: -1, y: 0, tags: ["food","anakin"],
  },
  '0222-construction': {
    name: "UNDER CONSTRUCTION", bgID: "0222-construction", frames: 2, delay: 20, colour: "#000000", font: "hud", fontsize: 5, x: -1, y: 0, tags: ["plain"],
  },
  '0221-cd': {
    name: "I  love  the  music !", bgID: "0221-cd", frames: 4, delay: 12, colour: "#31ffef", font: "moonaco", fontsize: 16, x: -1, y: 0, tags: ["computer"],
  },
  '0219-promare3': {
    name: "MAD BURNISH", bgID: "0219-promare3", frames: 6, delay: 10, colour: ["#fe9aa6","#ffb8a5","#fddea1","#fdec9f","#fddea1","#ffb8a5"], font: "alagard", fontsize: 16, x: -1, y: -1, tags: ["fandom","user","proxy"],
  },
  '0218-promare2': {
    name: "MAD BURNISH", bgID: "0218-promare2", frames: 6, delay: 10, colour: ["#1e8ada","#2d9bdb","#3babdc","#55c9de","#3babdc","#2d9bdb"], font: "alagard", fontsize: 16, x: -1, y: -1, tags: ["fandom","user"],
  },
  '0217-promare1': {
    name: "MAD BURNISH", bgID: "0217-promare1", frames: 6, delay: 10, colour: ["#ff75ee","#e891df","#cbb3cc","#a0e8b0","#cbb3cc","#e891df"], font: "alagard", fontsize: 16, x: -1, y: -1, tags: ["fandom","user"],
  },
  '0216-cinderella': {
    name: "Cinderella", bgID: "0216-cinderella", frames: 2, delay: 10, colour: "#56bae4", font: "alagard", fontsize: 16, x: -12, y: -1, tags: ["occasion","fandom","anakin"],
  },
  '0206-nyancat': {
    name: "Nyan Nyan Nyan", bgID: "0206-nyancat", frames: 12, delay: 6, colour: "#ffffff", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 14, y: 1, outline: "#013368", tags: ["rainbow","anakin"],
  },
  '0209-antigravrainbowconfetti': {
    name: "hbd blinkies.cafe <3", bgID: "0209-antigravrainbowconfetti", frames: 6, delay: 10, colour: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, tags: ["rainbow","occasion"],
  },
  '0208-rainbowconfetti': {
    name: "blinkies.cafe bday!", bgID: "0208-rainbowconfetti", frames: 6, delay: 10, colour: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, tags: ["rainbow","occasion","anakin"],
  },
  '0213-gradientorange': {
    name: "Jumpsuit Orange", bgID: "0213-gradientorange", frames: 2, delay: 15, colour: "#ffffff", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, outline: "#7b4f00", tags: ["plain","user"],
  },
  '0212-gradientblue': {
    name: "Core Blue", bgID: "0212-gradientblue", frames: 2, delay: 15, colour: "#ffffff", font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, outline: "#000096", tags: ["plain","user"],
  },
  '0211-ghostorange': {
    name: "BOO!!! hehe", bgID: "0211-ghostorange", frames: 2, delay: 15, colour: ["#000000","#000000"], font: "infernalda", fontsize: 16, x: -1, y: -1, tags: ["spooky","anakin"],
  },
  '0210-werewolfmoonhowl': {
    name: "Awoooooooooooo", bgID: "0210-werewolfmoonhowl", frames: 2, delay: 15, colour: ["#ffffff","#ffffff"], font: "infernalda", fontsize: 16, x: -18, y: -1, tags: ["spooky","anakin"],
  },
  '0207-happybirthdayblinkiescafe': {
    name: "blinkies.cafe turns 1yo!!", bgID: "0207-happybirthdayblinkiescafe", frames: 6, delay: 10, colour: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -1, y: 0, tags: ["rainbow","occasion"],
  },
  '0205-pluralsystem': {
    name: "plural system", bgID: "0205-pluralsystem", frames: 4, delay: 10, colour: ["#000000","#000000","#000000","#000000"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -11, y: 0, tags: ["flags"],
  },
  '0204-twitchlogo': {
    name: "Twitch", bgID: "0204-twitchlogo", frames: 2, delay: 15, colour: ["#9146ff","#9146ff"], font: "green screen", fontsize: 12, x: -9, y: 0, tags: ["link"],
  },
  '0203-youtubelogo': {
    name: "Youtube", bgID: "0203-youtubelogo", frames: 2, delay: 15, colour: ["#ff0101","#ff0101"], font: "green screen", fontsize: 12, x: -14, y: 0, tags: ["link","anakin"],
  },
  '0202-pinterestlogo': {
    name: "Pinterest", bgID: "0202-pinterestlogo", frames: 2, delay: 15, colour: ["#ea0016","#ea0016"], font: "green screen", fontsize: 12, x: -13, y: 0, tags: ["link","anakin"],
  },
  '0201-twitterlogo': {
    name: "Twitter", bgID: "0201-twitterlogo", frames: 2, delay: 15, colour: ["#f9f7f5","#f9f7f5"], font: "green screen", fontsize: 12, x: -12, y: 0, tags: ["link","anakin"],
  },
  '0200-tumblrlogo': {
    name: "Tumblr", bgID: "0200-tumblrlogo", frames: 2, delay: 15, colour: ["#fcfcfc","#fcfcfc"], font: "green screen", fontsize: 12, x: -8, y: 0, tags: ["link","anakin"],
  },
  '0199-instagramlogo': {
    name: "Instagram", bgID: "0199-instagramlogo", frames: 3, delay: 20, colour: ["#53443d","#53443d","#53443d"], font: "green screen", fontsize: 12, x: -12, y: 0, tags: ["link","anakin"],
  },
  '0196-browndog': {
    name: "I love my doggie!", bgID: "0196-browndog", frames: 2, delay: 15, colour: ["#854a18","#854a18"], font: "rainyhearts", fontsize: 16, x: 10, y: 0, tags: ["nature","anakin"],
  },
  '0194-pleadingemoji': {
    name: "prommy?", bgID: "0194-pleadingemoji", frames: 2, delay: 12, colour: ["#276984","#276984"], font: "grapesoda", fontsize: 16, x: 0, y: 0, tags: ["reaction","smiley","user"],
  },
  '0193-topsurgery': {
    name: "top surgery :D", bgID: "0193-topsurgery", frames: 2, delay: 10, colour: ["#a22633","#a22633"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -14, y: 0, tags: ["lgbtq","occasion"],
  },
  '0195-raven': {
    name: "Edgar Allan's Foe", bgID: "0195-raven", frames: 2, delay: 12, colour: ["#ff0000","#ff0000"], font: "infernalda", fontsize: 16, x: -10, y: -1, tags: ["spooky","nature","user"],
  },
  '0197-gray': {
    name: "Gray Scale", bgID: "0197-gray", frames: 2, delay: 13, colour: ["#a0a0a0","#a0a0a0"], font: "green screen", fontsize: 12, x: 0, y: 0, outline: ["#282828","#282828"], tags: ["plain","anakin"],
  },
  '0192-forgetmenotflower': {
    name: "forget-me-not", bgID: "0192-forgetmenotflower", frames: 2, delay: 15, colour: ["#0075e6","#0075e6"], font: "moonaco", fontsize: 16, x: 3, y: 0, tags: ["nature"],
  },
  '0191-fallleaves': {
    name: "This user loves fall", bgID: "0191-fallleaves", frames: 4, delay: 15, colour: ["#b34700","#b34700","#b34700","#b34700"], font: "moonaco", fontsize: 16, x: -2, y: 0, tags: ["nature","occasion","anakin"],
  },
  '0190-hittingfloor': {
    name: "FUCK MY LIFE!", bgID: "0190-hittingfloor", frames: 6, delay: 4, colour: ["#000000","#000000","#000000","#000000","#000000","#000000"], font: "doublehomicide", fontsize: 16, x: 10, y: 0, tags: ["reaction","anakin"],
  },
  '0187-transparentsparkle': {
    name: "bro ur sparkling", bgID: "0187-transparentsparkle", frames: 2, delay: 20, colour: ["#fbc774","#fbc774"], font: "moonaco", fontsize: 16, x: -1, y: 0, outline: ["#d09639","#d09639"], tags: ["transparent","sparkle"],
  },
  '0189-whale': {
    name: "Havin a whale of a time", bgID: "0189-whale", frames: 2, delay: 20, colour: ["#0083a8","#0083a8"], font: "moonaco", fontsize: 16, x: -11, y: 0, tags: ["nature","anakin"],
  },
  '0186-angelsmiley': {
    name: "me? naughty? neverr", bgID: "0186-angelsmiley", frames: 2, delay: 10, colour: ["#ffff84","#ffff84"], font: "rainyhearts", fontsize: 16, x: -9, y: 0, tags: ["smiley","reaction"],
  },
  '0188-knifechainsaw': {
    name: "I <3 VIOLENCE", bgID: "0188-knifechainsaw", frames: 4, delay: 15, colour: ["#d8192b","#d8192b","#d8192b","#d8192b"], font: "doublehomicide", fontsize: 16, x: 0, y: 0, shadow: ["#7b0008","#7b0008","#7b0008","#7b0008"], tags: ["spooky","anakin"],
  },
  '0179-kittencry': {
    name: "want  kibbles...", bgID: "0179-kittencry", frames: 8, delay: 10, colour: ["#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000"], font: "moonaco", fontsize: 16, x: 21, y: 0, tags: ["nature","reaction"],
  },
  '0182-halloweencathouse': {
    name: "Happy Halloween", bgID: "0182-halloweencathouse", frames: 4, delay: 20, colour: ["#fdbe02","#fdbe02","#fdbe02","#fdbe02"], font: "infernalda", fontsize: 16, x: -1, y: -1, tags: ["spooky","occasion","sparkle","anakin"],
  },
  '0184-pastelpinkrainbow': {
    name: "Strawberry Sundae", bgID: "0184-pastelpinkrainbow", frames: 6, delay: 13, colour: ["#ed7eb2","#ed7eb2","#ed7eb2","#ed7eb2","#ed7eb2","#ed7eb2"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["pink","plain","anakin"],
  },
  '0183-pastelpinkwings': {
    name: "Pastel Angel", bgID: "0183-pastelpinkwings", frames: 5, delay: 13, colour: ["#ed7eb2","#ed7eb2","#ed7eb2","#ed7eb2","#ed7eb2"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["pink","anakin"],
  },
  '0185-pinkglow': {
    name: "blushing so hard rn", bgID: "0185-pinkglow", frames: 4, delay: 15, colour: ["#000000","#000000","#000000","#000000"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 0, y: 0, outline: ["#ab1eab","#ff43ff","#ffa1ff","#ff43ff"], tags: ["plain","pink"],
  },
  '0180-happybirthday': {
    name: "happy birthday!!!", bgID: "0180-happybirthday", frames: 6, delay: 15, colour: ["#ff1a00","#ff7300","#fdf429","#00ff00","#00ceff","#ae00ff"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["rainbow","occasion","anakin"],
  },
  '0181-confetti': {
    name: "Congratulations!!", bgID: "0180-happybirthday", frames: 6, delay: 15, colour: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["food","occasion","anakin"],
  },
  '0178-mikuwink2': {
    name: "Miku fan!!", bgID: "0178-mikuwink2", frames: 10, delay: 10, colour: ["#16446d","#16446d","#16446d","#16446d","#16446d","#16446d","#16446d","#16446d","#16446d","#16446d"], font: "grapesoda", fontsize: 16, x: -29, y: 0, tags: ["fandom"],
  },
  '0177-splatoonoctolingyellow': {
    name: "u octopi my <3", bgID: "0177-splatoonoctolingyellow", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "hydratinglip", fontsize: 13, x: 0, y: 0, outline: ["#000000","#000000"], tags: ["fandom","anakin"],
  },
  '0176-splatoonoctolinggreen': {
    name: "octolicious", bgID: "0176-splatoonoctolinggreen", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "hydratinglip", fontsize: 13, x: 0, y: 0, outline: ["#000000","#000000"], tags: ["fandom","anakin"],
  },
  '0175-splatoonoctolingorange': {
    name: "octo time :)", bgID: "0175-splatoonoctolingorange", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "hydratinglip", fontsize: 13, x: 0, y: 0, outline: ["#000000","#000000"], tags: ["fandom","anakin"],
  },
  '0174-hal9000': {
    name: "I'm sorry Dave, I'm afraid I can't do that.", bgID: "0174-hal9000", frames: 4, delay: 10, colour: ["#a92d2c","#a92d2c","#766464","#766464"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 11, y: 0, tags: ["fandom","computer","anakin"],
  },
  '0173-dollbrowneyes': {
    name: "bishoujo", bgID: "0173-dollbrowneyes", frames: 2, delay: 10, colour: ["#350b47","#350b47"], font: "rainyhearts", fontsize: 16, x: -15, y: 0, tags: ["pink","anakin"],
  },
  '0172-rainbowequalizer': {
    name: "SCENE KID!", bgID: "0172-rainbowequalizer", frames: 6, delay: 10, colour: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], font: "digitaldisco", fontsize: 16, x: 0, y: -1, outline: ["#ff1a00","#ff7300","#ffe400","#2dff00","#00ceff","#ae00ff"], tags: ["computer","rainbow","anakin"],
  },
  '0171-jerma': {
    name: "JERMA985", bgID: "0171-jerma", frames: 2, delay: 10, colour: ["#1faab8","#1faab8"], font: "grapesoda", fontsize: 16, x: -3, y: 0, shadow: ["#085e80","#085e80"], shadowx: 1, shadowy: 1, tags: ["fandom","anakin"],
  },
  '0169-topsurgery': {
    name: "top surgery :D", bgID: "0169-topsurgery", frames: 2, delay: 10, colour: ["#a22633","#a22633"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -14, y: 0, tags: ["lgbtq","occasion"],
  },
  '0143-webkinz': {
    name: "Webkinz", bgID: "0143-webkinz", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "grapesoda", fontsize: 16, x: -15, y: 0, outline: ["#1014a9","#1014a9"], tags: ["fandom"],
  },
  '0163-cherry': {
    name: "cherry flavoured love", bgID: "0163-cherry", frames: 2, delay: 20, colour: ["#ff004c","#ff004c"], font: "moonaco", fontsize: 16, x: 11, y: 0, tags: ["food"],
  },
  '0162-cherry': {
    name: "cherry kisses", bgID: "0162-cherry", frames: 2, delay: 20, colour: ["#ff004c","#ff004c"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["food"],
  },
  '0152-honeyslime': {
    name: "sweet as honey", bgID: "0152-honeyslime", frames: 2, delay: 20, colour: ["#531007","#531007"], font: "hydratinglip", fontsize: 13, x: -1, y: 0, tags: ["fandom","otigan","user"],
  },
  '0166-finfin': {
    name: "fin fin come see him", bgID: "0166-finfin", frames: 2, delay: 15, colour: ["#ffffff","#ffffff"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -14, y: 0, outline: ["#00afb3","#019b9c"], tags: ["nature","anakin"],
  },
  '0167-saw': {
    name: "GAS GAS GAS", bgID: "0167-saw", frames: 2, delay: 10, colour: ["#babdc2","#adb1b5"], font: "doublehomicide", fontsize: 16, x: 2, y: 0, tags: ["spooky","anakin"],
  },
  '0165-jennifersbody': {
    name: "I am a god", bgID: "0165-jennifersbody", frames: 2, delay: 10, colour: ["#ff0000","#ff0000"], font: "doublehomicide", fontsize: 16, x: -21, y: 0, tags: ["fandom","spooky"],
  },
  '0164-bloodylips': {
    name: "Hell is a teen girl", bgID: "0164-bloodylips", frames: 2, delay: 10, colour: ["#ff0000","#ff0000"], font: "hydratinglip", fontsize: 13, x: -14, y: 0, tags: ["fandom","spooky"],
  },
  '0150-alligator': {
    name: "cya later alligator!", bgID: "0150-alligator", frames: 4, delay: 10, colour: ["#067332","#067332","#067332","#067332"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -16, y: 0, tags: ["nature","anakin"],
  },
  '0138-greenglow': {
    name: "I Glow in the Dark", bgID: "0138-greenglow", frames: 4, delay: 15, colour: ["#000000","#000000","#000000","#000000"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 0, y: 0, outline: ["#296b29","#29c629","#42ff42","#29c629"], tags: ["plain"],
  },
  '0140-hsroxy': {
    name: "rogue of void", bgID: "0140-hsroxy", frames: 2, delay: 10, colour: ["#ff6ff2","#ff6ff2"], font: "monogramextended", fontsize: 16, x: -14, y: 1, tags: ["fandom"],
  },
  '0159-toontrap': {
    name: "i love trap gags", bgID: "0159-toontrap", frames: 2, delay: 10, colour: ["#9a1d1b","#9a1d1b"], font: "grapesoda", fontsize: 16, x: 0, y: 0, tags: ["fandom","anakin"],
  },
  '0158-toonup': {
    name: "i love toon-up", bgID: "0158-toonup", frames: 6, delay: 10, colour: ["#674482","#674482","#674482","#674482","#674482","#674482"], font: "grapesoda", fontsize: 16, x: 2, y: 0, tags: ["fandom","anakin"],
  },
  '0157-toonzap': {
    name: "i love zap gags", bgID: "0157-toonzap", frames: 2, delay: 10, colour: ["#6a7000","#6a7000"], font: "grapesoda", fontsize: 16, x: -4, y: 0, tags: ["fandom","anakin"],
  },
  '0156-toonlure': {
    name: "i love lure", bgID: "0156-toonlure", frames: 2, delay: 10, colour: ["#0f311e","#0f311e"], font: "grapesoda", fontsize: 16, x: -3, y: 0, tags: ["fandom","anakin"],
  },
  '0155-toondrop': {
    name: "i love drop gags", bgID: "0155-toondrop", frames: 2, delay: 10, colour: ["#005679","#005679"], font: "grapesoda", fontsize: 16, x: -3, y: 0, tags: ["fandom","anakin"],
  },
  '0154-toonsound': {
    name: "i love sound", bgID: "0154-toonsound", frames: 2, delay: 10, colour: ["#081355","#081355"], font: "grapesoda", fontsize: 16, x: 0, y: 0, tags: ["fandom","anakin"],
  },
  '0153-toonsquirt': {
    name: "i love squirt", bgID: "0153-toonsquirt", frames: 2, delay: 10, colour: ["#003f73","#003f73"], font: "grapesoda", fontsize: 16, x: 4, y: 0, tags: ["fandom","anakin"],
  },
  '0151-toonthrow': {
    name: "i love throw", bgID: "0151-toonthrow", frames: 6, delay: 10, colour: ["#756830","#756830","#756830","#756830","#756830","#756830"], font: "grapesoda", fontsize: 16, x: -2, y: 0, tags: ["fandom","anakin"],
  },
  '0148-kirbyswim': {
    name: "just keep swimming", bgID: "0148-kirbyswim", frames: 8, delay: 10, colour: ["#3e36af","#3e36af","#3e36af","#3e36af","#3e36af","#3e36af","#3e36af","#3e36af"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -12, y: 0, outline: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], shadowx: 1, shadowy: -1, tags: ["fandom","anakin"],
  },
  '0147-kirbywalk': {
    name: "im walkin here!!!", bgID: "0147-kirbywalk", frames: 10, delay: 10, colour: ["#9f006a","#9f006a","#9f006a","#9f006a","#9f006a","#9f006a","#9f006a","#9f006a","#9f006a","#9f006a"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -10, y: 0, tags: ["fandom","anakin","pink"],
  },
  '0146-kirbydance': {
    name: "best buds", bgID: "0146-kirbydance", frames: 4, delay: 10, colour: ["#9f006a","#9f006a","#9f006a","#9f006a"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 0, y: 0, tags: ["fandom","anakin","pink"],
  },
  '0145-kirbysquish': {
    name: "ow ow ow", bgID: "0145-kirbysquish", frames: 2, delay: 20, colour: ["#9f006a","#9f006a"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -12, y: 0, tags: ["fandom","anakin","pink"],
  },
  '0144-pokeball': {
    name: "I choose you!! <3", bgID: "0144-pokeball", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "grapesoda", fontsize: 16, x: -9, y: 0, tags: ["fandom","pokemon"],
  },
  '0136-clock': {
    name: "This user is time blind", bgID: "0136-clock", frames: 8, delay: 10, colour: ["#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000"], font: "moonaco", fontsize: 16, x: 7, y: 0, tags: [],
  },
  '0149-ty': {
    name: "I /heart beanie babies", bgID: "0149-ty", frames: 2, delay: 10, colour: ["#ff0606","#ff0606"], font: "moonaco", fontsize: 16, x: 11, y: 0, tags: ["fandom","anakin"],
  },
  '0135-pinkiepie': {
    name: "Pinkie Pie", bgID: "0135-pinkiepie", frames: 2, delay: 10, colour: ["#f05f99","#f05f99"], font: "moonaco", fontsize: 16, x: -3, y: 0, tags: ["fandom","anakin"],
  },
  '0134-fluttershy': {
    name: "Fluttershy", bgID: "0134-fluttershy", frames: 2, delay: 10, colour: ["#c98791","#c98791"], font: "moonaco", fontsize: 16, x: -3, y: 0, tags: ["fandom","anakin"],
  },
  '0133-applejack': {
    name: "Applejack", bgID: "0133-applejack", frames: 2, delay: 10, colour: ["#f14135","#f14135"], font: "moonaco", fontsize: 16, x: -3, y: 0, tags: ["fandom","anakin"],
  },
  '0132-rainbowdash': {
    name: "Rainbow Dash", bgID: "0132-rainbowdash", frames: 2, delay: 10, colour: ["#0681bf","#0681bf"], font: "moonaco", fontsize: 16, x: -3, y: 0, tags: ["fandom","anakin"],
  },
  '0131-rarity': {
    name: "Rarity", bgID: "0131-rarity", frames: 2, delay: 10, colour: ["#5a2b78","#5a2b78"], font: "moonaco", fontsize: 16, x: -3, y: 0, tags: ["fandom","anakin"],
  },
  '0130-twilightsparkle': {
    name: "Twilight Sparkle", bgID: "0130-twilightsparkle", frames: 2, delay: 10, colour: ["#414373","#414373"], font: "moonaco", fontsize: 16, x: -3, y: 0, tags: ["fandom","anakin"],
  },
  '0129-splatoon3': {
    name: "Splatoon 3", bgID: "0129-splatoon3", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "hydratinglip", fontsize: 13, x: 0, y: 0, outline: ["#000000","#000000"], tags: ["fandom","anakin"],
  },
  '0128-splatoon2': {
    name: "Splatoon 2", bgID: "0128-splatoon2", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "hydratinglip", fontsize: 13, x: 0, y: 0, outline: ["#000000","#000000"], tags: ["fandom","anakin"],
  },
  '0127-splatoon1': {
    name: "Splatoon!", bgID: "0127-splatoon1", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "hydratinglip", fontsize: 13, x: 0, y: 0, outline: ["#000000","#000000"], tags: ["fandom","anakin"],
  },
  '0126-slime': {
    name: "slime girl", bgID: "0126-slime", frames: 5, delay: 10, colour: ["#00ff1f","#00ff1f","#00ff1f","#00ff1f","#00ff1f"], font: "hydratinglip", fontsize: 13, x: 0, y: 0, outline: ["#004700","#004700","#004700","#004700","#004700"], tags: ["spooky","transparent"],
  },
  '0125-blood': {
    name: "thirsty?", bgID: "0125-blood", frames: 5, delay: 10, colour: ["#ff1f1f","#ff1f1f","#ff1f1f","#ff1f1f","#ff1f1f"], font: "hydratinglip", fontsize: 13, x: 0, y: 0, outline: ["#470000","#470000","#470000","#470000","#470000"], tags: ["spooky","transparent"],
  },
  '0124-stars': {
    name: "stargazer", bgID: "0124-stars", frames: 6, delay: 10, colour: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 0, y: 0, tags: ["nature","sparkle","plain"],
  },
  '0123-glitterpink': {
    name: "never stop sparkling!", bgID: "0123-glitterpink", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "grapesoda", fontsize: 16, x: 0, y: 0, outline: ["#000000","#000000"], tags: ["pink","plain","sparkle","anakin"],
  },
  '0122-hsbreath': {
    name: "heir of breath", bgID: "0122-hsbreath", frames: 2, delay: 20, colour: ["#10e0ff","#10e0ff"], font: "monogramextended", fontsize: 16, x: -14, y: 1, tags: ["fandom"],
  },
  '0121-blinkiescafe': {
    name: "blinkies.cafe <3", bgID: "0121-blinkiescafe", frames: 2, delay: 25, colour: ["#ff7eff","#ff7eff"], font: "monogramextended", fontsize: 16, x: -8, y: 1, tags: ["computer","pink"],
  },
  '0120-starofdavid': {
    name: "Star of David", bgID: "0120-starofdavid", frames: 8, delay: 10, colour: ["#03a9f4","#3f51b5","#673ab7","#ea6793","#f03e3d","#fe5722","#feeb3b","#4caf50"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -9, y: 0, tags: ["rainbow","occasion"],
  },
  '0119-pastelstars': {
    name: "twinkle twinkle", bgID: "0119-pastelstars", frames: 4, delay: 13, colour: ["#ffffff","#ffffff","#ffffff","#ffffff"], font: "grapesoda", fontsize: 16, x: 0, y: 0, outline: ["#ff7ba5","#bdef94","#f7e794","#e7adf7"], tags: ["anakin"],
  },
  '0118-rubberducky': {
    name: "YOU QUACK ME UP!", bgID: "0118-rubberducky", frames: 2, delay: 10, colour: ["#d23100","#d23100"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 13, y: 0, shadow: ["#fede18","#fede18"], shadowx: [1,1], shadowy: -1, tags: ["anakin"],
  },
  '0117-redlightsaber': {
    name: "*SITH*  ", bgID: "0117-redlightsaber", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "bm army", fontsize: 12, x: -20, y: -1, tags: ["fandom"],
  },
  '0116-debian': {
    name: "powered by debian", bgID: "0116-debian", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -9, y: 0, tags: ["computer"],
  },
  '0115-alpinelinux': {
    name: "runs on alpine", bgID: "0115-alpinelinux", frames: 2, delay: 10, colour: ["#0d597f","#0d597f"], font: "digitaldisco", fontsize: 16, x: -12, y: 0, tags: ["computer"],
  },
  '0114-tbh': {
    name: "autism!", bgID: "0114-tbh", frames: 3, delay: 10, colour: ["#000000","#000000","#000000"], font: "grapesoda", fontsize: 16, x: 8, y: 0, tags: ["fandom","reaction"],
  },
  '0113-autism': {
    name: "Autism!", bgID: "0113-autism", frames: 8, delay: 10, colour: ["#03a9f4","#3f51b5","#673ab7","#ea6793","#f03e3d","#fe5722","#feeb3b","#4caf50"], font: "grapesoda", fontsize: 16, x: -16, y: 0, tags: ["rainbow"],
  },
  '0112-peep': {
    name: "Luv my peeps", bgID: "0112-peep", frames: 6, delay: 10, colour: ["#590d27","#7d4701","#755907","#346903","#0b4d54","#601070"], font: "fipps", fontsize: 8, x: 0, y: 0, tags: ["rainbow","anakin"],
  },
  '0111-glittergold': {
    name: "ur Princess xoxo", bgID: "0018-glitter", frames: 3, delay: 10, colour: ["#000000","#000000","#000000"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 0, y: 0, outline: ["#ffffff","#ffffff","#ffffff"], tags: ["plain","sparkle"],
  },
  '0110-yeah': {
    name: "I have social anxiety", bgID: "0110-yeah", frames: 2, delay: 10, colour: ["#003399","#003399"], font: "moonaco", fontsize: 16, x: 13, y: 0, tags: [],
  },
  '0109-gradientgreen': {
    name: "Verdant Zenith", bgID: "0109-gradientgreen", frames: 2, delay: 10, colour: ["#165a4c","#165a4c"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["plain","anakin"],
  },
  '0107-gradientorange': {
    name: "Radiant Dawn", bgID: "0107-gradientorange", frames: 2, delay: 10, colour: ["#7a183f","#7a183f"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["plain","anakin"],
  },
  '0106-vicioussmiley': {
    name: "AT MY FUCKING LIMIT", bgID: "0106-vicioussmiley", frames: 2, delay: 12, colour: ["#000000","#99197d"], font: "doublehomicide", fontsize: 16, x: -9, y: 0, tags: ["smiley","reaction","anakin"],
  },
  '0105-gradientpurple': {
    name: "Neon Sunset", bgID: "0105-gradientpurple", frames: 2, delay: 10, colour: ["#ffb4ff","#ffb4ff"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["plain","anakin"],
  },
  '0104-redsnowflake': {
    name: "Winter", bgID: "0104-redsnowflake", frames: 4, delay: 10, colour: ["#ad1818","#ad1818","#ad1818","#ad1818"], font: "04b03", fontsize: 8, x: 0, y: 0, tags: ["sparkle"],
  },
  '0103-kitty': {
    name: "too kawaii to live", bgID: "0103-kitty", frames: 2, delay: 10, colour: ["#9f006a","#9f006a"], font: "pixeloid sans", fontsize: 9, x: -10, y: 0, tags: ["nature","pink","fandom","anakin"],
  },
  '0102-rainbowchecker': {
    name: "102 blinkies!!!!", bgID: "0102-rainbowchecker", frames: 7, delay: 10, colour: ["#000000","#000000","#000000","#000000","#000000","#000000","#000000"], font: "digitaldisco", fontsize: 16, x: 0, y: 0, outline: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], tags: ["rainbow"],
  },
  '0101-ballcplyellowyellow': {
    name: "me and who? (*¯ ³¯*)♡", bgID: "0101-ballcplyellowyellow", frames: 2, delay: 10, colour: ["#31ffef","#31ffef"], font: "rainyhearts", fontsize: 16, x: -20, y: 0, tags: ["love","smiley"],
  },
  '0100-ballcplblueblue': {
    name: "me and who? (*^^*)♡", bgID: "0100-ballcplblueblue", frames: 2, delay: 10, colour: ["#31ffef","#31ffef"], font: "rainyhearts", fontsize: 16, x: -20, y: 0, tags: ["love","smiley"],
  },
  '0099-ballcplpinkpink': {
    name: "me and who? (//ω//)", bgID: "0099-ballcplpinkpink", frames: 2, delay: 10, colour: ["#31ffef","#31ffef"], font: "rainyhearts", fontsize: 16, x: -20, y: 0, tags: ["love","smiley"],
  },
  '0098-ballcplpinkblue': {
    name: "us <3<3<3<3<3", bgID: "0098-ballcplpinkblue", frames: 2, delay: 10, colour: ["#31ffef","#31ffef"], font: "rainyhearts", fontsize: 16, x: -20, y: 0, tags: ["love","smiley"],
  },
  '0097-purple': {
    name: "Sarcasm is the 1 service I offer.", bgID: "0097-purple", frames: 2, delay: 10, colour: ["#5500aa","#5500aa"], font: "04b03", fontsize: 8, x: 0, y: 0, tags: ["plain","anakin"],
  },
  '0096-blackgreen': {
    name: "black & green", bgID: "0096-blackgreen", frames: 2, delay: 10, colour: ["#00ff00","#00ff00"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["plain","anakin"],
  },
  '0095-tinycats': {
    name: "my cat made me do it", bgID: "0095-tinycats", frames: 2, delay: 10, colour: ["#844200","#844200"], font: "lanapixel", fontsize: 11, x: 0, y: -1, tags: ["nature"],
  },
  '0094-tinycats': {
    name: "/heart  proud cat dad  /heart", bgID: "0094-tinycats", frames: 2, delay: 10, colour: ["#844200","#844200"], font: "lanapixel", fontsize: 11, x: 0, y: -1, tags: ["nature"],
  },
  '0093-cats': {
    name: "hehe just kitten!! ;3c", bgID: "0093-cats", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "pixeloid sans", fontsize: 9, x: 0, y: 0, tags: ["nature"],
  },
  '0092-computerconnect': {
    name: "establishing connection...", bgID: "0092-computerconnect", frames: 10, delay: 15, colour: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: 8, y: 0, tags: ["computer"],
  },
  '0091-bug': {
    name: "bitten by the blinkie bug", bgID: "0091-bug", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "pixeloid sans", fontsize: 9, x: 7, y: 0, tags: ["nature"],
  },
  '0090-flatline': {
    name: "still hanging on", bgID: "0090-flatline", frames: 2, delay: 10, colour: ["#e70000","#e70000"], font: "moonaco", fontsize: 16, x: 11, y: 0, tags: [],
  },
  '0089-kiss': {
    name: "*~ mwah!! ~*", bgID: "0089-kiss", frames: 3, delay: 22, colour: ["#000000","#000000","#000000"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: 0, y: 0, tags: ["love","pink"],
  },
  '0088-cow': {
    name: "happy MOO 2 U !!!", bgID: "0088-cow", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "pixeloid sans", fontsize: 9, x: -14, y: 0, tags: ["nature"],
  },
  '0086-dollface': {
    name: "bishoujo", bgID: "0086-dollface", frames: 2, delay: 10, colour: ["#350b47","#350b47"], font: "rainyhearts", fontsize: 16, x: -15, y: 0, tags: ["pink"],
  },
  '0085-dolleyes': {
    name: "i luv boyz!", bgID: "0085-dolleyes", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "rainyhearts", fontsize: 16, x: 0, y: 0, tags: ["pink"],
  },
  '0070-lavalamp': {
    name: "lava lamp", bgID: "0070-lavalamp", frames: 10, delay: 10, colour: ["#00dcfb","#00dcfb","#00dcfb","#00dcfb","#00dcfb","#00dcfb","#00dcfb","#00dcfb","#00dcfb","#00dcfb"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: [],
  },
  '0069-alien': {
    name: "ABDUCTABLE", bgID: "0069-alien", frames: 2, delay: 20, colour: ["#00ff00","#00ff00"], font: "monogramextended", fontsize: 16, x: -13, y: 1, tags: ["spooky"],
  },
  '0068-mainframe': {
    name: "Command ===> ___", bgID: "0059-greenscreen", frames: 3, delay: 5, colour: ["#00ff00","#00ff00","#00ff00"], font: "green screen", fontsize: 12, x: 0, y: 0, tags: ["plain","computer"],
  },
  '0067-moonstars': {
    name: "werewolf", bgID: "0067-moonstars", frames: 5, delay: 10, colour: ["#c694f7","#c694f7","#c694f7","#c694f7","#c694f7"], font: "pixeloid sans", fontsize: 9, fontweight: "bold", x: -14, y: 0, tags: ["nature","sparkle"],
  },
  '0066-orangekitty': {
    name: "h...hewwo???", bgID: "0066-orangekitty", frames: 2, delay: 10, colour: ["#ff7b00","#ff7b00"], font: "04b03", fontsize: 8, x: -25, y: 0, tags: ["nature","reaction"],
  },
  '0065-bunnies': {
    name: "good night /eheart sleep tight", bgID: "0065-bunnies", frames: 6, delay: 20, colour: ["#394aa5","#394aa5","#394aa5","#394aa5","#394aa5","#394aa5"], font: "lanapixel", fontsize: 11, x: -15, y: -1, tags: ["nature","anakin"],
  },
  '0064-cow': {
    name: "i Moo @ Cows", bgID: "0064-cow", frames: 2, delay: 10, colour: ["#ff0000","#ff0000"], font: "grapesoda", fontsize: 16, x: 0, y: 0, shadow: ["#bb0000","#bb0000"], tags: ["nature","anakin"],
  },
  '0063-darth': {
    name: "Join the Dark Side", bgID: "0063-darth", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "{pixelflag}", fontsize: 16, x: -10, y: -1, tags: ["fandom","anakin"],
  },
  '0062-flower': {
    name: "I love gardening", bgID: "0062-flower", frames: 2, delay: 10, colour: ["#697446","#697446"], font: "04b03", fontsize: 8, x: 0, y: 0, tags: ["nature","anakin"],
  },
  '0061-pinkcomputer': {
    name: "I love my computer <3", bgID: "0061-pinkcomputer", frames: 2, delay: 20, colour: ["#ff0084","#ff0084"], font: "moonaco", fontsize: 16, x: 11, y: 0, tags: ["computer","pink","love","anakin"],
  },
  '0060-glitch': {
    name: "oh no...,,", bgID: "0060-glitch", frames: 3, delay: 15, colour: ["#000000","#000000","#000000"], font: "pixelpoiiz", fontsize: 10, x: [0,0,-1], y: 0, shadow: ["#ffffff","#ffffff","#ffffff"], shadowx: [6,6,7], tags: ["smiley"],
  },
  '0059-greenscreen': {
    name: "green screen", bgID: "0059-greenscreen", frames: 3, delay: 5, colour: ["#00ff00","#00ff00","#00ff00"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["plain"],
  },
  '0058-snail': {
    name: "dewdrop drinker /heart", bgID: "0058-snail", frames: 2, delay: 20, colour: ["#000000","#000000"], font: "lanapixel", fontsize: 11, x: -13, y: -1, tags: ["nature"],
  },
  '0057-ophiuchus': {
    name: "let's play a GAME", bgID: "0057-ophiuchus", frames: 2, delay: 10, colour: ["#929292","#2ed73a"], font: "monogramextended", fontsize: 16, x: 1, y: 1, tags: ["fandom","zodiac"],
  },
  '0056-pirate': {
    name: "You came back.", bgID: "0056-pirate", frames: 5, delay: 10, colour: ["#000000","#000000","#000000","#000000","#000000"], font: "doublehomicide", fontsize: 16, x: -13, y: 1, shadow: ["#6f6f6f","#6f6f6f","#6f6f6f","#6f6f6f","#6f6f6f"], tags: ["fandom","pirate"],
  },
  '0055-rainbowswirl': {
    name: "technicolor dreams", bgID: "0055-rainbowswirl", frames: 10, delay: 10, colour: ["#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000"], font: "fipps", fontsize: 8, x: 0, y: 0, tags: ["rainbow"],
  },
  '0054-caution': {
    name: "CAUTION", bgID: "0054-caution", frames: 2, delay: 15, colour: ["#000000","#000000"], font: "hud", fontsize: 5, x: 0, y: 0, tags: [],
  },
  '0053-pinkchecker': {
    name: "pastel luvr!", bgID: "0053-pinkchecker", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "rainyhearts", fontsize: 16, x: 0, y: 0, tags: ["pink"],
  },
  '0044-hearts': {
    name: "Your Sweetness~!", bgID: "0044-hearts", frames: 3, delay: 10, colour: ["#ba5190","#ba5190","#ba5190"], font: "rainyhearts", fontsize: 16, x: 0, y: 0, tags: ["love","pink"],
  },
  '0040-gemini': {
    name: "p2iioniic", bgID: "0040-gemini", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0039-staticrainbow': {
    name: "MAYDAY   MAYDAY   MAYDAY  ", bgID: "0037-aprilfools", frames: 8, delay: 10, colour: ["#ff0000","#ff6a00","#ffea00","#19ff00","#01a6ff","#c766ff","#c800ff","#ff00a6"], font: "fipps", fontsize: 8, x: 0, y: 0, tags: ["rainbow"],
  },
  '0037-aprilfools': {
    name: "APRIL FOOLS!", bgID: "0037-aprilfools", frames: 8, delay: 10, colour: ["#ff0000","#ff6a00","#ffea00","#19ff00","#01a6ff","#c766ff","#c800ff","#ff00a6"], font: "pixel icons compilation", fontsize: 13, x: 0, y: 0, tags: ["rainbow","occasion"],
  },
  '0038-exitbutton2': {
    name: "don't like, don't read", bgID: "0038-exitbutton2", frames: 3, delay: 10, colour: ["#ffffff","#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: 19, y: 0, tags: ["computer"],
  },
  '0036-fire': {
    name: "BURN IT ALL DOWN", bgID: "0036-fire", frames: 4, delay: 10, colour: ["#f39b29","#fed439","#f39b29","#e84d00"], font: "doublehomicide", fontsize: 16, x: 14, y: 0, tags: [],
  },
  '0035-edgyred': {
    name: "I literally don't care.", bgID: "0035-edgyred", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "infernalda", fontsize: 16, x: 0, y: -1, tags: ["plain"],
  },
  '0034-skull': {
    name: "cyberbully", bgID: "0034-skull", frames: 2, delay: 15, colour: ["#ff00ff","#ff0080"], font: "Fipps", fontsize: 8, x: 0, y: 0, tags: ["pink"],
  },
  '0051-pisces': {
    name: ")(ang in t)(ere", bgID: "0051-pisces", frames: 2, delay: 10, colour: ["#d0d0d0","#d0d0d0"], font: "monogramextended", fontsize: 16, x: -1, y: 1, tags: ["fandom","zodiac"],
  },
  '0052-cancer': {
    name: "YOU ARE DEAD TO ME", bgID: "0052-cancer", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0047-virgo': {
    name: "If Not Me Then Who", bgID: "0047-virgo", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0043-taurus': {
    name: "(thiS is noT cOOl,)", bgID: "0043-taurus", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0042-aries': {
    name: "n0thing inside", bgID: "0042-aries", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0033-confused': {
    name: "head empty", bgID: "0033-confused", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "pixelpoiiz", fontsize: 10, x: 0, y: 0, tags: ["smiley","reaction"],
  },
  '0032-coffeecup': {
    name: "need moar coffee XD", bgID: "0032-coffeecup", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: -11, y: 0, tags: ["food"],
  },
  '0031-dogpaw': {
    name: "doggirl  rights !!  :3", bgID: "0031-dogpaw", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "moonaco", fontsize: 16, x: -8, y: 0, shadow: ["#888888","#888888"], tags: ["nature"],
  },
  '0030-catpaw': {
    name: "catboy  rights !!  :3", bgID: "0030-catpaw", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "moonaco", fontsize: 16, x: -8, y: 0, shadow: ["#888888","#888888"], tags: ["nature"],
  },
  '0029-pinksparkle': {
    name: "!!! Bad Bitch !!!", bgID: "0029-pinksparkle", frames: 2, delay: 15, colour: ["#ffb3ed","#ffb3ed"], font: "rainyhearts", fontsize: 16, x: 0, y: 0, shadow: ["#563c46","#563c46"], tags: ["pink","sparkle","plain"],
  },
  '0028-computer': {
    name: "be kind to your computer", bgID: "0028-computer", frames: 2, delay: 25, colour: ["#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: 7, y: 0, tags: ["computer"],
  },
  '0050-capricorn': {
    name: ":o) hOnK hOnK hOnK", bgID: "0050-capricorn", frames: 2, delay: 10, colour: ["#d0d0d0","#d0d0d0"], font: "monogramextended", fontsize: 16, x: -1, y: 1, tags: ["fandom","zodiac"],
  },
  '0049-sagittarius': {
    name: "D --> Disgusting", bgID: "0049-sagittarius", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0048-libra': {
    name: "H4H4H4H4H3H3H3H3", bgID: "0048-libra", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0046-leo': {
    name: ":33 < rawwrrrrr", bgID: "0046-leo", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0045-scorpio': {
    name: "Impenitent 8itch!!", bgID: "0045-scorpio", frames: 2, delay: 10, colour: ["#d0d0d0","#d0d0d0"], font: "moonaco", fontsize: 16, x: -1, y: 0, tags: ["fandom","zodiac"],
  },
  '0041-aquarius': {
    name: "vvici vvidi vveni", bgID: "0041-aquarius", frames: 2, delay: 10, colour: ["#e6e6e6","#e6e6e6"], font: "monogramextended", fontsize: 16, x: 0, y: 1, tags: ["fandom","zodiac"],
  },
  '0027-sakura': {
    name: "サ ク ラ", bgID: "0027-sakura", frames: 4, delay: 10, colour: "#cc557f", font: "lanapixel", fontsize: 11, x: -1, y: -1, tags: ["pink","nature"],
  },
  '0026-iheart2': {
    name: "my bf", bgID: "0026-iheart2", frames: 4, delay: 10, colour: ["#ffffff","#ffffff","#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: -30, y: -1, shadow: ["#888888","#888888","#888888","#888888"], tags: ["love"],
  },
  '0025-birthdaycake': {
    name: "hbd ur old lmao", bgID: "0025-birthdaycake", frames: 4, delay: 10, colour: ["#ffffff","#ffffff","#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["food","occasion"],
  },
  '0024-red': {
    name: "simple red", bgID: "0024-red", frames: 2, delay: 10, colour: ["#800000","#800000"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["plain"],
  },
  '0022-iheart': {
    name: "blinkies so much !!!", bgID: "0022-iheart", frames: 4, delay: 10, colour: ["#ffffff","#ffffff","#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: -20, y: -1, shadow: ["#888888","#888888","#888888","#888888"], tags: ["love"],
  },
  '0021-vampirefangs': {
    name: "Blood-Sucker", bgID: "0021-vampirefangs", frames: 8, delay: 10, colour: ["#d00000","#d00000","#ff0000","#d00000","#d00000","#ff0000","#ff0000","#ff0000"], font: "alagard", fontsize: 16, x: 10, y: -1, tags: ["spooky"],
  },
  '0020-blinkiesCafe': {
    name: "blinkies.cafe", bgID: "0020-blinkiesCafe", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "moonaco", fontsize: 16, x: 0, y: 0, shadow: ["#666666","#666666"], tags: ["food"],
  },
  '0019-candy': {
    name: "Sweet Tooth", bgID: "0019-candy", frames: 2, delay: 25, colour: ["#ffcee7","#ffcee7"], font: "moonaco", fontsize: 16, fontweight: "normal", x: 0, y: 0, tags: ["food"],
  },
  '0018-glitter': {
    name: "I <3 GLITTER", bgID: "0018-glitter", frames: 3, delay: 10, colour: ["#000000","#000000","#000000"], font: "Dogica", fontsize: 12, fontweight: "bold", x: 0, y: 1, tags: ["plain","sparkle"],
  },
  '0017-love': {
    name: "love u 4ever <3", bgID: "0017-love", frames: 8, delay: 10, colour: ["#d61a49","#e33a8e","#ea4aad","#e33a8e","#d61a49","#cf0c1f","#c80000","#cf0c1f"], font: "rainyhearts", fontsize: 16, x: 0, y: 0, shadow: ["#d61a49","#e33a8e","#ea4aad","#e33a8e","#d61a49","#cf0c1f","#c80000","#cf0c1f"], tags: ["love"],
  },
  '0016-valentine': {
    name: "be my valentine?", bgID: "0016-valentine", frames: 2, delay: 10, colour: ["#ad2121","#ad2121"], font: "moonaco", fontsize: 16, x: -12, y: 0, tags: ["love","occasion"],
  },
  '0015-exit-button': {
    name: "too many tabs!!", bgID: "0015-exit-button", frames: 2, delay: 10, colour: ["#ffffff","#ffffff"], font: "moonaco", fontsize: 16, x: 12, y: 0, tags: ["computer"],
  },
  '0013-starryeyes': {
    name: "Starry Eyes!", bgID: "0013-starryeyes", frames: 3, delay: 10, colour: ["#002984","#002984","#002984"], font: "rainyhearts", fontsize: 16, x: -4, y: 0, tags: ["pink","nature"],
  },
  '0012-kiss': {
    name: "good kisser", bgID: "0012-kiss", frames: 2, delay: 10, colour: ["#feaaaa","#feaaaa"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["love"],
  },
  '0011-frog': {
    name: "frog friend", bgID: "0011-frog", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["nature"],
  },
  '0007-chocolate': {
    name: "chocolate dreams", bgID: "0007-chocolate", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["food"],
  },
  '0002-mushroom': {
    name: "mushroom boy", bgID: "0002-mushroom", frames: 2, delay: 10, colour: ["#8c2000","#8c2000"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["nature","food"],
  },
  '0003-ghost': {
    name: "Spooky vibes only!!", bgID: "0003-ghost", frames: 2, delay: 10, colour: ["#e79400","#e77400"], font: "infernalda", fontsize: 16, x: -13, y: -1, tags: ["spooky"],
  },
  '0004-peachy': {
    name: "just peachy", bgID: "0004-peachy", frames: 2, delay: 10, colour: ["black","black"], font: "moonaco", fontsize: 16, x: 7, y: 0, tags: ["food"],
  },
  '0005-citystars': {
    name: "city stars", bgID: "0005-citystars", frames: 2, delay: 25, colour: ["#ffffff","#ffffff"], font: "04b03", fontsize: 8, x: 6, y: 0, tags: [],
  },
  '0001-saucer': {
    name: "crash-landed", bgID: "0001-saucer", frames: 2, delay: 10, colour: ["#ff0000","#ff4e4e"], font: "Perfect DOS VGA 437", fontsize: 16, x: -14, y: -1, tags: ["spooky"],
  },
  '0006-purple': {
    name: "simple purple", bgID: "0006-purple", frames: 2, delay: 10, colour: ["#000000","#000000"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["plain"],
  },
  '0008-pink': {
    name: "simple pink", bgID: "0008-pink", frames: 2, delay: 10, colour: ["#ff40ff","#ff40ff"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["plain","pink"],
  },
  '0009-gradient-pink': {
    name: "gradient pink", bgID: "0009-gradient-pink", frames: 2, delay: 10, colour: ["#ff40ff","#ff40ff"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["plain","pink"],
  },
  '0010-blue': {
    name: "simple blue", bgID: "0010-blue", frames: 2, delay: 10, colour: ["#3f3fbf","#3f3fbf"], font: "moonaco", fontsize: 16, x: 0, y: 0, tags: ["plain"],
  }
}
