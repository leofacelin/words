// data.js
const wordData = {
    1: {
        title: "Unit 1: 自然与描述",
        words: [
            { word: "show", meaning: "给...看", image: "🤲", sentence: "_____ me your book.", options: ["show", "look", "see"] },
            { word: "baby", meaning: "幼崽；雏鸟", image: "🐣", sentence: "The _____ bird is cute.", options: ["baby", "boy", "egg"] },
            { word: "egg", meaning: "蛋", image: "🥚", sentence: "I eat an _____ for breakfast.", options: ["egg", "apple", "ball"] },
            { word: "hungry", meaning: "饥饿的", image: "😋", sentence: "I am _____.", options: ["hungry", "happy", "angry"] },
            { word: "around", meaning: "环绕, 在...周围", image: "🔄", sentence: "Walk _____ the tree.", options: ["around", "above", "under"] },
            { word: "all", meaning: "全部，所有", image: "👐", sentence: "We are _____ friends.", options: ["all", "one", "no"] },
            { word: "big", meaning: "大的", image: "🐘", sentence: "The elephant is _____.", options: ["big", "small", "long"] },
            { word: "little", meaning: "小的", image: "🐜", sentence: "The ant is _____.", options: ["little", "big", "bad"] }
        ]
    },
    2: {
        title: "Unit 2: 我的家庭",
        words: [
            {
                word: "family",
                meaning: "家庭",
                image: "👨‍👩‍👧‍👦",
                sentence: "I love my _____.",
                options: ["family", "father", "friend"]
            },
            {
                word: "dad",
                meaning: "爸爸",
                image: "👨",
                sentence: "My _____ is tall.",
                options: ["dad", "mum", "brother"]
            },
            {
                word: "mum",
                meaning: "妈妈",
                image: "👩",
                sentence: "My _____ is beautiful.",
                options: ["mum", "dad", "sister"]
            },
            {
                word: "brother",
                meaning: "兄弟",
                image: "👦",
                sentence: "He is my _____.",
                options: ["brother", "sister", "baby"]
            },
            {
                word: "sister",
                meaning: "姐妹",
                image: "👧",
                sentence: "She is my _____.",
                options: ["sister", "brother", "mum"]
            },
            {
                word: "grandpa",
                meaning: "爷爷/外公",
                image: "👴",
                sentence: "_____ likes tea.",
                options: ["grandpa", "grandma", "dad"]
            },
            {
                word: "grandma",
                meaning: "奶奶/外婆",
                image: "👵",
                sentence: "_____ tells stories.",
                options: ["grandma", "grandpa", "mum"]
            }
        ]
    },
    3: {
        title:"人物与故事",
        words: [
            {
                word: "grandpa",
                meaning: "爷爷/外公",
                image: "👴",
                sentence: "My _____ is old.",
                options: ["grandpa", "grandma", "dad"]
            },
            {
                word: "grandma",
                meaning: "奶奶/外婆",
                image: "👵",
                sentence: "I love my _____.",
                options: ["grandma", "grandpa", "mum"]
            },
            {
                word: "but",
                meaning: "但是",
                image: "⚖️", // 用天平代表对比/转折
                sentence: "I like apples, _____ I don't like bananas.",
                options: ["but", "and", "so"]
            },
            {
                word: "people",
                meaning: "人；人们",
                image: "👥",
                sentence: "There are many _____ in the park.",
                options: ["people", "person", "pupil"]
            },
            {
                word: "story",
                meaning: "故事",
                image: "📖",
                sentence: "Tell me a bedtime _____.",
                options: ["story", "song", "star"]
            },
            {
                word: "cap",
                meaning: "帽子 (鸭舌帽)",
                image: "🧢",
                sentence: "He wears a blue _____.",
                options: ["cap", "cat", "cup"]
            }
        ]
    },
    4: {
        title: "故事和爱",
        words: [
             {
                word: "cap",
                meaning: "帽子 (鸭舌帽)",
                image: "🧢",
                sentence: "He is wearing a blue _____.",
                options: ["cap", "cup", "cat"]
            },
            {
                word: "worry",
                meaning: "担心",
                image: "😟",
                sentence: "Don't _____, everything will be fine.",
                options: ["worry", "sorry", "happy"]
            },
            {
                word: "on",
                meaning: "在...上面",
                image: "🔛",
                sentence: "The apple is _____ the table.",
                options: ["on", "in", "at"]
            },
            {
                word: "photo",
                meaning: "照片",
                image: "📷",
                sentence: "Let's take a _____ together.",
                options: ["photo", "phone", "potato"]
            },
            {
                word: "love",
                meaning: "爱；喜爱",
                image: "❤️",
                sentence: "I _____ ice cream very much.",
                options: ["love", "live", "long"]
            }
        ]
    },
    5: {
        title: "爸爸妈妈",
        words: [
            {
                word: "daddy",
                meaning: "爸爸 (亲昵叫法)",
                image: "👨",
                sentence: "My _____ plays football with me.",
                options: ["daddy", "baby", "body"]
            },
            {
                word: "mummy",
                meaning: "妈妈 (亲昵叫法)",
                image: "👩",
                sentence: "_____ gives me a hug.",
                options: ["mummy", "money", "many"]
            },
            {
                word: "where",
                meaning: "哪里",
                image: "❓",
                sentence: "_____ is my little dog?",
                options: ["where", "what", "who"]
            },
            {
                word: "dog",
                meaning: "狗",
                image: "🐶",
                sentence: "The _____ says woof woof.",
                options: ["dog", "bag", "pig"]
            },
            {
                word: "box",
                meaning: "盒子；箱子",
                image: "📦",
                sentence: "Open the _____, please.",
                options: ["box", "fox", "boy"]
            }
        ]
    },
    6: {
        title: "动物",
        words: [
             {
                word: "animal",
                meaning: "动物",
                image: "🦁",
                sentence: "A lion is a big _____.",
                options: ["animal", "apple", "angry"]
            },
            {
                word: "panda",
                meaning: "熊猫",
                image: "🐼",
                sentence: "The _____ likes to eat bamboo.",
                options: ["panda", "pencil", "paper"]
            },
            {
                word: "elephant",
                meaning: "大象",
                image: "🐘",
                sentence: "The _____ has a long nose.",
                options: ["elephant", "egg", "eight"]
            },
            {
                word: "bear",
                meaning: "熊",
                image: "🐻",
                sentence: "The brown _____ is sleeping.",
                options: ["bear", "pear", "beer"]
            },
            {
                word: "giraffe",
                meaning: "长颈鹿",
                image: "🦒",
                sentence: "A _____ has a very long neck.",
                options: ["giraffe", "grape", "green"]
            },
            {
                word: "monkey",
                meaning: "猴子",
                image: "🐒",
                sentence: "The _____ climbs the tree.",
                options: ["monkey", "money", "mouth"]
            },
            {
                word: "them",
                meaning: "他们；它们 (宾格)",
                image: "👥",
                sentence: "I like animals. I like _____.",
                options: ["them", "then", "they"]
            }
        ]
    },
    7: {
        title: "动物2",
        words: [
            {
                word: "draw",
                meaning: "画",
                image: "🎨",
                sentence: "I can _____ a big house.",
                options: ["draw", "drink", "dress"]
            },
            {
                word: "tiger",
                meaning: "老虎",
                image: "🐯",
                sentence: "The _____ is very fast.",
                options: ["tiger", "table", "teacher"]
            },
            {
                word: "strong",
                meaning: "强壮的",
                image: "💪",
                sentence: "The lion is very _____.",
                options: ["strong", "story", "string"]
            },
            {
                word: "short",
                meaning: "矮的；短的",
                image: "📏",
                sentence: "The rabbit has a _____ tail.",
                options: ["short", "shirt", "shoes"]
            },
            {
                word: "white",
                meaning: "白色",
                image: "⚪",
                sentence: "The snow is _____.",
                options: ["white", "water", "where"]
            },
            {
                word: "brown",
                meaning: "棕色",
                image: "🟤",
                sentence: "The bear is _____.",
                options: ["brown", "bread", "broom"]
            },
            {
                word: "tall",
                meaning: "高的",
                image: "🦒",
                sentence: "The giraffe is very _____.",
                options: ["tall", "ball", "tell"]
            },
            {
                word: "him",
                meaning: "他 (宾格)",
                image: "👦",
                sentence: "I know the boy. I like _____.",
                options: ["him", "his", "her"]
            }
        ]
    }
    // 继续添加更多单元...
};