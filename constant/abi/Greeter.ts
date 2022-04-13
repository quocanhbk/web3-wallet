export const GREETER_ABI = [
    {
        inputs: [{ internalType: "string", name: "_greeting", type: "string" }],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: "string", name: "_greeting", type: "string" }],
        name: "GreetingSet",
        type: "event",
    },
    {
        inputs: [],
        name: "greet",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "greeting",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "string", name: "_greeting", type: "string" }],
        name: "setGreeting",
        outputs: [{ internalType: "bool", name: "_changedGreet", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
]
