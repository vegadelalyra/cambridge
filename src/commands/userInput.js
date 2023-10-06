import readline from 'readline'

// readLine interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 0,
    prompt: '',
})

export default async function () {
    let userInput = await new Promise(resolve =>
        rl.question(
            '\x1b[93mPlease enter an ENGLISH WORD or ENGLISH IDIOM:\x1b[97m ',
            answer => {
                answer = answer.includes(' ')
                    ? answer.replaceAll(' ', '-')
                    : answer
                resolve(answer)
            }
        )
    )
    while (!/^[a-zA-Z-]+$/.test(userInput))
        userInput = await new Promise(resolve =>
            rl.question(
                '\x1b[91mEnter a valid ENGLISH WORD or ENGLISH IDIOM:\x1b[37m ',
                answer => {
                    answer = answer.includes(' ')
                        ? answer.replaceAll(' ', '-')
                        : answer
                    resolve(answer)
                }
            )
        )
    return userInput
}
