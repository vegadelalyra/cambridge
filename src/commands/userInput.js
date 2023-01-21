import readline from 'readline'

// readLine interface
const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
    historySize: 0,
    prompt: ''
})

export default async function() {
    return await new Promise(resolve => 
        rl.question(
            '\x1b[93mPlease enter an ENGLISH WORD or ENGLISH IDIOM:\x1b[97m ', 
            resolve
        )
    )
}