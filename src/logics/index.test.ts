import { expect } from 'chai';
import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';

describe('Protocol Logics', async function () {
  const cwd = process.cwd();
  const protocolIds = fs
    .readdirSync(path.join(cwd, 'src', 'logics'), { withFileTypes: true })
    .reduce((accumulator, dir) => {
      if (dir.isDirectory()) accumulator.push(dir.name);
      return accumulator;
    }, [] as string[]);

  context('Test logic definition', function () {
    for (const protocolId of protocolIds) {
      context(protocolId, function () {
        const protocolPath = path.join(cwd, 'src', 'logics', protocolId);
        const logicFiles = glob.sync('logic.*[!.test].ts', { cwd: protocolPath });
        for (const logicFile of logicFiles) {
          const logicId = logicFile.split('.')[1];
          it(logicId, async function () {
            const imports = await import(path.join(protocolPath, logicFile));
            for (const key of Object.keys(imports)) {
              if (!/Logic$/.test(key)) continue;
              const logic = imports[key];
              expect(logic).to.not.be.undefined;
              expect(logic.id).to.eq(logicId);
              expect(logic.protocolId).to.eq(protocolId);
              expect(logic.supportedChainIds).to.be.a('array');
            }
          });
        }
      });
    }
  });

  it('Test exports', async function () {
    const exports = await import('./index');
    expect(Object.keys(exports)).to.include.members(protocolIds.map((protocolId) => protocolId.replace(/-/g, '')));
  });
});
