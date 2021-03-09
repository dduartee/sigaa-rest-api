import { Sigaa, StudentBond } from "sigaa-api";
import { Request, Response } from "express";
import isEmpty from "../../util/isEmpty";
import findValue from "../../util/findValue";
const sigaa = new Sigaa({
  url: "https://sigaa.ifsc.edu.br",
});

export default async function (req: Request, res: Response) {
  var bondsJSON: any = [];

  const username: string = req.body.username;
  const password: string = req.body.password;
  const args = req.query;

  function pushBond(bond: StudentBond) {
    return {
      program: bond.program,
      registration: bond.registration,
    };
  }

  function bondHandler(bond: StudentBond) {
    bondsJSON.push(pushBond(bond));
  }

  try {
    const account = await sigaa.login(username, password);
    const activeBonds = await account.getActiveBonds();
    const inactiveBonds = await account.getInactiveBonds();
    var allBonds = [];
    allBonds.push(activeBonds, inactiveBonds);
    if (isEmpty(allBonds[0])) {
      await account.logoff();
      throw new Error("Não foi possivel receber os vinculos");
    }

    for (const bonds of allBonds) {
      for (let i = 0; i < bonds.length; i++) {
        const bond: StudentBond = bonds[i];
        if (!isEmpty(args) && findValue(args, bond)) bondHandler(bond);
        //se tiver argumentos e for valido
        else if (isEmpty(args)) bondHandler(bond); // se não tiver argumentos
      }
    }
    await account.logoff();
    return res.json({
      bonds: bondsJSON,
    });
  } catch (error) {
    return res.json({ error: true, message: error.message });
  }
}
