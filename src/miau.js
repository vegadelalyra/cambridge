// async function miau () {
//     return {
//         doc: 'awebo',
//         jejeje: 234
//     }
// }

// const [docky, vane] = await Promise.all([
//     miau().then(x => x.doca),
//     miau().then(x => x.jejeje)
// ]).catch(console.error('miau miau'))

// console.log({docky, vane})

function miau (arr = [1,2,3,4,5,6]) {
    return arr
}


console.log(miau()[0])
