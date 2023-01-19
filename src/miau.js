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


function a(miau = 10) {
    return function b(wow = 20){
        return function c(){
            return console.log( [miau, wow, miau + wow] )
        }
    }
}
a()()()