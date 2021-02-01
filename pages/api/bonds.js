export default async function bonds(req, res) {
    if (req.method === 'POST') {

        const Sigaa = require("sigaa-api").Sigaa;

        const sigaa = new Sigaa({
            url: "https://sigaa.ifsc.edu.br",
        });
        var result = [];

        const username = req.body.username;
        const password = req.body.password;
        const args = req.body.args;
        
        const account = await sigaa.login(username, password);

        const activeBonds = await account.getActiveBonds();
        const inactiveBonds = await account.getInactiveBonds();

        var allBonds = [];
        allBonds.push(activeBonds, inactiveBonds);

        function findBonds(bond, args) {
            for (const key in bond) {
                if (Object.hasOwnProperty.call(bond, key)) {
                    const value = bond[key];
                    for (const argKEY in args) {
                        if (Object.hasOwnProperty.call(args, argKEY)) {
                            const arg = args[argKEY];
                            if (arg == value) {
                                return bond;
                            }
                        }
                    }
                }
            }
            return 0;
        }

        function pushBond(bond) {
            return {
                program: bond.program,
                registration: bond.registration
            }
        }

        for (const bonds of allBonds) {
            bonds.forEach(bond => {
                if (args) {
                    const valid = findBonds(bond, args)
                    if (valid) {
                        result.push(pushBond(bond));
                    }
                } else {
                    result.push({
                        program: bond.program,
                        registration: bond.registration
                    })
                }
            });
        }
        res.json(result)
        await account.logoff();
    }
}