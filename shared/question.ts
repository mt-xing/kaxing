export type Question = {
    points: number;
    time: number;
    text: string;
    img?: string;
} & ({
    t: 'standard';
    answers: string[];
    correct: number | number[];
} | {
    t: 'multi';
    answers: string[];
    correct: number[];
} | {
    t: 'type';
    maxChars: number;
    correct: RegExp;
});

export type Answer = {
    t: 'standard';
    a: number;
} | {
    t: 'multi';
    a: number[];
} | {
    t: 'type';
    a: string;
};