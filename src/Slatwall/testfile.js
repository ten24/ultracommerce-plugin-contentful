let init = {
    hostname: 'slatwall.mitrahsoft.co.in',
    AccessKey: 'B44ACE4E36B498BFCE066FD5CF2881C5C540F570',
    AccessKeySecret: 'ODM0MjQ4REVBNDY1ODY4REJCNTY1MkJCRDZGOTQzQUVDMDg2NEZCMw=='
}

const slatwall = require("./slatwall")(init)



let userDetails = {
    emailAddress: 'sankar.a@mitrahsoft.com',
    password: '12345678'
}
var res = slatwall.accounts.login(userDetails)
res.then(resp => {
    console.log('Authtoken', JSON.parse(resp).token)
})



// var res = slatwall.products.get()


// res.then(resp => {
//     console.log('response', resp)
// })






// let userDetails = {
//     emailAddress: 'test1@a.com',
//     emailAddressConfirm: 'test1@a.com',
//     password: '12345678',
//     passwordConfirm: '12345678',
//     firstName: 'test',
//     lastName: 'user'
// }
// var res = Slatwal.Account.createAccount(userDetails)
// res.then(resp => {
//     console.log(resp)
// })






