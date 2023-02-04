import * as core from 'src/core';
import * as helpers from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';

export const faucetMap: Record<number, string> = {
  1: '0x28c6c06298d514db089934071355e5743bf21d60',
};

export async function claim(tokenAmount: core.tokens.TokenAmount, recepient: string) {
  const faucet = faucetMap[tokenAmount.token.chainId];
  await helpers.impersonateAccount(faucet);
  const signer = await hre.ethers.provider.getSigner(faucet);

  if (tokenAmount.token.isNative()) {
    await signer.sendTransaction({ to: recepient, value: tokenAmount.amountWei });
  } else {
    if (tokenAmount.token.isWrapped()) {
      const weth = core.contracts.WETH__factory.connect(tokenAmount.token.address, signer);
      await (await weth.deposit({ value: tokenAmount.amountWei })).wait();
    }
    const token = core.contracts.ERC20__factory.connect(tokenAmount.token.address, signer);
    await (await token.transfer(recepient, tokenAmount.amountWei)).wait();
  }
}
